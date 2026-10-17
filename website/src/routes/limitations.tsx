import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, REPO_URL } from "@/components/site";

export const Route = createFileRoute("/limitations")({
  head: () => ({
    meta: [
      { title: "Limitations — BRICS Economic Growth Lab" },
      { name: "description", content: "Scope, caveats and interpretation limits of the BRICS growth machine-learning study." },
      { property: "og:title", content: "Limitations — BRICS Economic Growth Lab" },
      { property: "og:description", content: "Why these models are predictive, not causal, and other caveats." },
    ],
  }),
  component: Limitations,
});

const ITEMS = [
  ["Predictive, not causal", "Associations and feature importances do not show that any indicator causes growth."],
  ["Small panel", "Five countries over 25 years gives few observations for flexible ensemble models; overfitting is a risk."],
  ["Short test window", "2020–2024 includes the COVID-19 shock and its recovery, which may not represent typical years."],
  ["Structural heterogeneity", "BRICS economies differ greatly in size and structure; pooled models may hide country-specific dynamics."],
  ["Multicollinearity", "Correlated predictors make importance rankings unstable even when VIF is checked."],
  ["Data quality", "Source revisions, missing values and log transformations can affect results."],
  ["Impurity-based importance", "Random Forest importance can favour high-variance features; permutation or SHAP analysis could complement it."],
];

function Limitations() {
  return (
    <>
      <PageHeader eyebrow="Limitations" title="Read the results with care">
        These caveats shape how the findings should — and should not — be used.
      </PageHeader>
      <section className="mx-auto max-w-4xl px-5">
        <ol className="divide-y border-y">
          {ITEMS.map(([t, d], i) => (
            <li key={t} className="flex gap-5 py-5">
              <span className="font-display text-2xl text-accent">{i + 1}</span>
              <div><h3 className="text-lg font-semibold text-primary">{t}</h3><p className="text-muted-foreground">{d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-muted-foreground">
          Code, data notes and notebooks: <a className="font-medium text-accent underline" href={REPO_URL} target="_blank" rel="noreferrer">github.com/aasthasethi28/brics-economic-growth-ml</a>
        </p>
      </section>
    </>
  );
}
