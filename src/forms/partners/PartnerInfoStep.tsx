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
import { StepComponentProps } from "@/lib/hooks/useMutliStepForm";
import { PartnerInfoData } from "@/lib/schema/partner-form.schema";

export const PartnerStep: React.FC<StepComponentProps<PartnerInfoData>> = ({
  form,
  onBack,
  onSubmit,
  isFirstStep,
  isLastStep,
}) => {
  const { control } = form;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted!", e);
    onSubmit(e);
  };
  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Commercial Registration File Upload */}
        <FormField
          control={control}
          name="commercialRegistration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commercial Registration</FormLabel>
              <FormControl>
                <FileInput
                  value={field.value}
                  onChange={field.onChange}
                  accept="image/*, application/pdf"
                />
              </FormControl>
              <FormDescription>
                Upload your commercial registration document (PDF or image)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="partnerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partner Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter name for this partner"
                  autoComplete="off"
                />
              </FormControl>
              <FormDescription>Your business registration name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type and Unified Number Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    <SelectItem value="llc">
                      Limited Liability Company (LLC)
                    </SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole-proprietorship">
                      Sole Proprietorship
                    </SelectItem>
                    <SelectItem value="nonprofit">
                      Non-Profit Organization
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select your business entity type
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="unifiedNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unified Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter unified business number"
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>
                  Your business registration number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payout Information Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="payoutPerParcel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payout Per Parcel</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>
                  Amount paid per parcel delivered
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency Selection */}
          <FormField
            control={control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "SAR"}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="EGP">Egyptian Pound (EGP)</SelectItem>
                    <SelectItem value="SAR">Saudi Riyal (SAR)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select your preferred payout currency
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Navigation */}
        <StepNavigation
          onBack={onBack}
          onNext={onSubmit}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </form>
    </Form>
  );
};
