import { Badge } from "@/components/ui/badge"

interface RiskBadgeProps {
    level: string
}

export function RiskBadge({ level }: RiskBadgeProps) {
    const normalizedLevel = level.toUpperCase()

    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let className = ""

    switch (normalizedLevel) {
        case "HIGH":
        case "CRITICAL":
            variant = "destructive"
            break
        case "MEDIUM":
            variant = "secondary" // or custom yellow if available, sticking to Shadcn tokens
            className = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" // Tailwind Override
            break
        case "LOW":
            variant = "default" // or custom green
            className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" // Tailwind Override
            break
        default:
            variant = "outline"
    }

    return (
        <Badge variant={variant} className={className}>
            {normalizedLevel} RISK
        </Badge>
    )
}
