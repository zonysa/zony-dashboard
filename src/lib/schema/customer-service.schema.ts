import { z } from "zod";
import { registerSchema } from "./auth.schema";

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

// Filter
export interface customerServiceFilterOptions {
  type?: string;
  status?: string;
}

// Create Customer Service Schema
export const customerServiceSchema = registerSchema.extend({
  photo: z.file().optional(),
});

// Type inference from schema
export type CustomerServiceFormData = z.infer<typeof customerServiceSchema>;
