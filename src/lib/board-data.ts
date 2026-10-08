import { employees } from "@/lib/mock-data";

/** Performance boards (checklist §2.6 P-01…P-12, §4.9 and §4.11). */

export type BoardType = "sales" | "support" | "manufacturing" | "retail" | "logistics" | "custom";
export type SourceMode = "External" | "Native" | "Hybrid";
export type ComparisonMode =
  | "private_self_only"
  | "manager_only"
  | "team_only"
  | "public_top_n"
  | "public_full"
  | "anonymous_benchmark";

export type ScoreMetric = {
  id: string;
  metric: string;
  weight: number;
  target: string;
  min: string;
  max: string;
  direction: "higher" | "lower";
};

export type Target = {
  id: string;
  level: "Employee" | "Team" | "Location" | "Board";
  who: string;
  metric: string;
  window: "daily" | "weekly" | "monthly" | "quarterly";
  value: string;
  stretch: string;
};

export const ruleTypes = [
  "appreciation",
  "reward_nomination",
  "missing_data_reminder",
  "manager_alert",
  "private_employee_nudge",
  "coaching_task",
  "escalation",
  "visibility_update",
  "team_celebration",
] as const;
export type RuleType = (typeof ruleTypes)[number];

export const actionTypes = [
  "Send message",
  "Create coaching task",
  "Alert manager",
  "Send private nudge",
  "Request data entry",
  "Schedule follow-up",
  "Escalate",
] as const;

export type BehaviourRule = {
  id: string;
  name: string;
  type: RuleType;
  trigger: "Metric threshold" | "Schedule" | "Event" | "Manual";
  condition: string;
  window: string;
  action: (typeof actionTypes)[number];
  audience: "Employee (private)" | "Manager" | "HR" | "Team";
  template: string;
  cooldownDays: number;
  isPrivate: boolean;
  managerConfirm: boolean;
  improvementDays: number;
  locale: string;
  active: boolean;
};

export type Board = {
  id: string;
  name: string;
  type: BoardType;
  sourceMode: SourceMode;
  status: "draft" | "active";
  scope: { departments: string[]; teams: string[]; locations: string[] };
  members: number;
  tracking: {
    connector: string;
    eventType: string;
    identityPolicy: string;
    form: string;
    frequency: "daily" | "weekly" | "monthly" | "event" | "shift";
    allowedRoles: string[];
    approvalRequired: boolean;
  };
  metrics: ScoreMetric[];
  targets: Target[];
  rules: BehaviourRule[];
  comparison: {
    mode: ComparisonMode;
    topN: number;
    showNames: boolean;
    showPhotos: boolean;
    showLowPerformers: boolean;
    showTeamAverage: boolean;
    consentRequired: boolean;
  };
  visibility: { item: string; employees: boolean; managers: boolean; kiosk: boolean }[];
};

export const comparisonModes: { mode: ComparisonMode; label: string; detail: string }[] = [
  {
    mode: "private_self_only",
    label: "Private — self only",
    detail: "Each person sees only their own number.",
  },
  { mode: "manager_only", label: "Manager only", detail: "Only managers see the ranked list." },
  { mode: "team_only", label: "Team only", detail: "People see their own team's leaderboard." },
  {
    mode: "public_top_n",
    label: "Public top N",
    detail: "Everyone sees the top N; others see only their own rank.",
  },
  {
    mode: "public_full",
    label: "Public — full list",
    detail: "Everyone sees every rank. Use with care.",
  },
  {
    mode: "anonymous_benchmark",
    label: "Anonymous benchmark",
    detail: "People see where they stand vs the team average, no names.",
  },
];

let n = 0;
const id = (p: string) => `${p}-${++n}`;

const rule = (
  partial: Partial<BehaviourRule> & Pick<BehaviourRule, "name" | "type">,
): BehaviourRule => ({
  id: id("rule"),
  trigger: "Metric threshold",
  condition: "",
  window: "last 7 days",
  action: "Send message",
  audience: "Manager",
  template: "manager_alert_v2",
  cooldownDays: 7,
  isPrivate: true,
  managerConfirm: true,
  improvementDays: 14,
  locale: "Employee's language",
  active: true,
  ...partial,
});

const baseComparison: Board["comparison"] = {
  mode: "public_top_n",
  topN: 3,
  showNames: true,
  showPhotos: false,
  showLowPerformers: false,
  showTeamAverage: true,
  consentRequired: true,
};

const baseVisibility = (metric: string): Board["visibility"] => [
  { item: `Leaderboard`, employees: true, managers: true, kiosk: false },
  { item: `${metric} (each person's number)`, employees: false, managers: true, kiosk: false },
  { item: "Team average", employees: true, managers: true, kiosk: true },
];

export const boards: Board[] = [
  {
    id: "board-sales",
    name: "Sales A monthly race",
    type: "sales",
    sourceMode: "External",
    status: "active",
    scope: { departments: ["Sales"], teams: ["Sales A"], locations: ["Chennai"] },
    members: 13,
    tracking: {
      connector: "Zoho CRM",
      eventType: "crm.deal_closed",
      identityPolicy: "Email, then CRM user ID — unmatched go to the identity queue",
      form: "",
      frequency: "event",
      allowedRoles: [],
      approvalRequired: false,
    },
    metrics: [
      {
        id: "m1",
        metric: "Sales vs target (%)",
        weight: 60,
        target: "100%",
        min: "0%",
        max: "200%",
        direction: "higher",
      },
      {
        id: "m2",
        metric: "Deals closed",
        weight: 25,
        target: "8",
        min: "0",
        max: "30",
        direction: "higher",
      },
      {
        id: "m3",
        metric: "Overdue collections (₹)",
        weight: 15,
        target: "₹ 0",
        min: "₹ 0",
        max: "₹ 5,00,000",
        direction: "lower",
      },
    ],
    targets: [
      {
        id: "t1",
        level: "Employee",
        who: "Every salesperson",
        metric: "Sales vs target",
        window: "monthly",
        value: "₹ 5,00,000",
        stretch: "₹ 6,00,000",
      },
      {
        id: "t2",
        level: "Team",
        who: "Sales A",
        metric: "Deals closed",
        window: "monthly",
        value: "60",
        stretch: "75",
      },
      {
        id: "t3",
        level: "Location",
        who: "Chennai",
        metric: "Sales vs target",
        window: "quarterly",
        value: "100%",
        stretch: "115%",
      },
    ],
    rules: [
      rule({
        name: "Thank the top closer",
        type: "appreciation",
        condition: "rank = 1 at month end",
        action: "Send message",
        audience: "Team",
        isPrivate: false,
        managerConfirm: false,
      }),
      rule({
        name: "CRM not updated",
        type: "missing_data_reminder",
        trigger: "Event",
        condition: "no CRM activity for 3 days",
        action: "Request data entry",
        audience: "Employee (private)",
      }),
      rule({
        name: "Below 70% at mid-month",
        type: "private_employee_nudge",
        condition: "sales_vs_target < 70% on day 15",
        action: "Send private nudge",
        audience: "Employee (private)",
      }),
    ],
    comparison: baseComparison,
    visibility: baseVisibility("Sales vs target"),
  },
  {
    id: "board-factory",
    name: "Factory Line Output Board",
    type: "manufacturing",
    sourceMode: "Native",
    status: "active",
    scope: {
      departments: ["Manufacturing"],
      teams: ["Manufacturing A", "Manufacturing B"],
      locations: ["Coimbatore"],
    },
    members: 80,
    tracking: {
      connector: "",
      eventType: "",
      identityPolicy: "Employee code entered by supervisor",
      form: "Daily Factory Output",
      frequency: "shift",
      allowedRoles: ["Supervisor/Manager"],
      approvalRequired: true,
    },
    metrics: [
      {
        id: "m1",
        metric: "Units produced",
        weight: 50,
        target: "400 / shift",
        min: "0",
        max: "600",
        direction: "higher",
      },
      {
        id: "m2",
        metric: "Reject rate (%)",
        weight: 30,
        target: "≤ 2%",
        min: "0%",
        max: "10%",
        direction: "lower",
      },
      {
        id: "m3",
        metric: "Attendance (%)",
        weight: 20,
        target: "95%",
        min: "0%",
        max: "100%",
        direction: "higher",
      },
    ],
    targets: [
      {
        id: "t1",
        level: "Employee",
        who: "Every operator",
        metric: "Units produced",
        window: "daily",
        value: "400",
        stretch: "450",
      },
      {
        id: "t2",
        level: "Board",
        who: "Whole board",
        metric: "Reject rate",
        window: "weekly",
        value: "≤ 2%",
        stretch: "≤ 1.5%",
      },
    ],
    rules: [
      rule({
        name: "Low attendance alert",
        type: "manager_alert",
        condition: "attendance < 90%",
        window: "last 30 days",
        action: "Alert manager",
        audience: "Manager",
      }),
      rule({
        name: "Missing shift entry",
        type: "missing_data_reminder",
        trigger: "Schedule",
        condition: "every day 20:00 if no entry",
        action: "Request data entry",
        audience: "Manager",
        isPrivate: false,
      }),
      rule({
        name: "Line target met",
        type: "team_celebration",
        condition: "line units ≥ weekly target",
        action: "Send message",
        audience: "Team",
        isPrivate: false,
        managerConfirm: false,
      }),
    ],
    comparison: { ...baseComparison, mode: "team_only" },
    visibility: baseVisibility("Units produced"),
  },
  {
    id: "board-quality",
    name: "Zero-defect shifts",
    type: "manufacturing",
    sourceMode: "Hybrid",
    status: "active",
    scope: { departments: ["Quality"], teams: [], locations: ["Coimbatore", "Tiruppur"] },
    members: 50,
    tracking: {
      connector: "Google Sheets · Quality log",
      eventType: "sheet.row_added",
      identityPolicy: "Employee code",
      form: "Quality spot check",
      frequency: "shift",
      allowedRoles: ["Supervisor/Manager"],
      approvalRequired: true,
    },
    metrics: [
      {
        id: "m1",
        metric: "Defects per shift",
        weight: 70,
        target: "0",
        min: "0",
        max: "20",
        direction: "lower",
      },
      {
        id: "m2",
        metric: "Pieces inspected",
        weight: 30,
        target: "500",
        min: "0",
        max: "1,200",
        direction: "higher",
      },
    ],
    targets: [
      {
        id: "t1",
        level: "Employee",
        who: "Every inspector",
        metric: "Defects per shift",
        window: "weekly",
        value: "0",
        stretch: "0 for 4 weeks",
      },
    ],
    rules: [
      rule({
        name: "Coaching after 2 bad shifts",
        type: "coaching_task",
        condition: "defects > 5 on 2 shifts",
        action: "Create coaching task",
        audience: "Manager",
      }),
    ],
    comparison: { ...baseComparison, mode: "anonymous_benchmark" },
    visibility: baseVisibility("Defects per shift"),
  },
  {
    id: "board-safety",
    name: "Safety suggestions",
    type: "custom",
    sourceMode: "Native",
    status: "draft",
    scope: {
      departments: [],
      teams: [],
      locations: ["Coimbatore", "Chennai", "Erode", "Tiruppur"],
    },
    members: 199,
    tracking: {
      connector: "",
      eventType: "",
      identityPolicy: "Employee self-entry (signed in)",
      form: "Safety suggestion",
      frequency: "event",
      allowedRoles: ["Employee self"],
      approvalRequired: true,
    },
    metrics: [
      {
        id: "m1",
        metric: "Accepted suggestions",
        weight: 100,
        target: "1 / quarter",
        min: "0",
        max: "10",
        direction: "higher",
      },
    ],
    targets: [],
    rules: [],
    comparison: { ...baseComparison, mode: "public_full" },
    visibility: baseVisibility("Accepted suggestions"),
  },
];

export const boardIndustryTemplates = [
  {
    industry: "Manufacturing",
    roles: ["Line operators", "Quality inspectors", "Maintenance"],
    boardType: "manufacturing" as BoardType,
  },
  {
    industry: "Retail",
    roles: ["Store staff", "Store managers"],
    boardType: "retail" as BoardType,
  },
  {
    industry: "Support",
    roles: ["Support agents", "Team leads"],
    boardType: "support" as BoardType,
  },
  { industry: "Sales", roles: ["Field sales", "Inside sales"], boardType: "sales" as BoardType },
  {
    industry: "Logistics",
    roles: ["Drivers", "Warehouse pickers"],
    boardType: "logistics" as BoardType,
  },
];

export function blankBoard(name = "New board", type: BoardType = "custom"): Board {
  return {
    id: "new",
    name,
    type,
    sourceMode: "External",
    status: "draft",
    scope: { departments: [], teams: [], locations: [] },
    members: 0,
    tracking: {
      connector: "",
      eventType: "",
      identityPolicy: "Employee code",
      form: "",
      frequency: "daily",
      allowedRoles: [],
      approvalRequired: true,
    },
    metrics: [],
    targets: [],
    rules: [],
    comparison: { ...baseComparison, mode: "team_only" },
    visibility: baseVisibility("Main metric"),
  };
}

export function fromTemplate(industry: string, role: string): Board {
  const t =
    boardIndustryTemplates.find((x) => x.industry === industry) ?? boardIndustryTemplates[0]!;
  const base = boards.find((b) => b.type === t.boardType) ?? boards[1]!;
  return { ...structuredClone(base), id: "new", name: `${role} board`, status: "draft" };
}

export function newRule(): BehaviourRule {
  return rule({ name: "", type: "manager_alert" });
}

/** Leaderboard rows for previews (score out of 100). */
export const boardLeaderboard = employees
  .filter((e) => e.department === "Sales" && e.team === "Sales A")
  .slice(0, 10)
  .map((e, i) => ({
    rank: i + 1,
    name: e.name,
    initials: e.name
      .split(" ")
      .map((p) => p[0])
      .join(""),
    score: 96 - i * 6,
    points: Math.max(0, 600 - i * 100),
  }));

export const teamAverage = Math.round(
  boardLeaderboard.reduce((s, r) => s + r.score, 0) / boardLeaderboard.length,
);
