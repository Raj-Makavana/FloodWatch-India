import os
import glob
import pandas as pd
import numpy as np

def prepare_master_dataset():
    divided_root = r'C:\Users\Lenovo\Desktop\FRP\data\divideddata'
    master_dir = os.path.join(divided_root, 'All_India_National_Masters')
    os.makedirs(master_dir, exist_ok=True)
    
    print("="*65)
    print(">>> FLOODWATCH INDIA - DIVIDEDDATA MASTER TRAINING GENERATOR <<<")
    print("="*65)

    # 1. Base District Elevation & Flood Summary from All_India_National_Masters
    elevation_file = os.path.join(master_dir, 'cleaned_district_flood_elevation_summary.csv')
    dfsi_file = os.path.join(master_dir, 'cleaned_dfsi.csv')
    metrics_file = os.path.join(master_dir, 'cleaned_district_flood_metrics.csv')
    
    print("\n[Step 1/5] Loading Base District Elevation & Flood Metrics from divideddata/All_India_National_Masters...")
    if os.path.exists(elevation_file):
        df_base = pd.read_csv(elevation_file)
    elif os.path.exists(dfsi_file):
        df_base = pd.read_csv(dfsi_file)
    elif os.path.exists(metrics_file):
        df_base = pd.read_csv(metrics_file)
    else:
        raise FileNotFoundError("Base district flood elevation files not found in data/divideddata/All_India_National_Masters!")

    # Normalize district and state column names
    col_rename = {}
    for c in df_base.columns:
        if c.lower() in ['dist_name', 'district', 'district_name']:
            col_rename[c] = 'District_Name'
        elif c.lower() in ['state_name', 'state']:
            col_rename[c] = 'State_Name'
    df_base.rename(columns=col_rename, inplace=True)
    
    # Clean string casing for reliable joins
    df_base['District_Clean'] = df_base['District_Name'].astype(str).str.strip().str.upper()
    df_base['State_Clean'] = df_base['State_Name'].astype(str).str.strip().str.upper()

    print(f" -> Base dataset loaded with {len(df_base)} districts.")

    # Merge DFSI if separate
    if os.path.exists(dfsi_file) and 'DFSI' not in df_base.columns:
        df_dfsi = pd.read_csv(dfsi_file)
        df_dfsi['District_Clean'] = df_dfsi['District_Name'].astype(str).str.strip().str.upper()
        df_dfsi['State_Clean'] = df_dfsi['State_Name'].astype(str).str.strip().str.upper()
        df_base = pd.merge(df_base, df_dfsi[['District_Clean', 'State_Clean', 'DFSI']], on=['District_Clean', 'State_Clean'], how='left')

    # 2. Dam Aggregation per District from All_India_National_Masters
    dam_file = os.path.join(master_dir, 'cleaned_dam_master_india.csv')
    print("\n[Step 2/5] Aggregating Dam & Reservoir Capacity from divideddata/All_India_National_Masters...")
    if os.path.exists(dam_file):
        try:
            df_dams = pd.read_csv(dam_file, low_memory=False)
            df_dams['District_Clean'] = df_dams['District'].astype(str).str.strip().str.upper()
            df_dams['State_Clean'] = df_dams['State_Name'].astype(str).str.strip().str.upper()
            
            # Numeric conversion
            df_dams['Gross_Storage_Capacity_mcm'] = pd.to_numeric(df_dams['Gross_Storage_Capacity_mcm'], errors='coerce').fillna(0)
            df_dams['Dam_Height_m'] = pd.to_numeric(df_dams['Dam_Height_m'], errors='coerce').fillna(0)
            
            # Group by District & State
            dam_agg = df_dams[df_dams['District_Clean'] != 'NAN'].groupby(['District_Clean', 'State_Clean']).agg(
                Total_Dams_Count=('Dam_PIC_ID', 'count'),
                Total_Gross_Storage_Capacity_mcm=('Gross_Storage_Capacity_mcm', 'sum'),
                Max_Dam_Height_m=('Dam_Height_m', 'max')
            ).reset_index()
            
            df_base = pd.merge(df_base, dam_agg, on=['District_Clean', 'State_Clean'], how='left')
            df_base['Total_Dams_Count'] = df_base['Total_Dams_Count'].fillna(0)
            df_base['Total_Gross_Storage_Capacity_mcm'] = df_base['Total_Gross_Storage_Capacity_mcm'].fillna(0)
            df_base['Max_Dam_Height_m'] = df_base['Max_Dam_Height_m'].fillna(0)
            print(f" -> Merged dam metrics for {len(dam_agg)} districts with active dams.")
        except Exception as e:
            print(f" -> Notice: Dam aggregation skipped ({e})")
            df_base['Total_Dams_Count'] = 0
            df_base['Total_Gross_Storage_Capacity_mcm'] = 0
            df_base['Max_Dam_Height_m'] = 0

    # 3. Waterbody Census (DWA) Aggregation from State Subfolders in divideddata
    print("\n[Step 3/5] Aggregating Satellite Waterbody Census (DWA) across State Folders in divideddata...")
    dwa_files = glob.glob(os.path.join(divided_root, "*", "cleaned_dwa_ph*.csv")) + glob.glob(os.path.join(divided_root, "*", "cleaned_wb_*.csv"))
    dwa_list = []
    
    for f in dwa_files:
        try:
            df_dwa_part = pd.read_csv(f, usecols=lambda col: col in ['State_Name', 'District', 'GIS_Area_ha', 'Shape_Area_sqm', 'Perimeter_Length_m', 'Water_Spread_Area', 'Storage_Capacity'], low_memory=False)
            if not df_dwa_part.empty and 'District' in df_dwa_part.columns:
                dwa_list.append(df_dwa_part)
        except Exception:
            continue
            
    if dwa_list:
        combined_dwa = pd.concat(dwa_list, ignore_index=True)
        combined_dwa['District_Clean'] = combined_dwa['District'].astype(str).str.strip().str.upper()
        
        # Numeric conversions
        for num_col in ['GIS_Area_ha', 'Shape_Area_sqm', 'Perimeter_Length_m', 'Water_Spread_Area', 'Storage_Capacity']:
            if num_col in combined_dwa.columns:
                combined_dwa[num_col] = pd.to_numeric(combined_dwa[num_col], errors='coerce').fillna(0)
                
        dwa_agg = combined_dwa.groupby('District_Clean').agg(
            Total_Waterbodies_Count=('District', 'count'),
            Total_Waterbody_GIS_Area_ha=('GIS_Area_ha', 'sum') if 'GIS_Area_ha' in combined_dwa.columns else ('District', 'count'),
            Avg_Waterbody_Perimeter_m=('Perimeter_Length_m', 'mean') if 'Perimeter_Length_m' in combined_dwa.columns else ('District', 'count')
        ).reset_index()
        
        df_base = pd.merge(df_base, dwa_agg, on='District_Clean', how='left')
        df_base['Total_Waterbodies_Count'] = df_base['Total_Waterbodies_Count'].fillna(0)
        df_base['Total_Waterbody_GIS_Area_ha'] = df_base['Total_Waterbody_GIS_Area_ha'].fillna(0)
        df_base['Avg_Waterbody_Perimeter_m'] = df_base['Avg_Waterbody_Perimeter_m'].fillna(0)
        print(f" -> Merged waterbody metrics from {len(combined_dwa)} census waterbody records.")
    else:
        df_base['Total_Waterbodies_Count'] = 0
        df_base['Total_Waterbody_GIS_Area_ha'] = 0
        df_base['Avg_Waterbody_Perimeter_m'] = 0

    # 4. Feature Engineering for Gradient Boosting Targets
    print("\n[Step 4/5] Engineering Machine Learning Targets & Categories...")
    
    # Ensure DFSI exists
    if 'DFSI' in df_base.columns:
        df_base['DFSI'] = pd.to_numeric(df_base['DFSI'], errors='coerce')
        median_dfsi = df_base['DFSI'].median()
        df_base['DFSI'] = df_base['DFSI'].fillna(median_dfsi)
        
        # Target 1: 4-Class Flood Susceptibility Risk Level
        df_base['Flood_Risk_Category'] = pd.qcut(
            df_base['DFSI'], 
            q=4, 
            labels=['Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk']
        )
        
        # Target 2: Binary High-Risk Target (0 = Low/Med, 1 = High/Extreme)
        df_base['High_Risk_Binary'] = (df_base['DFSI'] >= df_base['DFSI'].quantile(0.70)).astype(int)
        
        # Target 3: Numerical Severity Score normalized 0-100
        min_d = df_base['DFSI'].min()
        max_d = df_base['DFSI'].max()
        df_base['Flood_Severity_Score_100'] = ((df_base['DFSI'] - min_d) / (max_d - min_d) * 100).round(2)

    # Clean intermediate columns
    df_base.drop(columns=['District_Clean', 'State_Clean'], inplace=True, errors='ignore')
    
    # Fill any remaining numeric NaNs with column medians
    num_cols = df_base.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        df_base[col] = df_base[col].fillna(df_base[col].median())

    # 5. Export Master Training CSV inside divideddata
    print("\n[Step 5/5] Exporting Master Training Dataset to divideddata...")
    output_path = os.path.join(master_dir, 'master_training_dataset_divided.csv')
    df_base.to_csv(output_path, index=False)
    
    print("\n" + "="*65)
    print(f"[SUCCESS] DIVIDED DATASET CREATED SUCCESSFULLY!")
    print(f"Output File: {output_path}")
    print(f"Total Samples (Districts): {df_base.shape[0]}")
    print(f"Total Features: {df_base.shape[1]}")
    print(f"Columns List:\n{list(df_base.columns)}")
    print("="*65)
    
    return df_base

if __name__ == '__main__':
    prepare_master_dataset()
