import { z } from "zod";

// Zod Schemas
export const partnerStatusSchema = z.enum([
  "Active",
  "Inactive",
  "Pending",
  "Suspended",
]);
export const partnerTypeSchema = z.enum([
  "super market",
  "convenience store",
  "pharmacy",
  "gas station",
  "restaurant",
  "retail store",
  "shopping mall",
  "logistics hub",
]);

// Main Partner Schema
export const partnerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Partner name is required"),
  type: partnerTypeSchema,
  status: partnerStatusSchema,
  commercial_registration: z
    .string()
    .min(1, "Commercial registration is required"),
  payout_per_parcel: z.coerce
    .number()
    .min(1, "Payout per parcel must be positive"),
  currency: z.enum(["USD", "EUR", "EGP", "SAR"]),
  unified_number: z.string().min(1, "Unified number is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  bank_holder_name: z.string().min(1, "Bank holder name is required"),
  bank_account_number: z.string().min(1, "Bank account number is required"),
  IBAN: z.string().min(1, "IBAN is required"),
  representative_id: z.string().uuid("Invalid representative ID"),

  // Optional fields that might come from API
  pudos: z.number().min(0, "PUDOs must be positive").optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating partner (without id)
export const createPartnerSchema = partnerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Schema for updating partner (all fields optional except id)
export const updatePartnerSchema = partnerSchema.omit({ id: true }).partial();

// Partners Query Schema (for list/pagination)
export const partnersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
  sortField: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  filters: z.record(z.string()).default({}),
});

// Partner Respone Schema
export const partnersResponseSchema = z.object({
  data: z.array(partnerSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Types
export type Partner = z.infer<typeof partnerSchema>;
export type PartnerStatus = z.infer<typeof partnerStatusSchema>;
export type PartnerType = z.infer<typeof partnerTypeSchema>;
export type PartnersQuery = z.infer<typeof partnersQuerySchema>;
export type PartnersResponse = z.infer<typeof partnersResponseSchema>;

export interface PartnerFilterOptions {
  cities: Array<{ value: string; label: string }>;
  districts: Array<{ value: string; label: string }>;
  types: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
}

export interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  totalPudos: number;
  averagePudosPerPartner: number;
  partnersByStatus: Record<string, number>;
  partnersByCity: Record<string, number>;
  partnersByType: Record<string, number>;
}

// Service interface
export interface IPartnersService {
  // getPartners(params: PartnersQuery): Promise<PartnersResponse>;
  // getPartnerById(id: string): Promise<Partner>;
  createPartner(data: Omit<Partner, "id">): Promise<Partner>;
  // updatePartner(
  //   id: string,
  //   updates: Partial<Omit<Partner, "id">>
  // ): Promise<Partner>;
  // deletePartner(id: string): Promise<{ success: boolean; deletedId: string }>;
  // getFilterOptions(): Promise<PartnerFilterOptions>;
  // searchPartners(term: string, limit?: number): Promise<Partner[]>;
  // getStats(): Promise<PartnerStats>;
}
