import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface RiskBadgeProps {
  level: RiskLevel | string;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const getStyles = (l: string) => {
    switch (l.toLowerCase()) {
      case "low":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200 animate-pulse";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  return (
    <Badge variant="outline" className={cn("px-2.5 py-0.5 font-semibold border", getStyles(level), className)}>
      {level}
    </Badge>
  );
}
