import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Persona = "owner" | "hr" | "manager" | "employee";
export type Theme = "light" | "dark";

type AppState = {
  persona: Persona;
  theme: Theme;
  language: string;
  setPersona: (persona: Persona) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      persona: "employee",
      theme: "light",
      language: "en",
      setPersona: (persona) => set({ persona }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    { name: "veronyx-recognise-preferences" },
  ),
);
