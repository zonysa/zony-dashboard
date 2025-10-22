import { useState, useCallback } from "react";
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from "react-hook-form";

export interface StepComponentProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  onNext: () => void;
  onBack: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: number;
  totalSteps: number;
  data?: T;
}

export interface StepConfig<T extends FieldValues = FieldValues> {
  id: string;
  title: string;
  description?: string;
  fields?: (keyof T)[];
  component: React.ComponentType<StepComponentProps<T>>;
  validation?: (data: T) => boolean | Promise<boolean>;
}

export interface UseMultiStepFormOptions<T extends FieldValues> {
  steps: StepConfig<T>[];
  defaultValues?: Partial<T>;
  onComplete?: (data: T) => void | Promise<void>;
  onStepChange?: (step: number, data: T) => void;
  persistState?: boolean;
  storageKey?: string;
}

export const useMultiStepForm = <T extends Record<string, unknown>>({
  steps,
  defaultValues,
  onStepChange,
  persistState = false,
  storageKey = "multistep-form",
  onComplete,
}: UseMultiStepFormOptions<T>) => {
  // Initialize step from localStorage if persistState is enabled
  const getInitialStep = () => {
    if (persistState && typeof window !== "undefined") {
      const saved = localStorage.getItem(`${storageKey}-step`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  };

  const getInitialData = () => {
    if (persistState && typeof window !== "undefined") {
      const saved = localStorage.getItem(`${storageKey}-data`);
      return saved ? { ...defaultValues, ...JSON.parse(saved) } : defaultValues;
    }
    return defaultValues;
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<T>({
    defaultValues: getInitialData(),
    mode: "onChange",
  });

  const { handleSubmit, getValues, reset } = form;

  // Persist state to localStorage
  const persistData = useCallback(
    (step: number, data: T) => {
      if (persistState && typeof window !== "undefined") {
        localStorage.setItem(`${storageKey}-step`, step.toString());
        localStorage.setItem(`${storageKey}-data`, JSON.stringify(data));
      }
    },
    [persistState, storageKey]
  );

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    if (persistState && typeof window !== "undefined") {
      localStorage.removeItem(`${storageKey}-step`);
      localStorage.removeItem(`${storageKey}-data`);
    }
  }, [persistState, storageKey]);

  const goToStep = useCallback(
    async (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return;

      const currentData = getValues();

      // Validate current step if moving forward
      if (stepIndex > currentStep) {
        const currentStepConfig = steps[currentStep];
        if (currentStepConfig.validation) {
          const isValid = await currentStepConfig.validation(currentData);
          if (!isValid) return;
        }
      }

      setCurrentStep(stepIndex);
      persistData(stepIndex, currentData);
      onStepChange?.(stepIndex, currentData);
    },
    [currentStep, steps, getValues, persistData, onStepChange]
  );

  const nextStep = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const resetForm = useCallback(() => {
    setCurrentStep(0);
    reset(defaultValues as DefaultValues<T>);
    clearPersistedData();
  }, [reset, defaultValues, clearPersistedData]);

  const submitForm = useCallback(
    async (data: T) => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsSubmitting(true);

        try {
          if (onComplete) {
            await onComplete(data);
          }

          if (persistState) {
            clearPersistedData();
          }
        } catch (err) {
          console.log("Error in onComplete:", err);
          throw err;
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [currentStep, steps.length]
  );

  const currentStepConfig = steps[currentStep];

  return {
    // State
    currentStep,
    totalSteps: steps.length,
    currentStepConfig,
    form,
    steps,
    isSubmitting,

    // Actions
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    submitForm: handleSubmit(submitForm),

    // Computed
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    progress: ((currentStep + 1) / steps.length) * 100,

    // Utils
    getStepData: getValues,
    clearPersistedData,
  };
};
