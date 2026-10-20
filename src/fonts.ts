import localFont from "next/font/local";

export const spaceGrotesk = localFont({
  src: "../public/fonts/space-grotesk-variable.woff2",
  display: "swap",
  weight: "300 700",
  fallback: ["Arial", "sans-serif"],
});

export const jetbrainsMono = localFont({
  src: "../public/fonts/jetbrains-mono-variable.woff2",
  display: "swap",
  weight: "100 800",
  fallback: ["Courier New", "monospace"],
  adjustFontFallback: false,
});
