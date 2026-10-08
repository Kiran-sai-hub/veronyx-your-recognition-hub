import {
  ArrowRight,
  Check,
  ChevronRight,
  Link2,
  PlayCircle,
  Plus,
  Search,
  TriangleAlert,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatIndianNumber } from "@/lib/format";
import {
  type IdentityItem,
  alreadyLinkedCodes,
  canonicalAttributes,
  driftAlerts,
  fieldRegistry,
  identityItems,
  mappedPreview,
  salesFileFields,
} from "@/lib/mapping-data";
import { employees } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

type Resolution = { kind: "linked" | "created" | "ignored"; label: string };

export function MappingPage({ tab = "mapping" }: { tab?: string | undefined }) {
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const queue = emptyOrg ? [] : identityItems.filter((i) => !resolved[i.id]);
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Connectors & Data"
        title="Mapping & identity"
        description="Tell Veronyx which column means what, and confirm who each record belongs to. People are never linked automatically."
      />
      <Tabs key={tab} defaultValue={tab}>
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="mapping">Field mapping</TabsTrigger>
          <TabsTrigger value="identity">
            Identity queue{queue.length ? ` (${queue.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="registry">Field registry</TabsTrigger>
          <TabsTrigger value="drift">Schema drift ({driftAlerts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mapping" className="mt-6">
          <FieldMappingWizard />
        </TabsContent>
        <TabsContent value="identity" className="mt-6">
          <IdentityQueue
            queue={queue}
            resolved={resolved}
            onResolve={(id, r) => setResolved((s) => ({ ...s, [id]: r }))}
          />
        </TabsContent>
        <TabsContent value="registry" className="mt-6">
          <Card className="overflow-x-auto rounded-lg">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Field</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Discovered in</th>
                  <th className="p-3 font-medium">Sample values</th>
                  <th className="p-3 font-medium">Personal data</th>
                </tr>
              </thead>
              <tbody>
                {fieldRegistry.map((f) => (
                  <tr key={f.field} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono text-xs">{f.field}</td>
                    <td className="p-3">{f.type}</td>
                    <td className="p-3 text-muted-foreground">{f.source}</td>
                    <td className="p-3 text-muted-foreground">{f.samples}</td>
                    <td className="p-3">
                      {f.pii ? <StatusBadge tone="private">Yes — protected</StatusBadge> : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
        <TabsContent value="drift" className="mt-6 space-y-4">
          {driftAlerts.map((d) => (
            <DriftCard key={d.id} drift={d} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DriftCard({ drift }: { drift: (typeof driftAlerts)[number] }) {
  const [state, setState] = useState<"open" | "mapped">("open");
  return (
    <Card className={cn("rounded-lg", drift.paused && state === "open" && "border-warning/50")}>
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="size-4 text-warning" /> {drift.source} · {drift.kind}
            </p>
            <p className="text-sm">{drift.detail}</p>
            <p className="text-sm text-muted-foreground">{drift.impact}</p>
          </div>
          <StatusBadge tone={state === "mapped" ? "success" : drift.paused ? "warning" : "neutral"}>
            {state === "mapped"
              ? "Resolved"
              : drift.paused
                ? "Ingestion paused"
                : "Ignored for now"}
          </StatusBadge>
        </div>
        {state === "open" ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted p-3 text-sm">
            <span className="flex-1">{drift.suggestion}</span>
            <Button
              size="sm"
              onClick={() => {
                setState("mapped");
                toast.success(
                  drift.paused
                    ? "Mapping saved as version 4. Ingestion resumed — re-run queued."
                    : "Mapping saved.",
                );
              }}
            >
              <Check /> Map it{drift.paused ? " & resume" : ""}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toast("Alert sent to HR. Ingestion stays paused.")}
            >
              Ask the file owner to fix it
            </Button>
          </div>
        ) : (
          <p className="text-sm text-success">✓ Resolved by you · logged in the audit trail</p>
        )}
      </CardContent>
    </Card>
  );
}

function FieldMappingWizard() {
  const [mapping, setMapping] = useState<Record<string, string>>(
    Object.fromEntries(salesFileFields.map((f) => [f.name, f.suggested])),
  );
  const [transforms, setTransforms] = useState<Record<string, string>>(
    Object.fromEntries(salesFileFields.map((f) => [f.name, f.transform ?? ""])),
  );
  const [identity, setIdentity] = useState("employee code");
  const [dedup, setDedup] = useState("source_record_id + object_name");
  const [filter, setFilter] = useState({ field: "dept", op: "==", value: "Sales" });
  const [active, setActive] = useState(true);
  const used = Object.values(mapping);
  const missing = canonicalAttributes.filter((a) => a.required && !used.includes(a.key));
  const resolvedCount = mappedPreview.filter((r) => r.resolved).length;

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Monthly sales file → Veronyx attributes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Step 1–2 · We suggested matches from the column names. Change any that look wrong.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {missing.length > 0 && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Required attribute not mapped: {missing.map((m) => m.label).join(", ")}.
            </p>
          )}
          <div className="hidden grid-cols-[1fr_24px_1fr_1fr_90px] gap-3 px-3 text-xs font-medium text-muted-foreground lg:grid">
            <span>Source field (samples)</span>
            <span />
            <span>Veronyx attribute</span>
            <span>Transform (optional)</span>
            <span>Confidence</span>
          </div>
          {salesFileFields.map((f) => {
            const target = mapping[f.name] ?? "";
            const attr = canonicalAttributes.find((a) => a.key === target);
            const typeIssue = attr && attr.type === "number" && f.type === "text";
            return (
              <div
                key={f.name}
                className={cn(
                  "grid items-center gap-3 rounded-md border p-3 lg:grid-cols-[1fr_24px_1fr_1fr_90px]",
                  !target ? "border-destructive/50 bg-destructive/5" : "border-border",
                )}
              >
                <div>
                  <p className="font-mono text-sm">{f.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.type} · {f.samples.join(", ")}
                  </p>
                </div>
                <Link2 className="hidden size-4 text-muted-foreground lg:block" aria-hidden />
                <div>
                  <Select
                    value={target || "none"}
                    onValueChange={(v) =>
                      setMapping({ ...mapping, [f.name]: v === "none" ? "" : v })
                    }
                  >
                    <SelectTrigger
                      aria-label={`Map ${f.name}`}
                      className={cn(!target && "border-destructive")}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not mapped</SelectItem>
                      {canonicalAttributes.map((a) => (
                        <SelectItem key={a.key} value={a.key}>
                          {a.label}
                          {a.required ? " *" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {typeIssue && (
                    <p className="mt-1 text-xs text-destructive">Type mismatch: text → number</p>
                  )}
                </div>
                <Input
                  aria-label={`Transform for ${f.name}`}
                  className="font-mono text-xs"
                  value={transforms[f.name] ?? ""}
                  onChange={(e) => setTransforms({ ...transforms, [f.name]: e.target.value })}
                  placeholder="e.g. Amount * 100"
                />
                <StatusBadge
                  tone={
                    f.confidence === "high"
                      ? "success"
                      : f.confidence === "medium"
                        ? "neutral"
                        : "warning"
                  }
                >
                  {f.confidence}
                </StatusBadge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">3 · Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Label>Which field identifies the employee?</Label>
            <Select value={identity} onValueChange={setIdentity}>
              <SelectTrigger aria-label="Identity field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["email", "phone", "CRM user ID", "employee code", "name"].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {identity === "name" && (
              <p className="text-xs text-warning">
                Names are ambiguous — two people may share one. Prefer a code, email or phone.
              </p>
            )}
            <p>
              Match rate on the sample:{" "}
              <span className="font-semibold">{identity === "name" ? "71%" : "94%"}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">4 · Duplicates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Label htmlFor="dedup">How do we detect duplicate records?</Label>
            <Input
              id="dedup"
              value={dedup}
              onChange={(e) => setDedup(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-muted-foreground">
              On the sample: 48 rows → 3 duplicates would be skipped.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">5 · Filter (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Only sync records where…</p>
            <div className="grid grid-cols-[1fr_70px_1fr] gap-1">
              <Select
                value={filter.field}
                onValueChange={(v) => setFilter({ ...filter, field: v })}
              >
                <SelectTrigger aria-label="Filter field" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {salesFileFields.map((f) => (
                    <SelectItem key={f.name} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filter.op} onValueChange={(v) => setFilter({ ...filter, op: v })}>
                <SelectTrigger aria-label="Filter operator" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["==", "!=", ">", "<"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                aria-label="Filter value"
                className="h-9"
                value={filter.value}
                onChange={(e) => setFilter({ ...filter, value: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">6 · Preview (20 mapped records)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Identity resolved for {resolvedCount} of 20 · 1 type mismatch · {20 - resolvedCount + 1}{" "}
            issues in total
          </p>
        </CardHeader>
        <CardContent
          className="max-h-72 overflow-auto p-0"
          tabIndex={0}
          role="region"
          aria-label="Validation preview rows"
        >
          <table className="w-full min-w-[520px] text-xs">
            <thead className="sticky top-0 bg-muted text-left text-muted-foreground">
              <tr>
                <th className="p-2">Row</th>
                <th className="p-2">subject_ref</th>
                <th className="p-2">value</th>
                <th className="p-2">Identity</th>
              </tr>
            </thead>
            <tbody>
              {mappedPreview.map((r) => (
                <tr
                  key={r.row}
                  className={cn(
                    "border-t border-border",
                    (!r.resolved || r.mismatch) && "bg-destructive/5",
                  )}
                >
                  <td className="p-2 text-muted-foreground">{r.row}</td>
                  <td className="p-2 font-mono">{r.code}</td>
                  <td className="p-2">
                    {r.mismatch ? (
                      <span className="text-destructive">{r.mismatch}</span>
                    ) : (
                      `₹ ${formatIndianNumber(r.value)}`
                    )}
                  </td>
                  <td className="p-2">
                    {r.resolved ? (
                      `✅ ${r.name}`
                    ) : (
                      <span className="text-destructive">❌ Unresolved → identity queue</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
        <div className="text-sm">
          <p className="font-medium">7 · Save as version 4</p>
          <label className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Switch checked={active} onCheckedChange={setActive} /> Set as active mapping
          </label>
        </div>
        <Button
          disabled={missing.length > 0}
          onClick={() =>
            toast.success(
              `Mapping saved as version 4${active ? " and set active" : ""}. Logged in the audit trail.`,
            )
          }
        >
          Save mapping
        </Button>
      </div>
    </div>
  );
}

function IdentityQueue({
  queue,
  resolved,
  onResolve,
}: {
  queue: IdentityItem[];
  resolved: Record<string, Resolution>;
  onResolve: (id: string, r: Resolution) => void;
}) {
  const [connector, setConnector] = useState("all");
  const [type, setType] = useState("all");
  const [selectedId, setSelectedId] = useState(queue[0]?.id ?? "");
  const [confirm, setConfirm] = useState<{ item: IdentityItem; code: string; name: string } | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [ignoreReason, setIgnoreReason] = useState("");
  const [rerun, setRerun] = useState<string[] | null>(null);

  const sorted = [...queue]
    .filter(
      (i) =>
        (connector === "all" || i.connector === connector) &&
        (type === "all" || i.identifierType === type),
    )
    .sort((a, b) => b.blocking.length - a.blocking.length);
  const item = sorted.find((i) => i.id === selectedId) ?? sorted[0];
  const matches =
    search.trim().length > 1
      ? employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
      : [];
  const conflict = confirm && alreadyLinkedCodes.includes(confirm.code);

  if (queue.length === 0)
    return (
      <Card className="rounded-lg border-dashed">
        <CardContent className="p-10 text-center">
          <Check className="mx-auto size-8 text-success" />
          <p className="mt-2 font-semibold">No unmatched records. Great job! ✅</p>
          <p className="text-sm text-muted-foreground">
            {Object.keys(resolved).length} resolved this session.
          </p>
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={connector} onValueChange={setConnector}>
          <SelectTrigger className="w-56" aria-label="Filter by connector">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All connectors</SelectItem>
            {[...new Set(identityItems.map((i) => i.connector))].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-48" aria-label="Filter by identifier type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All identifier types</SelectItem>
            {["email", "phone", "employee code", "CRM user ID", "name"].map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="self-center text-xs text-muted-foreground">
          Sorted: blocking workflows first, then most recent.
        </p>
      </div>
      <div className="gap-4 lg:grid lg:grid-cols-[minmax(280px,360px)_1fr]">
        <ul className="mb-4 space-y-2 lg:mb-0">
          {sorted.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => setSelectedId(i.id)}
                className={cn(
                  "w-full rounded-lg border bg-card p-3 text-left",
                  item?.id === i.id ? "border-primary ring-2 ring-primary/20" : "border-border",
                )}
              >
                <p className="flex items-center justify-between gap-2 font-mono text-sm">
                  {i.identifier}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </p>
                <p className="text-xs text-muted-foreground">
                  {i.connector} · {i.identifierType} · {i.at}
                </p>
                {i.blocking.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    Blocking: {i.blocking.join(", ")}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
        {item && (
          <Card className="rounded-lg">
            <CardContent className="space-y-5 p-5">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Raw identifier</p>
                <p className="font-mono text-lg font-semibold">{item.identifier}</p>
                <p className="text-sm text-muted-foreground">
                  {item.source} · {item.connector} · {item.records} records waiting
                </p>
                {item.blocking.length > 0 && (
                  <p className="mt-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                    Blocking workflows: {item.blocking.join(", ")}
                  </p>
                )}
              </div>
              <section className="space-y-2">
                <h3 className="font-semibold">Possible matches</h3>
                {item.candidates.length === 0 && (
                  <p className="text-sm text-muted-foreground">No similar employee found.</p>
                )}
                {item.candidates.map((c) => (
                  <div
                    key={c.code}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-sm"
                  >
                    <span>
                      <span className="font-medium">{c.name}</span>{" "}
                      <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                      <span className="block text-xs text-muted-foreground">
                        {c.team} · {c.confidence}% match ({c.why})
                      </span>
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setConfirm({ item, code: c.code, name: c.name })}
                    >
                      <Check /> Select
                    </Button>
                  </div>
                ))}
              </section>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Or search an employee</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type a name"
                    aria-label="Search employees"
                  />
                </div>
                {matches.map((e) => (
                  <button
                    key={e.code}
                    type="button"
                    onClick={() => setConfirm({ item, code: e.code, name: e.name })}
                    className="flex w-full justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    {e.name}{" "}
                    <span className="font-mono text-xs text-muted-foreground">{e.code}</span>
                  </button>
                ))}
              </section>
              <div className="grid gap-3 sm:grid-cols-2">
                <section className="space-y-2 rounded-md border border-border p-3">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                    <UserPlus className="size-4" /> Create new employee
                  </h3>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Full name"
                    aria-label="New employee name"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!newName.trim()}
                    onClick={() => {
                      onResolve(item.id, { kind: "created", label: newName });
                      toast.success(
                        `Created ${newName} (RKM0201) and linked. ${item.records} records updated.`,
                      );
                      setNewName("");
                    }}
                  >
                    <Plus /> Create and link
                  </Button>
                </section>
                <section className="space-y-2 rounded-md border border-border p-3">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                    <X className="size-4" /> Ignore
                  </h3>
                  <Input
                    value={ignoreReason}
                    onChange={(e) => setIgnoreReason(e.target.value)}
                    placeholder="Reason (required)"
                    aria-label="Ignore reason"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!ignoreReason.trim()}
                    onClick={() => {
                      onResolve(item.id, { kind: "ignored", label: ignoreReason });
                      toast(`Ignored: ${ignoreReason}`);
                      setIgnoreReason("");
                    }}
                  >
                    Ignore record
                  </Button>
                </section>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          {confirm && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Link {confirm.item.identifier} to {confirm.name}?
                </DialogTitle>
                <DialogDescription>
                  {confirm.item.records} historical records will be re-mapped to {confirm.name} (
                  {confirm.code}). This is logged: who linked what, and when.
                </DialogDescription>
              </DialogHeader>
              {conflict && (
                <p
                  role="alert"
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                >
                  This identifier is already linked to another employee.
                </p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirm(null)}>
                  Cancel
                </Button>
                <Button
                  disabled={Boolean(conflict)}
                  onClick={() => {
                    onResolve(confirm.item.id, { kind: "linked", label: confirm.name });
                    toast.success(`Linked successfully. ${confirm.item.records} records updated.`);
                    if (confirm.item.blocking.length) setRerun(confirm.item.blocking);
                    setConfirm(null);
                  }}
                >
                  <ArrowRight /> Confirm link
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rerun !== null} onOpenChange={(o) => !o && setRerun(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Re-run affected workflows?</DialogTitle>
            <DialogDescription>
              {rerun?.join(", ")} skipped these records earlier. A re-run creates new approvals only
              for people who now qualify.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRerun(null)}>
              Not now
            </Button>
            <Button
              onClick={() => {
                toast.success("Re-run queued. New approvals will appear in the queue.");
                setRerun(null);
              }}
            >
              <PlayCircle /> Re-run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
