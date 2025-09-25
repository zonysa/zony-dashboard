export interface PUDOFormData {
  // Establishment Info Step
  "establishment-name"?: string;
  "establishment-type"?: string;
  "registration-number"?: string;
  "tax-number"?: string;
  "establishment-email"?: string;
  "establishment-phone"?: string;
  "establishment-website"?: string;
  "establishment-description"?: string;

  // PUDO Info Step
  "branch-name"?: string;
  city?: string;
  district?: string;
  zone?: string;
  "branch-coordinates"?: string;
  "short-address"?: string;
  "branch-photos"?: File[];
  "municipal-license"?: File;

  // Responsible Person Step
  "full-name"?: string;
  "phone-number"?: string;
  "identity-document"?: File;

  // Operating Hours Step
  "same-hours-everyday"?: boolean;
  "24-7"?: boolean;
  "operating-hours"?: {
    [key: string]: {
      enabled: boolean;
      to: string;
      from: string;
      breakHour?: string;
    };
  };

  // Bank Account Step (from your existing component)
  "bank-name"?: string;
  "account-holder-name"?: string;
  "account-number"?: string;
  iban?: string;
  "swift-code"?: string;
  "bank-branch"?: string;
  "account-type"?: string;
  "bank-statement"?: File;
  "confirm-details"?: boolean;
  "terms-accepted"?: boolean;
}

// Optional: Add validation schemas using Zod or Yup
import { z } from "zod";

export const pudoFormSchema = z.object({
  // Establishment Info
  "establishment-name": z.string().min(1, "Establishment name is required"),
  "establishment-type": z.string().min(1, "Establishment type is required"),
  "registration-number": z.string().min(1, "Registration number is required"),
  "tax-number": z.string().min(1, "Tax number is required"),
  "establishment-email": z.string().email("Invalid email address"),
  "establishment-phone": z.string().min(1, "Phone number is required"),
  "establishment-website": z.string().url().optional().or(z.literal("")),
  "establishment-description": z.string().optional(),

  // PUDO Info
  "branch-name": z.string().min(1, "Branch name is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  zone: z.string().min(1, "Zone is required"),
  "branch-coordinates": z.string().optional(),
  "short-address": z.string().min(1, "Address is required"),
  "branch-photos": z.array(z.instanceof(File)).optional(),
  "municipal-license": z.instanceof(File).optional(),

  // Responsible Person
  "full-name": z.string().min(1, "Full name is required"),
  "phone-number": z.string().min(1, "Phone number is required"),
  "identity-document": z.instanceof(File).optional(),

  // Operating Hours
  "same-hours-everyday": z.boolean().optional(),
  "24-7": z.boolean().optional(),
  "operating-hours": z
    .record(
      z.object({
        enabled: z.boolean(),
        to: z.string(),
        from: z.string(),
        breakHour: z.string().optional(),
      })
    )
    .optional(),

  // Bank Account
  "bank-name": z.string().min(1, "Bank name is required"),
  "account-holder-name": z.string().min(1, "Account holder name is required"),
  "account-number": z.string().min(1, "Account number is required"),
  iban: z.string().optional(),
  "swift-code": z.string().optional(),
  "bank-branch": z.string().min(1, "Bank branch is required"),
  "account-type": z.string().min(1, "Account type is required"),
  "bank-statement": z.instanceof(File).optional(),
  "confirm-details": z.boolean().refine((val) => val === true, {
    message: "You must confirm the details are correct",
  }),
  "terms-accepted": z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type PUDOFormSchema = z.infer<typeof pudoFormSchema>;
