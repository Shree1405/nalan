import { useQuery } from "@tanstack/react-query";
import { api, type Patient } from "@shared/routes";

export function usePatients() {
  return useQuery({
    queryKey: [api.patients.list.path],
    queryFn: async () => {
      const res = await fetch(api.patients.list.path);
      if (!res.ok) throw new Error("Failed to fetch patient list");
      return (await res.json()) as Patient[];
    },
  });
}
