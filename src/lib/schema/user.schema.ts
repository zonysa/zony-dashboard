import z from "zod";

// User details type
export type UserDetails = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone_number: string;
  avatar: string | null;
  birth_date: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  identity: string | null;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
};

// Get single user response
export type GetUserRes = {
  message: string;
  user: UserDetails;
  status: "success" | "error";
};

// Get users list response
export type GetUsersRes = {
  current_page: number;
  message: string;
  next_page: number | null;
  prev_page: number | null;
  status: "success" | "error";
  total_pages: number;
  total_users: number;
  users: UserDetails[];
};

export type GetSupervisorsRes = Omit<GetUsersRes, "users" | "total_users"> & {
  supervisors: UserDetails[];
  total_supervisors: number;
};
export type GetCouriersRes = Omit<GetUsersRes, "users" | "total_users"> & {
  couriers: UserDetails[];
  total_couriers: number;
};
export type GetCustomerServicesRes = Omit<
  GetUsersRes,
  "users" | "total_users"
> & {
  customer_service: UserDetails[];
  total_customer_service: number;
};

// Filter options
export interface userFilterOptions {
  is_active?: boolean;
  role_id: number;
  page?: number;
}

// Form schema for creating/updating users
export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone_number: z.string().min(1, "Phone number is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  avatar: z.string().url().optional().nullable(),
  birth_date: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  identity: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type UserFormData = z.infer<typeof userSchema>;

// Table type (for displaying in DataTable)
export type UserTable = UserDetails;
