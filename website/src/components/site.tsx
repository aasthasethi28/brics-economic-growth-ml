import { Link } from "@tanstack/react-router";
import { AlertTriangle, Github } from "lucide-react";
import type { ReactNode } from "react";

export const REPO_URL = "https://github.com/aasthasethi28/brics-economic-growth-ml";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/methodology", label: "Methodology" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/predict", label: "Prediction" },
  { to: "/limitations", label: "Limitations" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="font-display text-lg font-semibold text-primary">
          BRICS Economic Growth <span className="text-accent">Lab</span>
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded px-2.5 py-1.5 text-muted-foreground hover:text-primary"
              activeProps={{ className: "rounded px-2.5 py-1.5 text-primary font-medium bg-secondary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-base text-primary">BRICS Economic Growth Lab</p>
          <p>Predictive, non-causal machine-learning analysis · Brazil, Russia, India, China, South Africa · 2000–2024</p>
        </div>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-primary hover:text-accent">
          <Github className="h-4 w-4" /> Source on GitHub
        </a>
      </div>
    </footer>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 pb-8">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-semibold text-primary md:text-5xl">{title}</h1>
      {children && <div className="mt-4 max-w-3xl text-lg text-muted-foreground">{children}</div>}
    </div>
  );
}

export function DemoBanner() {
  return (
    <div role="note" className="flex items-start gap-2 rounded border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p><strong>Illustrative demo data — not research results.</strong> Synthetic values shown only to preview the layout. Import verified results to replace them.</p>
    </div>
  );
}
