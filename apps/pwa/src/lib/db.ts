// ============================================================================
// Storage.
//
// The vault filesystem is gone, so this replaces readVaultJson/writeVaultJson.
// IndexedDB rather than OPFS or the File System Access API: FSA is not
// implemented in Safari on any platform, and OPFS on iOS needs a Worker plus
// createSyncAccessHandle for broad support. IndexedDB stores Blobs natively
// and works everywhere, which is worth more here than either alternative.
//
// Records are keyed per DAY, not per file. The plugin rewrote a whole 225 KB
// JSON blob to tick one habit; here a write touches one small record. It also
// gives the Obsidian sync a natural merge boundary — see docs/sync.md.
// ============================================================================

const DB_NAME = "soma";
const DB_VERSION = 1;

/** Daily records, keyed `${type}:${date}` — e.g. `workout:2026-09-01`. */
export const STORE_RECORDS = "records";
/** Photo blobs, keyed `${habitId}:${date}`. Kept apart so a habit tick never
 *  reads or rewrites image bytes. */
export const STORE_PHOTOS = "photos";
/** Singletons: settings, custom foods, custom exercises. */
export const STORE_META = "meta";

export type RecordType = "workout" | "food" | "habits" | "sleep" | "body";

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        const s = db.createObjectStore(STORE_RECORDS, { keyPath: "key" });
        // Range queries by type and by date are the two access patterns the
        // whole app needs: "this month's workouts", "everything on the 3rd".
        s.createIndex("byType", "type", { unique: false });
        s.createIndex("byDate", "date", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onblocked = () => reject(new Error("IndexedDB blocked by another tab"));
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return open().then(db => new Promise<T>((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = run(t.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
  }));
}

// ---------------------------------------------------------------- records ---

export interface DayRecord<T = unknown> {
  key: string;
  type: RecordType;
  date: string;      // YYYY-MM-DD, local
  updatedAt: number; // drives last-write-wins when merging with the vault
  data: T;
}

const recordKey = (type: RecordType, date: string) => `${type}:${date}`;

export async function getRecord<T>(type: RecordType, date: string): Promise<T | null> {
  const row = await tx<DayRecord<T> | undefined>(
    STORE_RECORDS, "readonly", s => s.get(recordKey(type, date))
  );
  return row ? row.data : null;
}

export async function putRecord<T>(type: RecordType, date: string, data: T): Promise<void> {
  const row: DayRecord<T> = {
    key: recordKey(type, date), type, date, updatedAt: Date.now(), data
  };
  await tx(STORE_RECORDS, "readwrite", s => s.put(row));
}

export async function deleteRecord(type: RecordType, date: string): Promise<void> {
  await tx(STORE_RECORDS, "readwrite", s => s.delete(recordKey(type, date)));
}

/** Every record of one type, oldest first. */
export async function allOfType<T>(type: RecordType): Promise<DayRecord<T>[]> {
  const rows = await tx<DayRecord<T>[]>(
    STORE_RECORDS, "readonly", s => s.index("byType").getAll(IDBKeyRange.only(type))
  );
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Records of one type within an inclusive date range. Dates are YYYY-MM-DD,
 * which sorts lexicographically, so a plain string range is correct here.
 */
export async function rangeOfType<T>(
  type: RecordType, from: string, to: string
): Promise<DayRecord<T>[]> {
  const rows = await allOfType<T>(type);
  return rows.filter(r => r.date >= from && r.date <= to);
}

/**
 * The shape the engine expects: a plain object keyed by date. Lets @soma/core
 * run against PWA storage unchanged, rather than growing a second data path.
 */
export async function asKeyedObject<T>(type: RecordType): Promise<Record<string, T>> {
  const rows = await allOfType<T>(type);
  const out: Record<string, T> = {};
  for (const r of rows) out[r.date] = r.data;
  return out;
}

// ----------------------------------------------------------------- photos ---

export interface PhotoRow {
  key: string;
  habitId: string;
  date: string;
  thumb: Blob;    // ~320px, grid cells
  display: Blob;  // ~1080px, lightbox
  ts: number;
}

const photoKey = (habitId: string, date: string) => `${habitId}:${date}`;

export async function getPhoto(habitId: string, date: string): Promise<PhotoRow | null> {
  const row = await tx<PhotoRow | undefined>(
    STORE_PHOTOS, "readonly", s => s.get(photoKey(habitId, date))
  );
  return row ?? null;
}

export async function putPhoto(
  habitId: string, date: string, thumb: Blob, display: Blob
): Promise<void> {
  const row: PhotoRow = {
    key: photoKey(habitId, date), habitId, date, thumb, display, ts: Date.now()
  };
  await tx(STORE_PHOTOS, "readwrite", s => s.put(row));
}

export async function deletePhoto(habitId: string, date: string): Promise<void> {
  await tx(STORE_PHOTOS, "readwrite", s => s.delete(photoKey(habitId, date)));
}

/**
 * Thumbnails for one habit across a month. Only thumbs are read — pulling
 * display blobs for a 31-cell grid would move ~7 MB to render ~700 KB.
 */
export async function photoThumbsForMonth(
  habitId: string, year: number, month: number
): Promise<Map<string, Blob>> {
  const rows = await tx<PhotoRow[]>(STORE_PHOTOS, "readonly", s => s.getAll());
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const out = new Map<string, Blob>();
  for (const r of rows) {
    if (r.habitId === habitId && r.date.startsWith(prefix)) out.set(r.date, r.thumb);
  }
  return out;
}

// ------------------------------------------------------------------- meta ---

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const row = await tx<{ key: string; value: T } | undefined>(
    STORE_META, "readonly", s => s.get(key)
  );
  return row ? row.value : fallback;
}

export async function setMeta<T>(key: string, value: T): Promise<void> {
  await tx(STORE_META, "readwrite", s => s.put({ key, value }));
}

// ------------------------------------------------------------------ quota ---

export interface QuotaInfo {
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
  persisted: boolean;
  /** Rough count of photos that would fit at ~220 KB per capture. */
  photosRemaining: number;
}

/**
 * Real numbers from the device rather than a figure from documentation.
 * iOS quotas have moved substantially across versions, so the app reports
 * what this phone actually grants.
 */
export async function quota(): Promise<QuotaInfo | null> {
  if (!navigator.storage?.estimate) return null;
  const { usage = 0, quota: q = 0 } = await navigator.storage.estimate();
  const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false;
  const free = Math.max(0, q - usage);
  return {
    usageBytes: usage,
    quotaBytes: q,
    percentUsed: q > 0 ? Math.round((usage / q) * 100) : 0,
    persisted,
    photosRemaining: Math.floor(free / (220 * 1024))
  };
}

/**
 * Ask for persistent storage. Safari clears script-writable storage after
 * seven days without interaction — but home-screen web apps are exempt, and
 * WebKit grants persistence to them. Calling this from the browser is likely
 * to be refused; that is expected and not an error worth surfacing.
 */
export async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}
