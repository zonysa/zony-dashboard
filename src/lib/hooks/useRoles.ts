import { useQuery } from "@tanstack/react-query";
import { getRoles } from "@/lib/services/role.service";
import { GetRolesRes, Role } from "@/lib/schema/role.schema";

// Roles rarely change; cache generously instead of refetching per form mount.
export function useRoles() {
  return useQuery<GetRolesRes, Error>({
    queryKey: ["roles"],
    queryFn: getRoles,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

// Role ids are assigned by DB insertion order and are NOT guaranteed to
// match across environments (dev/staging/prod can and do differ) — always
// resolve a role's id through this lookup instead of hardcoding it.
export function getRoleId(roles: Role[] | undefined, name: string): number | undefined {
  return roles?.find((role) => role.name === name)?.id;
}
