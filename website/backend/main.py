"""BRICS Economic Growth Lab — prediction API.

Serves predictions ONLY from real, fitted model artifacts on disk.
If an artifact is missing, /api/predict returns 503 (model not configured).
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

load_dotenv()
log = logging.getLogger("brics-api")
logging.basicConfig(level=logging.INFO)

BASE = Path(__file__).parent
FEATURE_ORDER = ["Inco2", "Inrec", "Incc", "Into", "Ininf", "Inind"]

ARTIFACT_PATHS: dict[str, Path] = {
    "random_forest": Path(os.getenv("RANDOM_FOREST_PATH", BASE / "artifacts/random_forest.joblib")),
    "xgboost": Path(os.getenv("XGBOOST_PATH", BASE / "artifacts/xgboost.json")),
    "catboost": Path(os.getenv("CATBOOST_PATH", BASE / "artifacts/catboost.cbm")),
}


def _load(name: str, path: Path) -> Any | None:
    if not path.is_file():
        log.warning("Artifact for %s not found at %s", name, path)
        return None
    try:
        if name == "random_forest":
            import joblib
            return joblib.load(path)
        if name == "xgboost":
            from xgboost import XGBRegressor
            m = XGBRegressor()
            m.load_model(str(path))
            return m
        if name == "catboost":
            from catboost import CatBoostRegressor
            m = CatBoostRegressor()
            m.load_model(str(path))
            return m
    except Exception:  # noqa: BLE001
        log.exception("Failed to load %s from %s", name, path)
    return None


MODELS: dict[str, Any | None] = {n: _load(n, p) for n, p in ARTIFACT_PATHS.items()}

app = FastAPI(title="BRICS Economic Growth Lab API", version="0.1.0")
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:8080").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class Features(BaseModel):
    model_config = ConfigDict(extra="forbid")
    Inco2: float = Field(allow_inf_nan=False)
    Inrec: float = Field(allow_inf_nan=False)
    Incc: float = Field(allow_inf_nan=False)
    Into: float = Field(allow_inf_nan=False)
    Ininf: float = Field(allow_inf_nan=False)
    Inind: float = Field(allow_inf_nan=False)


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", protected_namespaces=())
    model: Literal["random_forest", "xgboost", "catboost"]
    features: Features


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "models": {n: {"loaded": m is not None, "path": str(ARTIFACT_PATHS[n])} for n, m in MODELS.items()},
    }


@app.post("/api/predict")
def predict(req: PredictRequest) -> dict[str, Any]:
    model = MODELS.get(req.model)
    if model is None:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "model_not_configured",
                "message": f"Model '{req.model}' is not loaded. Expected artifact at {ARTIFACT_PATHS[req.model]}.",
            },
        )
    import pandas as pd

    row = pd.DataFrame([[getattr(req.features, f) for f in FEATURE_ORDER]], columns=FEATURE_ORDER)
    try:
        value = float(model.predict(row)[0])
    except Exception as exc:  # noqa: BLE001
        log.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed. Check feature order matches training.") from exc
    return {"prediction": value, "target": "Ingdp", "model": req.model, "status": "ok"}
