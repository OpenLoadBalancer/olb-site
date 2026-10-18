import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("out");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".sh": "text/plain",
  ".ps1": "text/plain",
  ".json": "application/json",
};
createServer(async (req, res) => {
  try {
    let file = path.resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(await readFile(path.join(root, "404.html")));
  }
}).listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
