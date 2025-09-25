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

import { FileInput } from "@/components/ui/file-input";
import { StepNavigation } from "@/forms/StepNavigation";
import { StepComponentProps } from "@/hooks/useMutliStepForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResponsiblePersonFormData {
  "full-name"?: string;
  "phone-number"?: string;
  "identity-document"?: File;
}

export const ResponsiblePersonStep: React.FC<
  StepComponentProps<ResponsiblePersonFormData>
> = ({ form, onNext, onBack, onSubmit, isFirstStep, isLastStep }) => {
  const { control } = form;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="full-name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter Full Name"
                    autoComplete="name"
                  />
                </FormControl>
                <FormDescription>
                  Legal name of the responsible person
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone-number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="Enter Phone Number"
                    autoComplete="tel"
                  />
                </FormControl>
                <FormDescription>
                  Contact number for urgent communications
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        <FormField
          control={control}
          name="identity-document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identity (Optional)</FormLabel>
              <FormControl>
                <FileInput
                  value={field.value}
                  onChange={field.onChange}
                  accept="image/*,application/pdf"
                />
              </FormControl>
              <FormDescription>
                Upload a copy of ID card or passport (optional)
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
