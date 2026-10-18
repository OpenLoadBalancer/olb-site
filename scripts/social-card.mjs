import { artwork } from "./brand-geometry.mjs";

// Keep the main logo and copy within the card's 64px safe area.
export function socialCard() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="background" x2="1" y2="1"><stop stop-color="#071526"/><stop offset="1" stop-color="#0c2a4d"/></linearGradient>
    <radialGradient id="halo"><stop stop-color="#1462b6" stop-opacity=".28"/><stop offset="1" stop-color="#1462b6" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#8fc4ff" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#background)"/>
  <rect x="700" width="500" height="630" fill="url(#grid)"/>
  <circle cx="975" cy="300" r="310" fill="url(#halo)"/>
  <g fill="none" stroke="#8fc4ff" stroke-opacity=".12"><circle cx="975" cy="300" r="192"/><circle cx="975" cy="300" r="220" stroke-dasharray="2 12"/></g>
  <rect x="72" y="62" width="228" height="31" rx="15.5" fill="#133658" stroke="#26557e"/>
  <text x="186" y="82" text-anchor="middle" fill="#a9d1ff" font-family="Arial,sans-serif" font-size="11" letter-spacing="2">L4 / L7 LOAD BALANCER</text>
  <text x="72" y="155" fill="#f5f9ff" font-family="Arial,sans-serif" font-size="43" letter-spacing="-1.4"><tspan font-weight="300">Open</tspan><tspan font-weight="700">LoadBalancer</tspan></text>
  <text x="68" y="286" fill="#f5f9ff" font-family="Arial,sans-serif" font-size="83" font-weight="600" letter-spacing="-4">Your traffic.</text>
  <text x="68" y="380" fill="#75b8ff" font-family="Arial,sans-serif" font-size="83" font-weight="600" letter-spacing="-4">Your rules.</text>
  <text x="74" y="434" fill="#afc3db" font-family="Arial,sans-serif" font-size="23">One Go binary. Full control.</text>
  <g transform="translate(822 140) scale(3.2)">${artwork(false, true)}</g>
  <path d="M72 524H1128" stroke="#2b4762"/>
  <text x="74" y="572" fill="#afc3db" font-family="Arial,sans-serif" font-size="15" letter-spacing="1">HTTP(S) · TCP · UDP</text>
  <text x="1128" y="573" text-anchor="end" fill="#f5f9ff" font-family="Arial,sans-serif" font-size="20">openloadbalancer.dev</text>
  </svg>`;
}
