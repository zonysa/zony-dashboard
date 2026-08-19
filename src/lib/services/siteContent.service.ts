import {
  GetSiteContentSectionRes,
  GetSiteContentSectionsRes,
  UpdateSiteContentPayload,
  UpdateSiteContentSectionRes,
} from "@/lib/schema/siteContent.schema";
import { apiCall } from "./apiClient";

export const getSiteContentSections = async (): Promise<GetSiteContentSectionsRes> => {
  return apiCall({
    method: "GET",
    url: "/site-content",
  });
};

export const getSiteContentSection = async (
  sectionKey: string
): Promise<GetSiteContentSectionRes> => {
  return apiCall({
    method: "GET",
    url: `/site-content/${sectionKey}`,
  });
};

export const updateSiteContentSection = async (
  sectionKey: string,
  data: UpdateSiteContentPayload
): Promise<UpdateSiteContentSectionRes> => {
  return apiCall({
    method: "PATCH",
    url: `/site-content/${sectionKey}`,
    data,
  });
};
