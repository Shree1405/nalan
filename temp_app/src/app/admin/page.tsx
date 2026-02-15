import { db } from "@/lib/db"
import { DepartmentCard } from "@/components/DepartmentCard"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { RiskChart } from "@/components/admin/RiskChart"
import { DepartmentChart } from "@/components/admin/DepartmentChart"
import { AlertCircle } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getStats() {
    const totalPatients = await db.user.count({ where: { role: 'PATIENT' } })
    const totalDoctors = await db.user.count({ where: { role: 'DOCTOR' } })

    const riskDistribution = await db.triageRecord.groupBy({
        by: ['riskLevel'],
        _count: {
            _all: true
        }
    })

    const deptDistribution = await db.triageRecord.groupBy({
        by: ['recommendedDept'],
        _count: {
            _all: true
        },
        orderBy: {
            _count: {
                recommendedDept: 'desc'
            }
        },
        take: 5
    })

    return {
        totalPatients,
        totalDoctors,
        riskData: riskDistribution.map(g => ({ name: g.riskLevel, value: g._count._all })),
        deptData: deptDistribution.map(g => ({ name: g.recommendedDept, patients: g._count._all })),
    }
}

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/login")
    }

    const stats = await getStats()

    const activeSOS = await db.sOSAlert.findMany({
        where: { status: "ACTIVE" },
        include: { patient: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground">
                        Real-time analytics of triage system performance.
                    </p>
                </div>
            </div>

            {/* Active SOS Alerts */}
            {activeSOS.length > 0 && (
                <Card className="border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-6 w-6" />
                            Active Emergency Alerts ({activeSOS.length})
                        </CardTitle>
                        <CardDescription>System-wide emergency monitoring.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {activeSOS.map((alert: any) => (
                                <div key={alert.id} className="flex items-center justify-between text-sm">
                                    <span className="font-bold">{alert.patient.name}</span>
                                    <span className="text-muted-foreground">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Triages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.riskData.reduce((acc, curr) => acc + curr.value, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPatients}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active SOS</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{activeSOS.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RiskChart data={stats.riskData} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Department Load</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentChart data={stats.deptData} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <DepartmentCard name="Cardiology" doctorCount={3} patientCount={stats.deptData.find(d => d.name === 'Cardiology')?.patients || 0} waitTime="45 mins" />
                <DepartmentCard name="General Medicine" doctorCount={8} patientCount={stats.deptData.find(d => d.name === 'General Medicine')?.patients || 0} waitTime="15 mins" />
                <DepartmentCard name="Neurology" doctorCount={2} patientCount={stats.deptData.find(d => d.name === 'Neurology')?.patients || 0} waitTime="30 mins" />
            </div>

        </div>
    )
}
