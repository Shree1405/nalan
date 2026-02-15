
import { RiskLevel } from "./riskClassifier";

export function generateExplanation(
    riskLevel: RiskLevel,
    department: string,
    reasons: string[]
): string {
    if (reasons.length === 0) {
        return "Based on the provided information, no immediate high-risk factors were identified. A general check-up is recommended.";
    }

    const riskPreambles = {
        HIGH: "CRITICAL ALERT: Analyzing the patient's vitals and reported symptoms, we have detected immediate risk factors that require urgent attention.",
        MEDIUM: "CAUTION: The patient exhibits potentially concerning symptoms that warrant medical evaluation.",
        LOW: "MONITOR: While no critical signs are present, the reported symptoms suggest a need for routine consultation."
    };

    const reasonText = reasons.map(r => `- ${r}`).join("\n");

    return `${riskPreambles[riskLevel]}\n\nRecommended Department: ${department}\n\nKey Findings:\n${reasonText}\n\nPlease proceed to the ${department} department immediately for further assessment.`;
}
