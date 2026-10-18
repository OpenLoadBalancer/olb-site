# Content, design, and asset provenance

Research performed 2026-10-18. Product facts are based on [OpenLoadBalancer](https://github.com/openloadbalancer/olb) revision **dbde63563bc2734288cb671af5ed17d56b57fbd3**: README, minimal configuration, CLI implementation, Dockerfile, algorithms, configuration, architecture, WAF, clustering, MCP, production, and API documentation.

The current README says **minimal-dependency**, specifically the Go standard library and `golang.org/x/{crypto,net,text}`. Existing website metadata still says zero-dependency; the new site follows the current product source. No invented benchmarks, adoption counts, endorsements, or uptime claims are included. The traffic explorer and tiny distribution chart are explicitly marked illustrative.

The published v1.0.0 Windows binary (SHA256 `d2f14b87fd2569674e646e04eff6f456b2e44c6bec9645513482c92e26464f83`, matched against release checksums) validated the sample configuration. A local proof started two HTTP backends and the real binary, confirmed the admin API, then sent six successful proxied requests reaching both backends. Port 8080 was already in use on the host, so only proxy/admin ports were changed to 18080/19090 for the runtime proof.

The README's positional `olb config validate olb.yaml` argument is ignored by the CLI; the site uses the implementation-supported `olb config validate --config olb.yaml`. Published executable commands bind operational requests to the example's actual admin port. `olb top` and `olb cluster status` are mentioned in upstream README but are not registered in `cmd/olb/main.go` or available in the published binary, so the site does not present them as working commands. Docker examples explicitly invoke `start --config` to match the CLI entrypoint and explain that container backends require reachable service addresses. Docker execution itself was not verified locally.

## Design references

All seven reference websites were inspected through their HTML and stylesheets, including layouts, typography, theme styles, SVG/animation sources, breakpoints, and reduced-motion rules. CobaltDB and the new implementation were also inspected in the browser.

| Reference               | Observed design ideas                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| https://dockrouter.com  | Warm palette, asymmetric hero, route explorer, proportional ultrawide spacing, workflow-first explanation.                      |
| https://uwaserver.com   | Dashboard/configuration narrative, strong code examples, clear install flow.                                                    |
| https://nothingdns.com  | Network-native illustrations and monochrome structure with meaningful status accents.                                           |
| https://cobaltdb.dev    | Theme preview cards; architectural SVG narrative; varied section composition; exact Oxog geometry and draw animation.           |
| https://guardianwaf.com | Request/defense pipeline, technical depth, explicit qualification of performance claims.                                        |
| https://anubis.watch    | Editorial contrast, distinctive typography, clear process narrative. Live TLS could not be validated during reference research. |
| https://cachestorm.com  | Engine illustration, restrained technical palette, configuration-led quick start and responsive layout.                         |

The new site uses its own graphite/cream and coral visual direction with original request-flow and pipeline SVGs. Its five-way routing identity is reconstructed from the blue routing-logo reference supplied by the owner. Shared container width is 1720px, with centrally managed fluid gutters and section spacing. Mobile architecture uses a vertical SVG instead of clipping the desktop diagram.

## Assets

- `public/brand/mark.svg` and `public/favicon.svg`: editable vector reconstruction of the blue five-arrow routing logo supplied by the project owner. One entry branches into five outward arrows, framed by an open network enclosure. Geometry is in `scripts/brand-geometry.mjs`; exports include a brighter dark-background mark, monochrome variants, transparent PNG, Apple touch icon, horizontal wordmarks, and stacked SVG/PNG lockups with the OLB subtitle. This replaces the earlier mascot identity. No bitmap is embedded in the SVG.
- Light/dark wordmarks and `public/og.svg` / `public/og.png`: created for this site. Regeneration source: `scripts/create-assets.mjs`; the 1200×630 social card composition is defined in `scripts/social-card.mjs` with the blue routing mark, navy background, and readable product copy.
- Traffic and architecture diagrams: original SVG in `src/components/traffic.tsx`. Reduced-motion support disables animated flow.
- Oxog studio footer: adapted from NineDeploy's live footer and `src/components/brand.tsx` / `footer.tsx` at source revision `750b01aeed95fc3ec2ce34c7449e4f43039838d9`. Preserves the exact 200×130 SVG, #ed0878 pink, #692d91 / #a35adb purple, 1.6s signature drawing with 0/.25/.5/.9s delays, studio wordmark, surrounding panel, and project links. Uses native IntersectionObserver/CSS and respects reduced motion.
- Theme menu: the CobaltDB theme picker component and CSS from revision `0b25719fef274c577ea4e3662a7e63dac2199c9c`, checked against its live menu. Preserves its icon/name/chevron trigger, 328px dialog, miniature window previews, blue selection/check indicators, Manrope typeface, status text, opening transition, radio keyboard controls, focus restoration, and outside dismissal. Only theme storage integration, local CSS variable scope, and header-relative mobile placement are adapted to this site. Lucide 1.59.0 and Manrope 5.3.0 are pinned; Manrope's OFL is retained in `public/fonts/Manrope-OFL.txt`.
- `public/fonts/geist-latin.woff2`: Geist Latin font distributed in the pinned official Next.js package; SIL OFL license from https://github.com/vercel/geist-font/blob/main/OFL.txt is retained as `public/fonts/OFL.txt`.
- `public/install.sh` and `public/install.ps1`: unmodified upstream installers from the pinned product revision. Exported copies are verified against their checked-in source hashes. Installers were not executed against the user's system.

Raw reference snapshots and local proof logs are retained in ignored `.temp_files/` task storage and are not shipped to Pages.
