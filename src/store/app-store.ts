import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Persona = "owner" | "hr" | "manager" | "employee";
export type Theme = "light" | "dark";
export type TextSize = "md" | "lg" | "xl";

type AppState = {
  persona: Persona;
  theme: Theme;
  language: string;
  aiAvailable: boolean;
  /** Accessibility preferences (checklist §9.2, §9.4). */
  highContrast: boolean;
  textSize: TextSize;
  reduceMotion: boolean;
  lowData: boolean;
  copilotOpen: boolean;
  copilotPrompt: string | null;
  setPersona: (persona: Persona) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  setAiAvailable: (available: boolean) => void;
  setAccessibility: (
    patch: Partial<Pick<AppState, "highContrast" | "textSize" | "reduceMotion" | "lowData">>,
  ) => void;
  openCopilot: (prompt?: string) => void;
  closeCopilot: () => void;
};

export const personaHome: Record<Persona, string> = {
  owner: "/dashboard/owner",
  hr: "/dashboard/hr",
  manager: "/dashboard/manager",
  employee: "/me",
};

/** Checklist §1.3: AI Copilot is for Owner and HR Admin only. */
export function canUseCopilot(persona: Persona): boolean {
  return persona === "owner" || persona === "hr";
}

/** True when this role may use AI right now; every AI entry point must also have a manual path. */
export function useCopilotEnabled(): boolean {
  const persona = useAppStore((s) => s.persona);
  const aiAvailable = useAppStore((s) => s.aiAvailable);
  return aiAvailable && canUseCopilot(persona);
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      persona: "employee",
      theme: "light",
      language: "en",
      aiAvailable: true,
      highContrast: false,
      textSize: "md",
      reduceMotion: false,
      lowData: false,
      copilotOpen: false,
      copilotPrompt: null,
      setPersona: (persona) => set({ persona }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setAiAvailable: (aiAvailable) => set({ aiAvailable }),
      setAccessibility: (patch) => set(patch),
      openCopilot: (prompt) => set({ copilotOpen: true, copilotPrompt: prompt ?? null }),
      closeCopilot: () => set({ copilotOpen: false, copilotPrompt: null }),
    }),
    {
      name: "veronyx-recognise-preferences",
      partialize: (state) => ({
        persona: state.persona,
        theme: state.theme,
        language: state.language,
        aiAvailable: state.aiAvailable,
        highContrast: state.highContrast,
        textSize: state.textSize,
        reduceMotion: state.reduceMotion,
        lowData: state.lowData,
      }),
    },
  ),
);

/** Applies theme and accessibility preferences to <html> on every surface. */
export function applyPreferences(
  state: Pick<
    AppState,
    "theme" | "highContrast" | "textSize" | "reduceMotion" | "lowData" | "language"
  >,
) {
  const root = document.documentElement;
  root.classList.toggle("dark", state.theme === "dark");
  root.classList.toggle("hc", state.highContrast);
  root.classList.toggle("reduce-motion", state.reduceMotion);
  root.classList.toggle("low-data", state.lowData);
  root.dataset["textSize"] = state.textSize;
  root.lang = state.language === "en" ? "en-IN" : state.language;
}
