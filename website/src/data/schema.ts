// Shape of research results the dashboard consumes.
// Replace demo data by importing a JSON file matching ResearchResults.
export const COUNTRIES = ["Brazil", "Russia", "India", "China", "South Africa"] as const;
export const PREDICTORS = ["Inco2", "Inrec", "Incc", "Into", "Ininf", "Inind"] as const;
export const TARGET = "Ingdp" as const;
export const MODELS = [
  { id: "random_forest", label: "Random Forest" },
  { id: "xgboost", label: "XGBoost" },
  { id: "catboost", label: "CatBoost" },
] as const;

export type Predictor = (typeof PREDICTORS)[number];
export type ModelId = (typeof MODELS)[number]["id"];

export const VARIABLES: Record<string, { name: string; desc: string; role: string }> = {
  Ingdp: { name: "Log GDP", desc: "Natural log of gross domestic product.", role: "Target" },
  Inco2: { name: "Log CO₂ emissions", desc: "Natural log of carbon dioxide emissions.", role: "Predictor" },
  Inrec: { name: "Log renewable energy", desc: "Natural log of renewable energy consumption.", role: "Predictor" },
  Incc: { name: "Log carbon credits", desc: "Natural log of carbon credit measure.", role: "Predictor" },
  Into: { name: "Log trade openness", desc: "Natural log of trade as a share of GDP.", role: "Predictor" },
  Ininf: { name: "Log inflation", desc: "Natural log of the inflation measure.", role: "Predictor" },
  Inind: { name: "Log industrialization", desc: "Natural log of industry value added.", role: "Predictor" },
};

export type PanelRow = { country: string; year: number } & Record<string, number | string>;

export type ResearchResults = {
  source: "verified" | "demo";
  panel: PanelRow[];
  metrics: { model: ModelId; R2: number; RMSE: number; MAE: number; MAPE: number }[];
  predictions: { country: string; year: number; model: ModelId; actual: number; predicted: number }[];
  correlation: { variables: string[]; matrix: number[][] };
  vif: { variable: string; vif: number }[];
  importance: { variable: string; importance: number }[];
};

export function validateResults(raw: unknown): ResearchResults {
  const r = raw as Partial<ResearchResults>;
  if (!r || typeof r !== "object") throw new Error("File is not a JSON object.");
  for (const k of ["panel", "metrics", "predictions", "vif", "importance"] as const) {
    if (!Array.isArray(r[k])) throw new Error(`Missing array field "${k}".`);
  }
  if (!r.correlation || !Array.isArray(r.correlation.variables) || !Array.isArray(r.correlation.matrix)) {
    throw new Error('Missing "correlation" with variables and matrix.');
  }
  return { ...(r as ResearchResults), source: "verified" };
}
