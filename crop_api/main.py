# main.py

import pandas as pd
import joblib
from fastapi import FastAPI
from pydantic import BaseModel

# 1. Initialize FastAPI app
app = FastAPI(title="Crop Recommendation API", version="1.0.0")

# 2. Define the structure of the input data using Pydantic
# This ensures that any data sent to the API matches this format.
class FarmerInput(BaseModel):
    lat: float
    lon: float
    area: float
    irrigation: int
    district: str
    soil_type: str

# 3. Load the model and dataset when the application starts
try:
    pipeline = joblib.load("crop_reco_pipeline.joblib")
    df = pd.read_csv("jharkhand_soil_crop_dataset_expanded.csv")
    print("✅ Model and data loaded successfully.")
except FileNotFoundError:
    print("🛑 Error: Model or data file not found.")
    pipeline = None
    df = None

# 4. Create the prediction endpoint
@app.post("/recommend/")
def recommend_crops(input_data: FarmerInput):
    """
    Receives farmer's input data and returns top 3 crop recommendations.
    """
    if pipeline is None or df is None:
        return {"error": "Model or data not available. Check server logs."}

    # This logic is adapted directly from your notebook's `recommend_crops` function.
    # It uses median values from the dataset as fallbacks for unknown nutrient/pH data.
    district_data = df[df["district"] == input_data.district.lower()]

    if not district_data.empty:
        soil_pH = float(district_data["soil_pH"].median())
        N = float(district_data["N_kg_per_ha"].median())
        P = float(district_data["P_kg_per_ha"].median())
        K = float(district_data["K_kg_per_ha"].median())
        avg_rainfall_mm = float(district_data["avg_rainfall_mm"].median())
    else:
        # Use global medians if the district is not found in the dataset
        soil_pH = float(df["soil_pH"].median())
        N = float(df["N_kg_per_ha"].median())
        P = float(df["P_kg_per_ha"].median())
        K = float(df["K_kg_per_ha"].median())
        avg_rainfall_mm = float(df["avg_rainfall_mm"].median())

    # Create a DataFrame from the input for the model
    input_df = pd.DataFrame([{
        "district": input_data.district,
        "soil_type": input_data.soil_type,
        "area_acre": input_data.area,
        "irrigation_frequency_per_season": input_data.irrigation,
        "latitude": input_data.lat,
        "longitude": input_data.lon,
        "soil_pH": soil_pH,
        "N_kg_per_ha": N,
        "P_kg_per_ha": P,
        "K_kg_per_ha": K,
        "avg_rainfall_mm": avg_rainfall_mm
    }])

    # Get prediction probabilities
    probabilities = pipeline.predict_proba(input_df)[0]
    classes = pipeline.named_steps["clf"].classes_
    
    # Get the top 3 recommendations
    top_3_indices = (-probabilities).argsort()[:3]
    recommendations = [
        {"crop": classes[i], "confidence": f"{probabilities[i]:.2f}"}
        for i in top_3_indices
    ]

    return {"recommendations": recommendations}

# 5. Add a root endpoint for health checks
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the Crop Recommendation API!"}