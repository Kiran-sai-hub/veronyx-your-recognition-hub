import { describe, expect, it } from "vitest";

import { approvals, isBudgetExhausted } from "@/lib/approvals-data";
import {
  applyAutoFix,
  blankDraft,
  hasErrors,
  makeStep,
  simulateDryRun,
  validateDraft,
  workflowTemplates,
} from "@/lib/workflow-model";

const template = (id: string) => workflowTemplates.find((t) => t.id === id)!.build();
const status = (checks: ReturnType<typeof validateDraft>, code: string) =>
  checks.find((c) => c.code === code)?.status;

describe("approval rules", () => {
  it("queues approvals from an exhausted budget pool", () => {
    expect(isBudgetExhausted(approvals.find((a) => a.id === "ap-4")!)).toBe(true);
    expect(isBudgetExhausted(approvals.find((a) => a.id === "ap-1")!)).toBe(false);
  });
});

describe("workflow validation V1–V14", () => {
  it("reports all fourteen rules", () => {
    expect(validateDraft(template("sales-achievers")).map((c) => c.code)).toEqual(
      Array.from({ length: 14 }, (_, i) => `V${i + 1}`),
    );
  });

  it("a blank workflow is blocked until it has a name and a trigger", () => {
    const checks = validateDraft(blankDraft());
    expect(status(checks, "V1")).toBe("error");
    expect(status(checks, "V4")).toBe("error");
    expect(hasErrors(checks)).toBe(true);
  });

  it("blocks a reward step without an amount (V6) and auto-fixes it", () => {
    const draft = template("sales-achievers");
    const broken = {
      ...draft,
      steps: draft.steps.map((s) => (s.kind === "reward" ? makeStep("reward", { amount: 0 }) : s)),
    };
    expect(status(validateDraft(broken), "V6")).toBe("error");
    expect(status(validateDraft(applyAutoFix(broken, "set_amount")), "V6")).toBe("pass");
  });

  it("warns when an average metric has no minimum sample (V14)", () => {
    const csat = template("csat-champion");
    expect(status(validateDraft(csat), "V14")).toBe("warn");
    expect(status(validateDraft(applyAutoFix(csat, "set_sample")), "V14")).toBe("pass");
  });

  it("refuses protected attributes in filters (V13)", () => {
    const draft = template("sales-achievers");
    const biased = {
      ...draft,
      scope: { ...draft.scope, filters: [{ field: "gender", operator: "=", value: "male" }] },
    };
    expect(status(validateDraft(biased), "V13")).toBe("error");
  });

  it("warns when rewards skip approval (V5)", () => {
    const draft = template("sales-achievers");
    const noApproval = { ...draft, steps: draft.steps.filter((s) => s.kind !== "approval") };
    expect(status(validateDraft(noApproval), "V5")).toBe("warn");
  });
});

describe("dry-run", () => {
  it("simulates the requested number of periods within budget", () => {
    const result = simulateDryRun(template("csat-champion"), 3, null);
    expect(result.periods).toHaveLength(3);
    expect(result.totalCost).toBe(result.periods.reduce((s, p) => s + p.cost, 0));
    expect(result.budgetOk).toBe(true);
  });

  it("fails clearly when the metric has no data source", () => {
    const draft = template("sales-achievers");
    const disconnected = {
      ...draft,
      steps: draft.steps.map((s) =>
        s.kind === "threshold" || s.kind === "aggregate"
          ? { ...s, config: { ...s.config, metric: "collections.collection_efficiency" } }
          : s,
      ),
    };
    expect(() => simulateDryRun(disconnected, 3, null)).toThrow(/Connect a source first/);
  });
});
