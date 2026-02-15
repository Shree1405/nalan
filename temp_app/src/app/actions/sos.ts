"use server"

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function triggerSOS(latitude?: number, longitude?: number) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { message: "Unauthorized" }
    }

    try {
        await db.sOSAlert.create({
            data: {
                patientId: session.user.id,
                status: "ACTIVE",
                latitude: latitude,
                longitude: longitude
            }
        })
        revalidatePath("/doctor")
        revalidatePath("/admin")
        return { success: true, message: "SOS Alert Sent! Help is on the way." }
    } catch (error) {
        console.error("SOS Error Details:", error)
        return { success: false, message: "Failed to send SOS. Please call emergency services immediately." }
    }
}

export async function resolveSOS(alertId: string) {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "DOCTOR" && session.user.role !== "ADMIN")) {
        return { message: "Unauthorized" }
    }

    try {
        await db.sOSAlert.update({
            where: { id: alertId },
            data: {
                status: "RESOLVED",
                resolvedAt: new Date()
            }
        })
        revalidatePath("/doctor")
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        return { success: false, message: "Failed to resolve alert." }
    }
}
