"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { localAssess, PatientData } from "@/lib/triage/engine"
import { performAdvancedAssessment } from "@/lib/triage/ai"

const triageSchema = z.object({
    symptoms: z.string().min(3),
    painLevel: z.number().min(0).max(10).optional(),
    duration: z.string().min(1).optional(),
    temperature: z.string().optional(),
})

export async function submitTriage(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return { message: "Unauthorized. Please login." }
    }

    const rawData = {
        symptoms: formData.get("symptoms"),
        painLevel: formData.get("painLevel") ? Number(formData.get("painLevel")) : undefined,
        duration: formData.get("duration") || undefined,
        temperature: formData.get("temperature") || undefined,
    }

    const validatedFields = triageSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Triage.",
        }
    }

    const { symptoms } = validatedFields.data

    try {
        // Run local low-risk engine
        const assessment = localAssess(symptoms);

        // If local engine says high risk and we have details, or it's a simple case, we process
        // For the chatbot flow, we might want to return this result directly

        await db.triageRecord.create({
            data: {
                patientId: session.user.id,
                symptoms: symptoms,
                riskLevel: assessment.risk.toUpperCase(),
                recommendedDept: assessment.diseases[0]?.name || "General Medicine",
                aiReasoning: assessment.diseases.map(d => `${d.name} (${d.likelihood})`).join("; "),
                createdAt: new Date().toISOString(),
            },
        })

        revalidatePath("/patient")
    } catch (e) {
        console.error(e)
        return {
            message: "Database Error: Failed to create triage record."
        }
    }

    redirect("/patient")
}

// Dynamic Assessment Action for Chatbot
export async function getLiveAssessment(symptoms: string, patient?: PatientData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    const localResult = localAssess(symptoms, patient);

    // If local risk is low and we have a strong match, or it's a simple call
    // we return it. If it's high risk but hasn't had detail step, UI will handle that.

    return { assessment: localResult };
}

export async function getAIAssessmentAction(symptoms: string, patient: PatientData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        throw new Error("Unauthorized")
    }

    const aiResult = await performAdvancedAssessment({ symptoms, patient });

    if (aiResult.result) {
        // Log high risk case to DB
        await db.triageRecord.create({
            data: {
                patientId: session.user.id,
                symptoms: symptoms,
                riskLevel: aiResult.result.risk.toUpperCase(),
                recommendedDept: aiResult.result.disease_probability?.name || "General Medicine",
                aiReasoning: aiResult.result.notes || "Advanced AI Assessment",
                vitals: JSON.stringify(patient),
                createdAt: new Date().toISOString(),
            }
        });
    }

    return aiResult;
}
