import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { RiskBadge } from "@/components/RiskBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Clock, Activity, FileText } from "lucide-react"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function PatientValuesPage({ params }: PageProps) {
    const { id } = await params

    const patient = await db.user.findUnique({
        where: { id: id },
        include: { medicalRecords: { orderBy: { createdAt: 'desc' } } }
    })

    if (!patient) return notFound()

    // Get history
    const history = await db.triageRecord.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    const latestTriage = history[0]

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/doctor/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{patient.name || "Patient"}</h1>
                    <p className="text-muted-foreground">{patient.email} — ID: {patient.id.slice(0, 8)}</p>
                </div>
                <div className="ml-auto">
                    {latestTriage && <RiskBadge level={latestTriage.riskLevel} />}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Latest Triage Details */}
                <Card className="col-span-2 md:col-span-1 border-primary/20 shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Current Assessment
                        </CardTitle>
                        <CardDescription>
                            Recorded {latestTriage ? new Date(latestTriage.createdAt).toLocaleString() : "N/A"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {latestTriage ? (
                            <>
                                <div>
                                    <h4 className="font-semibold mb-1">Reported Symptoms</h4>
                                    <p className="text-lg bg-muted/40 p-3 rounded-md">{latestTriage.symptoms}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Recommended Dept</h4>
                                        <p className="font-medium text-lg">{latestTriage.recommendedDept}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Triage Status</h4>
                                        <Badge>Pending Review</Badge>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        AI Reasoning
                                    </h4>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm space-y-1 text-blue-800 dark:text-blue-200">
                                        {(latestTriage.aiReasoning || "").split(';').map((r, i) => (
                                            <p key={i}>• {r.trim()}</p>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">No triage records found for this patient.</p>
                        )}
                    </CardContent>
                </Card>

                {/* History / Vitals Placeholder */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                History ({history.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {history.map(record => (
                                    <div key={record.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                        <div>
                                            <p className="font-medium truncate max-w-[180px]">{record.symptoms}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="scale-90 origin-right"><RiskBadge level={record.riskLevel} /></div>
                                            <p className="text-xs mt-1">{record.recommendedDept}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Medical Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {patient.medicalRecords && patient.medicalRecords.length > 0 ? (
                                    patient.medicalRecords.map((record: any) => (
                                        <div key={record.id} className="border rounded p-3">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-medium">{record.fileName}</p>
                                                <span className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{record.summary || "No summary available."}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No records uploaded.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
