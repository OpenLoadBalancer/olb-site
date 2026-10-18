import type { AppProps } from "next/app";
import "@fontsource-variable/manrope";
import "@/styles/globals.css";
import "@/styles/studio.css";
import "@/styles/theme-picker.css";
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
