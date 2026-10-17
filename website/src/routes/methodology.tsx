import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { VARIABLES } from "@/data/schema";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology & Variables — BRICS Economic Growth Lab" },
      { name: "description", content: "Data split, models, metrics, diagnostics and variable glossary for the BRICS growth ML study." },
      { property: "og:title", content: "Methodology — BRICS Economic Growth Lab" },
      { property: "og:description", content: "Chronological train/test split, tree ensembles, VIF and feature importance." },
    ],
  }),
  component: Methodology,
});

const STEPS = [
  ["01", "Descriptive statistics", "Summarise each log-transformed variable by country and over time."],
  ["02", "Correlation analysis", "Pairwise Pearson correlations between the target and predictors."],
  ["03", "Multicollinearity (VIF)", "Variance Inflation Factors to flag redundant predictors."],
  ["04", "Chronological split", "Training window 2000–2019; held-out test window 2020–2024."],
  ["05", "TimeSeriesSplit CV", "Expanding-window cross-validation for tuning, preserving temporal order."],
  ["06", "Model training", "Random Forest, XGBoost and CatBoost regressors on Ingdp."],
  ["07", "Evaluation", "R², RMSE, MAE and MAPE on the test window; actual-vs-predicted plots."],
  ["08", "Interpretation", "Random Forest impurity-based feature importance (associational, not causal)."],
];

function Methodology() {
  return (
    <>
      <PageHeader eyebrow="Methodology" title="From panel data to evaluated models">
        A transparent pipeline designed to test predictive performance out of time, not to identify causal effects.
      </PageHeader>
      <section className="mx-auto grid max-w-6xl gap-x-10 gap-y-8 px-5 md:grid-cols-2">
        {STEPS.map(([n, t, d]) => (
          <div key={n} className="flex gap-4 border-t pt-4">
            <span className="font-mono text-sm text-accent">{n}</span>
            <div>
              <h3 className="text-lg font-semibold text-primary">{t}</h3>
              <p className="text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </section>
      <section className="mx-auto mt-16 max-w-6xl px-5">
        <p className="eyebrow">Glossary</p>
        <h2 className="mt-2 text-3xl font-semibold text-primary">Variables</h2>
        <div className="mt-6 overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-primary">
              <tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Description</th></tr>
            </thead>
            <tbody>
              {Object.entries(VARIABLES).map(([code, v]) => (
                <tr key={code} className="border-t">
                  <td className="p-3 font-mono font-medium text-primary">{code}</td>
                  <td className="p-3">{v.name}</td>
                  <td className="p-3"><span className={v.role === "Target" ? "rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground" : "rounded bg-accent-soft px-2 py-0.5 text-xs text-accent"}>{v.role}</span></td>
                  <td className="p-3 text-muted-foreground">{v.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Exact source series and units should be confirmed against the project repository.</p>
      </section>
    </>
  );
}
