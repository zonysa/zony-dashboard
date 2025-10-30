import z from "zod";

// Profile details type
export type ProfileDetails = {
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
};

// Get profile response
export type GetProfileRes = {
  message: string;
  profile: ProfileDetails;
  status: "success" | "error";
};

// Form schema for updating profile
export const profileSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  phone_number: z.string().min(1, "Phone number is required").optional(),
  avatar: z.string().url().optional().nullable(),
  birth_date: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  identity: z.string().optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
