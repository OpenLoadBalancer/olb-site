"use client";

import { useId, useState } from "react";
import { Mouse, MouseOff } from "lucide-react";
import { setBackgroundMotion, useBackgroundMotion } from "./background-motion";

export function AnimationToggle() {
  const mode = useBackgroundMotion();
  const enabled = mode === "enabled";
  const label = enabled ? "Animasyonları kapat" : "Animasyonları aç";
  const Icon = enabled ? Mouse : MouseOff;
  const id = useId();
  const [tooltip, setTooltip] = useState(false);
  return (
    <span className="motion-control">
      <button
        type="button"
        className="motion-toggle"
        disabled={mode === "pending"}
        aria-label={label}
        aria-pressed={enabled}
        aria-describedby={tooltip ? id : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") setTooltip(true);
        }}
        onPointerLeave={() => setTooltip(false)}
        onFocus={() => setTooltip(true)}
        onBlur={() => setTooltip(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setTooltip(false);
        }}
        onClick={() => {
          setBackgroundMotion(!enabled);
          setTooltip(false);
        }}
      >
        <Icon aria-hidden="true" size={18} strokeWidth={1.6} />
      </button>
      {tooltip && (
        <span className="motion-tooltip" role="tooltip" id={id}>
          {label}
        </span>
      )}
    </span>
  );
}
