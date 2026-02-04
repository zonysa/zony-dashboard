"use client";

import { MultiStepForm } from "@/forms/MultiStepForm";
import { BankAccountStep } from "@/forms/partners/BankAccountStep";
import { PartnerStep } from "@/forms/partners/PartnerInfoStep";
import { StepConfig, useMultiStepForm } from "@/lib/hooks/useMutliStepForm";
import { useCreatePartner } from "@/lib/hooks/usePartner";
import {
  CreatePartnerRequest,
  PartnerFormData,
  bankSchema,
} from "@/lib/schema/partner.schema";
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
      validation: async (data: PartnerFormData) => {
        try {
          // Validate bank account fields using Zod schema
          bankSchema.parse({
            bankName: data.bankName,
            accountHolderName: data.accountHolderName,
            accountNumber: data.accountNumber,
            iban: data.iban,
          });
          return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // Show validation errors from Zod
          if (error.issues && error.issues.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error.issues.forEach((issue: any) => {
              toast.error(issue.message);
            });
          } else {
            toast.error("Validation failed");
          }
          return false;
        }
      },
    },
  ];

  const multiStep = useMultiStepForm<PartnerFormData>({
    steps: formSteps,
    defaultValues: {
      partnerName: ``,
      currency: "SAR",
      payoutPerParcel: undefined,
      type: "super market",
      accountNumber: "",
      accountHolderName: "",
      iban: "",
      bankName: "",
      unifiedNumber: "",
    },
    onComplete: async (data: PartnerFormData) => {
      try {
        // Validate all data before submission
        bankSchema.parse({
          bankName: data.bankName,
          accountHolderName: data.accountHolderName,
          accountNumber: data.accountNumber,
          iban: data.iban,
        });

        const partnerData: CreatePartnerRequest = {
          // partner info
          name: data.partnerName,
          type: data.type,
          status: "Active",
          commercial_registration: "",
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

        // console.log(partnerData);
        await partnerMutation.mutateAsync(partnerData, {
          onSuccess: () => {
            toast.success(
              `New Partner ${data.partnerName} Created Successfuly`,
            );
            router.push("/partners");
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Show validation errors from Zod
        if (error.issues && error.issues.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error.issues.forEach((issue: any) => {
            toast.error(issue.message);
          });
        } else {
          toast.error("Please check all required fields");
        }
        throw error; // Re-throw to prevent submission
      }
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
