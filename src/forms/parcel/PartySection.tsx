"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { UseFormReturn, useWatch } from "react-hook-form";

const CoordinatePickerDialog = dynamic(
  () =>
    import("@/components/CoordinatePickerDialog").then(
      (mod) => mod.CoordinatePickerDialog,
    ),
  { ssr: false },
);

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetCities } from "@/lib/hooks/useCity";
import { useGetZones } from "@/lib/hooks/useZone";
import { CityDetails } from "@/lib/schema/city.schema";
import { ZoneDetails } from "@/lib/schema/zones.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { CreateParcelFormData } from "@/lib/schema/parcel.schema";

interface PartySectionProps {
  form: UseFormReturn<CreateParcelFormData>;
  prefix: "sender" | "receiver";
  showPersonal?: boolean;
}

export const PartySection: React.FC<PartySectionProps> = ({
  form,
  prefix,
  showPersonal = true,
}) => {
  const { t } = useTranslation();
  const { control, setValue } = form;

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [showCoordinatePicker, setShowCoordinatePicker] = useState(false);

  const { data: cities } = useGetCities();
  const { data: zones } = useGetZones({ cityId: selectedCityId ?? undefined });

  const latitude = useWatch({ control, name: `${prefix}.location.latitude` });
  const longitude = useWatch({
    control,
    name: `${prefix}.location.longitude`,
  });

  const handleCoordinatesSelect = (lat: number, lng: number) => {
    setValue(`${prefix}.location.latitude`, lat, { shouldValidate: true });
    setValue(`${prefix}.location.longitude`, lng, { shouldValidate: true });
    setShowCoordinatePicker(false);
  };

  const coordinatesDisplay =
    latitude != null && longitude != null
      ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
      : "";

  return (
    <div className="space-y-4">
      {showPersonal && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${prefix}.personal.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.name")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("forms.placeholders.enterName")}
                    />
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
          </div>

          <FormField
            control={control}
            name={`${prefix}.personal.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("forms.fields.email")} {t("forms.fields.optional")}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("forms.placeholders.enterEmail")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={control}
        name={`${prefix}.location.address`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("forms.fields.address")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("forms.placeholders.enterAddress")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${prefix}.location.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.city")}</FormLabel>
              <Select
                onValueChange={(value) => {
                  const city = cities?.cities.find(
                    (c: CityDetails) => String(c.id) === value,
                  );
                  setSelectedCityId(Number(value));
                  field.onChange(city?.name ?? value);
                  setValue(`${prefix}.location.zone`, "");
                }}
                value={
                  cities?.cities.find(
                    (c: CityDetails) => c.name === field.value,
                  )?.id !== undefined
                    ? String(
                        cities?.cities.find(
                          (c: CityDetails) => c.name === field.value,
                        )?.id,
                      )
                    : undefined
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t("forms.placeholders.selectCity")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities?.cities.map((city: CityDetails) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
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
          name={`${prefix}.location.zone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forms.fields.zone")}</FormLabel>
              <Select
                onValueChange={(value) => {
                  const zone = zones?.zones?.find(
                    (z: ZoneDetails) => String(z.id) === value,
                  );
                  field.onChange(zone?.name ?? value);
                }}
                value={
                  zones?.zones?.find((z: ZoneDetails) => z.name === field.value)
                    ?.id !== undefined
                    ? String(
                        zones?.zones?.find(
                          (z: ZoneDetails) => z.name === field.value,
                        )?.id,
                      )
                    : undefined
                }
                disabled={!selectedCityId}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t("forms.placeholders.selectZone")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {zones?.zones?.map((zone: ZoneDetails) => (
                    <SelectItem key={zone.id} value={String(zone.id)}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormItem>
        <FormLabel>{t("forms.fields.coordinates")}</FormLabel>
        <div className="flex gap-2">
          <FormControl className="flex-1">
            <Input
              value={coordinatesDisplay}
              placeholder={t("forms.placeholders.selectFromGPS")}
              readOnly
            />
          </FormControl>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowCoordinatePicker(true)}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </FormItem>

      <CoordinatePickerDialog
        open={showCoordinatePicker}
        onOpenChange={setShowCoordinatePicker}
        onCoordinatesSelect={handleCoordinatesSelect}
        showPudos
        initialCoordinates={
          latitude != null && longitude != null
            ? { lat: Number(latitude), lng: Number(longitude) }
            : undefined
        }
      />
    </div>
  );
};
