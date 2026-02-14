import { db } from "./db";
import {
  patients,
  assessments,
  type Patient,
  type InsertPatient,
  type Assessment,
  type InsertAssessment,
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Patients
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;

  // Assessments
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  getLatestAssessments(limit?: number): Promise<(Assessment & { patient: Patient })[]>;
  getRiskStats(): Promise<{ risk: string; count: number }[]>;
  getTotalPatients(): Promise<number>;
  getAverageConfidence(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db
      .insert(patients)
      .values(patient)
      .returning();
    return newPatient;
  }

  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment;
  }

  async getLatestAssessments(limit: number = 10): Promise<(Assessment & { patient: Patient })[]> {
    const results = await db
      .select()
      .from(assessments)
      .innerJoin(patients, eq(assessments.patientId, patients.id))
      .orderBy(desc(assessments.createdAt))
      .limit(limit);

    return results.map((r) => ({
      ...r.assessments,
      patient: r.patients,
    }));
  }

  async getRiskStats(): Promise<{ risk: string; count: number }[]> {
    const stats = await db
      .select({
        risk: assessments.riskLevel,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(assessments)
      .groupBy(assessments.riskLevel);
    
    return stats;
  }

  async getTotalPatients(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(patients);
    return result.count;
  }

  async getAverageConfidence(): Promise<number> {
    const [result] = await db
      .select({ avg: sql<number>`avg(${assessments.confidenceScore})`.mapWith(Number) })
      .from(assessments);
    return result.avg || 0;
  }
}

export const storage = new DatabaseStorage();
