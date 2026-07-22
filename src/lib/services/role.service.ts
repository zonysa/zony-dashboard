import { apiCall } from "./apiClient";
import { GetRolesRes } from "../schema/role.schema";

export const getRoles = async (): Promise<GetRolesRes> => {
  return apiCall({
    method: "GET",
    url: "/roles",
  });
};
