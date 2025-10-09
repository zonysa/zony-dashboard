import { AxiosResponse } from "axios";
import { apiClient } from "@/lib/config/axois";
import {
  IPartnersService,
  PartnersQuery,
  PartnersResponse,
  Partner,
  PartnerFilterOptions,
  PartnerStats,
  partnerSchema,
  partnersQuerySchema,
  partnersResponseSchema,
} from "@/lib/schema/partners.schema";

const apiURL = "http://149.104.71.115:8000/partner";

const createPartner = async (data: Omit<Partner, "id">): Promise<Partner> => {
  const validatedData = partnerSchema.omit({ id: true }).parse(data);

  const res: AxiosResponse<Partner> = await apiClient.post(
    apiURL,
    validatedData
  );

  return partnerSchema.parse(res.data);
};

export const apiPartnerService: IPartnersService = {
  createPartner,
};
