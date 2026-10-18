// Vector reconstruction of the owner's five-way routing reference.
// All strokes, arrowheads, and the network enclosure remain editable paths.
export function artwork(mono = false, light = false) {
  const ink = mono
    ? light
      ? "#f1f1e9"
      : "#202820"
    : light
      ? "#69adfa"
      : "#0863b9";
  return `<g fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">
    <path d="m42 34-2 1.2m14-1.2 2 1.2M31 41l-2.5 1.5V48M65 41l2.5 1.5V48M28.5 59v8l7 4M67.5 59v8l-7 4" stroke-width="3" stroke-linecap="butt"/>
    <path d="M48 81V7M41.5 82V53c0-16-10-27-26-32M54.5 82V53c0-16 10-27 26-32M41.5 82v-8c0-15-12-22-27-22H6M54.5 82v-8c0-15 12-22 27-22h8" stroke-width="5.5"/>
    <path d="m42.2 15.3 5.8-9 5.8 9-5.8-3.6Z" fill="${ink}" stroke-width="3.8"/>
    <path d="M24 19 14 21l4 10M72 19l10 2-4 10M13 46.5 5.5 52l7.5 5.5M83 46.5l7.5 5.5-7.5 5.5" stroke-width="3.8"/>
    <path d="M39 77h18v9c0 1.2-.5 1.8-1.5 2.4l-6 3.4a3 3 0 0 1-3 0l-6-3.4C39.5 87.8 39 87.2 39 86Z" fill="${ink}" stroke="none"/>
    <path d="m43 79 5-2 5 2-5 3Zm5 3v3" stroke="${light && mono ? "#111312" : "#ffffff"}" stroke-width="2.2"/>
  </g>`;
}
export function mark(body = artwork()) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none"><title>OpenLoadBalancer five-way traffic flow</title>${body}</svg>`;
}
