import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatIndianNumber,
  formatRupees,
  isValidGstin,
  isValidUdyam,
} from "@/lib/format";

describe("Indian localisation utilities", () => {
  it("formats numbers using Indian grouping", () => {
    expect(formatIndianNumber(120000)).toBe("1,20,000");
  });

  it("formats rupees with the required spacing", () => {
    expect(formatRupees(120000)).toBe("₹ 1,20,000");
  });

  it("formats dates as DD/MM/YYYY in IST", () => {
    expect(formatDate(new Date("2026-10-08T04:00:00Z"))).toBe("08/10/2026");
  });

  it("validates GSTIN and Udyam formats", () => {
    expect(isValidGstin("33ABCDE1234F1Z5")).toBe(true);
    expect(isValidGstin("not-a-gstin")).toBe(false);
    expect(isValidUdyam("UDYAM-TN-03-0012345")).toBe(true);
    expect(isValidUdyam("12345")).toBe(false);
  });
});
