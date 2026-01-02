import { z } from "zod";

// =====================
// KPI Evaluation Types (from /kpis/evaluate endpoint)
// =====================

// Zone type for KPI evaluation
export type KPIZone = "red" | "yellow" | "green";

// Unit types for KPI
export type KPIUnit = "SAR" | "count" | "%";

// Single KPI Evaluation item (successful)
export interface KPIEvaluation {
  kpi_id: number;
  kpi_name: string;
  current_value: number;
  unit: KPIUnit;
  zone: KPIZone;
}

// Single KPI Evaluation item (with error)
export interface KPIEvaluationError {
  kpi_id: number;
  kpi_name: string;
  error: string;
}

// Combined type for evaluation item (can be success or error)
export type KPIEvaluationItem = KPIEvaluation | KPIEvaluationError;

// Helper type guard to check if evaluation has error
export const isKPIEvaluationError = (
  item: KPIEvaluationItem
): item is KPIEvaluationError => {
  return "error" in item;
};

// Response from /kpis/evaluate endpoint
export interface GetKPIEvaluationsRes {
  evaluations: KPIEvaluationItem[];
  message: string;
  status: "success" | "error";
  total: number;
}

// =====================
// KPI Configuration Types (for settings/admin)
// =====================

// Zone/Threshold zone types
export interface ThresholdZone {
  name: KPIZone;
  order: number;
  max?: number;
}

// Thresholds configuration
export interface Thresholds {
  comparison: "gte" | "lte";
  zones: ThresholdZone[];
}

// KPI Details (API Response)
export interface KPIDetails {
  id: number;
  name: string;
  description: string;
  unit: string;
  thresholds: Thresholds;
  created_at: string;
  updated_at: string;
}

// Get KPIs Response (List)
export interface GetKPIsRes {
  kpis: KPIDetails[];
  total_kpis: number;
  current_page: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
  message: string;
  status: "success" | "error";
}

// Get KPI Response (Single)
export interface GetKPIRes {
  kpi: KPIDetails;
  message: string;
  status: "success" | "error";
}

// =====================
// Zod Schemas
// =====================

export const kpiZoneSchema = z.enum(["red", "yellow", "green"]);

export const kpiUnitSchema = z.enum(["%", "count", "SAR"]);

export const thresholdZoneSchema = z.object({
  name: kpiZoneSchema,
  order: z.number(),
  max: z.number().optional(),
});

export const thresholdsSchema = z.object({
  comparison: z.enum(["gte", "lte"]),
  zones: z.array(thresholdZoneSchema),
});

// KPI Form Schema (for creating/editing KPIs)
export const kpiFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  unit: kpiUnitSchema,
  thresholds: thresholdsSchema,
});

// KPIs Query Schema (for list/pagination)
export const kpisQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
  startDate: z.string().optional(), // Format: YYYY-MM-DD
  endDate: z.string().optional(), // Format: YYYY-MM-DD
  filters: z.record(z.string(), z.string()).default({}),
});

// Types
export type KPIFormData = z.infer<typeof kpiFormSchema>;
export type KPIsQuery = z.infer<typeof kpisQuerySchema>;

// API Request Type (for creating KPI)
export type CreateKPIRequest = {
  name: string;
  description?: string;
  unit: string;
  thresholds: Thresholds;
};

// Update KPI Request (all fields optional)
export type UpdateKPIRequest = Partial<CreateKPIRequest>;
