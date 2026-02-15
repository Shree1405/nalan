"use client"

import { uploadRecord } from "@/app/actions/upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Loader2 } from "lucide-react"
import { useState } from "react"
// import { useFormState } from "react-dom" // Available in newer Next.js/React versions

export default function UploadPage() {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        await uploadRecord(null, formData)
        setIsLoading(false)
    }

    return (
        <div className="max-w-xl mx-auto py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Upload Medical Records</h1>
                <p className="text-muted-foreground">Or manually enter your medical history for better AI diagnosis.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Add New Record
                    </CardTitle>
                    <CardDescription>
                        Paste the content of your report or type your history.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fileName">Record Name</Label>
                            <Input id="fileName" name="fileName" placeholder="e.g., Blood Test Jan 2024" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Report Content / History</Label>
                            <Textarea
                                id="content"
                                name="content"
                                placeholder="Paste your report text here or describe your condition..."
                                className="min-h-[200px]"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                For this prototype, we process text directly.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload & Analyze
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
