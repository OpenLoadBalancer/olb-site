import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
import { artwork, mark } from "./brand-geometry.mjs";
await mkdir("public/brand", { recursive: true });
const symbol = mark();
await writeFile("public/brand/mark.svg", symbol);
await writeFile("public/brand/mark-on-dark.svg", mark(artwork(false, true)));
await writeFile("public/favicon.svg", symbol);
await writeFile("public/brand/mark-mono-dark.svg", mark(artwork(true)));
await writeFile("public/brand/mark-mono-light.svg", mark(artwork(true, true)));
await sharp(Buffer.from(symbol))
  .resize(512, 512)
  .png()
  .toFile("public/brand/mark.png");
await sharp(Buffer.from(symbol))
  .resize(180, 180)
  .png()
  .toFile("public/apple-touch-icon.png");
for (const [mode, color] of [
  ["dark", "#f1f1e9"],
  ["light", "#202820"],
]) {
  const icon = artwork(false, mode === "dark");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 80"><title>OpenLoadBalancer</title><g transform="translate(0 1) scale(.81)">${icon}</g><text x="92" y="49" fill="${color}" font-size="29" font-family="Arial,sans-serif" letter-spacing="-1"><tspan font-weight="300">Open</tspan><tspan font-weight="700">LoadBalancer</tspan></text></svg>`;
  await writeFile(`public/brand/wordmark-${mode}.svg`, svg);
  const stacked = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 540"><title>OpenLoadBalancer OLB</title><g transform="translate(156 40) scale(3)">${icon}</g><text x="300" y="411" text-anchor="middle" fill="${mode === "dark" ? "#f1f1e9" : "#084e94"}" font-size="42" font-family="Arial,sans-serif" letter-spacing="-1.3"><tspan font-weight="300">Open</tspan><tspan font-weight="700">LoadBalancer</tspan></text><text x="300" y="455" text-anchor="middle" fill="${mode === "dark" ? "#69adfa" : "#367fc4"}" font-size="31" font-weight="300" font-family="Arial,sans-serif" letter-spacing="1">OLB</text></svg>`;
  await writeFile(`public/brand/logo-${mode}.svg`, stacked);
  await sharp(Buffer.from(stacked))
    .resize(1200, 1080)
    .png()
    .toFile(`public/brand/logo-${mode}.png`);
}
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#111312"/><g stroke="#303631"><path d="M65 110h1070M65 530h1070"/><path d="M800 220h100v100h180M800 320h280M800 420h100V320" fill="none"/></g><g transform="translate(67 32) scale(.58)">${artwork(false, true)}</g><text x="127" y="77" fill="#f1f1e9" font-family="Arial" font-size="26">OpenLoadBalancer</text><text x="70" y="250" fill="#f1f1e9" font-size="86" font-family="Arial" letter-spacing="-5">Your traffic.</text><text x="70" y="345" fill="#ff886b" font-size="86" font-family="Arial" letter-spacing="-5">Your rules.</text><text x="75" y="410" fill="#a1aaa3" font-family="Arial" font-size="23">One Go binary. Full control.</text><g transform="translate(730 257) scale(1.3)">${artwork(false, true)}</g>${[220, 320, 420].map((y) => `<rect x="1010" y="${y - 20}" width="110" height="40" rx="5" fill="#1c201d" stroke="#505c52"/><circle cx="1025" cy="${y}" r="4" fill="#9eccac"/><text x="1040" y="${y + 4}" fill="#a1aaa3" font-family="monospace" font-size="11">BACKEND</text>`).join("")}<text x="75" y="575" fill="#a1aaa3" font-family="Arial" font-size="17">L4 / L7 LOAD BALANCER</text><text x="1125" y="575" text-anchor="end" fill="#ff886b" font-family="Arial" font-size="17">openloadbalancer.dev</text></svg>`;
await writeFile("public/og.svg", og);
await sharp(Buffer.from(og)).png().toFile("public/og.png");
const board = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640"><rect width="600" height="640" fill="#111312"/><rect x="600" width="600" height="640" fill="#f6f5ef"/>${[0, 600].map((x) => `<g transform="translate(${x + 190} 90) scale(2.3)">${artwork(false, x === 0)}</g><text x="${x + 300}" y="390" text-anchor="middle" font-family="Arial,sans-serif" font-size="31" font-weight="600" letter-spacing="-1" fill="${x ? "#202820" : "#f1f1e9"}"><tspan font-weight="300">Open</tspan><tspan font-weight="700">LoadBalancer</tspan></text><text x="${x + 300}" y="425" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="3" fill="${x ? "#59645c" : "#a1aaa3"}">OLB</text>${[24, 36, 48].map((s, i) => `<g transform="translate(${x + 222 + i * 65} 493) scale(${s / 96})">${artwork(false, x === 0)}</g>`).join("")}`).join("")}</svg>`;
await writeFile("public/brand/preview.svg", board);
await sharp(Buffer.from(board)).png().toFile("public/brand/preview.png");
console.log(
  "Created reference-based five-way routing identity, SVG/PNG lockups, monochrome variants, icons, and Open Graph artwork.",
);
