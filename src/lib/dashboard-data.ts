import { MANAGER_TEAM } from "@/lib/approvals-data";
import { employees } from "@/lib/mock-data";

/** Figures behind the Owner (D-01), HR (H-01) and Manager (M-01) dashboards. */

export const orgPulse = {
  recognisedPct: 71,
  recognisedCount: 141,
  activeEmployees: 199,
  pointsThisMonth: 34600,
  rupeesThisMonth: 34600,
  budgetLeft: 218600,
  budgetYear: 500000,
  activeWorkflows: 3,
};

/** Team comparison (D-01): one row per department, this month. */
export const teamComparison = [
  {
    department: "Manufacturing",
    people: 80,
    recognised: 51,
    coverage: 64,
    spend: 12400,
    perPerson: 155,
  },
  { department: "Quality", people: 40, recognised: 31, coverage: 78, spend: 8200, perPerson: 205 },
  { department: "Sales", people: 45, recognised: 32, coverage: 71, spend: 11300, perPerson: 251 },
  {
    department: "Operations",
    people: 34,
    recognised: 17,
    coverage: 49,
    spend: 2700,
    perPerson: 79,
  },
];

export type TeamMember = {
  id: string;
  name: string;
  code: string;
  initials: string;
  monthPoints: number;
  lastRecognised: string;
  daysSince: number;
  salesPct: number;
  deals: number;
};

const member = (
  index: number,
  monthPoints: number,
  daysSince: number,
  salesPct: number,
  deals: number,
): TeamMember => {
  const e = employees[index];
  const name = e?.name ?? "Employee";
  return {
    id: e?.id ?? `emp-${index + 1}`,
    name,
    code: e?.code ?? "",
    initials: name
      .split(" ")
      .map((p) => p[0])
      .join(""),
    monthPoints,
    daysSince,
    lastRecognised: daysSince <= 1 ? "Yesterday" : `${daysSince} days ago`,
    salesPct,
    deals,
  };
};

/** Vikram Rao's team (Sales A) — the same people as in People & Teams and Approvals. */
export const managerTeam = {
  name: MANAGER_TEAM,
  manager: "Vikram Rao",
  members: [
    member(18, 1450, 2, 128, 14),
    member(50, 1200, 5, 112, 9),
    member(34, 980, 7, 104, 8),
    member(66, 760, 14, 97, 7),
    member(82, 0, 41, 88, 5),
    member(98, 520, 21, 93, 6),
    member(114, 0, 52, 76, 4),
    member(2, 340, 28, 92, 6),
  ],
  wallet: { balance: 4200, cap: 8000, used: 3800, refill: "01/11/2026" },
};

/** Per-workflow leaderboards (M-02) with the visibility each workflow allows. */
export const teamLeaderboards = [
  {
    id: "wf-sales",
    name: "Sales target achievers",
    metric: "Sales vs target",
    unit: "%",
    visibility: "Team only · names shown · bottom half hidden from employees",
    value: (m: TeamMember) => m.salesPct,
  },
  {
    id: "deals",
    name: "Deal closers (monthly)",
    metric: "Deals closed",
    unit: "",
    visibility: "Public top 3 · others see only their own rank",
    value: (m: TeamMember) => m.deals,
  },
  {
    id: "points",
    name: "Recognition points (October)",
    metric: "Points received",
    unit: " pts",
    visibility: "Manager only",
    value: (m: TeamMember) => m.monthPoints,
  },
];

/** Team metric trends (M-06), from the metrics layer. */
export const teamTrends = [
  { month: "May", salesPct: 91, deals: 41, recognitions: 9 },
  { month: "Jun", salesPct: 95, deals: 44, recognitions: 11 },
  { month: "Jul", salesPct: 102, deals: 52, recognitions: 14 },
  { month: "Aug", salesPct: 98, deals: 47, recognitions: 12 },
  { month: "Sep", salesPct: 107, deals: 59, recognitions: 16 },
  { month: "Oct", salesPct: 99, deals: 23, recognitions: 7 },
];

export const recognitionTypes = [
  "Sales Star",
  "Team Player",
  "Above & Beyond",
  "Customer Hero",
  "New Business",
];

/** Guided next steps for a brand-new organisation (checklist §4.1 step 3). */
export const setupSteps = [
  { id: "people", label: "Import your employees", href: "/people", done: true },
  { id: "source", label: "Connect your first data source", href: "/connectors", done: false },
  { id: "workflow", label: "Create your first workflow", href: "/workflows/new", done: false },
  { id: "budget", label: "Set a budget for each department", href: "/budget", done: false },
  {
    id: "invite",
    label: "Invite managers to approve rewards",
    href: "/settings?tab=roles",
    done: false,
  },
];
