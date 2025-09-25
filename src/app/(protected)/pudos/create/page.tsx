"use client";
import { MultiStepForm } from "@/forms/MultiStepForm";
import { PUDOInfoStep } from "@/forms/pudo/PUDOInfoStep";
import { ResponsiblePersonStep } from "@/forms/pudo/ResponsibleStep";
import { OperatingHoursStep } from "@/forms/pudo/OperatingHours";
import { useMultiStepForm } from "@/hooks/useMutliStepForm";
import { PUDOFormData } from "@/lib/schema/pudo-form.schema";

export default function Page() {
  const formSteps = [
    {
      id: "pudo-info",
      title: "PUDO Info",
      description: "PUDO location and branch details",
      component: PUDOInfoStep,
      validation: async (data: PUDOFormData) => {
        // Validate PUDO info fields
        if (!data["branch-name"]) {
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
        if (!data["short-address"]) {
          console.log("Address is required");
          return false;
        }
        return true;
      },
    },
    {
      id: "responsible-person",
      title: "Responsible Person",
      description: "Person responsible for this PUDO location",
      component: ResponsiblePersonStep,
      validation: async (data: PUDOFormData) => {
        // Validate responsible person fields
        if (!data["full-name"]) {
          console.log("Full name is required");
          return false;
        }
        if (!data["phone-number"]) {
          console.log("Phone number is required");
          return false;
        }
        // Identity document is optional, so no validation needed
        return true;
      },
    },
    {
      id: "operating-hours",
      title: "Operating Hours",
      description: "Set your PUDO location operating hours",
      component: OperatingHoursStep,
      validation: async (data: PUDOFormData) => {
        // Operating hours validation
        // If 24/7 is selected, no other validation needed
        if (data["24-7"]) {
          return true;
        }

        // Check if at least one day has operating hours set
        const operatingHours = data["operating-hours"];
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

  const multiStep = useMultiStepForm<PUDOFormData>({
    steps: formSteps,
    defaultValues: {
      // Set default values for the form
      "establishment-type": "",
      city: "",
      district: "",
      zone: "",
      "account-type": "",
      "bank-name": "",
      "same-hours-everyday": false,
      "24-7": false,
      "confirm-details": false,
      "terms-accepted": false,
      "operating-hours": {
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
      console.log("PUDO Registration Completed", data);

      // Here you would typically send the data to your API
      try {
        // Example API call:
        // const response = await fetch("/api/pudo/register", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(data),
        // });
        //
        // if (response.ok) {
        //   // Handle success - redirect or show success message
        //   console.log("Registration successful!");
        // }

        // For now, just log the data
        console.log("Form data to submit:", data);

        // You can also show a success notification
        alert("PUDO Registration submitted successfully!");
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
