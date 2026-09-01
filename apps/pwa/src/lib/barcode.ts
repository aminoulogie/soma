// ============================================================================
// Barcode scanning and food lookup.
//
// Rebuilt rather than ported. The plugin's scanner was broken in two separate
// ways and both are avoided here by construction:
//
//   1. It called ZXing's decodeFromVideoElement(video, callback). That method
//      takes ONE argument and decodes ONE frame into a returned promise, so
//      the callback was silently discarded and the camera watched nothing.
//      Here decoding is an explicit frame loop we own.
//
//   2. It fetched the decoder from a CDN at runtime, which cannot work
//      offline and was subject to the webview blocking the request. The wasm
//      is bundled.
//
// BarcodeDetector is deliberately not used: it does not exist in Safari, so
// on the only device this app targets it would never run.
// ============================================================================

import { readBarcodes } from "zxing-wasm/reader";

export interface ScanHandle {
  stop(): void;
}

const FORMATS = ["EAN-13", "EAN-8", "UPC-A", "UPC-E", "Code-128", "Code-39"];

/**
 * Opens the rear camera, decodes continuously, and calls `onFound` once.
 * The caller owns the returned handle and must stop it, or the camera stays
 * on and the phone keeps warming.
 */
export async function startScanner(
  video: HTMLVideoElement,
  onFound: (code: string) => void,
  onError: (message: string) => void
): Promise<ScanHandle> {
  let stream: MediaStream | null = null;
  let raf = 0;
  let stopped = false;
  let busy = false;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const stop = () => {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    // Tracks must be stopped explicitly; clearing srcObject alone leaves the
    // camera light on.
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
    video.srcObject = null;
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      // A hint, not a guarantee — a device with one camera ignores it.
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      audio: false
    });
  } catch (err) {
    const e = err as DOMException;
    onError(
      e.name === "NotAllowedError"
        ? "Camera permission denied. Allow it in Settings → Safari."
        : e.name === "NotFoundError"
          ? "No camera found on this device."
          : "Could not open the camera."
    );
    return { stop };
  }

  video.srcObject = stream;
  video.setAttribute("playsinline", "");   // iOS fullscreens the video without this
  video.muted = true;
  await video.play().catch(() => { /* autoplay refusal is not fatal */ });

  const tick = async () => {
    if (stopped) return;
    // Skip while a decode is in flight: wasm decoding is slower than the
    // frame rate and queueing calls would only add latency.
    if (!busy && ctx && video.videoWidth > 0) {
      busy = true;
      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const results = await readBarcodes(
          ctx.getImageData(0, 0, canvas.width, canvas.height),
          { tryHarder: true, formats: FORMATS as any, maxNumberOfSymbols: 1 }
        );
        const hit = results.find(r => r.text && r.text.length >= 8);
        if (hit) {
          stop();
          onFound(hit.text);
          return;
        }
      } catch {
        // A frame that will not decode is the normal case, not an error.
      }
      busy = false;
    }
    raf = requestAnimationFrame(() => void tick());
  };
  void tick();

  return { stop };
}

// ------------------------------------------------------------- lookup ------

export interface FoodHit {
  name: string;
  barcode: string;
  /** Per 100 g. */
  cals: number; p: number; f: number; c: number;
  brand?: string;
  /** True when the product exists but carries no usable nutrition. */
  needsMacros: boolean;
}

/**
 * A barcode may be printed with or without a leading zero, and EAN-13 and
 * UPC-A encode the same product differently. Trying the variants turns a
 * chunk of false "not found" results into hits.
 */
function variants(code: string): string[] {
  const c = code.replace(/\D/g, "");
  const out = new Set([c]);
  if (c.length === 12) out.add("0" + c);
  if (c.length === 13 && c.startsWith("0")) out.add(c.slice(1));
  if (c.length === 8) out.add(c.padStart(13, "0"));
  return [...out];
}

function fromOpenFoodFacts(product: any, barcode: string): FoodHit | null {
  if (!product) return null;
  const n = product.nutriments ?? {};
  const cals = Number(n["energy-kcal_100g"] ?? n["energy-kcal"] ?? 0);
  const p = Number(n.proteins_100g ?? 0);
  const f = Number(n.fat_100g ?? 0);
  const c = Number(n.carbohydrates_100g ?? 0);
  const name = product.product_name || product.generic_name || "";
  if (!name) return null;
  return {
    name, barcode, brand: product.brands,
    cals: Math.round(cals), p: Math.round(p * 10) / 10,
    f: Math.round(f * 10) / 10, c: Math.round(c * 10) / 10,
    // A product with no calories and no macros is a database stub. Say so
    // rather than logging a food that is silently worth nothing.
    needsMacros: cals === 0 && p === 0 && f === 0 && c === 0
  };
}

export interface LookupResult {
  hit: FoodHit | null;
  offline: boolean;
  triedCodes: string[];
}

/**
 * Open Food Facts only. The plugin also queried UPCitemdb, which returns a
 * product *name* and never nutrition — it could not do the job, and it does
 * not send CORS headers, so in a browser it cannot even be called.
 */
export async function lookupBarcode(code: string): Promise<LookupResult> {
  const tried = variants(code);
  if (!navigator.onLine) return { hit: null, offline: true, triedCodes: tried };

  for (const c of tried) {
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${c}.json`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) continue;
      const json = await res.json();
      if (json.status === 1) {
        const hit = fromOpenFoodFacts(json.product, c);
        if (hit) return { hit, offline: false, triedCodes: tried };
      }
    } catch {
      // Network failure mid-loop: report as offline rather than not-found, so
      // the UI does not tell you a product does not exist when it simply
      // could not ask.
      return { hit: null, offline: true, triedCodes: tried };
    }
  }
  return { hit: null, offline: false, triedCodes: tried };
}
