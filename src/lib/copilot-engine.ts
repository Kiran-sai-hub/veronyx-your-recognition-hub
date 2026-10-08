import { decisionTrace } from "@/lib/admin-data";
import { explainOutcome, findEmployees, mentionsProtectedAttribute } from "@/lib/insights-evidence";
import { departmentCoverage, shiftCoverage } from "@/lib/phase3-data";
import {
  type WorkflowDraft,
  applyAutoFix,
  makeStep,
  workflowTemplates,
} from "@/lib/workflow-model";

/**
 * Scripted, deterministic copilot for the prototype (checklist §5). No model is called:
 * every answer is built from prototype records so nothing is invented. It proposes; people
 * decide — no reply here ever writes to the ledger, approves or sends a message.
 */
export type Proposal = {
  id: string;
  type: "Workflow";
  templateId: string;
  summary: string;
  assumptions: string[];
  questions: { question: string; default: boolean }[];
  draft: WorkflowDraft;
  repairs: string[];
  budget: { pool: string; remaining: number; monthlyCost: number };
  tax: string;
  permissions: string;
};

export type CopilotReply =
  | { kind: "text"; text: string; sources: string[]; confidence?: "high" | "medium" | "low" }
  | {
      kind: "table";
      text: string;
      columns: [string, string];
      rows: { label: string; value: number }[];
      metric: string;
      window: string;
      sources: string[];
      followUps: string[];
    }
  | {
      kind: "trace";
      text: string;
      employee: string;
      workflow: string;
      steps: { title: string; detail: string; passed: boolean | null }[];
      needed: string;
      sources: string[];
    }
  | { kind: "proposal"; text: string; proposal: Proposal }
  | {
      kind: "setup";
      text: string;
      industry: string;
      tracking: string[];
      workflows: { name: string; templateId: string }[];
      sources: string[];
    }
  | {
      kind: "refusal";
      reason: "protected" | "opinion" | "permission" | "unsupported";
      text: string;
      why: string;
      alternatives: string[];
      contact?: string;
    }
  | { kind: "rate_limit"; resetsAt: string }
  | { kind: "timeout" }
  | { kind: "error"; code: string };

export const QUERY_LIMIT = 20;

export const progressByKind: Record<string, string[]> = {
  proposal: [
    "Parsing intent…",
    "Grounding to metrics…",
    "Retrieving template…",
    "Composing workflow…",
    "Validating…",
    "Running dry-run…",
  ],
  trace: [
    "Identifying employee and workflow…",
    "Retrieving decision trace…",
    "Writing the explanation…",
  ],
  table: ["Parsing query…", "Querying metric snapshots…", "Preparing the answer…"],
  setup: ["Identifying industry…", "Matching blueprints…"],
  default: ["Reading your question…", "Checking what you can see…", "Writing the answer…"],
};

/** Kept for older callers. */
export const progressSteps = progressByKind["default"]!;

let proposalSeq = 788;

function buildProposal(q: string): Proposal {
  const isCsat = /csat|support|ticket/.test(q);
  const isFactory = /line|factory|output|units|garment/.test(q);
  const templateId = isCsat ? "csat-champion" : isFactory ? "line-star" : "sales-achievers";
  const template = workflowTemplates.find((t) => t.id === templateId)!;
  // First composition deliberately misses the End step so the repair loop is visible (§5.5).
  let draft = template.build();
  const firstPass = { ...draft, steps: draft.steps.filter((s) => s.kind !== "end") };
  draft = applyAutoFix(firstPass, "add_end");
  if (/top 3|top three/.test(q)) {
    draft = {
      ...draft,
      steps: draft.steps.map((s) =>
        s.kind === "rank" ? { ...s, config: { ...s.config, top_n: 3 } } : s,
      ),
    };
  }
  if (!draft.steps.some((s) => s.kind === "rank") && /top/.test(q)) {
    const at = draft.steps.findIndex((s) => s.kind === "approval");
    draft.steps.splice(at, 0, makeStep("rank", { metric: "sales.sales_vs_target", top_n: 3 }));
  }
  proposalSeq += 1;
  const pool = draft.budget.wallet;
  const summary = isCsat
    ? "Monthly, previous calendar month. Scope: Support department. Rank by average CSAT (Freshdesk), minimum 50 tickets. #1: ₹ 2,000, #2: ₹ 1,000. Owner approval before anything is paid."
    : isFactory
      ? "Weekly, last 7 days. Scope: Manufacturing, ranked per line. Only people with attendance ≥ 95% qualify. Top output per line gets ₹ 300 and a Line Star badge after department-head approval."
      : "Monthly, when the sales file is imported. Scope: Sales department. Everyone at or above 100% of target gets a ₹ 500 voucher after their manager approves.";
  return {
    id: `p-${proposalSeq}`,
    type: "Workflow",
    templateId,
    summary,
    assumptions: isCsat
      ? [
          "Using metric support.csat_avg (exists)",
          "Ticket count uses support.ticket_resolved",
          "Budget: Support FY26-27 pool (₹ 1,20,000 remaining)",
        ]
      : isFactory
        ? [
            "Using metric production.units (Production ERP webhook)",
            "Attendance from the attendance register sheet",
            "Budget: Manufacturing A — Selvi pool (₹ 21,500 remaining)",
          ]
        : [
            "Using metric sales.sales_vs_target (Zoho CRM)",
            "Target column comes from the monthly sales file",
            "Budget: Sales A — Vikram pool (₹ 18,700 remaining)",
          ],
    questions: isCsat
      ? [{ question: "Tie-break: use tickets resolved as the secondary metric?", default: true }]
      : [{ question: "Include people on notice period?", default: false }],
    draft,
    repairs: ["First draft had no End step (V2) → added End → re-validated ✓"],
    budget: {
      pool,
      remaining:
        pool === "Manufacturing A — Selvi" ? 21500 : pool === "Sales A — Vikram" ? 18700 : 120000,
      monthlyCost: isCsat ? 3000 : isFactory ? 1200 * 4 : 5500,
    },
    tax: isCsat
      ? "Vouchers are non-cash gifts. A. Sharma would reach ₹ 11,000 of the ₹ 15,000 yearly limit after 3 months."
      : "Non-cash gifts. Nobody crosses the ₹ 15,000 yearly limit in the dry-run.",
    permissions: "workflow.create / workflow.activate",
  };
}

export function respond(question: string, persona: string, queriesUsed = 0): CopilotReply {
  const q = question.toLowerCase();
  if (queriesUsed >= QUERY_LIMIT) return { kind: "rate_limit", resetsAt: "00:00 IST tonight" };
  if (q.includes("timeout") || q.includes("slow")) return { kind: "timeout" };
  if (q.includes("error") || q.includes("fail test")) return { kind: "error", code: "AI-502-7F3A" };

  if (mentionsProtectedAttribute(q)) {
    return {
      kind: "refusal",
      reason: "protected",
      text: "I can't create workflows or compare people based on gender, caste, religion, age, health or other personal traits.",
      why: "Rewards must depend on work, not on who someone is. This keeps the programme fair and within Indian employment law.",
      alternatives: ["Show coverage by shift", "Show coverage by department"],
    };
  }
  if (
    /\b(good|bad|lazy|best|worst) (employee|worker|person)\b/.test(q) ||
    q.includes("should i fire") ||
    q.includes("opinion")
  ) {
    return {
      kind: "refusal",
      reason: "opinion",
      text: "I can only answer with metrics, not opinions about people.",
      why: "Judgements about a person belong to their manager. I can show the facts from their boards and recognitions.",
      alternatives: [
        `Why didn't ${decisionTrace.employee} win?`,
        "Who hasn't been recognised in 60 days?",
      ],
    };
  }
  if (
    (q.includes("salary") || q.includes("payroll") || q.includes("budget")) &&
    persona === "manager"
  ) {
    return {
      kind: "refusal",
      reason: "permission",
      text: "You don't have permission to view company-wide payroll or budget figures.",
      why: "This needs the budget.view_all permission.",
      contact: "Lakshmi Menon (HR Admin)",
      alternatives: ["Show my team's remaining budget", "Show my team's coverage"],
    };
  }
  if (/(approve|pay|send|transfer).*(all|reward|points)|give .* points/.test(q)) {
    return {
      kind: "refusal",
      reason: "unsupported",
      text: "I can't approve rewards, pay anyone or send messages.",
      why: "Every payment needs a person's decision. I can prepare things for you to review.",
      alternatives: ["Summarise today's approvals", "Which approvals cross the tax limit?"],
    };
  }

  const wantsWorkflow =
    /\b(create|build|draft|make|set up|suggest)\b.*\b(workflow|programme|program)\b/.test(q) ||
    /\breward (the )?top\b/.test(q) ||
    q.includes("workflow for");
  if (wantsWorkflow && !q.includes("why")) {
    if (q.includes("collection")) {
      return {
        kind: "text",
        text: "Metric not found. I couldn't find a collections metric in your connected sources. Connect your collections sheet first, or create the metric in the field registry.",
        sources: ["Field registry"],
        confidence: "high",
      };
    }
    return {
      kind: "proposal",
      text: q.includes("csat")
        ? "I understand. Creating a monthly CSAT reward workflow. Found metrics support.csat_avg and support.ticket_resolved. Using template “CSAT Champion”, adapted to a monthly cadence."
        : "Here is a workflow proposal based on your request. Review it — nothing is saved until you confirm.",
      proposal: buildProposal(q),
    };
  }

  if (q.includes("why") && (q.includes("win") || q.includes("reward") || q.includes("award"))) {
    const words = q
      .replace(
        /why|didn't|did not|doesn't|get|got|the|rewarded|reward|win|award|line star|last week|\?/g,
        " ",
      )
      .trim()
      .split(/\s+/);
    const person = words.map((w) => findEmployees(w)[0]).find(Boolean);
    const trace = explainOutcome(person?.code ?? decisionTrace.code);
    if (!trace)
      return { kind: "text", text: "I don't know — I couldn't find that person.", sources: [] };
    const failed = trace.steps.find((s) => s.passed === false);
    return {
      kind: "trace",
      employee: trace.employee.name,
      workflow: "Sales target achievers · run 117 (September)",
      text: failed
        ? `${trace.employee.name} was not rewarded. They were stopped at step “${failed.title}”: ${failed.detail}.`
        : `${trace.employee.name} was rewarded — every step passed.`,
      steps: trace.steps.map(({ title, detail, passed }) => ({ title, detail, passed })),
      needed:
        failed?.title === "Check a rule"
          ? "Sales of at least ₹ 5,00,000 (100% of target)."
          : failed
            ? "Being in scope for this workflow."
            : "Nothing — they qualified.",
      sources: [
        `monthly_sales_september.xlsx · row for ${trace.employee.code}`,
        "Workflow “Sales target achievers” · run 117",
      ],
    };
  }

  if (q.includes("leaderboard")) {
    return {
      kind: "text",
      text: "The Sales A leaderboard ranks people by sales vs target for October so far. Pooja Kumar leads at 128% (14 deals). Rank is only shown to people in the top half; everyone else sees just their own number. Two people have no recognition in 30+ days — only their manager sees that.",
      sources: ["Metric sales.sales_vs_target · October 2026 (month to date) · Zoho CRM"],
      confidence: "high",
    };
  }

  const garment = /garment|factory|textile|how do i start|set ?up|get started/.test(q);
  if (garment) {
    return {
      kind: "setup",
      industry: "Garment / textile manufacturing",
      text: "Great! For garment manufacturing, I recommend starting with output, quality and attendance.",
      tracking: [
        "Units produced (per worker, per shift)",
        "Reject / defect rate",
        "Attendance",
        "Machine downtime (optional)",
      ],
      workflows: [
        { name: "Weekly Line Star (top output + attendance filter)", templateId: "line-star" },
        { name: "Quality Champion (zero defects)", templateId: "zero-defect" },
        { name: "Perfect Attendance (monthly bonus)", templateId: "perfect-attendance" },
      ],
      sources: [
        "Google Sheet (supervisor enters daily)",
        "WhatsApp entry (supervisor sends daily)",
        "CSV upload (weekly)",
      ],
    };
  }

  if (q.includes("shift")) {
    return {
      kind: "table",
      text: "Night shift is recognised least: 41% of people in the last 90 days.",
      columns: ["Shift", "Coverage %"],
      rows: shiftCoverage.map((r) => ({ label: r.group, value: r.coverage })),
      metric: "Recognition coverage",
      window: "Last 90 days",
      sources: ["Fairness · coverage by shift"],
      followUps: ["Why is night shift lower?", "Show coverage by department"],
    };
  }
  if (
    q.includes("coverage") ||
    q.includes("department") ||
    q.includes("missed") ||
    q.includes("lowest") ||
    q.includes("analytics")
  ) {
    return {
      kind: "table",
      text: "Operations has the lowest coverage at 49%.",
      columns: ["Department", "Coverage %"],
      rows: departmentCoverage.map((r) => ({ label: r.group, value: r.coverage })),
      metric: "Recognition coverage",
      window: "Last 90 days",
      sources: ["Analytics · AN-01 Recognition coverage"],
      followUps: ["Show coverage by shift", "Which teams have no workflow?"],
    };
  }
  if (q.includes("chennai") && q.includes("collection")) {
    return {
      kind: "text",
      text: "I don't know — collections data isn't connected yet.",
      sources: [],
    };
  }
  if (q.includes("approval")) {
    return {
      kind: "text",
      text: "6 approvals are waiting. 2 are close to or past their 48-hour SLA (Deepa Patel's nomination passed it 4 hours ago). 1 would take Pooja Kumar past the ₹ 15,000 yearly gift limit, and 1 is queued because the Manufacturing B pool is used up.",
      sources: ["Approvals queue · live"],
      confidence: "high",
    };
  }
  return {
    kind: "text",
    text: "I'm not sure I can answer that. I can create workflows, explain why someone did or didn't win, and answer questions about coverage, budget and approvals. Try one of the quick actions below.",
    sources: [],
    confidence: "low",
  };
}

export function replyToText(reply: CopilotReply | null): string {
  if (!reply) return "";
  switch (reply.kind) {
    case "timeout":
      return "This took too long.";
    case "error":
      return `Something went wrong (error ${reply.code}).`;
    case "rate_limit":
      return `Query limit reached; resets ${reply.resetsAt}.`;
    case "proposal":
      return `${reply.text}\n[Proposal ${reply.proposal.id}] ${reply.proposal.summary}`;
    case "table":
      return `${reply.text}\n${reply.rows.map((r) => `${r.label}: ${r.value}`).join("\n")}`;
    default:
      return reply.text;
  }
}

export function transcriptToText(
  title: string,
  scope: string,
  messages: { role: "user" | "assistant"; text: string; at?: string }[],
): string {
  return [
    `Veronyx Copilot — ${title}`,
    `Scope: ${scope}`,
    "",
    ...messages.map(
      (m) => `${m.at ? `[${m.at}] ` : ""}${m.role === "user" ? "You" : "Copilot"}: ${m.text}`,
    ),
  ].join("\n");
}
