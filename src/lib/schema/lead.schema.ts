import { z } from "zod";

export const leadSourceTabSchema = z.enum(["store", "partner"]);
export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "converted",
  "rejected",
]);

export interface Lead {
  id: string;
  source_tab: "store" | "partner";
  name: string;
  phone_number: string;
  email: string | null;
  message: string | null;
  city: string | null;
  store_name: string | null;
  company: string | null;
  parcels_volume: string | null;
  locale: string | null;
  status: "new" | "contacted" | "converted" | "rejected";
  source: string;
  converted_partner_id: number | null;
  converted_client_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface GetLeadsRes {
  leads: Lead[];
  total_leads: number;
  total_pages: number;
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
}

export type GetLeadRes = {
  message: string;
  lead: Lead;
  status: "success" | "error";
};

export interface LeadFilterOptions {
  status?: string;
  source_tab?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type UpdateLeadRequest = Partial<{
  status: Lead["status"];
  converted_partner_id: number;
  converted_client_id: number;
}>;
