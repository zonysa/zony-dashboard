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
  representative_phone_number: string;
  representative_name: string;
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
  search?: string;
  page?: number;
  limit?: number;
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

// IBAN Validation Helper
const validateIBAN = (iban: string): boolean => {
  // Remove spaces and convert to uppercase
  const cleanIBAN = iban.replace(/\s/g, "").toUpperCase();

  // Check basic format: 2 letter country code + 2 digits + up to 30 alphanumeric characters
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
  if (!ibanRegex.test(cleanIBAN)) {
    return false;
  }

  // Check length (IBAN should be between 15-34 characters)
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
    return false;
  }

  // Validate checksum using mod-97 algorithm
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);
  const numericString = rearranged
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      // Convert A-Z to 10-35
      return code >= 65 && code <= 90 ? (code - 55).toString() : char;
    })
    .join("");

  // Calculate mod 97
  let remainder = numericString.slice(0, 9);
  for (let i = 9; i < numericString.length; i += 7) {
    remainder =
      (parseInt(remainder, 10) % 97).toString() + numericString.slice(i, i + 7);
  }

  return parseInt(remainder, 10) % 97 === 1;
};

// Step 2: Bank Step Schema
export const bankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountHolderName: z.string().min(1, "Bank holder name is required"),
  accountNumber: z
    .string()
    .min(1, "Bank account number is required")
    .regex(/^\d+$/, "Account number must contain only digits")
    .min(8, "Account number must be at least 8 digits")
    .max(20, "Account number must not exceed 20 digits"),
  iban: z
    .string()
    .min(1, "IBAN is required")
    .refine(
      (value) => validateIBAN(value),
      "Invalid IBAN format. Please enter a valid IBAN (e.g., EG00 0000 0000 0000 0000 0000 000)",
    ),
  bankStatement: z.file().optional(),
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
