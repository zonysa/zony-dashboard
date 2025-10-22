import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { PartnerFormData } from "../schema/partner.schema";

interface PartnerFormStore {
  // State
  currentStep: number;
  formData: Partial<PartnerFormData>;
  isSubmitting: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<PartnerFormData>) => void;
  resetForm: () => void;
  submitForm: () => Promise<void>;
}

const initialFormData: Partial<PartnerFormData> = {
  type: "convenience store",
  unifiedNumber: "",
  payoutPerParcel: 1.0,
  currency: "EGP",
  partnerName: "",
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  iban: "",
};
export const usePartnerFormStore = create<PartnerFormStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentStep: 0,
      formData: initialFormData,
      isSubmitting: false,

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 2),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      resetForm: () =>
        set({
          currentStep: 0,
          formData: initialFormData,
          isSubmitting: false,
        }),

      submitForm: async () => {
        set({ isSubmitting: true });
        try {
          // API call here
          console.log("Submitting:", get().formData);
          // await api.createPartner(get().formData);

          // Reset form on success
          get().resetForm();
          alert("Partner created successfully!");
        } catch (error) {
          console.error("Submission failed:", error);
          alert("Failed to create partner. Please try again.");
        } finally {
          set({ isSubmitting: false });
        }
      },
    }),
    {
      name: "partner-form-store", // for devtools
    }
  )
);
