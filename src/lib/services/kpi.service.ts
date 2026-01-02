import {
  CreateKPIRequest,
  GetKPIRes,
  GetKPIsRes,
  GetKPIEvaluationsRes,
  KPIsQuery,
  UpdateKPIRequest,
} from "../schema/kpi.schema";
import { apiCall } from "./apiClient";

// =====================
// KPI Evaluation (Real Data)
// =====================

// Get KPI Evaluations (real-time KPI data)
export const getKPIEvaluations = async (): Promise<GetKPIEvaluationsRes> => {
  return apiCall({
    method: "GET",
    url: "/kpis/evaluate",
  });
};

// =====================
// KPI Configuration (CRUD)
// =====================

// Create KPI
export const createKPI = async (data: CreateKPIRequest) => {
  return apiCall({
    method: "POST",
    url: "/kpis",
    data,
  });
};

// Get KPIs (with pagination and filters)
export const getKPIs = async (
  query?: Partial<KPIsQuery>
): Promise<GetKPIsRes> => {
  const params = new URLSearchParams();

  if (query?.page) params.append("page", query.page.toString());
  if (query?.limit) params.append("limit", query.limit.toString());
  if (query?.search) params.append("search", query.search);
  if (query?.startDate) params.append("startDate", query.startDate);
  if (query?.endDate) params.append("endDate", query.endDate);

  // Add any additional filters
  if (query?.filters) {
    Object.entries(query.filters).forEach(([key, value]) => {
      params.append(key, value);
    });
  }

  return apiCall({
    method: "GET",
    url: `/kpis${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get KPI by ID
export const getKPI = async (id: string): Promise<GetKPIRes> => {
  return apiCall({
    method: "GET",
    url: `/kpis/${id}`,
  });
};

// Update KPI by ID
export const updateKPI = async (id: string, data: UpdateKPIRequest) => {
  return apiCall({
    method: "PATCH",
    url: `/kpis/${id}`,
    data,
  });
};

// Delete KPI by ID
export const deleteKPI = async (id: string) => {
  return apiCall({
    method: "DELETE",
    url: `/kpis/${id}`,
  });
};
