import React, { useState } from "react";
import { useWatch } from "react-hook-form";
import { MapPin, Plus } from "lucide-react";
import dynamic from "next/dynamic";

const CoordinatePickerDialog = dynamic(
  () =>
    import("@/components/CoordinatePickerDialog").then(
      (mod) => mod.CoordinatePickerDialog
    ),
  { ssr: false }
);

import {
  Form,
  FormControl,
  FormDescription,
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
import { FileInput } from "@/components/ui/file-input";
import { StepNavigation } from "@/forms/StepNavigation";
import { StepComponentProps } from "@/lib/hooks/useMutliStepForm";
import { Button } from "@/components/ui/button";
import { BranchFormData } from "@/lib/schema/branch.schema";
import { useGetCities } from "@/lib/hooks/useCity";
import { CityDetails } from "@/lib/schema/city.schema";
import { DistrictDetails } from "@/lib/schema/district.schema";
import { useGetZones } from "@/lib/hooks/useZone";
import { useGetDistricts } from "@/lib/hooks/useDistrict";
import { useGetPartners } from "@/lib/hooks/usePartner";
import CreateUserSheet from "@/components/CreateUserSheet";
import { UserDetails } from "@/lib/schema/user.schema";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { PartnerDetails } from "@/lib/schema/partner.schema";
import { ZoneDetails } from "@/lib/schema/zones.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const BranchInfoStep: React.FC<StepComponentProps<BranchFormData>> = ({
  form,
  onNext,
  onBack,
  onSubmit,
  isFirstStep,
  isLastStep,
}) => {
  const { data: users } = useGetUsers({ role_id: 3 });
  const [showUserSheet, setShowUserSheet] = useState(false);
  const [showCoordinatePicker, setShowCoordinatePicker] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>({ lat: 24.7136, lng: 46.6753 });

  const { control } = form;
  const selectedCity = useWatch({
    control,
    name: "city",
  });
  const selectedZone = useWatch({
    control,
    name: "zone",
  });

  const { t } = useTranslation();

  const { data: partners } = useGetPartners();
  const { data: cities } = useGetCities();
  const { data: zones } = useGetZones({ cityId: Number(selectedCity) });
  const { data: district } = useGetDistricts(Number(selectedZone));

  const handleCoordinatesSelect = (lat: number, lng: number) => {
    const coordinateString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setCoordinates({ lat, lng });
    form.setValue("coordinates", coordinateString, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setShowCoordinatePicker(false); // Close the dialog after selection
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          <FormField
            control={control}
            name="branchPhoto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forms.fields.branchPhotos")}</FormLabel>
                <FormControl>
                  <FileInput
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/*"
                    // multiple
                    // placeholder="Upload branch photos"
                  />
                </FormControl>
                <FormDescription>
                  {t("forms.descriptions.uploadPhoto")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="municipalLicense"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forms.fields.municipalLicense")}</FormLabel>
                <FormControl>
                  <FileInput
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/*,application/pdf"
                  />
                </FormControl>
                <FormDescription>
                  {t("forms.descriptions.municipalLicenseDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="branchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forms.fields.branchName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("forms.placeholders.enterBranchName")}
                    autoComplete="organization"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.city")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    value={field.value ? String(field.value) : undefined}
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
              name="zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.zone")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    value={field.value ? String(field.value) : undefined}
                    disabled={!selectedCity}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("forms.placeholders.selectZone")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zones?.zones.map((zone: ZoneDetails) => (
                        <SelectItem
                          key={zone.id}
                          value={zone.id.toLocaleString()}
                        >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.district")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    defaultValue={field.value}
                    disabled={!selectedZone}
                  >
                    <div className="flex gap-2">
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("forms.placeholders.selectDistrict")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {district?.districts.map(
                          (district: DistrictDetails) => (
                            <SelectItem
                              key={district.id}
                              value={String(district.id)}
                            >
                              {district.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </div>
                  </Select>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.branchCoordinates")}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input
                        {...field}
                        placeholder={t("forms.placeholders.selectFromGPS")}
                        disabled={coordinates !== null}
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
                  <FormDescription>
                    {t("forms.descriptions.coordinatesDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forms.fields.address")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("forms.placeholders.enterAddress")}
                    autoComplete="organization"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="partner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.partner")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("forms.placeholders.selectPartner")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {partners?.partners.map((partner: PartnerDetails) => (
                        <SelectItem key={partner.id} value={String(partner.id)}>
                          {partner.name}
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
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.responsible")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <div className="flex gap-2">
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "forms.placeholders.selectResponsible"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.users.map((user: UserDetails) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowUserSheet(true)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <StepNavigation
            onBack={onBack}
            onNext={onNext}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          />
        </form>
      </Form>
      <CreateUserSheet
        open={showUserSheet}
        onOpenChange={setShowUserSheet}
        userRole={3}
      />
      <CoordinatePickerDialog
        open={showCoordinatePicker}
        onOpenChange={setShowCoordinatePicker}
        onCoordinatesSelect={handleCoordinatesSelect}
        initialCoordinates={coordinates || undefined}
      />
    </>
  );
};
