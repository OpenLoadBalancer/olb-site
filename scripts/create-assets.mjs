import { writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
await mkdir("public/brand", { recursive: true });
for (const [mode, color] of [
  ["dark", "#f1f1e9"],
  ["light", "#202820"],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 64"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#3b82f6"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs><rect x="2" y="8" width="48" height="48" rx="9" fill="url(#g)"/><text x="26" y="41" text-anchor="middle" fill="white" font-size="21" font-weight="700" font-family="Arial,sans-serif">OLB</text><text x="64" y="40" fill="${color}" font-size="26" font-family="Arial,sans-serif" letter-spacing="-.7">OpenLoadBalancer</text></svg>`;
  await writeFile(`public/brand/wordmark-${mode}.svg`, svg);
}
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#111312"/><g stroke="#303631"><path d="M65 110h1070M65 530h1070"/><path d="M800 220h100v100h180M800 320h280M800 420h100V320" fill="none"/></g><rect x="70" y="48" width="42" height="42" rx="8" fill="#4f72f3"/><text x="91" y="75" fill="white" font-size="16" font-family="Arial" font-weight="700" text-anchor="middle">OLB</text><text x="127" y="77" fill="#f1f1e9" font-family="Arial" font-size="26">OpenLoadBalancer</text><text x="70" y="250" fill="#f1f1e9" font-size="86" font-family="Arial" letter-spacing="-5">Your traffic.</text><text x="70" y="345" fill="#ff886b" font-size="86" font-family="Arial" letter-spacing="-5">Your rules.</text><text x="75" y="410" fill="#a1aaa3" font-family="Arial" font-size="23">One Go binary. Full control.</text><rect x="740" y="275" width="105" height="90" rx="12" fill="#ff886b"/><text x="792" y="330" text-anchor="middle" fill="#111312" font-family="Arial" font-size="29" font-weight="700">OLB</text>${[220, 320, 420].map((y) => `<rect x="1010" y="${y - 20}" width="110" height="40" rx="5" fill="#1c201d" stroke="#505c52"/><circle cx="1025" cy="${y}" r="4" fill="#9eccac"/><text x="1040" y="${y + 4}" fill="#a1aaa3" font-family="monospace" font-size="11">BACKEND</text>`).join("")}<text x="75" y="575" fill="#a1aaa3" font-family="Arial" font-size="17">L4 / L7 LOAD BALANCER</text><text x="1125" y="575" text-anchor="end" fill="#ff886b" font-family="Arial" font-size="17">openloadbalancer.dev</text></svg>`;
await writeFile("public/og.svg", og);
await sharp(Buffer.from(og)).png().toFile("public/og.png");
console.log("Created SVG wordmarks and 1200×630 PNG Open Graph image");
