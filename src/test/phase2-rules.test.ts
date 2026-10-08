import { describe, expect, it } from "vitest";

import {
  budgetPools,
  checkBudgetMove,
  findPayrollIssues,
  payrollPreview,
  poolRemaining,
  toCsv,
} from "@/lib/phase2-data";

describe("Budget moves", () => {
  const quality = budgetPools.find((pool) => pool.id === "pool-quality")!;
  const mfgB = budgetPools.find((pool) => pool.id === "pool-mfg-b")!;

  it("blocks moving more than the source pool has left", () => {
    const check = checkBudgetMove(quality, mfgB, poolRemaining(quality) + 1);
    expect(check.ok).toBe(false);
  });

  it("blocks moving a pool into itself", () => {
    expect(checkBudgetMove(quality, quality, 1000).ok).toBe(false);
  });

  it("blocks zero and negative amounts", () => {
    expect(checkBudgetMove(quality, mfgB, 0).ok).toBe(false);
    expect(checkBudgetMove(quality, mfgB, -500).ok).toBe(false);
  });

  it("reports both balances after a valid move", () => {
    const check = checkBudgetMove(quality, mfgB, 5000);
    expect(check).toEqual({
      ok: true,
      fromAfter: poolRemaining(quality) - 5000,
      toAfter: poolRemaining(mfgB) + 5000,
    });
  });

  it("seeds an exhausted manager pool so queued approvals can be shown", () => {
    expect(poolRemaining(mfgB)).toBe(0);
  });
});

describe("Payroll export validation", () => {
  it("flags rows with known problems before export", () => {
    const issues = findPayrollIssues(payrollPreview);
    expect(issues).toHaveLength(2);
    expect(issues.map((issue) => issue.code)).toEqual(["RKM0007", "RKM0004"]);
  });

  it("flags the employee who crosses the ₹15,000 gift limit", () => {
    const issues = findPayrollIssues(payrollPreview);
    expect(issues[0]?.issue).toContain("₹15,000");
  });

  it("passes clean rows", () => {
    expect(findPayrollIssues(payrollPreview.filter((row) => !row.issue))).toHaveLength(0);
  });
});

describe("CSV export", () => {
  it("joins headers and rows with commas and newlines", () => {
    expect(
      toCsv(
        ["A", "B"],
        [
          ["1", "2"],
          ["3", "4"],
        ],
      ),
    ).toBe("A,B\n1,2\n3,4");
  });
});
