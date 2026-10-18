import { useState } from "react";
export function TrafficDiagram() {
  const [algorithm, setAlgorithm] = useState("round_robin");
  const [healthy, setHealthy] = useState(true);
  return (
    <div className={`traffic-console ${healthy ? "" : "failover"}`}>
      <div className="console-toolbar">
        <span>
          <i className="status-dot" /> TRAFFIC EXPLORER
        </span>
        <span className="demo-tag">ILLUSTRATIVE</span>
      </div>
      <div className="diagram-label">
        <span>
          One entry point.
          <br />
          <strong>Every request in the right place.</strong>
        </span>
        <span className="mono">:8080</span>
      </div>
      <svg
        className="traffic-svg"
        viewBox="0 0 640 350"
        role="img"
        aria-label={`Illustrative request flow: clients through OpenLoadBalancer to ${healthy ? "three healthy backends" : "two healthy backends; backend two is unavailable"}`}
      >
        <defs>
          <pattern
            id="dots"
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".15" />
          </pattern>
        </defs>
        <rect width="640" height="350" fill="url(#dots)" />
        <g className="diagram-wires" fill="none" strokeWidth="1.5">
          <path d="M95 95H170Q190 95 190 115V155Q190 175 215 175H240" />
          <path d="M95 175H240" />
          <path d="M95 255H170Q190 255 190 235V195Q190 175 215 175" />
          <path d="M362 175H400Q420 175 420 155V100Q420 80 440 80H490" />
          <path className="backend-two-wire" d="M362 175H490" />
          <path d="M362 175H400Q420 175 420 195V250Q420 270 440 270H490" />
        </g>
        <g className="packet-stream" fill="none" strokeWidth="3">
          <path d="M95 95H170Q190 95 190 115V155Q190 175 215 175H240" />
          <path d="M95 255H170Q190 255 190 235V195Q190 175 215 175" />
          <path d="M362 175H400Q420 175 420 155V100Q420 80 440 80H490" />
          <path className="backend-two-wire" d="M362 175H490" />
          <path d="M362 175H400Q420 175 420 195V250Q420 270 440 270H490" />
        </g>
        {[95, 175, 255].map((y, i) => (
          <g key={y}>
            <rect
              className="diagram-node"
              x="42"
              y={y - 23}
              width="70"
              height="46"
              rx="7"
            />
            <path
              d={`M65 ${y - 7}h23v14H65zM71 ${y + 11}h11`}
              stroke="currentColor"
              fill="none"
              strokeWidth="1.5"
            />
            <text className="svg-caption" x="77" y={y + 41} textAnchor="middle">
              {["HTTP/S", "gRPC", "TCP/UDP"][i]}
            </text>
          </g>
        ))}
        <rect
          className="balancer-shadow"
          x="236"
          y="119"
          width="130"
          height="124"
          rx="14"
        />
        <rect
          className="balancer-node"
          x="240"
          y="115"
          width="122"
          height="120"
          rx="12"
        />
        <path
          d="M282 151h37m-37 9h37m-37 9h37"
          stroke="currentColor"
          strokeWidth="3"
        />
        <circle cx="326" cy="151" r="2" fill="currentColor" />
        <circle cx="326" cy="160" r="2" fill="currentColor" />
        <circle cx="326" cy="169" r="2" fill="currentColor" />
        <text className="svg-logo" x="301" y="202" textAnchor="middle">
          OLB
        </text>
        <text className="svg-caption" x="301" y="266" textAnchor="middle">
          ROUTE · PROTECT · BALANCE
        </text>
        {[80, 175, 270].map((y, i) => (
          <g key={y} className={i === 1 ? "backend-two" : ""}>
            <rect
              className="diagram-node"
              x="490"
              y={y - 24}
              width="120"
              height="48"
              rx="7"
            />
            <circle className="backend-status" cx="507" cy={y} r="3" />
            <text className="svg-server" x="520" y={y + 4}>
              backend 0{i + 1}
            </text>
            <text
              className="svg-caption"
              x="550"
              y={y + 42}
              textAnchor="middle"
            >
              {i === 1 && !healthy ? "UNHEALTHY · SKIPPED" : "HEALTHY"}
            </text>
          </g>
        ))}
      </svg>
      <div className="console-controls">
        <label>
          Algorithm
          <select
            aria-label="Load balancing algorithm"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="round_robin">Round robin</option>
            <option value="least_connections">Least connections</option>
            <option value="ip_hash">IP hash</option>
          </select>
        </label>
        <button
          className="failover-toggle"
          aria-pressed={!healthy}
          onClick={() => setHealthy(!healthy)}
        >
          <span className="switch" />
          Simulate failure
        </button>
      </div>
      <div className="console-note" role="status">
        <span className="status-dot" />
        {!healthy
          ? "Backend 02 removed from rotation. Traffic keeps flowing."
          : algorithm === "least_connections"
            ? "Prefer the backend with the fewest active connections."
            : algorithm === "ip_hash"
              ? "Keep requests from the same client IP on the same backend."
              : "Distribute requests across healthy backends in turn."}
      </div>
    </div>
  );
}
export function ArchitectureDiagram() {
  return (
    <>
      <svg
        viewBox="0 0 1200 240"
        role="img"
        aria-label="Request pipeline: listeners, middleware and WAF, router, balancer, backend pool; supported by TLS, discovery, clustering and observability"
        className="architecture-svg"
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="m0 0 6 3-6 3" fill="var(--muted)" />
          </marker>
        </defs>
        {["Listeners", "Middleware", "Router", "Balancer", "Backend pool"].map(
          (name, i) => (
            <g key={name}>
              <rect
                x={i * 240 + 4}
                y="20"
                width="220"
                height="100"
                rx="8"
                className="diagram-node"
              />
              <text x={i * 240 + 25} y="49" className="svg-caption">
                0{i + 1}
              </text>
              <text x={i * 240 + 25} y="79" className="svg-step">
                {name}
              </text>
              <text x={i * 240 + 25} y="103" className="svg-caption">
                {
                  [
                    "L4 / L7 · TLS",
                    "WAF · Rate limits",
                    "Host · Path · SNI",
                    "Select healthy target",
                    "Proxy the request",
                  ][i]
                }
              </text>
              {i < 4 && (
                <path
                  d={`M${i * 240 + 225} 70h17`}
                  stroke="var(--muted)"
                  markerEnd="url(#arrow)"
                />
              )}
            </g>
          ),
        )}
        <path
          d="M114 120v42h960v-42M354 120v42M594 120v42M834 120v42"
          stroke="var(--border-strong)"
          fill="none"
        />
        <text x="600" y="200" textAnchor="middle" className="svg-caption">
          CONFIGURATION · SERVICE DISCOVERY · RAFT CLUSTERING · METRICS · ADMIN
          API · MCP
        </text>
      </svg>
      <svg
        className="architecture-mobile"
        viewBox="0 0 320 510"
        role="img"
        aria-label="Request pipeline: listeners, middleware and WAF, router, balancer, backend pool"
      >
        {["Listeners", "Middleware", "Router", "Balancer", "Backend pool"].map(
          (name, i) => (
            <g key={name}>
              <rect
                x="10"
                y={i * 100 + 5}
                width="300"
                height="75"
                rx="7"
                className="diagram-node"
              />
              <text x="27" y={i * 100 + 31} className="svg-caption">
                0{i + 1}
              </text>
              <text x="65" y={i * 100 + 36} className="svg-step">
                {name}
              </text>
              <text x="65" y={i * 100 + 59} className="svg-caption">
                {
                  [
                    "L4 / L7 · TLS",
                    "WAF · Rate limits",
                    "Host · Path · SNI",
                    "Select healthy target",
                    "Proxy the request",
                  ][i]
                }
              </text>
              {i < 4 && (
                <path
                  d={`M160 ${i * 100 + 80}v21m-4-5 4 5 4-5`}
                  fill="none"
                  stroke="var(--accent)"
                />
              )}
            </g>
          ),
        )}
      </svg>
    </>
  );
}
