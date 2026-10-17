// ILLUSTRATIVE DEMO DATA — NOT RESEARCH RESULTS.
// Synthetic values generated from a seeded random function purely to preview
// the dashboard layout. Delete or ignore once verified results are imported.
import { COUNTRIES, MODELS, PREDICTORS, TARGET, type ResearchResults } from "./schema";

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function buildDemoResults(): ResearchResults {
  const r = rng(42);
  const vars = [TARGET, ...PREDICTORS];
  const panel = COUNTRIES.flatMap((country, ci) =>
    Array.from({ length: 25 }, (_, i) => {
      const row: Record<string, number | string> = { country, year: 2000 + i };
      vars.forEach((v, vi) => {
        row[v] = +(2 + ci * 0.3 + vi * 0.4 + i * 0.03 + r() * 0.2).toFixed(3);
      });
      return row as ResearchResults["panel"][number];
    }),
  );
  const metrics = MODELS.map((m) => ({
    model: m.id,
    R2: +(0.7 + r() * 0.2).toFixed(3),
    RMSE: +(0.05 + r() * 0.1).toFixed(3),
    MAE: +(0.04 + r() * 0.08).toFixed(3),
    MAPE: +(1 + r() * 3).toFixed(2),
  }));
  const predictions = panel
    .filter((p) => (p.year as number) >= 2020)
    .flatMap((p) =>
      MODELS.map((m) => ({
        country: p.country,
        year: p.year as number,
        model: m.id,
        actual: p[TARGET] as number,
        predicted: +((p[TARGET] as number) + (r() - 0.5) * 0.2).toFixed(3),
      })),
    );
  const matrix = vars.map((_, i) =>
    vars.map((_, j) => (i === j ? 1 : +((r() - 0.3) * 1.2).toFixed(2))),
  );
  for (let i = 0; i < vars.length; i++) for (let j = 0; j < i; j++) matrix[i]![j] = matrix[j]![i]!;
  return {
    source: "demo",
    panel,
    metrics,
    predictions,
    correlation: { variables: vars, matrix },
    vif: PREDICTORS.map((v) => ({ variable: v, vif: +(1 + r() * 8).toFixed(2) })),
    importance: PREDICTORS.map((v) => ({ variable: v, importance: +r().toFixed(3) })),
  };
}
