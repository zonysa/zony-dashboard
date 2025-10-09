import { z } from "zod";

export const partnerFormSchema = z.object({
  // Partner Information
  partnerName: z.string(),
  commercialRegistration: z.any().optional(),
  type: z.string().min(1, "Type is required"),
  unifiedNumber: z.string().min(1, "Unified number is required"),
  payoutPerParcels: z.coerce.number().min(1, "Payout per parcels is required"),
  currency: z.enum(["USD", "EUR", "EGP", "SAR"], {
    error: "Currency is required",
  }),

  // Representative Information
  representativeName: z.string().min(1, "Name is required"),
  representativePhone: z.string().min(1, "Phone number is required"),
  representativeJobTitle: z.string().min(1, "Job title is required"),
  representativeIdNumber: z.string().optional(),
  representativeEmail: z.string().email("Invalid email address"),
  representativeId: z.string().uuid().optional(),

  // Bank Account Information
  accountHolderName: z.string().min(1, "Account holder name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  iban: z.string().min(1, "IBAN is required"),
});

export type PartnerFormData = z.infer<typeof partnerFormSchema>;

// ✅ Step 1: Partner Information Schema
export const partnerInfoSchema = partnerFormSchema.pick({
  partnerName: true,
  commercialRegistration: true,
  type: true,
  unifiedNumber: true,
  payoutPerParcels: true,
  payoutPerOrder: true,
  currency: true,
  status: true,
});

export type PartnerInfoData = z.infer<typeof partnerInfoSchema>;

// ✅ Step 2: Representative Information Schema
export const representativeInfoSchema = partnerFormSchema.pick({
  representativeName: true,
  representativePhone: true,
  representativeJobTitle: true,
  representativeIdNumber: true,
  representativeEmail: true,
});

export type RepresentativeInfoData = z.infer<typeof representativeInfoSchema>;

// ✅ Step 3: Bank Account Information Schema
export const bankAccountInfoSchema = partnerFormSchema.pick({
  accountHolderName: true,
  bankName: true,
  accountNumber: true,
  iban: true,
});

export type BankAccountInfoData = z.infer<typeof bankAccountInfoSchema>;
