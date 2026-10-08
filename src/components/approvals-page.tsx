import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ExternalLink,
  Hourglass,
  Pencil,
  RefreshCw,
  Timer,
  TriangleAlert,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PullToRefresh } from "@/components/library/pull-to-refresh";
import { SegmentedControl } from "@/components/library/segmented-control";
import { Timeline } from "@/components/library/timeline";
import { Textarea } from "@/components/ui/textarea";
import {
  type Approval,
  type RewardKind,
  TAX_LIMIT,
  approvalsFor,
  escalationTargets,
  isBudgetExhausted,
  rejectReasons,
  rewardKindLabel,
} from "@/lib/approvals-data";
import { formatIndianNumber, formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type Decision as StoredDecision, useDemoStore } from "@/store/demo-store";

export type Decision = "approve" | "modify" | "reject" | "escalate";

const decisionCopy: Record<Decision, { title: string; button: string }> = {
  approve: { title: "Approve this reward?", button: "Approve" },
  modify: { title: "Modify and approve?", button: "Save and approve" },
  reject: { title: "Reject this reward?", button: "Reject" },
  escalate: { title: "Escalate this decision?", button: "Escalate" },
};

const statusTone = { pending: "warning", escalated: "error", auto_approved: "success" } as const;
const statusLabel = { pending: "Pending", escalated: "Escalated", auto_approved: "Auto-approved" };

const decidedLabel: Record<StoredDecision["kind"], string> = {
  approve: "Approved",
  modify: "Modified & approved",
  reject: "Rejected",
  escalate: "Escalated",
  queued: "Queued for budget",
};

/** Prototype "now": SLA timers count down from when the data was loaded. */
const loadedAt = Date.now();

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(loadedAt);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function slaMinutesLeft(a: Approval, now: number) {
  const deadline = loadedAt + (a.slaHours - a.hoursAgo) * 3_600_000;
  return Math.round((deadline - now) / 60_000);
}

function formatDuration(minutes: number) {
  const m = Math.abs(minutes);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

function SlaTimer({ approval, now }: { approval: Approval; now: number }) {
  if (approval.status === "auto_approved") return null;
  const left = slaMinutesLeft(approval, now);
  const tone =
    left < 0 ? "text-destructive" : left < 6 * 60 ? "text-warning" : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", tone)}>
      <Timer className="size-3.5" aria-hidden />
      {left < 0 ? `SLA passed ${formatDuration(left)} ago` : `${formatDuration(left)} left`}
    </span>
  );
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary",
        size === "lg" ? "size-12 text-base" : "size-9 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

type Sort = "sla" | "amount" | "workflow";

export function ApprovalsPage({
  persona,
  initialId,
}: {
  persona: string;
  initialId?: string | undefined;
}) {
  const { decisions, decide, undoDecision, emptyOrg } = useDemoStore();
  const all = emptyOrg ? [] : approvalsFor(persona);
  const now = useNow();
  const [view, setView] = useState<"pending" | "decided">("pending");
  const [workflow, setWorkflow] = useState("all");
  const [team, setTeam] = useState("all");
  const [status, setStatus] = useState("open");
  const [sort, setSort] = useState<Sort>("sla");
  const [selectedId, setSelectedId] = useState(initialId ?? "");
  const [checked, setChecked] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [decision, setDecision] = useState<{ ids: string[]; kind: Decision } | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [rewardKind, setRewardKind] = useState<RewardKind>("points");
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 500);
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const open = all.filter((a) => !decisions[a.id]);
  const decided = all.filter((a) => decisions[a.id]);
  const workflows = [...new Set(all.map((a) => a.workflow))];
  const teams = [...new Set(all.map((a) => a.team))];

  const visible = (() => {
    const list = (view === "pending" ? open : decided).filter(
      (a) =>
        (workflow === "all" || a.workflow === workflow) &&
        (team === "all" || a.team === team) &&
        (view === "decided" ||
          (status === "open"
            ? a.status !== "auto_approved"
            : status === "all" || a.status === status)),
    );
    return [...list].sort((a, b) =>
      sort === "amount"
        ? b.points - a.points
        : sort === "workflow"
          ? a.workflow.localeCompare(b.workflow)
          : slaMinutesLeft(a, now) - slaMinutesLeft(b, now),
    );
  })();

  const selected = visible.find((a) => a.id === selectedId) ?? visible[0];
  const targets = all.filter((a) => decision?.ids.includes(a.id));
  const single = targets.length === 1 ? targets[0] : undefined;

  const openDecision = (ids: string[], kind: Decision) => {
    const first = all.find((a) => a.id === ids[0]);
    setDecision({ ids, kind });
    setNote("");
    setReason("");
    setTarget("");
    setAmount(String(first?.points ?? ""));
    setRewardKind(first?.rewardKind ?? "points");
  };

  const amountNumber = Number(amount) || 0;
  const amountTooHigh = single ? amountNumber > single.maxPoints : false;
  const needsNote = decision !== null && decision.kind !== "approve";
  const canConfirm =
    decision !== null &&
    (!needsNote || note.trim().length > 0) &&
    (decision.kind !== "reject" || reason !== "") &&
    (decision.kind !== "escalate" || target !== "") &&
    (decision.kind !== "modify" || (amountNumber > 0 && !amountTooHigh));

  const confirm = () => {
    if (!decision) return;
    let approvedCount = 0;
    let queuedCount = 0;
    for (const item of targets) {
      const base = { at: Date.now(), ...(note ? { note } : {}) };
      if ((decision.kind === "approve" || decision.kind === "modify") && isBudgetExhausted(item)) {
        decide(item.id, { ...base, kind: "queued" });
        queuedCount += 1;
      } else if (decision.kind === "modify") {
        decide(item.id, { ...base, kind: "modify", points: amountNumber, rewardKind });
        approvedCount += 1;
      } else if (decision.kind === "reject") {
        decide(item.id, { ...base, kind: "reject", note: `${reason}: ${note}` });
      } else if (decision.kind === "escalate") {
        decide(item.id, { ...base, kind: "escalate", target });
      } else {
        decide(item.id, { ...base, kind: "approve" });
        approvedCount += 1;
      }
    }
    const ids = targets.map((t) => t.id);
    const undo = { label: "Undo", onClick: () => ids.forEach(undoDecision) };
    if (targets.length > 1) {
      const remaining = open.length - targets.length;
      toast.success(
        `Approved ${approvedCount} of ${open.length}. ${remaining} pending.` +
          (queuedCount ? ` ${queuedCount} queued for budget.` : ""),
        { action: undo },
      );
    } else if (queuedCount) {
      toast.warning("Budget exhausted. This approval will be queued.", { action: undo });
    } else {
      const next = single?.chain?.find((c) => c.state === "waiting");
      const copy = {
        approve: next
          ? `Approved at your level. Sent to ${next.name} (${next.level}) for the next approval.`
          : "Approved. Reward will be processed.",
        modify: "Modified and approved. Reward will be processed.",
        reject: "Rejected. The requester has been told why.",
        escalate: `Escalated to ${target}.`,
      }[decision.kind];
      toast.success(copy, { action: undo });
    }
    setChecked([]);
    setDecision(null);
    setMobileOpen(false);
    const next = open.find((a) => !ids.includes(a.id));
    if (next) setSelectedId(next.id);
  };

  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 700);
  };

  const selectable = visible.filter((a) => view === "pending" && a.status !== "auto_approved");
  const allChecked = selectable.length > 0 && selectable.every((a) => checked.includes(a.id));

  return (
    <div className="space-y-4">
      <PageHeading
        eyebrow={persona === "manager" ? "Sales A" : "Pending decisions"}
        title={persona === "manager" ? "My approvals" : "Approvals"}
        description="Nothing is paid until a person approves it. Review the evidence, then approve, modify, reject or escalate."
        action={
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className={cn(loading && "animate-spin")} /> Refresh
          </Button>
        }
      />
      {offline && (
        <Alert>
          <WifiOff className="size-4" />
          <AlertTitle>You're offline</AlertTitle>
          <AlertDescription>Changes will sync when you reconnect.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SegmentedControl
          label="Show"
          value={view}
          onChange={setView}
          options={[
            {
              value: "pending",
              label: `Waiting (${open.filter((a) => a.status !== "auto_approved").length})`,
            },
            { value: "decided", label: `Decided (${decided.length})` },
          ]}
        />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <FilterSelect
            label="Workflow"
            value={workflow}
            onChange={setWorkflow}
            options={workflows}
          />
          <FilterSelect label="Team" value={team} onChange={setTeam} options={teams} />
          {view === "pending" && (
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 sm:w-40" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Needs a decision</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="auto_approved">Auto-approved</SelectItem>
                <SelectItem value="all">All statuses</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-10 sm:w-44" aria-label="Sort approvals">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sla">Sort: SLA urgency</SelectItem>
              <SelectItem value="amount">Sort: amount</SelectItem>
              <SelectItem value="workflow">Sort: workflow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === "pending" && selectable.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(v) => setChecked(v ? selectable.map((a) => a.id) : [])}
              aria-label="Select all approvals"
            />
            {checked.length ? `${checked.length} selected` : "Select all"}
          </label>
          <Button
            size="sm"
            disabled={checked.length === 0}
            onClick={() => openDecision(checked, "approve")}
          >
            <Check /> Approve selected
          </Button>
        </div>
      )}

      <PullToRefresh
        onRefresh={() =>
          new Promise<void>((r) => {
            refresh();
            window.setTimeout(r, 700);
          })
        }
      >
        {loading ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading approvals">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <Card className="rounded-lg border-dashed">
            <CardContent className="p-10 text-center">
              <Check className="mx-auto size-8 text-success" />
              <p className="mt-2 font-semibold">
                {view === "pending"
                  ? "No pending approvals. You're all caught up! 🎉"
                  : "No decisions yet."}
              </p>
              <p className="text-sm text-muted-foreground">
                {view === "pending"
                  ? "New requests will appear here with their evidence."
                  : "Approved, modified, rejected and escalated items appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="gap-4 lg:grid lg:grid-cols-[minmax(320px,400px)_1fr]">
            <ul className="space-y-2" aria-label="Approval queue">
              {visible.map((item) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  now={now}
                  active={selected?.id === item.id}
                  decided={decisions[item.id]}
                  checkable={view === "pending" && item.status !== "auto_approved"}
                  checked={checked.includes(item.id)}
                  onCheck={(v) =>
                    setChecked((c) => (v ? [...c, item.id] : c.filter((id) => id !== item.id)))
                  }
                  onOpen={() => {
                    setSelectedId(item.id);
                    setMobileOpen(true);
                  }}
                  onSwipe={(kind) => openDecision([item.id], kind)}
                />
              ))}
            </ul>
            {selected && (
              <div className="hidden lg:block">
                <ApprovalDetail
                  item={selected}
                  now={now}
                  decided={decisions[selected.id]}
                  onDecide={(kind) => openDecision([selected.id], kind)}
                  onUndo={() => undoDecision(selected.id)}
                />
              </div>
            )}
          </div>
        )}
      </PullToRefresh>

      <Sheet open={mobileOpen && Boolean(selected)} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto p-0 pt-10 lg:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Approval detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <ApprovalDetail
              item={selected}
              now={now}
              decided={decisions[selected.id]}
              onDecide={(kind) => openDecision([selected.id], kind)}
              onUndo={() => undoDecision(selected.id)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={decision !== null} onOpenChange={(o) => !o && setDecision(null)}>
        <DialogContent>
          {decision && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {targets.length > 1
                    ? `Approve ${targets.length} rewards?`
                    : decisionCopy[decision.kind].title}
                </DialogTitle>
                <DialogDescription>
                  {single
                    ? `${single.employee} · ${formatIndianNumber(single.points)} points (${formatRupees(single.rupees)}) · ${single.recognitionType}`
                    : `${formatIndianNumber(targets.reduce((s, t) => s + t.points, 0))} points in total across ${targets.length} people.`}
                </DialogDescription>
              </DialogHeader>
              {targets.some(isBudgetExhausted) &&
                decision.kind !== "reject" &&
                decision.kind !== "escalate" && (
                  <Alert>
                    <Hourglass className="size-4" />
                    <AlertTitle>Budget exhausted</AlertTitle>
                    <AlertDescription>
                      {targets
                        .filter(isBudgetExhausted)
                        .map((t) => t.budget.pool)
                        .join(", ")}{" "}
                      has ₹ 0 left. Approving will queue the reward until HR tops up the pool.
                    </AlertDescription>
                  </Alert>
                )}
              {targets
                .filter(
                  (t) =>
                    t.tax.cumulative + (decision.kind === "modify" ? amountNumber : t.rupees) >
                    TAX_LIMIT,
                )
                .map((t) => (
                  <Alert key={t.id}>
                    <TriangleAlert className="size-4" />
                    <AlertTitle>Tax note · {t.employee}</AlertTitle>
                    <AlertDescription>
                      Takes yearly non-cash gifts past {formatRupees(TAX_LIMIT)}. The amount above
                      the limit becomes taxable and will be flagged in the payroll export.
                    </AlertDescription>
                  </Alert>
                ))}
              <div className="space-y-3">
                {decision.kind === "modify" && single && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="new-amount">Amount (points)</Label>
                      <Input
                        id="new-amount"
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                        aria-invalid={amountTooHigh}
                        aria-describedby="amount-help"
                      />
                      <p
                        id="amount-help"
                        className={cn(
                          "text-xs",
                          amountTooHigh ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {amountTooHigh
                          ? `You don't have permission to perform this action. Your limit is ${formatIndianNumber(single.maxPoints)} points — escalate for more.`
                          : `Your limit: up to ${formatIndianNumber(single.maxPoints)} points.`}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Reward kind</Label>
                      <Select
                        value={rewardKind}
                        onValueChange={(v) => setRewardKind(v as RewardKind)}
                      >
                        <SelectTrigger aria-label="Reward kind">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(rewardKindLabel).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {decision.kind === "reject" && (
                  <div className="space-y-1.5">
                    <Label>Reason</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger aria-label="Reject reason">
                        <SelectValue placeholder="Choose a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {rejectReasons.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {decision.kind === "escalate" && (
                  <div className="space-y-1.5">
                    <Label>Escalate to</Label>
                    <Select value={target} onValueChange={setTarget}>
                      <SelectTrigger aria-label="Escalation target">
                        <SelectValue placeholder="Choose who decides" />
                      </SelectTrigger>
                      <SelectContent>
                        {escalationTargets.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="decision-note">
                    {needsNote ? "Note (required)" : "Note (optional)"}
                  </Label>
                  <Textarea
                    id="decision-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Shared with the requester and kept in the audit log"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDecision(null)}>
                  Cancel
                </Button>
                <Button
                  variant={decision.kind === "reject" ? "destructive" : "default"}
                  disabled={!canConfirm}
                  onClick={confirm}
                >
                  {targets.length > 1
                    ? `Approve ${targets.length}`
                    : decisionCopy[decision.kind].button}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 sm:w-48" aria-label={`Filter by ${label.toLowerCase()}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}s</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function QueueItem({
  item,
  now,
  active,
  decided,
  checkable,
  checked,
  onCheck,
  onOpen,
  onSwipe,
}: {
  item: Approval;
  now: number;
  active: boolean;
  decided: StoredDecision | undefined;
  checkable: boolean;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onOpen: () => void;
  onSwipe: (kind: Decision) => void;
}) {
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  return (
    <li className="relative overflow-hidden rounded-lg">
      {/* Mobile swipe hints (checklist §8.2: right = approve, left = reject). */}
      <div
        className="absolute inset-0 flex items-center justify-between bg-muted px-5 text-sm font-medium lg:hidden"
        aria-hidden
      >
        <span className="text-success">Approve</span>
        <span className="text-destructive">Reject</span>
      </div>
      <div
        className={cn(
          "relative flex touch-pan-y gap-3 rounded-lg border bg-card p-3 transition-transform",
          active ? "border-primary ring-2 ring-primary/20" : "border-border",
        )}
        style={{ transform: `translateX(${dx}px)` }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" && !decided) start.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (start.current !== null) setDx(e.clientX - start.current);
        }}
        onPointerUp={() => {
          if (start.current !== null) {
            if (dx > 90) onSwipe("approve");
            else if (dx < -90) onSwipe("reject");
          }
          start.current = null;
          setDx(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDx(0);
        }}
      >
        {checkable && (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => onCheck(Boolean(v))}
              aria-label={`Select ${item.employee}`}
            />
          </div>
        )}
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 gap-3 text-left">
          <Avatar initials={item.initials} />
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="truncate font-medium">{item.employee}</span>
              <span className="shrink-0 text-sm font-semibold text-reward">
                {formatIndianNumber(decided?.points ?? item.points)} pts
              </span>
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {item.workflow} · {rewardKindLabel[item.rewardKind]}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {decided ? (
                <StatusBadge
                  tone={
                    decided.kind === "reject"
                      ? "error"
                      : decided.kind === "queued" || decided.kind === "escalate"
                        ? "warning"
                        : "success"
                  }
                >
                  {decidedLabel[decided.kind]}
                </StatusBadge>
              ) : (
                <>
                  <StatusBadge tone={statusTone[item.status]}>
                    {statusLabel[item.status]}
                  </StatusBadge>
                  <SlaTimer approval={item} now={now} />
                </>
              )}
              <span className="text-xs text-muted-foreground">{item.hoursAgo}h ago</span>
            </span>
          </span>
        </button>
      </div>
    </li>
  );
}

function ApprovalDetail({
  item,
  now,
  decided,
  onDecide,
  onUndo,
}: {
  item: Approval;
  now: number;
  decided: StoredDecision | undefined;
  onDecide: (kind: Decision) => void;
  onUndo: () => void;
}) {
  const after = item.budget.remaining - item.rupees;
  const taxAfter = item.tax.cumulative + item.rupees;
  return (
    <Card className="flex flex-col rounded-lg">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Avatar initials={item.initials} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold">{item.employee}</h2>
            <p className="text-sm text-muted-foreground">
              {item.code} · {item.team} · {item.department} · {item.location}
            </p>
          </div>
          {decided ? (
            <StatusBadge tone="neutral">{decidedLabel[decided.kind]}</StatusBadge>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <StatusBadge tone={statusTone[item.status]}>{statusLabel[item.status]}</StatusBadge>
              <SlaTimer approval={item} now={now} />
            </div>
          )}
        </div>

        <section
          aria-labelledby={`proposed-${item.id}`}
          className="rounded-lg border border-reward/30 bg-reward/5 p-4"
        >
          <h3
            id={`proposed-${item.id}`}
            className="text-xs font-semibold uppercase text-muted-foreground"
          >
            Proposed action
          </h3>
          <p className="mt-1 text-2xl font-bold text-reward">
            {formatIndianNumber(item.points)} {item.currency} · {formatRupees(item.rupees)}
          </p>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Recognition</dt>
              <dd className="font-medium">{item.recognitionType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reward kind</dt>
              <dd className="font-medium">{rewardKindLabel[item.rewardKind]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Workflow</dt>
              <dd className="font-medium">
                {item.workflowId ? (
                  <a
                    className="text-primary hover:underline"
                    href={`/workflows/${item.workflowId}/runs`}
                  >
                    {item.workflow}
                  </a>
                ) : (
                  item.workflow
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby={`evidence-${item.id}`} className="space-y-3">
          <h3 id={`evidence-${item.id}`} className="font-semibold">
            Evidence
          </h3>
          <ul className="space-y-2">
            {item.metrics.map((m) => (
              <li
                key={m.label}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-border p-3 text-sm"
              >
                <span>
                  <span className="text-muted-foreground">{m.label}: </span>
                  <span className="font-semibold">{m.value}</span>
                </span>
                <a
                  href="/connectors"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {m.source} <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          {item.chain && (
            <div className="rounded-md border border-border p-3 text-sm">
              <p className="mb-3 font-medium">
                Approval chain · level {item.chain.findIndex((c) => c.state === "pending") + 1} of{" "}
                {item.chain.length}
              </p>
              <Timeline
                items={item.chain.map((c) => ({
                  id: c.level,
                  title: `${c.level} · ${c.name}`,
                  time:
                    c.state === "approved"
                      ? `Approved ${c.at ?? ""}`
                      : c.state === "pending"
                        ? "Deciding now"
                        : "Waits for the level before",
                  tone:
                    c.state === "approved"
                      ? "success"
                      : c.state === "pending"
                        ? "warning"
                        : "default",
                }))}
              />
            </div>
          )}
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium">Decision trace</p>
            <p className="text-muted-foreground">“{item.trace}”</p>
            <ol className="mt-2 space-y-1">
              {item.traceSteps.map((s, i) => (
                <li key={`${s.title}-${i}`} className="flex gap-2 text-xs">
                  <span
                    className={cn(
                      "font-semibold",
                      s.passed === true
                        ? "text-success"
                        : s.passed === false
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {s.passed === true ? "✓" : s.passed === false ? "✕" : "…"}
                  </span>
                  <span>
                    <span className="font-medium">
                      {i + 1}. {s.title}
                    </span>{" "}
                    — {s.detail}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="group px-0">
                <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
                Source records ({item.sourceRecords.length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-1 text-sm">
                {item.sourceRecords.map((r) => (
                  <li key={r.id} className="rounded-md border border-border px-3 py-2">
                    <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                    <span className="block">{r.summary}</span>
                    <span className="text-xs text-muted-foreground">{r.source}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-md border border-border p-3 text-sm">
            <h3 className="font-semibold">Budget impact</h3>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pool</dt>
                <dd>{item.budget.pool}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Remaining</dt>
                <dd>{formatRupees(item.budget.remaining)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt className="text-muted-foreground">After this</dt>
                <dd className={after < 0 ? "text-destructive" : ""}>
                  {after < 0
                    ? `Insufficient — needs ${formatRupees(item.rupees)}`
                    : formatRupees(after)}
                </dd>
              </div>
            </dl>
          </section>
          <section className="rounded-md border border-border p-3 text-sm">
            <h3 className="font-semibold">Tax impact</h3>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax nature</dt>
                <dd>{item.tax.nature}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cumulative this FY</dt>
                <dd>{formatRupees(item.tax.cumulative)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt className="text-muted-foreground">After this</dt>
                <dd className={taxAfter > TAX_LIMIT ? "text-warning" : ""}>
                  {formatRupees(taxAfter)} {taxAfter > TAX_LIMIT && "⚠️ crosses ₹ 15,000"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
        {decided?.note && (
          <p className="rounded-md bg-muted p-3 text-sm">
            <span className="font-medium">Your note: </span>
            {decided.note}
          </p>
        )}
      </CardContent>
      <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card p-4">
        {decided ? (
          <Button variant="outline" onClick={onUndo}>
            Undo decision
          </Button>
        ) : item.status === "auto_approved" ? (
          <p className="text-sm text-muted-foreground">
            Auto-approved by policy — shown for review only.
          </p>
        ) : (
          <>
            <Button onClick={() => onDecide("approve")}>
              <Check /> Approve
            </Button>
            <Button variant="outline" onClick={() => onDecide("modify")}>
              <Pencil /> Modify
            </Button>
            <Button variant="outline" onClick={() => onDecide("reject")}>
              <X /> Reject
            </Button>
            <Button variant="ghost" onClick={() => onDecide("escalate")}>
              <ArrowUpRight /> Escalate
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
