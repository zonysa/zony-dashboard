"use client";
import { MultiStepForm } from "@/forms/MultiStepForm";
import { BankAccountStep } from "@/forms/partners/BankAccountStep";
import { PartnerStep } from "@/forms/partners/PartnerStep";
import { ResponsableStep } from "@/forms/partners/ResponsableStep";
import { useMultiStepForm } from "@/hooks/useMutliStepForm";
import { PartnerFormData } from "@/lib/schema/partner-form.schema";

export default function Page() {
  const formSteps = [
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

        if (!data["unified-number"]) {
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
      id: "responsable",
      title: "Responsable",
      description: "Step description",
      component: ResponsableStep,
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
      currency: "SAR",
    },
    onComplete: async (data) => {
      console.log("Form Completed", data);
    },
    persistState: false,
    storageKey: "my-form",
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
