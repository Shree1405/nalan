import { useDashboardStats } from "@/hooks/use-dashboard";
import { MetricCard } from "@/components/MetricCard";
import { RiskBadge } from "@/components/RiskBadge";
import { Users, Activity, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const COLORS = {
  Low: "#10b981", // emerald-500
  Medium: "#f59e0b", // amber-500
  High: "#f97316", // orange-500
  Critical: "#ef4444", // red-500
};

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!stats) return null;

  // Prepare chart data
  const chartData = stats.riskDistribution.map(item => ({
    name: item.risk,
    value: item.count,
    color: COLORS[item.risk as keyof typeof COLORS] || "#94a3b8"
  }));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Department Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time triage statistics and patient flow.</p>
        </div>
        <Link href="/triage">
          <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Activity className="mr-2 h-4 w-4" />
            Start New Triage
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users className="w-5 h-5" />}
          description="+12% from yesterday"
          className="border-l-blue-500"
        />
        <MetricCard
          title="Avg. Confidence"
          value={`${(stats.avgConfidence * 100).toFixed(1)}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          description="AI Model Accuracy"
          className="border-l-emerald-500"
        />
        <MetricCard
          title="Critical Cases"
          value={stats.riskDistribution.find(r => r.risk === "Critical")?.count || 0}
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
          description="Requires immediate attention"
          className="border-l-destructive"
        />
        <MetricCard
          title="Assessment Rate"
          value="4.2m"
          icon={<TrendingUp className="w-5 h-5" />}
          description="Avg. time to triage"
          className="border-l-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Current patient breakdown by AI-assessed risk level</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {chartData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600 font-medium">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Latest triaged patients</CardDescription>
            </div>
            <Link href="/patients">
              <Button variant="link" className="px-0">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentAssessments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No assessments yet.</p>
              ) : (
                stats.recentAssessments.slice(0, 5).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {assessment.patient?.id}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Patient #{assessment.patient?.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(assessment.createdAt!).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <RiskBadge level={assessment.riskLevel} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}
