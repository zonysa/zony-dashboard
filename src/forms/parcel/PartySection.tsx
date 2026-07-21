"use client";

import React, { useEffect, useState } from "react";
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
import {
  useGeocodeCoordinates,
  useResolveShortAddress,
} from "@/lib/hooks/useNationalAddress";
import { CityDetails } from "@/lib/schema/city.schema";
import { ZoneDetails } from "@/lib/schema/zones.schema";
import { ResolvedNationalAddress } from "@/lib/schema/nationalAddress.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { CreateParcelFormData } from "@/lib/schema/parcel.schema";
import { parseLocationInput } from "@/lib/validators/location";

interface PartySectionProps {
  form: UseFormReturn<CreateParcelFormData>;
  prefix: "sender" | "receiver";
}

export const PartySection: React.FC<PartySectionProps> = ({
  form,
  prefix,
}) => {
  const { t } = useTranslation();
  const {
    control,
    setValue,
    formState: { errors },
  } = form;

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [showCoordinatePicker, setShowCoordinatePicker] = useState(false);
  const [coordinatesInput, setCoordinatesInput] = useState("");
  const [coordinatesError, setCoordinatesError] = useState(false);
  const [nationalAddressError, setNationalAddressError] = useState<
    string | null
  >(null);

  const { data: cities } = useGetCities();
  const { data: zones } = useGetZones({ cityId: selectedCityId ?? undefined });
  const resolveShortAddress = useResolveShortAddress();
  const geocodeCoordinates = useGeocodeCoordinates();

  const latitude = useWatch({ control, name: `${prefix}.location.latitude` });
  const longitude = useWatch({
    control,
    name: `${prefix}.location.longitude`,
  });
  const shortAddress = useWatch({
    control,
    name: `${prefix}.location.short_address`,
  });

  // Keep the text field in sync with values set via the map picker.
  useEffect(() => {
    setCoordinatesInput(
      latitude != null && longitude != null
        ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
        : "",
    );
    setCoordinatesError(false);
  }, [latitude, longitude]);

  // Fills in whatever the National Address API resolved — never clobbers
  // fields the resolution didn't return (e.g. it keeps zone untouched,
  // since gov "district" doesn't map to our operational zones).
  const applyResolvedAddress = (resolved: ResolvedNationalAddress) => {
    if (resolved.short_address) {
      setValue(`${prefix}.location.short_address`, resolved.short_address, {
        shouldValidate: true,
      });
    }
    if (resolved.address) {
      setValue(`${prefix}.location.address`, resolved.address, {
        shouldValidate: true,
      });
    }
    if (resolved.city) {
      const matchedCity = cities?.cities.find(
        (c: CityDetails) =>
          c.name.trim().toLowerCase() === resolved.city!.trim().toLowerCase(),
      );
      setValue(`${prefix}.location.city`, matchedCity?.name ?? resolved.city, {
        shouldValidate: true,
      });
      if (matchedCity?.id != null) setSelectedCityId(matchedCity.id);
    }
    if (resolved.district) {
      setValue(`${prefix}.location.district`, resolved.district);
    }
    if (resolved.postal_code) {
      setValue(`${prefix}.location.postal_code`, resolved.postal_code);
    }
    if (resolved.building_number) {
      setValue(`${prefix}.location.building_number`, resolved.building_number);
    }
    if (resolved.additional_number) {
      setValue(
        `${prefix}.location.additional_number`,
        resolved.additional_number,
      );
    }
    if (resolved.latitude != null && resolved.longitude != null) {
      setValue(`${prefix}.location.latitude`, resolved.latitude, {
        shouldValidate: true,
      });
      setValue(`${prefix}.location.longitude`, resolved.longitude, {
        shouldValidate: true,
      });
    }
  };

  const handleShortAddressBlur = () => {
    const value = shortAddress?.trim().toUpperCase();
    if (!value || value.length !== 8) {
      setNationalAddressError(null);
      return;
    }

    resolveShortAddress.mutate(
      { shortAddress: value },
      {
        onSuccess: (res) => {
          setNationalAddressError(null);
          applyResolvedAddress(res.address);
        },
        onError: () => {
          setNationalAddressError(t("forms.errors.nationalAddressNotFound"));
        },
      },
    );
  };

  const handleCoordinatesSelect = (lat: number, lng: number) => {
    setValue(`${prefix}.location.latitude`, lat, { shouldValidate: true });
    setValue(`${prefix}.location.longitude`, lng, { shouldValidate: true });
    setShowCoordinatePicker(false);

    // Map-pin fallback: reverse-geocode the picked point into a National
    // Address. If it can't be resolved, the raw coordinates set above still
    // stand — same graceful fallback as before this feature existed.
    geocodeCoordinates.mutate(
      { lat, long: lng },
      {
        onSuccess: (res) => {
          setNationalAddressError(null);
          applyResolvedAddress(res.address);
        },
      },
    );
  };

  const handleCoordinatesInputBlur = () => {
    if (!coordinatesInput.trim()) {
      setCoordinatesError(false);
      return;
    }

    const parsed = parseLocationInput(coordinatesInput);
    if (!parsed) {
      setCoordinatesError(true);
      return;
    }

    setCoordinatesError(false);
    setValue(`${prefix}.location.latitude`, parsed.lat, { shouldValidate: true });
    setValue(`${prefix}.location.longitude`, parsed.lng, { shouldValidate: true });
  };

  const coordinatesRequiredError =
    !coordinatesError &&
    (errors[prefix]?.location?.latitude || errors[prefix]?.location?.longitude);

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={`${prefix}.location.short_address`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("forms.fields.nationalAddress")} {t("forms.fields.optional")}
            </FormLabel>
            <p className="text-sm text-muted-foreground">
              {t("forms.descriptions.nationalAddressDescription")}
            </p>
            <div className="flex gap-2">
              <FormControl className="flex-1">
                <Input
                  {...field}
                  maxLength={8}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  onBlur={() => {
                    field.onBlur();
                    handleShortAddressBlur();
                  }}
                  placeholder={t("forms.placeholders.enterNationalAddressCode")}
                  aria-invalid={!!nationalAddressError}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                disabled={resolveShortAddress.isPending}
                onClick={handleShortAddressBlur}
              >
                {resolveShortAddress.isPending
                  ? t("forms.actions.verifying")
                  : t("forms.actions.verify")}
              </Button>
            </div>
            {nationalAddressError ? (
              <p className="text-sm text-destructive">
                {nationalAddressError}
              </p>
            ) : (
              <FormMessage />
            )}
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${prefix}.location.address`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("forms.fields.address")} {t("forms.fields.optional")}
            </FormLabel>
            <p className="text-sm text-muted-foreground">
              {t("forms.descriptions.addressDescription")}
            </p>
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
              <FormLabel>
                {t("forms.fields.city")} <span className="text-destructive">*</span>
              </FormLabel>
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
              <FormLabel>
                {t("forms.fields.zone")} <span className="text-destructive">*</span>
              </FormLabel>
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
        <FormLabel>
          {t("forms.fields.coordinates")} <span className="text-destructive">*</span>
        </FormLabel>
        <p className="text-sm text-muted-foreground">
          {t("forms.descriptions.coordinatesInputDescription")}
        </p>
        <div className="flex gap-2">
          <FormControl className="flex-1">
            <Input
              value={coordinatesInput}
              onChange={(e) => setCoordinatesInput(e.target.value)}
              onBlur={handleCoordinatesInputBlur}
              placeholder={t("forms.placeholders.enterCoordinatesOrLink")}
              aria-invalid={coordinatesError || !!coordinatesRequiredError}
            />
          </FormControl>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCoordinatePicker(true)}
          >
            <MapPin className="h-4 w-4" />
            {t("forms.actions.pickFromMap")}
          </Button>
        </div>
        {coordinatesError && (
          <p className="text-sm text-destructive">
            {t("forms.errors.invalidCoordinates")}
          </p>
        )}
        {coordinatesRequiredError && (
          <p className="text-sm text-destructive">
            {t("forms.errors.coordinatesRequired")}
          </p>
        )}
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
