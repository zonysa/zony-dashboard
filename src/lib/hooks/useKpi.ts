import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKPIEvaluations,
  getKPIs,
  getKPI,
  updateKPI,
} from "@/lib/services/kpi.service";
import {
  GetKPIEvaluationsRes,
  GetKPIsRes,
  GetKPIRes,
  KPIsQuery,
  UpdateKPIRequest,
} from "@/lib/schema/kpi.schema";

// Query keys factory
export const kpiKeys = {
  all: ["kpis"] as const,
  lists: () => [...kpiKeys.all, "list"] as const,
  list: (query?: Partial<KPIsQuery>) => [...kpiKeys.lists(), query] as const,
  details: () => [...kpiKeys.all, "detail"] as const,
  detail: (id: string) => [...kpiKeys.details(), id] as const,
  evaluations: () => [...kpiKeys.all, "evaluations"] as const,
};

// Get KPI Evaluations (real-time KPI data from /kpis/evaluate)
export function useGetKPIEvaluations() {
  return useQuery<GetKPIEvaluationsRes, Error>({
    queryKey: kpiKeys.evaluations(),
    queryFn: getKPIEvaluations,
    staleTime: 2 * 60 * 1000, // Keep fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Invalidate KPI queries manually
export function useInvalidateKPIs() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: kpiKeys.all }),
    invalidateEvaluations: () =>
      queryClient.invalidateQueries({ queryKey: kpiKeys.evaluations() }),
  };
}

// Prefetch KPI evaluations
export function usePrefetchKPIEvaluations() {
  const queryClient = useQueryClient();

  return () => {
    return queryClient.prefetchQuery({
      queryKey: kpiKeys.evaluations(),
      queryFn: getKPIEvaluations,
      staleTime: 2 * 60 * 1000,
    });
  };
}

// =====================
// KPI Configuration Hooks
// =====================

// Get KPIs list (for settings/configuration)
export function useGetKPIs(query?: Partial<KPIsQuery>) {
  return useQuery<GetKPIsRes, Error>({
    queryKey: kpiKeys.list(query),
    queryFn: () => getKPIs(query),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

// Get single KPI by ID
export function useGetKPI(id: string, enabled = true) {
  return useQuery<GetKPIRes, Error>({
    queryKey: kpiKeys.detail(id),
    queryFn: () => getKPI(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Update KPI mutation
export function useUpdateKPI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKPIRequest }) =>
      updateKPI(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific KPI
      queryClient.invalidateQueries({ queryKey: kpiKeys.detail(variables.id) });
      // Invalidate the list
      queryClient.invalidateQueries({ queryKey: kpiKeys.lists() });
      // Also invalidate evaluations since thresholds might affect them
      queryClient.invalidateQueries({ queryKey: kpiKeys.evaluations() });
    },
  });
}
