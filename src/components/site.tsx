import Head from "next/head";
import { Studio } from "./studio";
import { useEffect, useRef, useState, type ReactNode } from "react";
export const repo = "https://github.com/openloadbalancer/olb";
export const docs = `${repo}/blob/main/docs`;

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}
export function Logo() {
  return (
    <a className="brand" href="/" aria-label="OpenLoadBalancer home">
      <img
        className="brand-mark-primary"
        src="/brand/mark.svg"
        width="36"
        height="36"
        alt=""
      />
      <img
        className="brand-mark-dark"
        src="/brand/mark-on-dark.svg"
        width="36"
        height="36"
        alt=""
      />
      <span>
        Open<span className="brand-light">LoadBalancer</span>
      </span>
    </a>
  );
}
export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("system");
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const refresh = () => {
      try {
        const value = localStorage.getItem("olb-theme") || "system";
        setTheme(
          ["light", "dark", "system"].includes(value) ? value : "system",
        );
      } catch {}
    };
    refresh();
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    const blur = (event: FocusEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("focusin", blur);
    window.addEventListener("storage", refresh);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("focusin", blur);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  useEffect(() => {
    if (open)
      ref.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
  }, [open]);
  function choose(value: string) {
    setTheme(value);
    try {
      localStorage.setItem("olb-theme", value);
    } catch {}
    document.documentElement.dataset.preference = value;
    document.documentElement.dataset.theme =
      value === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value;
  }
  return (
    <div
      className="theme-picker"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        className="icon-button"
        aria-label="Choose theme"
        aria-expanded={open}
        aria-controls="theme-options"
        onClick={() => setOpen(!open)}
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </svg>
      </button>
      {open && (
        <fieldset id="theme-options" className="theme-popover">
          <legend>Appearance</legend>
          <p>A little more you.</p>
          <div className="theme-choices">
            {["light", "dark", "system"].map((value) => (
              <label key={value}>
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={theme === value}
                  onChange={() => choose(value)}
                />
                <span className={`theme-preview preview-${value}`}>
                  <i />
                  <i />
                  <i />
                </span>
                <span>{value[0].toUpperCase() + value.slice(1)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
function Header() {
  const [mobile, setMobile] = useState(false);
  return (
    <header className="header">
      <div className="container header-inner">
        <Logo />
        <nav
          className={mobile ? "navigation is-open" : "navigation"}
          aria-label="Main navigation"
          onClick={() => setMobile(false)}
          id="main-navigation"
        >
          <a href="/#features">Features</a>
          <a href="/#architecture">Architecture</a>
          <a href="/#quick-start">Quick start</a>
          <a href="/docs/">
            Docs <Arrow diagonal />
          </a>
        </nav>
        <div className="header-actions">
          <ThemePicker />
          <a
            className="github-link"
            href={repo}
            aria-label="OpenLoadBalancer on GitHub"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.07c-3.09.67-3.74-1.31-3.74-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.67.08-.67 1.12.08 1.71 1.15 1.71 1.15 1 .1 1.43 2.13 3.22 1.49.1-.72.39-1.21.71-1.49-2.47-.28-5.07-1.24-5.07-5.49 0-1.21.43-2.2 1.14-2.98-.11-.28-.49-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.04-1.14 3.04-1.14.61 1.53.23 2.66.12 2.94.71.78 1.13 1.77 1.13 2.98 0 4.27-2.6 5.2-5.08 5.48.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
            <span>GitHub</span>
          </a>
          <button
            className="icon-button mobile-toggle"
            aria-label={mobile ? "Close navigation" : "Open navigation"}
            aria-expanded={mobile}
            aria-controls="main-navigation"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? "×" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Code({
  code,
  label = "terminal",
  numbered = false,
}: {
  code: string;
  label?: string;
  numbered?: boolean;
}) {
  const [status, setStatus] = useState("Copy");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied!");
    } catch {
      setStatus("Select code to copy");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("Copy"), 2500);
  }
  return (
    <div className="code-block">
      <div className="code-bar">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
        <button onClick={copy} aria-label={`Copy ${label}`}>
          {status}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>
          {numbered
            ? code.split("\n").map((line, i) => (
                <span className="code-line" key={i}>
                  <span aria-hidden="true" className="line-no">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={line.trim().startsWith("#") ? "comment" : ""}
                  >
                    {line || " "}
                  </span>
                </span>
              ))
            : code}
        </code>
      </pre>
      <span className="sr-only" role="status">
        {status === "Copied!" ? `${label} copied to clipboard` : ""}
      </span>
    </div>
  );
}
export function SectionTitle({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div className="eyebrow">
        <span>{number} /</span> {label}
      </div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Site({
  children,
  title = "OpenLoadBalancer — Your traffic. Your rules.",
  description = "A minimal-dependency L4/L7 load balancer written in Go. Route, protect, and observe your traffic from a single binary.",
  path = "/",
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  path?: string;
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111312" />
        <link rel="canonical" href={`https://openloadbalancer.dev${path}`} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://openloadbalancer.dev${path}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://openloadbalancer.dev/og.png"
        />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="OpenLoadBalancer — Your traffic. Your rules. Blue five-way routing logo on a navy background."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://openloadbalancer.dev/og.png"
        />
        <meta
          name="twitter:image:alt"
          content="OpenLoadBalancer — Your traffic. Your rules."
        />
      </Head>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Logo />
            <p>Good traffic deserves a clear path.</p>
          </div>
          <div>
            <span className="eyebrow">Explore</span>
            <a href="/#features">Features</a>
            <a href="/#architecture">Architecture</a>
            <a href="/docs/">Documentation</a>
          </div>
          <div>
            <span className="eyebrow">Open source</span>
            <a href={repo}>
              GitHub <Arrow diagonal />
            </a>
            <a href={`${repo}/releases`}>Releases</a>
            <a href={`${repo}/blob/main/CONTRIBUTING.md`}>Contribute</a>
          </div>
          <div>
            <span className="eyebrow">Resources</span>
            <a href={`${docs}/production-deployment.md`}>Production guide</a>
            <a href={`${docs}/troubleshooting.md`}>Troubleshooting</a>
            <a href={`${repo}/blob/main/LICENSE`}>Apache 2.0 license</a>
          </div>
        </div>
        <Studio />
        <div className="footer-bottom">
          <span>OpenLoadBalancer · Open source. Open infrastructure.</span>
          <a href="/brand/">
            Brand assets <Arrow diagonal />
          </a>
          <a href="https://github.com/openloadbalancer/olb-site">
            Website source <Arrow diagonal />
          </a>
        </div>
      </div>
    </footer>
  );
}
