"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Basic schema - can be expanded
const symptomFormSchema = z.object({
    symptoms: z.string().min(3, "Please describe your symptoms"),
    painLevel: z.coerce.number().min(0, "Min 0").max(10, "Max 10"),
    duration: z.string().min(1, "Duration is required"),
    temperature: z.string().optional(),
})

type SymptomFormValues = z.infer<typeof symptomFormSchema>

interface SymptomFormProps {
    onSubmit: (data: SymptomFormValues) => Promise<void>
    isLoading?: boolean
}

export function SymptomForm({ onSubmit, isLoading = false }: SymptomFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SymptomFormValues>({
        resolver: zodResolver(symptomFormSchema) as any,
    })

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>AI Triage Assessment</CardTitle>
                <CardDescription>Describe your symptoms for an instant assessment.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="symptoms">Main Symptoms</Label>
                        <Input id="symptoms" placeholder="e.g., Chest pain, headache..." {...register("symptoms")} />
                        {errors.symptoms && (
                            <p className="text-sm text-destructive">{errors.symptoms.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                            <Input id="painLevel" type="number" min="0" max="10" placeholder="0" {...register("painLevel")} />
                            {errors.painLevel && (
                                <p className="text-sm text-destructive">{errors.painLevel.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" placeholder="e.g. 2 days" {...register("duration")} />
                            {errors.duration && (
                                <p className="text-sm text-destructive">{errors.duration.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="temperature">Body Temperature (optional)</Label>
                        <Input id="temperature" placeholder="e.g. 98.6" {...register("temperature")} />
                    </div>

                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assess Risk
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
