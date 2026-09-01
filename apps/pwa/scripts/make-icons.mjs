// Generates the app icons from one vector definition.
//
// No image dependencies: the SVG is written directly, and the PNGs are
// rasterised with a minimal hand-rolled encoder. An icon is the entire visual
// identity of a home-screen app, so it is worth having rather than shipping
// a manifest that 404s on every size.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(OUT, { recursive: true });

const BG = [11, 12, 16];        // --soma-bg
const FG = [211, 253, 80];      // --soma-accent

// --- PNG encoder -------------------------------------------------------------
// PNG is deflate-compressed scanlines wrapped in CRC'd chunks. Small enough to
// write directly rather than pulling in a dependency for five files.
function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function encodePng(size, pixel) {
  // Raw scanlines, each prefixed with filter type 0 (none).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y, size);
      raw[p++] = r; raw[p++] = g; raw[p++] = b; raw[p++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// --- the mark ----------------------------------------------------------------
// A bold lightning bolt: legible at 40px on a home screen, which rules out
// anything with fine detail or text.
const BOLT = [
  [0.56, 0.10], [0.30, 0.55], [0.46, 0.55], [0.40, 0.90], [0.68, 0.44], [0.51, 0.44]
];

function inPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * @param inset  fraction of the canvas kept clear of the mark. Maskable icons
 *               get cropped to a circle by the launcher, so the mark has to
 *               sit inside the safe zone or the platform will clip it.
 * @param round  corner radius as a fraction; 0 for maskable (full bleed).
 */
function makeIcon(size, { inset = 0, round = 0 } = {}) {
  return encodePng(size, (x, y) => {
    const u = x / size, v = y / size;

    if (round > 0) {
      // Rounded-rect alpha so the standalone icon is not a hard square.
      const r = round, cx = Math.min(u, 1 - u), cy = Math.min(v, 1 - v);
      if (cx < r && cy < r) {
        const dx = r - cx, dy = r - cy;
        if (Math.hypot(dx, dy) > r) return [0, 0, 0, 0];
      }
    }

    const s = 1 - inset * 2;
    const mx = (u - inset) / s, my = (v - inset) / s;
    const on = mx >= 0 && mx <= 1 && my >= 0 && my <= 1 && inPolygon(mx, my, BOLT);
    return on ? [...FG, 255] : [...BG, 255];
  });
}

const files = [
  ["icon-192.png", makeIcon(192, { round: 0.18 })],
  ["icon-512.png", makeIcon(512, { round: 0.18 })],
  // Maskable: full bleed, mark pulled well inside the launcher's safe zone.
  ["icon-maskable-512.png", makeIcon(512, { inset: 0.16 })],
  // iOS does not apply the manifest icons; it uses apple-touch-icon, and it
  // applies its own corner radius, so this one is a plain square.
  ["apple-touch-icon.png", makeIcon(180)]
];

for (const [name, buf] of files) {
  writeFileSync(join(OUT, name), buf);
  console.log(`  ${name.padEnd(24)} ${(buf.length / 1024).toFixed(1)} KB`);
}

const points = BOLT.map(([x, y]) => `${(x * 64).toFixed(1)},${(y * 64).toFixed(1)}`).join(" ");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="rgb(${BG.join(",")})"/>
  <polygon points="${points}" fill="rgb(${FG.join(",")})"/>
</svg>
`;
writeFileSync(join(OUT, "icon.svg"), svg);
console.log(`  icon.svg                 ${(svg.length / 1024).toFixed(1)} KB`);
