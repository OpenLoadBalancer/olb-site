"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Mouse, MouseOff } from "lucide-react";
import { setBackgroundMotion, useBackgroundMotion } from "./background-motion";

export function AnimationToggle() {
  const mode = useBackgroundMotion();
  const enabled = mode === "enabled";
  const label = enabled ? "Disable mouse effects" : "Enable mouse effects";
  const Icon = enabled ? Mouse : MouseOff;
  const id = useId();
  const [tooltip, setTooltip] = useState(false);
  const hovered = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const show = () => {
    clearTimeout(closeTimer.current);
    setTooltip(true);
  };
  const dismiss = () => {
    clearTimeout(closeTimer.current);
    setTooltip(false);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => {
    if (!tooltip) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimeout(closeTimer.current);
        setTooltip(false);
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [tooltip]);
  return (
    <span
      className="motion-control"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          hovered.current = true;
          show();
        }
      }}
      onPointerLeave={(event) => {
        hovered.current = false;
        clearTimeout(closeTimer.current);
        if (event.currentTarget.contains(document.activeElement)) return;
        closeTimer.current = setTimeout(() => setTooltip(false), 150);
      }}
      onFocus={show}
      onBlur={() => {
        if (!hovered.current) dismiss();
      }}
    >
      <button
        type="button"
        className="motion-toggle"
        disabled={mode === "pending"}
        aria-label={label}
        aria-pressed={enabled}
        aria-describedby={tooltip ? id : undefined}
        onClick={() => {
          setBackgroundMotion(!enabled);
          dismiss();
        }}
      >
        <Icon aria-hidden="true" size={18} strokeWidth={1.6} />
      </button>
      {tooltip && (
        <span className="motion-tooltip-region">
          <span className="motion-tooltip" role="tooltip" id={id}>
            {label}
          </span>
        </span>
      )}
    </span>
  );
}
