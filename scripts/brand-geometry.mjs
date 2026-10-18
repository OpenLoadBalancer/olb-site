// Original SVG geometry: a traffic-controller gopher with a three-way route
// on its hard hat. Color variants share identical proportions.
export function artwork(mono = false, light = false) {
  const ink = mono ? (light ? "#f1f1e9" : "#202820") : "#182c34";
  const cyan = mono ? ink : "#70ced8";
  const orange = mono ? ink : "#ff9762";
  const paper = mono ? (light ? "#111312" : "#ffffff") : "#fff8eb";
  return `<g stroke="${ink}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="17" cy="45" r="8.5" fill="${cyan}"/>
    <circle cx="79" cy="45" r="8.5" fill="${cyan}"/>
    <path d="M21 39C21 29 75 29 75 39v26c0 16-11 24-27 24S21 81 21 65Z" fill="${cyan}"/>
    <path d="M21 33C22 17 31 9 43 8h10c13 1 22 10 23 25" fill="${orange}"/>
    <path d="M17 33c17-5 45-5 62 0l2 7c-22-4-44-4-66 0Z" fill="${orange}"/>
    <path d="M48 27V16m0 8c-8 0-10-3-10-7m10 7c8 0 10-3 10-7" fill="none" stroke="${paper}" stroke-width="3.5"/>
    <ellipse cx="35" cy="53" rx="10.5" ry="12" fill="${paper}"/>
    <ellipse cx="61" cy="53" rx="10.5" ry="12" fill="${paper}"/>
    <ellipse cx="37.5" cy="53.5" rx="3.7" ry="5" fill="${ink}" stroke="none"/>
    <ellipse cx="58.5" cy="53.5" rx="3.7" ry="5" fill="${ink}" stroke="none"/>
    <path d="M39 72c3 4 15 4 18 0" fill="none" stroke="${mono ? paper : ink}" stroke-width="2.6"/>
    <path d="M42 74h6v6h-6ZM48 74h6v6h-6Z" fill="${paper}" stroke-width="2"/>
    <ellipse cx="48" cy="66" rx="6" ry="4" fill="${mono ? paper : ink}" stroke="none"/>
  </g>`;
}
export function mark(body = artwork()) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none"><title>OpenLoadBalancer traffic gopher</title>${body}</svg>`;
}
