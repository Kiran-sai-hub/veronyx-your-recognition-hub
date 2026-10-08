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

/** Audit entries created during the demo; shown on top of the seeded audit log. */
export type AuditEvent = {
  id: string;
  at: number;
  actor: string;
  action: string;
  target: string;
  type: "payroll" | "ai" | "consent" | "budget" | "reward" | "privacy" | "settings";
};

export type PayrollExportRecord = {
  id: string;
  period: string;
  system: string;
  rows: number;
  date: string;
  by: string;
  file: string;
  sent: boolean;
  csv: string;
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
  /** Boards created or edited in the demo (full definitions). */
  savedBoards: { id: string; name: string; status: "draft" | "active"; board: unknown }[];
  auditEvents: AuditEvent[];
  payrollExports: PayrollExportRecord[];
  /** Overrides for the seeded export history's "Sent to payroll" toggle. */
  payrollSent: Record<string, boolean>;
  logAudit: (event: Omit<AuditEvent, "id" | "at">) => void;
  addPayrollExport: (record: PayrollExportRecord) => void;
  setPayrollSent: (id: string, sent: boolean) => void;
  saveBoard: (b: { id: string; name: string; status: "draft" | "active"; board: unknown }) => void;
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
  savedBoards: [],
  auditEvents: [] as AuditEvent[],
  payrollExports: [] as PayrollExportRecord[],
  payrollSent: {} as Record<string, boolean>,
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      ...initial,
      setEmptyOrg: (emptyOrg) => set({ emptyOrg }),
      logAudit: (event) =>
        set((s) => ({
          auditEvents: [
            { ...event, id: `AU-D${s.auditEvents.length + 1}`, at: Date.now() },
            ...s.auditEvents,
          ].slice(0, 200),
        })),
      addPayrollExport: (record) => set((s) => ({ payrollExports: [record, ...s.payrollExports] })),
      setPayrollSent: (id, sent) => set((s) => ({ payrollSent: { ...s.payrollSent, [id]: sent } })),
      saveBoard: (b) =>
        set((s) => ({ savedBoards: [b, ...s.savedBoards.filter((x) => x.id !== b.id)] })),
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
