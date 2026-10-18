import { useState } from "react";
import { Site, Code, SectionTitle, Arrow, repo, docs } from "@/components/site";
import { TrafficDiagram, ArchitectureDiagram } from "@/components/traffic";
import { sampleConfig } from "@/content";
const installs = {
  "Linux / macOS": "curl -fsSL https://openloadbalancer.dev/install.sh | sh",
  Windows: "irm https://openloadbalancer.dev/install.ps1 | iex",
  Homebrew: "brew tap openloadbalancer/olb\nbrew install olb",
  Docker:
    'docker pull ghcr.io/openloadbalancer/olb:latest\ndocker run --rm -p 8080:8080 \\\n  -v "$PWD/olb.yaml:/etc/olb/configs/olb.yaml:ro" \\\n  ghcr.io/openloadbalancer/olb:latest \\\n  start --config /etc/olb/configs/olb.yaml',
};
export default function Home() {
  const [platform, setPlatform] =
    useState<keyof typeof installs>("Linux / macOS");
  return (
    <Site>
      <section className="hero container">
        <div className="hero-copy">
          <a href={`${repo}/releases`} className="release-pill">
            <span className="status-dot" /> BUILT IN GO. OPEN BY DESIGN.{" "}
            <Arrow />
          </a>
          <h1>
            Your traffic.
            <br />
            Your{" "}
            <span className="accent-word">
              rules.
              <svg viewBox="0 0 380 20" aria-hidden="true">
                <path d="M3 13Q168-5 376 10M30 18Q180 5 330 14" />
              </svg>
            </span>
          </h1>
          <p className="hero-description">
            The clear path between your users
            <br className="desktop-break" /> and your infrastructure.
          </p>
          <p className="hero-detail">
            Route, protect, and observe your traffic with a minimal-dependency
            L4/L7 load balancer. One Go binary. Full control.
          </p>
          <div className="hero-buttons">
            <a className="button primary" href="#quick-start">
              Get started <Arrow />
            </a>
            <a className="button secondary" href={repo}>
              Explore on GitHub <Arrow diagonal />
            </a>
          </div>
          <div className="hero-footnote">
            <span>HTTP / HTTPS</span>
            <i /> <span>TCP / UDP</span>
            <i />
            <span>APACHE 2.0</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-corner">REQUEST IN. POSSIBILITY OUT.</div>
          <TrafficDiagram />
          <div className="visual-foot">
            <span>YOUR INFRASTRUCTURE, CONNECTED.</span>
            <span>
              01 — 03 <span className="accent">●</span>
            </span>
          </div>
        </div>
      </section>
      <div className="protocol-band">
        <div className="container">
          <span>Speaks your stack.</span>
          <div>
            <span>HTTP / 2</span>
            <span>WebSocket</span>
            <span>gRPC</span>
            <span>Server-Sent Events</span>
            <span>TCP & UDP</span>
            <span>SNI</span>
          </div>
        </div>
      </div>
      <section className="section container" id="features">
        <div className="section-intro">
          <SectionTitle
            number="01"
            label="BUILT FOR THE TRAFFIC AHEAD"
            title={
              <>
                Less to operate.
                <br />
                More under control.
              </>
            }
          >
            A focused data plane. A complete set of tools. Everything you need
            to put your services on the right path.
          </SectionTitle>
          <a className="text-link" href={`${repo}#features`}>
            Explore all capabilities <Arrow diagonal />
          </a>
        </div>
        <div className="feature-grid">
          <article className="feature-featured">
            <div className="feature-icon">⇄</div>
            <span className="eyebrow">INTELLIGENT DISTRIBUTION</span>
            <h3>
              The right backend.
              <br />
              Every single time.
            </h3>
            <p>
              Choose from 16 balancing algorithms. Spread traffic evenly, follow
              the fewest connections, or keep sessions on a consistent backend.
            </p>
            <div className="algorithm-cloud">
              <span>round_robin</span>
              <span>least_connections</span>
              <span>maglev</span>
              <span>ip_hash</span>
              <span>peak_ewma</span>
              <a href={`${docs}/algorithms.md`}>
                + explore algorithms <Arrow />
              </a>
            </div>
            <svg
              viewBox="0 0 440 100"
              aria-hidden="true"
              className="mini-chart"
            >
              <path d="M0 80H440M0 50H440M0 20H440" stroke="var(--border)" />
              <path
                d="M0 75 25 75 45 40 65 58 90 25 110 42 140 35 165 60 190 25 220 32 245 15 270 35 300 22 325 43 350 28 380 12 410 22 440 5"
                stroke="var(--accent)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <span className="illustration-label">
              ILLUSTRATIVE TRAFFIC DISTRIBUTION
            </span>
          </article>
          <article>
            <div className="feature-icon">⌁</div>
            <h3>A healthier path forward.</h3>
            <p>
              Active and passive health checks, circuit breakers, and graceful
              draining keep unhealthy backends out of rotation.
            </p>
            <a className="text-link" href={`${docs}/configuration.md`}>
              Health & resilience <Arrow />
            </a>
          </article>
          <article>
            <div className="feature-icon shield-icon">◇</div>
            <h3>Protection at the edge.</h3>
            <p>
              TLS termination, automatic ACME certificates, mTLS, and a
              six-layer WAF with rate limiting and attack detection.
            </p>
            <a className="text-link" href={`${docs}/waf.md`}>
              Meet the WAF <Arrow />
            </a>
          </article>
          <article>
            <div className="feature-icon">⌘</div>
            <h3>See what’s happening.</h3>
            <p>
              A built-in web dashboard, Prometheus metrics, and structured logs.
              Visibility without another control plane.
            </p>
            <a className="text-link" href={`${docs}/api.md`}>
              Observability & API <Arrow />
            </a>
          </article>
          <article>
            <div className="feature-icon">⌬</div>
            <h3>Ready for your next node.</h3>
            <p>
              Raft consensus and SWIM gossip coordinate your cluster. Discover
              services through DNS, Consul, Docker, or files.
            </p>
            <a className="text-link" href={`${docs}/clustering.md`}>
              Explore clustering <Arrow />
            </a>
          </article>
        </div>
      </section>
      <section className="architecture-section section" id="architecture">
        <div className="container">
          <div className="section-intro">
            <SectionTitle
              number="02"
              label="A CLEAR LINE OF SIGHT"
              title={
                <>
                  One binary.
                  <br />A connected system.
                </>
              }
            >
              From the first connection to the final backend, a pipeline you can
              understand, configure, and make your own.
            </SectionTitle>
            <span className="technical-stamp">
              PURE GO
              <br />
              <strong>L4 + L7</strong>
            </span>
          </div>
          <div className="architecture-wrap">
            <ArchitectureDiagram />
          </div>
          <div className="architecture-details">
            <article>
              <span>01 / DATA PLANE</span>
              <h3>Traffic takes the direct route.</h3>
              <p>
                Listeners accept connections. Middleware applies policy. Host,
                path, and SNI routing select a pool; the balancer selects a
                healthy backend.
              </p>
            </article>
            <article>
              <span>02 / CONTROL PLANE</span>
              <h3>Operations stay within reach.</h3>
              <p>
                Reload configuration through SIGHUP or the admin API. Inspect
                services in the dashboard, query the admin API, or connect an AI
                agent through MCP.
              </p>
            </article>
            <a
              className="architecture-link"
              href={`${docs}/architecture-decisions.md`}
            >
              Go deeper into
              <br />
              the architecture <Arrow diagonal />
            </a>
          </div>
        </div>
      </section>
      <section className="section container use-cases" id="use-cases">
        <SectionTitle
          number="03"
          label="YOUR STACK. YOUR SCALE."
          title={
            <>
              A good fit.
              <br />
              From first service to many.
            </>
          }
        />
        <div className="use-case-list">
          {[
            [
              "01",
              "Give your APIs a front door.",
              "Route by host and path, terminate TLS, and apply rate limits before requests reach your application.",
              "API gateways",
            ],
            [
              "02",
              "Keep real-time connections moving.",
              "Proxy WebSockets, gRPC, and server-sent events. Use connection-aware balancing for long-lived traffic.",
              "Real-time services",
            ],
            [
              "03",
              "Make change part of the flow.",
              "Discover new backends, drain existing ones, and mirror a percentage of requests to a staging pool.",
              "Service operations",
            ],
          ].map(([n, title, body, tag]) => (
            <article key={n}>
              <span className="case-number">{n}</span>
              <div>
                <span className="eyebrow">{tag}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
              <Arrow diagonal />
            </article>
          ))}
        </div>
      </section>
      <section className="quick-section section" id="quick-start">
        <div className="container quick-grid">
          <div className="quick-copy">
            <SectionTitle
              number="04"
              label="FROM ZERO TO ROUTING"
              title={
                <>
                  A few lines.
                  <br />
                  An open road.
                </>
              }
            >
              Install the binary, point it at your services, and start sending
              traffic.
            </SectionTitle>
            <div
              className="install-tabs"
              role="group"
              aria-label="Installation platform"
            >
              {(Object.keys(installs) as (keyof typeof installs)[]).map(
                (name) => (
                  <button
                    key={name}
                    aria-pressed={name === platform}
                    onClick={() => setPlatform(name)}
                  >
                    {name}
                  </button>
                ),
              )}
            </div>
            <Code label={`Install · ${platform}`} code={installs[platform]} />
            {platform === "Docker" && (
              <p className="docker-note">
                Use backend addresses reachable from the container. The loopback
                examples below are for a local binary; replace them with your
                service hostnames for Docker.
              </p>
            )}
            <ol className="quick-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Install OpenLoadBalancer</strong>
                  <p>
                    Or download a prebuilt binary from{" "}
                    <a href={`${repo}/releases`}>
                      GitHub Releases <Arrow diagonal />
                    </a>
                    .
                  </p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Make it yours</strong>
                  <p>
                    Save this as <code>olb.yaml</code>. Replace the backend
                    addresses with your services. Each should expose{" "}
                    <code>/health</code>.
                  </p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Validate. Start. Connect.</strong>
                  <p>
                    Use port 8080 for traffic and localhost:9090 for the admin
                    interface.
                  </p>
                </div>
              </li>
            </ol>
            <Code
              label="Start routing"
              code={
                "olb config validate --config olb.yaml\nolb start --config olb.yaml"
              }
            />
            <a href="/docs/" className="text-link">
              Read the complete getting started guide <Arrow />
            </a>
          </div>
          <div className="config-column">
            <div className="config-caption">
              <span className="status-dot" /> SMALL CONFIG. REAL CAPABILITY.
            </div>
            <Code label="olb.yaml" code={sampleConfig} numbered />
            <div className="config-note">
              <span>YAML</span>
              <span>JSON</span>
              <span>TOML</span>
              <span>HCL</span>
              <p>Choose the format that fits your workflow.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section container ecosystem">
        <SectionTitle
          number="05"
          label="OPEN ALL THE WAY DOWN"
          title={
            <>
              Infrastructure you can inspect.
              <br />
              And help shape.
            </>
          }
        >
          Read the source. Ask a question. Ship a contribution. OpenLoadBalancer
          is Apache 2.0 licensed, with its development happening in the open.
        </SectionTitle>
        <div className="ecosystem-links">
          <a href={repo}>
            <span>⌘</span>
            <div>
              <h3>Explore the code</h3>
              <p>Built in Go. Yours to understand.</p>
            </div>
            <Arrow diagonal />
          </a>
          <a href={`${repo}/issues`}>
            <span>↳</span>
            <div>
              <h3>Join the conversation</h3>
              <p>Report an issue or suggest what’s next.</p>
            </div>
            <Arrow diagonal />
          </a>
          <a href={`${docs}/mcp.md`}>
            <span>✳</span>
            <div>
              <h3>Connect your AI tools</h3>
              <p>Monitor and manage through MCP.</p>
            </div>
            <Arrow diagonal />
          </a>
        </div>
      </section>
      <section className="container final-cta">
        <div className="eyebrow">A CLEARER WAY FORWARD</div>
        <h2>Let good traffic flow.</h2>
        <a href="#quick-start" className="button primary">
          Start building <Arrow />
        </a>
        <a href="/docs/" className="cta-docs">
          Read the docs <Arrow diagonal />
        </a>
        <svg viewBox="0 0 500 200" aria-hidden="true">
          <path d="M0 170H150Q200 170 200 120V80Q200 30 250 30H500M0 170H500M0 170H300Q350 170 350 120V80Q350 30 400 30H500" />
        </svg>
      </section>
    </Site>
  );
}
