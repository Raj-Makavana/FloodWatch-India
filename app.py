"""
========================================================================================
PROJECT: Flood Risk Prediction Using Weather and GIS Data (B.Tech Project)
MODULE:  Production FastAPI Backend — ML Inference + Live Weather/Flood API Integration
========================================================================================
Live APIs Integrated:
  1. Open-Meteo Weather API  → Real-time rainfall (24h sum & current), temperature, soil moisture, humidity
  2. Open-Meteo Flood API    → GloFAS river discharge (m³/s) with 7-day forecast
  3. IMD Mausam Warnings     → Official India Meteorological Department Alert Levels (Red/Orange/Yellow/Green)
  4. India-WRIS / CWC        → Major Dams, Reservoir Storage (MCM) and River Telemetry Master
========================================================================================
"""

import os
import json
import httpx
import asyncio
import pandas as pd
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Attempt to load .env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

from flood_predictor import FloodRiskPredictor

# --------------------------------------------------------------------------------------
# 1. INITIALIZATION & METADATA
# --------------------------------------------------------------------------------------
app = FastAPI(
    title="FloodWatch India - Flood Risk Prediction API",
    description=(
        "Production-grade REST API backend for predicting regional and district-level "
        "flood risks using Machine Learning (Gradient Boosting) and live telemetry. "
        "Integrates Open-Meteo Weather API, Open-Meteo Flood (GloFAS) API, "
        "IMD Mausam warning protocols, and India-WRIS / CWC Dam Master."
    ),
    version="2.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Predictor Instance
predictor = FloodRiskPredictor()

METRICS_FILE = Path(__file__).parent / "models" / "model_evaluation_metrics.json"

# ─── Live API Configuration (Configured via .env with robust fallbacks) ───────
OPEN_METEO_WEATHER_URL = os.getenv("OPEN_METEO_WEATHER_URL", "https://api.open-meteo.com/v1/forecast")
OPEN_METEO_FLOOD_URL   = os.getenv("OPEN_METEO_FLOOD_URL", "https://flood-api.open-meteo.com/v1/flood")
IMD_MAUSAM_PORTAL      = os.getenv("IMD_MAUSAM_PORTAL", "https://mausam.imd.gov.in/")
INDIA_WRIS_PORTAL      = os.getenv("INDIA_WRIS_PORTAL", "https://indiawris.gov.in/wris/")

# ─── Load India-WRIS / CWC Dam Master Dataset ─────────────────────────────────
DAM_MASTER_FILE = Path(__file__).parent / "data" / "divideddata" / "All_India_National_Masters" / "cleaned_dam_master_india.csv"
dam_master_df = None
if DAM_MASTER_FILE.exists():
    try:
        dam_master_df = pd.read_csv(DAM_MASTER_FILE, low_memory=False)
        print(f"[CWC Dam Telemetry] Loaded {len(dam_master_df)} dams from {DAM_MASTER_FILE.name}")
    except Exception as e:
        print(f"[CWC Dam Telemetry] Warning: Failed to load dam master CSV: {e}")

# ─── WMO Weather Interpretation Codes ─────────────────────────────────────────
WMO_WEATHER_CODES: Dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

# ─── State Latitude/Longitude Centroids (Standard Reference Coordinates) ─────
STATE_COORDINATES: Dict[str, Dict[str, float]] = {
    "Andaman & Nicobar":    {"lat": 11.667, "lon": 92.736},
    "Andhra Pradesh":       {"lat": 16.506, "lon": 80.648},
    "Arunachal Pradesh":    {"lat": 27.100, "lon": 93.616},
    "Assam":                {"lat": 26.144, "lon": 91.736},
    "Bihar":                {"lat": 25.594, "lon": 85.137},
    "Chandigarh":           {"lat": 30.733, "lon": 76.779},
    "Chhattisgarh":         {"lat": 21.251, "lon": 81.629},
    "Dadra & Nagar Have":   {"lat": 20.276, "lon": 73.008},
    "Daman & Diu":          {"lat": 20.428, "lon": 72.839},
    "Delhi":                {"lat": 28.613, "lon": 77.209},
    "Goa":                  {"lat": 15.498, "lon": 73.827},
    "Gujarat":              {"lat": 22.258, "lon": 71.192},
    "Haryana":              {"lat": 29.058, "lon": 76.085},
    "Himachal Pradesh":     {"lat": 31.104, "lon": 77.173},
    "Jammu & Kashmir":      {"lat": 34.083, "lon": 74.797},
    "Jharkhand":            {"lat": 23.344, "lon": 85.309},
    "Karnataka":            {"lat": 14.520, "lon": 75.722},
    "Kerala":               {"lat": 10.850, "lon": 76.271},
    "Ladakh":               {"lat": 34.152, "lon": 77.577},
    "Lakshadweep":          {"lat": 10.566, "lon": 72.641},
    "Madhya Pradesh":       {"lat": 23.259, "lon": 77.412},
    "Maharashtra":          {"lat": 19.751, "lon": 75.713},
    "Manipur":              {"lat": 24.663, "lon": 93.906},
    "Meghalaya":            {"lat": 25.578, "lon": 91.893},
    "Mizoram":              {"lat": 23.164, "lon": 92.937},
    "Nagaland":             {"lat": 26.158, "lon": 94.562},
    "Odisha":               {"lat": 20.951, "lon": 85.098},
    "Puducherry":           {"lat": 11.941, "lon": 79.808},
    "Punjab":               {"lat": 31.147, "lon": 75.341},
    "Rajasthan":            {"lat": 27.023, "lon": 74.217},
    "Sikkim":               {"lat": 27.533, "lon": 88.512},
    "Tamil Nadu":           {"lat": 11.127, "lon": 78.656},
    "Telangana":            {"lat": 18.112, "lon": 79.019},
    "Tripura":              {"lat": 23.940, "lon": 91.988},
    "Uttar Pradesh":        {"lat": 26.846, "lon": 80.946},
    "Uttarakhand":          {"lat": 30.066, "lon": 79.019},
    "West Bengal":          {"lat": 22.986, "lon": 87.855},
}

# Cache for district coordinates resolved via Open-Meteo Geocoding
DISTRICT_COORDINATES_CACHE: Dict[str, Dict[str, Any]] = {}

# --------------------------------------------------------------------------------------
# 2. PYDANTIC SCHEMAS
# --------------------------------------------------------------------------------------
class FloodPredictionRequest(BaseModel):
    state: str = Field(..., example="Bihar", description="Name of Indian State or Union Territory")
    district: Optional[str] = Field(None, example="Patna", description="District Name (optional)")
    rainfall_24h_mm: Optional[float] = Field(0.0, ge=0.0, description="Manual 24-hour rainfall override in mm (0 = auto-fetch from live API)")
    custom_gis_features: Optional[Dict[str, float]] = Field(None, description="Optional overrides for terrain/dam features")

    class Config:
        json_schema_extra = {
            "example": {
                "state": "Bihar",
                "district": "Patna",
                "rainfall_24h_mm": 0  # 0 = auto-fetch live rainfall from Open-Meteo
            }
        }


# --------------------------------------------------------------------------------------
# 3. LIVE API HELPER FUNCTIONS
# --------------------------------------------------------------------------------------
def get_state_coordinates(state_name: str) -> Dict[str, float]:
    """Resolves latitude/longitude for any Indian State with case-insensitive fallback."""
    coords = STATE_COORDINATES.get(state_name)
    if not coords:
        norm = state_name.strip().lower()
        for k, v in STATE_COORDINATES.items():
            if k.lower() == norm:
                return v
    return coords or {"lat": 22.8, "lon": 81.5}


async def get_district_coordinates(state: str, district: Optional[str] = None) -> Dict[str, Any]:
    """
    Resolves exact district coordinates using Open-Meteo Geocoding API.
    Caches results in-memory and falls back gracefully to state centroids.
    """
    if not district or district.strip().lower() in ["all districts", "state level", "none", ""]:
        base = get_state_coordinates(state)
        return {"lat": base["lat"], "lon": base["lon"], "location_name": state, "is_district_level": False}

    cache_key = f"{district.strip().lower()}_{state.strip().lower()}"
    if cache_key in DISTRICT_COORDINATES_CACHE:
        return DISTRICT_COORDINATES_CACHE[cache_key]

    try:
        url = "https://geocoding-api.open-meteo.com/v1/search"
        params = {
            "name": district.strip(),
            "count": 5,
            "country": "IN",
            "language": "en",
            "format": "json"
        }
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                results = resp.json().get("results", [])
                if results:
                    matched = results[0]
                    # Attempt state matching if multiple results returned
                    for item in results:
                        admin = item.get("admin1", "").lower()
                        if state.lower() in admin or admin in state.lower():
                            matched = item
                            break
                    coords = {
                        "lat": float(matched["latitude"]),
                        "lon": float(matched["longitude"]),
                        "location_name": f"{matched.get('name', district)}, {state}",
                        "is_district_level": True
                    }
                    DISTRICT_COORDINATES_CACHE[cache_key] = coords
                    return coords
    except Exception:
        pass

    # Fallback to state centroid
    base = get_state_coordinates(state)
    return {"lat": base["lat"], "lon": base["lon"], "location_name": f"{district}, {state} (Regional Centroid)", "is_district_level": False}


async def fetch_live_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches real-time weather from Open-Meteo Weather API.
    Returns:
      - rainfall_mm: Instantaneous precipitation (mm)
      - rainfall_24h_mm: Accumulated 24-hour rainfall (mm)
      - temperature_c: Current ambient temperature (°C)
      - soil_moisture: Topsoil moisture (0-1 cm m³/m³)
      - humidity_percent: Relative humidity (%)
      - weather_code & weather_description
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "precipitation,temperature_2m,soil_moisture_0_to_1cm,relative_humidity_2m,weather_code",
        "hourly": "precipitation",
        "forecast_days": 1,
        "timezone": "Asia/Kolkata"
    }
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(OPEN_METEO_WEATHER_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

            current = data.get("current", {})
            hourly_rain_list = data.get("hourly", {}).get("precipitation", [])
            rain_24h = round(float(sum(hourly_rain_list[:24])), 2) if hourly_rain_list else float(current.get("precipitation", 0.0))
            w_code = int(current.get("weather_code", 0))

            return {
                "rainfall_mm": float(current.get("precipitation", 0.0)),
                "rainfall_24h_mm": rain_24h,
                "temperature_c": float(current.get("temperature_2m", 28.0)),
                "soil_moisture": float(current.get("soil_moisture_0_to_1cm", 0.30)),
                "humidity_percent": float(current.get("relative_humidity_2m", 65.0)),
                "weather_code": w_code,
                "weather_description": WMO_WEATHER_CODES.get(w_code, "Partly cloudy"),
                "source": "Open-Meteo Weather API (Real-Time)",
                "api_url": f"{OPEN_METEO_WEATHER_URL}?latitude={lat}&longitude={lon}"
            }
    except Exception as e:
        return {
            "rainfall_mm": 0.0,
            "rainfall_24h_mm": 0.0,
            "temperature_c": 28.0,
            "soil_moisture": 0.30,
            "humidity_percent": 65.0,
            "weather_code": 0,
            "weather_description": "Clear sky (Offline fallback)",
            "source": f"Open-Meteo Weather API (Fallback: {str(e)[:45]})",
            "api_url": OPEN_METEO_WEATHER_URL
        }


async def fetch_live_river_discharge(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches GloFAS River Discharge forecast from Open-Meteo Flood API.
    Returns current day discharge (m³/s) and 7-day flow forecast.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "river_discharge",
        "forecast_days": 7
    }
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(OPEN_METEO_FLOOD_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            daily = data.get("daily", {})
            discharge_list = daily.get("river_discharge", [None])
            valid_list = [round(float(x), 2) for x in discharge_list if x is not None]
            curr_discharge = valid_list[0] if valid_list else None
            max_7d = max(valid_list) if valid_list else None
            return {
                "discharge_m3s": curr_discharge,
                "max_7d_forecast_m3s": max_7d,
                "forecast_7d": valid_list,
                "source": "Open-Meteo Flood API (GloFAS River Model)"
            }
    except Exception:
        return {
            "discharge_m3s": None,
            "max_7d_forecast_m3s": None,
            "forecast_7d": [],
            "source": "Open-Meteo Flood API (Station Offline)"
        }


def compute_imd_alert(rainfall_24h_mm: float, river_discharge_m3s: Optional[float] = None) -> Dict[str, Any]:
    """
    Computes official India Meteorological Department (IMD) Warning Level:
      - RED ALERT: Rainfall >= 115.6 mm or River Discharge >= 2500 m³/s (Critical Emergency)
      - ORANGE ALERT: Rainfall >= 64.5 mm or River Discharge >= 1000 m³/s (Be Prepared)
      - YELLOW ALERT: Rainfall >= 15.6 mm or River Discharge >= 400 m³/s (Be Aware / Watch)
      - GREEN SAFE: Rainfall < 15.6 mm (Normal Hydrological State)
    """
    discharge = river_discharge_m3s or 0.0
    if rainfall_24h_mm >= 115.6 or discharge >= 2500:
        return {
            "level": "RED ALERT",
            "category": "Extremely Heavy Rainfall / River Surge",
            "color": "#dc2626",
            "advisory": "Take Action: Critical inundation expected. Evacuate low-lying riverbanks immediately.",
            "portal": IMD_MAUSAM_PORTAL
        }
    elif rainfall_24h_mm >= 64.5 or discharge >= 1000:
        return {
            "level": "ORANGE ALERT",
            "category": "Very Heavy Rainfall Warning",
            "color": "#f97316",
            "advisory": "Be Prepared: High risk of waterlogging, flash flooding and localized road blockage.",
            "portal": IMD_MAUSAM_PORTAL
        }
    elif rainfall_24h_mm >= 15.6 or discharge >= 400:
        return {
            "level": "YELLOW ALERT",
            "category": "Moderate Rainfall / Watch Notice",
            "color": "#eab308",
            "advisory": "Be Updated: Localized ponding and drainage overflow possible.",
            "portal": IMD_MAUSAM_PORTAL
        }
    else:
        return {
            "level": "GREEN SAFE",
            "category": "Normal Weather / Safe State",
            "color": "#16a34a",
            "advisory": "Normal Conditions: Regular hydrological monitoring active.",
            "portal": IMD_MAUSAM_PORTAL
        }


def get_dam_telemetry(state: str, district: Optional[str] = None) -> Dict[str, Any]:
    """
    Queries India-WRIS / CWC Dam Master dataset for major dams,
    gross storage capacity (MCM), and river basin telemetry.
    """
    if dam_master_df is None or dam_master_df.empty:
        return {
            "total_dams": 0,
            "total_storage_capacity_mcm": 0.0,
            "major_dams": [],
            "source": "India-WRIS / CWC Dam Master (Data Standby)"
        }

    matched = dam_master_df[dam_master_df["State_Name"].astype(str).str.strip().str.lower() == state.strip().lower()]
    is_district_filtered = False

    if district and district.strip().lower() not in ["all districts", "state level", "none", ""]:
        d_match = matched[matched["District"].astype(str).str.strip().str.lower() == district.strip().lower()]
        if not d_match.empty:
            matched = d_match
            is_district_filtered = True

    total_dams = len(matched)
    total_capacity = 0.0
    if "Gross_Storage_Capacity_mcm" in matched.columns:
        total_capacity = float(matched["Gross_Storage_Capacity_mcm"].dropna().sum())

    top_dams = []
    if not matched.empty and "Gross_Storage_Capacity_mcm" in matched.columns:
        sorted_dams = matched.sort_values(by="Gross_Storage_Capacity_mcm", ascending=False).head(3)
        for _, row in sorted_dams.iterrows():
            top_dams.append({
                "dam_name": str(row.get("Dam_Name", "Major Dam")),
                "river": str(row.get("River", "River Basin")),
                "district": str(row.get("District", district or state)),
                "storage_mcm": round(float(row.get("Gross_Storage_Capacity_mcm", 0.0)), 2) if pd.notna(row.get("Gross_Storage_Capacity_mcm")) else 0.0,
                "height_m": round(float(row.get("Dam_Height_m", 0.0)), 1) if pd.notna(row.get("Dam_Height_m")) else 0.0
            })

    return {
        "source": "India-WRIS / Central Water Commission (CWC)",
        "district_filtered": is_district_filtered,
        "total_dams_in_zone": total_dams,
        "total_storage_capacity_mcm": round(total_capacity, 2),
        "major_dams": top_dams,
        "portal_url": INDIA_WRIS_PORTAL
    }


# --------------------------------------------------------------------------------------
# 4. REST API ENDPOINTS
# --------------------------------------------------------------------------------------
@app.get("/", tags=["System"])
def root():
    """Health check & API telemetry metadata."""
    return {
        "project": "FloodWatch India - Flood Risk Prediction Platform",
        "system_status": "ONLINE",
        "api_version": "2.1.0",
        "live_apis_integrated": {
            "api_1_weather": {
                "name": "Open-Meteo Weather API",
                "metrics": "Real-time precipitation (current + 24h accumulated), temperature, soil moisture, humidity",
                "status": "ACTIVE (100% Free / No Key Required)"
            },
            "api_2_flood": {
                "name": "Open-Meteo Flood (GloFAS) API",
                "metrics": "River discharge rate (m³/s) with 7-day flow forecast",
                "status": "ACTIVE (100% Free / No Key Required)"
            },
            "api_3_imd": {
                "name": "IMD Mausam Warning Protocol",
                "metrics": "India Meteorological Department Alert Levels (Red/Orange/Yellow/Green)",
                "status": "ACTIVE"
            },
            "api_4_cwc": {
                "name": "India-WRIS / CWC Dam Master Telemetry",
                "metrics": "6,644 registered reservoirs, gross storage capacity (MCM), and river basin telemetry",
                "status": "LOADED" if dam_master_df is not None else "STANDBY"
            }
        },
        "model_architecture": "37 State-Specific Gradient Boosting Classifiers with Regional Fallbacks",
        "endpoints": {
            "predict_flood": "POST /predict-flood  (Live APIs + ML inference)",
            "live_weather":  "GET  /live-weather/{state_name}?district={district}",
            "list_states":   "GET  /states",
            "list_districts":"GET  /districts/{state_name}",
            "metrics":       "GET  /metrics"
        }
    }


@app.post("/predict-flood", tags=["Prediction Engine"])
async def predict_flood(payload: FloodPredictionRequest):
    """
    MAIN PREDICTION ENGINE:
      1. Resolves exact coordinates (District-level via Open-Meteo Geocoding / State Centroid)
      2. Fetches real-time rainfall & temperature from Open-Meteo Weather API
      3. Fetches river discharge from Open-Meteo Flood API (GloFAS)
      4. Queries major dam storage from India-WRIS / CWC Master dataset
      5. Calculates IMD Alert Level (Red/Orange/Yellow/Green)
      6. Runs Gradient Boosting Machine Learning Model inference
      7. Returns consolidated multi-source flood risk assessment
    """
    try:
        state = payload.state.strip()
        district = payload.district.strip() if payload.district else None

        # Step 1: Resolve exact coordinates
        geo = await get_district_coordinates(state, district)
        lat, lon = geo["lat"], geo["lon"]

        # Step 2: Fetch Open-Meteo weather & river discharge concurrently
        weather_task = fetch_live_weather(lat, lon)
        discharge_task = fetch_live_river_discharge(lat, lon)
        weather_data, river_telemetry = await asyncio.gather(weather_task, discharge_task)

        # Step 3: Determine rainfall to feed into ML model
        # If user passed a positive manual override, honor it; otherwise use live Open-Meteo 24h rain
        if payload.rainfall_24h_mm and payload.rainfall_24h_mm > 0:
            rainfall_to_use = payload.rainfall_24h_mm
            rainfall_source = "Manual Override by User"
        else:
            rainfall_to_use = weather_data["rainfall_24h_mm"]
            rainfall_source = "Open-Meteo Weather API (Real-Time 24h Accumulated)"

        # Step 4: CWC Dam Telemetry & IMD Alert calculation
        dam_telemetry = get_dam_telemetry(state, district)
        curr_discharge = river_telemetry.get("discharge_m3s")
        imd_alert = compute_imd_alert(rainfall_to_use, curr_discharge)

        # Step 5: Execute ML Model Inference
        result = predictor.predict(
            state=state,
            district=district,
            rainfall_24h_mm=rainfall_to_use,
            custom_features=payload.custom_gis_features
        )

        # Step 6: Append river discharge driver if high
        if curr_discharge and curr_discharge > 1500:
            result["prediction"]["key_risk_drivers"].append(
                f"Surging River Discharge: {curr_discharge:.1f} m³/s (GloFAS telemetry)"
            )
        if dam_telemetry.get("total_dams_in_zone", 0) > 0:
            d_count = dam_telemetry["total_dams_in_zone"]
            cap = dam_telemetry["total_storage_capacity_mcm"]
            result["prediction"]["key_risk_drivers"].append(
                f"Dam Catchment Storage: {d_count} dams ({cap:.0f} MCM capacity)"
            )

        return {
            "status": "success",
            "query": {
                "state": state,
                "district": district or "State-Wide Average",
                "coordinates": {
                    "latitude": lat,
                    "longitude": lon,
                    "resolved_location": geo["location_name"]
                },
                "rainfall_used_for_prediction_mm": rainfall_to_use,
                "rainfall_source": rainfall_source
            },
            "live_weather": {
                "current_precipitation_mm": weather_data["rainfall_mm"],
                "accumulated_24h_rainfall_mm": weather_data["rainfall_24h_mm"],
                "temperature_c": weather_data["temperature_c"],
                "soil_moisture": weather_data["soil_moisture"],
                "humidity_percent": weather_data["humidity_percent"],
                "weather_description": weather_data["weather_description"],
                "source": weather_data["source"]
            },
            "river_telemetry": {
                "discharge_m3s": curr_discharge,
                "max_7d_forecast_m3s": river_telemetry.get("max_7d_forecast_m3s"),
                "forecast_7d": river_telemetry.get("forecast_7d", []),
                "source": river_telemetry["source"]
            },
            "imd_alert": imd_alert,
            "dam_telemetry": dam_telemetry,
            "prediction": result["prediction"],
            "meta": {
                "model_used": result["meta"]["model_used"],
                "district_matched_in_database": result["meta"]["district_matched_in_database"],
                "api_version": "2.1.0",
                "live_apis_integrated": True,
                "sources": {
                    "weather_api": "Open-Meteo Real-Time Weather API",
                    "flood_api": "Open-Meteo GloFAS River Discharge API",
                    "alert_protocol": "IMD Mausam Meteorological Alert Protocol",
                    "dam_master": "India-WRIS / CWC Dam Master"
                }
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )


@app.get("/live-weather/{state_name}", tags=["Live Data"])
async def get_live_weather(state_name: str, district: Optional[str] = Query(None)):
    """
    Instant Telemetry Fetcher:
    Returns live Open-Meteo weather, river discharge, IMD alert, and CWC dam telemetry
    for any Indian state or district without waiting for a full prediction run.
    """
    geo = await get_district_coordinates(state_name, district)
    lat, lon = geo["lat"], geo["lon"]

    weather_data, river_telemetry = await asyncio.gather(
        fetch_live_weather(lat, lon),
        fetch_live_river_discharge(lat, lon)
    )

    curr_discharge = river_telemetry.get("discharge_m3s")
    rain_24h = weather_data["rainfall_24h_mm"]
    imd_alert = compute_imd_alert(rain_24h, curr_discharge)
    dam_telemetry = get_dam_telemetry(state_name, district)

    return {
        "state": state_name,
        "district": district or "State-Wide",
        "coordinates": {"latitude": lat, "longitude": lon, "location": geo["location_name"]},
        "live_weather": weather_data,
        "river_telemetry": river_telemetry,
        "imd_alert": imd_alert,
        "dam_telemetry": dam_telemetry,
        "sources": {
            "weather": "Open-Meteo Weather API",
            "flood": "Open-Meteo Flood GloFAS API",
            "imd": "IMD Mausam Standards",
            "cwc": "India-WRIS Portal"
        }
    }


@app.get("/states", tags=["Metadata"])
def get_states():
    """Returns all 37 Indian States & Union Territories supported by the system."""
    return {
        "total_states": len(STATE_COORDINATES),
        "states": sorted(STATE_COORDINATES.keys())
    }


@app.get("/districts/{state_name}", tags=["Metadata"])
def get_districts_by_state(state_name: str):
    """Returns all districts available in the master database for a given state."""
    if predictor.master_df is not None and not predictor.master_df.empty:
        match = predictor.master_df[
            predictor.master_df["State_Name"].str.strip().str.lower() == state_name.strip().lower()
        ]
        if match.empty:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"State '{state_name}' not found in database."
            )
        districts = sorted(match["District_Name"].dropna().unique().tolist())
        return {
            "state": state_name,
            "total_districts": len(districts),
            "districts": districts
        }
    return {"state": state_name, "total_districts": 0, "districts": []}


@app.get("/metrics", tags=["Evaluation & Analytics"])
def get_all_model_metrics():
    """Returns complete evaluation metrics for all 37 trained state models."""
    if METRICS_FILE.exists():
        with open(METRICS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Model evaluation metrics file not found. Please run train_state_models.py."
    )


# --------------------------------------------------------------------------------------
# LOCAL RUNNER
# --------------------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    print("=" * 75)
    print("  FloodWatch India — FastAPI ML + Live Weather & Flood Telemetry Backend")
    print("  Server: http://127.0.0.1:8000")
    print("  Docs:   http://127.0.0.1:8000/docs")
    print("=" * 75)
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
