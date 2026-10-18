"use client";

import { memo, useEffect, useId, useRef } from "react";
import { BACKGROUND, createSvgBackground } from "./svg-background-scene";
import { useAmbientMotion, useBackgroundMotion } from "./background-motion";

/** Two shared viewport layers: quiet ambient art and unmasked pointer feedback. */
export const SiteBackground = memo(function SiteBackground() {
  const ref = useRef<SVGSVGElement>(null);
  const feedback = useRef<SVGSVGElement>(null);
  const id = useId().replaceAll(":", "");
  const mode = useBackgroundMotion();
  const ambient = useAmbientMotion();
  const running = ambient || mode === "enabled";
  const engine = useRef<ReturnType<typeof createSvgBackground> | null>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!running || !svg?.parentElement || !feedback.current) return;
    const scene = createSvgBackground(svg, feedback.current, svg.parentElement);
    engine.current = scene;
    return () => {
      engine.current = null;
      scene.dispose();
    };
  }, [running]);
  useEffect(() => {
    engine.current?.setInteractionEnabled(mode === "enabled");
  }, [mode, running]);
  const state = running ? "running" : mode;
  return (
    <>
      <svg
        ref={ref}
        className="site-background"
        data-motion={state}
        viewBox="0 0 1440 1000"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <g id={`${id}-fork`}>
            <path d="M-20 0H-7Q2 0 7-9L17-21M-7 0Q2 0 7 9L17 21M-7 0H22M13-21h5v5M13 21h5v-5M17-5l5 5-5 5" />
          </g>
          <g id={`${id}-hex`}>
            <path d="m0-20 17 10v20L0 20-17 10v-20Zm0 7 11 6v14L0 13-11 7V-7ZM0-20v7M17 10l-6-3M-17 10l6-3" />
          </g>
          <g id={`${id}-node`}>
            <rect x="-17" y="-13" width="34" height="26" rx="5" />
            <path d="M-10-5H4M-10 3H4M10-5h.1M10 3h.1M-23 0h6M17 0h6M0-19v6M0 13v6" />
          </g>
          <g id={`${id}-orbit`}>
            <circle r="17" />
            <path d="M-23 0H23M0-23V23" />
            <circle r="5" />
          </g>
          <g id={`${id}-diamond`}>
            <path d="m0-20 20 20L0 20-20 0Zm0 11 9 9-9 9-9-9ZM-28 0h4M24 0h4" />
          </g>
          <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="black" />
            <stop offset=".065" stopColor="white" />
            <stop offset=".935" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </linearGradient>
          <mask id={`${id}-mask`}>
            <rect width="100%" height="100%" fill={`url(#${id}-edge)`} />
          </mask>
        </defs>
        <g
          mask={`url(#${id}-mask)`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g className="background-wires">
            {Array.from({ length: BACKGROUND.maxRows }, (_, i) => (
              <g key={i} data-route="" visibility="hidden">
                <path data-wire="" />
                <path
                  data-packet=""
                  pathLength="1000"
                  strokeDasharray="4 996"
                />
              </g>
            ))}
          </g>
          <g className="background-objects">
            {Array.from({ length: BACKGROUND.maxObjects }, (_, i) => (
              <g key={i} data-object="" visibility="hidden">
                <use href={`#${id}-fork`} data-glyph-prefix={id} />
              </g>
            ))}
          </g>
        </g>
      </svg>
      <svg
        ref={feedback}
        className="site-interactions"
        data-motion={mode === "enabled" ? "running" : mode}
        viewBox="0 0 1440 1000"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id={`${id}-light`}>
            <stop offset="0" stopColor="currentColor" stopOpacity=".12" />
            <stop offset=".35" stopColor="currentColor" stopOpacity=".07" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={`${id}-trail`}
            data-trail-gradient=""
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="1" stopColor="currentColor" />
          </linearGradient>
        </defs>
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g className="interaction-objects">
            {Array.from({ length: BACKGROUND.maxObjects }, (_, i) => (
              <g key={i} data-reactive="" visibility="hidden">
                <path data-tether="" />
                <circle data-resonance="" r="22" opacity="0" />
                <use href={`#${id}-fork`} data-glyph-prefix={id} />
              </g>
            ))}
          </g>
          <g data-pointer="" visibility="hidden">
            <circle r="145" fill={`url(#${id}-light)`} stroke="none" />
            <circle
              r="24"
              className="pointer-ring"
              strokeDasharray="42 7 5 7"
            />
            <path d="M-5 0H5M0-5V5" opacity=".2" />
          </g>
          <g
            className="interaction-trail"
            visibility="hidden"
            data-trail=""
            stroke={`url(#${id}-trail)`}
          >
            <path data-trail-glow="" strokeWidth="9" opacity=".07" />
            <path data-trail-line="" strokeWidth="1.6" opacity=".45" />
          </g>
          <g className="background-effects">
            {Array.from({ length: BACKGROUND.maxBursts }, (_, i) => (
              <g key={i} data-burst="" visibility="hidden">
                <circle data-ring="" r="0" />
                <circle data-echo="" r="0" strokeDasharray="3 8" />
                {Array.from({ length: BACKGROUND.rays }, (_, n) => (
                  <path key={n} data-spark="" d="M-7 0H0m-3-3 3 3-3 3" />
                ))}
              </g>
            ))}
          </g>
        </g>
      </svg>
    </>
  );
});
