# Local font sources

Verified on 2026-10-20 against the official upstream stable releases:

- Space Grotesk 2.0.0: https://github.com/floriankarsten/space-grotesk/releases/tag/2.0.0
- JetBrains Mono 2.304: https://github.com/JetBrains/JetBrainsMono/releases/tag/v2.304

The variable source fonts were obtained from Google's official fonts repository (`ofl/spacegrotesk/SpaceGrotesk[wght].ttf`, font version 2.000) and the tagged JetBrains repository (`fonts/variable/JetBrainsMono[wght].ttf`, version 2.304). FontTools 4.66.1 converted the complete fonts to WOFF2 without subsetting. Both contain all Turkish characters (`İıĞğŞşÇçÖöÜü`). Their SIL OFL licenses are included in `public/fonts/`.

Checked-in WOFF2 SHA256:

```text
780f179ca6d752190534d8867d24792273cf2d2b3b35f71618b1399fb4c63c3e  space-grotesk-variable.woff2
bb8e043277b11c83fd3a1b8430ec8aece3e46f4704954c91e4c8a250c5a9d454  jetbrains-mono-variable.woff2
```

`src/fonts.ts` uses `next/font/local`. The custom App exposes its generated font families through stable `--font-space-grotesk` and `--font-jetbrains` tokens; product CSS never selects generated class names. Space Grotesk is the interface default, JetBrains Mono is used for code and technical values. Quicksand is an unused token and is not downloaded. The reference Oxog banner retains its original Manrope and Space Grotesk typography.

There are no build-time or runtime requests to a font service. No UI library or additional package dependency was introduced.
