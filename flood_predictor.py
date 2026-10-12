"""
========================================================================================
PROJECT: Flood Risk Prediction Using Weather and GIS Data (B.Tech Project)
MODULE: Production Inference Engine & Flood Risk Prediction Helper
========================================================================================
"""

import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
import joblib
import pandas as pd
import numpy as np

BASE_DIR = r"C:\Users\Lenovo\Desktop\FRP"
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_FILE = os.path.join(BASE_DIR, "data", "divideddata", "All_India_National_Masters", "master_training_dataset_divided.csv")

FEATURE_COLUMNS = [
    "Percent_Flooded_Area",
    "Parmanent_Water",
    "Corrected_Percent_Flooded_Area",
    "Population",
    "Mean_Flood_Duration",
    "Total_Dams_Count",
    "Total_Gross_Storage_Capacity_mcm",
    "Max_Dam_Height_m",
    "Total_Waterbodies_Count",
    "Total_Waterbody_GIS_Area_ha",
    "Avg_Waterbody_Perimeter_m"
]

class FloodRiskPredictor:
    def __init__(self):
        self.models_cache = {}
        self.master_df = None
        self._load_master_data()
        
    def _load_master_data(self):
        if os.path.exists(DATA_FILE):
            self.master_df = pd.read_csv(DATA_FILE)
        else:
            self.master_df = pd.DataFrame()

    def _get_model(self, state_name: str):
        """Loads and caches the state-specific or national fallback model."""
        state_clean = state_name.replace("&", "and").replace(" ", "_").lower()
        model_file = f"{state_clean}_flood_model.joblib"
        model_path = os.path.join(MODELS_DIR, model_file)
        
        # Fallback to national model if state model not found
        if not os.path.exists(model_path):
            model_path = os.path.join(MODELS_DIR, "national_all_india_flood_model.joblib")
            
        if model_path not in self.models_cache:
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found at: {model_path}. Please run train_state_models.py first.")
            self.models_cache[model_path] = joblib.load(model_path)
            
        return self.models_cache[model_path], os.path.basename(model_path)

    def predict(self, state: str, district: str = None, rainfall_24h_mm: float = 0.0, custom_features: dict = None) -> dict:
        """
        Calculates flood risk probability and categorization for a given state & district.
        
        Args:
            state (str): Name of Indian State / UT (e.g. "Gujarat", "Bihar", "Assam")
            district (str, optional): Name of district in state (e.g. "Patna", "Ahmedabad")
            rainfall_24h_mm (float, optional): Forecasted or recorded 24h rainfall in mm
            custom_features (dict, optional): Custom override for GIS/Terrain features
            
        Returns:
            dict: Structured prediction response with risk category, probability, and recommendations
        """
        # 1. Retrieve district GIS/Terrain base features
        base_features = {}
        district_found = False
        
        if self.master_df is not None and district:
            # Case-insensitive matching
            match = self.master_df[
                (self.master_df["State_Name"].str.strip().str.lower() == state.strip().lower()) &
                (self.master_df["District_Name"].str.strip().str.lower() == district.strip().lower())
            ]
            if not match.empty:
                row = match.iloc[0]
                base_features = {col: float(row.get(col, 0.0)) for col in FEATURE_COLUMNS}
                district_found = True

        # If district not matched in DB, fallback to state average or defaults
        if not district_found:
            state_match = self.master_df[self.master_df["State_Name"].str.strip().str.lower() == state.strip().lower()]
            if not state_match.empty:
                base_features = {col: float(state_match[col].median()) for col in FEATURE_COLUMNS}
            else:
                base_features = {col: 0.0 for col in FEATURE_COLUMNS}

        # Apply any custom overrides if passed
        if custom_features:
            for k, v in custom_features.items():
                if k in base_features:
                    base_features[k] = float(v)

        # 2. Base Model Inference for Historical District Baseline
        model, model_file = self._get_model(state)
        input_df = pd.DataFrame([base_features])[FEATURE_COLUMNS]
        
        # Raw baseline probability from trained Gradient Boosting model
        p_base = float(model.predict_proba(input_df)[0][1])

        # 3. Dynamic Hydrometeorological Scaling (Open-Meteo Live Rainfall & River Flow Integration)
        # Real-time risk = District Baseline Vulnerability * Live Rain/Flow Intensity
        if rainfall_24h_mm <= 5.0:
            # Dry / Minimal rain conditions: Dampen baseline risk for current day
            dampener = 0.04 + 0.16 * (max(0.0, rainfall_24h_mm) / 5.0)
            prob_raw = p_base * dampener
        else:
            # Moderate to extreme weather
            rain_scale = rainfall_24h_mm / 85.0  # 85mm threshold for severe inundation
            # Sigmoidal boost anchored around district baseline
            boost = 1.0 / (1.0 + np.exp(-3.2 * (rain_scale - 0.75)))
            prob_raw = p_base * 0.25 + 0.75 * boost

        prob_raw = float(np.clip(prob_raw, 0.0001, 0.9999))
        prob_percent = round(prob_raw * 100, 2)
        
        # 4. Determine Risk Category & Alert Level
        if prob_percent >= 75.0 or rainfall_24h_mm >= 115.6:
            risk_category = "Extreme High Risk"
            alert_level = "RED EMERGENCY ALERT"
            color_code = "#dc2626"
            action_guidance = "Immediate evacuation warning for low-lying areas. River overflow imminent."
        elif prob_percent >= 50.0 or rainfall_24h_mm >= 64.5:
            risk_category = "High Risk"
            alert_level = "ORANGE WARNING ALERT"
            color_code = "#ea580c"
            action_guidance = "Flood defense activation required. Prepare emergency response teams."
        elif prob_percent >= 25.0 or rainfall_24h_mm >= 15.6:
            risk_category = "Moderate Risk"
            alert_level = "YELLOW WATCH ALERT"
            color_code = "#ca8a04"
            action_guidance = "Continuous monitoring of river gauge levels and catchment precipitation."
        else:
            risk_category = "Low Risk"
            alert_level = "GREEN SAFE"
            color_code = "#16a34a"
            action_guidance = "Normal conditions. Standard hydrological monitoring active."

        # 5. Extract Key Drivers
        top_drivers = []
        if rainfall_24h_mm >= 115.6:
            top_drivers.append(f"Extreme Cloudburst Rainfall ({rainfall_24h_mm:.1f} mm/24h)")
        elif rainfall_24h_mm >= 64.5:
            top_drivers.append(f"Heavy 24h Rainfall Intensity ({rainfall_24h_mm:.1f} mm/24h)")
        elif rainfall_24h_mm >= 15.6:
            top_drivers.append(f"Moderate Rain Activity ({rainfall_24h_mm:.1f} mm/24h)")
        else:
            top_drivers.append("Low / Dry Precipitation Conditions")

        if base_features.get("Percent_Flooded_Area", 0) > 1.0:
            top_drivers.append("High Historical Flood Inundation Index")
        if base_features.get("Total_Gross_Storage_Capacity_mcm", 0) > 500:
            top_drivers.append("High Dam Catchment Water Inflow")

        return {
            "query": {
                "state": state,
                "district": district if district else "State Average / Custom",
                "rainfall_24h_mm": rainfall_24h_mm
            },
            "prediction": {
                "flood_risk_probability": f"{prob_percent}%",
                "risk_probability_raw": prob_raw,
                "risk_category": risk_category,
                "alert_level": alert_level,
                "color_code": color_code,
                "action_guidance": action_guidance,
                "key_risk_drivers": top_drivers
            },
            "meta": {
                "model_used": model_file,
                "district_matched_in_database": district_found
            }
        }


# Quick test routine if run directly
if __name__ == "__main__":
    predictor = FloodRiskPredictor()
    
    print("="*70)
    print("TEST 1: Patna, Bihar (Heavy Rainfall = 135 mm)")
    res1 = predictor.predict(state="Bihar", district="Patna", rainfall_24h_mm=135.0)
    print(res1)
    
    print("\n" + "="*70)
    print("TEST 2: Ahmedabad, Gujarat (Normal Rainfall = 15 mm)")
    res2 = predictor.predict(state="Gujarat", district="Ahmedabad", rainfall_24h_mm=15.0)
    print(res2)
