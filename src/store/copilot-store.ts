import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CopilotReply } from "@/lib/copilot-engine";

/** Copilot sessions, shared by the shell sheet and the full page, persisted across reloads. */
export type Turn = {
  id: string;
  question: string;
  at: number;
  screen: string;
  reply: CopilotReply | null;
  /** Index into the progress steps while the answer is being prepared. */
  step: number;
  cancelled?: boolean;
  proposalState?: "open" | "draft" | "active" | "rejected";
  rejectReason?: string;
};

export type Session = { id: string; title: string; startedAt: number; turns: Turn[] };

type CopilotState = {
  sessions: Session[];
  activeId: string;
  newSession: () => string;
  setActive: (id: string) => void;
  addTurn: (turn: Turn) => void;
  patchTurn: (turnId: string, patch: Partial<Turn>) => void;
};

const makeSession = (): Session => ({
  id: Math.random().toString(36).slice(2, 10),
  title: "New session",
  startedAt: Date.now(),
  turns: [],
});

const first = makeSession();

export const useCopilotStore = create<CopilotState>()(
  persist(
    (set) => ({
      sessions: [first],
      activeId: first.id,
      newSession: () => {
        const s = makeSession();
        set((state) => ({ sessions: [s, ...state.sessions].slice(0, 12), activeId: s.id }));
        return s.id;
      },
      setActive: (activeId) => set({ activeId }),
      addTurn: (turn) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.activeId
              ? {
                  ...s,
                  title: s.turns.length === 0 ? turn.question.slice(0, 48) : s.title,
                  turns: [...s.turns, turn],
                }
              : s,
          ),
        })),
      patchTurn: (turnId, patch) =>
        set((state) => ({
          sessions: state.sessions.map((s) => ({
            ...s,
            turns: s.turns.map((t) => (t.id === turnId ? { ...t, ...patch } : t)),
          })),
        })),
    }),
    { name: "veronyx-copilot-sessions" },
  ),
);
