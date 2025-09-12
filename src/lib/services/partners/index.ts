// lib/services/partners/index.ts
import { IPartnersService } from "@/lib/schema/partners.schema";
import { mockPartnersService } from "./partners.mock";
import { apiPartnersService } from "./parnters.api";

const IS_MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Service selector
export const partnersService: IPartnersService = IS_MOCK_MODE
  ? mockPartnersService
  : apiPartnersService;

// Export types
export type * from "@/lib/schema/partners.schema";

// Export convenience functions
export const getPartners = partnersService.getPartners.bind(partnersService);
export const getPartnerById =
  partnersService.getPartnerById.bind(partnersService);
export const createPartner =
  partnersService.createPartner.bind(partnersService);
export const updatePartner =
  partnersService.updatePartner.bind(partnersService);
export const deletePartner =
  partnersService.deletePartner.bind(partnersService);
export const getPartnerFilterOptions =
  partnersService.getFilterOptions.bind(partnersService);
export const searchPartners =
  partnersService.searchPartners.bind(partnersService);
export const getPartnerStats = partnersService.getStats.bind(partnersService);
