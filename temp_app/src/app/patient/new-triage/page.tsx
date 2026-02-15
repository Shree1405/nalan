"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowUp, Activity, AlertTriangle } from "lucide-react"
import ChatMessage from "@/components/triage/ChatMessage"
import AssessmentCard from "@/components/triage/AssessmentCard"
import SymptomAutocomplete from "@/components/triage/SymptomAutocomplete"
import { getLiveAssessment, getAIAssessmentAction } from "@/app/actions/triage"

interface Message {
    id: string;
    role: "user" | "system";
    content: React.ReactNode;
    timestamp: Date;
}

export default function NewTriagePage() {
    const router = useRouter()
    const t = useTranslations("triage")

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "system",
            content: t("welcome"),
            timestamp: new Date(),
        },
    ])
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
    const [additionalInput, setAdditionalInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState<"symptoms" | "details" | "result">("symptoms")

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleInitialAssessment = async () => {
        if (selectedSymptoms.length === 0 && !additionalInput.trim()) return

        const symptomsText = selectedSymptoms.length > 0
            ? `Symptoms: ${selectedSymptoms.join(", ")}${additionalInput.trim() ? ". Details: " + additionalInput : ""}`
            : additionalInput;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: symptomsText,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMsg])
        setIsLoading(true)
        setAdditionalInput("")

        try {
            const { assessment } = await getLiveAssessment(symptomsText)
            setIsLoading(false)

            if (assessment.risk === "high") {
                setStep("details")
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString() + "_risk",
                        role: "system",
                        content: <AssessmentCard data={assessment} isAlert={true} />,
                        timestamp: new Date(),
                    },
                    {
                        id: Date.now().toString() + "_ask",
                        role: "system",
                        content: t("highRisk"),
                        timestamp: new Date(),
                    },
                ])
            } else {
                setStep("result")
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now().toString() + "_res",
                        role: "system",
                        content: <AssessmentCard data={assessment} />,
                        timestamp: new Date(),
                    },
                    {
                        id: Date.now().toString() + "_final",
                        role: "system",
                        content: (
                            <div className="space-y-2">
                                <p>{t("success")}</p>
                                <Button onClick={() => router.push("/patient")} variant="outline" className="w-full">{t("backToDashboard")}</Button>
                            </div>
                        ),
                        timestamp: new Date(),
                    }
                ])
            }
        } catch (e) {
            setIsLoading(false)
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + "_err",
                    role: "system",
                    content: t("error"),
                    timestamp: new Date(),
                },
            ])
        }
    }

    const handleAdvancedAssessment = async () => {
        if (!additionalInput.trim()) return

        const details = additionalInput
        setAdditionalInput("")

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: details,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMsg])
        setIsLoading(true)

        try {
            const originalSymptoms = messages.find(m => m.role === "user")?.content as string || ""
            const { result, error } = await getAIAssessmentAction(originalSymptoms, { additional: details })
            setIsLoading(false)

            if (error) {
                throw new Error(error)
            }

            setStep("result")
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + "_ai_res",
                    role: "system",
                    content: <AssessmentCard data={result} />,
                    timestamp: new Date(),
                },
                {
                    id: Date.now().toString() + "_final_ai",
                    role: "system",
                    content: (
                        <div className="space-y-2">
                            <p>{t("success")}</p>
                            <Button onClick={() => router.push("/patient")} variant="outline" className="w-full">{t("backToDashboard")}</Button>
                        </div>
                    ),
                    timestamp: new Date(),
                }
            ])
        } catch (e) {
            setIsLoading(false)
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + "_err_ai",
                    role: "system",
                    content: t("error"),
                    timestamp: new Date(),
                },
            ])
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col min-h-screen">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Activity className="h-8 w-8 text-primary" />
                    {t("chatTitle")}
                </h1>
                <p className="text-muted-foreground">{t("chatSubtitle")}</p>
            </div>

            <Card className="flex-1 overflow-y-auto mb-6 p-4 min-h-[400px] bg-slate-50/50 flex flex-col gap-2">
                {messages.map((m) => (
                    <ChatMessage key={m.id} role={m.role} content={m.content} timestamp={m.timestamp} />
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs italic ml-12">
                        <Loader2 className="h-3 w-3 animate-spin" /> {t("analyzing")}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </Card>

            <div className="space-y-4">
                {step === "symptoms" && (
                    <SymptomAutocomplete
                        selectedSymptoms={selectedSymptoms}
                        onSymptomSelect={setSelectedSymptoms}
                    />
                )}

                <div className="relative">
                    <textarea
                        placeholder={
                            step === "symptoms"
                                ? t("placeholder")
                                : t("placeholderDetails")
                        }
                        value={additionalInput}
                        onChange={(e) => setAdditionalInput(e.target.value)}
                        disabled={step === "result" || isLoading}
                        className="w-full pr-12 p-4 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none shadow-sm"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                step === "symptoms" ? handleInitialAssessment() : handleAdvancedAssessment()
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        className="absolute right-2 bottom-2 h-10 w-10 rounded-full"
                        onClick={step === "symptoms" ? handleInitialAssessment : handleAdvancedAssessment}
                        disabled={isLoading || step === "result" || (!additionalInput.trim() && selectedSymptoms.length === 0)}
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <p className="text-[10px] text-amber-700 leading-tight">
                        <strong>{t("disclaimerTitle")}:</strong> {t("disclaimerText")}
                    </p>
                </div>
            </div>
        </div>
    )
}
