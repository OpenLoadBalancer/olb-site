# Design and usability review — 2026-10-20

The review preserves the blue palette, existing SVG brand assets, layout identity, Cobalt-style appearance picker, and the Mammoth-reference Oxog banner. It covers the home page, documentation, brand downloads and custom 404 page.

## Corrections

| Area              | Observed problem                                                                              | Result                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mobile navigation | Escape did not close the disclosure; opening it left keyboard focus after its links           | First-link focus, Escape with focus return, outside/focus dismissal and desktop-breakpoint reset                                                       |
| Short viewports   | The appearance panel extended below a 390×320 viewport                                        | A dynamic-viewport height limit with internal scrolling; the navigation receives the same constraint and safe-area allowance                           |
| Copy controls     | Standalone mobile copy buttons were only 22px high                                            | 32px minimum height, resilient toolbar labels, a focus outline inside the code viewport and an announced clipboard-error recovery instruction          |
| Mouse control     | The off-state icon measured 2.46:1 against the light background despite remaining interactive | 3.94:1 after alpha compositing, preserving the crossed-out icon; both themes have regression coverage                                                  |
| Tooltip           | Pointer-only help ignored Escape and disappeared when moving onto its text                    | Hoverable trigger/content region, focus persistence, global Escape while visible, cleaned-up listeners and close timer                                 |
| Typography        | General UI used Geist, platform-dependent technical fonts, and very small functional labels   | Local variable Space Grotesk and JetBrains Mono, central CSS font tokens, clearer documentation text and consistent 12px traffic-panel controls/status |
| Mobile hero       | A desktop-only forced line break left “users” on its own line at 390px                        | Natural mobile wrapping, with the desktop composition preserved                                                                                        |
| Code readability  | Decorative line numbers used the low-contrast border token                                    | The readable secondary-text token replaces it                                                                                                          |

Quicksand is an unused token; it is not forcibly introduced. Oxog keeps its reference typography. Font origins, stable releases, licenses and checked-in hashes are in [FONTS.md](FONTS.md). No UI library, test framework or package dependency was added.

## Browser coverage

- Primary widths: 320, 375, 390, 768, 1024, 1280, 1440, 1920 and 2560 CSS px; the permanent suite also covers 3840px.
- Additional widths immediately around the 360, 520, 600, 680, 760, 800, 1100 and 1920 breakpoints.
- Short/landscape sizes: 320×280, 568×320, 667×375 and 844×390.
- Both themes, normal/reduced motion, system/persisted appearance, blocked storage, cross-tab changes, keyboard navigation and copy success/failure.
- The 640px check uses DPR 2 as a zoom-equivalent CSS viewport. Native browser zoom and physical mobile safe-area/keyboard behavior were not directly tested.

Checks include viewport/heading/control bounds, real screenshots, keyboard interactions, the Chromium accessibility tree, computed text/essential-icon contrast, local asset references and upstream GitHub file targets. These are targeted automated/manual checks, not a full accessibility certification.

## Evidence and limits

The unchanged before/after proofs are retained in `.temp_files/prove_F1_F3_design-ui.mjs` and `.temp_files/prove_F4_motion-icon.mjs`, with the ledger and screenshots under `.temp_files/design-audit-20261020/`. The initial four proofs passed three consecutive times after correction. The tooltip has its own unchanged before/after proof, `.temp_files/prove_F5_motion-tooltip.mjs`. The permanent regressions are in `tests/design-quality.spec.ts`.

- TypeScript and production export passed. The export verifier checked 140 local route/asset references, including the Open Graph card.
- The expanded 58-test run completed all test cases successfully before the tooltip correction; the final targeted design/mouse-control suite covers the tooltip change. CI runs the complete final 59-test suite before deployment.
- Both the initial and final 288-case responsive matrices passed without viewport overflow, clipped headings, out-of-bounds header controls or console errors, including the final visual refinements.
- Twenty-four route/theme/viewport accessibility-tree and keyboard checks found no unnamed interactive controls; skip links moved focus to `main`. Clipboard fallback remained within 320px and announced its recovery instruction.
- Twelve GitHub source/documentation file targets were checked against the upstream repository tree; all existed. Third-party site behavior was not audited.
- Twelve cold-font cases used a gated network delay to force fallback rendering. The largest observed layout-shift sum was **0.00291**; all font requests stayed on the site origin. This is a lab font-loading observation, not a field Core Web Vitals measurement.
- No lint command or accessibility package is configured. Existing Prettier, TypeScript, Playwright and browser APIs were used. Native screen-reader sessions, Safari/Firefox, physical-device testing and battery/hardware performance profiling were not run.
- The initial unrestricted local build failed under host memory pressure. A successful local build limited worker parallelism through an ignored task-only preload; application/CI configuration was not changed to conceal the failure.

There are no forms, data tables, authentication flows or full-screen modal dialogs in this site; those patterns were not invented for the review.
