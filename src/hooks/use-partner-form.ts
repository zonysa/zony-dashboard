import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  partnerFormSchema,
  PartnerFormData,
} from "@/lib/schema/partner-form.schema";
import { usePartnerFormStore } from "@/lib/stores/partner-form-store";
import { useEffect } from "react";

export const usePartnerForm = () => {
  const {
    currentStep,
    formData,
    isSubmitting,
    updateFormData,
    nextStep,
    prevStep,
    submitForm,
  } = usePartnerFormStore();

  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: formData,
    mode: "onChange",
  });

  const { handleSubmit, trigger, watch } = form;

  // Step configuration
  const steps = [
    {
      title: "Partner",
      fields: [
        "type",
        "unifiedNumber",
        "payoutPerOrder",
        "payoutPerParcels",
        "currency",
      ] as const,
    },
    {
      title: "Representative",
      fields: ["name", "phoneNumber", "jobTitle", "email"] as const,
    },
    {
      title: "Bank Account",
      fields: [
        "accountHolderName",
        "bankName",
        "accountNumber",
        "iban",
      ] as const,
    },
  ];

  // Watch form changes and sync with Zustand store
  const watchedData = watch();
  useEffect(() => {
    updateFormData(watchedData);
  }, [watchedData, updateFormData]);

  const handleNextStep = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      nextStep();
    }
  };

  const handleSubmitForm = handleSubmit(async (data) => {
    // Final validation
    const result = partnerFormSchema.safeParse(data);
    if (result.success) {
      await submitForm();
    }
  });

  return {
    form,
    currentStep,
    steps,
    isSubmitting,
    formData,
    handleNextStep,
    handlePrevStep: prevStep,
    handleSubmitForm,
  };
};
