import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Link2,
  Loader2,
  PenLine,
  Plus,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CanonicalKey,
  canonicalFields,
  importSummary,
  previewRows,
  sampleFile,
  sourceColumns,
  templateCsv,
} from "@/lib/import-data";
import { cn } from "@/lib/utils";

const steps = ["Method", "Upload", "Map columns", "Identity", "Preview", "Confirm"] as const;
type Method = "file" | "sheet" | "manual";

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Employee import wizard (checklist §4.2), used in the setup wizard and on People & Teams. */
export function EmployeeImportWizard({ onDone }: { onDone?: (count: number) => void }) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<Method>("file");
  const [fileError, setFileError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sheetUrl, setSheetUrl] = useState("");
  const [manual, setManual] = useState<{ code: string; name: string; mobile: string }[]>([]);
  const [draft, setDraft] = useState({ code: "", name: "", mobile: "" });
  const [mapping, setMapping] = useState<Record<string, CanonicalKey>>(
    Object.fromEntries(sourceColumns.map((c) => [c.name, c.suggested])),
  );
  const [identity, setIdentity] = useState({
    primary: "employee_code",
    hint: "mobile_e164",
    dedup: "employee_code",
  });
  const [importing, setImporting] = useState<"idle" | "running" | "done">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const mappedKeys = Object.values(mapping);
  const missingRequired = canonicalFields.filter((f) => f.required && !mappedKeys.includes(f.key));
  const validCount = importSummary.total - importSummary.errors - importSummary.duplicatesSkipped;

  useEffect(() => {
    if (progress <= 0 || progress >= 100) return;
    const t = window.setTimeout(() => setProgress((p) => Math.min(100, p + 20)), 180);
    return () => window.clearTimeout(t);
  }, [progress]);

  useEffect(() => {
    if (progress === 100) setUploaded(true);
  }, [progress]);

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    if (!/\.(csv|xlsx|xls)$/i.test(file.name))
      return setFileError("Invalid format. Use CSV or XLSX.");
    if (file.size > 20 * 1024 * 1024) return setFileError("File too large (max 20MB).");
    setFileError("");
    setProgress(10);
  };

  const canNext =
    step === 0 ||
    (step === 1 &&
      ((method === "file" && uploaded) ||
        (method === "sheet" && /docs\.google\.com\/spreadsheets/.test(sheetUrl)) ||
        (method === "manual" && manual.length > 0))) ||
    (step === 2 && missingRequired.length === 0) ||
    step >= 3;

  const runImport = () => {
    setImporting("running");
    window.setTimeout(() => {
      setImporting("done");
      const count = method === "manual" ? manual.length : validCount;
      toast.success(`${count} employees imported successfully.`);
      onDone?.(count);
    }, 1500);
  };

  if (importing === "done") {
    const count = method === "manual" ? manual.length : validCount;
    return (
      <div className="space-y-4 py-6 text-center" role="status">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <div>
          <p className="text-lg font-semibold">{count} employees imported</p>
          {method !== "manual" && (
            <p className="text-sm text-muted-foreground">
              {importSummary.duplicatesSkipped} duplicate skipped · {importSummary.errors} rows with
              errors not imported · {importSummary.exitedKept} exited employee kept for history
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" asChild>
            <a href="/connectors/mapping?tab=identity">Identity resolution queue (7)</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/people">Employee list</a>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setImporting("idle");
              setStep(0);
              setUploaded(false);
              setProgress(0);
            }}
          >
            Import another file
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ol className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Import steps">
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "flex items-center gap-1.5",
              i === step ? "font-semibold text-primary" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-5 place-items-center rounded-full border text-[10px]",
                i < step && "border-success bg-success text-success-foreground",
                i === step && "border-primary",
              )}
            >
              {i < step ? <Check className="size-3" /> : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Import method">
            {(
              [
                ["file", "Upload CSV / Excel", "Up to 50,000 rows and 20 MB", FileSpreadsheet],
                ["sheet", "Google Sheet link", "Paste a link to a shared sheet", Link2],
                ["manual", "Manual entry", "Add people one by one", PenLine],
              ] as const
            ).map(([value, title, detail, Icon]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={method === value}
                onClick={() => setMethod(value)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  method === value
                    ? "border-2 border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
              >
                <Icon className="size-5 text-primary" />
                <p className="mt-3 font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </button>
            ))}
          </div>
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={() => download("veronyx_employee_template.csv", templateCsv())}
          >
            <Download /> Download the employee template (CSV)
          </Button>
        </div>
      )}

      {step === 1 && method === "file" && (
        <div className="space-y-3">
          {!uploaded && progress === 0 && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files[0]);
              }}
              className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-primary/50 bg-primary/5 p-8 text-center"
            >
              <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Upload />
              </span>
              <p className="mt-4 font-semibold">Drag & drop your CSV or Excel file</p>
              <p className="mt-1 text-sm text-muted-foreground">Max 50,000 rows and 20 MB</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
                <Button variant="outline" onClick={() => setProgress(10)}>
                  Use sample file
                </Button>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="sr-only"
                aria-label="Choose employee file"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>
          )}
          {fileError && (
            <p role="alert" className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" /> {fileError}
            </p>
          )}
          {progress > 0 && (
            <div className="rounded-md border border-border p-4" aria-live="polite">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className={uploaded ? "text-success" : "text-primary"} />
                <div className="flex-1">
                  <p className="font-medium">{sampleFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {uploaded
                      ? `${sampleFile.rows} rows · ${sampleFile.sizeKb} KB · header found on row ${sampleFile.headerRow}`
                      : `Uploading… ${progress}%`}
                  </p>
                </div>
                {uploaded && <Check className="text-success" />}
              </div>
              {!uploaded && (
                <Progress value={progress} className="mt-3" aria-label="Upload progress" />
              )}
            </div>
          )}
        </div>
      )}

      {step === 1 && method === "sheet" && (
        <div className="space-y-2">
          <Label htmlFor="sheet-url">Google Sheet link</Label>
          <Input
            id="sheet-url"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/…"
            aria-describedby="sheet-help"
          />
          <p id="sheet-help" className="text-xs text-muted-foreground">
            Share the sheet with import@veronyx.in (viewer). We read the first tab with a header
            row.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSheetUrl("https://docs.google.com/spreadsheets/d/1RKmills-employees/edit")
            }
          >
            Use sample sheet
          </Button>
        </div>
      )}

      {step === 1 && method === "manual" && (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_1.5fr_1fr_auto]">
            <Input
              aria-label="Employee code"
              placeholder="Employee code *"
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
            />
            <Input
              aria-label="Full name"
              placeholder="Full name *"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <Input
              aria-label="Mobile"
              placeholder="Mobile (+91)"
              value={draft.mobile}
              onChange={(e) => setDraft({ ...draft, mobile: e.target.value })}
            />
            <Button
              disabled={!draft.code.trim() || !draft.name.trim()}
              onClick={() => {
                setManual([...manual, draft]);
                setDraft({ code: "", name: "", mobile: "" });
              }}
            >
              <Plus /> Add
            </Button>
          </div>
          {manual.length > 0 && (
            <ul className="divide-y divide-border rounded-md border border-border text-sm">
              {manual.map((m) => (
                <li key={m.code} className="flex justify-between p-3">
                  <span>
                    {m.name}{" "}
                    <span className="font-mono text-xs text-muted-foreground">{m.code}</span>
                  </span>
                  <span className="text-muted-foreground">{m.mobile || "No mobile"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Header row detected automatically. Indian formats are understood: dates as DD/MM/YYYY,
            numbers like 1,00,000, “₹” is stripped, and mobiles default to +91.
          </p>
          {missingRequired.length > 0 && (
            <p role="alert" className="text-sm text-destructive">
              Map the required field{missingRequired.length > 1 ? "s" : ""}:{" "}
              {missingRequired.map((f) => f.label).join(", ")}.
            </p>
          )}
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Column in your file</th>
                  <th className="p-3 font-medium">Sample values</th>
                  <th className="p-3 font-medium">Maps to</th>
                  <th className="p-3 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {sourceColumns.map((col) => (
                  <tr key={col.name} className="border-t border-border">
                    <td className="p-3 font-mono text-xs">{col.name}</td>
                    <td className="p-3 text-xs text-muted-foreground">{col.samples.join(" · ")}</td>
                    <td className="p-2">
                      <Select
                        value={mapping[col.name] ?? "ignore"}
                        onValueChange={(v) =>
                          setMapping({ ...mapping, [col.name]: v as CanonicalKey })
                        }
                      >
                        <SelectTrigger className="h-9" aria-label={`Map ${col.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {canonicalFields.map((f) => (
                            <SelectItem key={f.key} value={f.key}>
                              {f.label}
                              {f.required ? " *" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <StatusBadge
                        tone={
                          col.confidence === "high"
                            ? "success"
                            : col.confidence === "medium"
                              ? "neutral"
                              : "warning"
                        }
                      >
                        {col.confidence}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["primary", "Primary identifier", "How we recognise each person"],
              ["hint", "Identity hint", "Used to match data from other tools"],
              ["dedup", "Duplicate check (dedup key)", "Rows with the same value are skipped"],
            ] as const
          ).map(([key, label, help]) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Select
                value={identity[key]}
                onValueChange={(v) => setIdentity({ ...identity, [key]: v })}
              >
                <SelectTrigger aria-label={label}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee_code">Employee code</SelectItem>
                  <SelectItem value="work_email">Work email</SelectItem>
                  <SelectItem value="mobile_e164">Mobile number</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{help}</p>
            </div>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <p className="text-sm">
            Showing the first 20 of {importSummary.total} rows.{" "}
            <span className="font-medium text-destructive">{importSummary.errors} errors</span> ·{" "}
            <span className="font-medium text-warning">{importSummary.warnings} warnings</span>
          </p>
          <div className="max-h-80 overflow-auto rounded-md border border-border">
            <table className="w-full min-w-[640px] text-xs">
              <thead className="sticky top-0 bg-muted text-left text-muted-foreground">
                <tr>
                  {["Row", "Code", "Name", "Email", "Mobile", "Department", "Joined", "Status"].map(
                    (h) => (
                      <th key={h} className="p-2 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r) => (
                  <tr
                    key={r.row}
                    className={cn("border-t border-border", r.error && "bg-destructive/5")}
                  >
                    <td className="p-2 text-muted-foreground">{r.row}</td>
                    <td
                      className={cn(
                        "p-2 font-mono",
                        r.error?.field === "code" && "font-semibold text-destructive",
                      )}
                    >
                      {r.code}
                    </td>
                    <td className={cn("p-2", r.error?.field === "name" && "text-destructive")}>
                      {r.name || "—"}
                    </td>
                    <td
                      className={cn(
                        "p-2",
                        r.error?.field === "email" && "font-semibold text-destructive",
                      )}
                    >
                      {r.email}
                    </td>
                    <td className="p-2">{r.mobile || "—"}</td>
                    <td className="p-2">{r.department}</td>
                    <td className="p-2">{r.joined}</td>
                    <td className="p-2">
                      {r.error ? (
                        <span className="text-destructive">✕ {r.error.message}</span>
                      ) : r.warning ? (
                        <span className="text-warning">⚠ {r.warning}</span>
                      ) : (
                        <span className="text-success">✓ OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Fix in file and re-upload
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStep(2)}>
              Map differently
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md border border-border p-3">
              <dt className="text-xs text-muted-foreground">Employees ready</dt>
              <dd className="text-2xl font-bold">
                {method === "manual" ? manual.length : validCount}
              </dd>
            </div>
            <div className="rounded-md border border-border p-3">
              <dt className="text-xs text-muted-foreground">Warnings</dt>
              <dd className="text-2xl font-bold text-warning">
                {method === "manual" ? 0 : importSummary.warnings}
              </dd>
            </div>
            <div className="rounded-md border border-border p-3">
              <dt className="text-xs text-muted-foreground">Errors (skipped)</dt>
              <dd className="text-2xl font-bold text-destructive">
                {method === "manual" ? 0 : importSummary.errors}
              </dd>
            </div>
          </dl>
          {method !== "manual" && (
            <p className="text-sm text-muted-foreground">
              {importSummary.duplicatesSkipped} duplicate found by the dedup key will be skipped.
            </p>
          )}
          {importing === "running" && (
            <div aria-live="polite" className="space-y-2">
              <p className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" /> Importing employees…
              </p>
              <Progress value={66} aria-label="Import progress" />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between gap-2 border-t border-border pt-4">
        <Button
          variant="outline"
          disabled={step === 0 || importing === "running"}
          onClick={() => setStep(method === "manual" && step === 5 ? 1 : step - 1)}
        >
          Back
        </Button>
        {step < 5 ? (
          <Button
            disabled={!canNext}
            onClick={() => setStep(method === "manual" && step === 1 ? 5 : step + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button disabled={importing === "running"} onClick={runImport}>
            Import valid rows
          </Button>
        )}
      </div>
    </div>
  );
}
