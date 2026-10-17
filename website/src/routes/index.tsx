import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPO_URL } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BRICS Economic Growth Lab — ML analysis 2000–2024" },
      { name: "description", content: "Machine-learning analysis of economic growth across Brazil, Russia, India, China and South Africa, 2000–2024." },
      { property: "og:title", content: "BRICS Economic Growth Lab" },
      { property: "og:description", content: "Random Forest, XGBoost and CatBoost models of log GDP across five BRICS economies." },
    ],
  }),
  component: Index,
});

const FACTS = [
  { k: "5", v: "BRICS countries" },
  { k: "2000–2024", v: "Annual panel" },
  { k: "6", v: "Predictors" },
  { k: "3", v: "Model families" },
];

function Index() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-16">
        <p className="eyebrow">Research showcase · Machine learning · Macroeconomics</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] text-primary md:text-7xl">
          How well can environmental and structural indicators <em className="text-accent">predict</em> growth in BRICS economies?
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          We train tree-based ensembles on 2000–2019 data and evaluate them on a held-out 2020–2024 window to
          assess how well six indicators predict log GDP. The analysis is predictive, not causal.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg"><Link to="/dashboard">Open dashboard <ArrowRight /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/methodology">Read methodology</Link></Button>
          <Button asChild size="lg" variant="ghost"><a href={REPO_URL} target="_blank" rel="noreferrer">View code</a></Button>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5">
        <dl className="grid grid-cols-2 border-t-2 border-primary md:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.v} className="border-b py-6 pr-4 md:border-b-0 md:border-r md:pl-4 md:first:pl-0 md:last:border-r-0">
              <dt className="font-display text-4xl font-semibold text-primary">{f.k}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mx-auto mt-16 grid max-w-6xl gap-8 px-5 md:grid-cols-3">
        {[
          ["Chronological split", "Train 2000–2019, test 2020–2024, with TimeSeriesSplit cross-validation to avoid look-ahead leakage."],
          ["Three ensembles", "Random Forest, XGBoost and CatBoost, compared on R², RMSE, MAE and MAPE."],
          ["Transparent diagnostics", "Correlation, VIF multicollinearity checks, actual-vs-predicted plots and feature importance."],
        ].map(([t, d]) => (
          <div key={t} className="rule-top pt-4">
            <h3 className="text-xl font-semibold text-primary">{t}</h3>
            <p className="mt-2 text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="flex flex-col gap-4 rounded-lg border bg-accent-soft p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-primary">Try a prediction</h2>
            <p className="text-muted-foreground">Enter six indicator values and query a trained model served by the research backend.</p>
          </div>
          <Button asChild variant="accent"><Link to="/predict">Go to prediction form <ArrowRight /></Link></Button>
        </div>
      </section>
    </>
  );
}
