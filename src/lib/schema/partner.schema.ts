import { z } from "zod";
import { registerSchema } from "./auth.schema";

// Get Partner Response
export interface PartnerDetails {
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
  partners: PartnerDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type GetPartnerRes = {
  message: string;
  partner: PartnerDetails;
  status: "success" | "error";
};

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

// Representative Person
export const representativeSchema = registerSchema.extend({
  id: z.number(),
  position: z.string().min(1, "Position is required").optional(),
});

// Step 1: Partner Information Schema
export const partnerInfoSchema = z.object({
  partnerName: z.string().min(1, "Partner name is required"),
  type: partnerTypeSchema,
  status: partnerStatusSchema,
  commercialRegistration: z.instanceof(File).optional(),
  payoutPerParcel: z.coerce
    .number()
    .min(1, "Payout per parcel must be positive"),
  currency: z.enum(["USD", "EUR", "EGP", "SAR"]),
  unifiedNumber: z.string().min(1, "Unified number is required"),
  representative: z.string(),
});

// Step 2: Bank Step Schema
export const bankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountHolderName: z.string().min(1, "Bank holder name is required"),
  accountNumber: z.string().min(1, "Bank account number is required"),
  iban: z.string().min(1, "IBAN is required"),
  bankStatement: z.file().optional(),
  confirmDetails: z.boolean().optional(),
  termsAccepted: z.boolean().optional(),
});

export const partnerSchema = partnerInfoSchema.and(bankSchema);

// Partners Query Schema (for list/pagination)
export const partnersQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
  filters: z.record(z.string(), z.string()).default({}),
});

// Types
export type PartnerFormData = z.infer<typeof partnerSchema>;
export type RepresentativeFormData = z.infer<typeof representativeSchema>;
export type BankFormData = z.infer<typeof bankSchema>;
export type PartnersQuery = z.infer<typeof partnersQuerySchema>;

// API Request Type (snake_case for backend)
export type CreatePartnerRequest = {
  name: string;
  type: z.infer<typeof partnerTypeSchema>;
  status: z.infer<typeof partnerStatusSchema>;
  commercial_registration: string;
  payout_per_parcel: number;
  unified_number: string;
  currency: "USD" | "EUR" | "EGP" | "SAR";
  bank_name: string;
  bank_holder_name: string;
  bank_account_number: string;
  IBAN: string;
  representative_id: string;
};
