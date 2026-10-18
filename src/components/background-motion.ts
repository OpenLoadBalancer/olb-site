import { useSyncExternalStore } from "react";

export const BACKGROUND_MOTION_KEY = "olb-background-motion";
type Mode = "pending" | "enabled" | "disabled" | "reduced";
let choice: boolean | null = null;
let media: MediaQueryList | undefined;
const listeners = new Set<() => void>();
const parse = (value: string | null) =>
  value === "on" ? true : value === "off" ? false : null;
const notify = () => listeners.forEach((listener) => listener());

function initialize() {
  if (media) return;
  media = matchMedia("(prefers-reduced-motion: reduce)");
  try {
    choice = parse(localStorage.getItem(BACKGROUND_MOTION_KEY));
  } catch {
    // Keep a working in-memory preference if storage is blocked.
  }
}
function snapshot(): Mode {
  initialize();
  return choice === null
    ? media!.matches
      ? "reduced"
      : "enabled"
    : choice
      ? "enabled"
      : "disabled";
}
function storage(event: StorageEvent) {
  if (event.key !== BACKGROUND_MOTION_KEY && event.key !== null) return;
  choice = parse(event.newValue);
  notify();
}
function subscribe(listener: () => void) {
  initialize();
  if (!listeners.size) {
    media!.addEventListener("change", notify);
    window.addEventListener("storage", storage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      media!.removeEventListener("change", notify);
      window.removeEventListener("storage", storage);
    }
  };
}
export function setBackgroundMotion(enabled: boolean) {
  initialize();
  choice = enabled;
  try {
    localStorage.setItem(BACKGROUND_MOTION_KEY, enabled ? "on" : "off");
  } catch {
    // The control still works for this session.
  }
  notify();
}
export function useBackgroundMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => "pending" as Mode);
}
export function useAmbientMotion() {
  return useSyncExternalStore(
    subscribe,
    () => {
      initialize();
      return !media!.matches;
    },
    () => false,
  );
}
