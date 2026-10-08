import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Prototype state that should survive moving between screens: decisions taken, workflows
 * saved, points spent. Kept in one place so a live backend can replace it later and so the
 * demo can be reset to its starting story in one click.
 */
export type DecisionKind = "approve" | "modify" | "reject" | "escalate" | "queued";

export type Decision = {
  kind: DecisionKind;
  at: number;
  note?: string;
  points?: number;
  rewardKind?: string;
  target?: string;
};

export type SavedWorkflow = {
  id: string;
  name: string;
  status: "live" | "draft" | "paused";
  version: number;
  savedAt: number;
  fromAi?: boolean;
  trigger?: string;
  /** Full builder definition so a saved workflow re-opens exactly as left. */
  draft?: unknown;
};

export type Redemption = {
  id: string;
  itemId: string;
  title: string;
  points: number;
  value: number;
  status: "requested" | "hold" | "ordered" | "fulfilled" | "failed";
  code?: string;
  at: number;
  rating?: number;
};

type DemoState = {
  /** Shows every screen as a brand-new organisation so empty states can be demoed (§6.1). */
  emptyOrg: boolean;
  onboarded: boolean;
  decisions: Record<string, Decision>;
  readNotifications: string[];
  workflowStatus: Record<string, SavedWorkflow["status"]>;
  savedWorkflows: SavedWorkflow[];
  employeePoints: number;
  redemptions: Redemption[];
  setEmptyOrg: (value: boolean) => void;
  finishOnboarding: () => void;
  decide: (id: string, decision: Decision) => void;
  undoDecision: (id: string) => void;
  markNotificationsRead: (ids: string[]) => void;
  setWorkflowStatus: (id: string, status: SavedWorkflow["status"]) => void;
  saveWorkflow: (workflow: SavedWorkflow) => void;
  addRedemption: (redemption: Redemption) => void;
  updateRedemption: (id: string, patch: Partial<Redemption>) => void;
  reset: () => void;
};

const initial = {
  emptyOrg: false,
  onboarded: true,
  decisions: {},
  readNotifications: [],
  workflowStatus: {},
  savedWorkflows: [],
  employeePoints: 1850,
  redemptions: [],
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      ...initial,
      setEmptyOrg: (emptyOrg) => set({ emptyOrg }),
      finishOnboarding: () => set({ onboarded: true, emptyOrg: true }),
      decide: (id, decision) => set((s) => ({ decisions: { ...s.decisions, [id]: decision } })),
      undoDecision: (id) =>
        set((s) => {
          const next = { ...s.decisions };
          delete next[id];
          return { decisions: next };
        }),
      markNotificationsRead: (ids) =>
        set((s) => ({ readNotifications: [...new Set([...s.readNotifications, ...ids])] })),
      setWorkflowStatus: (id, status) =>
        set((s) => ({ workflowStatus: { ...s.workflowStatus, [id]: status } })),
      saveWorkflow: (workflow) =>
        set((s) => ({
          savedWorkflows: [workflow, ...s.savedWorkflows.filter((w) => w.id !== workflow.id)],
          workflowStatus: { ...s.workflowStatus, [workflow.id]: workflow.status },
        })),
      addRedemption: (redemption) =>
        set((s) => ({
          redemptions: [redemption, ...s.redemptions],
          employeePoints: s.employeePoints - redemption.points,
        })),
      updateRedemption: (id, patch) =>
        set((s) => {
          const current = s.redemptions.find((r) => r.id === id);
          // A failed order returns the held points (checklist §4.12 step 7).
          const refund = current && patch.status === "failed" && current.status !== "failed";
          return {
            redemptions: s.redemptions.map((r) => (r.id === id ? { ...r, ...patch } : r)),
            employeePoints: refund ? s.employeePoints + current.points : s.employeePoints,
          };
        }),
      reset: () => set({ ...initial }),
    }),
    { name: "veronyx-recognise-demo" },
  ),
);
