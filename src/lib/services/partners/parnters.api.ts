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

class ApiPartnersService implements IPartnersService {
  private readonly baseUrl = "/partners";

  async getPartners(params: PartnersQuery): Promise<PartnersResponse> {
    // Validate params
    const validatedParams = partnersQuerySchema.parse(params);

    const queryParams = new URLSearchParams({
      page: validatedParams.page.toString(),
      limit: validatedParams.limit.toString(),
    });

    if (validatedParams.search) {
      queryParams.set("search", validatedParams.search);
    }

    if (validatedParams.sortField) {
      queryParams.set("sortField", validatedParams.sortField);
      queryParams.set("sortDirection", validatedParams.sortDirection);
    }

    Object.entries(validatedParams.filters).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });

    const response: AxiosResponse<PartnersResponse> = await apiClient.get(
      `${this.baseUrl}?${queryParams}`
    );

    // Validate response
    const validatedResponse = partnersResponseSchema.parse(response.data);

    return {
      ...validatedResponse,
      data: validatedResponse.data.map((partner) =>
        partnerSchema.parse(partner)
      ),
    };
  }

  async getPartnerById(id: string): Promise<Partner> {
    if (!id) throw new Error("Partner ID is required");

    const response: AxiosResponse<Partner> = await apiClient.get(
      `${this.baseUrl}/${id}`
    );
    return partnerSchema.parse(response.data);
  }

  async createPartner(data: Omit<Partner, "id">): Promise<Partner> {
    // Validate input
    const validatedData = partnerSchema.omit({ id: true }).parse(data);

    const response: AxiosResponse<Partner> = await apiClient.post(
      this.baseUrl,
      validatedData
    );
    return partnerSchema.parse(response.data);
  }

  async updatePartner(
    id: string,
    updates: Partial<Omit<Partner, "id">>
  ): Promise<Partner> {
    if (!id) throw new Error("Partner ID is required");

    // Validate updates
    const validatedUpdates = partnerSchema
      .omit({ id: true })
      .partial()
      .parse(updates);

    const response: AxiosResponse<Partner> = await apiClient.patch(
      `${this.baseUrl}/${id}`,
      validatedUpdates
    );
    return partnerSchema.parse(response.data);
  }

  async deletePartner(
    id: string
  ): Promise<{ success: boolean; deletedId: string }> {
    if (!id) throw new Error("Partner ID is required");

    await apiClient.delete(`${this.baseUrl}/${id}`);
    return { success: true, deletedId: id };
  }

  async getFilterOptions(): Promise<PartnerFilterOptions> {
    const response: AxiosResponse<PartnerFilterOptions> = await apiClient.get(
      `${this.baseUrl}/filter-options`
    );
    return response.data;
  }

  async searchPartners(term: string, limit: number = 10): Promise<Partner[]> {
    if (!term || term.length < 2) return [];

    const queryParams = new URLSearchParams({
      q: term,
      limit: limit.toString(),
    });

    const response: AxiosResponse<Partner[]> = await apiClient.get(
      `${this.baseUrl}/search?${queryParams}`
    );

    return response.data.map((partner) => partnerSchema.parse(partner));
  }

  async getStats(): Promise<PartnerStats> {
    const response: AxiosResponse<PartnerStats> = await apiClient.get(
      `${this.baseUrl}/stats`
    );
    return response.data;
  }
}

export const apiPartnersService = new ApiPartnersService();
