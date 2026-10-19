# Stable dependency evidence

Verified on **2026-10-18**, using the official npm registry `latest` dist-tags, Node release index, current framework documentation, and GitHub releases APIs. No alpha, beta, RC, canary, or preview package versions are selected. All direct versions are exact; `package-lock.json` records transitive versions and integrity hashes.

| Component                   | Stable version | Official source                                                                                       |
| --------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| Next.js                     | 16.4.2         | https://nextjs.org/docs/pages and https://registry.npmjs.org/next/latest                              |
| React / React DOM           | 19.3.1         | https://react.dev/versions and https://registry.npmjs.org/react/latest                                |
| TypeScript                  | 7.0.2          | https://www.typescriptlang.org/download/ and https://registry.npmjs.org/typescript/latest             |
| Node.js                     | 26.12.0        | https://nodejs.org/dist/index.json                                                                    |
| npm                         | 12.2.0         | https://registry.npmjs.org/npm/latest                                                                 |
| Playwright Test             | 1.64.1         | https://registry.npmjs.org/@playwright/test/latest                                                    |
| Node types                  | 26.6.5         | https://registry.npmjs.org/@types/node/latest                                                         |
| React / React DOM types     | 19.3.0         | https://registry.npmjs.org/@types/react/latest and https://registry.npmjs.org/@types/react-dom/latest |
| Sharp                       | 0.35.5         | https://registry.npmjs.org/sharp/latest                                                               |
| Prettier                    | 3.9.10         | https://registry.npmjs.org/prettier/latest                                                            |
| Lucide React                | 1.59.0         | https://registry.npmjs.org/lucide-react/latest                                                        |
| Manrope variable font       | 5.3.0          | https://registry.npmjs.org/@fontsource-variable/manrope/latest                                        |
| Space Grotesk variable font | 5.3.0          | https://registry.npmjs.org/@fontsource-variable/space-grotesk/latest                                  |

Space Grotesk was additionally verified against its official npm `latest` dist-tag on **2026-10-19** for the Oxog footer banner. Its version and integrity are recorded in the lockfile.

Node's official Windows binary was checked against the published SHA256SUMS before local installation in ignored task storage. Local install, typechecking, build, export, and browser tests run under this Node and npm pair. `engine-strict=true` prevents accidental installs with a different toolchain.

Next's declared React peer range accepts React 19.3.1; its Node minimum is 20.9.0. Sharp accepts Node >=20.9.0. The chosen Node 26.12.0 is a stable Current release, not a prerelease; it is intentionally newer than the LTS line to satisfy the latest-stable requirement.

The [official installation guide](https://nextjs.org/docs/app/getting-started/installation) states that App Router uses built-in React canary releases. This project uses the supported Pages Router to use the installed stable React. Static export is configured using `output: 'export'`; the removed `next export` command is not used. There are no server actions, server-only route handlers, dynamic runtime APIs, or image optimization server.

## GitHub Actions

Each version below was obtained from `GET /repos/actions/NAME/releases/latest`, then resolved through the corresponding official commit API. The workflow pins the full commit SHA with its release version in a comment.

| Action                        | Stable release | Commit                                   |
| ----------------------------- | -------------- | ---------------------------------------- |
| actions/checkout              | v7.0.1         | 3d3c42e5aac5ba805825da76410c181273ba90b1 |
| actions/setup-node            | v7.1.0         | 949feb2413d6458794dcd2491c4babbbce0c15c1 |
| actions/configure-pages       | v6.0.0         | 45bfe0192ca1faeb007ade9deae92b16b8254a0d |
| actions/upload-pages-artifact | v5.0.0         | fc324d3547104276b827a68afc52ff2a11cc49c9 |
| actions/deploy-pages          | v5.0.1         | 368f82528645a54fb793d4d04e342629a3f51346 |

Runner: `ubuntu-26.04`, listed as an available supported image in the official [runner image table](https://github.com/actions/runner-images#available-images). It is newer than the image currently assigned to `ubuntu-latest`.

Deployment follows the [official custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Read permission is global; `pages: write` and `id-token: write` are restricted to the deployment job. Fork/PR builds cannot deploy.
