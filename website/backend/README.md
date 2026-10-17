# BRICS Economic Growth Lab — Prediction API

FastAPI service that serves predictions of `Ingdp` (log GDP) from **your real, fitted models**.
No models are bundled or generated. Without artifacts, `/api/predict` returns `503 model_not_configured`.

## Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Check status: `curl http://localhost:8000/api/health`

## Expected artifacts

| Model | Default path | Export from your notebook |
|---|---|---|
| Random Forest | `artifacts/random_forest.joblib` | `joblib.dump(rf_model, "artifacts/random_forest.joblib")` |
| XGBoost | `artifacts/xgboost.json` | `xgb_model.save_model("artifacts/xgboost.json")` |
| CatBoost | `artifacts/catboost.cbm` | `cat_model.save_model("artifacts/catboost.cbm")` |

Override paths in `.env`. Models must be trained on features in this exact order:
`Inco2, Inrec, Incc, Into, Ininf, Inind`. If you used a scaler, export a fitted
sklearn `Pipeline` (scaler + model) with joblib instead of the bare model.

Artifacts are git-ignored — do not commit them.

## Endpoints

- `GET /api/health` — which models are loaded.
- `POST /api/predict`
  ```json
  {"model": "random_forest", "features": {"Inco2": 0, "Inrec": 0, "Incc": 0, "Into": 0, "Ininf": 0, "Inind": 0}}
  ```
  → `{"prediction": 1.23, "target": "Ingdp", "model": "random_forest", "status": "ok"}`
  or `503` if the artifact is not loaded, `422` for invalid input.
