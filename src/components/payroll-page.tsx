import {
  CheckCircle2,
  CircleAlert,
  Download,
  FileSpreadsheet,
  ScrollText,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Stepper } from "@/components/library/stepper";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatRupees } from "@/lib/format";
import { personaUser } from "@/lib/navigation";
import {
  exportHistory,
  fiscalYearFor,
  overLimit,
  payrollFileName,
  payrollPeriods,
  payrollPreview,
  payrollSummary,
  payrollSystems,
  taxNatureLabel,
  taxNatures,
  toCsv,
  validatePayroll,
  type PayrollRow,
  type TaxNature,
} from "@/lib/phase2-data";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";

const steps = [
  "Select period",
  "Preview data",
  "Validate",
  "Generate & download",
  "Audit & history",
];

/** Column headers each payroll system expects; "Custom CSV" lets HR rename them. */
const systemHeaders: Record<string, string[]> = {
  Keka: ["Employee Number", "Pay Component", "Amount", "Tax Nature", "Reference"],
  greytHR: ["Employee No", "Component Code", "Amount", "Tax Category", "Remarks"],
  "RazorpayX Payroll": ["employee_id", "component", "amount", "tax_type", "reference"],
  "Zoho Payroll": ["Employee ID", "Earning Code", "Amount", "Taxability", "Reference"],
  "Custom CSV": ["employee_code", "component_code", "amount_inr", "tax_nature", "reference"],
};

function download(csv: string, file: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = file;
  link.click();
  URL.revokeObjectURL(url);
}

/** Monthly payroll CSV export — checklist §4.13 (five steps). */
export function PayrollPage() {
  const persona = useAppStore((s) => s.persona);
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  const exports = useDemoStore((s) => s.payrollExports);
  const sentOverrides = useDemoStore((s) => s.payrollSent);
  const addExport = useDemoStore((s) => s.addPayrollExport);
  const setSent = useDemoStore((s) => s.setPayrollSent);
  const logAudit = useDemoStore((s) => s.logAudit);

  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState<string>(payrollPeriods[0]);
  const [system, setSystem] = useState<string>(payrollSystems[0]);
  const [dept, setDept] = useState("all");
  const [nature, setNature] = useState("all");
  const [tags, setTags] = useState<Record<string, TaxNature>>({});
  const [excluded, setExcluded] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [generated, setGenerated] = useState<{ id: string; csv: string; file: string } | null>(
    null,
  );

  const rows: PayrollRow[] = useMemo(
    () =>
      emptyOrg
        ? []
        : payrollPreview
            .filter((row) => !excluded.includes(row.reference + row.name))
            .map((row) => ({ ...row, taxNature: row.taxNature ?? tags[row.reference] ?? null })),
    [emptyOrg, excluded, tags],
  );
  const departments = [...new Set(payrollPreview.map((row) => row.department))].sort();
  const visible = rows.filter(
    (row) =>
      (dept === "all" || row.department === dept) &&
      (nature === "all" || (row.taxNature ?? "untagged") === nature),
  );
  const summary = payrollSummary(rows);
  const checks = validatePayroll(rows);
  const blocking = checks.filter((check) => check.severity === "error");
  const file = payrollFileName(period);
  const user = personaUser[persona].name;

  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const timer = window.setTimeout(() => setProgress((p) => Math.min(100, (p ?? 0) + 20)), 250);
    return () => window.clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    if (progress !== 100 || generated) return;
    const headers = systemHeaders[system] ?? systemHeaders["Custom CSV"] ?? [];
    const csv = toCsv(
      headers,
      rows.map((row) => [
        row.code,
        row.componentCode,
        String(row.amount),
        row.taxNature ?? "",
        row.reference,
      ]),
    );
    const id = `exp-d${exports.length + 1}`;
    setGenerated({ id, csv, file });
    addExport({
      id,
      period,
      system,
      rows: rows.length,
      date: new Date().toLocaleDateString("en-GB"),
      by: user,
      file,
      sent: false,
      csv,
    });
    logAudit({
      actor: user,
      action: "Exported payroll file",
      target: `${file} · ${system} · ${rows.length} rows`,
      type: "payroll",
    });
  }, [progress, generated, system, rows, exports.length, file, period, user, addExport, logAudit]);

  const history = [
    ...exports.map((e) => ({ ...e, seeded: false })),
    ...exportHistory.map((e) => ({ ...e, csv: "", seeded: true })),
  ];

  const toggleSent = (id: string, file: string, sent: boolean) => {
    setSent(id, sent);
    logAudit({
      actor: user,
      action: sent ? "Marked payroll file as sent" : "Marked payroll file as not sent",
      target: file,
      type: "payroll",
    });
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Rewards & Catalogue"
        title="Payroll export"
        description="Send taxable reward amounts to payroll each month: pick the period, check the rows, fix problems, then download the file for your payroll system."
      />

      <Stepper steps={steps.map((label) => ({ label }))} current={step} onStepClick={setStep} />

      {step === 0 && (
        <Card className="max-w-xl rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Step 1 · Select period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payroll-period">Month and year</Label>
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
              <p className="text-xs text-muted-foreground">
                Fiscal year: <b>{fiscalYearFor(period)}</b> (April–March). Yearly gift limits reset
                on 1 April.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Columns: {(systemHeaders[system] ?? []).join(", ")}
              </p>
            </div>
            <Button onClick={() => setStep(1)}>Preview data</Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Total employees", String(summary.employees)],
              ["Total non-cash", formatRupees(summary.nonCash)],
              ["Total cash", formatRupees(summary.cash)],
              ["Threshold breaches", String(summary.breaches)],
            ].map(([label, value]) => (
              <Card key={label} className="rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-semibold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="w-full space-y-1 sm:w-56">
              <Label htmlFor="payroll-dept">Department</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger id="payroll-dept">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-1 sm:w-56">
              <Label htmlFor="payroll-nature">Tax nature</Label>
              <Select value={nature} onValueChange={setNature}>
                <SelectTrigger id="payroll-nature">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tax natures</SelectItem>
                  {taxNatures.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                  <SelectItem value="untagged">Untagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                {period} · {system} · {visible.length} of {rows.length} rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {rows.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No rewards were given in {period}, so there is nothing to export yet.
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-border md:hidden">
                    {visible.map((row) => (
                      <li key={row.reference + row.name} className="space-y-1 p-4 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="font-medium">{row.name}</span>
                          <span className="font-semibold">{formatRupees(row.amount)}</span>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {row.code || "— no code —"} · {row.componentCode} ·{" "}
                          {row.taxNature ?? "untagged"}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">{row.reference}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="p-3 font-medium">Employee code</th>
                          <th className="p-3 font-medium">Name</th>
                          <th className="p-3 font-medium">Component code</th>
                          <th className="p-3 text-right font-medium">Amount (₹)</th>
                          <th className="p-3 font-medium">Tax nature</th>
                          <th className="p-3 font-medium">Reference (workflow run)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((row) => (
                          <tr
                            key={row.reference + row.name}
                            className="border-b border-border last:border-0"
                          >
                            <td className="p-3 font-mono text-xs">
                              {row.code || <span className="text-destructive">missing</span>}
                            </td>
                            <td className="p-3">{row.name}</td>
                            <td className="p-3 font-mono text-xs">{row.componentCode}</td>
                            <td className="p-3 text-right">
                              {formatRupees(row.amount)}
                              {overLimit(row) > 0 && (
                                <TriangleAlert
                                  className="ml-1 inline size-3.5 text-warning"
                                  aria-label="Crosses the yearly limit"
                                />
                              )}
                            </td>
                            <td className="p-3">
                              {row.taxNature ? (
                                <span title={taxNatureLabel[row.taxNature]}>
                                  <code className="text-xs">{row.taxNature}</code>
                                </span>
                              ) : (
                                <StatusBadge tone="error">untagged</StatusBadge>
                              )}
                            </td>
                            <td className="p-3 font-mono text-xs text-muted-foreground">
                              {row.reference}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={() => setStep(2)} disabled={rows.length === 0}>
              Validate
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl space-y-4">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Step 3 · Validate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="space-y-1">
                {(
                  [
                    ["missing_code", "Missing employee codes"],
                    ["untagged", "Untagged rewards"],
                    ["threshold", "Threshold breaches"],
                  ] as const
                ).map(([kind, label]) => {
                  const count = checks.filter((c) => c.kind === kind).length;
                  return (
                    <li key={kind} className="flex items-center gap-2">
                      {count === 0 ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : kind === "threshold" ? (
                        <TriangleAlert className="size-4 text-warning" />
                      ) : (
                        <CircleAlert className="size-4 text-destructive" />
                      )}
                      {label}: <b>{count === 0 ? "none" : count}</b>
                    </li>
                  );
                })}
              </ul>
              {checks.length > 0 && (
                <ul className="space-y-2" role="alert">
                  {checks.map((check) => {
                    const row = payrollPreview.find(
                      (r) => r.reference === check.reference && r.name === check.name,
                    );
                    return (
                      <li
                        key={check.kind + check.reference + check.name}
                        className={cn(
                          "space-y-2 rounded-lg border p-3",
                          check.severity === "error"
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-warning/30 bg-warning/10",
                        )}
                      >
                        <p>
                          <b>{check.name}</b>{" "}
                          <span className="font-mono text-xs text-muted-foreground">
                            {check.reference}
                          </span>{" "}
                          — {check.message}
                        </p>
                        {check.kind === "untagged" && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs">Tag as:</span>
                            {taxNatures.map((n) => (
                              <Button
                                key={n}
                                size="sm"
                                variant="outline"
                                onClick={() => setTags((t) => ({ ...t, [check.reference]: n }))}
                              >
                                {n}
                              </Button>
                            ))}
                          </div>
                        )}
                        {check.kind === "missing_code" && row && (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href="/people">Add code in People</a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setExcluded((x) => [...x, row.reference + row.name])}
                            >
                              Exclude from this export
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {blocking.length === 0 ? (
                <p className="text-success">
                  No blocking problems. Warnings are kept in the file so payroll can tax the excess.
                </p>
              ) : (
                <p className="text-destructive">
                  Fix or exclude {blocking.length} row{blocking.length === 1 ? "" : "s"} before
                  generating the file.
                </p>
              )}
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={blocking.length > 0}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card className="max-w-xl rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Step 4 · Generate & download</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              {rows.length} rows · {system} · {period} ({fiscalYearFor(period)})
            </p>
            {progress === null && (
              <Button onClick={() => setProgress(0)}>
                <FileSpreadsheet /> Generate CSV
              </Button>
            )}
            {progress !== null && progress < 100 && (
              <div className="space-y-2" aria-live="polite">
                <p>Generating file… {progress}%</p>
                <Progress value={progress} aria-label="Generating payroll file" />
              </div>
            )}
            {generated && (
              <div className="space-y-3" aria-live="polite">
                <p className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="size-4" /> File ready and logged in the audit trail.
                </p>
                <Button variant="outline" onClick={() => download(generated.csv, generated.file)}>
                  <Download /> {generated.file}
                </Button>
                <div>
                  <Button onClick={() => setStep(4)}>Go to history</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(step === 4 || step === 0) && (
        <section aria-labelledby="payroll-history" className="space-y-4">
          <h2 id="payroll-history" className="text-lg font-semibold">
            {step === 4 ? "Step 5 · Audit & history" : "Export history"}
          </h2>
          <Card className="rounded-lg shadow-sm">
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">File</th>
                    <th className="hidden p-3 font-medium sm:table-cell">System</th>
                    <th className="p-3 text-right font-medium">Rows</th>
                    <th className="hidden p-3 font-medium md:table-cell">Exported</th>
                    <th className="p-3 font-medium">Sent to payroll</th>
                    <th className="p-3 font-medium">
                      <span className="sr-only">Download</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => {
                    const sent = sentOverrides[entry.id] ?? entry.sent;
                    return (
                      <tr key={entry.id} className="border-b border-border last:border-0">
                        <td className="p-3">
                          <span className="font-mono text-xs">{entry.file}</span>
                          <span className="block text-xs text-muted-foreground">
                            {entry.period}
                          </span>
                        </td>
                        <td className="hidden p-3 sm:table-cell">{entry.system}</td>
                        <td className="p-3 text-right">{entry.rows}</td>
                        <td className="hidden p-3 md:table-cell">
                          {entry.date} · {entry.by}
                        </td>
                        <td className="p-3">
                          <Switch
                            checked={sent}
                            onCheckedChange={(v) => toggleSent(entry.id, entry.file, v)}
                            aria-label={`Sent to payroll: ${entry.file}`}
                          />
                        </td>
                        <td className="p-3">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Download ${entry.file}`}
                            onClick={() => {
                              if (entry.csv) download(entry.csv, entry.file);
                              else toast.success(`${entry.file} downloaded (sample file)`);
                            }}
                          >
                            <Download className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ScrollText className="size-4" /> Every export and “sent” change is recorded in{" "}
            <a className="text-primary underline" href="/compliance?tab=audit">
              Privacy & DPDP → Audit log
            </a>
            .
          </p>
          {step === 4 && (
            <Button
              variant="outline"
              onClick={() => {
                setStep(0);
                setProgress(null);
                setGenerated(null);
              }}
            >
              Start another export
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
