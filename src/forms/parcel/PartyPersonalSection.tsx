"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { CreateParcelFormData } from "@/lib/schema/parcel.schema";

interface PartyPersonalSectionProps {
  form: UseFormReturn<CreateParcelFormData>;
  prefix: "sender" | "receiver";
}

export const PartyPersonalSection: React.FC<PartyPersonalSectionProps> = ({
  form,
  prefix,
}) => {
  const { t } = useTranslation();
  const { control } = form;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={`${prefix}.personal.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.fields.name")}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t("forms.placeholders.enterName")} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.personal.phone_number`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.fields.phoneNumber")}</FormLabel>
            <FormControl>
              <PhoneInput {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${prefix}.personal.email`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("forms.fields.email")} {t("forms.fields.optional")}
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder={t("forms.placeholders.enterEmail")} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
