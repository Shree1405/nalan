import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertPatientSchema } from "@shared/schema";

// --- Mock AI / Heuristic Engine ---
// Simulates XGBoost logic and SHAP explanations
function calculateRisk(patient: z.infer<typeof insertPatientSchema>) {
  let riskScore = 0;
  let explanations: string[] = [];
  let department = "General Medicine";
  
  // Vitals Logic
  if (patient.systolic > 160 || patient.diastolic > 100) {
    riskScore += 30;
    explanations.push("Critical Hypertension (BP > 160/100)");
  } else if (patient.systolic > 140 || patient.diastolic > 90) {
    riskScore += 15;
    explanations.push("Elevated Blood Pressure");
  }

  if (patient.heartRate > 120 || patient.heartRate < 40) {
    riskScore += 25;
    explanations.push("Abnormal Heart Rate (>120 or <40)");
  }

  if (patient.temperature > 39.5) {
    riskScore += 20;
    explanations.push("High Fever (>39.5°C)");
  }

  // Symptoms Logic (Weighted Keywords)
  const symptomsLower = patient.symptoms.map(s => s.toLowerCase());
  
  if (symptomsLower.some(s => s.includes("chest") && s.includes("pain"))) {
    riskScore += 50;
    explanations.push("Chest Pain reported");
    department = "Cardiology";
  }

  if (symptomsLower.some(s => s.includes("breath") || s.includes("shortness"))) {
    riskScore += 40;
    explanations.push("Difficulty Breathing");
    department = "Pulmonology";
  }

  if (symptomsLower.some(s => s.includes("numb") || s.includes("speech") || s.includes("vision"))) {
    riskScore += 45;
    explanations.push("Neurological Symptoms");
    department = "Neurology";
  }

  if (symptomsLower.some(s => s.includes("bleed") || s.includes("trauma"))) {
    riskScore += 40;
    explanations.push("Trauma/Bleeding");
    department = "Emergency";
  }

  // Age factor
  if (patient.age > 65) {
    riskScore += 10;
    explanations.push("Age > 65 (Risk Factor)");
  }

  // Classification
  let riskLevel = "Low";
  if (riskScore >= 70) riskLevel = "High";
  else if (riskScore >= 30) riskLevel = "Medium";

  // Override Dept for High Risk if not specific
  if (riskLevel === "High" && department === "General Medicine") {
    department = "Emergency";
  }

  // Normalize confidence (simulated)
  const confidenceScore = Math.min(0.6 + (riskScore / 200), 0.99);

  return {
    riskLevel,
    confidenceScore: parseFloat(confidenceScore.toFixed(2)),
    recommendedDepartment: department,
    explanation: explanations.length > 0 ? explanations : ["Routine Checkup Recommended"],
  };
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- API Routes ---

  app.post(api.triage.assess.path, async (req, res) => {
    try {
      const input = api.triage.assess.input.parse(req.body);
      
      // 1. Save Patient
      const patient = await storage.createPatient(input);

      // 2. Run AI Logic
      const assessmentResult = calculateRisk(input);

      // 3. Save Assessment
      const assessment = await storage.createAssessment({
        patientId: patient.id,
        riskLevel: assessmentResult.riskLevel,
        confidenceScore: assessmentResult.confidenceScore,
        recommendedDepartment: assessmentResult.recommendedDepartment,
        explanation: assessmentResult.explanation,
        isEmergencyOverride: false,
      });

      res.status(201).json({
        patientId: patient.id,
        ...assessmentResult
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.triage.emergency.path, async (req, res) => {
    // Basic override logic - assumes a new anonymous emergency or could link to latest patient
    // For prototype, we'll just confirm the override action
    res.status(201).json({
      message: "Emergency Team Dispatched",
      department: "Emergency Response Unit"
    });
  });

  app.get(api.dashboard.stats.path, async (req, res) => {
    const totalPatients = await storage.getTotalPatients();
    const riskDistribution = await storage.getRiskStats();
    const avgConfidence = await storage.getAverageConfidence();
    const recentAssessments = await storage.getLatestAssessments(5);

    res.json({
      totalPatients,
      riskDistribution,
      avgConfidence: Number(avgConfidence.toFixed(2)),
      recentAssessments
    });
  });

  app.get(api.patients.list.path, async (req, res) => {
    const patients = await storage.getPatients();
    res.json(patients);
  });

  // --- Seed Data ---
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getPatients();
  if (existing.length > 0) return;

  console.log("Seeding synthetic patient data...");

  const syntheticPatients = [
    {
      age: 45,
      gender: "Male",
      symptoms: ["Chest pain", "Shortness of breath"],
      systolic: 150,
      diastolic: 95,
      heartRate: 110,
      temperature: 37.5,
      conditions: ["Hypertension"],
    },
    {
      age: 28,
      gender: "Female",
      symptoms: ["Headache", "Nausea"],
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
      temperature: 36.8,
      conditions: [],
    },
    {
      age: 72,
      gender: "Male",
      symptoms: ["Slurred speech", "Numbness"],
      systolic: 165,
      diastolic: 105,
      heartRate: 88,
      temperature: 37.0,
      conditions: ["Diabetes"],
    },
     {
      age: 12,
      gender: "Female",
      symptoms: ["Fever", "Cough"],
      systolic: 110,
      diastolic: 70,
      heartRate: 95,
      temperature: 39.2,
      conditions: ["Asthma"],
    }
  ];

  for (const p of syntheticPatients) {
    const patient = await storage.createPatient(p);
    const risk = calculateRisk(p);
    await storage.createAssessment({
      patientId: patient.id,
      riskLevel: risk.riskLevel,
      confidenceScore: risk.confidenceScore,
      recommendedDepartment: risk.recommendedDepartment,
      explanation: risk.explanation,
      isEmergencyOverride: false,
    });
  }
  console.log("Seeding complete.");
}
