import { CheckCircle2, Download, FileSpreadsheet, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupees } from "@/lib/format";
import {
  exportHistory,
  findPayrollIssues,
  payrollPeriods,
  payrollPreview,
  payrollSystems,
  toCsv,
} from "@/lib/phase2-data";

type Step = "choose" | "preview" | "done";

export function PayrollPage() {
  const [step, setStep] = useState<Step>("choose");
  const [period, setPeriod] = useState<string>(payrollPeriods[0]);
  const [system, setSystem] = useState<string>(payrollSystems[0]);
  const issues = findPayrollIssues(payrollPreview);

  const download = () => {
    const csv = toCsv(
      ["Employee code", "Name", "Points", "Amount (INR)", "Taxable"],
      payrollPreview.map((row) => [
        row.code,
        row.name,
        String(row.points),
        String(row.amount),
        row.taxable ? "Yes" : "No",
      ]),
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `payroll-${period.replace(/\s/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Money"
        title="Payroll export"
        description="Send reward amounts to payroll in three steps: choose, check, download."
      />

      <ol className="flex flex-wrap items-center gap-2 text-sm" aria-label="Export progress">
        {["Choose period & system", "Check the rows", "Download"].map((label, index) => {
          const current =
            (step === "choose" && index === 0) ||
            (step === "preview" && index === 1) ||
            (step === "done" && index === 2);
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={
                  current
                    ? "grid size-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                    : "grid size-6 place-items-center rounded-full bg-muted text-xs text-muted-foreground"
                }
              >
                {index + 1}
              </span>
              <span className={current ? "font-medium" : "text-muted-foreground"}>{label}</span>
              {index < 2 && <span className="mx-1 text-muted-foreground">→</span>}
            </li>
          );
        })}
      </ol>

      {step === "choose" && (
        <Card className="max-w-xl rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Choose period & system</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payroll-period">Payroll period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="payroll-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payrollPeriods.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payroll-system">Payroll system</Label>
              <Select value={system} onValueChange={setSystem}>
                <SelectTrigger id="payroll-system">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payrollSystems.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setStep("preview")}>Preview export</Button>
          </CardContent>
        </Card>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          {issues.length > 0 && (
            <div className="space-y-2" role="alert">
              {issues.map((issue) => (
                <div
                  key={issue.code}
                  className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4"
                >
                  <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
                  <p className="text-sm">
                    <span className="font-medium">
                      {issue.name} ({issue.code})
                    </span>{" "}
                    — {issue.issue}
                  </p>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                You can still download, but rows with problems are marked so payroll can skip them.
              </p>
            </div>
          )}
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                {period} · {system} · {payrollPreview.length} rows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-4 font-medium">Code</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 text-right font-medium">Points</th>
                    <th className="p-4 text-right font-medium">Amount</th>
                    <th className="p-4 font-medium">Taxable</th>
                    <th className="hidden p-4 font-medium lg:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollPreview.map((row) => (
                    <tr key={row.code} className="border-b border-border last:border-0">
                      <td className="p-4 font-mono text-xs">{row.code}</td>
                      <td className="p-4">{row.name}</td>
                      <td className="p-4 text-right">{row.points}</td>
                      <td className="p-4 text-right">{formatRupees(row.amount)}</td>
                      <td className="p-4">
                        {row.taxable ? (
                          <StatusBadge tone="warning">Taxable</StatusBadge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="hidden p-4 text-xs text-muted-foreground lg:table-cell">
                        {row.issue ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("choose")}>
              Back
            </Button>
            <Button
              onClick={() => {
                download();
                setStep("done");
              }}
            >
              <Download /> Download CSV
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <Card className="max-w-xl rounded-lg shadow-sm">
          <CardContent className="space-y-4 p-6 text-center">
            <CheckCircle2 className="mx-auto size-10 text-success" />
            <p className="font-semibold">
              Your {system} file for {period} is ready
            </p>
            <p className="text-sm text-muted-foreground">
              The CSV has been downloaded. Upload it to your payroll system as usual.
            </p>
            <Button variant="outline" onClick={() => setStep("choose")}>
              Start another export
            </Button>
          </CardContent>
        </Card>
      )}

      <section aria-label="Export history">
        <h2 className="mb-4 text-lg font-semibold">Export history</h2>
        <Card className="rounded-lg shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-4 font-medium">Period</th>
                  <th className="p-4 font-medium">System</th>
                  <th className="p-4 text-right font-medium">Rows</th>
                  <th className="hidden p-4 font-medium sm:table-cell">Exported</th>
                  <th className="hidden p-4 font-medium sm:table-cell">By</th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">
                      <FileSpreadsheet className="mr-2 inline size-4 text-muted-foreground" />
                      {entry.period}
                    </td>
                    <td className="p-4">{entry.system}</td>
                    <td className="p-4 text-right">{entry.rows}</td>
                    <td className="hidden p-4 sm:table-cell">{entry.date}</td>
                    <td className="hidden p-4 text-muted-foreground sm:table-cell">{entry.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
