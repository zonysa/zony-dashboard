import { z } from "zod";
import { registerSchema } from "./auth.schema";

export interface courierProps {
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

// Filter
export interface courierFilterOptions {
  type?: string;
  status?: string;
}

// Create Customer Service Schema
export const courierSchema = registerSchema.extend({
  photo: z.file().optional(),
});

// Type inference from schema
export type CourierFormData = z.infer<typeof courierSchema>;
