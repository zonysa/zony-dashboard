import z from "zod";

export interface Courier {
  id: string;
  name: string;
  courierCode: string;
  city: string;
  zone: string;
  districts: string;
  status: "Active" | "Inactive" | "On Duty" | "Off Duty" | "Suspended";
  phone: string;
  vehicleType: "Motorcycle" | "Bicycle" | "Van" | "Car";
  vehicleNumber: string;
  deliveriesCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Updated form schema to include all fields
export const formSchema = z
  .object({
    uploadPhoto: z.instanceof(File).optional().nullable(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    repeatPassword: z.string().min(8, "Password confirmation required"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    idNumber: z.string().min(5, "ID number is required"),
    city: z.string().min(1, "City is required"),
    assignedZones: z
      .array(z.string())
      .min(1, "At least one zone must be assigned"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ["repeatPassword"],
  });

export type CustomerServiceFormData = z.infer<typeof formSchema>;
