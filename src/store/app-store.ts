import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Persona = "owner" | "hr" | "manager" | "employee";
export type Theme = "light" | "dark";

type AppState = {
  persona: Persona;
  theme: Theme;
  language: string;
  aiAvailable: boolean;
  copilotOpen: boolean;
  copilotPrompt: string | null;
  setPersona: (persona: Persona) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  setAiAvailable: (available: boolean) => void;
  openCopilot: (prompt?: string) => void;
  closeCopilot: () => void;
};

export const personaHome: Record<Persona, string> = {
  owner: "/dashboard/owner",
  hr: "/dashboard/hr",
  manager: "/dashboard/manager",
  employee: "/me",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      persona: "employee",
      theme: "light",
      language: "en",
      aiAvailable: true,
      copilotOpen: false,
      copilotPrompt: null,
      setPersona: (persona) => set({ persona }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setAiAvailable: (aiAvailable) => set({ aiAvailable }),
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
      }),
    },
  ),
);
