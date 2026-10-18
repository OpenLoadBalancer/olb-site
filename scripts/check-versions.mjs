import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
for (const [name, version] of Object.entries({
  ...pkg.dependencies,
  ...pkg.devDependencies,
})) {
  assert.match(version, /^\d+\.\d+\.\d+$/);
  const response = await fetch(`https://registry.npmjs.org/${name}/latest`);
  assert.ok(response.ok);
  const current = await response.json();
  assert.equal(current.version, version, `${name}: stable version changed`);
  assert.equal(lock.packages[`node_modules/${name}`].version, version);
  console.log(`${name}: ${version} (official latest stable)`);
}
for (const [name, entry] of Object.entries(lock.packages))
  if (entry.version)
    assert.ok(
      !/\d-/.test(entry.version),
      `Prerelease: ${name}@${entry.version}`,
    );
const npm = (
  await (await fetch("https://registry.npmjs.org/npm/latest")).json()
).version;
assert.equal(pkg.packageManager, `npm@${npm}`);
const nodes = await (await fetch("https://nodejs.org/dist/index.json")).json();
assert.equal(
  pkg.engines.node,
  nodes.find((x) => !x.version.includes("-")).version.slice(1),
);
console.log(
  `Node ${pkg.engines.node}, npm ${npm}; no prerelease dependency versions`,
);
