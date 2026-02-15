"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const uploadSchema = z.object({
    content: z.string().min(10, "Content is too short"),
    fileName: z.string().min(1, "File name is required"),
})

export async function uploadRecord(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return { message: "Unauthorized." }
    }

    // In a real app, we would handle file parsing here (PDF/Image to text)
    // For this prototype, we accept text input directly
    const rawData = {
        content: formData.get("content"),
        fileName: formData.get("fileName") || "Manual Entry",
    }

    const validatedFields = uploadSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation Error",
        }
    }

    const { content, fileName } = validatedFields.data

    // Simple AI/Keyword Summary Simulation
    let summary = "No critical conditions detected."
    const lowerContent = content.toLowerCase()

    if (lowerContent.includes("heart") || lowerContent.includes("cardiac")) {
        summary = "Cardiac history noted."
    } else if (lowerContent.includes("diabetes") || lowerContent.includes("sugar")) {
        summary = "Diabetic history noted."
    } else if (lowerContent.includes("asthma") || lowerContent.includes("lung")) {
        summary = "Respiratory history noted."
    }

    try {
        await db.medicalRecord.create({
            data: {
                patientId: session.user.id,
                fileName: fileName,
                fileType: "text/plain",
                content: content,
                summary: summary,
            },
        })

        revalidatePath("/patient")
    } catch (e) {
        return { message: "Database Error: Failed to upload record." }
    }

    redirect("/patient")
}
