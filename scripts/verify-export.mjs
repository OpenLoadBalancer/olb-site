import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("out");
const routes = [
  "index.html",
  "docs/index.html",
  "brand/index.html",
  "404.html",
];
assert.equal(
  (await readFile("out/CNAME", "utf8")).trim(),
  "openloadbalancer.dev",
);
await stat("out/.nojekyll");
for (const installer of ["install.sh", "install.ps1"]) {
  assert.deepEqual(
    await readFile(`out/${installer}`),
    await readFile(`public/${installer}`),
  );
}
let checked = 0;
for (const route of routes) {
  const html = await readFile(path.join(root, route), "utf8");
  assert.match(html, /<html[^>]*lang="en"/);
  assert.match(html, /https:\/\/openloadbalancer.dev\/og.png/);
  assert.match(html, /rel="canonical"/);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const value = match[1].replaceAll("&amp;", "&");
    if (!value.startsWith("/") || value.startsWith("//")) continue;
    const pathname = value.split("?")[0];
    const file = path.join(
      root,
      pathname,
      pathname.endsWith("/") ? "index.html" : "",
    );
    assert.ok((await stat(file)).isFile(), `${route}: missing ${value}`);
    checked++;
  }
  console.log(`PASS ${route}`);
}
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) await walk(file);
    else if (file.endsWith(".css")) {
      const css = await readFile(file, "utf8");
      for (const m of css.matchAll(/url\(["']?(\/[^)'"\s]+)["']?\)/g))
        await stat(path.join(root, m[1]));
    }
  }
}
await walk(root);
console.log(
  `PASS ${checked} local route and asset references; CSS assets, CNAME, .nojekyll, canonical and OG metadata`,
);
