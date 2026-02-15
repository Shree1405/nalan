"""
Flask ML Service for Patient Risk Classification

This service provides REST API endpoints for XGBoost-based risk prediction
and SHAP explainability for the Smart Patient Triage System.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, Any, List

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Configuration from environment variables
CONFIG = {
    'PORT': int(os.getenv('ML_SERVICE_PORT', 5001)),
    'DEBUG': os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
}

print("✓ ML Service starting in MOCK mode (lightweight)")
print("✓ For production ML, train and load an XGBoost model")


def mock_predict(features: Dict[str, Any]) -> Dict[str, Any]:
    """Generate mock prediction based on vitals."""
    hr = features.get('heart_rate', 75)
    bp_sys = features.get('blood_pressure_systolic', 120)
    temp = features.get('temperature', 37)
    o2_sat = features.get('oxygen_saturation', 98)
    
    risk_score = 0
    reasons = []
    
    if hr > 100:
        risk_score += 2
        reasons.append(f"Elevated heart rate ({hr} bpm)")
    elif hr < 60:
        risk_score += 1
        reasons.append(f"Low heart rate ({hr} bpm)")
    
    if bp_sys > 140:
        risk_score += 2
        reasons.append(f"High blood pressure ({bp_sys} mmHg)")
    elif bp_sys < 90:
        risk_score += 2
        reasons.append(f"Low blood pressure ({bp_sys} mmHg)")
    
    if temp > 38:
        risk_score += 2
        reasons.append(f"Fever detected ({temp}°C)")
    elif temp > 37.5:
        risk_score += 1
        reasons.append(f"Mild fever ({temp}°C)")
    
    if o2_sat < 90:
        risk_score += 3
        reasons.append(f"Critical oxygen saturation ({o2_sat}%)")
    elif o2_sat < 95:
        risk_score += 2
        reasons.append(f"Low oxygen saturation ({o2_sat}%)")
    
    if risk_score >= 4:
        risk_level = "High"
        probs = {"Low": 0.1, "Medium": 0.3, "High": 0.6}
    elif risk_score >= 2:
        risk_level = "Medium"
        probs = {"Low": 0.2, "Medium": 0.6, "High": 0.2}
    else:
        risk_level = "Low"
        probs = {"Low": 0.7, "Medium": 0.2, "High": 0.1}
    
    top_features = []
    if reasons:
        for i, reason in enumerate(reasons[:3]):
            top_features.append({
                'name': reason.split('(')[0].strip(),
                'impact': 0.3 - (i * 0.1),
                'direction': 'increase'
            })
    
    return {
        'risk_level': risk_level,
        'probability': probs,
        'confidence': probs[risk_level],
        'shap_values': {},
        'top_features': top_features,
        'reasoning': reasons,
        'mock': True
    }



@app.route('/health', methods=['GET'])
def health_check() -> tuple:
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': False,
        'model_version': 'mock',
        'mode': 'mock'
    }), 200


@app.route('/predict', methods=['POST'])
def predict() -> tuple:
    """
    Predict risk level for a single patient record.
    
    Expected request body:
    {
        "features": {
            "age": int,
            "heart_rate": float,
            "blood_pressure_systolic": float,
            "blood_pressure_diastolic": float,
            "temperature": float,
            "oxygen_saturation": float,
            "symptoms": List[str]
        }
    }
    
    Returns:
        JSON response with risk prediction and SHAP explanations
    """
    try:
        data = request.get_json()
        
        if not data or 'features' not in data:
            return jsonify({
                'error': 'Invalid request format. Expected "features" field.'
            }), 400
        
        features = data['features']
        
        # Use mock prediction
        prediction = mock_predict(features)
        return jsonify(prediction), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500


@app.route('/predict_batch', methods=['POST'])
def predict_batch() -> tuple:
    """
    Predict risk levels for multiple patient records.
    
    Expected request body:
    {
        "records": [
            {"features": {...}},
            {"features": {...}},
            ...
        ]
    }
    
    Returns:
        JSON response with array of predictions
    """
    try:
        data = request.get_json()
        
        if not data or 'records' not in data:
            return jsonify({
                'error': 'Invalid request format. Expected "records" field.'
            }), 400
        
        records = data['records']
        
        if not isinstance(records, list):
            return jsonify({
                'error': '"records" must be an array'
            }), 400
        
        if len(records) == 0:
            return jsonify({
                'error': 'At least one record is required'
            }), 400
        
        if len(records) > 100:
            return jsonify({
                'error': 'Batch size cannot exceed 100 records'
            }), 400
        
        # Extract features from records
        features_list = []
        for i, record in enumerate(records):
            if 'features' not in record:
                return jsonify({
                    'error': f'Missing "features" field in record at index {i}'
                }), 400
            features_list.append(record['features'])
        
        # Use model to predict batch
        try:
            predictions = model.predict_batch(features_list)
            
            return jsonify({
                'predictions': predictions,
                'count': len(predictions)
            }), 200
            
        except RuntimeError as e:
            return jsonify({
                'error': f'Model not available: {str(e)}'
            }), 503
        
    except Exception as e:
        return jsonify({
            'error': f'Batch prediction failed: {str(e)}'
        }), 500


if __name__ == '__main__':
    print(f"Starting ML Service on port {CONFIG['PORT']}")
    app.run(
        host='0.0.0.0',
        port=CONFIG['PORT'],
        debug=CONFIG['DEBUG']
    )
