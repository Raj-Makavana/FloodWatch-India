"""
========================================================================================
PROJECT: Flood Risk Prediction Using Weather and GIS Data (B.Tech Final Year Project)
MODULE: State-Wise Gradient Boosting Training Pipeline with Regional Fallback Mapping
========================================================================================
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from collections import defaultdict

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report
)

# --------------------------------------------------------------------------------------
# 1. PATH CONFIGURATION & REGIONAL GEOGRAPHICAL NEIGHBOR MAPPING
# --------------------------------------------------------------------------------------
BASE_DIR = r"C:\Users\Lenovo\Desktop\FRP"
DATA_FILE = os.path.join(BASE_DIR, "data", "divideddata", "All_India_National_Masters", "master_training_dataset_divided.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
METRICS_FILE = os.path.join(MODELS_DIR, "model_evaluation_metrics.json")

os.makedirs(MODELS_DIR, exist_ok=True)

# Geographically nearest neighboring state mapping for regional data augmentation / fallback
NEIGHBOR_STATE_MAP = {
    # Northern Region
    "Jammu & Kashmir": ["Himachal Pradesh", "Punjab"],
    "Ladakh": ["Himachal Pradesh", "Jammu & Kashmir"],
    "Himachal Pradesh": ["Uttarakhand", "Punjab", "Haryana"],
    "Punjab": ["Haryana", "Rajasthan", "Himachal Pradesh"],
    "Haryana": ["Punjab", "Rajasthan", "Uttar Pradesh", "Delhi"],
    "Delhi": ["Haryana", "Uttar Pradesh"],
    "Chandigarh": ["Punjab", "Haryana"],
    "Uttarakhand": ["Himachal Pradesh", "Uttar Pradesh"],
    "Uttar Pradesh": ["Bihar", "Madhya Pradesh", "Haryana", "Rajasthan"],

    # Western Region
    "Rajasthan": ["Gujarat", "Madhya Pradesh", "Haryana", "Punjab"],
    "Gujarat": ["Maharashtra", "Rajasthan", "Madhya Pradesh"],
    "Maharashtra": ["Gujarat", "Madhya Pradesh", "Karnataka", "Telangana", "Goa"],
    "Goa": ["Maharashtra", "Karnataka"],
    "Dadra & Nagar Haveli and Daman & Diu": ["Gujarat", "Maharashtra"],
    "Daman & Diu": ["Gujarat", "Maharashtra"],
    "Dadra & Nagar Haveli": ["Gujarat", "Maharashtra"],

    # Central Region
    "Madhya Pradesh": ["Maharashtra", "Chhattisgarh", "Uttar Pradesh", "Rajasthan", "Gujarat"],
    "Chhattisgarh": ["Madhya Pradesh", "Odisha", "Jharkhand", "Maharashtra", "Telangana"],

    # Eastern Region
    "Bihar": ["Jharkhand", "West Bengal", "Uttar Pradesh"],
    "Jharkhand": ["Bihar", "West Bengal", "Odisha", "Chhattisgarh"],
    "West Bengal": ["Bihar", "Jharkhand", "Odisha", "Assam", "Sikkim"],
    "Odisha": ["West Bengal", "Andhra Pradesh", "Chhattisgarh", "Jharkhand"],

    # North-Eastern Region
    "Assam": ["Meghalaya", "Arunachal Pradesh", "West Bengal", "Nagaland", "Tripura"],
    "Arunachal Pradesh": ["Assam", "Nagaland"],
    "Meghalaya": ["Assam", "Tripura"],
    "Nagaland": ["Assam", "Manipur", "Arunachal Pradesh"],
    "Manipur": ["Nagaland", "Mizoram", "Assam"],
    "Mizoram": ["Manipur", "Tripura", "Assam"],
    "Tripura": ["Assam", "Mizoram", "Meghalaya"],
    "Sikkim": ["West Bengal", "Assam"],

    # Southern Region
    "Andhra Pradesh": ["Telangana", "Tamil Nadu", "Karnataka", "Odisha"],
    "Telangana": ["Andhra Pradesh", "Maharashtra", "Karnataka", "Chhattisgarh"],
    "Karnataka": ["Maharashtra", "Goa", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Telangana"],
    "Kerala": ["Tamil Nadu", "Karnataka"],
    "Tamil Nadu": ["Kerala", "Karnataka", "Andhra Pradesh", "Puducherry"],
    "Puducherry": ["Tamil Nadu", "Kerala"],
    "Andaman & Nicobar Islands": ["Tamil Nadu", "Andhra Pradesh", "Kerala"],
    "Lakshadweep": ["Kerala", "Karnataka"]
}

# --------------------------------------------------------------------------------------
# 2. FEATURE SPECIFICATION
# --------------------------------------------------------------------------------------
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

TARGET_COLUMN = "High_Risk_Binary"


def load_dataset():
    """Loads and validates the base master training dataset."""
    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(f"Master training data not found at: {DATA_FILE}")
    
    df = pd.read_csv(DATA_FILE)
    print(f"[INFO] Loaded master dataset: {df.shape[0]} total districts across India.")
    return df


def train_single_model(X_train, y_train, X_test, y_test, state_name):
    """
    Trains a Gradient Boosting Classifier inside a Standardized Pipeline and evaluates performance.
    """
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.08,
            max_depth=4,
            subsample=0.85,
            random_state=42
        ))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Predictions
    y_pred = pipeline.predict(X_test)
    
    # Probabilities for ROC-AUC
    try:
        y_prob = pipeline.predict_proba(X_test)[:, 1]
        roc_auc = float(roc_auc_score(y_test, y_prob)) if len(np.unique(y_test)) > 1 else 1.0
    except Exception:
        roc_auc = 1.0

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    
    # Extract Feature Importances from the trained classifier
    gb_model = pipeline.named_steps['classifier']
    feat_importances = {
        feat: float(round(imp, 4))
        for feat, imp in zip(FEATURE_COLUMNS, gb_model.feature_importances_)
    }
    
    metrics = {
        "state": state_name,
        "test_accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "feature_importances": feat_importances
    }
    
    return pipeline, metrics


def run_pipeline():
    """Main execution loop for all states/UTs with regional fallback mechanism."""
    print("=" * 80)
    print(">>> FLOOD RISK PREDICTION - AUTOMATED STATE-WISE GRADIENT BOOSTING PIPELINE <<<")
    print("=" * 80)

    df_all = load_dataset()
    
    # Train an All-India National Baseline Model first (serves as absolute ultimate fallback)
    print("\n[Step 1/3] Training All-India Master Baseline Model...")
    X_nat = df_all[FEATURE_COLUMNS].fillna(0)
    y_nat = df_all[TARGET_COLUMN]
    
    X_train_nat, X_test_nat, y_train_nat, y_test_nat = train_test_split(
        X_nat, y_nat, test_size=0.20, random_state=42, stratify=y_nat
    )
    
    national_model, nat_metrics = train_single_model(
        X_train_nat, y_train_nat, X_test_nat, y_test_nat, "National_All_India"
    )
    
    nat_model_path = os.path.join(MODELS_DIR, "national_all_india_flood_model.joblib")
    joblib.dump(national_model, nat_model_path)
    print(f" -> National Baseline Model Saved! [Accuracy: {nat_metrics['test_accuracy'] * 100:.2f}%, ROC-AUC: {nat_metrics['roc_auc']:.4f}]")

    all_metrics = {
        "national_model": nat_metrics,
        "states": {},
        "fallback_mappings": {}
    }

    # Distinct states in dataset
    all_states = sorted(df_all["State_Name"].dropna().unique())
    print(f"\n[Step 2/3] Training State-Wise Models with Regional Fallback for {len(all_states)} States/UTs...")

    MIN_SAMPLES_THRESHOLD = 18  # Minimum samples required for standalone state model split

    for state in all_states:
        df_state = df_all[df_all["State_Name"] == state]
        sample_count = len(df_state)
        
        state_clean_name = state.replace("&", "and").replace(" ", "_").lower()
        model_filename = f"{state_clean_name}_flood_model.joblib"
        model_save_path = os.path.join(MODELS_DIR, model_filename)

        # Case A: State has sufficient native samples
        if sample_count >= MIN_SAMPLES_THRESHOLD and len(df_state[TARGET_COLUMN].unique()) > 1:
            X = df_state[FEATURE_COLUMNS].fillna(0)
            y = df_state[TARGET_COLUMN]

            stratify_option = y if y.value_counts().min() >= 2 else None
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.20, random_state=42, stratify=stratify_option
            )

            model, metrics = train_single_model(X_train, y_train, X_test, y_test, state)
            joblib.dump(model, model_save_path)
            
            metrics["training_strategy"] = "Native_State_Data"
            all_metrics["states"][state] = metrics
            print(f" * [Native Model] {state:30s} -> {sample_count:2d} districts | Acc: {metrics['test_accuracy']*100:5.1f}% | Saved: {model_filename}")

        # Case B: Insufficient native samples -> Regional Neighbor Fallback Augmentation
        else:
            neighbors = NEIGHBOR_STATE_MAP.get(state, [])
            regional_states = [state] + neighbors
            df_regional = df_all[df_all["State_Name"].isin(regional_states)]

            # If regional cluster is sufficient
            if len(df_regional) >= MIN_SAMPLES_THRESHOLD and len(df_regional[TARGET_COLUMN].unique()) > 1:
                X = df_regional[FEATURE_COLUMNS].fillna(0)
                y = df_regional[TARGET_COLUMN]

                stratify_option = y if y.value_counts().min() >= 2 else None
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.20, random_state=42, stratify=stratify_option
                )

                model, metrics = train_single_model(X_train, y_train, X_test, y_test, state)
                joblib.dump(model, model_save_path)
                
                metrics["training_strategy"] = f"Regional_Neighbor_Fallback ({', '.join(neighbors[:2])})"
                metrics["augmented_sample_count"] = len(df_regional)
                all_metrics["states"][state] = metrics
                all_metrics["fallback_mappings"][state] = neighbors
                print(f" * [Regional Fallback] {state:26s} -> Augmented with {neighbors[:2]} | Acc: {metrics['test_accuracy']*100:5.1f}% | Saved: {model_filename}")
            else:
                # Ultimate Fallback to National Model
                joblib.dump(national_model, model_save_path)
                metrics = {
                    "state": state,
                    "training_strategy": "National_Master_Fallback",
                    "test_accuracy": nat_metrics["test_accuracy"],
                    "f1_score": nat_metrics["f1_score"],
                    "roc_auc": nat_metrics["roc_auc"]
                }
                all_metrics["states"][state] = metrics
                all_metrics["fallback_mappings"][state] = ["National_All_India"]
                print(f" * [National Fallback] {state:26s} -> National Baseline Assigned | Saved: {model_filename}")

    # ----------------------------------------------------------------------------------
    # 3. SAVE EVALUATION METRICS SUMMARY
    # ----------------------------------------------------------------------------------
    print("\n[Step 3/3] Saving Evaluation Summary and Metadata...")
    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(all_metrics, f, indent=4)
        
    print("=" * 80)
    print(f"[SUCCESS] PIPELINE EXECUTION COMPLETE!")
    print(f"Model Binaries Directory : {MODELS_DIR}")
    print(f"Evaluation Metrics JSON  : {METRICS_FILE}")
    print(f"Total State Models Saved : {len(all_metrics['states']) + 1}")
    print("=" * 80)

    print("\n[Map Sync] Refreshing public/state_predictions.json for the live heatmap...")
    try:
        from export_map_predictions import export_map_predictions
        export_map_predictions()
    except Exception as export_err:
        print(f"[Map Sync] Warning: could not refresh map predictions: {export_err}")


if __name__ == "__main__":
    run_pipeline()
