
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface Vitals {
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  temperature?: number;
  oxygenSaturation?: number;
  painLevel?: number; // 0-10
  medicalHistory?: string[]; // Array of summaries from uploaded records
}

interface AnalysisResult {
  riskLevel: RiskLevel;
  department: string;
  reasoning: string[];
}

// ML Service Configuration
const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5001';

async function callMLService(symptoms: string, vitals: Vitals): Promise<AnalysisResult | null> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        features: {
          age: 35, // Default age, could be passed as parameter
          heart_rate: vitals.heartRate || 75,
          blood_pressure_systolic: vitals.systolicBp || 120,
          blood_pressure_diastolic: vitals.diastolicBp || 80,
          temperature: vitals.temperature || 37,
          oxygen_saturation: vitals.oxygenSaturation || 98
        }
      }),
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (!response.ok) {
      console.warn('ML Service returned error:', response.status);
      return null;
    }

    const data = await response.json();

    // Map ML response to our format
    const riskLevel = data.risk_level.toUpperCase() as RiskLevel;

    // Build reasoning from top features
    const reasoning: string[] = [];
    if (data.top_features && data.top_features.length > 0) {
      data.top_features.forEach((feature: any) => {
        reasoning.push(`${feature.name}: ${feature.direction} risk (impact: ${Math.abs(feature.impact).toFixed(2)})`);
      });
    }

    if (data.mock) {
      reasoning.push('(Using mock ML model - install trained model for production)');
    }

    // Determine department based on symptoms (ML doesn't provide this)
    let department = "General Medicine";
    const lowerSymptoms = symptoms.toLowerCase();
    if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('heart')) {
      department = "Cardiology";
    } else if (lowerSymptoms.includes('stroke') || lowerSymptoms.includes('headache')) {
      department = "Neurology";
    } else if (lowerSymptoms.includes('fracture') || lowerSymptoms.includes('bone')) {
      department = "Orthopedics";
    }

    return {
      riskLevel,
      department,
      reasoning: reasoning.length > 0 ? reasoning : ['ML-based risk assessment']
    };

  } catch (error) {
    console.warn('Failed to call ML service:', error);
    return null;
  }
}

export function analyzePatient(symptoms: string, vitals: Vitals): AnalysisResult {
  // Try ML service first (async, but we'll make it sync for now)
  // In production, you'd want to make analyzePatient async

  const reasons: string[] = [];
  let riskScore = 0;
  let department = "General Medicine";

  // 1. Critical Vitals Check (Immediate High Risk)
  if (vitals.heartRate && (vitals.heartRate > 120 || vitals.heartRate < 40)) {
    riskScore += 10;
    reasons.push(`Critical Heart Rate: ${vitals.heartRate} bpm`);
    department = "Cardiology";
  }

  if (vitals.systolicBp && (vitals.systolicBp > 180 || vitals.systolicBp < 90)) {
    riskScore += 10;
    reasons.push(`Critical Blood Pressure: ${vitals.systolicBp} mmHg (Systolic)`);
    if (department === "General Medicine") department = "Cardiology";
  }

  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) {
    riskScore += 10;
    reasons.push(`Low Oxygen Saturation: ${vitals.oxygenSaturation}%`);
    department = "Pulmonology";
  }

  if (vitals.temperature && vitals.temperature > 102) {
    riskScore += 5;
    reasons.push(`High Fever: ${vitals.temperature}°F`);
    if (department === "General Medicine") department = "General Medicine";
  }

  if (vitals.painLevel && vitals.painLevel >= 8) {
    riskScore += 10;
    reasons.push(`Severe Pain (Level ${vitals.painLevel})`);
    // Department depends on symptoms, but pain drives urgency
  } else if (vitals.painLevel && vitals.painLevel >= 5) {
    riskScore += 5;
    reasons.push(`Moderate Pain (Level ${vitals.painLevel})`);
  }

  // 2. Medical History Analysis
  if (vitals.medicalHistory && vitals.medicalHistory.length > 0) {
    const historyText = vitals.medicalHistory.join(" ").toLowerCase();

    if (historyText.includes("cardiac") || historyText.includes("heart")) {
      riskScore += 5;
      reasons.push("Risk elevated due to history of cardiac issues.");
      if (department === "General Medicine") department = "Cardiology";
    }

    if (historyText.includes("diabetic") || historyText.includes("diabetes")) {
      riskScore += 3;
      reasons.push("Risk elevated due to history of diabetes.");
    }

    if (historyText.includes("asthma") || historyText.includes("respiratory")) {
      riskScore += 3;
      reasons.push("Risk elevated due to respiratory history.");
      if (department === "General Medicine") department = "Pulmonology";
    }
  }

  // 3. Keyword Analysis (Simple Heuristics)
  const lowerSymptoms = symptoms.toLowerCase();

  const highRiskKeywords = ['chest pain', 'severe breathlessness', 'unconscious', 'stroke', 'paralysis', 'severe bleeding'];
  const mediumRiskKeywords = ['fever', 'dizziness', 'vomiting', 'fracture', 'abdominal pain', 'headache'];

  // Check for Cardiology
  if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('heart')) {
    if (department === "General Medicine") department = "Cardiology";
  }

  // Check for Neurology
  if (lowerSymptoms.includes('stroke') || lowerSymptoms.includes('paralysis') || lowerSymptoms.includes('headache')) {
    if (department === "General Medicine") department = "Neurology";
  }

  // Check for Orthopedics
  if (lowerSymptoms.includes('fracture') || lowerSymptoms.includes('bone') || lowerSymptoms.includes('joint')) {
    if (department === "General Medicine") department = "Orthopedics";
  }


  // SPECIAL RULE: User requested "Normal Cold" to be High Risk
  const coldKeywords = ['cold', 'common cold', 'runny nose', 'sneeze', 'sneezing', 'cough', 'mild fever'];
  if (coldKeywords.some(kw => lowerSymptoms.includes(kw))) {
    riskScore += 15; // Ensure it exceeds the threshold of 10
    reasons.push("Protocol Alert: Cold symptoms classified as HIGH RISK.");
    department = "General Medicine";
  }

  if (highRiskKeywords.some(kw => lowerSymptoms.includes(kw))) {
    riskScore += 10;
    const match = highRiskKeywords.find(kw => lowerSymptoms.includes(kw));
    reasons.push(`High risk symptom detected: "${match}"`);
  } else if (mediumRiskKeywords.some(kw => lowerSymptoms.includes(kw))) {
    riskScore += 5;
    const match = mediumRiskKeywords.find(kw => lowerSymptoms.includes(kw));
    reasons.push(`Moderate risk symptom detected: "${match}"`);
  }

  // 4. Determine Final Risk
  let finalRisk: RiskLevel = 'LOW';
  if (riskScore >= 10) {
    finalRisk = 'HIGH';
  } else if (riskScore >= 5) {
    finalRisk = 'MEDIUM';
  }

  if (reasons.length === 0) {
    reasons.push("No critical signs or specific high-risk symptoms detected.");
  }

  return {
    riskLevel: finalRisk,
    department,
    reasoning: reasons
  };
}
