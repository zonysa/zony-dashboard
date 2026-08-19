// Content shapes are described by field specs (see lib/config/siteContentFields.ts),
// not static TS types -- each section's JSON blob is arbitrary structured data,
// so we keep these types loose (unknown/Record) rather than duplicating the
// field spec as a parallel type definition.

export type SiteContentValue = Record<string, unknown> | unknown[];

export type SiteContentSection = {
  id: number;
  section_key: string;
  content_ar: SiteContentValue;
  content_en: SiteContentValue;
  created_at?: string;
  updated_at?: string;
};

export interface GetSiteContentSectionsRes {
  message: string;
  status: "success" | "error";
  sections: SiteContentSection[];
}

export interface GetSiteContentSectionRes {
  message: string;
  status: "success" | "error";
  section: SiteContentSection;
}

export interface UpdateSiteContentSectionRes {
  message: string;
  status: "success" | "error";
  section: SiteContentSection;
}

export type UpdateSiteContentPayload = {
  content_ar?: SiteContentValue;
  content_en?: SiteContentValue;
};
