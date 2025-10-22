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
import { Checkbox } from "@/components/ui/checkbox";
import { FileInput } from "@/components/ui/file-input";
import { StepNavigation } from "@/forms/StepNavigation";
import { StepComponentProps } from "@/lib/hooks/useMutliStepForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PartnerFormData } from "@/lib/schema/partner.schema";

export const BankAccountStep: React.FC<StepComponentProps<PartnerFormData>> = ({
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
        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supporting Documents</CardTitle>
            <CardDescription>
              Upload bank statement for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="bankStatement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Statement</FormLabel>
                  <FormControl>
                    <FileInput
                      value={field.value}
                      onChange={field.onChange}
                      accept="application/pdf,image/*"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a recent bank statement (PDF or image, max 5MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank Information</CardTitle>
            <CardDescription>
              Enter your bank account details for payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nbe">
                          National Bank of Egypt (NBE)
                        </SelectItem>
                        <SelectItem value="cib">
                          Commercial International Bank (CIB)
                        </SelectItem>
                        <SelectItem value="qnb">QNB ALAHLI</SelectItem>
                        <SelectItem value="hsbc">HSBC Egypt</SelectItem>
                        <SelectItem value="aib">
                          Arab International Bank
                        </SelectItem>
                        <SelectItem value="saib">
                          Société Arabe Internationale de Banque
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl className="w-full">
                      <Input
                        {...field}
                        placeholder="Enter account holder name"
                        autoComplete="name"
                      />
                    </FormControl>
                    <FormDescription>
                      Name as it appears on bank statements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter account number"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="EG00 0000 0000 0000 0000 0000 000"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      International Bank Account Number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Confirmation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confirmation</CardTitle>
            <CardDescription>
              Please confirm the details before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="confirmDetails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I confirm that all bank account details are correct
                    </FormLabel>
                    <FormDescription>
                      Please double-check all information before proceeding
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I accept the terms and conditions for payment processing
                    </FormLabel>
                    <FormDescription>
                      By checking this box, you agree to our payment terms and
                      conditions
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <StepNavigation
          onBack={onBack}
          onNext={onNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          submitLabel="Complete Registration"
        />
      </form>
    </Form>
  );
};
