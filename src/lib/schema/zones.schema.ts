import z from "zod";

export const ZONE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
} as const;

export type ZoneStatus = (typeof ZONE_STATUS)[keyof typeof ZONE_STATUS];
type ZoneCoordinates = {
  lng: string;
  lat: string;
};

export interface ZoneDetails {
  id: number;
  name: string;
  status: ZoneStatus;
  city_name: string;
  district_names?: string[];
  total_pudos?: number;
  total_parcels?: number;
  supervisor_name: string;
  rating?: string;
  created_at: string;
  updated_at: string;
  coordinates: ZoneCoordinates;
}

export interface CreateZoneReq {
  name: string;
  status: ZoneStatus;
  city_id: number;
  districts_ids?: number[];
}

// Create Zone Response
export interface CreateZoneRes {
  message: string;
  status: "success" | "error";
  zone: ZoneDetails;
}

// Get Zones Response
export interface GetZonesRes {
  message: string;
  status: "success" | "error";
  zones: ZoneDetails[];
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_zones: number;
  total_pages: number;
}

export interface GetZoneRes {
  message: string;
  status: string;
  zone: ZoneDetails;
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
    city_id: z.number().int().positive(),
    districts: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      )
      .optional(),
  })
  .strict();

export type ZoneFormData = z.infer<typeof ZoneSchema>;
