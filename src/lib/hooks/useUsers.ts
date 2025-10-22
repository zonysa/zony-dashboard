import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "@/lib/services/users.service";
import {
  UserFormData,
  userFilterOptions,
  GetUsersRes,
  GetUserRes,
} from "../schema/user.schema";
import { useRouter } from "next/navigation";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Get all users
export function useGetUsers(filters?: userFilterOptions) {
  return useQuery<GetUsersRes, Error>({
    queryKey: userKeys.list(JSON.stringify(filters) || ""),
    queryFn: () => getUsers(filters),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get single user by ID
export function useGetUser(id: string) {
  return useQuery<GetUserRes, Error>({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Redirect to users list
      router.push("/users");
    },
    onError: (error) => {
      console.error("Create user error:", error);
    },
  });
}

// Update user
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: Partial<UserFormData>) => updateUser(id, data),
    onSuccess: () => {
      // Invalidate the specific user and the list
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Redirect to users list or detail page
      router.push("/users");
    },
    onError: (error) => {
      console.error("Update user error:", error);
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Redirect to users list
      router.push("/users");
    },
    onError: (error) => {
      console.error("Delete user error:", error);
    },
  });
}

// Toggle user active status
export function useToggleUserStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (is_active: boolean) => updateUser(id, { is_active }),
    onSuccess: () => {
      // Invalidate the specific user and the list
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      console.error("Toggle user status error:", error);
    },
  });
}
