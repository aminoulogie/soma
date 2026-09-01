// Serves dist/ under /soma/ so the built base path resolves, matching how
// GitHub Pages will host it.
import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import process from "node:process";

const DIST = join(process.cwd(), "dist");
const TYPES = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css",
  ".webmanifest":"application/manifest+json", ".png":"image/png", ".svg":"image/svg+xml" };

http.createServer((req, res) => {
  let p = decodeURIComponent((req.url ?? "/").split("?")[0]);
  p = p.replace(/^\/soma/, "") || "/";
  if (p === "/") p = "/index.html";
  const f = join(DIST, p);
  if (!existsSync(f)) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "Content-Type": TYPES[extname(f)] ?? "application/octet-stream" });
  res.end(readFileSync(f));
}).listen(8790, () => console.log("serving dist on http://localhost:8790/soma/"));
