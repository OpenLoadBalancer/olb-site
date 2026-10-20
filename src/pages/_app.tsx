import type { AppProps } from "next/app";
import { spaceGrotesk, jetbrainsMono } from "@/fonts";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "@/styles/globals.css";
import "@/styles/studio.css";
import "@/styles/theme-picker.css";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-space-grotesk: ${spaceGrotesk.style.fontFamily};
          --font-jetbrains: ${jetbrainsMono.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
