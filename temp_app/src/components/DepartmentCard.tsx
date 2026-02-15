import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Users, Stethoscope } from "lucide-react"

interface DepartmentCardProps {
    name: string
    doctorCount: number
    patientCount: number
    waitTime?: string
}

export function DepartmentCard({
    name,
    doctorCount,
    patientCount,
    waitTime = "15 mins",
}: DepartmentCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>Est. Wait Time: {waitTime}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span>{doctorCount} Doctors</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{patientCount} Patients</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
