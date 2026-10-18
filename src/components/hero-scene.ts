/** All distances are CSS pixels and all durations are seconds. */
export const ROUTING_SCENE = {
  mobileWidth: 760,
  maxDpr: 1.5,
  maxPixels: 4_000_000,
  desktop: { routes: 18, maxRoutes: 30, packets: 2, fps: 40, radius: 180 },
  mobile: { routes: 9, maxRoutes: 9, packets: 1, fps: 24, radius: 115 },
  idleAfter: 4,
  idleFps: 20,
  packetSpeed: 45,
  maxBursts: 5,
  mergeWindow: 0.16,
  mergeRadius: 32,
  burstLife: 1.8,
  burstRadius: 280,
  burstRays: 8,
  trailLife: 0.65,
  maxTrail: 14,
  edgeFade: 48,
  quietSelector: ".hero-copy > *, .traffic-console, [data-scene-quiet]",
  dark: {
    ink: "105, 173, 250",
    bright: "194, 223, 255",
    wire: 0.28,
    pulse: 0.85,
  },
  light: { ink: "8, 99, 185", bright: "8, 99, 185", wire: 0.22, pulse: 0.7 },
} as const;

type Point = { x: number; y: number };
type Route = {
  lane: number;
  trunk: number;
  fork: number;
  depth: number;
  speed: number;
  direction: number;
};
type Burst = Point & { born: number; variant: number; power: number };
type Rect = { left: number; top: number; right: number; bottom: number };
const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const ease = (v: number) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const controls =
  "a,button,input,select,textarea,label,summary,[role=button],[contenteditable],h1,p,.hero-footnote,.traffic-console";

export function createRoutingScene(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  const layer = document.createElement("canvas");
  const backdrop = layer.getContext("2d");
  if (!backdrop) return;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 1,
    height = 1,
    dpr = 1;
  let routes: Route[] = [],
    quiet: Rect[] = [];
  let mobile = false,
    palette: typeof ROUTING_SCENE.dark | typeof ROUTING_SCENE.light =
      ROUTING_SCENE.dark;
  let visible = false,
    disposed = false,
    raf = 0,
    last = 0,
    time = 0;
  let lastInteraction = -100,
    intensity = 0,
    entrance = 0;
  let bursts: Burst[] = [],
    trail: (Point & { born: number })[] = [];
  let serial = 0;
  let down: (Point & { at: number; id: number; moved: boolean }) | null = null;
  const pointer = { x: 0, y: 0, active: false, strength: 0 };
  const quality = () => (mobile ? ROUTING_SCENE.mobile : ROUTING_SCENE.desktop);
  const rgba = (color: string, alpha: number) =>
    `rgba(${color},${clamp(alpha)})`;

  function point(route: Route, t: number): Point {
    const fork = ease((t - 0.28) / 0.45);
    return {
      x: t * width,
      y:
        height *
          (route.trunk + (route.lane - route.trunk + route.fork) * fork) +
        Math.sin(t * Math.PI * 2 + route.lane * 5) * 9 * route.depth,
    };
  }
  function visibility(x: number, y: number) {
    let opacity = ease(
      Math.min(x, y, width - x, height - y) /
        (mobile ? 20 : ROUTING_SCENE.edgeFade),
    );
    for (const r of quiet) {
      const distance = Math.hypot(
        Math.max(r.left - x, 0, x - r.right),
        Math.max(r.top - y, 0, y - r.bottom),
      );
      const floor = mobile ? 0.14 : 0.08;
      opacity *= floor + (1 - floor) * ease(distance / (mobile ? 24 : 44));
    }
    return opacity;
  }
  function line(
    c: CanvasRenderingContext2D,
    a: Point,
    b: Point,
    alpha: number,
    size = 1,
    color: string = palette.ink,
  ) {
    c.strokeStyle = rgba(color, alpha);
    c.lineWidth = size;
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.stroke();
  }
  function drawBackdrop() {
    backdrop!.clearRect(0, 0, width, height);
    backdrop!.lineCap = "round";
    // Shared trunks open into separate lanes, echoing the five-way OLB mark.
    for (const route of routes) {
      for (let i = 0; i < 64; i++) {
        const a = point(route, i / 64),
          b = point(route, (i + 1) / 64);
        line(
          backdrop!,
          a,
          b,
          palette.wire * route.depth * visibility(a.x, a.y),
        );
      }
      for (const t of [0.08, 0.32, 0.68, 0.92]) {
        const p = point(route, t);
        const alpha = visibility(p.x, p.y) * 0.36 * route.depth;
        backdrop!.strokeStyle = rgba(palette.ink, alpha);
        backdrop!.lineWidth = 1;
        backdrop!.strokeRect(p.x - 2.5, p.y - 2.5, 5, 5);
        line(
          backdrop!,
          { x: p.x - 7, y: p.y - 7 },
          { x: p.x - 4, y: p.y - 7 },
          alpha * 0.5,
        );
      }
    }
  }
  function measure() {
    if (disposed) return;
    const bounds = host.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    mobile = width < ROUTING_SCENE.mobileWidth;
    dpr = Math.min(
      devicePixelRatio || 1,
      ROUTING_SCENE.maxDpr,
      Math.sqrt(ROUTING_SCENE.maxPixels / (width * height)),
    );
    canvas.width = layer.width = Math.round(width * dpr);
    canvas.height = layer.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    backdrop!.setTransform(dpr, 0, 0, dpr, 0, 0);
    quiet = [...host.querySelectorAll(ROUTING_SCENE.quietSelector)].map(
      (el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - bounds.left - 10,
          right: r.right - bounds.left + 10,
          top: r.top - bounds.top - 8,
          bottom: r.bottom - bounds.top + 8,
        };
      },
    );
    const q = quality(),
      count = Math.min(
        q.maxRoutes,
        Math.round(q.routes * Math.max(1, width / 1440)),
      );
    routes = Array.from({ length: count }, (_, i) => ({
      lane: (i + 0.5) / count,
      trunk: mobile ? (i + 0.5) / count : (Math.floor(i / 3) * 3 + 1.5) / count,
      fork: ((i % 5) - 2) * 0.019,
      depth: 0.45 + (i % 4) * 0.18,
      speed: ROUTING_SCENE.packetSpeed * (0.65 + (i % 5) * 0.16),
      direction: i % 4 === 3 ? -1 : 1,
    }));
    readTheme();
  }
  function readTheme() {
    palette =
      document.documentElement.dataset.theme === "light"
        ? ROUTING_SCENE.light
        : ROUTING_SCENE.dark;
    drawBackdrop();
    paint();
  }
  function displaced(p: Point, depth: number) {
    let x = p.x,
      y = p.y;
    const distance = Math.hypot(x - pointer.x, y - pointer.y);
    const force =
      ease(1 - distance / quality().radius) * pointer.strength * 22 * depth;
    if (distance > 0.1) {
      x += ((x - pointer.x) / distance) * force;
      y += ((y - pointer.y) / distance) * force;
    }
    for (const b of bursts) {
      const age = (time - b.born) / ROUTING_SCENE.burstLife;
      const r = ease(age) * radius();
      const d = Math.hypot(x - b.x, y - b.y);
      const push =
        (1 - age) * Math.max(0, 1 - Math.abs(d - r) / 50) * 14 * depth;
      if (d > 0.1) {
        x += ((x - b.x) / d) * push;
        y += ((y - b.y) / d) * push;
      }
    }
    return { x, y };
  }
  const radius = () => Math.min(ROUTING_SCENE.burstRadius, width * 0.48);
  function paint() {
    ctx!.clearRect(0, 0, width, height);
    ctx!.globalAlpha = motion.matches ? 1 : ease(entrance / 0.8);
    ctx!.drawImage(layer, 0, 0, layer.width, layer.height, 0, 0, width, height);
    ctx!.lineCap = "round";
    let links = 0;
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      for (let j = 0; j < quality().packets; j++) {
        const progress =
          ((time * route.speed) / width + i * 0.173 + j / quality().packets) %
          1;
        const t = route.direction === 1 ? progress : 1 - progress;
        const p = displaced(point(route, t), route.depth);
        const tail = displaced(
          point(route, t - (8 * route.depth * route.direction) / width),
          route.depth,
        );
        const alpha =
          visibility(p.x, p.y) *
          palette.pulse *
          route.depth *
          (0.5 + intensity * 0.5);
        line(ctx!, tail, p, alpha * 0.1, 7);
        line(ctx!, tail, p, alpha, 1.8, palette.bright);
        ctx!.fillStyle = rgba(palette.ink, alpha);
        ctx!.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        const distance = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (
          !motion.matches &&
          links < 3 &&
          distance < quality().radius &&
          pointer.strength > 0.02
        ) {
          line(
            ctx!,
            p,
            pointer,
            alpha * 0.35 * pointer.strength * (1 - distance / quality().radius),
          );
          links++;
        }
      }
    }
    if (!motion.matches) {
      for (let i = 1; i < trail.length; i++) {
        const p = trail[i],
          fade = 1 - (time - p.born) / ROUTING_SCENE.trailLife;
        line(
          ctx!,
          trail[i - 1],
          p,
          fade * 0.22 * visibility(p.x, p.y),
          Math.max(0.4, fade * 1.5),
        );
      }
      for (const b of bursts) {
        const age = clamp((time - b.born) / ROUTING_SCENE.burstLife);
        const r = ease(age) * radius(),
          fade = ease(age / 0.12) * (1 - age) ** 1.4 * b.power;
        // Short segmented wave and routed packet rays share the same blue vocabulary.
        for (let n = 0; n < 48; n++) {
          const a = (n / 48) * Math.PI * 2,
            next = ((n + 0.72) / 48) * Math.PI * 2;
          const p = { x: b.x + Math.cos(a) * r, y: b.y + Math.sin(a) * r };
          const q = {
            x: b.x + Math.cos(next) * r,
            y: b.y + Math.sin(next) * r,
          };
          line(ctx!, p, q, fade * 0.6 * visibility(p.x, p.y), 1.2);
        }
        const count = mobile ? 5 : ROUTING_SCENE.burstRays;
        for (let n = 0; n < count; n++) {
          const a = (n / count + b.variant / 15) * Math.PI * 2;
          const distance = r * (0.6 + (n % 3) * 0.12);
          const p = {
            x: b.x + Math.cos(a) * distance,
            y: b.y + Math.sin(a) * distance,
          };
          const q = { x: p.x - Math.cos(a) * 10, y: p.y - Math.sin(a) * 10 };
          line(
            ctx!,
            q,
            p,
            fade * 0.9 * visibility(p.x, p.y),
            2,
            palette.bright,
          );
        }
      }
    }
    ctx!.globalAlpha = 1;
  }
  function tick(stamp: number) {
    raf = 0;
    if (disposed || !visible || document.hidden || motion.matches) return;
    const active = time - lastInteraction < ROUTING_SCENE.idleAfter;
    const interval = 1000 / (active ? quality().fps : ROUTING_SCENE.idleFps);
    if (!last || stamp - last >= interval) {
      const dt = last ? Math.min((stamp - last) / 1000, 0.08) : 0;
      last = stamp;
      entrance += dt;
      time += dt;
      intensity += ((active ? 1 : 0.18) - intensity) * (1 - Math.exp(-dt * 2));
      pointer.strength +=
        ((pointer.active ? 1 : 0) - pointer.strength) * (1 - Math.exp(-dt * 7));
      bursts = bursts.filter((b) => time - b.born < ROUTING_SCENE.burstLife);
      trail = trail.filter((p) => time - p.born < ROUTING_SCENE.trailLife);
      paint();
    }
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    const state = motion.matches
      ? "reduced"
      : visible && !document.hidden
        ? "running"
        : "paused";
    canvas.dataset.motion = state;
    if (state === "running") raf = requestAnimationFrame(tick);
    else if (state === "reduced") {
      bursts = [];
      trail = [];
      pointer.strength = 0;
      pointer.active = false;
      down = null;
      paint();
    }
  }
  function local(e: PointerEvent): Point {
    const r = host.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function excluded(e: PointerEvent) {
    return e.target instanceof Element && !!e.target.closest(controls);
  }
  function move(e: PointerEvent) {
    const p = local(e);
    if (down && Math.hypot(p.x - down.x, p.y - down.y) > 10) down.moved = true;
    if (e.pointerType === "touch" || motion.matches) return;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = !excluded(e);
    if (!pointer.active) return;
    lastInteraction = time;
    const previous = trail[trail.length - 1];
    if (!previous || Math.hypot(p.x - previous.x, p.y - previous.y) > 12) {
      trail.push({ ...p, born: time });
      if (trail.length > ROUTING_SCENE.maxTrail) trail.shift();
    }
  }
  function pointerDown(e: PointerEvent) {
    down =
      e.isPrimary && e.button === 0 && !excluded(e)
        ? { ...local(e), at: performance.now(), id: e.pointerId, moved: false }
        : null;
  }
  function pointerUp(e: PointerEvent) {
    if (
      down?.id === e.pointerId &&
      !down.moved &&
      !motion.matches &&
      !excluded(e) &&
      performance.now() - down.at < 550
    ) {
      const p = local(e);
      lastInteraction = time;
      const recent = bursts.at(-1);
      if (
        recent &&
        time - recent.born < ROUTING_SCENE.mergeWindow &&
        Math.hypot(p.x - recent.x, p.y - recent.y) < ROUTING_SCENE.mergeRadius
      ) {
        recent.power = Math.min(1.4, recent.power + 0.08);
      } else {
        bursts.push({ ...p, born: time, variant: serial++ % 3, power: 1 });
        if (bursts.length > ROUTING_SCENE.maxBursts) bursts.shift();
      }
    }
    down = null;
  }
  function leave() {
    pointer.active = false;
    down = null;
  }
  function visibilityChange() {
    if (document.hidden) leave();
    sync();
  }
  const resize = new ResizeObserver(measure);
  resize.observe(host);
  for (const el of host.querySelectorAll(ROUTING_SCENE.quietSelector))
    resize.observe(el);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (!visible) leave();
    sync();
  });
  intersection.observe(host);
  const theme = new MutationObserver(readTheme);
  theme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerdown", pointerDown, { passive: true });
  host.addEventListener("pointerup", pointerUp, { passive: true });
  host.addEventListener("pointercancel", leave, { passive: true });
  host.addEventListener("pointerleave", leave, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  let resolution: MediaQueryList;
  function resolutionChange() {
    resolution?.removeEventListener("change", resolutionChange);
    resolution = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    resolution.addEventListener("change", resolutionChange);
    measure();
  }
  resolutionChange();
  document.addEventListener("visibilitychange", visibilityChange);
  motion.addEventListener("change", sync);
  measure();
  sync();
  // Font metrics can change the protected text bounds without resizing the stage.
  document.fonts.ready.then(() => {
    if (!disposed) measure();
  });
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    resize.disconnect();
    intersection.disconnect();
    theme.disconnect();
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerdown", pointerDown);
    host.removeEventListener("pointerup", pointerUp);
    host.removeEventListener("pointercancel", leave);
    host.removeEventListener("pointerleave", leave);
    window.removeEventListener("resize", measure);
    resolution.removeEventListener("change", resolutionChange);
    document.removeEventListener("visibilitychange", visibilityChange);
    motion.removeEventListener("change", sync);
    layer.width = layer.height = 0;
  };
}
