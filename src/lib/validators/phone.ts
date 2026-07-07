import { z } from "zod";

export const SAUDI_COUNTRY_CODE = "+966";

// Saudi mobile numbers: 9 digits, starting with 5 (e.g. 5XXXXXXXX)
export const SAUDI_PHONE_LOCAL_REGEX = /^5\d{8}$/;

export const SAUDI_PHONE_INVALID_MESSAGE =
  "Please enter a valid Saudi mobile number (e.g. 5XXXXXXXX)";

/** Strips spaces/dashes and an optional leading 0, +966 or 00966 prefix. */
export function normalizeSaudiPhone(value: string): string {
  return value
    .replace(/[\s\-()]/g, "")
    .replace(/^(\+966|00966)/, "")
    .replace(/^0/, "");
}

export function isValidSaudiPhone(value: string): boolean {
  return SAUDI_PHONE_LOCAL_REGEX.test(normalizeSaudiPhone(value));
}

/** Formats a local Saudi number (without country code) as E.164, e.g. "512345678" -> "+966512345678". */
export function toE164SaudiPhone(localNumber: string): string {
  return `${SAUDI_COUNTRY_CODE}${normalizeSaudiPhone(localNumber)}`;
}

// Validates the local part of a Saudi phone number (without the +966 prefix),
// normalizing away any accidental leading 0/+966 the user may have typed.
export const saudiPhoneSchema = z
  .string()
  .transform((value) => normalizeSaudiPhone(value))
  .pipe(z.string().regex(SAUDI_PHONE_LOCAL_REGEX, SAUDI_PHONE_INVALID_MESSAGE));
