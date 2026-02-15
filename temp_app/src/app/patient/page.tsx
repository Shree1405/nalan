import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { RiskBadge } from "@/components/RiskBadge"
import { PlusCircle, History, FileText } from "lucide-react"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getLatestTriage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    // Ensure only patient access (middleware handles this but good to double check or just use user ID)

    return await db.triageRecord.findFirst({
        where: { patientId: session.user.id },
        orderBy: { createdAt: "desc" },
    })
}

import { SOSButton } from "@/components/SOSButton"

export default async function PatientDashboard() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return null

    const latestTriage = await db.triageRecord.findFirst({
        where: { patientId: session.user.id },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome, {session.user.name}</h1>
                    <p className="text-muted-foreground">Manage your health and get AI-powered assessments.</p>
                </div>
                <div className="w-full md:w-auto">
                    {/* SOS Button for immediate access */}
                    <div className="md:w-48">
                        <SOSButton />
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Latest Assessment</CardTitle>
                        <CardDescription>
                            {latestTriage
                                ? `Performed on ${new Date(latestTriage.createdAt).toLocaleDateString()}`
                                : "No assessments found."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {latestTriage ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Risk Level:</span>
                                    <RiskBadge level={latestTriage.riskLevel} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Recommended Department:</span>
                                    <span>{latestTriage.recommendedDept}</span>
                                </div>
                                <div>
                                    <span className="font-medium block mb-1">Reasoning:</span>
                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                        {latestTriage.aiReasoning}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <p>You haven't performed a triage assessment yet.</p>
                                <Button asChild className="mt-4">
                                    <Link href="/patient/new-triage">Start Assessment</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    {latestTriage && (
                        <CardFooter>
                            <Button variant="outline" asChild>
                                <Link href="/patient/history">View all history</Link>
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                <div className="space-y-4">
                    <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
                        <CardHeader>
                            <CardTitle>New Triage</CardTitle>
                            <CardDescription>Feeling unwell? Get an AI assessment now.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button className="w-full" asChild>
                                <Link href="/patient/new-triage">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Start New Triage
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Medical Records</CardTitle>
                            <CardDescription>Upload EHR/EMR data.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/patient/upload">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Upload Record
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                            <CardDescription>View your past health records.</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="secondary" className="w-full" asChild>
                                <Link href="/patient/history">
                                    <History className="mr-2 h-4 w-4" />
                                    View History
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
