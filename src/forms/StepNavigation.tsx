import React from "react";
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
  backLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  className?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onBack,
  isFirstStep,
  isLastStep,
  isLoading = false,
  backLabel = "Back",
  nextLabel = "Next",
  submitLabel = "Submit",
  className = "flex justify-between gap-4 mt-6",
}) => {
  return (
    <div className={className}>
      {!isFirstStep && (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          {backLabel}
        </Button>
      )}
      <Button type="submit" disabled={isLoading} className="ml-auto">
        {isLoading ? "Loading..." : isLastStep ? submitLabel : nextLabel}
      </Button>
    </div>
  );
};
