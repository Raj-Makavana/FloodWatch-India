"""
Refresh public/state_predictions.json from trained state models + live rainfall.
Called after training so the pre-login map heatmap stays in sync.
"""
from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from flood_predictor import FloodRiskPredictor

STATE_COORDINATES = {
    "Andaman & Nicobar": {"lat": 11.667, "lon": 92.736},
    "Andhra Pradesh": {"lat": 16.506, "lon": 80.648},
    "Arunachal Pradesh": {"lat": 27.100, "lon": 93.616},
    "Assam": {"lat": 26.144, "lon": 91.736},
    "Bihar": {"lat": 25.594, "lon": 85.137},
    "Chandigarh": {"lat": 30.733, "lon": 76.779},
    "Chhattisgarh": {"lat": 21.251, "lon": 81.629},
    "Dadra & Nagar Have": {"lat": 20.276, "lon": 73.008},
    "Daman & Diu": {"lat": 20.428, "lon": 72.839},
    "Delhi": {"lat": 28.613, "lon": 77.209},
    "Goa": {"lat": 15.498, "lon": 73.827},
    "Gujarat": {"lat": 22.258, "lon": 71.192},
    "Haryana": {"lat": 29.058, "lon": 76.085},
    "Himachal Pradesh": {"lat": 31.104, "lon": 77.173},
    "Jammu & Kashmir": {"lat": 34.083, "lon": 74.797},
    "Jharkhand": {"lat": 23.344, "lon": 85.309},
    "Karnataka": {"lat": 14.520, "lon": 75.722},
    "Kerala": {"lat": 10.850, "lon": 76.271},
    "Ladakh": {"lat": 34.152, "lon": 77.577},
    "Lakshadweep": {"lat": 10.566, "lon": 72.641},
    "Madhya Pradesh": {"lat": 23.259, "lon": 77.412},
    "Maharashtra": {"lat": 19.751, "lon": 75.713},
    "Manipur": {"lat": 24.663, "lon": 93.906},
    "Meghalaya": {"lat": 25.578, "lon": 91.893},
    "Mizoram": {"lat": 23.164, "lon": 92.937},
    "Nagaland": {"lat": 26.158, "lon": 94.562},
    "Odisha": {"lat": 20.951, "lon": 85.098},
    "Puducherry": {"lat": 11.941, "lon": 79.808},
    "Punjab": {"lat": 31.147, "lon": 75.341},
    "Rajasthan": {"lat": 27.023, "lon": 74.217},
    "Sikkim": {"lat": 27.533, "lon": 88.512},
    "Tamil Nadu": {"lat": 11.127, "lon": 78.656},
    "Telangana": {"lat": 18.112, "lon": 79.019},
    "Tripura": {"lat": 23.940, "lon": 91.988},
    "Uttar Pradesh": {"lat": 26.846, "lon": 80.946},
    "Uttarakhand": {"lat": 30.066, "lon": 79.019},
    "West Bengal": {"lat": 22.986, "lon": 87.855},
}

BASE_DIR = Path(__file__).parent
OUT_FILE = BASE_DIR / "public" / "state_predictions.json"


def fetch_rainfall_24h(lat: float, lon: float) -> float:
    params = urllib.parse.urlencode(
        {
            "latitude": lat,
            "longitude": lon,
            "daily": "precipitation_sum",
            "forecast_days": 1,
            "timezone": "Asia/Kolkata",
        }
    )
    url = f"https://api.open-meteo.com/v1/forecast?{params}"
    try:
        with urllib.request.urlopen(url, timeout=12) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        values = payload.get("daily", {}).get("precipitation_sum") or [0]
        return float(values[0] or 0.0)
    except Exception:
        return 0.0


def risk_level(probability: float, category: str) -> str:
    if probability >= 0.75 or "Extreme" in category:
        return "high"
    if probability >= 0.25:
        return "medium"
    return "low"


def export_map_predictions() -> dict:
    predictor = FloodRiskPredictor()
    states_out = {}

    for state, coords in STATE_COORDINATES.items():
        rain = fetch_rainfall_24h(coords["lat"], coords["lon"])
        result = predictor.predict(state=state, rainfall_24h_mm=rain)
        pred = result["prediction"]
        raw = float(pred["risk_probability_raw"])
        states_out[state] = {
            "state": state,
            "risk_category": pred["risk_category"],
            "risk_level": risk_level(raw, pred["risk_category"]),
            "probability": raw,
            "probability_str": pred["flood_risk_probability"],
            "alert_level": pred["alert_level"],
            "color_code": pred["color_code"],
            "action_guidance": pred["action_guidance"],
            "key_risk_drivers": pred["key_risk_drivers"],
            "rainfall_24h_mm": rain,
            "model_used": result["meta"]["model_used"],
        }
        print(f"  {state:28s} rain={rain:6.1f}mm  {pred['flood_risk_probability']:>7s}  {pred['risk_category']}")

    payload = {
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "Trained Gradient Boosting models + Open-Meteo 24h rainfall",
        "states": states_out,
    }

    # Frontend expects a flat state map; keep both shapes compatible.
    flat = dict(states_out)
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(flat, f, indent=2)

    meta_path = BASE_DIR / "public" / "state_predictions_meta.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({"generated_at_utc": payload["generated_at_utc"], "source": payload["source"]}, f, indent=2)

    print(f"[OK] Wrote {OUT_FILE}")
    return flat


if __name__ == "__main__":
    print("Exporting live map predictions from trained models...")
    export_map_predictions()
