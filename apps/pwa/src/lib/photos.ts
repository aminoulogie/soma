// ============================================================================
// Photo capture.
//
// The plugin stored one 224 KB base64 data URL inside soma-habits.json — the
// same file it rewrites whenever you tick any habit. Base64 also costs ~33%
// over the raw bytes. A year of daily photos would be ~80 MB re-serialised on
// every write.
//
// Here a capture produces two Blobs. The calendar grid shows up to 31 cells at
// once, so it reads thumbnails only: ~700 KB instead of ~7 MB per month.
// ============================================================================

import { putPhoto } from "./db";

/** Grid cells. Small enough that a month costs well under a megabyte. */
const THUMB_EDGE = 320;
const THUMB_QUALITY = 0.7;

/** Lightbox. Sharp on a 3x phone screen without storing the original. */
const DISPLAY_EDGE = 1080;
const DISPLAY_QUALITY = 0.8;

/**
 * JPEG, deliberately. Safari's canvas.toBlob() WebP *encode* support has been
 * inconsistent across iOS versions and silently falls back to PNG when absent
 * — which would make files bigger, not smaller. AVIF encode is unavailable.
 */
const MIME = "image/jpeg";

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that image.")); };
    img.src = url;
  });
}

function fit(w: number, h: number, edge: number): { w: number; h: number } {
  if (w <= edge && h <= edge) return { w, h };
  return w > h
    ? { w: edge, h: Math.round((h * edge) / w) }
    : { w: Math.round((w * edge) / h), h: edge };
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => b ? resolve(b) : reject(new Error("Could not encode the image.")),
      MIME,
      quality
    );
  });
}

async function derive(img: HTMLImageElement, edge: number, quality: number): Promise<Blob> {
  const { w, h } = fit(img.naturalWidth, img.naturalHeight, edge);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable.");
  // Better downscaling than the default on large camera images.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return toBlob(canvas, quality);
}

export interface CaptureResult {
  thumbBytes: number;
  displayBytes: number;
  originalBytes: number;
}

/** Resizes, encodes and stores both derivatives for one habit/day. */
export async function captureFor(
  habitId: string, date: string, file: Blob
): Promise<CaptureResult> {
  const img = await loadImage(file);
  // Sequential, not Promise.all: two full-size canvases at once is a real
  // memory spike on a phone, and the second decode is cheap anyway.
  const thumb = await derive(img, THUMB_EDGE, THUMB_QUALITY);
  const display = await derive(img, DISPLAY_EDGE, DISPLAY_QUALITY);
  await putPhoto(habitId, date, thumb, display);
  return {
    thumbBytes: thumb.size,
    displayBytes: display.size,
    originalBytes: file.size
  };
}

/**
 * Opens the camera (or library) and returns the chosen file.
 *
 * `capture="environment"` asks iOS for the rear camera directly. It is a hint,
 * not a guarantee — iOS still offers the library, which is what you want when
 * back-filling a day you forgot.
 */
export function pickImage(): Promise<File | null> {
  return new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.style.display = "none";
    document.body.appendChild(input);

    let settled = false;
    const done = (f: File | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(f);
    };

    input.onchange = () => done(input.files?.[0] ?? null);
    // There is no cancel event on a file input. Focus returning to the window
    // means the picker closed; if nothing was chosen by then, treat it as a
    // cancel so the caller is not left waiting forever.
    window.addEventListener("focus", () => {
      window.setTimeout(() => { if (!input.files?.length) done(null); }, 500);
    }, { once: true });

    input.click();
  });
}

/** Object URLs must be revoked or the blobs leak for the page's lifetime. */
export class ObjectUrlPool {
  private urls: string[] = [];

  create(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.urls.push(url);
    return url;
  }

  releaseAll(): void {
    for (const u of this.urls) URL.revokeObjectURL(u);
    this.urls = [];
  }
}
