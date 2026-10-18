import { Site } from "@/components/site";
export default function NotFound() {
  return (
    <Site title="Page not found — OpenLoadBalancer" path="/404/">
      <div className="container not-found">
        <div className="eyebrow accent">404 / NO ROUTE MATCHED</div>
        <h1>Let’s find your way.</h1>
        <p>This page isn’t here. Your next route is.</p>
        <a className="button primary" href="/">
          Back to home →
        </a>
      </div>
    </Site>
  );
}
