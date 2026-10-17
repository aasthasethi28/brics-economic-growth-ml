import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, PlugZap } from "lucide-react";
import { PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MODELS, PREDICTORS, VARIABLES, type ModelId } from "@/data/schema";
import { API_BASE_URL } from "@/data/store";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Live Prediction — BRICS Economic Growth Lab" },
      { name: "description", content: "Query a trained Random Forest, XGBoost or CatBoost model for predicted log GDP." },
      { property: "og:title", content: "Live Prediction — BRICS Economic Growth Lab" },
      { property: "og:description", content: "Enter six indicators and get a log GDP prediction from the research backend." },
    ],
  }),
  component: Predict,
});

type Result =
  | { kind: "ok"; prediction: number; model: string }
  | { kind: "not_connected"; detail: string }
  | { kind: "error"; detail: string };

function Predict() {
  const [model, setModel] = useState<ModelId>("random_forest");
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(PREDICTORS.map((p) => [p, ""])));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const features: Record<string, number> = {};
    for (const p of PREDICTORS) {
      const n = Number(values[p] ?? "");
      if ((values[p] ?? "").trim() === "" || !Number.isFinite(n)) {
        setResult({ kind: "error", detail: `Please enter a valid number for ${p}.` });
        return;
      }
      features[p] = n;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, features }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.status === "ok" && typeof body.prediction === "number") {
        setResult({ kind: "ok", prediction: body.prediction, model: body.model });
      } else if (res.status === 503) {
        setResult({ kind: "not_connected", detail: body?.detail?.message ?? "The selected model artifact is not loaded on the server." });
      } else {
        setResult({ kind: "error", detail: typeof body?.detail === "string" ? body.detail : `Request failed (${res.status}).` });
      }
    } catch {
      setResult({ kind: "not_connected", detail: `Could not reach the prediction service at ${API_BASE_URL}.` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Live prediction" title="Query a trained model">
        Values are sent to the research backend, which returns predicted <span className="font-mono">Ingdp</span> (log GDP). No prediction is computed in the browser.
      </PageHeader>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="rounded-lg border p-6">
          <Label className="text-primary">Model</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {MODELS.map((m) => (
              <button type="button" key={m.id} onClick={() => setModel(m.id)}
                className={`rounded border px-3 py-2 text-sm ${model === m.id ? "border-accent bg-accent-soft font-medium text-accent" : "text-muted-foreground hover:border-primary"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PREDICTORS.map((p) => (
              <div key={p}>
                <Label htmlFor={p} className="text-primary"><span className="font-mono">{p}</span> <span className="font-normal text-muted-foreground">· {VARIABLES[p]?.name}</span></Label>
                <Input id={p} type="number" step="any" inputMode="decimal" required className="mt-1.5"
                  value={values[p]} onChange={(e) => setValues({ ...values, [p]: e.target.value })} />
              </div>
            ))}
          </div>
          <Button type="submit" variant="accent" className="mt-6 w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Predict Ingdp
          </Button>
        </form>
        <aside className="rounded-lg border bg-secondary p-6" aria-live="polite">
          <p className="eyebrow">Result</p>
          {!result && <p className="mt-4 text-muted-foreground">Submit the form to request a prediction.</p>}
          {result?.kind === "ok" && (
            <div className="mt-4">
              <p className="font-display text-5xl font-semibold text-primary">{result.prediction.toFixed(4)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Predicted Ingdp · {result.model}</p>
              <p className="mt-4 text-xs text-muted-foreground">A model prediction, not a causal estimate.</p>
            </div>
          )}
          {result?.kind === "not_connected" && (
            <div className="mt-4">
              <p className="flex items-center gap-2 text-xl font-semibold text-primary"><PlugZap className="h-5 w-5 text-warning" /> Model not connected yet</p>
              <p className="mt-2 text-sm text-muted-foreground">{result.detail}</p>
              <p className="mt-3 text-xs text-muted-foreground">Start the backend and place exported model files in its artifacts folder (see backend/README.md).</p>
            </div>
          )}
          {result?.kind === "error" && <p className="mt-4 text-sm text-destructive">{result.detail}</p>}
        </aside>
      </section>
    </>
  );
}
