import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertPatient, type TriageResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTriageAssess() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertPatient) => {
      // Basic client-side transform to ensure types match API expectations if form libraries are loose
      // For arrays like symptoms and conditions, ensure they are arrays of strings
      
      const res = await fetch(api.triage.assess.path, {
        method: api.triage.assess.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to process triage assessment");
      }

      // We manually cast here because we know the shape matches our schema
      return (await res.json()) as TriageResponse;
    },
    onSuccess: () => {
      toast({
        title: "Assessment Complete",
        description: "Patient has been triaged successfully.",
        variant: "default",
      });
      // Invalidate dashboard stats so they refresh
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
    onError: (error) => {
      toast({
        title: "Triage Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useEmergencyOverride() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.triage.emergency.path, {
        method: api.triage.emergency.method,
      });

      if (!res.ok) throw new Error("Emergency override failed");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "EMERGENCY PROTOCOL ACTIVATED",
        description: `${data.message} - Redirecting to ${data.department}`,
        variant: "destructive",
      });
    },
  });
}
