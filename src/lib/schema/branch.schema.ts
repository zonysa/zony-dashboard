import { z } from "zod";
import { registerSchema } from "./auth.schema";

// API Response Interfaces
export interface BranchDetails {
  id: number;
  branch_name: string;
  establishment_name: string;
  establishment_type: string;
  registration_number: string;
  tax_number: string;
  city: string;
  district: string;
  zone: string;
  short_address: string;
  branch_coordinates?: string;
  responsible_name: string;
  responsible_phone: string;
  operating_hours: OperatingHours;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  iban: string;
  status: string;
}

// Get Branches
export interface GetBranchesRes {
  pudos: BranchDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get Branch
export interface GetBranchRes {
  message: string;
  pudo: BranchDetails;
  status: string;
}

// Filter Options
export interface BranchFilterOptions {
  city?: string;
  district?: string;
  zone?: string;
  supervisor?: string;
  status?: string;
}

// Operating Hours Interface
export interface OperatingHours {
  [key: string]: {
    enabled: boolean;
    from: string;
    to: string;
    breakHour?: string;
  };
}

// Enum Schemas
export const branchStatusSchema = z.enum([
  "Active",
  "Inactive",
  "Pending",
  "Under Review",
]);

export const establishmentTypeSchema = z.enum([
  "retail",
  "pharmacy",
  "gas_station",
  "restaurant",
  "grocery",
  "convenience_store",
  "logistics_hub",
  "other",
]);

// Responsible Person Schema
export const responsibleSchema = registerSchema.extend({
  identityDocument: z.instanceof(File).optional(),
});

// Step 2: Branch/PUDO Information Schema
export const branchInfoSchema = z.object({
  branchName: z.string().min(1, "Branch name is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  zone: z.string().min(1, "Zone is required"),
  location: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  branchPhoto: z.instanceof(File).optional(),
  municipalLicense: z.instanceof(File).optional(),
  partner_id: z.string(),
  responsible: z.string(),
});

// Step 2: Operating Hours Schema
export const operatingHoursSchema = z.object({
  sameHoursEveryday: z.boolean().default(false),
  twentyFourSeven: z.boolean().default(false),
  operatingHours: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        from: z.string(),
        to: z.string(),
        breakHour: z.string().optional(),
      })
    )
    .optional(),
  termsAccepted: z.boolean().optional(),
  confirmDetails: z.boolean().optional(),
});

// Combined Schemas
export const branchSchema = branchInfoSchema.and(operatingHoursSchema);

// Query Schema for listing branches
export const branchesQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
  filters: z
    .object({
      city: z.string().optional(),
      district: z.string().optional(),
      establishment_type: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
});

// Exported Types
export type BranchFormData = z.infer<typeof branchSchema>;
export type BranchInfoData = z.infer<typeof branchInfoSchema>;
export type ResponsiblData = z.infer<typeof responsibleSchema>;
export type OperatingHoursData = z.infer<typeof operatingHoursSchema>;
export type BranchesQuery = z.infer<typeof branchesQuerySchema>;
