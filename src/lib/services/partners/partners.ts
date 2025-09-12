import {
  ServerTableParams,
  serverTableParamsSchema,
  ServerTableResponse,
} from "@/lib/schema/partners.schema";
import { mockPartners } from "../../data/mocks/partner.mock";

export class PartnersService {
  private static async delay(ms: number = 500) {
    return new Promise((res) => setTimeout(res, ms));
  }

  static async getPartners(
    params: ServerTableParams
  ): Promise<ServerTableResponse> {
    await this.delay(300 + Math.random() * 200);

    const validatedParams = serverTableParamsSchema.parse(params);

    let filteredData = [...mockPartners];

    if (validatedParams.search) {
      const searchTerm = validatedParams.search.toLowerCase();
      filteredData = filteredData.filter((partner) =>
        partner.name.toLowerCase().includes(searchTerm)
      );
    }

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
  }
}
