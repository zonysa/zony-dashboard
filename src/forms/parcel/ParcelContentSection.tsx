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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { CreateParcelFormData } from "@/lib/schema/parcel.schema";

interface ParcelContentSectionProps {
  form: UseFormReturn<CreateParcelFormData>;
}

const SIZE_OPTIONS = ["small", "medium", "large", "extra_large"] as const;

export const ParcelContentSection: React.FC<ParcelContentSectionProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const { control } = form;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="content.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.fields.description")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("forms.placeholders.enterDescription")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="content.size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.size")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("forms.placeholders.selectSize")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size}>
                      {t(`forms.options.parcelSize.${size}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="content.quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.quantity")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  placeholder={t("forms.placeholders.enterQuantity")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="content.weight"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.weight")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value ?? ""}
                  {...field}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber;
                    onChange(Number.isNaN(v) ? undefined : v);
                  }}
                  placeholder={t("forms.placeholders.enterWeight")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormField
          control={control}
          name="content.dimensions.length"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.length")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value ?? ""}
                  {...field}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber;
                    onChange(Number.isNaN(v) ? undefined : v);
                  }}
                  placeholder={t("forms.placeholders.enterLength")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="content.dimensions.width"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.width")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value ?? ""}
                  {...field}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber;
                    onChange(Number.isNaN(v) ? undefined : v);
                  }}
                  placeholder={t("forms.placeholders.enterWidth")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="content.dimensions.height"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.height")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={value ?? ""}
                  {...field}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber;
                    onChange(Number.isNaN(v) ? undefined : v);
                  }}
                  placeholder={t("forms.placeholders.enterHeight")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="content.dimensions.unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.unit")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? "cm"}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cm">{t("forms.options.unit.cm")}</SelectItem>
                  <SelectItem value="in">{t("forms.options.unit.in")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
