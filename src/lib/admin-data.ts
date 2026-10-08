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

/** Readable definition of each version, used by the version diff (checklist §7.1 Diff Viewer). */
const v4 = [
  "trigger: sales_file.imported (monthly)",
  "scope: department = Sales, status = active",
  "rule: sales.sales_vs_target >= 100%",
  "reward: 300 points each",
  "cap: 1 reward per person per month",
  "budget: Sales A — Vikram",
];
const v5 = [...v4.slice(0, 4), "approval: manager (Vikram Rao), 48 h SLA", ...v4.slice(4)];
const v6 = [...v5, "message: WhatsApp ranked_on_board (en, ta, hi)"];
const v7 = v6.map((line) =>
  line === "reward: 300 points each" ? "reward: 500 points each" : line,
);
export const versionDefinitions: Record<number, string[]> = { 4: v4, 5: v5, 6: v6, 7: v7 };

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

export { approvals, rejectReasons, type Approval } from "@/lib/approvals-data";

export const monthlyTrend = [
  { month: "May", recognitions: 210, points: 61000 },
  { month: "Jun", recognitions: 236, points: 66500 },
  { month: "Jul", recognitions: 251, points: 70200 },
  { month: "Aug", recognitions: 244, points: 69800 },
  { month: "Sep", recognitions: 289, points: 81400 },
  { month: "Oct", recognitions: 118, points: 34600 },
];

/** Same figures as the Fairness screen (last 90 days) so every screen agrees. */
export const departmentCoverage = [
  { department: "Manufacturing", coverage: 64 },
  { department: "Quality", coverage: 78 },
  { department: "Sales", coverage: 71 },
  { department: "Operations", coverage: 49 },
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
  fairness: [
    "Which teams are being missed?",
    "Explain the spread score",
    "Why is night shift lower?",
  ],
  campaigns: ["Draft a Diwali campaign", "How much did Onam spend?"],
  compliance: ["Which data requests are overdue?", "Who is near the ₹15,000 limit?"],
  settings: ["Who can move budget?", "Which WhatsApp templates were rejected?"],
  default: ["What needs my attention today?", "How do I create a workflow?"],
};
