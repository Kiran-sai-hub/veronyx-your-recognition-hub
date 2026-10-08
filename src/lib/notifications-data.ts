import type { Persona } from "@/store/app-store";

/** In-app notifications per role (checklist §1.2 notifications, §6.1 empty state). */
export type AppNotification = {
  id: string;
  title: string;
  detail: string;
  when: string;
  href: string;
  tone: "info" | "warning" | "error" | "success";
};

const byPersona: Record<Persona, AppNotification[]> = {
  owner: [
    {
      id: "n-o1",
      title: "5 rewards waiting for your approval",
      detail: "2 are close to their 48-hour SLA",
      when: "10 min ago",
      href: "/approvals",
      tone: "warning",
    },
    {
      id: "n-o2",
      title: "Sales target achievers failed",
      detail: "Run 118 · the sales file has no “Target” column",
      when: "Yesterday",
      href: "/workflows/wf-sales/runs",
      tone: "error",
    },
    {
      id: "n-o3",
      title: "Night shift coverage dropped to 41%",
      detail: "Fairness check · last 90 days",
      when: "2 days ago",
      href: "/fairness",
      tone: "info",
    },
  ],
  hr: [
    {
      id: "n-h1",
      title: "Schema drift on Monthly sales file",
      detail: "Column “Target” missing — ingestion paused",
      when: "Yesterday",
      href: "/connectors/mapping",
      tone: "error",
    },
    {
      id: "n-h2",
      title: "7 unmatched records",
      detail: "Waiting in the identity queue",
      when: "Today 11:00",
      href: "/connectors/mapping?tab=identity",
      tone: "warning",
    },
    {
      id: "n-h3",
      title: "Data request due in 4 days",
      detail: "Access request from Kavya Rao",
      when: "Today",
      href: "/compliance?tab=requests",
      tone: "warning",
    },
    {
      id: "n-h4",
      title: "Payroll export for September is ready",
      detail: "42 rows · 1 threshold breach",
      when: "01/10/2026",
      href: "/payroll",
      tone: "success",
    },
  ],
  manager: [
    {
      id: "n-m1",
      title: "3 approvals from Sales A",
      detail: "Oldest has 4 hours left on its SLA",
      when: "10 min ago",
      href: "/approvals",
      tone: "warning",
    },
    {
      id: "n-m2",
      title: "2 people not recognised in 30+ days",
      detail: "Only you can see this list",
      when: "Today",
      href: "/dashboard/manager",
      tone: "info",
    },
  ],
  employee: [
    {
      id: "n-e1",
      title: "🎉 You received 250 points",
      detail: "Quality champion · from Arun Kumar",
      when: "06/10/2026",
      href: "/me/recognitions",
      tone: "success",
    },
    {
      id: "n-e2",
      title: "250 points expire on 31/12/2026",
      detail: "Redeem them before they lapse",
      when: "This week",
      href: "/me/redeem",
      tone: "warning",
    },
  ],
};

export function notificationsFor(persona: Persona, emptyOrg: boolean): AppNotification[] {
  return emptyOrg ? [] : byPersona[persona];
}
