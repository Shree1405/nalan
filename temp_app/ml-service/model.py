"""
XGBoost Model Wrapper for Patient Risk Classification

This module provides a wrapper class for loading, predicting, and explaining
XGBoost model predictions using SHAP values.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
import shap


class XGBoostModel:
    """
    Wrapper class for XGBoost risk classification model.
    
    Handles model loading, prediction, and SHAP-based explanations.
    """
    
    # Expected feature schema
    EXPECTED_FEATURES = [
        'age',
        'heart_rate',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'temperature',
        'oxygen_saturation'
    ]
    
    RISK_LEVELS = ['Low', 'Medium', 'High']
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the XGBoost model wrapper.
        
        Args:
            model_path: Path to the trained model file. If None, uses MODEL_PATH env var.
        """
        self.model = None
        self.feature_names = self.EXPECTED_FEATURES.copy()
        self.label_encoder = None
        self.model_path = model_path or os.getenv('ML_MODEL_PATH', '/models/xgboost_risk_classifier.joblib')
        self.model_loaded = False
        self.explainer = None
    
    def load_model(self, path: Optional[str] = None) -> None:
        """
        Load trained XGBoost model from disk.
        
        Args:
            path: Path to model file. If None, uses instance model_path.
            
        Raises:
            FileNotFoundError: If model file doesn't exist
            Exception: If model loading fails
        """
        load_path = path or self.model_path
        
        if not os.path.exists(load_path):
            raise FileNotFoundError(f"Model file not found at: {load_path}")
        
        try:
            # Load model using joblib
            model_data = joblib.load(load_path)
            
            # Handle different serialization formats
            if isinstance(model_data, dict):
                self.model = model_data.get('model')
                self.feature_names = model_data.get('feature_names', self.EXPECTED_FEATURES)
                self.label_encoder = model_data.get('label_encoder')
            else:
                # Assume it's just the model
                self.model = model_data
            
            self.model_loaded = True
            print(f"Model loaded successfully from {load_path}")
            
            # Initialize SHAP explainer
            self._initialize_explainer()
            
        except Exception as e:
            raise Exception(f"Failed to load model: {str(e)}")
    
    def validate_features(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate input features against expected schema.
        
        Args:
            features: Dictionary of feature values
            
        Returns:
            Validated and processed features dictionary
            
        Raises:
            ValueError: If required features are missing or invalid
        """
        # Check for missing required features
        missing_features = [f for f in self.EXPECTED_FEATURES if f not in features]
        if missing_features:
            raise ValueError(f"Missing required features: {', '.join(missing_features)}")
        
        # Validate feature types and ranges
        validated = {}
        
        # Age validation
        age = features.get('age')
        if not isinstance(age, (int, float)) or age < 0 or age > 120:
            raise ValueError(f"Invalid age value: {age}. Must be between 0 and 120.")
        validated['age'] = float(age)
        
        # Heart rate validation
        hr = features.get('heart_rate')
        if not isinstance(hr, (int, float)) or hr < 20 or hr > 250:
            raise ValueError(f"Invalid heart_rate value: {hr}. Must be between 20 and 250.")
        validated['heart_rate'] = float(hr)
        
        # Blood pressure systolic validation
        bp_sys = features.get('blood_pressure_systolic')
        if not isinstance(bp_sys, (int, float)) or bp_sys < 50 or bp_sys > 250:
            raise ValueError(f"Invalid blood_pressure_systolic value: {bp_sys}. Must be between 50 and 250.")
        validated['blood_pressure_systolic'] = float(bp_sys)
        
        # Blood pressure diastolic validation
        bp_dia = features.get('blood_pressure_diastolic')
        if not isinstance(bp_dia, (int, float)) or bp_dia < 30 or bp_dia > 150:
            raise ValueError(f"Invalid blood_pressure_diastolic value: {bp_dia}. Must be between 30 and 150.")
        validated['blood_pressure_diastolic'] = float(bp_dia)
        
        # Temperature validation (Celsius)
        temp = features.get('temperature')
        if not isinstance(temp, (int, float)) or temp < 30 or temp > 45:
            raise ValueError(f"Invalid temperature value: {temp}. Must be between 30 and 45 Celsius.")
        validated['temperature'] = float(temp)
        
        # Oxygen saturation validation
        o2_sat = features.get('oxygen_saturation')
        if not isinstance(o2_sat, (int, float)) or o2_sat < 50 or o2_sat > 100:
            raise ValueError(f"Invalid oxygen_saturation value: {o2_sat}. Must be between 50 and 100.")
        validated['oxygen_saturation'] = float(o2_sat)
        
        return validated

    def _prepare_features(self, features: Dict[str, Any]) -> np.ndarray:
        """
        Prepare features for model prediction.
        
        Args:
            features: Validated features dictionary
            
        Returns:
            NumPy array of features in correct order
        """
        # Extract features in the correct order
        feature_values = [features[name] for name in self.feature_names]
        return np.array([feature_values])
    
    def _initialize_explainer(self) -> None:
        """
        Initialize SHAP TreeExplainer with the loaded model.
        
        This should be called after the model is loaded.
        """
        if self.model is None:
            raise RuntimeError("Cannot initialize explainer: model not loaded")
        
        try:
            # Initialize TreeExplainer for XGBoost model
            self.explainer = shap.TreeExplainer(self.model)
            print("SHAP TreeExplainer initialized successfully")
        except Exception as e:
            print(f"Warning: Failed to initialize SHAP explainer: {str(e)}")
            self.explainer = None
    
    def explain(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate SHAP explanations for a prediction.
        
        Args:
            features: Dictionary containing patient features
            
        Returns:
            Dictionary with SHAP values and top 5 contributing features
            
        Raises:
            RuntimeError: If model or explainer is not loaded
            ValueError: If features are invalid
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        if self.explainer is None:
            raise RuntimeError("SHAP explainer not initialized")
        
        # Validate and prepare features
        validated_features = self.validate_features(features)
        feature_array = self._prepare_features(validated_features)
        
        # Get SHAP values
        shap_values = self.explainer.shap_values(feature_array)
        
        # For multi-class classification, shap_values is a list of arrays (one per class)
        # We'll use the SHAP values for the predicted class
        predicted_class_idx = np.argmax(self.model.predict_proba(feature_array)[0])
        
        if isinstance(shap_values, list):
            # Multi-class case: get SHAP values for predicted class
            class_shap_values = shap_values[predicted_class_idx][0]
        else:
            # Binary case: use the values directly
            class_shap_values = shap_values[0]
        
        # Create dictionary of feature names to SHAP values
        shap_dict = {
            feature_name: float(shap_value)
            for feature_name, shap_value in zip(self.feature_names, class_shap_values)
        }
        
        # Get top 5 features by absolute SHAP value
        sorted_features = sorted(
            shap_dict.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )[:5]
        
        # Format top features with impact direction
        top_features = [
            {
                'name': feature_name,
                'impact': float(shap_value),
                'direction': 'increase' if shap_value > 0 else 'decrease'
            }
            for feature_name, shap_value in sorted_features
        ]
        
        return {
            'shap_values': shap_dict,
            'top_features': top_features
        }
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict risk level for a single patient record.
        
        Args:
            features: Dictionary containing patient features
            
        Returns:
            Dictionary with risk_level, probabilities, and SHAP explanations
            
        Raises:
            RuntimeError: If model is not loaded
            ValueError: If features are invalid
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Validate and prepare features
        validated_features = self.validate_features(features)
        feature_array = self._prepare_features(validated_features)
        
        # Get prediction probabilities
        probabilities = self.model.predict_proba(feature_array)[0]
        
        # Get predicted class
        predicted_class_idx = np.argmax(probabilities)
        predicted_risk_level = self.RISK_LEVELS[predicted_class_idx]
        
        # Format probability dictionary
        probability_dict = {
            risk_level: float(prob) 
            for risk_level, prob in zip(self.RISK_LEVELS, probabilities)
        }
        
        # Generate SHAP explanations
        shap_explanation = {}
        top_features = []
        
        if self.explainer is not None:
            try:
                explanation = self.explain(features)
                shap_explanation = explanation['shap_values']
                top_features = explanation['top_features']
            except Exception as e:
                print(f"Warning: Failed to generate SHAP explanation: {str(e)}")
        
        return {
            'risk_level': predicted_risk_level,
            'probability': probability_dict,
            'confidence': float(probabilities[predicted_class_idx]),
            'shap_values': shap_explanation,
            'top_features': top_features
        }
    
    def predict_batch(self, features_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Predict risk levels for multiple patient records.
        
        Args:
            features_list: List of feature dictionaries
            
        Returns:
            List of prediction dictionaries
            
        Raises:
            RuntimeError: If model is not loaded
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        predictions = []
        
        for features in features_list:
            try:
                prediction = self.predict(features)
                predictions.append(prediction)
            except ValueError as e:
                # Include error in result for this record
                predictions.append({
                    'error': str(e),
                    'risk_level': None,
                    'probability': None
                })
        
        return predictions
    
    def save_model(self, path: Optional[str] = None) -> None:
        """
        Serialize and save the model to disk.
        
        Args:
            path: Path to save the model. If None, uses instance model_path.
            
        Raises:
            RuntimeError: If model is not loaded
        """
        if not self.model_loaded or self.model is None:
            raise RuntimeError("No model to save. Load or train a model first.")
        
        save_path = path or self.model_path
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # Save model with metadata
        model_data = {
            'model': self.model,
            'feature_names': self.feature_names,
            'label_encoder': self.label_encoder,
            'risk_levels': self.RISK_LEVELS
        }
        
        joblib.dump(model_data, save_path)
        print(f"Model saved successfully to {save_path}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the loaded model.
        
        Returns:
            Dictionary with model metadata
        """
        return {
            'model_loaded': self.model_loaded,
            'model_path': self.model_path,
            'feature_names': self.feature_names,
            'risk_levels': self.RISK_LEVELS,
            'num_features': len(self.feature_names)
        }
