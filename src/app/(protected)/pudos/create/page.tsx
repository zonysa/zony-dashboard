"use client";

import { MultiStepForm } from "@/forms/MultiStepForm";
import { OperatingHoursStep } from "@/forms/pudo/OperatingHours";
import { StepConfig, useMultiStepForm } from "@/lib/hooks/useMutliStepForm";
import { BranchInfoStep } from "@/forms/pudo/BranchInfoStep";
import {
  CreateBranch,
  CreateBranchRequest,
  isBranchInfoStepValid,
  isOperatingHoursStepValid,
} from "@/lib/schema/branch.schema";
import { useCreateBranch } from "@/lib/hooks/useBranch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PageContainer } from "@/components/PageContainer";

export default function Page() {
  const branchMutation = useCreateBranch();
  const router = useRouter();
  const { t } = useTranslation();

  const formSteps: StepConfig<CreateBranch>[] = [
    {
      id: "pudoInfo",
      title: t("forms.sections.branchInfo"),
      description: t("forms.sections.branchInfoDescription"),
      component: BranchInfoStep,
      validation: async (data: CreateBranch) => {
        if (!isBranchInfoStepValid(data)) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      },
    },
    {
      id: "operatingHours",
      title: t("forms.sections.operatingHours"),
      description: t("forms.sections.operatingHoursDescription"),
      component: OperatingHoursStep,
      validation: async (data: CreateBranch) => {
        if (!isOperatingHoursStepValid(data)) {
          toast.error(
            data["operatingHours"]
              ? "At least one day must have operating hours"
              : "Operating hours must be configured",
          );
          return false;
        }
        return true;
      },
    },
  ];

  const multiStep = useMultiStepForm<CreateBranch>({
    steps: formSteps,
    defaultValues: {
      // Set default values for the form
      city: "",
      district: "",
      zone: "",
      sameHoursEveryday: false,
      twentyFourSeven: false,
      confirmDetails: false,
      termsAccepted: false,
      operatingHours: {
        saturday: {
          enabled: true,
          to: "18:00",
          from: "09:00",
          breakHour: "13:00",
        },
        sunday: {
          enabled: true,
          to: "18:00",
          from: "09:00",
          breakHour: "13:00",
        },
        monday: {
          enabled: true,
          to: "18:00",
          from: "09:00",
          breakHour: "13:00",
        },
        tuesday: {
          enabled: true,
          to: "18:00",
          from: "09:00",
          breakHour: "13:00",
        },
        wednesday: {
          enabled: true,
          to: "18:00",
          from: "09:00",
          breakHour: "13:00",
        },
        thursday: {
          enabled: true,
          to: "18:00",
          from: "09:00",
          breakHour: "13:00",
        },
        friday: {
          enabled: false,
          to: "18:00",
          from: "09:00",
          breakHour: "13:00",
        },
      },
    },
    onComplete: async (data) => {
      // Here you would typically send the data to your API
      const [lat, lng] = data.coordinates
        .split(",")
        .map((coord: string) => coord.trim());
      try {
        const branchData: CreateBranchRequest = {
          // Branch info
          name: data.branchName,
          address: data.address,
          // status: "active"
          gallery: [],
          oprating_hours: data.operatingHours,
          municipal_license: "",
          password: data.password,
          coordinates: {
            latitude: lat,
            longitude: lng,
          },
          partner_id: data.partner,
          city_id: data.city,
          district_id: data.district,
          zone_id: data.zone,

          // Responsible
          responsible_id: data.responsible,
        };
        console.log(branchData);
        await branchMutation.mutateAsync(branchData, {
          onSuccess: () => {
            toast.success(
              t("dialogs.createBranch.success").replace(
                "{name}",
                data.branchName,
              ),
            );
            router.push("/pudos");
          },
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error(t("dialogs.createBranch.error"));
      }
    },
    persistState: true, // Enable state persistence for better UX
    storageKey: "pudo-registration-form",
  });

  return (
    <PageContainer size="sm" className="flex flex-col items-center gap-6 py-6">
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
    </PageContainer>
  );
}
