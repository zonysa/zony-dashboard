"use client";

import { MultiStepForm } from "@/forms/MultiStepForm";
import { OperatingHoursStep } from "@/forms/pudo/OperatingHours";
import { StepConfig, useMultiStepForm } from "@/lib/hooks/useMutliStepForm";
import { BranchInfoStep } from "@/forms/pudo/BranchInfoStep";
import {
  BranchFormData,
  CreateBranchRequest,
} from "@/lib/schema/branch.schema";
import { useCreateBranch } from "@/lib/hooks/useBranch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Page() {
  const branchMutation = useCreateBranch();
  const router = useRouter();

  const formSteps: StepConfig<BranchFormData>[] = [
    {
      id: "pudoInfo",
      title: "PUDO Info",
      description: "PUDO location and branch details",
      component: BranchInfoStep,
      validation: async (data: BranchFormData) => {
        // Validate PUDO info fields
        if (!data["branchName"]) {
          console.log("Branch name is required");
          return false;
        }
        if (!data.city) {
          console.log("City is required");
          return false;
        }
        if (!data.district) {
          console.log("District is required");
          return false;
        }
        if (!data.zone) {
          console.log("Zone is required");
          return false;
        }
        if (!data["address"]) {
          console.log("Address is required");
          return false;
        }
        return true;
      },
    },
    {
      id: "operatingHours",
      title: "Operating Hours",
      description: "Set your PUDO location operating hours",
      component: OperatingHoursStep,
      validation: async (data: BranchFormData) => {
        // Operating hours validation
        // If 24/7 is selected, no other validation needed
        if (data["twentyFourSeven"]) {
          return true;
        }

        // Check if at least one day has operating hours set
        const operatingHours = data["operatingHours"];
        if (!operatingHours) {
          console.log("Operating hours must be configured");
          return false;
        }

        const days = [
          "saturday",
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
        ];
        const hasAtLeastOneDay = days.some((day) => {
          const dayHours = operatingHours[day];
          return dayHours && dayHours.enabled !== false;
        });

        if (!hasAtLeastOneDay) {
          console.log("At least one day must have operating hours");
          return false;
        }

        return true;
      },
    },
  ];

  const multiStep = useMultiStepForm<BranchFormData>({
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
        .map((coord) => coord.trim());
      try {
        const branchData: CreateBranchRequest = {
          // Branch info
          name: data.branchName,
          address: data.address,
          // status: "active"
          gallery: [],
          oprating_hours: data.operatingHours,
          municipal_license: "13213123",
          password: "00000000",
          coordinates: {
            latitude: lat,
            longitude: lng,
          },
          partner_id: data.partner,
          district_id: data.district,
          zone_id: data.zone,

          // Responsible
          responsible_id: data.responsible,
        };
        console.log(branchData);
        await branchMutation.mutateAsync(branchData, {
          onSuccess: () => {
            toast.success(`Branch ${data.branchName} Created Successfuly`);
            router.push("/pudos");
          },
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Error submitting registration. Please try again.");
      }
    },
    persistState: true, // Enable state persistence for better UX
    storageKey: "pudo-registration-form",
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
