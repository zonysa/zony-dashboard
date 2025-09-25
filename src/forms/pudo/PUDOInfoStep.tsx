import React from "react";
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
import { StepComponentProps } from "@/hooks/useMutliStepForm";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

// PUDO Info Step Component
interface PUDOInfoFormData {
  "branch-name"?: string;
  city?: string;
  district?: string;
  zone?: string;
  "branch-coordinates"?: string;
  "short-address"?: string;
  "branch-photos"?: File[];
  "municipal-license"?: File;
}

export const PUDOInfoStep: React.FC<StepComponentProps<PUDOInfoFormData>> = ({
  form,
  onNext,
  onBack,
  onSubmit,
  isFirstStep,
  isLastStep,
}) => {
  const { control } = form;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <FormField
          control={control}
          name="branch-photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch Photos</FormLabel>
              <FormControl>
                <FileInput
                  value={field.value}
                  onChange={field.onChange}
                  accept="image/*"
                  multiple
                  placeholder="Upload branch photos"
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
          name="municipal-license"
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
          name="branch-name"
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cairo">Cairo</SelectItem>
                    <SelectItem value="alexandria">Alexandria</SelectItem>
                    <SelectItem value="giza">Giza</SelectItem>
                    <SelectItem value="rayot">Rayot</SelectItem>
                    <SelectItem value="aswan">Aswan</SelectItem>
                    <SelectItem value="luxor">Luxor</SelectItem>
                    <SelectItem value="port-said">Port Said</SelectItem>
                    <SelectItem value="suez">Suez</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="district1">District 1</SelectItem>
                    <SelectItem value="district2">District 2</SelectItem>
                    <SelectItem value="district3">District 3</SelectItem>
                    <SelectItem value="district4">District 4</SelectItem>
                    <SelectItem value="district5">District 5</SelectItem>
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
            name="zone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="zone1">Zone 1</SelectItem>
                    <SelectItem value="zone2">Zone 2</SelectItem>
                    <SelectItem value="zone3">Zone 3</SelectItem>
                    <SelectItem value="zone4">Zone 4</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="branch-coordinates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Coordinates</FormLabel>
                <div className="flex gap-2">
                  <FormControl className="flex-1">
                    <Input {...field} placeholder="Select From GPS" readOnly />
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
          name="short-address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter address"
                  autoComplete="street-address"
                />
              </FormControl>
              <FormDescription>
                Brief address description for easy identification
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <StepNavigation
          onBack={onBack}
          onNext={onNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </form>
    </Form>
  );
};
