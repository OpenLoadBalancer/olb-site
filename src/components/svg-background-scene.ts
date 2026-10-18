/** Distances are CSS pixels, durations are seconds. The DOM pool never grows. */
export const BACKGROUND = {
  maxObjects: 72,
  maxRows: 12,
  maxBursts: 5,
  rays: 8,
  mobileWidth: 760,
  desktop: { objects: 72, columns: 12, fps: 32, radius: 180 },
  mobile: { objects: 12, columns: 2, fps: 24, radius: 110 },
  idleAfter: 4,
  idleFps: 16,
  parallax: 0.22,
  drift: 9,
  force: 24,
  burstLife: 2,
  burstRadius: 240,
  mergeWindow: 0.16,
  mergeRadius: 32,
  quietSelector:
    "h1,h2,h3,p,pre,a,button,li,.protocol-band span,.hero-footnote,.visual-corner,.visual-foot,.traffic-console,.brand-reference,.brand-tile,.studio-signature,.final-cta,[data-background-quiet]",
} as const;

type Point = { x: number; y: number };
type Region = { left: number; top: number; right: number; bottom: number };
type Shape = Point & { seed: number; depth: number; type: number };
type Burst = Point & { born: number; variant: number; power: number };
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const ease = (v: number) => {
  v = clamp(v);
  return v * v * (3 - 2 * v);
};
const random = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const ignore =
  "a,button,input,select,textarea,label,summary,[role=button],[contenteditable],h1,h2,h3,p,pre,code,li,.theme-picker,.traffic-console,[data-background-ignore]";
const attr = (node: Element, key: string, value: number | string) =>
  node.setAttribute(key, String(value));

export function createSvgBackground(svg: SVGSVGElement, host: HTMLElement) {
  const objects = [...svg.querySelectorAll<SVGGElement>("[data-object]")];
  const glyphs = objects.map((el) => el.querySelector("use")!);
  const routes = [...svg.querySelectorAll<SVGGElement>("[data-route]")].map(
    (el) => ({
      el,
      wire: el.querySelector("[data-wire]")!,
      packet: el.querySelector("[data-packet]")!,
    }),
  );
  const effects = [...svg.querySelectorAll<SVGGElement>("[data-burst]")].map(
    (el) => ({
      el,
      ring: el.querySelector("[data-ring]")!,
      echo: el.querySelector("[data-echo]")!,
      sparks: [...el.querySelectorAll("[data-spark]")],
    }),
  );
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 1,
    height = 1,
    columns = 1,
    rows = 1,
    spacing = 240,
    mobile = false;
  let shapes: Shape[] = [],
    bursts: Burst[] = [],
    regions: Region[] = [];
  let raf = 0,
    last = 0,
    time = 0,
    entered = 0,
    lastInput = -100,
    lastRegions = -100;
  let origin = 0,
    firstRow = NaN,
    dirty = true,
    visible = false,
    disposed = false,
    variant = 0;
  const pointer = { x: 0, y: 0, active: false, strength: 0 };
  let down: (Point & { at: number; id: number; moved: boolean }) | null = null;
  const visibleRegions = new Set<Element>();
  const quality = () => (mobile ? BACKGROUND.mobile : BACKGROUND.desktop);

  function collectRegions() {
    regions = [...visibleRegions].map((el) => el.getBoundingClientRect());
    dirty = false;
    lastRegions = time;
  }
  function quiet(x: number, y: number) {
    let fade = 1;
    for (const r of regions) {
      const d = Math.hypot(
        Math.max(r.left - x, 0, x - r.right),
        Math.max(r.top - y, 0, y - r.bottom),
      );
      fade = Math.min(fade, 0.1 + 0.9 * ease(d / 38));
    }
    return fade;
  }
  function layout() {
    const row = Math.floor(origin / spacing) - 1;
    if (row === firstRow) return;
    firstRow = row;
    const names = ["fork", "hex", "node", "orbit", "diamond"];
    shapes = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < columns; c++) {
        const seed = (firstRow + r) * 29 + c * 7 + 83;
        const type = Math.floor(random(seed + 3) * names.length);
        shapes.push({
          x: ((c + 0.5 + (random(seed) - 0.5) * 0.6) * width) / columns,
          y: (firstRow + r + 0.5) * spacing + (random(seed + 1) - 0.5) * 60,
          seed,
          depth: 0.45 + random(seed + 2) * 0.55,
          type,
        });
        const i = shapes.length - 1;
        attr(
          glyphs[i],
          "href",
          `#${glyphs[i].getAttribute("data-glyph-prefix")}-${names[type]}`,
        );
      }
    for (let i = shapes.length; i < objects.length; i++)
      attr(objects[i], "visibility", "hidden");
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      if (i >= rows) {
        attr(route.el, "visibility", "hidden");
        continue;
      }
      const bend = (random(firstRow + i + 51) - 0.5) * 100;
      const d = `M-20 0H${width * 0.22}C${width * 0.4} 0 ${width * 0.44} ${bend} ${width * 0.62} ${bend}H${width + 20}`;
      attr(route.wire, "d", d);
      attr(route.packet, "d", d);
    }
  }
  function measure() {
    if (disposed) return;
    const bounds = svg.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    mobile = width < BACKGROUND.mobileWidth;
    const q = quality();
    columns = mobile ? q.columns : clamp(Math.round(width / 300), 3, q.columns);
    rows = Math.min(
      BACKGROUND.maxRows,
      Math.floor(q.objects / columns),
      Math.ceil(height / 240) + 2,
    );
    spacing = height / Math.max(2, rows - 2);
    attr(svg, "viewBox", `0 0 ${width} ${height}`);
    firstRow = NaN;
    dirty = true;
    draw(performance.now() / 1000);
  }
  function draw(now: number) {
    origin = scrollY * (media.matches ? 1 : BACKGROUND.parallax);
    layout();
    if (dirty && (media.matches || time - lastRegions > 0.06)) collectRegions();
    const intro = media.matches ? 1 : ease(entered / 0.8);
    svg.style.opacity = String(intro);
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i],
        node = objects[i];
      let x = shape.x,
        y = shape.y - origin;
      if (!media.matches) {
        x +=
          Math.sin(time * (0.12 + shape.depth * 0.08) + shape.seed) *
          BACKGROUND.drift *
          shape.depth;
        y +=
          Math.cos(time * (0.09 + shape.depth * 0.05) + shape.seed) *
          BACKGROUND.drift;
        y += Math.sin(scrollY / 900 + shape.seed) * 8 * shape.depth;
      }
      if (y < -50 || y > height + 50) {
        if (node.getAttribute("visibility") !== "hidden")
          attr(node, "visibility", "hidden");
        continue;
      }
      if (!media.matches) {
        const d = Math.hypot(x - pointer.x, y - pointer.y);
        const force =
          ease(1 - d / quality().radius) *
          pointer.strength *
          BACKGROUND.force *
          shape.depth *
          (shape.type % 2 ? -0.7 : 1);
        if (d > 0.1) {
          x += ((x - pointer.x) / d) * force;
          y += ((y - pointer.y) / d) * force;
        }
        for (const b of bursts) {
          const age = clamp((now - b.born) / BACKGROUND.burstLife);
          const dy = y - (b.y - origin),
            dx = x - b.x,
            distance = Math.hypot(dx, dy);
          const push =
            Math.max(0, 1 - Math.abs(distance - ease(age) * radius()) / 45) *
            (1 - age) *
            15;
          if (distance > 0.1) {
            x += (dx / distance) * push;
            y += (dy / distance) * push;
          }
        }
      }
      const edge = ease(
        Math.min(y + 25, height + 25 - y, x + 10, width + 10 - x) / 45,
      );
      const rotation =
        shape.type === 1 || shape.type === 4
          ? Math.sin(time * 0.08 + shape.seed) * 10
          : 0;
      attr(node, "visibility", "visible");
      attr(
        node,
        "transform",
        `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)}) scale(${(0.6 + shape.depth * 0.55).toFixed(2)})`,
      );
      attr(
        node,
        "opacity",
        (edge * quiet(x, y) * (0.4 + shape.depth * 0.6)).toFixed(3),
      );
    }
    for (let i = 0; i < rows; i++) {
      const route = routes[i],
        worldRow = firstRow + i,
        y = (worldRow + 0.5) * spacing - origin;
      const inView = y > -70 && y < height + 70;
      if (
        route.el.getAttribute("visibility") !== (inView ? "visible" : "hidden")
      )
        attr(route.el, "visibility", inView ? "visible" : "hidden");
      if (!inView) continue;
      attr(route.el, "transform", `translate(0 ${y.toFixed(2)})`);
      attr(
        route.packet,
        "stroke-dashoffset",
        (-(time * (6 + (Math.abs(worldRow) % 3)) + worldRow * 113)).toFixed(2),
      );
    }
    bursts = bursts.filter((b) => now - b.born < BACKGROUND.burstLife);
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i],
        b = bursts[i];
      if (!b || media.matches) {
        if (effect.el.getAttribute("visibility") !== "hidden")
          attr(effect.el, "visibility", "hidden");
        continue;
      }
      const age = clamp((now - b.born) / BACKGROUND.burstLife),
        r = ease(age) * radius();
      const fade = ease(age / 0.1) * (1 - age) ** 1.5 * b.power;
      attr(effect.el, "visibility", "visible");
      attr(
        effect.el,
        "transform",
        `translate(${b.x.toFixed(2)} ${(b.y - origin).toFixed(2)})`,
      );
      attr(effect.el, "opacity", fade.toFixed(3));
      attr(effect.ring, "r", r.toFixed(2));
      attr(effect.echo, "r", (r * 0.72).toFixed(2));
      for (let n = 0; n < effect.sparks.length; n++) {
        const angle = (n / BACKGROUND.rays + b.variant / 18) * Math.PI * 2;
        const distance = r * (0.5 + (n % 3) * 0.1);
        attr(
          effect.sparks[n],
          "visibility",
          mobile && n % 2 ? "hidden" : "visible",
        );
        attr(
          effect.sparks[n],
          "transform",
          `translate(${(Math.cos(angle) * distance).toFixed(2)} ${(Math.sin(angle) * distance).toFixed(2)}) rotate(${(angle * 180) / Math.PI})`,
        );
      }
    }
  }
  const radius = () => Math.min(BACKGROUND.burstRadius, width * 0.48);
  function tick(stamp: number) {
    raf = 0;
    if (disposed || !visible || document.hidden || media.matches) return;
    const fps =
      time - lastInput < BACKGROUND.idleAfter
        ? quality().fps
        : BACKGROUND.idleFps;
    if (!last || stamp - last >= 1000 / fps) {
      const dt = last ? Math.min((stamp - last) / 1000, 0.08) : 0;
      time += dt;
      entered += dt;
      last = stamp;
      pointer.strength +=
        ((pointer.active ? 1 : 0) - pointer.strength) * (1 - Math.exp(-dt * 7));
      draw(stamp / 1000);
    }
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    const state = media.matches
      ? "reduced"
      : visible && !document.hidden
        ? "running"
        : "paused";
    attr(svg, "data-motion", state);
    if (state === "running") raf = requestAnimationFrame(tick);
    else if (state === "reduced") {
      bursts = [];
      pointer.active = false;
      pointer.strength = 0;
      down = null;
      draw(performance.now() / 1000);
    }
  }
  function scroll() {
    dirty = true;
    down = null;
    pointer.active = false;
    if (media.matches && !document.hidden && !raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!disposed) draw(performance.now() / 1000);
      });
  }
  function move(e: PointerEvent) {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10)
      down.moved = true;
    if (e.pointerType === "touch" || media.matches) return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = !(
      e.target instanceof Element &&
      e.target.closest("a,button,input,select,textarea,[role=button]")
    );
    if (pointer.active) lastInput = time;
  }
  const excluded = (e: PointerEvent) =>
    e.target instanceof Element && !!e.target.closest(ignore);
  function press(e: PointerEvent) {
    down =
      e.isPrimary && e.button === 0 && !excluded(e)
        ? {
            x: e.clientX,
            y: e.clientY,
            id: e.pointerId,
            at: performance.now(),
            moved: false,
          }
        : null;
  }
  function release(e: PointerEvent) {
    if (
      down?.id === e.pointerId &&
      !down.moved &&
      !excluded(e) &&
      !media.matches &&
      performance.now() - down.at < 550
    ) {
      const p = { x: e.clientX, y: e.clientY + scrollY * BACKGROUND.parallax },
        now = performance.now() / 1000;
      const recent = bursts.at(-1);
      if (
        recent &&
        now - recent.born < BACKGROUND.mergeWindow &&
        Math.hypot(p.x - recent.x, p.y - recent.y) < BACKGROUND.mergeRadius
      )
        recent.power = Math.min(1.4, recent.power + 0.08);
      else {
        bursts.push({ ...p, born: now, variant: variant++ % 3, power: 1 });
        if (bursts.length > BACKGROUND.maxBursts) bursts.shift();
      }
      lastInput = time;
    }
    down = null;
  }
  function leave() {
    pointer.active = false;
    down = null;
  }
  function visibility() {
    if (document.hidden) {
      leave();
      bursts = [];
    }
    sync();
  }
  function motionChange() {
    firstRow = NaN;
    dirty = true;
    sync();
  }
  const regionsObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visibleRegions.add(e.target);
        else visibleRegions.delete(e.target);
      }
      dirty = true;
      if (media.matches && !document.hidden && !disposed)
        draw(performance.now() / 1000);
    },
    { rootMargin: "80px" },
  );
  for (const el of host.querySelectorAll(BACKGROUND.quietSelector))
    regionsObserver.observe(el);
  const sceneObserver = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    sync();
  });
  sceneObserver.observe(svg);
  const resize = new ResizeObserver(measure);
  resize.observe(svg);
  resize.observe(host);
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerdown", press, { passive: true });
  host.addEventListener("pointerup", release, { passive: true });
  host.addEventListener("pointercancel", leave, { passive: true });
  host.addEventListener("pointerleave", leave, { passive: true });
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  media.addEventListener("change", motionChange);
  measure();
  sync();
  document.fonts.ready.then(() => {
    if (!disposed) {
      dirty = true;
      measure();
    }
  });
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    resize.disconnect();
    regionsObserver.disconnect();
    sceneObserver.disconnect();
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerdown", press);
    host.removeEventListener("pointerup", release);
    host.removeEventListener("pointercancel", leave);
    host.removeEventListener("pointerleave", leave);
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("resize", measure);
    document.removeEventListener("visibilitychange", visibility);
    media.removeEventListener("change", motionChange);
  };
}
