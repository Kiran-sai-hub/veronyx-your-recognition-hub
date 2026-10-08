/**
 * Workflow definitions for the builder (checklist §4.6), validation V1–V14 (§5.3 E) and the
 * dry-run simulator (§4.7). Pure data + functions so a real engine can replace them.
 */

export type StepKind =
  | "filter"
  | "aggregate"
  | "rank"
  | "threshold"
  | "branch"
  | "approval"
  | "reward"
  | "recognise"
  | "badge"
  | "notify"
  | "wait"
  | "set_var"
  | "end";

export type FieldDef =
  | { key: string; label: string; type: "text"; placeholder?: string }
  | { key: string; label: string; type: "number"; suffix?: string }
  | { key: string; label: string; type: "select"; options: string[] }
  | { key: string; label: string; type: "toggle" };

export type StepValue = string | number | boolean;

export type Step = {
  id: string;
  kind: StepKind;
  label: string;
  config: Record<string, StepValue>;
};

export type TriggerType = "event" | "schedule" | "manual";
export type Trigger = { id: string; type: TriggerType; config: Record<string, StepValue> };

export type Condition = { field: string; operator: string; value: string };

export type WorkflowDraft = {
  id: string;
  name: string;
  description: string;
  owner: string;
  templateRef: string | null;
  timezone: string;
  tags: string[];
  scope: {
    departments: string[];
    teams: string[];
    locations: string[];
    filters: Condition[];
    exclude: string[];
    statuses: string[];
    minTenureDays: number;
    partition: "none" | "team" | "department" | "location";
  };
  triggers: Trigger[];
  steps: Step[];
  budget: {
    wallet: string;
    currency: "COINS" | "INR";
    perRunMax: number;
    perPeriodMax: number;
    period: "month" | "quarter" | "fiscal_year";
    onInsufficient: "hard_stop" | "partial_by_rank" | "queue_for_approval";
    reserveOnApproval: boolean;
  };
  policies: {
    perEmployeeCaps: { amount: number; per: "month" | "quarter" | "fiscal_year" }[];
    cooldownDays: number;
    cooldownAppliesTo: "same_workflow" | "all_workflows";
    taxGuard: { track: boolean; onCross: "warn" | "require_approval" | "block" };
    unmatched: "block_run" | "exclude_and_warn" | "proceed";
    tieBreak: "secondary_metric" | "earliest_to_reach" | "split_reward";
    visibility: "public_full" | "public_top_n" | "team_only" | "private";
    selfNomination: boolean;
    managerConflict: "skip_level_approval" | "hr_approval" | "allow";
  };
  version: number;
};

export const stepCatalog: Record<
  StepKind,
  { label: string; description: string; fields: FieldDef[]; defaults: Record<string, StepValue> }
> = {
  filter: {
    label: "Filter",
    description: "Keep people who meet a condition",
    fields: [
      { key: "field", label: "Field or metric", type: "select", options: [] },
      {
        key: "operator",
        label: "Operator",
        type: "select",
        options: ["≥", ">", "=", "≠", "<", "≤", "between"],
      },
      { key: "value", label: "Value", type: "text", placeholder: "e.g. 95" },
    ],
    defaults: { field: "attendance.attendance_pct", operator: "≥", value: "95" },
  },
  aggregate: {
    label: "Aggregate",
    description: "Sum, average or count a metric",
    fields: [
      { key: "metric", label: "Metric", type: "select", options: [] },
      {
        key: "function",
        label: "Function",
        type: "select",
        options: ["sum", "avg", "count", "max", "min"],
      },
      {
        key: "window",
        label: "Window",
        type: "select",
        options: ["previous calendar month", "last 7 days", "previous quarter", "current shift"],
      },
      { key: "min_sample_size", label: "Minimum sample size", type: "number" },
    ],
    defaults: {
      metric: "sales.sales_vs_target",
      function: "sum",
      window: "previous calendar month",
      min_sample_size: 0,
    },
  },
  rank: {
    label: "Rank",
    description: "Order people and take the top N",
    fields: [
      { key: "metric", label: "By metric", type: "select", options: [] },
      { key: "order", label: "Order", type: "select", options: ["highest first", "lowest first"] },
      { key: "top_n", label: "Top N", type: "number" },
      {
        key: "partition",
        label: "Partition",
        type: "select",
        options: ["none", "team", "department", "location"],
      },
      { key: "min_value", label: "Minimum value", type: "number" },
    ],
    defaults: {
      metric: "sales.sales_vs_target",
      order: "highest first",
      top_n: 3,
      partition: "none",
      min_value: 0,
    },
  },
  threshold: {
    label: "Threshold",
    description: "Everyone above a target qualifies",
    fields: [
      { key: "metric", label: "Metric", type: "select", options: [] },
      { key: "operator", label: "Operator", type: "select", options: ["≥", ">", "=", "<", "≤"] },
      { key: "value", label: "Target", type: "number" },
    ],
    defaults: { metric: "sales.sales_vs_target", operator: "≥", value: 100 },
  },
  branch: {
    label: "Branch (if / else)",
    description: "Send people down different paths",
    fields: [
      { key: "condition", label: "If", type: "text", placeholder: "rank = 1" },
      { key: "then", label: "Then", type: "text", placeholder: "₹ 2,000 reward" },
      { key: "else", label: "Else", type: "text", placeholder: "₹ 1,000 reward" },
    ],
    defaults: { condition: "rank = 1", then: "Reward ₹ 2,000", else: "Reward ₹ 1,000" },
  },
  approval: {
    label: "Approval",
    description: "A person signs off first",
    fields: [
      {
        key: "approvers",
        label: "Approvers",
        type: "select",
        options: ["Reporting manager", "Department head", "HR Admin", "Owner"],
      },
      { key: "timeout_hours", label: "Timeout", type: "number", suffix: "hours" },
      {
        key: "on_timeout",
        label: "On timeout",
        type: "select",
        options: ["escalate to HR", "escalate to owner", "auto-reject", "remind again"],
      },
      { key: "allow_modify", label: "Approver may modify amount", type: "toggle" },
    ],
    defaults: {
      approvers: "Reporting manager",
      timeout_hours: 48,
      on_timeout: "escalate to HR",
      allow_modify: true,
    },
  },
  reward: {
    label: "Reward",
    description: "Give points, a voucher or cash",
    fields: [
      {
        key: "recipients",
        label: "Recipients",
        type: "select",
        options: ["everyone who reached this step", "rank 1 only", "top N"],
      },
      { key: "amount", label: "Amount", type: "number" },
      { key: "currency", label: "Currency", type: "select", options: ["COINS", "INR"] },
      {
        key: "reward_kind",
        label: "Reward kind",
        type: "select",
        options: ["points", "voucher_direct", "payroll_cash", "experience"],
      },
    ],
    defaults: {
      recipients: "everyone who reached this step",
      amount: 0,
      currency: "COINS",
      reward_kind: "points",
    },
  },
  recognise: {
    label: "Recognise",
    description: "Public thank-you without money",
    fields: [
      { key: "title", label: "Recognition title", type: "text", placeholder: "Line Star" },
      {
        key: "visibility",
        label: "Who sees it",
        type: "select",
        options: ["team", "company", "private"],
      },
    ],
    defaults: { title: "Star performer", visibility: "team" },
  },
  badge: {
    label: "Badge",
    description: "Award a badge or milestone",
    fields: [
      {
        key: "badge",
        label: "Badge",
        type: "select",
        options: [
          "Sales Star",
          "Quality Champion",
          "Perfect Attendance",
          "Line Star",
          "CSAT Champion",
        ],
      },
    ],
    defaults: { badge: "Sales Star" },
  },
  notify: {
    label: "Notify",
    description: "Send a message",
    fields: [
      {
        key: "to",
        label: "To",
        type: "select",
        options: ["winners", "winners' managers", "whole team", "HR"],
      },
      {
        key: "template_key",
        label: "Template",
        type: "select",
        options: ["reward_credited", "ranked_on_board", "approval_needed", "monthly_summary"],
      },
      {
        key: "channels",
        label: "Channels",
        type: "select",
        options: ["WhatsApp + in-app", "in-app only", "email + in-app", "WhatsApp only"],
      },
      { key: "quiet_hours", label: "Respect quiet hours (21:00–08:00)", type: "toggle" },
    ],
    defaults: {
      to: "winners",
      template_key: "reward_credited",
      channels: "WhatsApp + in-app",
      quiet_hours: true,
    },
  },
  wait: {
    label: "Wait",
    description: "Pause before the next step",
    fields: [{ key: "hours", label: "Wait for", type: "number", suffix: "hours" }],
    defaults: { hours: 24 },
  },
  set_var: {
    label: "Set variable",
    description: "Store a value for later steps",
    fields: [
      { key: "name", label: "Variable", type: "text", placeholder: "bonus_amount" },
      { key: "value", label: "Value or formula", type: "text", placeholder: "units * 2" },
    ],
    defaults: { name: "bonus_amount", value: "units * 2" },
  },
  end: { label: "End", description: "Finish the workflow", fields: [], defaults: {} },
};

export const stepOrder: StepKind[] = [
  "filter",
  "aggregate",
  "rank",
  "threshold",
  "branch",
  "approval",
  "reward",
  "recognise",
  "badge",
  "notify",
  "wait",
  "set_var",
  "end",
];

/** Metrics the field registry knows about (V3). `connected` false = no source yet. */
export const metricCatalog = [
  {
    key: "sales.sales_vs_target",
    label: "Sales vs target (%)",
    source: "Zoho CRM",
    connected: true,
    average: false,
  },
  {
    key: "sales.deals_closed",
    label: "Deals closed",
    source: "Zoho CRM",
    connected: true,
    average: false,
  },
  {
    key: "support.csat_avg",
    label: "Average CSAT",
    source: "Freshdesk",
    connected: true,
    average: true,
  },
  {
    key: "support.ticket_resolved",
    label: "Tickets resolved",
    source: "Freshdesk",
    connected: true,
    average: false,
  },
  {
    key: "attendance.attendance_pct",
    label: "Attendance (%)",
    source: "Attendance register",
    connected: true,
    average: false,
  },
  {
    key: "production.units",
    label: "Units produced",
    source: "Production ERP",
    connected: true,
    average: false,
  },
  {
    key: "quality.defects",
    label: "Defects found",
    source: "Quality log",
    connected: true,
    average: false,
  },
  {
    key: "quality.reject_rate",
    label: "Reject rate (%)",
    source: "Quality log",
    connected: true,
    average: true,
  },
  {
    key: "collections.collection_efficiency",
    label: "Collection efficiency (%)",
    source: "Not connected",
    connected: false,
    average: true,
  },
];

export const walletPools = [
  { id: "Sales A — Vikram", remaining: 18700 },
  { id: "Support FY26-27", remaining: 120000 },
  { id: "Quality", remaining: 48800 },
  { id: "Manufacturing A — Selvi", remaining: 21500 },
  { id: "Manufacturing B — Karthik", remaining: 0 },
  { id: "Radha Krishna Mills (organisation)", remaining: 218600 },
];

const PROTECTED_RE = /\b(gender|religion|caste|age|marital\w*|pregnan\w*|disab\w*|health)\b/i;

export type CheckStatus = "pass" | "warn" | "error";
export type Check = {
  code: string;
  title: string;
  status: CheckStatus;
  detail: string;
  fix?: string;
  autoFix?: AutoFix;
};
export type AutoFix =
  | "add_end"
  | "set_sample"
  | "add_approval"
  | "bind_wallet"
  | "set_amount"
  | "add_trigger"
  | "set_tax";

let seq = 0;
export function newId(prefix = "s") {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq}`;
}

export function makeStep(kind: StepKind, config: Record<string, StepValue> = {}): Step {
  return {
    id: newId(),
    kind,
    label: stepCatalog[kind].label,
    config: { ...stepCatalog[kind].defaults, ...config },
  };
}

function metricsUsed(d: WorkflowDraft): string[] {
  return d.steps.flatMap((s) => {
    const m = s.config["metric"] ?? (s.kind === "filter" ? s.config["field"] : undefined);
    return typeof m === "string" ? [m] : [];
  });
}

/** Rules V1–V14. Errors block saving & activation; warnings don't. */
export function validateDraft(d: WorkflowDraft): Check[] {
  const has = (k: StepKind) => d.steps.some((s) => s.kind === k);
  const idx = (k: StepKind) => d.steps.findIndex((s) => s.kind === k);
  const rewards = d.steps.filter((s) => s.kind === "reward");
  const metrics = metricsUsed(d);
  const unknown = metrics.filter((m) => !metricCatalog.some((c) => c.key === m));
  const disconnected = metrics.filter(
    (m) => metricCatalog.find((c) => c.key === m)?.connected === false,
  );
  const lastIsEnd = d.steps.at(-1)?.kind === "end";
  const endCount = d.steps.filter((s) => s.kind === "end").length;
  const avgMetricWithoutSample = d.steps.some(
    (s) =>
      (s.kind === "aggregate" || s.kind === "rank") &&
      metricCatalog.find((c) => c.key === s.config["metric"])?.average &&
      !(Number(d.steps.find((x) => x.kind === "aggregate")?.config["min_sample_size"] ?? 0) > 0),
  );
  const expected = estimatedCostPerRun(d);
  const pool = walletPools.find((p) => p.id === d.budget.wallet);
  // Only what people are filtered on matters — not labels like "Reporting manager".
  const filterFields = [
    ...d.scope.filters.map((f) => f.field),
    ...d.steps.filter((s) => s.kind === "filter").map((s) => String(s.config["field"] ?? "")),
  ];
  const usesProtected = filterFields.some((f) => PROTECTED_RE.test(f));
  const scopeEmpty =
    d.scope.departments.length === 0 &&
    d.scope.teams.length === 0 &&
    d.scope.locations.length === 0;

  const c = (
    code: string,
    title: string,
    ok: boolean,
    bad: Omit<Check, "code" | "title">,
    passDetail: string,
  ): Check => (ok ? { code, title, status: "pass", detail: passDetail } : { code, title, ...bad });

  return [
    c(
      "V1",
      "Schema valid",
      d.name.trim().length > 0 && d.steps.length > 0,
      {
        status: "error",
        detail: d.name.trim() ? "The workflow has no steps." : "The workflow needs a name.",
        fix: "Give it a name and add at least one step.",
      },
      "Name, steps and settings are complete.",
    ),
    c(
      "V2",
      "Step graph acyclic and ends cleanly",
      lastIsEnd && endCount === 1,
      {
        status: "error",
        detail:
          endCount > 1
            ? "There is more than one End step."
            : "The last step must be End so every path finishes.",
        fix: "Add an End step at the bottom.",
        autoFix: "add_end",
      },
      "Every path reaches a single End step; no loops.",
    ),
    c(
      "V3",
      "All metrics exist",
      unknown.length === 0 && disconnected.length === 0,
      {
        status: "error",
        detail: unknown.length
          ? `Metric not found: ${unknown.join(", ")}.`
          : `Metric not found in connected sources: ${disconnected.join(", ")}. Connect the source first or create the metric.`,
        fix: "Pick a metric from the field registry, or connect the source in Connectors & Data.",
      },
      metrics.length
        ? `${[...new Set(metrics)].length} metric(s) found in the field registry.`
        : "No metrics used.",
    ),
    c(
      "V4",
      "Trigger configured",
      d.triggers.length > 0,
      {
        status: "error",
        detail: "Nothing starts this workflow.",
        fix: "Add an event, schedule or manual trigger.",
        autoFix: "add_trigger",
      },
      `${d.triggers.length} trigger(s): ${d.triggers.map((t) => t.type).join(", ")}.`,
    ),
    c(
      "V5",
      "Approval step present",
      rewards.length === 0 || (has("approval") && idx("approval") < idx("reward")),
      {
        status: "warn",
        detail: "Rewards would go out without a person checking.",
        fix: "Add an Approval step before Reward.",
        autoFix: "add_approval",
      },
      rewards.length
        ? "A person approves before anything is paid."
        : "No rewards in this workflow.",
    ),
    c(
      "V6",
      "Reward amount set",
      rewards.every((r) => Number(r.config["amount"]) > 0),
      {
        status: "error",
        detail: "A Reward step has no amount.",
        fix: "Enter how much each person gets.",
        autoFix: "set_amount",
      },
      rewards.length
        ? `Amounts: ${rewards.map((r) => `${r.config["amount"]} ${r.config["currency"]}`).join(", ")}.`
        : "No reward amounts needed.",
    ),
    c(
      "V7",
      "Budget bound to a wallet",
      rewards.length === 0 || Boolean(pool),
      {
        status: "error",
        detail: "Rewards have no budget pool to draw from.",
        fix: "Choose a wallet in Budget.",
        autoFix: "bind_wallet",
      },
      pool ? `Draws from ${pool.id}.` : "No budget needed.",
    ),
    c(
      "V8",
      "Budget sufficient",
      !pool || rewards.length === 0 || pool.remaining >= expected,
      {
        status: "warn",
        detail: `Expected ₹ ${expected.toLocaleString("en-IN")} per run but ${pool?.id ?? "the pool"} has ₹ ${(pool?.remaining ?? 0).toLocaleString("en-IN")} left. Extra rewards will be ${d.budget.onInsufficient.replace(/_/g, " ")}.`,
        fix: "Top up the pool or lower the amount.",
      },
      pool
        ? `₹ ${pool.remaining.toLocaleString("en-IN")} left covers about ₹ ${expected.toLocaleString("en-IN")} per run.`
        : "No budget needed.",
    ),
    c(
      "V9",
      "Scope matches people",
      !scopeEmpty,
      {
        status: "warn",
        detail: "No department, team or location chosen — this applies to the whole company.",
        fix: "Narrow the scope in Scope settings.",
      },
      `Applies to ${[...d.scope.departments, ...d.scope.teams, ...d.scope.locations].join(", ")}.`,
    ),
    c(
      "V10",
      "Winners are told",
      !rewards.length || has("notify"),
      {
        status: "warn",
        detail: "Winners will not get a message.",
        fix: "Add a Notify step after Reward.",
      },
      "Winners get a message.",
    ),
    c(
      "V11",
      "Tax guard on for non-cash rewards",
      !rewards.length || d.policies.taxGuard.track,
      {
        status: "warn",
        detail:
          "Non-cash gifts above ₹ 15,000 a year become taxable, but they are not being tracked.",
        fix: "Turn on the tax guard in Policies.",
        autoFix: "set_tax",
      },
      `Tracks the ₹ 15,000 yearly gift limit (${d.policies.taxGuard.onCross.replace(/_/g, " ")} on cross).`,
    ),
    c(
      "V12",
      "Unmatched records handled",
      d.policies.unmatched !== "proceed",
      {
        status: "warn",
        detail: "Records that can't be matched to a person will be silently dropped.",
        fix: "Choose “exclude and warn” or “block run”.",
      },
      `Unmatched records: ${d.policies.unmatched.replace(/_/g, " ")}.`,
    ),
    c(
      "V13",
      "No protected attributes",
      !usesProtected,
      {
        status: "error",
        detail:
          "Filters use a protected attribute (gender, religion, caste, age, health…). This isn't allowed.",
        fix: "Use performance metrics, team, location or tenure instead.",
      },
      "Only performance metrics, team, location and tenure are used.",
    ),
    c(
      "V14",
      "Minimum sample size for averages",
      !avgMetricWithoutSample,
      {
        status: "warn",
        detail:
          "An average metric has no minimum sample size, so 2 great ratings could beat 200 good ones.",
        fix: "Set min_sample_size to 25 (recommended).",
        autoFix: "set_sample",
      },
      "Averages need enough data points to count.",
    ),
  ];
}

export function applyAutoFix(d: WorkflowDraft, fix: AutoFix): WorkflowDraft {
  const steps = [...d.steps];
  switch (fix) {
    case "add_end":
      return { ...d, steps: [...steps.filter((s) => s.kind !== "end"), makeStep("end")] };
    case "set_sample": {
      const agg = steps.findIndex((s) => s.kind === "aggregate");
      if (agg >= 0)
        steps[agg] = { ...steps[agg]!, config: { ...steps[agg]!.config, min_sample_size: 25 } };
      else
        steps.unshift(
          makeStep("aggregate", {
            metric: metricsUsed(d)[0] ?? "support.csat_avg",
            function: "avg",
            min_sample_size: 25,
          }),
        );
      return { ...d, steps };
    }
    case "add_approval": {
      const at = steps.findIndex((s) => s.kind === "reward");
      steps.splice(at < 0 ? steps.length : at, 0, makeStep("approval"));
      return { ...d, steps };
    }
    case "bind_wallet":
      return { ...d, budget: { ...d.budget, wallet: "Radha Krishna Mills (organisation)" } };
    case "set_amount":
      return {
        ...d,
        steps: steps.map((s) =>
          s.kind === "reward" && !(Number(s.config["amount"]) > 0)
            ? { ...s, config: { ...s.config, amount: 500 } }
            : s,
        ),
      };
    case "add_trigger":
      return {
        ...d,
        triggers: [
          ...d.triggers,
          {
            id: newId("t"),
            type: "schedule",
            config: {
              cron: "Monthly on the 1st at 06:00",
              window: "previous calendar month",
              late_data_grace_hours: 24,
            },
          },
        ],
      };
    case "set_tax":
      return {
        ...d,
        policies: { ...d.policies, taxGuard: { ...d.policies.taxGuard, track: true } },
      };
  }
}

export function hasErrors(checks: Check[]) {
  return checks.some((c) => c.status === "error");
}

function rewardAmounts(d: WorkflowDraft): number[] {
  return d.steps.filter((s) => s.kind === "reward").map((s) => Number(s.config["amount"]) || 0);
}

export function estimatedCostPerRun(d: WorkflowDraft): number {
  const rank = d.steps.find((s) => s.kind === "rank");
  const branch = d.steps.find((s) => s.kind === "branch");
  const amounts = rewardAmounts(d);
  if (branch) {
    const nums = [branch.config["then"], branch.config["else"]].map(
      (v) => Number(String(v).replace(/[^\d]/g, "")) || 0,
    );
    return nums.reduce((a, b) => a + b, 0);
  }
  const winners = rank ? Number(rank.config["top_n"]) || 1 : 6;
  return (amounts[0] ?? 0) * winners;
}

/* ---------------- Dry-run ---------------- */

export type DryRunPeriod = {
  period: string;
  winners: { name: string; value: string; rank: number }[];
  cost: number;
  notes: string;
  failed?: string;
};

export type DryRunResult = {
  periods: DryRunPeriod[];
  totalCost: number;
  budgetOk: boolean;
  budgetRemaining: number;
  fairnessNotes: string[];
  distribution: { group: string; winners: number }[];
  unmatched: { count: number; examples: string[] };
  capHits: string[];
  diff: { added: string[]; changed: string[]; impact: string } | null;
};

const monthLabels = ["2026-09", "2026-08", "2026-07", "2026-06", "2026-05", "2026-04"];

/** Deterministic simulation over historical data. Throws a readable message when it can't run. */
export function simulateDryRun(
  d: WorkflowDraft,
  periods: number,
  previous: WorkflowDraft | null,
): DryRunResult {
  const metrics = metricsUsed(d);
  if (metrics.length === 0)
    throw new Error(
      "No historical data for dry-run. Add a rank, threshold or filter on a metric first.",
    );
  if (metrics.some((m) => metricCatalog.find((c) => c.key === m)?.connected === false))
    throw new Error("No historical data for dry-run. Connect a source first.");
  const metric = metrics[0]!;
  const isCsat = metric.startsWith("support.");
  const isProduction =
    metric.startsWith("production.") ||
    metric.startsWith("attendance.") ||
    metric.startsWith("quality.");
  const pool = walletPools.find((p) => p.id === d.budget.wallet);
  const amounts = rewardAmounts(d);
  const branch = d.steps.find((s) => s.kind === "branch");
  const rank = d.steps.find((s) => s.kind === "rank");
  const topN = rank ? Number(rank.config["top_n"]) || 1 : 3;
  const cap = d.policies.perEmployeeCaps[0]?.amount ?? Infinity;

  const pools = isCsat
    ? [
        ["A. Sharma", "4.82", "R. Iyer", "4.79"],
        ["A. Sharma", "4.91", "P. Kumar", "4.75"],
        ["A. Sharma", "4.88"],
      ]
    : isProduction
      ? [
          ["Suresh Babu", "412 units", "Divya Nair", "398 units", "Karthik Gowda", "377 units"],
          ["Divya Nair", "405 units", "Imran Khan", "392 units", "Suresh Babu", "380 units"],
          ["Karthik Gowda", "401 units", "Divya Nair", "399 units"],
        ]
      : [
          ["Pooja Kumar", "128%", "Priya Nair", "112%", "Fatima Rao", "104%"],
          ["Pooja Kumar", "121%", "Fatima Rao", "109%", "Deepa Joshi", "101%"],
          ["Priya Nair", "117%", "Pooja Kumar", "115%"],
        ];

  const result: DryRunPeriod[] = Array.from({ length: periods }, (_, i) => {
    const base = pools[i % pools.length]!;
    const pairs: { name: string; value: string; rank: number }[] = [];
    for (let j = 0; j < base.length && pairs.length < topN; j += 2)
      pairs.push({ name: base[j]!, value: base[j + 1]!, rank: pairs.length + 1 });
    const cost = branch
      ? pairs.reduce(
          (sum, p) =>
            sum +
            (p.rank === 1
              ? Number(String(branch.config["then"]).replace(/\D/g, ""))
              : Number(String(branch.config["else"]).replace(/\D/g, ""))),
          0,
        )
      : pairs.length * (amounts[0] ?? 0);
    return {
      period: monthLabels[i] ?? `Period ${i + 1}`,
      winners: pairs,
      cost,
      notes: pairs.length < topN ? `Only ${pairs.length} qualified` : "—",
    };
  });

  const totalCost = result.reduce((s, p) => s + p.cost, 0);
  const remaining = pool?.remaining ?? 0;
  const winnerCounts = new Map<string, number>();
  result.forEach((p) =>
    p.winners.forEach((w) => winnerCounts.set(w.name, (winnerCounts.get(w.name) ?? 0) + 1)),
  );
  const repeat = [...winnerCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  let diff: DryRunResult["diff"] = null;
  if (previous) {
    const added: string[] = [];
    const changed: string[] = [];
    const prevAmounts = rewardAmounts(previous);
    if (prevAmounts[0] !== amounts[0])
      changed.push(
        `Reward amount ₹ ${(prevAmounts[0] ?? 0).toLocaleString("en-IN")} → ₹ ${(amounts[0] ?? 0).toLocaleString("en-IN")}`,
      );
    const prevKinds = previous.steps.map((s) => s.kind);
    d.steps
      .filter((s) => !prevKinds.includes(s.kind))
      .forEach((s) => added.push(`${s.label} step`));
    const sample = d.steps.find((s) => s.kind === "aggregate")?.config["min_sample_size"];
    const prevSample = previous.steps.find((s) => s.kind === "aggregate")?.config[
      "min_sample_size"
    ];
    if (sample !== prevSample && sample) added.push(`min_sample_size = ${sample}`);
    const delta = ((amounts[0] ?? 0) - (prevAmounts[0] ?? 0)) * topN;
    diff = {
      added,
      changed,
      impact:
        delta === 0
          ? "No change in monthly cost"
          : `${delta > 0 ? "+" : "−"}₹ ${Math.abs(delta).toLocaleString("en-IN")}/month cost`,
    };
  }

  return {
    periods: result,
    totalCost,
    budgetOk: remaining >= totalCost,
    budgetRemaining: remaining,
    fairnessNotes: isCsat
      ? ["Winners came from 2 of 3 shifts", "Night shift never qualified (fewer ratings)"]
      : isProduction
        ? ["Winners came from 2 of 3 lines", "Line C had no winner in 3 periods — check data entry"]
        : [
            `Winners came from 1 of 4 sales teams (Sales A)`,
            repeat && repeat[1] > 1
              ? `${repeat[0]} won ${repeat[1]} of ${periods} periods`
              : "No one won every period",
          ],
    distribution: isCsat
      ? [
          { group: "Day shift", winners: 3 },
          { group: "Evening shift", winners: 2 },
          { group: "Night shift", winners: 0 },
        ]
      : isProduction
        ? [
            { group: "Line A", winners: 4 },
            { group: "Line B", winners: 4 },
            { group: "Line C", winners: 0 },
          ]
        : [
            { group: "Sales A", winners: result.reduce((s, p) => s + p.winners.length, 0) },
            { group: "Sales B", winners: 0 },
            { group: "Sales C", winners: 0 },
            { group: "Sales D", winners: 0 },
          ],
    unmatched: isCsat
      ? {
          count: 2,
          examples: [
            "Freshdesk agent “agent.x@support” not mapped",
            "Freshdesk agent “night.desk2” not mapped",
          ],
        }
      : { count: 1, examples: ["Zoho CRM user “sales.temp” not mapped"] },
    capHits:
      cap !== Infinity && (amounts[0] ?? 0) * 2 > cap
        ? [
            `${result[0]?.winners[0]?.name ?? "Top winner"} hit the per-employee cap in ${result[0]?.period}: would have received ₹ ${((amounts[0] ?? 0) * 2).toLocaleString("en-IN")}, capped at ₹ ${cap.toLocaleString("en-IN")}`,
          ]
        : [],
    diff,
  };
}

/* ---------------- Templates & seeded workflows ---------------- */

function baseDraft(
  partial: Partial<WorkflowDraft> & Pick<WorkflowDraft, "id" | "name">,
): WorkflowDraft {
  return {
    description: "",
    owner: "Lakshmi Menon",
    templateRef: null,
    timezone: "Asia/Kolkata",
    tags: [],
    scope: {
      departments: [],
      teams: [],
      locations: [],
      filters: [],
      exclude: [],
      statuses: ["active"],
      minTenureDays: 30,
      partition: "none",
    },
    triggers: [],
    steps: [],
    budget: {
      wallet: "",
      currency: "COINS",
      perRunMax: 10000,
      perPeriodMax: 30000,
      period: "month",
      onInsufficient: "queue_for_approval",
      reserveOnApproval: true,
    },
    policies: {
      perEmployeeCaps: [{ amount: 5000, per: "month" }],
      cooldownDays: 0,
      cooldownAppliesTo: "same_workflow",
      taxGuard: { track: true, onCross: "require_approval" },
      unmatched: "exclude_and_warn",
      tieBreak: "secondary_metric",
      visibility: "team_only",
      selfNomination: false,
      managerConflict: "skip_level_approval",
    },
    version: 0,
    ...partial,
  };
}

const schedule = (cron: string, window = "previous calendar month"): Trigger => ({
  id: newId("t"),
  type: "schedule",
  config: { cron, window, late_data_grace_hours: 24 },
});

export type WorkflowTemplate = {
  id: string;
  name: string;
  industry: string;
  description: string;
  build: () => WorkflowDraft;
};

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "sales-achievers",
    name: "Monthly sales target achievers",
    industry: "Sales",
    description: "Everyone at or above 100% of target gets points, with manager approval.",
    build: () =>
      baseDraft({
        id: "new",
        name: "Sales target achievers",
        templateRef: "sales-achievers",
        tags: ["sales", "monthly"],
        scope: { ...baseDraft({ id: "x", name: "x" }).scope, departments: ["Sales"] },
        triggers: [
          {
            id: newId("t"),
            type: "event",
            config: {
              event_type: "sales_file.imported",
              filter: "month = previous",
              debounce_minutes: 30,
            },
          },
        ],
        steps: [
          makeStep("aggregate", { metric: "sales.sales_vs_target", function: "sum" }),
          makeStep("threshold", { metric: "sales.sales_vs_target", operator: "≥", value: 100 }),
          makeStep("approval"),
          makeStep("reward", { amount: 500, reward_kind: "voucher_direct" }),
          makeStep("notify"),
          makeStep("end"),
        ],
        budget: { ...baseDraft({ id: "x", name: "x" }).budget, wallet: "Sales A — Vikram" },
      }),
  },
  {
    id: "csat-champion",
    name: "CSAT Champion",
    industry: "Support",
    description: "Top 2 support agents by average CSAT, minimum ticket count, owner approval.",
    build: () =>
      baseDraft({
        id: "new",
        name: "CSAT Champion (monthly)",
        templateRef: "csat-champion",
        tags: ["support", "monthly"],
        scope: {
          ...baseDraft({ id: "x", name: "x" }).scope,
          departments: ["Support"],
          partition: "none",
        },
        triggers: [schedule("Monthly on the 1st at 06:00")],
        steps: [
          makeStep("filter", { field: "support.ticket_resolved", operator: "≥", value: "50" }),
          makeStep("aggregate", {
            metric: "support.csat_avg",
            function: "avg",
            min_sample_size: 0,
          }),
          makeStep("rank", { metric: "support.csat_avg", top_n: 2 }),
          makeStep("branch", {
            condition: "rank = 1",
            then: "Reward ₹ 2,000",
            else: "Reward ₹ 1,000",
          }),
          makeStep("approval", { approvers: "Owner" }),
          makeStep("reward", { amount: 2000, reward_kind: "voucher_direct", recipients: "top N" }),
          makeStep("notify"),
          makeStep("end"),
        ],
        budget: { ...baseDraft({ id: "x", name: "x" }).budget, wallet: "Support FY26-27" },
      }),
  },
  {
    id: "line-star",
    name: "Weekly Line Star",
    industry: "Manufacturing",
    description: "Top output per line, only if attendance is at least 95%.",
    build: () =>
      baseDraft({
        id: "new",
        name: "Weekly Line Star",
        templateRef: "line-star",
        tags: ["manufacturing", "weekly"],
        scope: {
          ...baseDraft({ id: "x", name: "x" }).scope,
          departments: ["Manufacturing"],
          partition: "team",
        },
        triggers: [schedule("Every Monday at 09:00", "last 7 days")],
        steps: [
          makeStep("filter", { field: "attendance.attendance_pct", operator: "≥", value: "95" }),
          makeStep("rank", { metric: "production.units", top_n: 1, partition: "team" }),
          makeStep("approval", { approvers: "Department head" }),
          makeStep("reward", { amount: 300 }),
          makeStep("badge", { badge: "Line Star" }),
          makeStep("notify", { to: "whole team" }),
          makeStep("end"),
        ],
        budget: { ...baseDraft({ id: "x", name: "x" }).budget, wallet: "Manufacturing A — Selvi" },
      }),
  },
  {
    id: "perfect-attendance",
    name: "Perfect attendance bonus",
    industry: "Any",
    description: "Everyone with 100% attendance in the month gets points.",
    build: () =>
      baseDraft({
        id: "new",
        name: "Perfect attendance bonus",
        templateRef: "perfect-attendance",
        scope: {
          ...baseDraft({ id: "x", name: "x" }).scope,
          departments: ["Manufacturing", "Quality", "Operations"],
        },
        triggers: [schedule("Monthly on the 1st at 06:00")],
        steps: [
          makeStep("threshold", { metric: "attendance.attendance_pct", operator: "=", value: 100 }),
          makeStep("approval"),
          makeStep("reward", { amount: 250 }),
          makeStep("notify"),
          makeStep("end"),
        ],
        budget: {
          ...baseDraft({ id: "x", name: "x" }).budget,
          wallet: "Radha Krishna Mills (organisation)",
        },
      }),
  },
  {
    id: "zero-defect",
    name: "Zero-defect shift",
    industry: "Manufacturing",
    description: "Quality inspectors with zero defects across the week's shifts.",
    build: () =>
      baseDraft({
        id: "new",
        name: "Zero-defect shift",
        templateRef: "zero-defect",
        scope: { ...baseDraft({ id: "x", name: "x" }).scope, departments: ["Quality"] },
        triggers: [schedule("Every Friday at 17:00", "last 7 days")],
        steps: [
          makeStep("threshold", { metric: "quality.defects", operator: "=", value: 0 }),
          makeStep("approval"),
          makeStep("reward", { amount: 400 }),
          makeStep("recognise", { title: "Quality Champion", visibility: "company" }),
          makeStep("notify"),
          makeStep("end"),
        ],
        budget: { ...baseDraft({ id: "x", name: "x" }).budget, wallet: "Quality" },
      }),
  },
  {
    id: "anniversary",
    name: "Work anniversary",
    industry: "Any",
    description: "Celebrate joining anniversaries with points and a team message.",
    build: () =>
      baseDraft({
        id: "new",
        name: "Work anniversary",
        templateRef: "anniversary",
        triggers: [
          {
            id: newId("t"),
            type: "event",
            config: {
              event_type: "employee.anniversary",
              filter: "years ≥ 1",
              debounce_minutes: 0,
            },
          },
        ],
        steps: [
          makeStep("reward", { amount: 500 }),
          makeStep("recognise", { title: "Work anniversary", visibility: "team" }),
          makeStep("notify", { to: "whole team" }),
          makeStep("end"),
        ],
        budget: {
          ...baseDraft({ id: "x", name: "x" }).budget,
          wallet: "Radha Krishna Mills (organisation)",
        },
      }),
  },
];

export function blankDraft(): WorkflowDraft {
  return baseDraft({ id: "new", name: "", steps: [makeStep("end")] });
}

const fromTemplate = (templateId: string, patch: Partial<WorkflowDraft>) => {
  const t = workflowTemplates.find((x) => x.id === templateId)!;
  return { ...t.build(), ...patch };
};

/** Drafts for the seeded workflows in the list. */
export function draftForWorkflow(
  id: string,
): { current: WorkflowDraft; previous: WorkflowDraft | null } | null {
  switch (id) {
    case "wf-sales": {
      const current = fromTemplate("sales-achievers", { id, version: 7, owner: "Vikram Rao" });
      const previous = {
        ...current,
        version: 6,
        steps: current.steps.map((s) =>
          s.kind === "reward" ? { ...s, config: { ...s.config, amount: 300 } } : s,
        ),
      };
      return { current, previous };
    }
    case "wf-attendance":
      return { current: fromTemplate("perfect-attendance", { id, version: 4 }), previous: null };
    case "wf-quality":
      return { current: fromTemplate("zero-defect", { id, version: 2 }), previous: null };
    case "wf-anniversary":
      return { current: fromTemplate("anniversary", { id, version: 3 }), previous: null };
    case "wf-safety":
      return {
        current: baseDraft({
          id,
          name: "Safety suggestion reward",
          owner: "Vikram Rao",
          version: 1,
          triggers: [
            {
              id: newId("t"),
              type: "manual",
              config: { allowed_roles: "Shift supervisor, HR Admin", parameters: "suggestion_id" },
            },
          ],
          steps: [
            makeStep("approval", { approvers: "HR Admin" }),
            makeStep("reward", { amount: 0 }),
            makeStep("end"),
          ],
        }),
        previous: null,
      };
    default:
      return null;
  }
}

export function templateById(id: string | undefined) {
  return workflowTemplates.find((t) => t.id === id);
}

export function describeTrigger(t: Trigger): string {
  if (t.type === "schedule")
    return `Schedule · ${t.config["cron"]} · window: ${t.config["window"]}`;
  if (t.type === "event")
    return `Event · ${t.config["event_type"]}${t.config["filter"] ? ` where ${t.config["filter"]}` : ""}`;
  return `Manual · by ${t.config["allowed_roles"]}`;
}

export function describeStep(s: Step): string {
  const c = s.config;
  const metric = (k: string) =>
    metricCatalog.find((m) => m.key === c[k])?.label ?? String(c[k] ?? "");
  switch (s.kind) {
    case "filter":
      return `${metric("field")} ${c["operator"]} ${c["value"]}`;
    case "aggregate":
      return `${c["function"]} of ${metric("metric")} · ${c["window"]}${Number(c["min_sample_size"]) > 0 ? ` · min ${c["min_sample_size"]} samples` : ""}`;
    case "rank":
      return `Top ${c["top_n"]} by ${metric("metric")}${c["partition"] !== "none" ? ` per ${c["partition"]}` : ""}`;
    case "threshold":
      return `${metric("metric")} ${c["operator"]} ${c["value"]}`;
    case "branch":
      return `If ${c["condition"]} → ${c["then"]}; else → ${c["else"]}`;
    case "approval":
      return `${c["approvers"]} · ${c["timeout_hours"]}h, then ${c["on_timeout"]}`;
    case "reward":
      return Number(c["amount"]) > 0
        ? `${Number(c["amount"]).toLocaleString("en-IN")} ${c["currency"]} · ${String(c["reward_kind"]).replace(/_/g, " ")}`
        : "Amount missing";
    case "recognise":
      return `“${c["title"]}” · visible to ${c["visibility"]}`;
    case "badge":
      return `${c["badge"]} badge`;
    case "notify":
      return `${c["to"]} · ${c["channels"]}${c["quiet_hours"] ? " · quiet hours" : ""}`;
    case "wait":
      return `${c["hours"]} hours`;
    case "set_var":
      return `${c["name"]} = ${c["value"]}`;
    case "end":
      return "Workflow finishes";
  }
}
