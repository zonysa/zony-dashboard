import { z } from "zod";

export interface CustomerServiceProps {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: "Active" | "Inactive" | "On Break" | "Training" | "Suspended";
  department: "Customer Support" | "Technical Support" | "Billing Support";
  shift: "Morning" | "Afternoon" | "Evening" | "Night";
  ticketsHandled: number;
  avgResponseTime: number; // in minutes
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export const formSchema = z
  .object({
    uploadPhoto: z
      .instanceof(File)
      .optional()
      .nullable()
      .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
        message: "File size must be less than 5MB.",
      })
      .refine((file) => !file || file.type.startsWith("image/"), {
        message: "Only image files are allowed.",
      }),
    name: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters.",
      })
      .max(50, {
        message: "Name must be less than 50 characters.",
      }),
    phoneNumber: z
      .string()
      .min(10, {
        message: "Phone number must be at least 10 digits.",
      })
      .max(15, {
        message: "Phone number must be less than 15 digits.",
      })
      .regex(/^\d+$/, {
        message: "Phone number must contain only digits.",
      }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      }),
    repeatPassword: z.string().min(8, {
      message: "Password confirmation must be at least 8 characters.",
    }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords don't match.",
    path: ["repeatPassword"],
  });

// Type inference from schema
export type CustomerServiceFormData = z.infer<typeof formSchema>;
