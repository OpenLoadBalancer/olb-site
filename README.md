# OpenLoadBalancer website

English product website for [OpenLoadBalancer](https://github.com/openloadbalancer/olb), published at **https://openloadbalancer.dev** from this repository through GitHub Pages.

## Develop

Use Node **26.12.0** and npm **12.2.0** (exact engine checks are enabled).

```sh
npm install --global npm@12.2.0
npm ci
npm run dev
```

## Verify and preview the production export

```sh
npm run typecheck
npm run build
npm run verify:export
npx --no-install playwright install chromium
npm test
npm run preview
```

The preview serves `out/` at http://127.0.0.1:4173. Tests cover three routes at 375, 768, 1024, 1440, 1920, 2560, and 3840 pixels in both themes, plus user interactions. Full-page screenshots are written to `test-results/screenshots/`.

`npm run versions:check` checks direct dependencies, npm, Node, and the lockfile against official registries. This is an explicit maintenance check; a future upstream release can make it fail without affecting the reproducibility of the pinned build.

## Architecture

- Next.js Pages Router with `output: 'export'`, trailing directory routes, and TypeScript. No server runtime or runtime environment variables are needed.
- Pages Router deliberately uses the installed stable React release; the App Router bundles React canary internally according to the current Next.js installation documentation.
- Native CSS animations, real SVG request diagrams, and React state for the illustrative traffic explorer. It does not connect to a running load balancer or represent measured traffic.
- Light/dark/system preference is applied synchronously in the document head before paint, persists in localStorage, and follows OS and cross-tab changes.
- Local Geist, Manrope, and Space Grotesk fonts under the SIL OFL license. Fonts are served with the site; there are no third-party font or CDN requests.
- A reference-based five-way traffic-routing SVG mark, monochrome variants, light/dark wordmarks, PNG Open Graph artwork, sitemap, robots, custom 404, and brand downloads are included.

## Deploy

Pushing `main` runs `.github/workflows/pages.yml`: clean lockfile install, TypeScript, production export, exported-link checks, and all Chromium tests before uploading and deploying the Pages artifact. Pull requests run the same checks without deploying. Actions use verified stable release commit SHAs; see [dependency evidence](docs/DEPENDENCIES.md).

Pages must use **GitHub Actions** as its build source, custom domain **openloadbalancer.dev**, and HTTPS enforcement. `public/CNAME` and `public/.nojekyll` are copied to the export root. The custom domain uses root-relative assets with no repository `basePath`.

The apex DNS records should point to GitHub Pages:

```text
A     185.199.108.153
A     185.199.109.153
A     185.199.110.153
A     185.199.111.153
AAAA  2606:50c0:8000::153
AAAA  2606:50c0:8001::153
AAAA  2606:50c0:8002::153
AAAA  2606:50c0:8003::153
```

The website contains a getting-started guide and links to authoritative upstream documentation. Product claims and installers are sourced from a pinned product revision; see [research and provenance](docs/RESEARCH.md). Installer scripts are served byte-for-byte from that revision rather than rewritten.

`scripts/create-assets.mjs` regenerates the original SVG logo, monochrome variants, transparent PNG and Apple icon, wordmarks, preview board, and the 1200×630 Open Graph PNG using pinned Sharp. Run it with `node scripts/create-assets.mjs`, then rebuild.
