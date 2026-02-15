"use server"

import { analyzePatientML } from "@/lib/ai/riskClassifierML"

export async function getChatResponse(message: string) {
    try {
        // We simulate basic vitals for the chat context since we don't have sensors here yet
        const analysis = await analyzePatientML(message, {
            painLevel: 0,
            heartRate: 75, // normal baseline
            systolicBp: 120, // normal baseline
            medicalHistory: []
        })

        let responseText = ""



        // Basic Home Remedies Logic
        const lowerMsg = message.toLowerCase();
        let advice = "";

        if (lowerMsg.includes("dehydrated") || lowerMsg.includes("thirsty") || lowerMsg.includes("dry mouth")) {
            advice = "💡 **Home Care**: Drink plenty of water and electrolytes (ORS). Avoid caffeine.";
        } else if (lowerMsg.includes("cold") || lowerMsg.includes("runny nose") || lowerMsg.includes("sneeze")) {
            advice = "💡 **Home Care**: Rest typically helps. Stay hydrated, take steam inhalation, and gargle with warm salt water.";
        } else if (lowerMsg.includes("headache")) {
            advice = "💡 **Home Care**: Rest in a quiet, dark room. hydration often helps. Apply a cold or warm compress to your forehead.";
        } else if (lowerMsg.includes("fever") || lowerMsg.includes("temperature")) {
            advice = "💡 **Home Care**: Stay hydrated and rest. You can use a cool damp cloth on your forehead. If fever persists > 102°F, see a doctor.";
        } else if (lowerMsg.includes("stomach") || lowerMsg.includes("pain")) {
            advice = "💡 **Home Care**: Avoid solid foods for a few hours. Sip water or clear fluids.";
        }

        if (analysis.riskLevel === "HIGH") {
            responseText = `⚠️ **ASSESSMENT: HIGH RISK DETECTED**\n\nBased on symptoms: "${message}"\nOur AI recommends immediate attention in **${analysis.department}**.\n\nReasoning: ${analysis.reasoning.join(", ")}.\n\n${advice ? advice + "\n\n" : ""}🔴 **Please press the SOS button if you need emergency help!**`
        } else if (analysis.riskLevel === "MEDIUM") {
            responseText = `⚠️ **ASSESSMENT: Moderate Risk**\n\nPossible issue in **${analysis.department}**.\nReasoning: ${analysis.reasoning.join(", ")}.\n\n${advice}\n\nPlease schedule an appointment soon.`
        } else {
            responseText = `✅ **ASSESSMENT: Low Risk**\n\nIt seems like a mild issue related to **${analysis.department}**.\n\n${advice || `Suggestions: ${analysis.reasoning.join(", ")}`}\n\nMonitor your symptoms and visit if they worsen.`
        }

        return { success: true, message: responseText }
    } catch (error) {
        console.error("Chat Diagnosis Error:", error)
        return { success: false, message: "I'm having trouble analyzing that right now. Please use the full Triage form for a better assessment." }
    }
}
