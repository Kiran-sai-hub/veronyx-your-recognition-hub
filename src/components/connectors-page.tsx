import {
  CheckCircle2,
  ChevronDown,
  Copy,
  FileJson,
  KeyRound,
  Loader2,
  Mail,
  Plug,
  RefreshCw,
  TriangleAlert,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  type Connector,
  type ConnectorCategory,
  type ConnectorStatus,
  type GalleryConnector,
  connectorGallery,
  connectors as seed,
  dataHealth,
} from "@/lib/phase2-data";
import { formatIndianNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

const statusTone: Record<
  ConnectorStatus,
  { tone: "success" | "warning" | "error" | "neutral"; label: string }
> = {
  connected: { tone: "success", label: "Connected" },
  attention: { tone: "warning", label: "Schema drift" },
  failed: { tone: "error", label: "Authentication failed" },
  "not-connected": { tone: "neutral", label: "Not connected" },
};

const steps = ["Authenticate", "Configure", "Field mapping", "Test & preview", "Activate"] as const;
const categories: ("All" | ConnectorCategory)[] = [
  "All",
  "CRM",
  "Helpdesk",
  "HRIS",
  "Sheets",
  "Email",
  "Webhook",
  "Custom",
];
const canonical = [
  "subject_ref",
  "value",
  "amount_paise",
  "occurred_at",
  "status",
  "team",
  "source_record_id",
  "ignore",
];

export function ConnectorsPage({ onOpenMapping }: { onOpenMapping: () => void }) {
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  const [list, setList] = useState<Connector[]>(seed);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [selected, setSelected] = useState<GalleryConnector | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const shown = emptyOrg ? [] : list;

  const sync = (c: Connector) => {
    setSyncing(c.id);
    window.setTimeout(() => {
      setSyncing(null);
      setList((l) => l.map((x) => (x.id === c.id ? { ...x, lastSync: "Just now" } : x)));
      toast.success(`${c.name} synced.`);
    }, 1400);
  };

  const reconnect = (c: Connector) => {
    setSyncing(c.id);
    window.setTimeout(() => {
      setSyncing(null);
      setList((l) =>
        l.map(
          (x) =>
            (x.id === c.id
              ? { ...x, status: "connected", note: undefined, lastSync: "Just now", records: 412 }
              : x) as Connector,
        ),
      );
      toast.success(`Connected to ${c.kind}. First sync started.`);
    }, 1400);
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Data health monitor"
        title="Connectors & data"
        description="Bring performance data in from files, sheets and your other software. Nothing changes until you confirm it."
        action={<Button onClick={onOpenMapping}>Mapping & identity</Button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Data health">
        <StatCard
          label="Records matched"
          value={formatIndianNumber(emptyOrg ? 0 : dataHealth.matchedRecords)}
          detail={`Last import ${dataHealth.lastImport}`}
          icon={CheckCircle2}
        />
        <a href="/connectors/mapping?tab=identity" className="block">
          <StatCard
            label="Unmatched records"
            value={String(emptyOrg ? 0 : dataHealth.unmatchedRecords)}
            detail="Open the identity queue →"
            icon={TriangleAlert}
          />
        </a>
        <a href="/connectors/mapping?tab=drift" className="block">
          <StatCard
            label="Schema drift"
            value={emptyOrg ? "0" : "1"}
            detail="Monthly sales file paused →"
            icon={TriangleAlert}
          />
        </a>
        <StatCard
          label="Sources failing"
          value={String(shown.filter((c) => c.status === "failed").length)}
          detail={
            shown.some((c) => c.status === "failed")
              ? "Zoho CRM needs a new sign-in"
              : "All sources signed in"
          }
          icon={Plug}
        />
      </section>

      <section aria-labelledby="your-connectors">
        <h2 id="your-connectors" className="mb-4 text-lg font-semibold">
          Your sources
        </h2>
        {shown.length === 0 ? (
          <Card className="rounded-lg border-dashed">
            <CardContent className="p-10 text-center">
              <Plug className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 font-semibold">
                No sources connected. Connect your first data source.
              </p>
              <Button className="mt-4" onClick={() => setSelected(connectorGallery[1]!)}>
                Connect Google Sheets
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((c) => {
              const status = statusTone[c.status];
              const busy = syncing === c.id;
              return (
                <Card key={c.id} className="rounded-lg shadow-sm">
                  <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{c.kind}</p>
                    </div>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Last sync</span>
                      <span className="text-foreground">{busy ? "Syncing…" : c.lastSync}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Records</span>
                      <span className="text-foreground">{formatIndianNumber(c.records)}</span>
                    </div>
                    {c.status === "failed" && (
                      <p
                        className="rounded-md bg-destructive/10 p-3 text-xs text-destructive"
                        role="alert"
                      >
                        Authentication failed. Please reconnect.
                      </p>
                    )}
                    {c.status === "attention" && (
                      <p className="rounded-md bg-warning/10 p-3 text-xs">
                        Column “Target” is missing — ingestion is paused so no one is judged on bad
                        data.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.status === "not-connected" ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setSelected(connectorGallery.find((g) => g.id === "email")!)
                          }
                        >
                          Set up
                        </Button>
                      ) : c.status === "failed" ? (
                        <Button size="sm" onClick={() => reconnect(c)} disabled={busy}>
                          {busy ? <Loader2 className="animate-spin" /> : <KeyRound />} Reconnect
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => sync(c)} disabled={busy}>
                          <RefreshCw className={cn(busy && "animate-spin")} />{" "}
                          {busy ? "Syncing…" : "Sync now"}
                        </Button>
                      )}
                      {c.status === "attention" ? (
                        <Button size="sm" variant="ghost" asChild>
                          <a href="/connectors/mapping?tab=drift">Fix drift</a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={onOpenMapping}>
                          Mapping
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="add-connector" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="add-connector" className="text-lg font-semibold">
            Add a connector
          </h2>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Connector category">
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "outline"}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {connectorGallery
            .filter((g) => category === "All" || g.category === category)
            .map((g) => (
              <Card key={g.id} className="rounded-lg shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                      <Upload className="size-5" />
                    </div>
                    <StatusBadge tone="neutral">{g.category}</StatusBadge>
                  </div>
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Auth</dt>
                      <dd className="font-medium">{g.auth}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Sync</dt>
                      <dd className="font-medium">{g.syncMode}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Setup</dt>
                      <dd className="font-medium">{g.setupTime}</dd>
                    </div>
                  </dl>
                  <Button size="sm" variant="outline" onClick={() => setSelected(g)}>
                    Set up
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <SetupWizard
              key={selected.id}
              connector={selected}
              onDone={(name) => {
                setList((l) => [
                  {
                    id: `${selected.id}-${l.length}`,
                    name,
                    kind: selected.name,
                    status: "connected",
                    lastSync: "Syncing…",
                    records: 0,
                  },
                  ...l,
                ]);
                toast.success(`Connected to ${selected.name}. First sync started.`);
                setSelected(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SetupWizard({
  connector,
  onDone,
}: {
  connector: GalleryConnector;
  onDone: (name: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [authState, setAuthState] = useState<"idle" | "working" | "ok" | "failed">("idle");
  const [apiKey, setApiKey] = useState("");
  const [objects, setObjects] = useState<string[]>(connector.objects.slice(0, 1));
  const [interval, setInterval] = useState("15 minutes");
  const [mapping, setMapping] = useState(
    Object.fromEntries(connector.fields.map((f) => [f.name, f.maps])),
  );
  const [identity, setIdentity] = useState("email");
  const [filter, setFilter] = useState(connector.category === "CRM" ? 'Stage == "Closed Won"' : "");
  const [testing, setTesting] = useState<"idle" | "running" | "done">("idle");
  const [activating, setActivating] = useState(0);
  const name = `${connector.name} — ${objects[0] ?? "data"}`;

  const authenticate = (fail = false) => {
    setAuthState("working");
    window.setTimeout(() => setAuthState(fail ? "failed" : "ok"), 1100);
  };

  const activate = () => {
    setActivating(10);
    const tick = (p: number) => {
      if (p >= 100) return onDone(name);
      window.setTimeout(() => {
        setActivating(p + 30);
        tick(p + 30);
      }, 350);
    };
    tick(10);
  };

  const canNext = [authState === "ok", objects.length > 0, true, testing === "done", true][step];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Connect {connector.name}</DialogTitle>
        <DialogDescription>
          {connector.auth} · {connector.syncMode} sync · about {connector.setupTime}. Simulated — no
          real account is connected.
        </DialogDescription>
      </DialogHeader>
      <ol className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Setup steps">
        {steps.map((s, i) => (
          <li
            key={s}
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
              {i < step ? "✓" : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-3">
          {connector.auth === "OAuth" && (
            <p className="text-sm">
              You'll be sent to {connector.name} to sign in and allow read-only access, then brought
              back here.
            </p>
          )}
          {connector.auth === "API key" && (
            <div className="space-y-1.5">
              <Label htmlFor="api-key">API key</Label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste the key from your admin settings"
              />
              <p className="text-xs text-muted-foreground">
                Stored encrypted. Only read access is used.
              </p>
            </div>
          )}
          {connector.auth === "Service account" && (
            <div className="rounded-md bg-muted p-3 text-sm">
              Share your sheet with{" "}
              <span className="font-mono">sheets@veronyx-recognise.iam.gserviceaccount.com</span>{" "}
              (viewer), or upload a service-account JSON.
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success("Address copied")}>
                  <Copy /> Copy address
                </Button>
                <Button size="sm" variant="ghost">
                  <FileJson /> Upload JSON
                </Button>
              </div>
            </div>
          )}
          {connector.auth === "File upload" && (
            <p className="text-sm">
              You'll drop the file on the next run; for now we'll check the template matches.
            </p>
          )}
          {connector.auth === "Forwarding address" && (
            <p className="flex items-center gap-2 rounded-md bg-muted p-3 font-mono text-sm">
              <Mail className="size-4" /> rkmills.suggestions@in.veronyx.io
            </p>
          )}
          {connector.auth === "Signed URL" && (
            <div className="space-y-1 rounded-md bg-muted p-3 font-mono text-xs">
              <p>POST https://hooks.veronyx.io/rkm/8f2c1e</p>
              <p>Secret: whsec_••••••••3d9a</p>
              <p className="font-sans text-muted-foreground">
                Events: production.output, quality.inspection
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => authenticate()}
              disabled={
                authState === "working" || (connector.auth === "API key" && apiKey.length < 6)
              }
            >
              {authState === "working" && <Loader2 className="animate-spin" />}
              {connector.auth === "OAuth"
                ? `Sign in to ${connector.name}`
                : connector.auth === "API key"
                  ? "Validate key"
                  : "Check connection"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => authenticate(true)}>
              Demo: simulate a failure
            </Button>
          </div>
          {authState === "ok" && (
            <p className="flex items-center gap-2 text-sm text-success" role="status">
              <CheckCircle2 className="size-4" /> Connected with read-only access.
            </p>
          )}
          {authState === "failed" && (
            <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
              <XCircle className="size-4" /> Authentication failed. Please reconnect.
            </p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">What to sync</legend>
            {connector.objects.map((o) => (
              <label key={o} className="flex min-h-9 items-center gap-2 text-sm">
                <Checkbox
                  checked={objects.includes(o)}
                  onCheckedChange={(v) =>
                    setObjects(v ? [...objects, o] : objects.filter((x) => x !== o))
                  }
                />{" "}
                {o}
              </label>
            ))}
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Sync mode</Label>
              <Input value={connector.syncMode} readOnly aria-label="Sync mode" />
            </div>
            {connector.syncMode === "poll" && (
              <div className="space-y-1.5">
                <Label>Check for new data every</Label>
                <Select value={interval} onValueChange={setInterval}>
                  <SelectTrigger aria-label="Polling interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["5 minutes", "15 minutes", "1 hour", "Daily at 06:00"].map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="group px-0">
                <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />{" "}
                Advanced
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="rate">Rate limit (requests / minute)</Label>
                <Input id="rate" defaultValue="60" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="page">Page size</Label>
                <Input id="page" defaultValue="200" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Fields discovered from {connector.name}. We suggested a match for each — change any that
            look wrong.
          </p>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-muted text-left text-xs text-muted-foreground">
                <tr>
                  <th className="p-2 font-medium">Source field</th>
                  <th className="p-2 font-medium">Type · sample</th>
                  <th className="p-2 font-medium">Veronyx attribute</th>
                </tr>
              </thead>
              <tbody>
                {connector.fields.map((f) => (
                  <tr key={f.name} className="border-t border-border">
                    <td className="p-2 font-mono text-xs">{f.name}</td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {f.type} · {f.sample}
                    </td>
                    <td className="p-2">
                      <Select
                        value={mapping[f.name] ?? "ignore"}
                        onValueChange={(v) => setMapping({ ...mapping, [f.name]: v })}
                      >
                        <SelectTrigger className="h-8" aria-label={`Map ${f.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {canonical.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Identity hint</Label>
              <Select value={identity} onValueChange={setIdentity}>
                <SelectTrigger aria-label="Identity hint">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="crm_user_id">CRM user ID</SelectItem>
                  <SelectItem value="employee_code">Employee code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dedup">Dedup key</Label>
              <Input id="dedup" defaultValue="source_record_id + object_name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flt">Filter (optional)</Label>
              <Input
                id="flt"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder='Stage == "Closed Won"'
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Saved as mapping version 1. Full mapping wizard: Mapping & identity.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          {testing === "idle" && (
            <Button
              onClick={() => {
                setTesting("running");
                window.setTimeout(() => setTesting("done"), 1200);
              }}
            >
              Fetch 5 sample records
            </Button>
          )}
          {testing === "running" && (
            <p className="flex items-center gap-2 text-sm" role="status">
              <Loader2 className="size-4 animate-spin" /> Fetching sample records…
            </p>
          )}
          {testing === "done" && (
            <>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[480px] text-xs">
                  <thead className="bg-muted text-left text-muted-foreground">
                    <tr>
                      <th className="p-2">Record</th>
                      <th className="p-2">Person</th>
                      <th className="p-2">Value</th>
                      <th className="p-2">Identity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["88213", "pooja.kumar@rkmills.in", "₹ 2,10,000", true],
                      ["88190", "priya.nair@rkmills.in", "₹ 1,45,000", true],
                      ["88177", "fatima.rao@rkmills.in", "₹ 2,40,000", true],
                      ["88102", "sales.temp@rkmills.in", "₹ 98,000", false],
                      ["88099", "deepa.joshi@rkmills.in", "₹ 76,000", true],
                    ].map(([id, who, val, ok]) => (
                      <tr key={String(id)} className="border-t border-border">
                        <td className="p-2 font-mono">{id}</td>
                        <td className="p-2">{who}</td>
                        <td className="p-2">{val}</td>
                        <td className="p-2">
                          {ok ? (
                            <span className="text-success">✅ Resolved</span>
                          ) : (
                            <span className="text-destructive">❌ Unresolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm">
                4 of 5 matched to employees (80%). 1 record will go to the identity queue. No type
                errors.
              </p>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <p className="text-sm">
            Ready to start the first sync of <span className="font-medium">{name}</span>.
          </p>
          {activating > 0 && (
            <div role="status" aria-live="polite" className="space-y-2">
              <p className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" /> Syncing… {Math.min(activating, 100)}%
              </p>
              <Progress value={activating} aria-label="First sync progress" />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between border-t border-border pt-4">
        <Button
          variant="outline"
          disabled={step === 0 || activating > 0}
          onClick={() => setStep(step - 1)}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button disabled={activating > 0} onClick={activate}>
            Activate & start first sync
          </Button>
        )}
      </div>
    </>
  );
}
