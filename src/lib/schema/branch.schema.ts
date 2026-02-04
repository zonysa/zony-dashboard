import { z } from "zod";
import { passwordSchema, registerSchema } from "./auth.schema";

export const ResponsibleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  phone_number: z.string().min(6),
});

// Get Branches
export interface GetBranchesRes {
  pudos: Branch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get Branch
export interface GetBranchRes {
  message: string;
  pudo: Branch;
  status: string;
}

// Filter Options
export interface BranchFilterOptions {
  city?: string;
  district?: string;
  zone?: string;
  supervisor?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
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

const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const OperatingDaySchema = z.object({
  breakHour: z.string(),
  enabled: z.boolean(),
  from: z.string(),
  to: z.string(),
});

const OperatingHoursSchema = z.object({
  friday: OperatingDaySchema,
  monday: OperatingDaySchema,
  saturday: OperatingDaySchema,
  sunday: OperatingDaySchema,
  thursday: OperatingDaySchema,
  tuesday: OperatingDaySchema,
  wednesday: OperatingDaySchema,
});

export const branchSchema = z.object({
  activated_at: z.string().nullable(),
  address: z.string(),
  city_name: z.string(),
  coordinates: CoordinatesSchema,
  created_at: z.string(),
  cumulative_active_days: z.number().int(),
  district_name: z.string(),
  gallery: z.array(z.any()),
  id: z.number().int(),
  last_receive: z.string().nullable(),
  municipal_license: z.string(),
  name: z.string(),
  oprating_hours: OperatingHoursSchema,
  partner_name: z.string(),
  point_usage_percentage: z.number(),
  responsible: ResponsibleSchema,
  status: z.string(),
  supervisor_names: z.array(z.string()),
  total_parcels: z.number().int(),
  updated_at: z.string(),
  zone_id: z.number().int(),
});

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
  coordinates: z.string(),
  location: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  password: passwordSchema,
  branchPhotos: z.array(z.file()).optional(),
  municipalLicense: z.instanceof(File).optional(),
  partner: z.number(),
  responsible: z.string(),
});

// Step 2: Operating Hours Schema
export const operatingHoursSchema = z.object({
  sameHoursEveryday: z.boolean().default(false).optional(),
  twentyFourSeven: z.boolean().default(false).optional(),
  operatingHours: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        from: z.string(),
        to: z.string(),
        breakHour: z.string().optional(),
      }),
    )
    .optional(),
  termsAccepted: z.boolean().optional(),
  confirmDetails: z.boolean().optional(),
});

// Combined Schemas
export const createBranchSchema = branchInfoSchema.and(operatingHoursSchema);

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

// API Request type for creating a branch
export interface CreateBranchRequest {
  name: string;
  address: string;
  gallery: string[];
  oprating_hours: OperatingHours | undefined;
  municipal_license: string;
  password: string;
  coordinates: Record<string, unknown>;
  partner_id: number;
  district_id: number | string;
  zone_id: number | string;
  responsible_id: string;
}

// Exported Types

export type Branch = z.infer<typeof branchSchema>;
export type CreateBranch = z.infer<typeof createBranchSchema>;
export type BranchInfoData = z.infer<typeof branchInfoSchema>;
export type ResponsibleData = z.infer<typeof responsibleSchema>;
export type OperatingHoursData = z.infer<typeof operatingHoursSchema>;
export type BranchesQuery = z.infer<typeof branchesQuerySchema>;
