import { employees } from "@/lib/mock-data";

export type WorkflowStatus = "live" | "draft" | "paused" | "failed";

export type Workflow = {
  id: string;
  name: string;
  trigger: string;
  status: WorkflowStatus;
  owner: string;
  lastRun: string;
  lastRunResult: "success" | "failed" | "running" | "none";
  rewardsThisMonth: number;
  version: number;
};

export const workflows: Workflow[] = [
  {
    id: "wf-attendance",
    name: "Perfect attendance bonus",
    trigger: "Every month on the 1st",
    status: "live",
    owner: "Lakshmi Menon",
    lastRun: "01/10/2026 06:00",
    lastRunResult: "success",
    rewardsThisMonth: 42,
    version: 4,
  },
  {
    id: "wf-sales",
    name: "Sales target achievers",
    trigger: "When monthly sales are imported",
    status: "live",
    owner: "Vikram Rao",
    lastRun: "07/10/2026 18:30",
    lastRunResult: "failed",
    rewardsThisMonth: 11,
    version: 7,
  },
  {
    id: "wf-quality",
    name: "Zero-defect shift",
    trigger: "Every Friday at 17:00",
    status: "live",
    owner: "Lakshmi Menon",
    lastRun: "08/10/2026 11:00",
    lastRunResult: "running",
    rewardsThisMonth: 18,
    version: 2,
  },
  {
    id: "wf-anniversary",
    name: "Work anniversary",
    trigger: "On joining date",
    status: "paused",
    owner: "Lakshmi Menon",
    lastRun: "30/09/2026 06:00",
    lastRunResult: "success",
    rewardsThisMonth: 0,
    version: 3,
  },
  {
    id: "wf-safety",
    name: "Safety suggestion reward",
    trigger: "When a suggestion is accepted",
    status: "draft",
    owner: "Vikram Rao",
    lastRun: "Never",
    lastRunResult: "none",
    rewardsThisMonth: 0,
    version: 1,
  },
];

export type StepKind = "trigger" | "filter" | "condition" | "reward" | "approval" | "notify";

export type WorkflowStep = {
  id: string;
  kind: StepKind;
  title: string;
  summary: string;
};

export const stepPalette: { kind: StepKind; title: string; description: string }[] = [
  { kind: "trigger", title: "Start when", description: "Schedule or data import" },
  { kind: "filter", title: "Choose people", description: "Department, team or location" },
  { kind: "condition", title: "Check a rule", description: "Compare a number to a target" },
  { kind: "approval", title: "Ask for approval", description: "Manager or HR signs off" },
  { kind: "reward", title: "Give points", description: "Fixed or per-unit amount" },
  { kind: "notify", title: "Send message", description: "App or WhatsApp" },
];

export const initialSteps: WorkflowStep[] = [
  { id: "s1", kind: "trigger", title: "Start when", summary: "Monthly sales are imported" },
  { id: "s2", kind: "filter", title: "Choose people", summary: "Sales department, active only" },
  { id: "s3", kind: "condition", title: "Check a rule", summary: "Sales ≥ 100% of target" },
  { id: "s4", kind: "approval", title: "Ask for approval", summary: "Reporting manager" },
  { id: "s5", kind: "reward", title: "Give points", summary: "" },
  {
    id: "s6",
    kind: "notify",
    title: "Send message",
    summary: "App + WhatsApp, Tamil fallback English",
  },
];

export type ValidationIssue = {
  code: string;
  stepId: string | null;
  severity: "error" | "warning";
  message: string;
  fix: string;
};

/** Mirrors the guide's V1–V14 validation rules against the current steps. */
export function validateWorkflow(steps: WorkflowStep[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const has = (kind: StepKind) => steps.some((step) => step.kind === kind);
  if (!has("trigger"))
    issues.push({
      code: "V1",
      stepId: null,
      severity: "error",
      message: "The workflow has no start step.",
      fix: "Add a “Start when” step at the top.",
    });
  if (steps[0] && steps[0].kind !== "trigger")
    issues.push({
      code: "V2",
      stepId: steps[0].id,
      severity: "error",
      message: "The first step must be “Start when”.",
      fix: "Move the start step to the top.",
    });
  if (!has("reward"))
    issues.push({
      code: "V3",
      stepId: null,
      severity: "error",
      message: "Nobody gets a reward yet.",
      fix: "Add a “Give points” step.",
    });
  steps
    .filter((step) => step.kind === "reward" && step.summary.trim() === "")
    .forEach((step) =>
      issues.push({
        code: "V5",
        stepId: step.id,
        severity: "error",
        message: "Points amount is missing.",
        fix: "Enter how many points each person gets.",
      }),
    );
  if (!has("approval"))
    issues.push({
      code: "V8",
      stepId: null,
      severity: "warning",
      message: "Rewards will go out without a person checking.",
      fix: "Add an “Ask for approval” step before rewards.",
    });
  if (!has("filter"))
    issues.push({
      code: "V10",
      stepId: null,
      severity: "warning",
      message: "This applies to everyone in the company.",
      fix: "Add a “Choose people” step to narrow it down.",
    });
  if (!has("notify"))
    issues.push({
      code: "V14",
      stepId: null,
      severity: "warning",
      message: "Winners will not be told.",
      fix: "Add a “Send message” step.",
    });
  return issues;
}

export const dryRunReport = {
  evaluated: 48,
  qualified: 11,
  totalPoints: 5500,
  budgetAfter: 18400,
  rows: employees
    .filter((employee) => employee.department === "Sales")
    .slice(0, 8)
    .map((employee, index) => ({
      name: employee.name,
      code: employee.code,
      value: 92 + index * 3,
      result: 92 + index * 3 >= 100 ? "Qualifies" : "Below target",
      points: 92 + index * 3 >= 100 ? 500 : 0,
    })),
};

export const workflowVersions = [
  {
    version: 7,
    date: "05/10/2026",
    author: "Vikram Rao",
    note: "Raised reward to 500 points",
    current: true,
  },
  {
    version: 6,
    date: "12/09/2026",
    author: "Vikram Rao",
    note: "Added WhatsApp message",
    current: false,
  },
  {
    version: 5,
    date: "02/08/2026",
    author: "Lakshmi Menon",
    note: "Added manager approval",
    current: false,
  },
  {
    version: 4,
    date: "15/07/2026",
    author: "Vikram Rao",
    note: "Target changed to 100%",
    current: false,
  },
];

export type WorkflowRun = {
  id: string;
  started: string;
  duration: string;
  result: "success" | "failed" | "running";
  evaluated: number;
  rewarded: number;
  error?: string;
};

export const workflowRuns: WorkflowRun[] = [
  {
    id: "run-118",
    started: "07/10/2026 18:30",
    duration: "42s",
    result: "failed",
    evaluated: 48,
    rewarded: 0,
    error: "The sales file is missing the “Target” column, so nobody could be checked.",
  },
  {
    id: "run-117",
    started: "07/09/2026 18:30",
    duration: "38s",
    result: "success",
    evaluated: 47,
    rewarded: 12,
  },
  {
    id: "run-116",
    started: "07/08/2026 18:30",
    duration: "35s",
    result: "success",
    evaluated: 46,
    rewarded: 9,
  },
  {
    id: "run-115",
    started: "07/07/2026 18:30",
    duration: "41s",
    result: "success",
    evaluated: 46,
    rewarded: 14,
  },
];

export const decisionTrace = {
  employee: employees[2]?.name ?? "Arjun Sharma",
  code: employees[2]?.code ?? "RKM0003",
  outcome: "Not rewarded",
  steps: [
    { title: "Start when", detail: "Sales file imported on 07/09/2026 18:30", passed: true },
    { title: "Choose people", detail: "Sales department · active", passed: true },
    { title: "Check a rule", detail: "Sales ₹4,62,000 vs target ₹5,00,000 → 92%", passed: false },
    { title: "Ask for approval", detail: "Skipped because the rule was not met", passed: null },
    { title: "Give points", detail: "Skipped", passed: null },
  ],
};

export type Approval = {
  id: string;
  employee: string;
  code: string;
  department: string;
  reason: string;
  source: string;
  points: number;
  rupees: number;
  submitted: string;
  evidence: boolean;
  flags: string[];
};

export const approvals: Approval[] = [
  {
    id: "ap-1",
    employee: employees[1]?.name ?? "",
    code: employees[1]?.code ?? "",
    department: "Quality",
    reason: "Zero defects across 4 Friday shifts",
    source: "Zero-defect shift",
    points: 400,
    rupees: 400,
    submitted: "08/10/2026",
    evidence: true,
    flags: [],
  },
  {
    id: "ap-2",
    employee: employees[6]?.name ?? "",
    code: employees[6]?.code ?? "",
    department: "Sales",
    reason: "Sales 128% of September target",
    source: "Sales target achievers",
    points: 1200,
    rupees: 1200,
    submitted: "08/10/2026",
    evidence: true,
    flags: ["Crosses ₹15,000 yearly gift limit — tax will apply"],
  },
  {
    id: "ap-3",
    employee: employees[3]?.name ?? "",
    code: employees[3]?.code ?? "",
    department: "Operations",
    reason: "Handled the boiler shutdown on night shift",
    source: "Manager nomination",
    points: 300,
    rupees: 300,
    submitted: "07/10/2026",
    evidence: false,
    flags: [],
  },
  {
    id: "ap-4",
    employee: employees[8]?.name ?? "",
    code: employees[8]?.code ?? "",
    department: "Manufacturing",
    reason: "Perfect attendance in September",
    source: "Perfect attendance bonus",
    points: 250,
    rupees: 250,
    submitted: "07/10/2026",
    evidence: true,
    flags: ["Manufacturing B pool is used up"],
  },
  {
    id: "ap-5",
    employee: employees[10]?.name ?? "",
    code: employees[10]?.code ?? "",
    department: "Sales",
    reason: "Brought in a new distributor in Salem",
    source: "Manager nomination",
    points: 500,
    rupees: 500,
    submitted: "06/10/2026",
    evidence: true,
    flags: [],
  },
  {
    id: "ap-6",
    employee: employees[13]?.name ?? "",
    code: employees[13]?.code ?? "",
    department: "Quality",
    reason: "Found the root cause for yarn breakage",
    source: "Peer shout-out",
    points: 200,
    rupees: 200,
    submitted: "06/10/2026",
    evidence: false,
    flags: [],
  },
];

export const rejectReasons = [
  "Does not meet the rule",
  "Duplicate request",
  "Evidence missing or unclear",
  "Already rewarded for this",
  "Other",
];

export const monthlyTrend = [
  { month: "May", recognitions: 210, points: 61000 },
  { month: "Jun", recognitions: 236, points: 66500 },
  { month: "Jul", recognitions: 251, points: 70200 },
  { month: "Aug", recognitions: 244, points: 69800 },
  { month: "Sep", recognitions: 289, points: 81400 },
  { month: "Oct", recognitions: 118, points: 34600 },
];

export const departmentCoverage = [
  { department: "Manufacturing", coverage: 71 },
  { department: "Quality", coverage: 84 },
  { department: "Sales", coverage: 66 },
  { department: "Operations", coverage: 58 },
];

export const teamMembers = employees
  .filter((employee) => employee.department === "Sales" && employee.status === "active")
  .slice(0, 8)
  .map((employee, index) => ({
    ...employee,
    monthPoints: [1450, 1200, 980, 760, 0, 520, 0, 340][index] ?? 0,
    lastRecognised:
      [
        "2 days ago",
        "5 days ago",
        "1 week ago",
        "2 weeks ago",
        "41 days ago",
        "3 weeks ago",
        "52 days ago",
        "4 weeks ago",
      ][index] ?? "",
  }));

export const aiSuggestionsByScreen: Record<string, string[]> = {
  owner: [
    "Which department had the lowest recognition last month?",
    "How much budget is left this quarter?",
    "Who has not been recognised in 30 days?",
  ],
  hr: [
    "Which data sources failed this week?",
    "Show employees near the ₹15,000 gift limit",
    "List approvals waiting more than 3 days",
  ],
  manager: [
    "Who in my team has not been recognised recently?",
    "How much is left in my wallet?",
    "Draft a thank-you note for Sales A",
  ],
  workflows: [
    "Why did the last sales run fail?",
    "Which workflows gave the most points?",
    "Suggest a workflow for safety suggestions",
  ],
  builder: [
    "Fix the validation problems",
    "Add a manager approval step",
    "Explain what this workflow does",
  ],
  approvals: [
    "Summarise today's approvals",
    "Which approvals cross the tax limit?",
    "Which items are queued for budget?",
  ],
  boards: [
    "Suggest a board for the Quality department",
    "Which board has the fewest active members?",
    "How do points flow from a board?",
  ],
  "board-config": [
    "Suggest a fair scorecard for this board",
    "Which behaviour rules should I turn on?",
    "Explain the comparison policies",
  ],
  connectors: [
    "Which data source failed this week?",
    "What changed in the last sales file?",
    "How do I connect Google Sheets?",
  ],
  budget: [
    "Which pools will run out first?",
    "How much budget is left this quarter?",
    "Summarise this month's ledger",
  ],
  people: [
    "Who has not been recognised in 30 days?",
    "Which team is the largest?",
    "Show employees near the ₹15,000 gift limit",
  ],
  "rewards-admin": [
    "Which rewards are redeemed most?",
    "Which orders need a retry or refund?",
    "Suggest a festival reward under ₹500",
  ],
  capture: [
    "Draft a form for shift quality logs",
    "Which entries are missing evidence?",
    "How does the WhatsApp form work?",
  ],
  analytics: [
    "Which department had the lowest recognition last month?",
    "What is our spend per person this year?",
    "Export the coverage table",
  ],
  payroll: [
    "Which rows will payroll reject?",
    "Who crossed the ₹15,000 gift limit this year?",
    "Explain the taxable column",
  ],
  fairness: ["Which teams are being missed?", "Explain the spread score", "Why is night shift lower?"],
  campaigns: ["Draft a Diwali campaign", "How much did Onam spend?"],
  compliance: ["Which data requests are overdue?", "Who is near the ₹15,000 limit?"],
  settings: ["Who can move budget?", "Which WhatsApp templates were rejected?"],
  default: ["What needs my attention today?", "How do I create a workflow?"],
};
