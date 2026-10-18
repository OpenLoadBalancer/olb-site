import { Site } from "@/components/site";
export default function Brand() {
  return (
    <Site
      title="Brand assets — OpenLoadBalancer"
      description="Download OpenLoadBalancer logos in SVG and PNG, with versions for light and dark backgrounds."
      path="/brand/"
    >
      <div className="container">
        <section className="doc-hero">
          <div className="eyebrow accent">OPENLOADBALANCER / BRAND</div>
          <h1>
            One entry.
            <br />
            Every direction.
          </h1>
          <p>
            The OpenLoadBalancer logo, ready for your website, article, or
            presentation. Download SVG and transparent PNG files below.
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
            <a href="/brand/logo-light.svg" download>
              Download stacked SVG logo
            </a>
            <a href="/brand/logo-light.png" download>
              Download stacked PNG logo
            </a>
          </aside>
          <article className="docs-content">
            <h2>Choose the right version.</h2>
            <p>
              Use the blue logo on light backgrounds and the lighter version on
              dark backgrounds. Keep its proportions and leave a little space
              around it. SVG works best for the web; PNG is ready for slides and
              social posts.
            </p>
            <img
              className="brand-reference"
              src="/brand/preview.png"
              width="1200"
              height="640"
              alt="Blue five-way routing logo on dark and light backgrounds, with small-size examples"
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
          </article>
        </div>
      </div>
    </Site>
  );
}
