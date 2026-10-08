import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FlaskConical,
  History,
  Loader2,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dryRunReport,
  initialSteps,
  stepPalette,
  validateWorkflow,
  type StepKind,
  type WorkflowStep,
  workflows,
} from "@/lib/admin-data";
import { formatIndianNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function WorkflowBuilderPage({ workflowId }: { workflowId: string }) {
  const workflow = workflows.find((w) => w.id === workflowId);
  const isNew = !workflow;
  const [name, setName] = useState(workflow?.name ?? "New workflow");
  const [steps, setSteps] = useState<WorkflowStep[]>(
    isNew ? initialSteps.slice(0, 1) : initialSteps,
  );
  const [selectedId, setSelectedId] = useState<string>(initialSteps[4]?.id ?? "s1");
  const [dryRun, setDryRun] = useState<"idle" | "running" | "done">("idle");
  const [publishOpen, setPublishOpen] = useState(false);
  const [saved, setSaved] = useState("Saved");
  const { openCopilot, aiAvailable } = useAppStore();
  const issues = validateWorkflow(steps);
  const errors = issues.filter((i) => i.severity === "error");
  const selected = steps.find((s) => s.id === selectedId);
  const runInProgress = workflow?.lastRunResult === "running";

  useEffect(() => {
    setSaved("Saving…");
    const timer = window.setTimeout(() => setSaved("Saved just now"), 700);
    return () => window.clearTimeout(timer);
  }, [steps, name]);

  const addStep = (kind: StepKind) => {
    const palette = stepPalette.find((p) => p.kind === kind);
    const step = {
      id: `s${Date.now()}`,
      kind,
      title: palette?.title ?? kind,
      summary: kind === "reward" ? "" : "Not set up yet",
    };
    setSteps((current) => [...current, step]);
    setSelectedId(step.id);
  };
  const updateSelected = (summary: string) =>
    setSteps((current) => current.map((s) => (s.id === selectedId ? { ...s, summary } : s)));
  const move = (index: number, delta: number) =>
    setSteps((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (item) next.splice(index + delta, 0, item);
      return next;
    });
  const remove = (id: string) => {
    const previous = steps;
    setSteps((current) => current.filter((s) => s.id !== id));
    toast("Step removed", { action: { label: "Undo", onClick: () => setSteps(previous) } });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <a href="/workflows" className="text-sm text-muted-foreground hover:text-foreground">
            ← Workflows
          </a>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Workflow name"
            className="h-10 max-w-md text-lg font-semibold"
          />
          <p className="text-xs text-muted-foreground">
            {saved} · Draft of v{(workflow?.version ?? 0) + 1}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && (
            <Button variant="ghost" asChild>
              <a href={`/workflows/${workflowId}/runs`}>
                <History /> Runs & versions
              </a>
            </Button>
          )}
          {aiAvailable && (
            <Button
              variant="outline"
              onClick={() => openCopilot("Explain what this workflow does")}
            >
              <Sparkles /> AI Assist
            </Button>
          )}
          <Button
            variant="outline"
            disabled={errors.length > 0}
            onClick={() => {
              setDryRun("running");
              window.setTimeout(() => setDryRun("done"), 1400);
            }}
          >
            <FlaskConical /> Test run
          </Button>
          <Button disabled={errors.length > 0} onClick={() => setPublishOpen(true)}>
            <Play /> Publish
          </Button>
        </div>
      </div>

      {!isNew && (
        <Alert>
          <Users className="size-4" />
          <AlertTitle>Vikram Rao is also editing this workflow</AlertTitle>
          <AlertDescription>
            Your changes are kept separately. You will be asked to compare before publishing.
          </AlertDescription>
        </Alert>
      )}
      {runInProgress && (
        <Alert>
          <Loader2 className="size-4 animate-spin" />
          <AlertTitle>A run is in progress</AlertTitle>
          <AlertDescription>
            You can keep editing. Changes apply from the next run.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_320px]">
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Add a step</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stepPalette.map((p) => (
              <button
                key={p.kind}
                type="button"
                onClick={() => addStep(p.kind)}
                className="flex w-full items-start gap-2 rounded-md border border-border p-2.5 text-left hover:bg-muted"
              >
                <Plus className="mt-0.5 size-4 text-primary" />
                <span>
                  <span className="block text-sm font-medium">{p.title}</span>
                  <span className="block text-xs text-muted-foreground">{p.description}</span>
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-2" aria-label="Workflow steps">
          {steps.map((step, index) => {
            const stepIssues = issues.filter((i) => i.stepId === step.id);
            return (
              <div key={step.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(step.id)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedId(step.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border bg-card p-4",
                    selectedId === step.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border",
                    stepIssues.length > 0 && "border-destructive",
                  )}
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Step {index + 1}</p>
                    <p className="font-medium">{step.title}</p>
                    <p
                      className={cn(
                        "text-sm",
                        step.summary ? "text-muted-foreground" : "text-destructive",
                      )}
                    >
                      {step.summary || "Amount missing"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(index, -1);
                      }}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Move down"
                      disabled={index === steps.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(index, 1);
                      }}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove step"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(step.id);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                {index < steps.length - 1 && <div className="mx-auto h-4 w-px bg-border" />}
              </div>
            );
          })}
          {steps.length <= 1 && aiAvailable && (
            <Card className="rounded-lg border-dashed">
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center text-sm">
                <p>
                  Add steps from the left, or let AI draft a first version from your description.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCopilot("Suggest a workflow for safety suggestions")}
                >
                  <Sparkles /> Draft with AI
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Step settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected ? (
                <>
                  <p className="font-medium">{selected.title}</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="step-summary">
                      {selected.kind === "reward" ? "Points per person" : "Setting"}
                    </Label>
                    <Input
                      id="step-summary"
                      value={selected.summary}
                      onChange={(e) => updateSelected(e.target.value)}
                      placeholder={selected.kind === "reward" ? "e.g. 500 points" : ""}
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a step to change it.</p>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                Checks
                {issues.length === 0 ? (
                  <StatusBadge tone="success">All good</StatusBadge>
                ) : (
                  <StatusBadge tone={errors.length ? "error" : "warning"}>
                    {issues.length} to review
                  </StatusBadge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.code + (issue.stepId ?? "")}
                  className="space-y-1 rounded-md border border-border p-3 text-sm"
                >
                  <p className="flex items-center gap-1.5 font-medium">
                    {issue.severity === "error" ? (
                      <XCircle className="size-4 text-destructive" />
                    ) : (
                      <AlertTriangle className="size-4 text-warning" />
                    )}
                    {issue.code} · {issue.message}
                  </p>
                  <p className="text-xs text-muted-foreground">{issue.fix}</p>
                  {aiAvailable && (
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => openCopilot(`Fix the validation problems: ${issue.message}`)}
                    >
                      <Sparkles /> Ask AI to fix
                    </Button>
                  )}
                </div>
              ))}
              {issues.length === 0 && (
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-success" /> Ready for a test run.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dryRun !== "idle"} onOpenChange={(open) => !open && setDryRun("idle")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test run report</DialogTitle>
            <DialogDescription>
              Uses September data. No points are given and nobody is messaged.
            </DialogDescription>
          </DialogHeader>
          {dryRun === "running" ? (
            <div className="flex items-center gap-2 py-10 text-sm">
              <Loader2 className="size-4 animate-spin" /> Checking 48 people…
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md border border-border p-3">
                  <p className="text-2xl font-bold">{dryRunReport.qualified}</p>
                  <p className="text-xs text-muted-foreground">
                    of {dryRunReport.evaluated} qualify
                  </p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-2xl font-bold text-reward">
                    {formatIndianNumber(dryRunReport.totalPoints)}
                  </p>
                  <p className="text-xs text-muted-foreground">points would go out</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-2xl font-bold">
                    ₹{formatIndianNumber(dryRunReport.budgetAfter)}
                  </p>
                  <p className="text-xs text-muted-foreground">budget left after</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sales vs target</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dryRunReport.rows.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.value}%</TableCell>
                      <TableCell>
                        <StatusBadge tone={row.points ? "success" : "neutral"}>
                          {row.result}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">{row.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDryRun("idle")}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish “{name}”?</DialogTitle>
            <DialogDescription>
              It will run from the next trigger. Rewards still wait for approval — nothing is paid
              automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPublishOpen(false);
                toast.success(`Published as v${(workflow?.version ?? 0) + 1}`);
              }}
            >
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
