import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { resolveSOS } from "@/app/actions/sos"
import { AlertCircle } from "lucide-react"
import { RiskBadge } from "@/components/RiskBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getPatientQueue() {
    // Fetch latest triage record for each patient or just list all recent triages
    const records = await db.triageRecord.findMany({
        include: {
            patient: true,
        },
        orderBy: [
            { riskLevel: 'desc' }, // Need careful sorting if enum is string
            { createdAt: 'desc' }
        ],
        take: 50
    })

    const riskOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };

    return records.sort((a, b) => {
        const scoreA = riskOrder[a.riskLevel as keyof typeof riskOrder] || 0;
        const scoreB = riskOrder[b.riskLevel as keyof typeof riskOrder] || 0;

        if (scoreA !== scoreB) return scoreB - scoreA; // Descending risk
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
    });
}

export default async function DoctorDashboard() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/login")
    }

    const queue = await getPatientQueue()

    const activeSOS = await db.sOSAlert.findMany({
        where: { status: "ACTIVE" },
        include: { patient: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
                    <p className="text-muted-foreground">Manage patient queue and triage assessments.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {queue.length} Patients Waiting
                    </div>
                </div>
            </div>

            {/* Active SOS Alerts */}
            {activeSOS.length > 0 && (
                <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg p-6 animate-pulse">
                    <div className="flex items-center gap-2 text-red-600 mb-4">
                        <AlertCircle className="h-6 w-6" />
                        <h2 className="text-lg font-bold">Active Emergency Alerts ({activeSOS.length})</h2>
                    </div>
                    <div className="space-y-4">
                        {activeSOS.map((alert: any) => (
                            <div key={alert.id} className="flex items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-lg border border-red-200 shadow-sm">
                                <div>
                                    <p className="font-bold text-lg">{alert.patient.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Triggered at {new Date(alert.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <form action={async () => {
                                    "use server"
                                    await resolveSOS(alert.id)
                                }}>
                                    <Button variant="destructive" size="sm">Resolve Alert</Button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Risk</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Symptoms</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {queue.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No active patients.
                                </TableCell>
                            </TableRow>
                        ) : (
                            queue.map((record) => (
                                <TableRow key={record.id} className={record.riskLevel === 'HIGH' ? "bg-red-50 dark:bg-red-900/10" : ""}>
                                    <TableCell>
                                        <RiskBadge level={record.riskLevel} />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {record.patient.name || record.patient.email}
                                        <div className="text-xs text-muted-foreground">{record.patient.email}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={record.symptoms}>
                                        {record.symptoms}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{record.recommendedDept}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={`/doctor/patient/${record.patientId}`}>View Details</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
