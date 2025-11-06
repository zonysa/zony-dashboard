import React, { useState } from "react";
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
import { PartnerFormData } from "@/lib/schema/partner.schema";
import CreateUserSheet from "@/components/CreateUserSheet";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUsers } from "@/lib/hooks/useAuth";
import { UserDetails } from "@/lib/schema/user.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const PartnerStep: React.FC<StepComponentProps<PartnerFormData>> = ({
  form,
  onBack,
  onSubmit,
  isFirstStep,
  isLastStep,
}) => {
  const { data: users } = useGetUsers({ role_id: 2 });
  const [showUserSheet, setShowUserSheet] = useState(false);
  const { control } = form;
  const { t } = useTranslation();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    onSubmit(e);
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <FormField
            control={control}
            name="commercialRegistration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("forms.fields.commercialRegistration")}
                </FormLabel>
                <FormControl>
                  <FileInput
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/*, application/pdf"
                  />
                </FormControl>
                <FormDescription>
                  {t("forms.descriptions.commercialRegistrationDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="partnerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.partnerName")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("forms.placeholders.enterPartnerName")}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    {t("forms.descriptions.businessName")}
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
                  <FormLabel>{t("forms.fields.unifiedNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter unified business number"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    {t("forms.descriptions.unifiedNumber")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Type and Unified Number Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.businessType")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "forms.placeholders.selectBusinessType"
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      <SelectItem value="llc">
                        {t("partners.businessTypes.llc")}
                      </SelectItem>
                      <SelectItem value="corporation">
                        {t("partners.businessTypes.corporation")}
                      </SelectItem>
                      <SelectItem value="partnership">
                        {t("partners.businessTypes.partnership")}
                      </SelectItem>
                      <SelectItem value="sole-proprietorship">
                        {t("partners.businessTypes.sole-proprietorship")}
                      </SelectItem>
                      <SelectItem value="nonprofit">
                        {t("partners.businessTypes.nonprofit")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("forms.descriptions.businessType")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="representative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.representative")}</FormLabel>
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
                              "forms.placeholders.selectRepresentative"
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
                    <FormDescription>
                      {t("forms.descriptions.representative")}
                    </FormDescription>
                  </Select>
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
                  <FormLabel>{t("forms.fields.payoutPerParcel")}</FormLabel>
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
                    {t("forms.descriptions.payoutPerParcel")}
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
                  <FormLabel>{t("forms.fields.currency")}</FormLabel>
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
                      <SelectItem value="USD">
                        {t("partners.currencies.USD")}
                      </SelectItem>
                      <SelectItem value="EUR">
                        {t("partners.currencies.EUR")}
                      </SelectItem>
                      <SelectItem value="EGP">
                        {t("partners.currencies.EGP")}
                      </SelectItem>
                      <SelectItem value="SAR">
                        {t("partners.currencies.SAR")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("forms.descriptions.currency")}
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
      <CreateUserSheet
        open={showUserSheet}
        onOpenChange={setShowUserSheet}
        userRole={2}
      />
    </>
  );
};
