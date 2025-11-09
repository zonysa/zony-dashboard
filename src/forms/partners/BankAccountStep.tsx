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
import { CardContent } from "@/components/ui/card";
import { PartnerFormData } from "@/lib/schema/partner.schema";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const BankAccountStep: React.FC<StepComponentProps<PartnerFormData>> = ({
  form,
  onNext,
  onBack,
  onSubmit,
  isFirstStep,
  isLastStep,
}) => {
  const { control } = form;
  const { t } = useTranslation();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Bank Information */}
        <CardContent className="space-y-8 px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.bankName")}</FormLabel>
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
                        {t("partners.banks.nbe")}
                      </SelectItem>
                      <SelectItem value="cib">
                        {t("partners.banks.cib")}
                      </SelectItem>
                      <SelectItem value="qnb">
                        {t("partners.banks.qnb")}
                      </SelectItem>
                      <SelectItem value="hsbc">
                        {t("partners.banks.hsbc")}
                      </SelectItem>
                      <SelectItem value="aib">
                        {t("partners.banks.aib")}
                      </SelectItem>
                      <SelectItem value="saib">
                        {t("partners.banks.saib")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("partners.banks.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("forms.descriptions.bankName")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="accountHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.accountHolderName")}</FormLabel>
                  <FormControl className="w-full">
                    <Input
                      {...field}
                      placeholder="Enter account holder name"
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormDescription>
                    {t("forms.descriptions.accountHolder")}
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
                  <FormLabel>{t("forms.fields.accountNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter account number"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    {t("forms.descriptions.accountNumber")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="iban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.iban")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="EG00 0000 0000 0000 0000 0000 000"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    {t("forms.descriptions.iban")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>

        <Separator className="my-12" />

        {/* Confirmation */}
        <CardContent className="space-y-4 px-0">
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
                  <FormLabel>{t("forms.doubleCheck.label")}</FormLabel>
                  <FormDescription>
                    {t("forms.doubleCheck.desc")}
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
                  <FormLabel>{t("forms.acceptTerms.label")}</FormLabel>
                  <FormDescription>
                    {t("forms.acceptTerms.desc")}
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>

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
