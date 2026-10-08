import {
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  LockKeyhole,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { decisionTrace, workflowRuns, workflowVersions, workflows } from "@/lib/admin-data";
import { explainOutcome } from "@/lib/insights-evidence";
import { employees } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const resultTone = { success: "success", failed: "error", running: "warning" } as const;
const resultLabel = { success: "Worked", failed: "Failed", running: "Running" } as const;

/** Step-by-step log for a run (W-14). */
function stepLog(
  runId: string,
  result: "success" | "failed" | "running",
  evaluated: number,
  rewarded: number,
) {
  const base = [
    {
      time: "18:30:01",
      text: "Trigger fired: sales_file.imported (monthly_sales_september.xlsx)",
      ok: true,
    },
    {
      time: "18:30:04",
      text: `Filter: Sales department · active → ${evaluated} people (1 exited employee excluded automatically)`,
      ok: true,
    },
  ];
  if (result === "failed")
    return [
      ...base,
      {
        time: "18:30:41",
        text: "Aggregate failed: column “Target” missing in the sales file — run stopped, nothing paid",
        ok: false,
      },
    ];
  return [
    ...base,
    {
      time: "18:30:12",
      text: `Threshold sales_vs_target ≥ 100% → ${rewarded} qualified`,
      ok: true,
    },
    {
      time: "18:30:15",
      text: `Approval: ${rewarded} requests sent to reporting managers (48h SLA)`,
      ok: true,
    },
    {
      time: "18:30:16",
      text: `Budget: ₹ ${(rewarded * 500).toLocaleString("en-IN")} reserved from Sales A — Vikram`,
      ok: true,
    },
    { time: "18:30:18", text: `Run ${runId} finished`, ok: true },
  ];
}

export function WorkflowRunsPage({ workflowId }: { workflowId: string }) {
  const workflow = workflows.find((w) => w.id === workflowId) ?? workflows[1];
  const [restore, setRestore] = useState<number | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [code, setCode] = useState(decisionTrace.code);
  const [runId, setRunId] = useState("run-117");
  const failed = workflowRuns.find((r) => r.result === "failed");
  const trace = explainOutcome(code);
  const firstFail = trace?.steps.find((s) => s.passed === false);
  const salesPeople = employees.filter((e) => e.department === "Sales").slice(0, 24);

  return (
    <div className="space-y-6">
      <a
        href={`/workflows/${workflow?.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to builder
      </a>
      <PageHeading
        eyebrow="Run history & versions"
        title={workflow?.name ?? "Workflow"}
        description="Every run, every version, and why each person did or did not get a reward."
        action={<Button onClick={() => setTraceOpen(true)}>Explain a decision</Button>}
      />
      {failed && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>Last run failed ({failed.started})</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            {failed.error}
            <Button size="sm" variant="outline" asChild>
              <a href="/connectors/mapping">Fix the file mapping</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>
        <TabsContent value="runs">
          <Card className="overflow-x-auto rounded-lg">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Run</th>
                  <th className="p-3 font-medium">Started</th>
                  <th className="p-3 font-medium">Result</th>
                  <th className="p-3 font-medium">Checked</th>
                  <th className="p-3 font-medium">Rewarded</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {workflowRuns.map((run) => (
                  <Fragment key={run.id}>
                    <tr className="border-b border-border">
                      <td className="p-3">
                        <button
                          type="button"
                          className="flex items-center gap-1 font-medium text-primary"
                          aria-expanded={expanded === run.id}
                          onClick={() => setExpanded(expanded === run.id ? null : run.id)}
                        >
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform",
                              expanded === run.id && "rotate-180",
                            )}
                          />
                          {run.id}
                        </button>
                      </td>
                      <td className="p-3">
                        {run.started} · {run.duration}
                      </td>
                      <td className="p-3">
                        <StatusBadge tone={resultTone[run.result]}>
                          {resultLabel[run.result]}
                        </StatusBadge>
                      </td>
                      <td className="p-3">{run.evaluated}</td>
                      <td className="p-3">{run.rewarded}</td>
                      <td className="p-3 text-right">
                        {run.result === "failed" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toast("Re-run queued. It will use the corrected file once uploaded.")
                            }
                          >
                            <RotateCcw /> Re-run
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRunId(run.id);
                              setTraceOpen(true);
                            }}
                          >
                            See decisions
                          </Button>
                        )}
                      </td>
                    </tr>
                    {expanded === run.id && (
                      <tr className="border-b border-border bg-muted/40">
                        <td colSpan={6} className="p-4">
                          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                            Step log
                          </p>
                          <ol className="relative space-y-2 border-l border-border pl-4">
                            {stepLog(run.id, run.result, run.evaluated, run.rewarded).map((l) => (
                              <li key={l.time + l.text} className="text-sm">
                                <span
                                  className={cn(
                                    "absolute -left-[5px] mt-1.5 size-2.5 rounded-full",
                                    l.ok ? "bg-success" : "bg-destructive",
                                  )}
                                  aria-hidden
                                />
                                <span className="font-mono text-xs text-muted-foreground">
                                  {l.time}
                                </span>{" "}
                                <span className={l.ok ? "" : "font-medium text-destructive"}>
                                  {l.text}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
        <TabsContent value="versions">
          <Card className="rounded-lg">
            <CardContent className="divide-y divide-border p-0">
              {workflowVersions.map((v, i) => (
                <div
                  key={v.version}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      Version {v.version}{" "}
                      {v.current && <StatusBadge tone="success">Live</StatusBadge>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {v.note} · {v.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Activated {v.date} 09:00
                      {i > 0
                        ? ` · Deactivated ${workflowVersions[i - 1]?.date} 09:00`
                        : " · still active"}
                    </p>
                  </div>
                  {!v.current && (
                    <Button size="sm" variant="outline" onClick={() => setRestore(v.version)}>
                      Restore
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={restore !== null} onOpenChange={(o) => !o && setRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore version {restore}?</DialogTitle>
            <DialogDescription>
              This creates a new draft from version {restore}. The live version keeps running until
              you activate the draft.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestore(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(`Draft created from version ${restore}`);
                setRestore(null);
              }}
            >
              Create draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={traceOpen} onOpenChange={setTraceOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Decision trace</DialogTitle>
            <DialogDescription className="flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" /> Private — only HR, the owner and the person's
              manager can see this.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Employee</p>
              <Select value={code} onValueChange={setCode}>
                <SelectTrigger aria-label="Employee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {salesPeople.map((e) => (
                    <SelectItem key={e.code} value={e.code}>
                      {e.name} · {e.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Run</p>
              <Select value={runId} onValueChange={setRunId}>
                <SelectTrigger aria-label="Run">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workflowRuns
                    .filter((r) => r.result !== "failed")
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.id} · {r.started}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {trace && (
            <div className="space-y-4">
              <div
                className={cn(
                  "rounded-md p-3 text-sm",
                  trace.outcome === "Rewarded" ? "bg-success/10" : "bg-private-surface",
                )}
              >
                <p className="font-semibold">
                  {trace.employee.name}: {trace.outcome}
                </p>
                <p className="text-muted-foreground">
                  {firstFail
                    ? `Stopped at “${firstFail.title}”: ${firstFail.detail}.`
                    : "Passed every step and was rewarded."}
                </p>
                {firstFail?.title === "Check a rule" && (
                  <p className="mt-1 text-muted-foreground">
                    What would have been needed: sales of at least ₹ 5,00,000 (100% of target).
                  </p>
                )}
              </div>
              <ol className="space-y-3">
                {trace.steps.map((step) => (
                  <li key={step.evidence.id} className="flex gap-3 text-sm">
                    {step.passed === true ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" aria-label="Passed" />
                    ) : step.passed === false ? (
                      <XCircle className="size-5 shrink-0 text-destructive" aria-label="Failed" />
                    ) : (
                      <CircleDashed
                        className="size-5 shrink-0 text-muted-foreground"
                        aria-label="Skipped"
                      />
                    )}
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-muted-foreground">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="group px-0">
                    <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />{" "}
                    Show me the data
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="space-y-1 rounded-md border border-border p-3 font-mono text-xs">
                    {trace.steps.map((s) => (
                      <li key={s.evidence.id}>
                        {s.evidence.id} — {s.evidence.source}
                      </li>
                    ))}
                    <li>
                      Source record: monthly_sales_september.xlsx · row for {trace.employee.code} ·{" "}
                      <a href="/connectors" className="text-primary underline">
                        view source
                      </a>
                    </li>
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTraceOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
