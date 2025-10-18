import React from "react";
import { cn } from "@/lib/utils";
import { StepConfig } from "@/lib/hooks/useMutliStepForm";

interface ProgressBarProps {
  steps: StepConfig[];
  currentStep: number;
  className?: string;
  variant?: "default" | "minimal" | "numbered";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
  className,
  variant = "default",
}) => {
  if (variant === "minimal") {
    return (
      <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    );
  }

  if (variant === "numbered") {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                index <= currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 w-12 mx-2 transition-all",
                  index < currentStep ? "bg-primary" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md gap-3 px-3 bg-gray-100 py-2",
        className
      )}
    >
      {steps.map((step, index) => (
        <div key={step.id} className="w-full flex justify-between items-center">
          <div
            className={cn(
              "rounded-md px-3 flex justify-center items-center flex-1 py-1.5 transition-all duration-300 ease-in-out",
              index <= currentStep
                ? "bg-primary text-white"
                : "bg-primary/50 text-white/90"
            )}
          >
            <span className="text-sm font-medium">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-1 w-4 mx-1 transition-all",
                index < currentStep ? "bg-primary" : "bg-primary/30"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};
