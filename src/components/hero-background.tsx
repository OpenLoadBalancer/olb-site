"use client";

import { useEffect, useRef } from "react";
import { createRoutingScene } from "./hero-scene";

/** Decorative only: interaction stays on the hero, never on the canvas. */
export function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (canvas && host) return createRoutingScene(canvas, host);
  }, []);
  return <canvas ref={ref} className="hero-background" aria-hidden="true" />;
}
