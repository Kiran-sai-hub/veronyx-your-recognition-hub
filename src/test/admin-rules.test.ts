import { describe, expect, it } from "vitest";

import { isBudgetExhausted } from "@/lib/approvals-data";
import { approvals, initialSteps, validateWorkflow } from "@/lib/admin-data";

describe("approval and workflow rules", () => {
  it("queues approvals from an exhausted budget pool", () => {
    expect(isBudgetExhausted(approvals.find((a) => a.id === "ap-4")!)).toBe(true);
    expect(isBudgetExhausted(approvals.find((a) => a.id === "ap-1")!)).toBe(false);
  });
  it("blocks a workflow whose reward step has no amount (V5)", () => {
    expect(
      validateWorkflow(initialSteps).some((i) => i.code === "V5" && i.severity === "error"),
    ).toBe(true);
  });
  it("requires a start step (V1)", () => {
    expect(validateWorkflow(initialSteps.slice(1)).some((i) => i.code === "V1")).toBe(true);
  });
});
