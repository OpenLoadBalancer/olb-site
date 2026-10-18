import { Site } from "@/components/site";
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
            Meet your
            <br />
            traffic controller.
          </h1>
          <p>
            A friendly face for serious infrastructure. Our traffic-controller
            gopher brings an open-source spirit to every route.
          </p>
        </section>
        <div className="docs-layout">
          <aside className="docs-sidebar">
            <a href="/">Back to the site →</a>
            <a href="/brand/mark.svg" download>
              Download SVG mark
            </a>
            <a href="/brand/mark.png" download>
              Download transparent PNG
            </a>
            <a href="/brand/mark-mono-dark.svg" download>
              Download dark mono SVG
            </a>
            <a href="/brand/mark-mono-light.svg" download>
              Download light mono SVG
            </a>
          </aside>
          <article className="docs-content">
            <h2>A clear path. A character of its own.</h2>
            <p>
              The turquoise gopher and orange hard hat celebrate the project's
              traffic-controller mascot. A three-way route on the helmet turns
              one incoming connection into a balanced flow. Clean shapes and a
              strong outline keep the mark recognizable at small sizes.
            </p>
            <img
              className="brand-reference"
              src="/brand/preview.png"
              width="1200"
              height="640"
              alt="Original traffic-controller gopher logo on dark and light backgrounds, with small-size examples"
            />
            <div className="brand-grid">
              <div className="brand-tile">
                <img
                  src="/brand/wordmark-dark.svg"
                  width="420"
                  height="80"
                  alt="OpenLoadBalancer wordmark on dark"
                />
                <a href="/brand/wordmark-dark.svg" download>
                  Download dark-background SVG
                </a>
              </div>
              <div className="brand-tile">
                <img
                  src="/brand/wordmark-light.svg"
                  width="420"
                  height="80"
                  alt="OpenLoadBalancer wordmark on light"
                />
                <a href="/brand/wordmark-light.svg" download>
                  Download light-background SVG
                </a>
              </div>
            </div>
            <h2>Source & attribution</h2>
            <p>
              This logo is original SVG artwork created for OpenLoadBalancer,
              inspired by the project's illustrated traffic-controller gopher.
              Its geometry is shared across the favicon, transparent PNG,
              monochrome marks, and wordmarks. Geist is designed by Vercel and
              distributed under the SIL Open Font License. The Oxog footer mark
              and drawing animation are adapted from{" "}
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
