/** Distances are CSS pixels, durations are seconds. The DOM pool never grows. */
export const BACKGROUND = {
  maxObjects: 72,
  maxRows: 12,
  maxBursts: 5,
  rays: 8,
  mobileWidth: 760,
  desktop: { objects: 72, columns: 12, fps: 40, radius: 285 },
  mobile: { objects: 12, columns: 2, fps: 24, radius: 160 },
  idleAfter: 4,
  idleFps: 16,
  parallax: 0.22,
  drift: 9,
  force: 76,
  forceCore: 64,
  spring: 7,
  relayLife: 0.6,
  relayLimit: 8,
  burstLife: 2,
  burstRadius: 340,
  trailLife: 0.75,
  maxTrail: 18,
  mergeWindow: 0.16,
  mergeRadius: 32,
  quietSelector:
    "h1,h2,h3,p,pre,a,button,li,.protocol-band span,.hero-footnote,.visual-corner,.visual-foot,.traffic-console,.brand-reference,.brand-tile,.studio-signature,.final-cta,[data-background-quiet]",
} as const;

type Point = { x: number; y: number };
type Region = { left: number; top: number; right: number; bottom: number };
type Shape = Point & {
  seed: number;
  depth: number;
  type: number;
  offset: Point;
  velocity: Point;
  turn: number;
  spin: number;
};
type Relay = { seed: number; arrival: number; power: number; angle: number };
type Burst = Point & {
  born: number;
  variant: number;
  power: number;
  relays: Relay[];
};
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
  "a,button,input,select,textarea,label,summary,[role=button],[contenteditable],.theme-picker,[data-background-ignore]";
const attr = (node: Element, key: string, value: number | string) =>
  node.setAttribute(key, String(value));

export function createSvgBackground(
  svg: SVGSVGElement,
  feedback: SVGSVGElement,
  host: HTMLElement,
) {
  const objects = [...svg.querySelectorAll<SVGGElement>("[data-object]")];
  const glyphs = objects.map((el) => el.querySelector("use")!);
  const routes = [...svg.querySelectorAll<SVGGElement>("[data-route]")].map(
    (el) => ({
      el,
      wire: el.querySelector("[data-wire]")!,
      packet: el.querySelector("[data-packet]")!,
    }),
  );
  const reactive = [
    ...feedback.querySelectorAll<SVGGElement>("[data-reactive]"),
  ].map((el) => ({
    el,
    glyph: el.querySelector("use")!,
    tether: el.querySelector("path")!,
    resonance: el.querySelector("[data-resonance]")!,
  }));
  const halo = feedback.querySelector("[data-pointer]")!;
  const haloRing = halo.querySelector(".pointer-ring")!;
  const trailGradient = feedback.querySelector("[data-trail-gradient]")!;
  const trailGroup = feedback.querySelector("[data-trail]")!;
  const trailLine = feedback.querySelector("[data-trail-line]")!;
  const trailGlow = feedback.querySelector("[data-trail-glow]")!;
  const effects = [
    ...feedback.querySelectorAll<SVGGElement>("[data-burst]"),
  ].map((el) => ({
    el,
    ring: el.querySelector("[data-ring]")!,
    echo: el.querySelector("[data-echo]")!,
    sparks: [...el.querySelectorAll("[data-spark]")],
  }));
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
  let interactive = false;
  const pointer = { x: 0, y: 0, active: false, strength: 0 };
  let trail: (Point & { born: number })[] = [];
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
    const previous = new Map(shapes.map((shape) => [shape.seed, shape]));
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
          offset: previous.get(seed)?.offset ?? { x: 0, y: 0 },
          velocity: previous.get(seed)?.velocity ?? { x: 0, y: 0 },
          turn: previous.get(seed)?.turn ?? 0,
          spin: previous.get(seed)?.spin ?? 0,
        });
        const i = shapes.length - 1;
        attr(
          glyphs[i],
          "href",
          `#${glyphs[i].getAttribute("data-glyph-prefix")}-${names[type]}`,
        );
        attr(reactive[i].glyph, "href", glyphs[i].getAttribute("href")!);
      }
    for (let i = shapes.length; i < objects.length; i++) {
      attr(objects[i], "visibility", "hidden");
      attr(reactive[i].el, "visibility", "hidden");
    }
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
    attr(feedback, "viewBox", `0 0 ${width} ${height}`);
    firstRow = NaN;
    dirty = true;
    draw(performance.now() / 1000);
  }
  // Plan a small, acyclic neighbour cascade once per click, never per frame.
  function relay(p: Point): Relay[] {
    const candidates = shapes
      .map((s) => ({
        seed: s.seed,
        x: s.x + s.offset.x,
        y: s.y - origin + s.offset.y,
      }))
      .filter((s) => s.y > 0 && s.y < height);
    const nearest = candidates.reduce<(typeof candidates)[number] | undefined>(
      (best, s) =>
        !best ||
        Math.hypot(s.x - p.x, s.y - p.y) <
          Math.hypot(best.x - p.x, best.y - p.y)
          ? s
          : best,
      undefined,
    );
    if (!nearest || Math.hypot(nearest.x - p.x, nearest.y - p.y) > radius())
      return [];
    const queue = [
      {
        ...nearest,
        arrival: 0.05 + Math.hypot(nearest.x - p.x, nearest.y - p.y) / 900,
        power: 1,
        angle: Math.atan2(nearest.y - p.y, nearest.x - p.x),
        hop: 0,
      },
    ];
    const visited = new Set([nearest.seed]);
    const limit = mobile ? 4 : BACKGROUND.relayLimit;
    for (let i = 0; i < queue.length && queue.length < limit; i++) {
      const parent = queue[i];
      if (parent.hop >= 3) continue;
      const neighbours = candidates
        .filter((s) => !visited.has(s.seed))
        .map((s) => ({
          s,
          distance: Math.hypot(s.x - parent.x, s.y - parent.y),
        }))
        .filter(
          ({ s, distance }) =>
            distance < (mobile ? 260 : 370) &&
            Math.hypot(s.x - p.x, s.y - p.y) < radius() * 1.8,
        )
        .sort((a, b) => a.distance - b.distance)
        .slice(0, mobile ? 1 : 2);
      for (const { s, distance } of neighbours) {
        const arrival = parent.arrival + 0.12 + distance / 1100;
        if (
          queue.length >= limit ||
          arrival > BACKGROUND.burstLife - BACKGROUND.relayLife
        )
          continue;
        visited.add(s.seed);
        queue.push({
          ...s,
          arrival,
          power: parent.power * 0.72,
          angle: Math.atan2(s.y - parent.y, s.x - parent.x),
          hop: parent.hop + 1,
        });
      }
    }
    return queue.map(({ seed, arrival, power, angle }) => ({
      seed,
      arrival,
      power,
      angle,
    }));
  }
  function draw(now: number, dt = 0) {
    origin = scrollY * BACKGROUND.parallax;
    layout();
    if (dirty && time - lastRegions > 0.06) collectRegions();
    const intro = ease(entered / 0.8);
    svg.style.opacity = String(intro);
    if (interactive) feedback.style.opacity = String(intro);
    bursts = bursts.filter((b) => now - b.born < BACKGROUND.burstLife);
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i],
        node = objects[i];
      let x = shape.x,
        y = shape.y - origin;
      let reaction = 0,
        targetX = 0,
        targetY = 0,
        targetTurn = 0,
        resonance = 0,
        resonanceAge = 0;
      x +=
        Math.sin(time * (0.12 + shape.depth * 0.08) + shape.seed) *
        BACKGROUND.drift *
        shape.depth;
      y +=
        Math.cos(time * (0.09 + shape.depth * 0.05) + shape.seed) *
        BACKGROUND.drift;
      y += Math.sin(scrollY / 900 + shape.seed) * 8 * shape.depth;
      if (y < -50 || y > height + 50) {
        if (node.getAttribute("visibility") !== "hidden")
          attr(node, "visibility", "hidden");
        if (interactive) attr(reactive[i].el, "visibility", "hidden");
        continue;
      }
      if (interactive) {
        const d = Math.hypot(x - pointer.x, y - pointer.y);
        const influence =
          ease(1 - d / quality().radius) *
          ease(d / BACKGROUND.forceCore) *
          pointer.strength;
        const force =
          influence *
          BACKGROUND.force *
          shape.depth *
          (shape.type % 2 ? -0.7 : 1);
        const phase = time * (0.85 + shape.depth * 0.2) + shape.seed;
        const curl = Math.sin(phase) * (mobile ? 45 : 92) * influence;
        const breath = Math.cos(phase) * 30 * influence;
        reaction = ease(1 - d / quality().radius) * pointer.strength;
        if (d > 0.1) {
          const ux = (x - pointer.x) / d,
            uy = (y - pointer.y) / d;
          targetX += ux * (force + breath) - uy * curl;
          targetY += uy * (force + breath) + ux * curl;
          targetTurn += Math.sin(phase + 0.7) * 48 * influence;
        }
        for (const b of bursts) {
          const age = clamp((now - b.born) / BACKGROUND.burstLife);
          const dy = y - b.y,
            dx = x - b.x,
            distance = Math.hypot(dx, dy);
          const push =
            Math.max(0, 1 - Math.abs(distance - ease(age) * radius()) / 85) *
            (1 - age) *
            ease(age / 0.08) *
            ease(distance / BACKGROUND.forceCore) *
            52 *
            b.power;
          reaction = Math.max(reaction, Math.min(1, push / 28));
          if (distance > 0.1) {
            targetX += (dx / distance) * push;
            targetY += (dy / distance) * push;
          }
          for (const signal of b.relays) {
            if (signal.seed !== shape.seed) continue;
            const age = (now - b.born - signal.arrival) / BACKGROUND.relayLife;
            if (age < 0 || age >= 1) continue;
            const pulse = Math.sin(Math.PI * age) ** 2 * signal.power * b.power;
            targetX += Math.cos(signal.angle + age * 1.4) * pulse * 58;
            targetY += Math.sin(signal.angle + age * 1.4) * pulse * 58;
            targetTurn += Math.sin(age * Math.PI * 2) * pulse * 44;
            reaction = Math.max(reaction, Math.min(1, pulse));
            if (pulse > resonance) {
              resonance = pulse;
              resonanceAge = age;
            }
          }
        }
      }
      const travel = Math.hypot(targetX, targetY),
        limit = mobile ? 80 : 140;
      if (travel > limit) {
        targetX *= limit / travel;
        targetY *= limit / travel;
      }
      // Closed-form damped spring: stable at both active and idle frame rates.
      const omega = BACKGROUND.spring,
        decay = Math.exp(-omega * dt);
      for (const axis of ["x", "y"] as const) {
        const target = axis === "x" ? targetX : targetY;
        const displacement = shape.offset[axis] - target;
        const impulse = (shape.velocity[axis] + omega * displacement) * dt;
        shape.offset[axis] = target + (displacement + impulse) * decay;
        shape.velocity[axis] = (shape.velocity[axis] - omega * impulse) * decay;
      }
      const turnDelta = shape.turn - targetTurn;
      const angularImpulse = (shape.spin + omega * turnDelta) * dt;
      shape.turn = targetTurn + (turnDelta + angularImpulse) * decay;
      shape.spin = (shape.spin - omega * angularImpulse) * decay;
      x += shape.offset.x;
      y += shape.offset.y;
      const edge = ease(
        Math.min(y + 25, height + 25 - y, x + 10, width + 10 - x) / 45,
      );
      const rotation =
        shape.turn +
        (shape.type === 1 || shape.type === 4
          ? Math.sin(time * 0.08 + shape.seed) * 10
          : 0);
      attr(node, "visibility", "visible");
      attr(
        node,
        "transform",
        `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(2)}) scale(${(0.6 + shape.depth * 0.55).toFixed(2)})`,
      );
      attr(
        node,
        "opacity",
        (
          edge *
          quiet(x, y) *
          (0.4 + shape.depth * 0.6) *
          (1 - reaction)
        ).toFixed(3),
      );
      const highlight = reactive[i];
      if (reaction < 0.015) {
        if (highlight.el.getAttribute("visibility") !== "hidden")
          attr(highlight.el, "visibility", "hidden");
      } else {
        attr(highlight.el, "visibility", "visible");
        attr(highlight.el, "transform", node.getAttribute("transform")!);
        attr(highlight.el, "opacity", (edge * reaction).toFixed(3));
        attr(highlight.resonance, "opacity", (resonance * 0.65).toFixed(3));
        attr(highlight.resonance, "r", (22 + resonanceAge * 34).toFixed(2));
        const scale = 0.6 + shape.depth * 0.55,
          angle = (-rotation * Math.PI) / 180;
        const dx = pointer.x - x,
          dy = pointer.y - y;
        attr(
          highlight.tether,
          "d",
          `M0 0Q${((dx * Math.cos(angle) - dy * Math.sin(angle) - dy * 0.16) / scale / 2).toFixed(2)} ${((dx * Math.sin(angle) + dy * Math.cos(angle) + dx * 0.16) / scale / 2).toFixed(2)} ${((dx * Math.cos(angle) - dy * Math.sin(angle)) / scale).toFixed(2)} ${((dx * Math.sin(angle) + dy * Math.cos(angle)) / scale).toFixed(2)}`,
        );
        attr(
          highlight.tether,
          "opacity",
          (
            pointer.strength *
            ease(1 - Math.hypot(dx, dy) / quality().radius) *
            0.25
          ).toFixed(3),
        );
      }
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
    if (!interactive) return;
    const tracking = pointer.strength > 0.015;
    attr(halo, "visibility", tracking ? "visible" : "hidden");
    if (tracking) {
      attr(
        halo,
        "transform",
        `translate(${pointer.x.toFixed(2)} ${pointer.y.toFixed(2)})`,
      );
      attr(halo, "opacity", pointer.strength.toFixed(3));
      attr(haloRing, "r", (26 + Math.sin(time * 2.5) * 3).toFixed(2));
    }
    trail = trail.filter((p) => now - p.born < BACKGROUND.trailLife);
    attr(trailGroup, "visibility", trail.length > 1 ? "visible" : "hidden");
    if (trail.length > 1) {
      let d = `M${trail[0].x} ${trail[0].y}`;
      for (let i = 1; i < trail.length - 1; i++)
        d += `Q${trail[i].x} ${trail[i].y} ${(trail[i].x + trail[i + 1].x) / 2} ${(trail[i].y + trail[i + 1].y) / 2}`;
      d += `L${trail.at(-1)!.x} ${trail.at(-1)!.y}`;
      attr(trailGradient, "x1", trail[0].x);
      attr(trailGradient, "y1", trail[0].y);
      attr(trailGradient, "x2", trail.at(-1)!.x);
      attr(trailGradient, "y2", trail.at(-1)!.y);
      attr(trailLine, "d", d);
      attr(trailGlow, "d", d);
      attr(
        trailGroup,
        "opacity",
        (
          (1 - (now - trail.at(-1)!.born) / BACKGROUND.trailLife) *
          pointer.strength
        ).toFixed(3),
      );
    }
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i],
        b = bursts[i];
      if (!b) {
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
        `translate(${b.x.toFixed(2)} ${b.y.toFixed(2)})`,
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
    if (disposed || !visible || document.hidden) return;
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
      draw(stamp / 1000, dt);
    }
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    if (disposed) return;
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    const state = visible && !document.hidden ? "running" : "paused";
    attr(svg, "data-motion", state);
    attr(feedback, "data-motion", interactive ? state : "disabled");
    if (state === "running") raf = requestAnimationFrame(tick);
  }
  function scroll() {
    dirty = true;
    down = null;
  }
  function move(e: PointerEvent) {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10)
      down.moved = true;
    if (e.pointerType === "touch") return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    const previous = trail.at(-1),
      now = performance.now() / 1000;
    if (
      !previous ||
      (Math.hypot(pointer.x - previous.x, pointer.y - previous.y) > 10 &&
        now - previous.born > 0.02)
    ) {
      trail.push({ x: pointer.x, y: pointer.y, born: now });
      if (trail.length > BACKGROUND.maxTrail) trail.shift();
    }
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
      (getSelection()?.isCollapsed ?? true) &&
      performance.now() - down.at < 550
    ) {
      const p = { x: e.clientX, y: e.clientY },
        now = performance.now() / 1000;
      const recent = bursts.at(-1);
      if (
        recent &&
        now - recent.born < BACKGROUND.mergeWindow &&
        Math.hypot(p.x - recent.x, p.y - recent.y) < BACKGROUND.mergeRadius
      )
        recent.power = Math.min(1.4, recent.power + 0.08);
      else {
        bursts.push({
          ...p,
          born: now,
          variant: variant++ % 3,
          power: 1,
          relays: relay(p),
        });
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
  function clearInteractions() {
    bursts = [];
    trail = [];
    down = null;
    pointer.active = false;
    pointer.strength = 0;
    feedback.style.opacity = "0";
    for (const shape of shapes) {
      shape.offset.x = shape.offset.y = 0;
      shape.velocity.x = shape.velocity.y = 0;
      shape.turn = shape.spin = 0;
    }
    for (const el of [
      ...reactive.map((item) => item.el),
      ...effects.flatMap((effect) => [effect.el, ...effect.sparks]),
      halo,
      trailGroup,
    ])
      attr(el, "visibility", "hidden");
  }
  function detachInteractions() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerdown", press);
    window.removeEventListener("pointerup", release);
    window.removeEventListener("pointercancel", leave);
    document.documentElement.removeEventListener("pointerleave", leave);
    window.removeEventListener("blur", leave);
    clearInteractions();
  }
  function setInteractionEnabled(enabled: boolean) {
    if (disposed || interactive === enabled) return;
    interactive = enabled;
    if (enabled) {
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerdown", press, { passive: true });
      window.addEventListener("pointerup", release, { passive: true });
      window.addEventListener("pointercancel", leave, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave, {
        passive: true,
      });
      window.addEventListener("blur", leave);
      lastInput = time;
    } else detachInteractions();
    sync();
  }
  const regionsObserver = new IntersectionObserver(
    (entries) => {
      if (disposed) return;
      for (const e of entries) {
        if (e.isIntersecting) visibleRegions.add(e.target);
        else visibleRegions.delete(e.target);
      }
      dirty = true;
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
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  measure();
  sync();
  document.fonts.ready.then(() => {
    if (!disposed) {
      dirty = true;
      measure();
    }
  });
  return {
    setInteractionEnabled,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      regionsObserver.disconnect();
      sceneObserver.disconnect();
      detachInteractions();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", visibility);
      svg.style.opacity = "0";
      for (const el of [...objects, ...routes.map((route) => route.el)])
        attr(el, "visibility", "hidden");
    },
  };
}
