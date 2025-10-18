import z from "zod";

export const ZONE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
} as const;

export type ZoneStatus = (typeof ZONE_STATUS)[keyof typeof ZONE_STATUS];

interface ZoneBase {
  id: number;
  name: string;
  status: ZoneStatus;
}

export interface ZoneRes extends ZoneBase {
  city_name: string;
  district_names?: string[];
  total_pudos?: number;
  total_parcels?: number;
  supervisor_name: string;
  rating?: string;
  created_at: string;
  updated_at: string;
}

export interface ZoneTable {
  id: string;
  city: string;
  districts: string[];
  totalPudos: number;
  totalParcels: number;
  suptervisor: string;
  status: string;
}

export interface CreateZoneReq {
  name: string;
  status: ZoneStatus;
  city_id: number;
  districts_ids?: number[];
}

// Dashboard Table
export interface ZoneTable {
  id: string;
  city: string;
  districts: string;
  pudos: number;
  parcels: number;
  supervisor: string;
  status: ZoneStatus;
}

// Create Zone Response
export interface CreateZoneRes {
  message: string;
  status: "success" | "error";
  zone: ZoneRes;
}

// Get Zones Response
export interface GetZonesRes {
  message: string;
  status: "success" | "error";
  zones: ZoneRes[];
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_zones: number;
  total_pages: number;
}

// Query Paramaters
export interface GetZonesFilter {
  zoneId?: number;
  cityId?: number;
  districtId?: number;
}

// Schema
export const ZoneSchema = z
  .object({
    name: z.string().trim().min(1, "name is required"),
    status: z.enum(["active", "inactive"]).optional(),
    city: z.number().int().positive(),

    districts: z.array(z.number().int().positive()).optional(),
  })
  .strict();

export type ZoneFormData = z.infer<typeof ZoneSchema>;
