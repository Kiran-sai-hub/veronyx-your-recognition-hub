import {
  ArrowDown,
  ArrowUp,
  Award,
  BadgeCheck,
  Bell,
  CalendarClock,
  CircleStop,
  FileText,
  FlaskConical,
  Filter,
  Gauge,
  Gift,
  GitBranch,
  GripVertical,
  Hand,
  History,
  Hourglass,
  LayoutTemplate,
  ListOrdered,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Scale,
  ShieldCheck,
  Sigma,
  Sparkles,
  Target,
  Trash2,
  UserCheck,
  Users,
  Variable,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status-badge";
import { DryRunReport, ValidationReport } from "@/components/workflow-reports";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FormulaEditor } from "@/components/library/formula-editor";
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
import { Textarea } from "@/components/ui/textarea";
import { workflows as seededWorkflows } from "@/lib/admin-data";
import { formatRupees } from "@/lib/format";
import { go } from "@/lib/navigate";
import { cn } from "@/lib/utils";
import {
  type AutoFix,
  type Check,
  type DryRunResult,
  type FieldDef,
  type Step,
  type StepKind,
  type StepValue,
  type Trigger,
  type TriggerType,
  type WorkflowDraft,
  applyAutoFix,
  blankDraft,
  describeStep,
  describeTrigger,
  draftForWorkflow,
  hasErrors,
  makeStep,
  metricCatalog,
  newId,
  simulateDryRun,
  stepCatalog,
  stepOrder,
  templateById,
  validateDraft,
  walletPools,
  workflowTemplates,
} from "@/lib/workflow-model";
import { useDemoStore } from "@/store/demo-store";

export const stepIcons: Record<StepKind, LucideIcon> = {
  filter: Filter,
  aggregate: Sigma,
  rank: ListOrdered,
  threshold: Gauge,
  branch: GitBranch,
  approval: UserCheck,
  reward: Gift,
  recognise: Award,
  badge: BadgeCheck,
  notify: Bell,
  wait: Hourglass,
  set_var: Variable,
  end: CircleStop,
};

const triggerIcons: Record<TriggerType, LucideIcon> = {
  event: Zap,
  schedule: CalendarClock,
  manual: Hand,
};

type Selection =
  | { type: "meta" }
  | { type: "scope" }
  | { type: "budget" }
  | { type: "policies" }
  | { type: "trigger"; id: string }
  | { type: "step"; id: string };

type DryRunState =
  | { status: "idle" }
  | { status: "config" }
  | { status: "running"; done: number }
  | { status: "done"; result: DryRunResult }
  | { status: "failed"; error: string; period: string };

type BuilderProps = {
  workflowId: string;
  templateId?: string | undefined;
  fromAi?: boolean | undefined;
  readOnly?: boolean;
  aiEnabled: boolean;
  onAskAi: (prompt: string) => void;
};

function nextRunDate() {
  return "01/11/2026 06:00";
}

export function WorkflowBuilderPage({
  workflowId,
  templateId,
  fromAi = false,
  readOnly = false,
  aiEnabled,
  onAskAi,
}: BuilderProps) {
  const { savedWorkflows, saveWorkflow, workflowStatus } = useDemoStore();
  const seeded = seededWorkflows.find((w) => w.id === workflowId);
  const saved = savedWorkflows.find((w) => w.id === workflowId);
  const isNew = workflowId === "new";

  const initial = useMemo(() => {
    if (saved?.draft) return { current: saved.draft as WorkflowDraft, previous: null };
    const seededDraft = draftForWorkflow(workflowId);
    if (seededDraft) return seededDraft;
    const template = templateById(templateId);
    if (template) return { current: template.build(), previous: null };
    return { current: blankDraft(), previous: null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId, templateId]);

  const [started, setStarted] = useState(!isNew || Boolean(templateId) || fromAi);
  const [draft, setDraftState] = useState<WorkflowDraft>(initial.current);
  const [selection, setSelection] = useState<Selection>(
    initial.current.steps[0] ? { type: "step", id: initial.current.steps[0].id } : { type: "meta" },
  );
  const [validated, setValidated] = useState(false);
  const [dirtySinceDryRun, setDirtySinceDryRun] = useState(true);
  const [dryRun, setDryRun] = useState<DryRunState>({ status: "idle" });
  const [periods, setPeriods] = useState("3");
  const [activateOpen, setActivateOpen] = useState(false);
  const [autosave, setAutosave] = useState("All changes saved");
  const [edited, setEdited] = useState(false);
  const [conflict, setConflict] = useState(workflowId === "wf-sales");
  const [dragKind, setDragKind] = useState<StepKind | null>(null);
  const [dragStep, setDragStep] = useState<string | null>(null);
  const moveTo = (id: string, target: number) =>
    update((d) => {
      const steps = [...d.steps];
      const from = steps.findIndex((s) => s.id === id);
      if (from < 0) return d;
      const [item] = steps.splice(from, 1);
      if (item) steps.splice(target > from ? target - 1 : target, 0, item);
      return { ...d, steps };
    });

  const checks = validateDraft(draft);
  const blocking = hasErrors(checks);
  const status = workflowStatus[workflowId] ?? saved?.status ?? seeded?.status ?? "draft";
  const version = Math.max(draft.version, saved?.version ?? 0);
  const canActivate = !blocking && !dirtySinceDryRun && !readOnly;

  useEffect(() => {
    if (readOnly || !edited) return;
    setAutosave("Saving…");
    const timer = window.setTimeout(() => setAutosave("Draft autosaved just now"), 600);
    return () => window.clearTimeout(timer);
  }, [draft, readOnly, edited]);

  const update = (next: WorkflowDraft | ((d: WorkflowDraft) => WorkflowDraft)) => {
    if (readOnly) return;
    setDraftState(next);
    setDirtySinceDryRun(true);
    setEdited(true);
  };

  const updateStep = (id: string, patch: Partial<Step>) =>
    update((d) => ({ ...d, steps: d.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const insertStep = (kind: StepKind, at?: number) => {
    const step = makeStep(kind);
    update((d) => {
      const steps = [...d.steps];
      const endIdx = steps.findIndex((s) => s.kind === "end");
      const index = at ?? (endIdx >= 0 && kind !== "end" ? endIdx : steps.length);
      steps.splice(index, 0, step);
      return { ...d, steps };
    });
    setSelection({ type: "step", id: step.id });
  };

  const move = (index: number, delta: number) =>
    update((d) => {
      const steps = [...d.steps];
      const [item] = steps.splice(index, 1);
      if (item) steps.splice(index + delta, 0, item);
      return { ...d, steps };
    });

  const remove = (id: string) => {
    const previous = draft;
    update((d) => ({ ...d, steps: d.steps.filter((s) => s.id !== id) }));
    toast("Step removed", { action: { label: "Undo", onClick: () => setDraftState(previous) } });
  };

  const addTrigger = (type: TriggerType) => {
    const defaults: Record<TriggerType, Record<string, StepValue>> = {
      event: { event_type: "sales_file.imported", filter: "", debounce_minutes: 30 },
      schedule: {
        cron: "Monthly on the 1st at 06:00",
        window: "previous calendar month",
        late_data_grace_hours: 24,
      },
      manual: { allowed_roles: "HR Admin", parameters: "" },
    };
    const trigger: Trigger = { id: newId("t"), type, config: defaults[type] };
    update((d) => ({ ...d, triggers: [...d.triggers, trigger] }));
    setSelection({ type: "trigger", id: trigger.id });
  };

  const autoFix = (fix: AutoFix) => {
    update((d) => applyAutoFix(d, fix));
    toast.success("Fixed. Re-validating…");
  };

  const runDryRun = () => {
    const count = Number(periods);
    setDryRun({ status: "running", done: 0 });
    for (let i = 1; i <= count; i++) {
      window.setTimeout(() => setDryRun({ status: "running", done: i }), 550 * i);
    }
    window.setTimeout(
      () => {
        try {
          const result = simulateDryRun(draft, count, initial.previous);
          setDryRun({ status: "done", result });
          setDirtySinceDryRun(false);
        } catch (error) {
          setDryRun({ status: "failed", error: (error as Error).message, period: "2026-09" });
        }
      },
      550 * (count + 1),
    );
  };

  const persist = (nextStatus: "draft" | "live") => {
    const id = isNew ? `wf-${newId("u")}` : workflowId;
    const nextVersion = version + 1;
    const nextDraft = { ...draft, id, version: nextVersion };
    saveWorkflow({
      id,
      name: draft.name || "Untitled workflow",
      status: nextStatus,
      version: nextVersion,
      savedAt: Date.now(),
      fromAi,
      trigger: draft.triggers[0] ? describeTrigger(draft.triggers[0]) : "No trigger",
      draft: nextDraft,
    });
    setDraftState(nextDraft);
    if (nextStatus === "live")
      toast.success(`Workflow activated. First run scheduled for ${nextRunDate()}.`);
    else toast.success(`Workflow saved as draft (v${nextVersion}).`);
    if (isNew) go(`/workflows/${id}`, { replace: true });
  };

  if (!started) {
    return (
      <StartChooser aiEnabled={aiEnabled} onAskAi={onAskAi} onBlank={() => setStarted(true)} />
    );
  }

  const selectedStep =
    selection.type === "step" ? draft.steps.find((s) => s.id === selection.id) : undefined;
  const selectedTrigger =
    selection.type === "trigger" ? draft.triggers.find((t) => t.id === selection.id) : undefined;
  const issuesFor = (area: string) =>
    checks.filter(
      (c) =>
        c.status !== "pass" &&
        (
          { scope: ["V9", "V13"], budget: ["V7", "V8"], policies: ["V11", "V12"], meta: ["V1"] }[
            area
          ] ?? []
        ).includes(c.code),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 space-y-1">
          <a href="/workflows" className="text-sm text-muted-foreground hover:text-foreground">
            ← Workflows
          </a>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="sr-only">Workflow builder</h1>
            <Input
              value={draft.name}
              onChange={(e) => update({ ...draft, name: e.target.value })}
              aria-label="Workflow name"
              placeholder="Name this workflow"
              readOnly={readOnly}
              className="h-10 w-full max-w-md text-lg font-semibold"
            />
            <StatusBadge
              tone={status === "live" ? "success" : status === "paused" ? "private" : "neutral"}
            >
              {status === "live" ? "Active" : status === "paused" ? "Paused" : "Draft"}
            </StatusBadge>
            {fromAi && <StatusBadge tone="reward">From AI proposal</StatusBadge>}
          </div>
          <p className="text-xs text-muted-foreground">
            v{version} {status === "live" ? "is live" : ""} · editing creates v{version + 1} ·{" "}
            {readOnly ? "View only" : autosave}
          </p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            {!isNew && (
              <Button variant="ghost" asChild>
                <a href={`/workflows/${workflowId}/runs`}>
                  <History /> Runs & versions
                </a>
              </Button>
            )}
            {aiEnabled && (
              <Button
                variant="outline"
                onClick={() =>
                  onAskAi(
                    `Explain the workflow “${draft.name || "untitled"}” and suggest improvements`,
                  )
                }
              >
                <Sparkles /> AI Assist
              </Button>
            )}
            <Button variant="outline" onClick={() => setValidated(true)}>
              <ShieldCheck /> Validate
            </Button>
            <Button
              variant="outline"
              disabled={blocking}
              onClick={() => setDryRun({ status: "config" })}
            >
              <FlaskConical /> Run dry-run
            </Button>
            <Button variant="outline" disabled={blocking} onClick={() => persist("draft")}>
              <Save /> Save as draft
            </Button>
            <Button
              disabled={!canActivate}
              onClick={() => setActivateOpen(true)}
              title={
                canActivate
                  ? undefined
                  : "Needs validation with no errors and a dry-run of the latest changes"
              }
            >
              Save & activate
            </Button>
          </div>
        )}
      </div>

      {!readOnly && !canActivate && (edited || status !== "live") && (
        <p className="text-xs text-muted-foreground">
          To activate: {blocking ? "fix the validation errors" : "✓ validation passed"} ·{" "}
          {dirtySinceDryRun ? "run a dry-run of the latest changes" : "✓ dry-run done"}
        </p>
      )}
      {conflict && !readOnly && (
        <Alert>
          <Users className="size-4" />
          <AlertTitle>This workflow was modified by Vikram Rao. Please refresh.</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            Vikram saved v7 at 11:42. Refresh to load it — your unsaved changes are kept as a
            separate draft.
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setConflict(false);
                toast.success("Loaded the latest version");
              }}
            >
              <RefreshCw /> Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {seeded?.lastRunResult === "running" && (
        <Alert>
          <Loader2 className="size-4 animate-spin" />
          <AlertTitle>A run is in progress</AlertTitle>
          <AlertDescription>Edits will apply to the next version.</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "grid gap-4",
          readOnly ? "lg:grid-cols-[1fr_340px]" : "lg:grid-cols-[210px_1fr_340px]",
        )}
      >
        {!readOnly && (
          <Card className="hidden h-fit rounded-lg lg:sticky lg:top-20 lg:block">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Steps</CardTitle>
              <p className="text-xs text-muted-foreground">Drag onto the canvas or click to add.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
              {stepOrder.map((kind) => {
                const Icon = stepIcons[kind];
                return (
                  <button
                    key={kind}
                    type="button"
                    draggable
                    onDragStart={() => setDragKind(kind)}
                    onDragEnd={() => setDragKind(null)}
                    onClick={() => insertStep(kind)}
                    className="flex min-h-10 w-full items-center gap-2 rounded-md border border-border px-2.5 text-left text-sm hover:bg-muted"
                    title={stepCatalog[kind].description}
                  >
                    <GripVertical
                      className="hidden size-3.5 text-muted-foreground lg:block"
                      aria-hidden
                    />
                    <Icon className="size-4 text-primary" aria-hidden />
                    {stepCatalog[kind].label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="min-w-0 space-y-3" aria-label="Workflow canvas">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["meta", "Details", FileText],
                ["scope", "Scope", Target],
                ["budget", "Budget", Wallet],
                ["policies", "Policies", Scale],
              ] as const
            ).map(([type, label, Icon]) => {
              const issues = issuesFor(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelection({ type })}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-full border px-3 text-sm",
                    selection.type === type
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden /> {label}
                  {issues.length > 0 && (
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        issues.some((i) => i.status === "error") ? "bg-destructive" : "bg-warning",
                      )}
                      aria-label={`${issues.length} issue`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <section
            aria-label="Triggers"
            className="rounded-lg border border-dashed border-border bg-muted/30 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Starts when</p>
              {!readOnly && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Plus /> Add trigger
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => addTrigger("event")}>
                      <Zap /> Event (data arrives)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => addTrigger("schedule")}>
                      <CalendarClock /> Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => addTrigger("manual")}>
                      <Hand /> Manual
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {draft.triggers.length === 0 ? (
              <p className="text-sm text-destructive">
                No trigger yet — add one so the workflow can start.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {draft.triggers.map((t) => {
                  const Icon = triggerIcons[t.type];
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelection({ type: "trigger", id: t.id })}
                      className={cn(
                        "flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-left text-sm",
                        selection.type === "trigger" && selection.id === t.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border",
                      )}
                    >
                      <Icon className="size-4 text-primary" aria-hidden />
                      {describeTrigger(t)}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <ol className="space-y-0" aria-label="Steps">
            {draft.steps.map((step, index) => (
              <li key={step.id}>
                <DropZone
                  active={dragKind !== null || (dragStep !== null && dragStep !== step.id)}
                  onDrop={() => {
                    if (dragKind) insertStep(dragKind, index);
                    if (dragStep) moveTo(dragStep, index);
                    setDragKind(null);
                    setDragStep(null);
                  }}
                />
                <StepNode
                  step={step}
                  index={index}
                  total={draft.steps.length}
                  selected={selection.type === "step" && selection.id === step.id}
                  error={
                    (step.kind === "reward" &&
                      step.config["amount_mode"] !== "formula" &&
                      !(Number(step.config["amount"]) > 0)) ||
                    (step.kind === "end" && index !== draft.steps.length - 1)
                  }
                  readOnly={readOnly}
                  onSelect={() => setSelection({ type: "step", id: step.id })}
                  onMove={(delta) => move(index, delta)}
                  onRemove={() => remove(step.id)}
                  onDragStart={() => setDragStep(step.id)}
                  onDragEnd={() => setDragStep(null)}
                />
                {index < draft.steps.length - 1 && <Connector />}
              </li>
            ))}
            <li>
              <DropZone
                active={dragKind !== null || dragStep !== null}
                onDrop={() => {
                  if (dragKind) insertStep(dragKind);
                  if (dragStep) moveTo(dragStep, draft.steps.length);
                  setDragKind(null);
                  setDragStep(null);
                }}
                last
              />
            </li>
          </ol>
          {draft.steps.length <= 1 && aiEnabled && !readOnly && (
            <Card className="rounded-lg border-dashed">
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center text-sm">
                <p>
                  Add steps from the palette, start from a template, or let AI draft it from a
                  sentence.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onAskAi(
                      "Reward top 2 support agents monthly by CSAT, min 50 tickets. ₹2,000 to #1, ₹1,000 to #2. My approval needed.",
                    )
                  }
                >
                  <Sparkles /> Draft with AI
                </Button>
              </CardContent>
            </Card>
          )}

          {validated && (
            <Card className="rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Validation report</CardTitle>
              </CardHeader>
              <CardContent>
                <ValidationReport
                  checks={checks}
                  onAutoFix={readOnly ? undefined : autoFix}
                  onRevalidate={() => toast.success("Re-validated against the latest changes.")}
                  onAskAi={
                    aiEnabled && !readOnly
                      ? (c: Check) => onAskAi(`Fix validation ${c.code}: ${c.detail}`)
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit rounded-lg lg:sticky lg:top-20">
          <CardContent className="p-4">
            <fieldset disabled={readOnly} className="space-y-4">
              {selection.type === "meta" && <MetaPanel draft={draft} onChange={update} />}
              {selection.type === "scope" && <ScopePanel draft={draft} onChange={update} />}
              {selection.type === "budget" && <BudgetPanel draft={draft} onChange={update} />}
              {selection.type === "policies" && <PoliciesPanel draft={draft} onChange={update} />}
              {selectedTrigger && (
                <TriggerPanel
                  trigger={selectedTrigger}
                  onChange={(t) =>
                    update((d) => ({
                      ...d,
                      triggers: d.triggers.map((x) => (x.id === t.id ? t : x)),
                    }))
                  }
                  onRemove={() => {
                    update((d) => ({
                      ...d,
                      triggers: d.triggers.filter((x) => x.id !== selectedTrigger.id),
                    }));
                    setSelection({ type: "meta" });
                  }}
                />
              )}
              {selectedStep && (
                <StepPanel
                  step={selectedStep}
                  steps={draft.steps}
                  onChange={(patch) => updateStep(selectedStep.id, patch)}
                  onSelect={(id) => setSelection({ type: "step", id })}
                />
              )}
              {selection.type === "step" && !selectedStep && (
                <p className="text-sm text-muted-foreground">Select a step to configure it.</p>
              )}
            </fieldset>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={dryRun.status !== "idle"}
        onOpenChange={(o) => !o && setDryRun({ status: "idle" })}
      >
        <DialogContent
          className={cn(
            "max-h-[92vh] overflow-y-auto",
            dryRun.status === "done" ? "sm:max-w-5xl" : "sm:max-w-lg",
          )}
        >
          <DialogHeader>
            <DialogTitle>Dry-run{dryRun.status === "done" ? " results" : ""}</DialogTitle>
            <DialogDescription>
              Replays past periods with this version. No points are given and nobody is messaged.
            </DialogDescription>
          </DialogHeader>
          {dryRun.status === "config" && (
            <div className="space-y-2">
              <Label>Periods to simulate</Label>
              <Select value={periods} onValueChange={setPeriods}>
                <SelectTrigger aria-label="Periods">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "6"].map((n) => (
                    <SelectItem key={n} value={n}>
                      Last {n} period{n === "1" ? "" : "s"}
                      {n === "3" ? " (default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This may take 30–60 seconds on real data.
              </p>
            </div>
          )}
          {dryRun.status === "running" && (
            <div className="space-y-3 py-4" aria-live="polite">
              <p className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                {dryRun.done < Number(periods)
                  ? `Simulating period ${dryRun.done + 1} of ${periods}…`
                  : "Checking fairness and budget…"}
              </p>
              <Progress
                value={(dryRun.done / Number(periods)) * 100}
                aria-label="Dry-run progress"
              />
            </div>
          )}
          {dryRun.status === "failed" && (
            <div role="alert" className="space-y-2 rounded-md bg-destructive/10 p-4 text-sm">
              <p className="font-semibold text-destructive">
                Dry-run failed for period {dryRun.period}.
              </p>
              <p>{dryRun.error}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPeriods("1");
                    setDryRun({ status: "config" });
                  }}
                >
                  Retry with fewer periods
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <a href="/connectors">Connect a source</a>
                </Button>
              </div>
            </div>
          )}
          {dryRun.status === "done" && (
            <DryRunReport
              result={dryRun.result}
              pool={draft.budget.wallet}
              onRerun={() => setDryRun({ status: "config" })}
              actions={
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDryRun({ status: "idle" });
                      persist("draft");
                    }}
                  >
                    Save as draft
                  </Button>
                  <Button
                    disabled={blocking}
                    onClick={() => {
                      setDryRun({ status: "idle" });
                      setActivateOpen(true);
                    }}
                  >
                    Activate
                  </Button>
                  <Button variant="ghost" onClick={() => setDryRun({ status: "idle" })}>
                    Edit workflow
                  </Button>
                </>
              }
            />
          )}
          {dryRun.status === "config" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setDryRun({ status: "idle" })}>
                Cancel
              </Button>
              <Button onClick={runDryRun}>
                <FlaskConical /> Run dry-run
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={activateOpen} onOpenChange={setActivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Activate “{draft.name}” as v{version + 1}?
            </DialogTitle>
            <DialogDescription>
              The first run is scheduled for {nextRunDate()} IST. Rewards still wait for approval —
              nothing is paid automatically. This is logged in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setActivateOpen(false);
                persist("live");
              }}
            >
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center" aria-hidden>
      <div className="flex flex-col items-center">
        <div className="h-3 w-px bg-border" />
        <ArrowDown className="size-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

function DropZone({
  active,
  onDrop,
  last = false,
}: {
  active: boolean;
  onDrop: () => void;
  last?: boolean;
}) {
  const [over, setOver] = useState(false);
  if (!active) return last ? null : null;
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDrop();
      }}
      className={cn(
        "my-1 grid h-8 place-items-center rounded-md border-2 border-dashed text-xs",
        over ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
      )}
    >
      Drop here
    </div>
  );
}

function StepNode({
  step,
  index,
  total,
  selected,
  error,
  readOnly,
  onSelect,
  onMove,
  onRemove,
  onDragStart,
  onDragEnd,
}: {
  step: Step;
  index: number;
  total: number;
  selected: boolean;
  error: boolean;
  readOnly: boolean;
  onSelect: () => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const Icon = stepIcons[step.kind];
  return (
    <div
      role="button"
      tabIndex={0}
      draggable={!readOnly}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title={readOnly ? undefined : "Drag to reorder, or use the arrows"}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      aria-pressed={selected}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border",
        error && "border-destructive",
        step.kind === "end" && "mx-auto w-fit rounded-full px-5 py-2",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md",
          step.kind === "end" ? "bg-muted" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Step {index + 1}</p>
        <p className="font-medium">{step.label}</p>
        {step.kind !== "end" && (
          <p
            className={cn("truncate text-sm", error ? "text-destructive" : "text-muted-foreground")}
          >
            {describeStep(step)}
          </p>
        )}
        {step.kind === "branch" && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <span className="rounded border border-success/30 bg-success/5 px-2 py-1">
              Then → {String(step.config["then"])}
            </span>
            <span className="rounded border border-border bg-muted px-2 py-1">
              Else → {String(step.config["else"])}
            </span>
          </div>
        )}
      </div>
      {!readOnly && (
        <div className="flex shrink-0 gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="Move step up"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMove(-1);
            }}
          >
            <ArrowUp />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="Move step down"
            disabled={index === total - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMove(1);
            }}
          >
            <ArrowDown />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="Remove step"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}

function PanelTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 font-semibold">
        <Icon className="size-4 text-primary" aria-hidden /> {title}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Row({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: (string | [string, string])[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-9">
        <SelectValue placeholder="Choose…" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => {
          const [v, l] = typeof o === "string" ? [o, o] : o;
          return (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function Chips({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-9 items-center justify-between gap-3 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

const metricOptions = metricCatalog.map(
  (m) => [m.key, `${m.label}${m.connected ? "" : " (not connected)"}`] as [string, string],
);

function StepPanel({
  step,
  steps,
  onChange,
  onSelect,
}: {
  step: Step;
  steps: Step[];
  onChange: (patch: Partial<Step>) => void;
  onSelect: (id: string) => void;
}) {
  const meta = stepCatalog[step.kind];
  const index = steps.findIndex((s) => s.id === step.id);
  const next = steps[index + 1];
  const setValue = (key: string, value: StepValue) =>
    onChange({ config: { ...step.config, [key]: value } });
  const renderField = (f: FieldDef) => {
    const v = step.config[f.key];
    if (f.type === "toggle")
      return (
        <ToggleRow
          key={f.key}
          label={f.label}
          checked={Boolean(v)}
          onChange={(x) => setValue(f.key, x)}
        />
      );
    if (f.type === "select") {
      const options = f.key === "metric" || f.key === "field" ? metricOptions : f.options;
      return (
        <Row key={f.key} label={f.label}>
          <SelectBox
            label={f.label}
            value={String(v ?? "")}
            onChange={(x) => setValue(f.key, x)}
            options={options}
          />
        </Row>
      );
    }
    if (f.type === "formula")
      return step.config["amount_mode"] === "formula" ? (
        <Row key={f.key} label={f.label} htmlFor={`f-${f.key}`}>
          <FormulaEditor
            id={`f-${f.key}`}
            value={String(v ?? "")}
            onChange={(x) => setValue(f.key, x)}
          />
        </Row>
      ) : null;
    if (f.key === "amount" && step.kind === "reward" && step.config["amount_mode"] === "formula")
      return null;
    if (f.type === "number")
      return (
        <Row
          key={f.key}
          label={`${f.label}${f.suffix ? ` (${f.suffix})` : ""}`}
          htmlFor={`f-${f.key}`}
        >
          <Input
            id={`f-${f.key}`}
            inputMode="numeric"
            className="h-9"
            value={String(v ?? "")}
            onChange={(e) => setValue(f.key, Number(e.target.value.replace(/[^\d.]/g, "")) || 0)}
            aria-invalid={step.kind === "reward" && f.key === "amount" && !(Number(v) > 0)}
          />
          {step.kind === "reward" && f.key === "amount" && !(Number(v) > 0) && (
            <p className="text-xs text-destructive">Enter an amount.</p>
          )}
        </Row>
      );
    return (
      <Row key={f.key} label={f.label} htmlFor={`f-${f.key}`}>
        <Input
          id={`f-${f.key}`}
          className="h-9"
          value={String(v ?? "")}
          placeholder={f.placeholder}
          onChange={(e) => setValue(f.key, e.target.value)}
        />
      </Row>
    );
  };
  return (
    <>
      <PanelTitle icon={stepIcons[step.kind]} title={meta.label} hint={meta.description} />
      <Row label="Step label" htmlFor="step-label">
        <Input
          id="step-label"
          className="h-9"
          value={step.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </Row>
      {meta.fields.map(renderField)}
      {step.kind !== "end" && (
        <Row label="Next step">
          <SelectBox
            label="Next step"
            value={next?.id ?? ""}
            onChange={(id) => onSelect(id)}
            options={steps
              .slice(index + 1)
              .map((s) => [s.id, `${steps.indexOf(s) + 1}. ${s.label}`] as [string, string])}
          />
        </Row>
      )}
    </>
  );
}

function TriggerPanel({
  trigger,
  onChange,
  onRemove,
}: {
  trigger: Trigger;
  onChange: (t: Trigger) => void;
  onRemove: () => void;
}) {
  const set = (key: string, value: StepValue) =>
    onChange({ ...trigger, config: { ...trigger.config, [key]: value } });
  const c = trigger.config;
  return (
    <>
      <PanelTitle
        icon={triggerIcons[trigger.type]}
        title={`${trigger.type[0]?.toUpperCase()}${trigger.type.slice(1)} trigger`}
      />
      {trigger.type === "event" && (
        <>
          <Row label="Event type">
            <SelectBox
              label="Event type"
              value={String(c["event_type"])}
              onChange={(v) => set("event_type", v)}
              options={[
                "sales_file.imported",
                "crm.deal_closed",
                "attendance.synced",
                "employee.anniversary",
                "native_entry.approved",
              ]}
            />
          </Row>
          <Row label="Filter (optional)" htmlFor="t-filter">
            <Input
              id="t-filter"
              className="h-9"
              value={String(c["filter"] ?? "")}
              onChange={(e) => set("filter", e.target.value)}
              placeholder='Stage == "Closed Won"'
            />
          </Row>
          <Row label="Debounce (minutes)" htmlFor="t-debounce">
            <Input
              id="t-debounce"
              className="h-9"
              inputMode="numeric"
              value={String(c["debounce_minutes"] ?? 0)}
              onChange={(e) => set("debounce_minutes", Number(e.target.value) || 0)}
            />
          </Row>
        </>
      )}
      {trigger.type === "schedule" && (
        <>
          <Row label="When">
            <SelectBox
              label="Schedule"
              value={String(c["cron"])}
              onChange={(v) => set("cron", v)}
              options={[
                "Monthly on the 1st at 06:00",
                "Every Monday at 09:00",
                "Every Friday at 17:00",
                "Daily at 20:00",
                "Quarterly on the 1st at 06:00",
              ]}
            />
          </Row>
          <Row label="Data window">
            <SelectBox
              label="Window"
              value={String(c["window"])}
              onChange={(v) => set("window", v)}
              options={[
                "previous calendar month",
                "last 7 days",
                "previous quarter",
                "previous day",
              ]}
            />
          </Row>
          <Row label="Late data grace (hours)" htmlFor="t-grace">
            <Input
              id="t-grace"
              className="h-9"
              inputMode="numeric"
              value={String(c["late_data_grace_hours"] ?? 0)}
              onChange={(e) => set("late_data_grace_hours", Number(e.target.value) || 0)}
            />
          </Row>
          <p className="text-xs text-muted-foreground">Times are in Asia/Kolkata (IST).</p>
        </>
      )}
      {trigger.type === "manual" && (
        <>
          <Row label="Who can run it" htmlFor="t-roles">
            <Input
              id="t-roles"
              className="h-9"
              value={String(c["allowed_roles"] ?? "")}
              onChange={(e) => set("allowed_roles", e.target.value)}
            />
          </Row>
          <Row label="Parameters asked when run" htmlFor="t-params">
            <Input
              id="t-params"
              className="h-9"
              value={String(c["parameters"] ?? "")}
              onChange={(e) => set("parameters", e.target.value)}
              placeholder="suggestion_id, amount"
            />
          </Row>
        </>
      )}
      <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
        <Trash2 /> Remove trigger
      </Button>
    </>
  );
}

function MetaPanel({
  draft,
  onChange,
}: {
  draft: WorkflowDraft;
  onChange: (d: WorkflowDraft) => void;
}) {
  return (
    <>
      <PanelTitle icon={FileText} title="Details" />
      <Row label="Name (required)" htmlFor="m-name">
        <Input
          id="m-name"
          className="h-9"
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          aria-invalid={!draft.name.trim()}
        />
      </Row>
      <Row label="Description" htmlFor="m-desc">
        <Textarea
          id="m-desc"
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          placeholder="What this rewards and why"
        />
      </Row>
      <Row label="Owner">
        <Input className="h-9" value={draft.owner} readOnly aria-label="Owner" />
      </Row>
      <Row label="Template">
        <Input
          className="h-9"
          value={draft.templateRef ?? "None (blank canvas)"}
          readOnly
          aria-label="Template reference"
        />
      </Row>
      <Row label="Timezone">
        <SelectBox
          label="Timezone"
          value={draft.timezone}
          onChange={(v) => onChange({ ...draft, timezone: v })}
          options={["Asia/Kolkata", "Asia/Dubai", "Asia/Singapore"]}
        />
      </Row>
      <Row label="Tags (comma separated)" htmlFor="m-tags">
        <Input
          id="m-tags"
          className="h-9"
          value={draft.tags.join(", ")}
          onChange={(e) =>
            onChange({
              ...draft,
              tags: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
        />
      </Row>
    </>
  );
}

function ScopePanel({
  draft,
  onChange,
}: {
  draft: WorkflowDraft;
  onChange: (d: WorkflowDraft) => void;
}) {
  const scope = draft.scope;
  const set = (patch: Partial<WorkflowDraft["scope"]>) =>
    onChange({ ...draft, scope: { ...scope, ...patch } });
  return (
    <>
      <PanelTitle icon={Target} title="Scope" hint="Who this workflow looks at." />
      <Row label="Departments">
        <Chips
          label="Departments"
          options={["Manufacturing", "Quality", "Sales", "Operations", "Support"]}
          value={scope.departments}
          onChange={(v) => set({ departments: v })}
        />
      </Row>
      <Row label="Teams">
        <Chips
          label="Teams"
          options={["Sales A", "Sales B", "Manufacturing A", "Manufacturing B", "Quality A"]}
          value={scope.teams}
          onChange={(v) => set({ teams: v })}
        />
      </Row>
      <Row label="Locations">
        <Chips
          label="Locations"
          options={["Coimbatore", "Chennai", "Erode", "Tiruppur"]}
          value={scope.locations}
          onChange={(v) => set({ locations: v })}
        />
      </Row>
      <div className="space-y-1.5">
        <p className="text-xs font-medium">Employee filter</p>
        {scope.filters.map((f, i) => (
          <div key={i} className="grid grid-cols-[1fr_64px_1fr_auto] gap-1">
            <SelectBox
              label="Field"
              value={f.field}
              onChange={(v) =>
                set({ filters: scope.filters.map((x, j) => (j === i ? { ...x, field: v } : x)) })
              }
              options={["shift", "grade", "employment_type", "tenure_days", "gender"]}
            />
            <SelectBox
              label="Operator"
              value={f.operator}
              onChange={(v) =>
                set({ filters: scope.filters.map((x, j) => (j === i ? { ...x, operator: v } : x)) })
              }
              options={["=", "≠", "≥", "≤"]}
            />
            <Input
              aria-label="Value"
              className="h-9"
              value={f.value}
              onChange={(e) =>
                set({
                  filters: scope.filters.map((x, j) =>
                    j === i ? { ...x, value: e.target.value } : x,
                  ),
                })
              }
            />
            <Button
              size="icon"
              variant="ghost"
              className="size-9"
              aria-label="Remove condition"
              onClick={() => set({ filters: scope.filters.filter((_, j) => j !== i) })}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            set({ filters: [...scope.filters, { field: "shift", operator: "=", value: "Day" }] })
          }
        >
          <Plus /> Add condition
        </Button>
      </div>
      <Row label="Exclude employees (codes)" htmlFor="sc-ex">
        <Input
          id="sc-ex"
          className="h-9"
          value={scope.exclude.join(", ")}
          onChange={(e) =>
            set({
              exclude: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          placeholder="RKM0042, RKM0108"
        />
      </Row>
      <Row label="Include statuses">
        <Chips
          label="Statuses"
          options={["active", "notice"]}
          value={scope.statuses}
          onChange={(v) => set({ statuses: v })}
        />
      </Row>
      <div className="grid grid-cols-2 gap-2">
        <Row label="Min tenure (days)" htmlFor="sc-ten">
          <Input
            id="sc-ten"
            className="h-9"
            inputMode="numeric"
            value={String(scope.minTenureDays)}
            onChange={(e) => set({ minTenureDays: Number(e.target.value) || 0 })}
          />
        </Row>
        <Row label="Ranking partition">
          <SelectBox
            label="Partition"
            value={scope.partition}
            onChange={(v) => set({ partition: v as WorkflowDraft["scope"]["partition"] })}
            options={["none", "team", "department", "location"]}
          />
        </Row>
      </div>
    </>
  );
}

function BudgetPanel({
  draft,
  onChange,
}: {
  draft: WorkflowDraft;
  onChange: (d: WorkflowDraft) => void;
}) {
  const b = draft.budget;
  const set = (patch: Partial<WorkflowDraft["budget"]>) =>
    onChange({ ...draft, budget: { ...b, ...patch } });
  return (
    <>
      <PanelTitle icon={Wallet} title="Budget binding" />
      <Row label="Wallet / budget pool">
        <SelectBox
          label="Wallet"
          value={b.wallet}
          onChange={(v) => set({ wallet: v })}
          options={walletPools.map(
            (p) => [p.id, `${p.id} · ${formatRupees(p.remaining)} left`] as [string, string],
          )}
        />
      </Row>
      <div className="grid grid-cols-2 gap-2">
        <Row label="Currency">
          <SelectBox
            label="Currency"
            value={b.currency}
            onChange={(v) => set({ currency: v as "COINS" | "INR" })}
            options={["COINS", "INR"]}
          />
        </Row>
        <Row label="Per-run max (₹)" htmlFor="b-run">
          <Input
            id="b-run"
            className="h-9"
            inputMode="numeric"
            value={String(b.perRunMax)}
            onChange={(e) => set({ perRunMax: Number(e.target.value) || 0 })}
          />
        </Row>
        <Row label="Per-period max (₹)" htmlFor="b-per">
          <Input
            id="b-per"
            className="h-9"
            inputMode="numeric"
            value={String(b.perPeriodMax)}
            onChange={(e) => set({ perPeriodMax: Number(e.target.value) || 0 })}
          />
        </Row>
        <Row label="Period">
          <SelectBox
            label="Period"
            value={b.period}
            onChange={(v) => set({ period: v as WorkflowDraft["budget"]["period"] })}
            options={[
              ["month", "Month"],
              ["quarter", "Quarter"],
              ["fiscal_year", "Fiscal year (Apr–Mar)"],
            ]}
          />
        </Row>
      </div>
      <Row label="If budget is insufficient">
        <SelectBox
          label="On insufficient"
          value={b.onInsufficient}
          onChange={(v) => set({ onInsufficient: v as WorkflowDraft["budget"]["onInsufficient"] })}
          options={[
            ["hard_stop", "Hard stop"],
            ["partial_by_rank", "Pay by rank until it runs out"],
            ["queue_for_approval", "Queue for approval"],
          ]}
        />
      </Row>
      <ToggleRow
        label="Reserve budget when approval is requested"
        checked={b.reserveOnApproval}
        onChange={(v) => set({ reserveOnApproval: v })}
      />
    </>
  );
}

function PoliciesPanel({
  draft,
  onChange,
}: {
  draft: WorkflowDraft;
  onChange: (d: WorkflowDraft) => void;
}) {
  const p = draft.policies;
  const set = (patch: Partial<WorkflowDraft["policies"]>) =>
    onChange({ ...draft, policies: { ...p, ...patch } });
  return (
    <>
      <PanelTitle icon={Scale} title="Policies" />
      <div className="space-y-1.5">
        <p className="text-xs font-medium">Per-employee caps</p>
        {p.perEmployeeCaps.map((cap, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-1">
            <Input
              aria-label="Cap amount"
              className="h-9"
              inputMode="numeric"
              value={String(cap.amount)}
              onChange={(e) =>
                set({
                  perEmployeeCaps: p.perEmployeeCaps.map((x, j) =>
                    j === i ? { ...x, amount: Number(e.target.value) || 0 } : x,
                  ),
                })
              }
            />
            <SelectBox
              label="Cap period"
              value={cap.per}
              onChange={(v) =>
                set({
                  perEmployeeCaps: p.perEmployeeCaps.map((x, j) =>
                    j === i ? { ...x, per: v as "month" } : x,
                  ),
                })
              }
              options={["month", "quarter", "fiscal_year"]}
            />
            <Button
              size="icon"
              variant="ghost"
              className="size-9"
              aria-label="Remove cap"
              onClick={() => set({ perEmployeeCaps: p.perEmployeeCaps.filter((_, j) => j !== i) })}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            set({ perEmployeeCaps: [...p.perEmployeeCaps, { amount: 15000, per: "fiscal_year" }] })
          }
        >
          <Plus /> Add cap
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Row label="Cooldown (days)" htmlFor="p-cool">
          <Input
            id="p-cool"
            className="h-9"
            inputMode="numeric"
            value={String(p.cooldownDays)}
            onChange={(e) => set({ cooldownDays: Number(e.target.value) || 0 })}
          />
        </Row>
        <Row label="Cooldown applies to">
          <SelectBox
            label="Cooldown applies to"
            value={p.cooldownAppliesTo}
            onChange={(v) => set({ cooldownAppliesTo: v as "same_workflow" })}
            options={[
              ["same_workflow", "This workflow"],
              ["all_workflows", "All workflows"],
            ]}
          />
        </Row>
      </div>
      <ToggleRow
        label="Track ₹ 15,000 yearly gift limit (tax guard)"
        checked={p.taxGuard.track}
        onChange={(v) => set({ taxGuard: { ...p.taxGuard, track: v } })}
      />
      <Row label="When the limit is crossed">
        <SelectBox
          label="On threshold cross"
          value={p.taxGuard.onCross}
          onChange={(v) => set({ taxGuard: { ...p.taxGuard, onCross: v as "warn" } })}
          options={[
            ["warn", "Warn approver"],
            ["require_approval", "Require HR approval"],
            ["block", "Block reward"],
          ]}
        />
      </Row>
      <Row label="Unmatched records">
        <SelectBox
          label="Unmatched records"
          value={p.unmatched}
          onChange={(v) => set({ unmatched: v as "block_run" })}
          options={[
            ["block_run", "Block the run"],
            ["exclude_and_warn", "Exclude and warn"],
            ["proceed", "Proceed silently"],
          ]}
        />
      </Row>
      <Row label="Tie-break">
        <SelectBox
          label="Tie-break"
          value={p.tieBreak}
          onChange={(v) => set({ tieBreak: v as "secondary_metric" })}
          options={[
            ["secondary_metric", "Secondary metric"],
            ["earliest_to_reach", "Earliest to reach"],
            ["split_reward", "Split the reward"],
          ]}
        />
      </Row>
      <Row label="Leaderboard visibility">
        <SelectBox
          label="Visibility"
          value={p.visibility}
          onChange={(v) => set({ visibility: v as "team_only" })}
          options={[
            ["public_full", "Public — full list"],
            ["public_top_n", "Public — top N only"],
            ["team_only", "Team only"],
            ["private", "Private"],
          ]}
        />
      </Row>
      <ToggleRow
        label="Self-nomination allowed"
        checked={p.selfNomination}
        onChange={(v) => set({ selfNomination: v })}
      />
      <Row label="If the approver is the winner's manager and also a winner">
        <SelectBox
          label="Manager conflict rule"
          value={p.managerConflict}
          onChange={(v) => set({ managerConflict: v as "allow" })}
          options={[
            ["skip_level_approval", "Send to skip-level"],
            ["hr_approval", "Send to HR"],
            ["allow", "Allow"],
          ]}
        />
      </Row>
    </>
  );
}

function StartChooser({
  aiEnabled,
  onAskAi,
  onBlank,
}: {
  aiEnabled: boolean;
  onAskAi: (p: string) => void;
  onBlank: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <a href="/workflows" className="text-sm text-muted-foreground hover:text-foreground">
          ← Workflows
        </a>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">New workflow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start from a blank canvas, a template, or describe it to AI.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onBlank}
          className="rounded-lg border border-border bg-card p-5 text-left hover:border-primary"
        >
          <Plus className="size-6 text-primary" />
          <p className="mt-3 font-semibold">Blank canvas</p>
          <p className="text-sm text-muted-foreground">Add triggers and steps yourself.</p>
        </button>
        {aiEnabled ? (
          <button
            type="button"
            onClick={() =>
              onAskAi(
                "Reward top 2 support agents monthly by CSAT, min 50 tickets. ₹2,000 to #1, ₹1,000 to #2. My approval needed.",
              )
            }
            className="rounded-lg border border-primary/30 bg-primary/5 p-5 text-left hover:border-primary"
          >
            <Sparkles className="size-6 text-primary" />
            <p className="mt-3 font-semibold">From an AI proposal</p>
            <p className="text-sm text-muted-foreground">
              Describe it in a sentence; review the proposal before anything is saved.
            </p>
          </button>
        ) : (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            AI is unavailable — blank canvas and templates still work.
          </div>
        )}
      </div>
      <section aria-labelledby="tpl-heading" className="space-y-3">
        <h2 id="tpl-heading" className="flex items-center gap-2 font-semibold">
          <LayoutTemplate className="size-4 text-primary" /> From a template
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workflowTemplates.map((t) => (
            <a
              key={t.id}
              href={`/workflows/new?template=${t.id}`}
              className="rounded-lg border border-border bg-card p-4 hover:border-primary"
            >
              <StatusBadge tone="neutral">{t.industry}</StatusBadge>
              <p className="mt-2 font-medium">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
