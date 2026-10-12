import os
import glob
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score

# 1. Load dataset
dataset_path = 'data/divideddata/All_India_National_Masters/master_training_dataset_divided.csv'
if not os.path.exists(dataset_path):
    raise FileNotFoundError(f"Could not find dataset at: {dataset_path}")

df_test = pd.read_csv(dataset_path)

# 2. Auto-detect State and Target columns
state_col = None
for col in df_test.columns:
    if 'state' in col.lower() or 'ut' in col.lower():
        state_col = col
        break

target_col = 'Flood_Severity_Score_100' if 'Flood_Severity_Score_100' in df_test.columns else df_test.columns[-1]

print(f"-> Using State column: '{state_col}'")
print(f"-> Using Target column: '{target_col}' (will be binarized for classification)")

print(f"\n{'State / UT':<25} | {'Accuracy':<10} | {'Total Samples':<13}")
print("-" * 56)

overall_true = []
overall_pred = []

model_files = glob.glob('models/*_flood_model.joblib')

for model_path in model_files:
    filename = os.path.basename(model_path)
    state_key = filename.replace('_flood_model.joblib', '').replace('_', ' ').title()
    
    # Filter dataset for this specific state/UT
    state_group = df_test[df_test[state_col].astype(str).str.contains(state_key, case=False, na=False)]
    
    if len(state_group) == 0:
        continue
        
    try:
        model = joblib.load(model_path)
        
        # Determine features
        if hasattr(model, "feature_names_in_"):
            feature_cols = model.feature_names_in_
        else:
            feature_cols = [
                'Percent_Flooded_Area', 'Parmanent_Water', 'Corrected_Percent_Flooded_Area',
                'Population', 'Mean_Flood_Duration', 'Total_Dams_Count',
                'Total_Gross_Storage_Capacity_mcm', 'Max_Dam_Height_m',
                'Total_Waterbodies_Count', 'Total_Waterbody_GIS_Area_ha', 'Avg_Waterbody_Perimeter_m'
            ]
            
        X_state = state_group[feature_cols]
        
        # Binarize the continuous target score into 0 or 1 (threshold = 50)
        raw_target = state_group[target_col]
        y_true_state = (raw_target >= 50).astype(int)
        
        y_pred_state = model.predict(X_state)
        
        acc = accuracy_score(y_true_state, y_pred_state)
        print(f"{state_key:<25} | {acc*100:6.2f}%    | {len(state_group):<13}")
        
        overall_true.extend(y_true_state)
        overall_pred.extend(y_pred_state)
        
    except Exception as e:
        print(f"Error evaluating {state_key}: {e}")

# Print summary
if overall_true:
    overall_acc = accuracy_score(overall_true, overall_pred)
    print("-" * 56)
    print(f"{'OVERALL ACCURACY':<25} | {overall_acc*100:6.2f}%    | {len(overall_true):<13}\n")
else:
    print("No predictions were successfully executed.")