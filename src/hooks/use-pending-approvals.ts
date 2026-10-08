import { approvalsFor } from "@/lib/approvals-data";
import type { Persona } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";

/** Approvals still waiting on this role — drives the nav badge and dashboard cards. */
export function usePendingApprovals(persona: Persona) {
  const decisions = useDemoStore((s) => s.decisions);
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  if (emptyOrg || persona === "employee") return [];
  return approvalsFor(persona).filter((a) => a.status !== "auto_approved" && !decisions[a.id]);
}
