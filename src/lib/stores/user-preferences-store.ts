import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type Language = "en" | "ar";

interface UserPreferencesStore {
  // State
  language: Language;

  // Actions
  setLanguage: (language: Language) => void;
}

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        language: "en",

        // Actions
        setLanguage: (language) => {
          set({ language });
        },
      }),
      {
        name: "user-preferences-store",
        partialize: (state) => ({
          language: state.language,
        }),
      }
    ),
    {
      name: "user-preferences-store",
    }
  )
);

// Selector hooks for better performance
export const useLanguage = () =>
  useUserPreferencesStore((state) => state.language);
export const useSetLanguage = () =>
  useUserPreferencesStore((state) => state.setLanguage);
