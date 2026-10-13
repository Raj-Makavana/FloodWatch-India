# 🌊 Flood Watch India
### Flood Risk Prediction Using Weather and GIS Data

**Live Website:** https://flood-watch-india.vercel.app/

Flood Watch India is a web-based platform designed to assess and visualize flood risk across different regions of India. The project combines weather information, geographical data, historical flood records, and machine learning techniques to identify areas that may be vulnerable to flooding.

The main goal is to make flood-related information easier to understand and support better flood preparedness and risk management.

## 📌 Project Overview

Floods can cause significant damage to human life, agriculture, infrastructure, and the environment. Identifying flood-prone areas in advance can help communities and disaster management authorities prepare for potential flood events.

Flood Watch India uses weather and Geographic Information System (GIS) data along with machine learning algorithms to estimate regional flood risk. The results are presented through a web-based interface that helps users explore flood-related information.

## 🎯 Objectives

- Analyse rainfall and historical flood data to understand flood risk.
- Use river water levels and river discharge to support flood risk assessment.
- Incorporate reservoir storage and dam location data.
- Use elevation and other geographical information to identify potentially vulnerable regions.
- Apply machine learning algorithms to estimate regional flood risk.
- Present flood risk information through interactive geographical visualizations.
- Support flood awareness and informed decision-making.

## 🛠️ Technologies and Methods

### Machine Learning
- **Gradient Boosting**

This algorithm is used to analyse available data and estimate flood risk. Model performance is evaluated using test datasets.

### Data Sources

The project documents identify the following data categories and sources:

- **Rainfall:** National Water Data Portal and weather data sources.
- **River Water Level:** India-WRIS and Central Water Commission datasets.
- **River Discharge:** Historical and forecast river flow data.
- **Reservoir Storage:** Water storage records.
- **Dam Locations:** Geographical information about major dams.
- **Elevation:** Digital Elevation Model (DEM) data.
- **Historical Flood Records:** Historical flood and flood hazard information.
- **Groundwater Level:** Groundwater monitoring data.

### APIs and Data Services

- **Open-Meteo Weather API:** Weather and rainfall information.
- **Open-Meteo Flood API (GloFAS):** River discharge and water flow forecasts.
- **India-WRIS and CWC:** Water resources, river levels, reservoir storage, and dam information.
- **FastAPI Backend:** Backend endpoints developed to serve predictions from trained machine learning models.

## ✨ Key Features

The project focuses on presenting flood-related information in an accessible web interface.

- **Regional Flood Risk Assessment:** Displays flood risk information for Indian states and regions.
- **Interactive Maps:** Helps users explore geographical flood risk information.
- **State-Wise Information:** Provides information about individual states.
- **Historical Data Analysis:** Uses historical flood and water-related records to support risk assessment.
- **Weather and Water Data Integration:** Combines different environmental parameters for analysis.

Additional features, including live location-based risk information, historical trend charts, email and SMS alerts, and nearby relief centre information, are part of the project's planned or ongoing development.

## ⚙️ How It Works

1. **Data Collection:** Gather weather, water resources, elevation, and historical flood datasets.
2. **Data Cleaning:** Prepare the collected datasets for analysis and model training.
3. **Feature Preparation:** Organize relevant parameters, such as rainfall, river discharge, and elevation.
4. **Model Training:** Train machine learning models using the available historical data.
5. **Risk Estimation:** Use the trained models to estimate flood risk for supported regions.
6. **Visualization:** Present flood risk information through the website's interface and maps.

## 📊 Model Evaluation

The project includes state-wise test accuracy results for its trained models. The reported accuracy varies across states because of differences in data availability and the number of test samples.

Accuracy alone does not establish the reliability of flood warnings. The model should also be evaluated using suitable classification metrics and independent historical flood events.

## 🎓 Project Information

- **Project Title:** Flood Risk Prediction Using Weather and GIS Data
- **Course Code:** PC 407
- **Student 1:** Raj Makavana
- **Roll Number:** 202301183
- **Student 2:** Ruchir Joshi
- **Roll Number:** 202301410

- **Project Mentor:** Professor Ratna Bharati Bhamidipati

## 🌍 Applications

Flood Watch India can support:

- Flood preparedness and awareness.
- Identification of potentially flood-prone regions.
- Geographical analysis of flood vulnerability.
- Academic research on machine learning and flood risk.
- Decision support for disaster management planning.

## ⚠️ Limitations

- Prediction quality depends on the accuracy, coverage, and availability of the input datasets.
- Historical patterns may not fully represent future flood conditions.
- Model performance can vary between states due to differences in available data and sample sizes.
- Predictions should not be treated as guaranteed forecasts of actual flooding.
- The platform should complement, not replace, official weather forecasts, government alerts, and emergency instructions.

## 📄 Disclaimer

Flood Watch India is an academic project developed for flood risk assessment and educational purposes. Its predictions are estimates based on available data and machine learning models. Users should always follow official government advisories and emergency instructions during flood situations.

## 🔗 Project Link

Visit the website: https://flood-watch-india.vercel.app/
