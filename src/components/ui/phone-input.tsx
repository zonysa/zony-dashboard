"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { SAUDI_COUNTRY_CODE } from "@/lib/validators/phone";

export interface PhoneInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: string;
  onChange?: (value: string) => void;
}

// Saudi mobile number input: fixed +966 prefix, restricts typing to the
// 9-digit local part (e.g. 5XXXXXXXX) used by saudiPhoneSchema.
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, disabled, ...props }, ref) => {
    return (
      <div
        className={cn(
          "border-input flex h-9 w-full items-stretch rounded-md border bg-transparent shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
      >
        <span className="border-input text-muted-foreground flex items-center border-e px-3 text-base select-none md:text-sm">
          {SAUDI_COUNTRY_CODE}
        </span>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="5XXXXXXXX"
          disabled={disabled}
          data-slot="input"
          value={value ?? ""}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
            onChange?.(digits);
          }}
          className={cn(
            "placeholder:text-muted-foreground w-full min-w-0 flex-1 rounded-e-md bg-transparent px-3 py-1 text-base outline-none disabled:cursor-not-allowed md:text-sm",
          )}
          {...props}
        />
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";
