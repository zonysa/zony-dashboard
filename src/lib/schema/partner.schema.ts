import { z } from "zod";
import { registerSchema } from "./auth.schema";

// Get Partner Response
export interface PartnerRes {
  id: number;
  name: string;
  type: string;
  status: string;
  commercial_registration: string;
  payout_per_parcel: number;
  currency: string;
  unified_number: string;
  bank_name: string;
  bank_holder_name: string;
  bank_account_number: string;
  IBAN: string;
  created_at: string;
  updated_at: string;
}

// Get Partners Response
export interface GetPartnersRes {
  partners: PartnerRes[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter
export interface partnerFilterOptions {
  type?: string;
  status?: string;
}

export type table = {
  name: string;
  type: string;
  pudos: string;
  status: string;
};

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

// Step 1: Representative Person Step Schema
export const representativeSchema = registerSchema.extend({
  id: z.number(),
  position: z.string().min(1, "Position is required").optional(),
});

// Step 2: Partner Information Schema
export const partnerInfoSchema = z.object({
  partnerName: z.string().min(1, "Partner name is required"),
  type: partnerTypeSchema,
  status: partnerStatusSchema,
  commercialRegistration: z
    .string()
    .min(1, "Commercial registration is required"),
  payoutPerParcel: z.coerce
    .number()
    .min(1, "Payout per parcel must be positive"),
  currency: z.enum(["USD", "EUR", "EGP", "SAR"]),
  unifiedNumber: z.string().min(1, "Unified number is required"),
});

// Step 3: Bank Step Schema
export const bankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountHolderName: z.string().min(1, "Bank holder name is required"),
  accountNumber: z.string().min(1, "Bank account number is required"),
  iban: z.string().min(1, "IBAN is required"),
});

export const createPartnerSchema = partnerInfoSchema.extend({
  representativeId: z.string(),
});

export const partnerSchema = partnerInfoSchema
  .and(bankSchema)
  .and(representativeSchema);

// Partners Query Schema (for list/pagination)
export const partnersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
  filters: z.record(z.string()).default({}),
});

// Types
export type PartnerFormData = z.infer<typeof partnerSchema>;
export type RepresentativeFormData = z.infer<typeof representativeSchema>;
export type PartnersQuery = z.infer<typeof partnersQuerySchema>;
export type CreatePartnerData = z.infer<typeof createPartnerSchema>;
