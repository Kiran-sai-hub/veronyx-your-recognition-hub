import { ArrowUpRight, Camera, Check, Hourglass, Pencil, RefreshCw, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Approval, approvals as seed, rejectReasons } from "@/lib/admin-data";
import { formatIndianNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export type Decision = "approve" | "modify" | "reject" | "escalate";
type ItemState = "pending" | "queued";

const decisionCopy: Record<Decision, { title: string; button: string }> = {
  approve: { title: "Approve this reward?", button: "Approve" },
  modify: { title: "Change the amount?", button: "Save and approve" },
  reject: { title: "Reject this reward?", button: "Reject" },
  escalate: { title: "Send to HR?", button: "Escalate" },
};

/** A pool is exhausted when the flag says so; approving then queues instead of paying. */
export function isBudgetExhausted(approval: Approval): boolean {
  return approval.flags.some((flag) => flag.includes("used up"));
}

export function ApprovalsPage() {
  const [items, setItems] = useState(seed.map((a) => ({ ...a, state: "pending" as ItemState })));
  const [selectedId, setSelectedId] = useState(seed[0]?.id ?? "");
  const [decision, setDecision] = useState<{ id: string; kind: Decision } | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const selected = items.find((i) => i.id === selectedId) ?? items[0];
  const target = items.find((i) => i.id === decision?.id);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const open = (id: string, kind: Decision) => {
    const item = items.find((i) => i.id === id);
    setDecision({ id, kind });
    setNote("");
    setReason("");
    setAmount(String(item?.points ?? ""));
  };

  const needsNote = decision && decision.kind !== "approve";
  const canConfirm = !needsNote || (note.trim().length > 0 && (decision?.kind !== "reject" || reason) && (decision?.kind !== "modify" || Number(amount) > 0));

  const confirm = () => {
    if (!decision || !target) return;
    const previous = items;
    if (decision.kind === "approve" && isBudgetExhausted(target)) {
      setItems((cur) => cur.map((i) => (i.id === target.id ? { ...i, state: "queued" } : i)));
      toast("Queued — the budget pool is used up. It will be paid once HR tops it up.");
    } else {
      const remaining = items.filter((i) => i.id !== target.id);
      setItems(remaining);
      setSelectedId(remaining[0]?.id ?? "");
      const label = { approve: "Approved", modify: "Changed and approved", reject: "Rejected", escalate: "Sent to HR" }[decision.kind];
      toast.success(`${label}: ${target.employee}`, { action: { label: "Undo", onClick: () => setItems(previous) } });
    }
    setDecision(null);
  };

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <div className="space-y-4">
      <PageHeading
        eyebrow="Decisions"
        title="Approvals"
        description="Nothing is paid until you approve it. On mobile, swipe right to approve or left to reject."
        action={<Button variant="outline" onClick={refresh}><RefreshCw className={cn(refreshing && "animate-spin")} /> Refresh</Button>}
      />
      {offline && (
        <Alert>
          <WifiOff className="size-4" />
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>Decisions will be sent when you are back online.</AlertDescription>
        </Alert>
      )}

      {items.length === 0 ? (
        <Card className="rounded-lg border-dashed">
          <CardContent className="p-10 text-center">
            <Check className="mx-auto size-8 text-success" />
            <p className="mt-2 font-semibold">All caught up</p>
            <p className="text-sm text-muted-foreground">New requests will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop: list + detail with sticky decision bar */}
          <div className="hidden gap-4 lg:grid lg:grid-cols-[360px_1fr]">
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn("w-full rounded-lg border bg-card p-4 text-left", selected?.id === item.id ? "border-primary ring-2 ring-primary/20" : "border-border")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.employee}</p>
                    <span className="text-sm font-semibold text-reward">{item.points} pts</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.reason}</p>
                  {item.state === "queued" && <div className="mt-2"><StatusBadge tone="warning">Queued for budget</StatusBadge></div>}
                </button>
              ))}
            </div>
            {selected && <ApprovalDetail item={selected} onDecide={(kind) => open(selected.id, kind)} />}
          </div>

          {/* Mobile: swipe cards */}
          <div className="space-y-3 lg:hidden">
            {refreshing && <p className="text-center text-xs text-muted-foreground">Refreshing…</p>}
            {items.map((item) => (
              <SwipeCard key={item.id} item={item} onSwipe={(kind) => open(item.id, kind)} onOpen={() => setSelectedId(item.id)} />
            ))}
          </div>
        </>
      )}

      <Dialog open={decision !== null} onOpenChange={(o) => !o && setDecision(null)}>
        <DialogContent>
          {decision && target && (
            <>
              <DialogHeader>
                <DialogTitle>{decisionCopy[decision.kind].title}</DialogTitle>
                <DialogDescription>
                  {target.employee} · {target.points} points ({`₹${formatIndianNumber(target.rupees)}`}) · {target.reason}
                </DialogDescription>
              </DialogHeader>
              {decision.kind === "approve" && isBudgetExhausted(target) && (
                <Alert><Hourglass className="size-4" /><AlertTitle>Budget pool used up</AlertTitle><AlertDescription>Approving will queue this reward until the pool is topped up.</AlertDescription></Alert>
              )}
              {target.flags.filter((f) => f.includes("15,000")).map((f) => (
                <Alert key={f}><AlertTitle>Tax note</AlertTitle><AlertDescription>{f}</AlertDescription></Alert>
              ))}
              <div className="space-y-3">
                {decision.kind === "modify" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="new-amount">New points</Label>
                    <Input id="new-amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
                  </div>
                )}
                {decision.kind === "reject" && (
                  <div className="space-y-1.5">
                    <Label>Reason</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger aria-label="Reject reason"><SelectValue placeholder="Choose a reason" /></SelectTrigger>
                      <SelectContent>{rejectReasons.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {needsNote && (
                  <div className="space-y-1.5">
                    <Label htmlFor="decision-note">Note (required)</Label>
                    <Textarea id="decision-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="This is shared with the requester" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDecision(null)}>Cancel</Button>
                <Button variant={decision.kind === "reject" ? "destructive" : "default"} disabled={!canConfirm} onClick={confirm}>
                  {decisionCopy[decision.kind].button}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApprovalDetail({ item, onDecide }: { item: Approval & { state: ItemState }; onDecide: (kind: Decision) => void }) {
  return (
    <Card className="flex min-h-[480px] flex-col rounded-lg">
      <CardContent className="flex-1 space-y-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">{item.code} · {item.department}</p>
          <h2 className="text-xl font-semibold">{item.employee}</h2>
        </div>
        <p className="text-3xl font-bold text-reward">{item.points} points</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted-foreground">Why</dt><dd>{item.reason}</dd></div>
          <div><dt className="text-muted-foreground">From</dt><dd>{item.source}</dd></div>
          <div><dt className="text-muted-foreground">Submitted</dt><dd>{item.submitted}</dd></div>
          <div><dt className="text-muted-foreground">Evidence</dt><dd>{item.evidence ? "Attached" : "None"}</dd></div>
        </dl>
        {item.flags.map((flag) => <StatusBadge key={flag} tone="warning">{flag}</StatusBadge>)}
        {item.state === "queued" && <StatusBadge tone="warning">Queued until the budget is topped up</StatusBadge>}
        {!item.evidence && (
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm">
            <Camera className="size-4" /> Add photo evidence
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={() => toast.success("Photo attached")} />
          </label>
        )}
      </CardContent>
      <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card p-4">
        <Button onClick={() => onDecide("approve")} disabled={item.state === "queued"}><Check /> Approve</Button>
        <Button variant="outline" onClick={() => onDecide("modify")}><Pencil /> Modify</Button>
        <Button variant="outline" onClick={() => onDecide("reject")}><X /> Reject</Button>
        <Button variant="ghost" onClick={() => onDecide("escalate")}><ArrowUpRight /> Escalate</Button>
      </div>
    </Card>
  );
}

function SwipeCard({ item, onSwipe, onOpen }: { item: Approval & { state: ItemState }; onSwipe: (kind: Decision) => void; onOpen: () => void }) {
  const [dx, setDx] = useState(0);
  const start = useRef<number | null>(null);
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 flex items-center justify-between bg-muted px-5 text-sm font-medium">
        <span className="text-success">Approve</span>
        <span className="text-destructive">Reject</span>
      </div>
      <div
        className="relative touch-pan-y rounded-lg border border-border bg-card p-4 transition-transform"
        style={{ transform: `translateX(${dx}px)` }}
        onPointerDown={(e) => { start.current = e.clientX; }}
        onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current); }}
        onPointerUp={() => {
          if (dx > 90) onSwipe("approve");
          else if (dx < -90) onSwipe("reject");
          else onOpen();
          start.current = null;
          setDx(0);
        }}
        onPointerCancel={() => { start.current = null; setDx(0); }}
      >
        <div className="flex items-center justify-between">
          <p className="font-medium">{item.employee}</p>
          <span className="font-semibold text-reward">{item.points} pts</span>
        </div>
        <p className="text-sm text-muted-foreground">{item.reason}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.state === "queued" && <StatusBadge tone="warning">Queued for budget</StatusBadge>}
          {item.flags.map((f) => <StatusBadge key={f} tone="warning">{f}</StatusBadge>)}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onSwipe("approve"); }} onPointerDown={(e) => e.stopPropagation()}>Approve</Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onSwipe("modify"); }} onPointerDown={(e) => e.stopPropagation()}>Modify</Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onSwipe("reject"); }} onPointerDown={(e) => e.stopPropagation()}>Reject</Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onSwipe("escalate"); }} onPointerDown={(e) => e.stopPropagation()}>Escalate</Button>
        </div>
      </div>
    </div>
  );
}
