import { Site, repo } from "@/components/site";
export default function Brand() {
  return (
    <Site
      title="Brand assets — OpenLoadBalancer"
      description="Official OpenLoadBalancer SVG marks, light and dark wordmarks, and brand asset provenance."
      path="/brand/"
    >
      <div className="container">
        <section className="doc-hero">
          <div className="eyebrow accent">OPENLOADBALANCER / BRAND</div>
          <h1>
            A familiar mark.
            <br />A clearer canvas.
          </h1>
          <p>
            The original blue-to-indigo OLB mark, preserved in crisp SVG. Ready
            for light and dark backgrounds.
          </p>
        </section>
        <div className="docs-layout">
          <aside className="docs-sidebar">
            <a href="/">Back to the site →</a>
            <a href="/brand/mark.svg" download>
              Download SVG mark
            </a>
          </aside>
          <article className="docs-content">
            <h2>Made to stay recognizable.</h2>
            <p>
              The rounded square, gradient, and OLB letter proportions follow
              the upstream website favicon. The wordmarks extend the original
              identity for different backgrounds.
            </p>
            <div className="brand-grid">
              <div className="brand-tile">
                <img
                  src="/brand/wordmark-dark.svg"
                  width="360"
                  height="64"
                  alt="OpenLoadBalancer wordmark on dark"
                />
                <a href="/brand/wordmark-dark.svg" download>
                  Download dark-background SVG
                </a>
              </div>
              <div className="brand-tile">
                <img
                  src="/brand/wordmark-light.svg"
                  width="360"
                  height="64"
                  alt="OpenLoadBalancer wordmark on light"
                />
                <a href="/brand/wordmark-light.svg" download>
                  Download light-background SVG
                </a>
              </div>
            </div>
            <h2>Source & attribution</h2>
            <p>
              The OLB symbol is sourced from{" "}
              <a href={`${repo}/blob/main/website-new/public/favicon.svg`}>
                the OpenLoadBalancer product repository
              </a>
              . Geist is designed by Vercel and distributed under the SIL Open
              Font License. The Oxog footer mark and drawing animation are
              adapted from{" "}
              <a href="https://github.com/cobaltdb/cobaltdb-site">
                the CobaltDB site
              </a>{" "}
              at the site owner’s request.
            </p>
            <p>
              OpenLoadBalancer is distributed under Apache 2.0. These assets
              identify the project; they do not imply endorsement of third-party
              services.
            </p>
          </article>
        </div>
      </div>
    </Site>
  );
}
