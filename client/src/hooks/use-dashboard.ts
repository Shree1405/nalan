import { useQuery } from "@tanstack/react-query";
import { api, type DashboardStats } from "@shared/routes";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      // Cast the result to the expected type
      return (await res.json()) as DashboardStats;
    },
    refetchInterval: 30000, // Refresh every 30s for a dashboard
  });
}
