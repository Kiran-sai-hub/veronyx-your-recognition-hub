import { decisionTrace } from "@/lib/admin-data";
import { employees, type Employee } from "@/lib/mock-data";
import {
  departmentCoverage,
  gini,
  locationCoverage,
  managerSpread,
  negativeReport,
  recognitionPoints,
  shiftCoverage,
  tenureCoverage,
  topTenShare,
} from "@/lib/phase3-data";

/** One cited fact. Every AI answer may only reference these ids. */
export type Evidence = { id: string; label: string; detail: string; source: string };

export type InsightsPersona = "owner" | "manager";

export const PROTECTED_TERMS = [
  "gender",
  "caste",
  "religion",
  "health",
  "pregnan",
  "disability",
  "age ",
  "marital",
];

/** True when a question asks to analyse a protected attribute. */
export function mentionsProtectedAttribute(text: string): boolean {
  const lower = ` ${text.toLowerCase()} `;
  return PROTECTED_TERMS.some((t) => lower.includes(t));
}

function hash(value: string): number {
  return [...value].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

export function findEmployees(query: string, limit = 5): Employee[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return employees
    .filter((e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase() === q)
    .slice(0, limit);
}

export function employeeEvidence(e: Employee): Evidence {
  return {
    id: `EMP-${e.code}`,
    label: `${e.name} (${e.code})`,
    detail: `${e.department} · ${e.team} · ${e.location} · ${e.points} points · ${e.status}`,
    source: "People directory",
  };
}

export type OutcomeStep = {
  title: string;
  detail: string;
  passed: boolean | null;
  evidence: Evidence;
};

/** Deterministic decision trace for the latest "Sales target achievers" run (run-118). */
export function explainOutcome(
  code: string,
): { employee: Employee; outcome: string; steps: OutcomeStep[] } | null {
  const employee = employees.find((e) => e.code.toLowerCase() === code.toLowerCase());
  if (!employee) return null;
  const run = "run-118";
  const mk = (i: number, title: string, detail: string, passed: boolean | null): OutcomeStep => ({
    title,
    detail,
    passed,
    evidence: {
      id: `TRACE-${run}-${employee.code}-${i}`,
      label: `Step ${i}: ${title}`,
      detail,
      source: "Workflow “Sales target achievers” · run 118 · 07/09/2026",
    },
  });

  if (employee.code === decisionTrace.code) {
    const steps = decisionTrace.steps.map((s, i) => mk(i + 1, s.title, s.detail, s.passed));
    return { employee, outcome: decisionTrace.outcome, steps };
  }

  const start = mk(1, "Start when", "Sales file imported on 07/09/2026 18:30", true);
  if (employee.status === "exited") {
    return {
      employee,
      outcome: "Not considered",
      steps: [start, mk(2, "Choose people", "Excluded: employee has exited the company", false)],
    };
  }
  if (employee.department !== "Sales") {
    return {
      employee,
      outcome: "Not in scope",
      steps: [
        start,
        mk(
          2,
          "Choose people",
          `Not in scope: ${employee.department} is not part of this workflow`,
          false,
        ),
      ],
    };
  }
  const pct = 70 + (hash(employee.code) % 61);
  const target = 500000;
  const actual = Math.round((target * pct) / 100);
  const met = pct >= 100;
  const steps = [
    start,
    mk(2, "Choose people", "Sales department · active", true),
    mk(
      3,
      "Check a rule",
      `Sales ₹${actual.toLocaleString("en-IN")} vs target ₹5,00,000 → ${pct}%`,
      met,
    ),
    mk(
      4,
      "Ask for approval",
      met ? "Approved by Priya Raman on 08/09/2026" : "Skipped because the rule was not met",
      met ? true : null,
    ),
    mk(5, "Give points", met ? "1,000 points awarded" : "Skipped", met ? true : null),
  ];
  return { employee, outcome: met ? "Rewarded" : "Not rewarded", steps };
}

export function recognitionHistory(code: string): Evidence | null {
  const e = employees.find((x) => x.code.toLowerCase() === code.toLowerCase());
  if (!e) return null;
  const h = hash(e.code);
  const count = h % 9;
  const lastDays = count === 0 ? null : 3 + (h % 80);
  return {
    id: `REC-${e.code}`,
    label: `Recognition history — ${e.name}`,
    detail:
      count === 0
        ? "No recognitions in the last 90 days"
        : `${count} recognitions in the last 90 days; most recent ${lastDays} days ago`,
    source: "Recognition feed",
  };
}

export function fairnessSummary(): Evidence[] {
  const cut = (name: string, rows: { group: string; coverage: number; people: number }[]) => ({
    id: `FAIR-${name.toUpperCase()}`,
    label: `Coverage by ${name}`,
    detail: rows.map((r) => `${r.group} ${r.coverage}% of ${r.people}`).join("; "),
    source: "Fairness · last 90 days",
  });
  return [
    {
      id: "FAIR-SPREAD",
      label: "Spread of points",
      detail: `Spread score ${gini(recognitionPoints).toFixed(2)}; top 10% hold ${Math.round(topTenShare(recognitionPoints) * 100)}% of points`,
      source: "Fairness · all active employees",
    },
    cut("department", departmentCoverage),
    cut("location", locationCoverage),
    cut("shift", shiftCoverage),
    cut("tenure", tenureCoverage),
    {
      id: "FAIR-MANAGERS",
      label: "Manager spread",
      detail: managerSpread.map((m) => `${m.manager} ${m.distinct}/${m.team}`).join("; "),
      source: "Fairness · last 90 days",
    },
    {
      id: "FAIR-MISSED",
      label: "People and teams being missed",
      detail: `${negativeReport.zeroRecognition.length} people with no recognition in 60+ days; teams with no workflow: ${negativeReport.noWorkflowTeams.map((t) => t.team).join(", ")}; boards with no winner: ${negativeReport.noWinnerBoards.map((b) => b.board).join(", ")}`,
      source: "Negative report",
    },
    {
      id: "FAIR-GENDER",
      label: "Gender cut",
      detail: "Hidden — consent for this analysis has not been captured",
      source: "Privacy settings",
    },
  ];
}
