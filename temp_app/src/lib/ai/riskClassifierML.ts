"use server"

import { analyzePatient as analyzePatientSync, type RiskLevel } from './riskClassifier';

interface Vitals {
    heartRate?: number;
    systolicBp?: number;
    diastolicBp?: number;
    temperature?: number;
    oxygenSaturation?: number;
    painLevel?: number;
    medicalHistory?: string[];
}

interface AnalysisResult {
    riskLevel: RiskLevel;
    department: string;
    reasoning: string[];
}

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

export async function analyzePatientML(symptoms: string, vitals: Vitals): Promise<AnalysisResult> {
    try {
        const response = await fetch(`${ML_SERVICE_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                features: {
                    age: 35,
                    heart_rate: vitals.heartRate || 75,
                    blood_pressure_systolic: vitals.systolicBp || 120,
                    blood_pressure_diastolic: vitals.diastolicBp || 80,
                    temperature: vitals.temperature || 37,
                    oxygen_saturation: vitals.oxygenSaturation || 98
                }
            }),
            signal: AbortSignal.timeout(3000)
        });

        if (!response.ok) {
            throw new Error(`ML Service error: ${response.status}`);
        }

        const data = await response.json();

        const riskLevel = data.risk_level.toUpperCase() as RiskLevel;

        const reasoning: string[] = [];
        if (data.top_features && data.top_features.length > 0) {
            data.top_features.forEach((feature: any) => {
                reasoning.push(`${feature.name.replace(/_/g, ' ')}: ${feature.direction} (${Math.abs(feature.impact).toFixed(2)})`);
            });
        }

        if (data.mock) {
            reasoning.push('✨ ML Model (Mock Mode)');
        } else {
            reasoning.push('🤖 XGBoost ML Model');
        }

        let department = "General Medicine";
        const lowerSymptoms = symptoms.toLowerCase();
        if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('heart')) {
            department = "Cardiology";
        } else if (lowerSymptoms.includes('stroke') || lowerSymptoms.includes('headache')) {
            department = "Neurology";
        } else if (lowerSymptoms.includes('fracture') || lowerSymptoms.includes('bone')) {
            department = "Orthopedics";
        } else if (lowerSymptoms.includes('breath')) {
            department = "Pulmonology";
        }

        return {
            riskLevel,
            department,
            reasoning
        };

    } catch (error) {
        console.warn('ML Service unavailable, using rule-based fallback:', error);
        return analyzePatientSync(symptoms, vitals);
    }
}
