import React from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { StepConfig } from "@/lib/hooks/useMutliStepForm";

interface MultiStepFormProps<T extends FieldValues> {
  steps: StepConfig<T>[];
  currentStep: number;
  currentStepConfig: StepConfig<T>;
  form: UseFormReturn<T>;
  onNext: () => void;
  onBack: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  className?: string;
  showProgress?: boolean;
  cardProps?: React.ComponentProps<typeof Card>;
}

export const MultiStepForm = <T extends FieldValues>({
  steps,
  currentStep,
  currentStepConfig,
  form,
  onNext,
  onBack,
  onSubmit,
  isFirstStep,
  isLastStep,
  className = "w-full max-w-2xl mx-auto",
  showProgress = true,
  cardProps,
}: MultiStepFormProps<T>) => {
  const StepComponent = currentStepConfig.component;

  return (
    <div className={className}>
      {showProgress && (
        <ProgressBar steps={steps} currentStep={currentStep} className="mb-6" />
      )}

      <Card
        {...cardProps}
        className={`shadow-sm ${cardProps?.className || ""}`}
      >
        <CardHeader>
          <CardTitle>{currentStepConfig.title}</CardTitle>
          {currentStepConfig.description && (
            <CardDescription>{currentStepConfig.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <StepComponent
            form={form}
            onNext={onNext}
            onBack={onBack}
            onSubmit={onSubmit}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            currentStep={currentStep}
            totalSteps={steps.length}
            data={form.getValues()}
          />
        </CardContent>
      </Card>
    </div>
  );
};
