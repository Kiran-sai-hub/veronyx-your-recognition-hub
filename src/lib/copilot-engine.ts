import { decisionTrace } from "@/lib/admin-data";
import { explainOutcome, findEmployees, mentionsProtectedAttribute } from "@/lib/insights-evidence";
import { departmentCoverage, shiftCoverage } from "@/lib/phase3-data";

/** Scripted, deterministic copilot used by the UI mockup. No model is called. */
export type CopilotReply =
  | { kind: "text"; text: string; sources: string[] }
  | {
      kind: "table";
      text: string;
      columns: [string, string];
      rows: { label: string; value: number }[];
      sources: string[];
    }
  | {
      kind: "trace";
      text: string;
      steps: { title: string; detail: string; passed: boolean | null }[];
      sources: string[];
    }
  | {
      kind: "refusal";
      reason: "protected" | "opinion" | "permission";
      text: string;
      alternatives: string[];
    }
  | { kind: "timeout" }
  | { kind: "error" };

export const progressSteps = ["Reading your question", "Checking records", "Writing the answer"];

export function respond(question: string, persona: string): CopilotReply {
  const q = question.toLowerCase();

  if (q.includes("timeout") || q.includes("slow")) return { kind: "timeout" };
  if (q.includes("error") || q.includes("fail test")) return { kind: "error" };

  if (mentionsProtectedAttribute(q)) {
    return {
      kind: "refusal",
      reason: "protected",
      text: "I can't compare people by gender, caste, religion, health or other personal traits.",
      alternatives: ["Show coverage by shift", "Show coverage by department"],
    };
  }
  if (
    /\b(good|bad|lazy|best|worst) (employee|worker|person)\b/.test(q) ||
    q.includes("should i fire")
  ) {
    return {
      kind: "refusal",
      reason: "opinion",
      text: "I don't give opinions about people. I can share the facts from their boards and recognitions.",
      alternatives: [
        `Why didn't ${decisionTrace.employee} get rewarded?`,
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
      text: "Your role can't see company-wide payroll or budget figures.",
      alternatives: ["Show my team's remaining budget", "Show my team's coverage"],
    };
  }

  if (q.includes("why") && (q.includes("win") || q.includes("reward"))) {
    const name = findEmployees(
      q
        .replace(/why|didn't|did not|get|rewarded|win|\?/g, " ")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .join(" "),
    )[0];
    const trace = explainOutcome(name?.code ?? decisionTrace.code);
    if (trace) {
      const failed = trace.steps.find((s) => s.passed === false);
      return {
        kind: "trace",
        text: failed
          ? `${trace.employee.name} was not rewarded. The first step that didn't pass was “${failed.title}”.`
          : `${trace.employee.name} was rewarded.`,
        steps: trace.steps.map(({ title, detail, passed }) => ({ title, detail, passed })),
        sources: ["Workflow “Sales target achievers” · run 118"],
      };
    }
  }

  if (q.includes("shift")) {
    return {
      kind: "table",
      text: "Night shift is recognised least: 41% of people in the last 90 days.",
      columns: ["Shift", "Coverage %"],
      rows: shiftCoverage.map((r) => ({ label: r.group, value: r.coverage })),
      sources: ["Fairness · last 90 days"],
    };
  }
  if (q.includes("coverage") || q.includes("department") || q.includes("missed")) {
    return {
      kind: "table",
      text: "Operations has the lowest coverage at 49%.",
      columns: ["Department", "Coverage %"],
      rows: departmentCoverage.map((r) => ({ label: r.group, value: r.coverage })),
      sources: ["Fairness · last 90 days"],
    };
  }

  return {
    kind: "text",
    text: "I can answer questions about recognition coverage, shifts, departments and why someone did or didn't win. Try one of the suggestions.",
    sources: [],
  };
}

export function transcriptToText(
  title: string,
  scope: string,
  messages: { role: "user" | "assistant"; text: string }[],
): string {
  return [
    `Veronyx Copilot — ${title}`,
    `Scope: ${scope}`,
    "",
    ...messages.map((m) => `${m.role === "user" ? "You" : "Copilot"}: ${m.text}`),
  ].join("\n");
}
