import type { UIMessage } from "ai";
import { create } from "zustand";

export type InsightsThread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };

type InsightsState = {
  threads: InsightsThread[];
  createThread: () => string;
  saveMessages: (id: string, messages: UIMessage[]) => void;
  deleteThread: (id: string) => void;
};

function titleFrom(messages: UIMessage[]): string | null {
  const first = messages.find((m) => m.role === "user");
  const text = first?.parts.find((p) => p.type === "text");
  return text && "text" in text ? text.text.slice(0, 60) : null;
}

/** In-memory only: conversations are intentionally not saved across reloads. */
export const useInsightsStore = create<InsightsState>((set) => ({
  threads: [],
  createThread: () => {
    const id = crypto.randomUUID().slice(0, 8);
    set((s) => ({ threads: [{ id, title: "New question", updatedAt: Date.now(), messages: [] }, ...s.threads] }));
    return id;
  },
  saveMessages: (id, messages) =>
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === id ? { ...t, messages, updatedAt: Date.now(), title: titleFrom(messages) ?? t.title } : t,
      ),
    })),
  deleteThread: (id) => set((s) => ({ threads: s.threads.filter((t) => t.id !== id) })),
}));
