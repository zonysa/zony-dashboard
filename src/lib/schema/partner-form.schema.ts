import { z } from "zod";

export const partnerFormSchema = z.object({
  // Partner Information
  commercialRegistration: z.any().optional(),
  type: z.string().min(1, "Type is required"),
  unifiedNumber: z.string().min(1, "Unified number is required"),
  payoutPerOrder: z.string().min(1, "Payout per order is required"),
  payoutPerParcels: z.string().min(1, "Payout per parcels is required"),
  currency: z.string().min(1, "Currency is required"),

  // Representative Information
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  idNumber: z.string().optional(),
  email: z.string().email("Invalid email address"),

  // Bank Account Information
  accountHolderName: z.string().min(1, "Account holder name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  iban: z.string().min(1, "IBAN is required"),
});

export type PartnerFormData = z.infer<typeof partnerFormSchema>;
