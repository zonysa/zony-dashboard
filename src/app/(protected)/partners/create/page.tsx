"use client";

import { MultiStepForm } from "@/forms/MultiStepForm";
import { BankAccountStep } from "@/forms/partners/BankAccountStep";
import { PartnerStep } from "@/forms/partners/PartnerInfoStep";
import { StepConfig, useMultiStepForm } from "@/lib/hooks/useMutliStepForm";
import { useCreatePartner } from "@/lib/hooks/usePartner";
import { PartnerFormData } from "@/lib/schema/partner.schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const partnerMutation = useCreatePartner();
  const router = useRouter();

  const formSteps: StepConfig<PartnerFormData>[] = [
    {
      id: "partner",
      title: "Partner",
      description: "Step description",
      component: PartnerStep,
      validation: async (data: PartnerFormData) => {
        // Simple validation - just check if key fields have values
        if (!data.type) {
          console.log("Business type is required");
          return false;
        }

        if (!data["unifiedNumber"]) {
          console.log("Unified number is required");
          return false;
        }

        if (!data.currency) {
          console.log("Currency is required");
          return false;
        }

        // All validations passed
        return true;
      },
    },
    {
      id: "bankAccount",
      title: "Bank Account",
      description: "Bank Account",
      component: BankAccountStep,
    },
  ];

  const multiStep = useMultiStepForm<PartnerFormData>({
    steps: formSteps,
    defaultValues: {
      partnerName: `Test`,
      currency: "SAR",
      payoutPerParcel: 1,
      type: "super market",
      accountNumber: "123123123123213123",
      accountHolderName: "Ahmed Fathy",
      iban: "123123123123123123",
      bankName: "Ahly",
      unifiedNumber: "123123123",
    },
    onComplete: async (data: PartnerFormData) => {
      const partnerData = {
        // partner info
        name: data.partnerName,
        type: data.type,
        status: "Active",
        commercial_registration: "asdfas",
        payout_per_parcel: Number(data.payoutPerParcel),
        unified_number: data.unifiedNumber,
        currency: data.currency,

        // bank
        bank_name: data.bankName,
        bank_holder_name: data.accountHolderName,
        bank_account_number: data.accountNumber,
        IBAN: data.iban,

        // representative
        representative_id: String(data.representative),
      };
    },
    persistState: false,
  });

  return (
    <div className="w-full flex flex-col justify-center items-center gap-6 py-6">
      <MultiStepForm
        steps={multiStep.steps}
        currentStep={multiStep.currentStep}
        currentStepConfig={multiStep.currentStepConfig}
        form={multiStep.form}
        onNext={multiStep.nextStep}
        onBack={multiStep.prevStep}
        onSubmit={multiStep.submitForm}
        isFirstStep={multiStep.isFirstStep}
        isLastStep={multiStep.isLastStep}
      />
    </div>
  );
}
