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
import { mockPartners } from "@/lib/data/mocks/partner.mock";

// Mock delay utility
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

class MockPartnersService implements IPartnersService {
  async getPartners(params: PartnersQuery): Promise<PartnersResponse> {
    await delay(300 + Math.random() * 200);

    // Validate params
    const validatedParams = partnersQuerySchema.parse(params);

    let filteredData = [...mockPartners];

    // Apply search
    if (validatedParams.search) {
      const searchTerm = validatedParams.search.toLowerCase();
      filteredData = filteredData.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchTerm) ||
          partner.district.toLowerCase().includes(searchTerm) ||
          partner.type.toLowerCase().includes(searchTerm) ||
          partner.city.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    Object.entries(validatedParams.filters).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter(
          (partner) => (partner as any)[key] === value
        );
      }
    });

    // Apply sorting
    if (validatedParams.sortField) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[validatedParams.sortField!];
        const bValue = (b as any)[validatedParams.sortField!];

        if (aValue < bValue)
          return validatedParams.sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue)
          return validatedParams.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / validatedParams.limit);
    const startIndex = (validatedParams.page - 1) * validatedParams.limit;
    const paginatedData = filteredData.slice(
      startIndex,
      startIndex + validatedParams.limit
    );

    const response = {
      data: paginatedData,
      total,
      page: validatedParams.page,
      limit: validatedParams.limit,
      totalPages,
    };

    // Validate response
    return partnersResponseSchema.parse(response);
  }

  async getPartnerById(id: string): Promise<Partner> {
    await delay(200);

    const partner = mockPartners.find((p) => p.id === id);
    if (!partner) {
      throw new Error(`Partner with ID ${id} not found`);
    }

    return partnerSchema.parse(partner);
  }

  async createPartner(data: Omit<Partner, "id">): Promise<Partner> {
    await delay(800);

    // Validate input
    const validatedData = partnerSchema.omit({ id: true }).parse(data);

    const newPartner: Partner = {
      ...validatedData,
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    return partnerSchema.parse(newPartner);
  }

  async updatePartner(
    id: string,
    updates: Partial<Omit<Partner, "id">>
  ): Promise<Partner> {
    await delay(600);

    // Validate updates
    const validatedUpdates = partnerSchema
      .omit({ id: true })
      .partial()
      .parse(updates);

    const existingPartner = mockPartners.find((p) => p.id === id);
    if (!existingPartner) {
      throw new Error(`Partner with ID ${id} not found`);
    }

    const updatedPartner = { ...existingPartner, ...validatedUpdates };
    return partnerSchema.parse(updatedPartner);
  }

  async deletePartner(
    id: string
  ): Promise<{ success: boolean; deletedId: string }> {
    await delay(400);

    const partner = mockPartners.find((p) => p.id === id);
    if (!partner) {
      throw new Error(`Partner with ID ${id} not found`);
    }

    return { success: true, deletedId: id };
  }

  async getFilterOptions(): Promise<PartnerFilterOptions> {
    await delay(100);

    const cities = Array.from(new Set(mockPartners.map((p) => p.city)));
    const districts = Array.from(new Set(mockPartners.map((p) => p.district)));
    const types = Array.from(new Set(mockPartners.map((p) => p.type)));
    const statuses = Array.from(new Set(mockPartners.map((p) => p.status)));

    return {
      cities: cities.map((city) => ({ value: city, label: city })),
      districts: districts.map((district) => ({
        value: district,
        label: district,
      })),
      types: types.map((type) => ({ value: type, label: type })),
      statuses: statuses.map((status) => ({ value: status, label: status })),
    };
  }

  async searchPartners(term: string, limit: number = 10): Promise<Partner[]> {
    await delay(300);

    if (!term || term.length < 2) return [];

    const searchTerm = term.toLowerCase();
    const results = mockPartners
      .filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchTerm) ||
          partner.district.toLowerCase().includes(searchTerm) ||
          partner.type.toLowerCase().includes(searchTerm) ||
          partner.city.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit);

    return results.map((partner) => partnerSchema.parse(partner));
  }

  async getStats(): Promise<PartnerStats> {
    await delay(400);

    const totalPartners = mockPartners.length;
    const activePartners = mockPartners.filter(
      (p) => p.status === "Active"
    ).length;
    const totalPudos = mockPartners.reduce((sum, p) => sum + p.pudos, 0);

    const partnersByStatus = mockPartners.reduce((acc, partner) => {
      acc[partner.status] = (acc[partner.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const partnersByCity = mockPartners.reduce((acc, partner) => {
      acc[partner.city] = (acc[partner.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const partnersByType = mockPartners.reduce((acc, partner) => {
      acc[partner.type] = (acc[partner.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPartners,
      activePartners,
      totalPudos,
      averagePudosPerPartner:
        Math.round((totalPudos / totalPartners) * 100) / 100,
      partnersByStatus,
      partnersByCity,
      partnersByType,
    };
  }
}

export const mockPartnersService = new MockPartnersService();
