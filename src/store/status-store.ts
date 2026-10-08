import { create } from "zustand";

/**
 * Transient app-wide states from checklist §6.3 (offline, session expiry). Not persisted: they
 * describe the current browser session only. The demo can simulate them from the profile menu.
 */
type StatusState = {
  simulatedOffline: boolean;
  sessionWarning: boolean;
  setSimulatedOffline: (value: boolean) => void;
  setSessionWarning: (value: boolean) => void;
};

export const useStatusStore = create<StatusState>()((set) => ({
  simulatedOffline: false,
  sessionWarning: false,
  setSimulatedOffline: (simulatedOffline) => set({ simulatedOffline }),
  setSessionWarning: (sessionWarning) => set({ sessionWarning }),
}));
