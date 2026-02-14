import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // 'Male', 'Female', 'Other'
  symptoms: text("symptoms").array().notNull(), // Array of strings
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  heartRate: integer("heart_rate").notNull(),
  temperature: real("temperature").notNull(),
  conditions: text("conditions").array().notNull(), // Pre-existing conditions
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(), // Foreign key could be added, but keeping simple for prototype
  riskLevel: text("risk_level").notNull(), // 'Low', 'Medium', 'High', 'Critical'
  confidenceScore: real("confidence_score").notNull(),
  recommendedDepartment: text("recommended_department").notNull(),
  explanation: text("explanation").array().notNull(), // SHAP explanation points
  isEmergencyOverride: boolean("is_emergency_override").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true });
export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

// Request types
export type TriageRequest = InsertPatient; // The input form data

// Response types
export interface TriageResponse {
  patientId: number;
  riskLevel: string;
  confidenceScore: number;
  recommendedDepartment: string;
  explanation: string[];
}

export interface DashboardStats {
  totalPatients: number;
  riskDistribution: { risk: string; count: number }[];
  avgConfidence: number;
  recentAssessments: (Assessment & { patient: Patient })[];
}
