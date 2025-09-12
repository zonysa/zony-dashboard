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

export const partnerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Partner name is required"),
  type: partnerTypeSchema,
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  pudos: z.number().min(0, "PUDOs must be positive"),
  status: partnerStatusSchema,
});

// Request/Response schemas
export const partnersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
  sortField: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  filters: z.record(z.string()).default({}),
});

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
  getPartners(params: PartnersQuery): Promise<PartnersResponse>;
  getPartnerById(id: string): Promise<Partner>;
  createPartner(data: Omit<Partner, "id">): Promise<Partner>;
  updatePartner(
    id: string,
    updates: Partial<Omit<Partner, "id">>
  ): Promise<Partner>;
  deletePartner(id: string): Promise<{ success: boolean; deletedId: string }>;
  getFilterOptions(): Promise<PartnerFilterOptions>;
  searchPartners(term: string, limit?: number): Promise<Partner[]>;
  getStats(): Promise<PartnerStats>;
}
