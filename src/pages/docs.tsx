import { Site, Code, repo, docs, Arrow } from "@/components/site";
import { sampleConfig } from "@/content";
export default function Documentation() {
  return (
    <Site
      title="Getting started — OpenLoadBalancer"
      description="Install OpenLoadBalancer, configure your first backend pool, and start routing traffic. A practical guide with upstream configuration examples."
      path="/docs/"
    >
      <div className="container">
        <section className="doc-hero">
          <div className="eyebrow accent">DOCUMENTATION / GETTING STARTED</div>
          <h1>Your first route.</h1>
          <p>
            From a single binary to a healthy backend pool. Start locally,
            understand the flow, then make it production-ready.
          </p>
        </section>
        <div className="docs-layout">
          <aside className="docs-sidebar" aria-label="On this page">
            <span className="eyebrow">ON THIS PAGE</span>
            <a href="#install">Installation</a>
            <a href="#configure">Configuration</a>
            <a href="#run">Validate & run</a>
            <a href="#operate">Day-two operations</a>
            <a href="#production">Before production</a>
            <a href="#reference">Reference guides</a>
          </aside>
          <article className="docs-content">
            <h2 id="install">01. Install the binary</h2>
            <p>
              OpenLoadBalancer runs on Linux, macOS, and Windows. The upstream
              installers select a release binary for your platform. Review the{" "}
              <a href="/install.sh">shell script</a> or{" "}
              <a href="/install.ps1">PowerShell script</a> before running it.
            </p>
            <Code
              label="Linux / macOS"
              code="curl -fsSL https://openloadbalancer.dev/install.sh | sh"
            />
            <Code
              label="Windows · PowerShell"
              code="irm https://openloadbalancer.dev/install.ps1 | iex"
            />
            <p>
              Prefer a manual installation? Download the matching binary from{" "}
              <a href={`${repo}/releases`}>GitHub Releases</a> and add it to
              your PATH. Homebrew users can run:
            </p>
            <Code
              label="Homebrew"
              code={"brew tap openloadbalancer/olb\nbrew install olb"}
            />
            <h2 id="configure">02. Define a backend pool</h2>
            <p>
              Save the configuration below as <code>olb.yaml</code>. It listens
              on port 8080 and distributes traffic between two local services.
              Replace the example addresses with reachable backends that return
              a successful response on <code>/health</code>.
            </p>
            <Code label="olb.yaml" code={sampleConfig} numbered />
            <div className="doc-callout">
              <p>
                The admin API binds to <code>127.0.0.1:9090</code>. Keep it on a
                trusted interface; the public listener and admin listener serve
                different purposes.
              </p>
            </div>
            <p>
              The configuration structure follows the product repository’s{" "}
              <a href={`${repo}/blob/main/configs/olb.minimal.yaml`}>
                minimal configuration
              </a>
              . YAML, JSON, TOML, and HCL formats are supported, including
              environment-variable substitution. Use <code>olb setup</code> for
              the interactive configuration wizard.
            </p>
            <h2 id="run">03. Validate and start</h2>
            <Code
              label="Validate & start"
              code={
                "olb config validate --config olb.yaml\nolb start --config olb.yaml"
              }
            />
            <p>
              With your backend services running, make a request through the
              listener:
            </p>
            <Code
              label="Check the listener"
              code="curl -i http://localhost:8080/"
            />
            <p>
              Visit <a href="http://127.0.0.1:9090">http://127.0.0.1:9090</a> on
              the same machine for the admin interface. If a backend is
              unavailable, health checks remove it from rotation until it
              recovers.
            </p>
            <h2 id="operate">04. Keep a clear view</h2>
            <p>
              The CLI exposes operational commands without requiring you to
              build another dashboard. Use the upstream{" "}
              <a href={`${docs}/api.md`}>API reference</a> for programmatic
              integrations.
            </p>
            <Code
              label="Daily operations"
              code={
                "olb status --api-addr localhost:9090\nolb backend list --api-addr localhost:9090\nolb health show --api-addr localhost:9090\nolb reload --api-addr localhost:9090"
              }
            />
            <p>
              For automated monitoring, connect Prometheus metrics and
              structured JSON logs. The built-in MCP server lets compatible AI
              tools inspect metrics, diagnose issues, and manage backends.
              Configure authentication and audit logging before enabling
              management access.
            </p>
            <h2 id="production">05. Before production</h2>
            <ul>
              <li>
                Configure TLS termination, ACME certificates, or mTLS for your
                environment.
              </li>
              <li>
                Keep admin and MCP interfaces restricted to trusted networks and
                configure authentication.
              </li>
              <li>
                Set appropriate health-check intervals, timeouts, and request
                limits.
              </li>
              <li>
                Choose a balancing algorithm that matches your workload and test
                with your traffic.
              </li>
              <li>
                Review observability, graceful draining, and clustering in the{" "}
                <a href={`${docs}/production-deployment.md`}>
                  production deployment guide
                </a>
                .
              </li>
            </ul>
            <p>
              Published benchmark results describe the upstream test
              environment. Measure latency, throughput, and resource use on your
              own hardware before capacity planning.
            </p>
            <h2 id="reference">Continue exploring</h2>
            <div className="doc-links">
              {[
                [
                  "configuration.md",
                  "Configuration",
                  "Listeners, routes, pools, and middleware.",
                ],
                [
                  "algorithms.md",
                  "Balancing algorithms",
                  "Choose a policy for your workload.",
                ],
                [
                  "waf.md",
                  "Web application firewall",
                  "Explore the six-layer protection pipeline.",
                ],
                [
                  "clustering.md",
                  "Clustering",
                  "Raft, gossip, and multi-node operation.",
                ],
                [
                  "mcp.md",
                  "MCP integration",
                  "Connect AI tools with authenticated management.",
                ],
                [
                  "troubleshooting.md",
                  "Troubleshooting",
                  "Diagnose common deployment issues.",
                ],
              ].map(([file, title, description]) => (
                <a key={file} href={`${docs}/${file}`}>
                  <h3>
                    {title} <Arrow diagonal />
                  </h3>
                  <p>{description}</p>
                </a>
              ))}
            </div>
          </article>
        </div>
      </div>
    </Site>
  );
}
