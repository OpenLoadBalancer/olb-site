import { useEffect, useRef } from "react";

const projects = [
  ["AGEZT", "An agentic operating system"],
  ["WrongStack", "AI coding orchestration"],
  ["WrongTrace", "Agent observability"],
  ["UWAS", "Unified web app server"],
];

export function Studio() {
  const panel = useRef<HTMLElement>(null);
  const symbol = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const mark = symbol.current;
    const region = panel.current;
    if (
      !mark ||
      !region ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    mark.dataset.motion = "waiting";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        mark.dataset.motion = "drawing";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(region);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={panel}
      className="studio"
      aria-label="The studio behind OpenLoadBalancer"
    >
      <a
        className="studio-mark-link"
        href="https://oxog.net"
        target="_blank"
        rel="noreferrer"
        aria-label="OXOGNET"
      >
        <svg
          ref={symbol}
          viewBox="0 0 200 130"
          fill="none"
          aria-hidden="true"
          className="studio-symbol"
        >
          <path
            d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103"
            stroke="var(--oxog-pink)"
            strokeWidth="12"
          />
          <path
            d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
            stroke="var(--oxog-pink)"
            strokeWidth="12"
          />
          <path
            d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
            stroke="var(--oxog-purple)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="m74 87 54-51"
            stroke="var(--oxog-pink)"
            strokeWidth="12"
            strokeLinecap="square"
          />
        </svg>
      </a>
      <div className="studio-copy">
        <p>OpenLoadBalancer is built and maintained by</p>
        <a
          className="studio-wordmark"
          href="https://oxog.net"
          target="_blank"
          rel="noreferrer"
        >
          <span>
            oxog<span className="studio-net">net</span>
            <span className="studio-dot">.</span>
          </span>
          <span className="studio-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <p>
          A small studio in Estonia building AI agents, developer tools, and the
          infrastructure behind them.
        </p>
      </div>
      <ul className="studio-projects" aria-label="More from Oxog">
        {projects.map(([name, description]) => (
          <li key={name}>
            <a
              href="https://oxog.net/projects"
              target="_blank"
              rel="noreferrer"
            >
              <strong>{name}</strong>
              <span>{description}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
