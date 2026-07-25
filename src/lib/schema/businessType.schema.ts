import z from "zod";

export type BusinessTypeDetails = {
  id?: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export interface CreateBusinessTypeRes {
  message: string;
  status: "success" | "error";
  business_type: BusinessTypeDetails;
}

export interface GetBusinessTypesRes {
  message: string;
  status: "success" | "error";
  business_types: BusinessTypeDetails[];
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_business_types: number;
  total_pages: number;
}

export type GetBusinessTypeRes = {
  message: string;
  business_type: BusinessTypeDetails;
  status: "success" | "error";
};

// Base Schema
export const BusinessTypeSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
});

export type BusinessTypeFormData = z.infer<typeof BusinessTypeSchema>;
