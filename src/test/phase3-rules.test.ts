import { describe, expect, it } from "vitest";

import { canShowGenderCut, gini, slaDaysLeft, taxStatus, topTenShare } from "@/lib/phase3-data";

describe("phase 3 rules", () => {
  it("gini is 0 for equal values and high for concentration", () => {
    expect(gini([10, 10, 10, 10])).toBe(0);
    expect(gini([0, 0, 0, 100])).toBeCloseTo(0.75);
  });

  it("top 10% share", () => {
    expect(topTenShare([100, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(1);
  });

  it("₹15,000 tax threshold", () => {
    expect(taxStatus(15000)).toBe("near");
    expect(taxStatus(15001)).toBe("over");
    expect(taxStatus(11999)).toBe("clear");
  });

  it("data request SLA counts down and goes negative when overdue", () => {
    const today = new Date(2026, 9, 8);
    expect(slaDaysLeft(new Date(2026, 9, 1), 30, today)).toBe(23);
    expect(slaDaysLeft(new Date(2026, 8, 5), 30, today)).toBe(-3);
  });

  it("gender cut hidden without consent", () => {
    expect(canShowGenderCut(false)).toBe(false);
  });
});

import { explainOutcome, mentionsProtectedAttribute } from "@/lib/insights-evidence";
import { employees } from "@/lib/mock-data";

describe("insights evidence", () => {
  it("exited employees are excluded at the choose-people step", () => {
    const exited = employees.find((e) => e.status === "exited");
    const r = exited ? explainOutcome(exited.code) : null;
    expect(r?.outcome).toBe("Not considered");
    expect(r?.steps[1]?.passed).toBe(false);
  });

  it("every trace step carries an evidence id", () => {
    const r = explainOutcome(employees[2]?.code ?? "");
    expect(r?.steps.every((s) => s.evidence.id.startsWith("TRACE-"))).toBe(true);
  });

  it("detects protected attribute questions", () => {
    expect(mentionsProtectedAttribute("Do women win less? Compare by gender")).toBe(true);
    expect(mentionsProtectedAttribute("Which teams are missed?")).toBe(false);
  });
});
