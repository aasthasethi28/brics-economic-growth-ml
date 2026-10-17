import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { FileUp, FlaskConical, X } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart,
  Tooltip, XAxis, YAxis, ReferenceLine,
} from "recharts";
import { DemoBanner, PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, MODELS, PREDICTORS, TARGET, VARIABLES, validateResults, type ModelId } from "@/data/schema";
import { setResults, useResults } from "@/data/store";
import { buildDemoResults } from "@/data/demo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Interactive Dashboard — BRICS Economic Growth Lab" },
      { name: "description", content: "Explore trends, model metrics, actual-vs-predicted, correlation, VIF and feature importance." },
      { property: "og:title", content: "Dashboard — BRICS Economic Growth Lab" },
      { property: "og:description", content: "Interactive exploration of BRICS growth model results." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const YEARS = Array.from({ length: 25 }, (_, i) => 2000 + i);
const modelLabel = (id: string) => MODELS.find((m) => m.id === id)?.label ?? id;

function Panel({ title, sub, children, className = "" }: { title: string; sub?: string | undefined; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border p-5 ${className}`}>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Dashboard() {
  const results = useResults();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([...COUNTRIES]);
  const [from, setFrom] = useState(2000);
  const [to, setTo] = useState(2024);
  const [indicator, setIndicator] = useState<string>(TARGET);
  const [model, setModel] = useState<ModelId>("random_forest");

  async function onFile(f: File | undefined) {
    if (!f) return;
    try {
      setResults(validateResults(JSON.parse(await f.text())));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read file.");
    }
  }

  const trend = useMemo(() => {
    if (!results) return [];
    return YEARS.filter((y) => y >= from && y <= to).map((year) => {
      const row: Record<string, number> = { year };
      results.panel.filter((p) => p.year === year && countries.includes(p.country)).forEach((p) => {
        row[p.country] = Number(p[indicator]);
      });
      return row;
    });
  }, [results, from, to, indicator, countries]);

  const avp = useMemo(
    () => results?.predictions.filter((p) => p.model === model && countries.includes(p.country)) ?? [],
    [results, model, countries],
  );

  const importer = (
    <div className="flex flex-wrap gap-2">
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <Button variant="accent" onClick={() => fileRef.current?.click()}><FileUp /> Import results JSON</Button>
      {results?.source !== "demo" && <Button variant="outline" onClick={() => setResults(buildDemoResults())}><FlaskConical /> Preview with demo data</Button>}
      {results && <Button variant="ghost" onClick={() => setResults(null)}><X /> Clear</Button>}
    </div>
  );

  return (
    <>
      <PageHeader eyebrow="Interactive dashboard" title="Explore the results">
        Load the verified results exported from the research notebooks to explore trends and model performance.
      </PageHeader>
      <div className="mx-auto max-w-6xl space-y-6 px-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {importer}
          {results?.source === "verified" && <span className="rounded bg-accent-soft px-3 py-1 text-sm text-accent">Verified results loaded</span>}
        </div>
        {error && <p className="text-sm text-destructive">Import failed: {error}</p>}
        {results?.source === "demo" && <DemoBanner />}

        {!results ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <h2 className="text-2xl font-semibold text-primary">No results loaded</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Import a JSON file with fields <code className="font-mono text-xs">panel, metrics, predictions, correlation, vif, importance</code> (see <code className="font-mono text-xs">src/data/schema.ts</code>). Convert your verified CSV outputs to this format first.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 rounded-lg border bg-secondary p-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
              <div>
                <p className="mb-1.5 text-xs font-medium text-primary">Countries</p>
                <div className="flex flex-wrap gap-1.5">
                  {COUNTRIES.map((c) => (
                    <button key={c} onClick={() => setCountries(countries.includes(c) ? countries.filter((x) => x !== c) : [...countries, c])}
                      className={`rounded-full border px-3 py-1 text-xs ${countries.includes(c) ? "border-accent bg-accent text-accent-foreground" : "bg-background text-muted-foreground"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-primary">Years</p>
                <div className="flex items-center gap-1">
                  <YearSelect value={from} onChange={(v) => setFrom(Math.min(v, to))} />
                  <span className="text-muted-foreground">–</span>
                  <YearSelect value={to} onChange={(v) => setTo(Math.max(v, from))} />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-primary">Indicator</p>
                <Select value={indicator} onValueChange={setIndicator}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>{[TARGET, ...PREDICTORS].map((v) => <SelectItem key={v} value={v}>{v} · {VARIABLES[v]?.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-primary">Model</p>
                <Select value={model} onValueChange={(v) => setModel(v as ModelId)}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>{MODELS.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <Panel title={`${indicator} over time`} sub={VARIABLES[indicator]?.name}>
              <div className="h-80">
                <ResponsiveContainer>
                  <LineChart data={trend}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine x={2019.5} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                    {COUNTRIES.filter((c) => countries.includes(c)).map((c) => (
                      <Line key={c} dataKey={c} stroke={COLORS[COUNTRIES.indexOf(c)]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Model comparison" sub="Held-out test window 2020–2024">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-primary"><tr className="border-b"><th className="py-2">Model</th><th>R²</th><th>RMSE</th><th>MAE</th><th>MAPE (%)</th></tr></thead>
                    <tbody>
                      {results.metrics.map((m) => (
                        <tr key={m.model} className={`border-b font-mono ${m.model === model ? "bg-accent-soft" : ""}`}>
                          <td className="py-2 font-sans">{modelLabel(m.model)}</td><td>{m.R2}</td><td>{m.RMSE}</td><td>{m.MAE}</td><td>{m.MAPE}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel title="Actual vs predicted" sub={`${modelLabel(model)} · Ingdp, test years`}>
                <div className="h-64">
                  <ResponsiveContainer>
                    <ScatterChart>
                      <CartesianGrid stroke="var(--border)" />
                      <XAxis type="number" dataKey="actual" name="Actual" domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
                      <YAxis type="number" dataKey="predicted" name="Predicted" domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter data={avp} fill="var(--chart-1)" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            <Panel title="Correlation matrix">
              <Heatmap vars={results.correlation.variables} matrix={results.correlation.matrix} />
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <BarPanel title="Variance Inflation Factor" sub="Values above ~10 often indicate strong multicollinearity" data={results.vif} k="vif" color="var(--chart-2)" />
              <BarPanel title="Feature importance" sub="Random Forest · associational, not causal" data={results.importance} k="importance" color="var(--chart-1)" />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function YearSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
      <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function BarPanel({ title, sub, data, k, color }: { title: string; sub: string; data: { variable: string }[]; k: string; color: string }) {
  const sorted = [...data].sort((a, b) => Number((b as Record<string, unknown>)[k]) - Number((a as Record<string, unknown>)[k]));
  return (
    <Panel title={title} sub={sub}>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={sorted} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="variable" tick={{ fontSize: 12, fontFamily: "var(--font-mono)" }} width={56} />
            <Tooltip />
            <Bar dataKey={k} fill={color} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function Heatmap({ vars, matrix }: { vars: string[]; matrix: number[][] }) {
  const bg = (v: number) =>
    v >= 0
      ? `color-mix(in oklab, var(--chart-1) ${Math.round(Math.abs(v) * 100)}%, var(--background))`
      : `color-mix(in oklab, var(--chart-4) ${Math.round(Math.abs(v) * 100)}%, var(--background))`;
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-separate border-spacing-1 font-mono text-xs">
        <thead><tr><th />{vars.map((v) => <th key={v} className="px-1 font-medium text-primary">{v}</th>)}</tr></thead>
        <tbody>
          {vars.map((r, i) => (
            <tr key={r}>
              <th className="pr-2 text-right font-medium text-primary">{r}</th>
              {matrix[i]?.map((v, j) => (
                <td key={j} className="h-11 w-14 rounded text-center" style={{ background: bg(v) }}>
                  <span className={Math.abs(v) > 0.6 ? "text-primary-foreground" : "text-foreground"}>{v.toFixed(2)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
