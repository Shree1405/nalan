import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { RiskBadge } from "@/components/RiskBadge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getHistory() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    return await db.triageRecord.findMany({
        where: { patientId: session.user.id },
        orderBy: { createdAt: "desc" },
    })
}

export default async function HistoryPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/login")
    }

    const history = await getHistory()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">History</h1>
                    <p className="text-muted-foreground">
                        View your past triage assessments and recommendations.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/patient/new-triage">New Assessment</Link>
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Symptoms</TableHead>
                            <TableHead>Risk Level</TableHead>
                            <TableHead>Department</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            history.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>
                                        {new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={record.symptoms}>
                                        {record.symptoms}
                                    </TableCell>
                                    <TableCell>
                                        <RiskBadge level={record.riskLevel} />
                                    </TableCell>
                                    <TableCell>{record.recommendedDept}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
