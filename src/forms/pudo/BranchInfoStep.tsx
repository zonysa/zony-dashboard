import React, { useState } from "react";
import { useWatch } from "react-hook-form";
import { MapPin, Plus } from "lucide-react";

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

  const { control } = form;
  const selectedCity = useWatch({
    control,
    name: "city",
  });
  const selectedZone = useWatch({
    control,
    name: "zone",
  });

  const { data: partners } = useGetPartners();
  const { data: cities } = useGetCities();
  const { data: zones } = useGetZones({ cityId: Number(selectedCity) });
  const { data: district } = useGetDistricts(Number(selectedZone));

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          <FormField
            control={control}
            name="branchPhoto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Photos</FormLabel>
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
                  Upload photos of your branch location (max 5MB per image)
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
                <FormLabel>Municipal License</FormLabel>
                <FormControl>
                  <FileInput
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/*,application/pdf"
                  />
                </FormControl>
                <FormDescription>
                  Upload your municipal license (PDF or image format)
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
                <FormLabel>Branch Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter Business Name"
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
                  <FormLabel>City</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select city" />
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
                  <FormLabel>Zone</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    defaultValue={field.value}
                    disabled={!selectedCity}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Zone" />
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
                  <FormLabel>District</FormLabel>
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
                          <SelectValue placeholder="Select District" />
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Coordinates</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input
                        {...field}
                        placeholder="Select From GPS"
                        readOnly
                      />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Click the location icon to select coordinates
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
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter Short Address"
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
                  <FormLabel>Partner</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                    defaultValue={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Partner" />
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
                  <FormLabel>Responsible</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <div className="flex gap-2">
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Responsible" />
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
    </>
  );
};
