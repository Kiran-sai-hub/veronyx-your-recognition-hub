import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  MessageCircle,
  Plus,
  Send,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  captureFieldPalette,
  captureFields,
  nativeEntries,
  type CaptureField,
} from "@/lib/phase2-data";
import { cn } from "@/lib/utils";

const whoOptions = ["Employee self", "Supervisor/Manager", "HR Admin", "Specific roles"];

/** Native capture form builder (§4.10, P-05) and entry approval queue (P-06). */
export function CapturePage({ readOnly = false }: { readOnly?: boolean }) {
  const [name, setName] = useState("Daily Factory Output");
  const [frequency, setFrequency] = useState("shift");
  const [channels, setChannels] = useState(["mobile", "WhatsApp"]);
  const [board, setBoard] = useState("Factory Line Output Board");
  const [fields, setFields] = useState<CaptureField[]>(captureFields);
  const [openField, setOpenField] = useState<string | null>(null);
  const [who, setWho] = useState(["Supervisor/Manager"]);
  const [rules, setRules] = useState({
    approval: true,
    evidence: false,
    lock: true,
    history: true,
  });
  const [lang, setLang] = useState<"en" | "hi" | "ta">("en");
  const [saved, setSaved] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const [testEntries, setTestEntries] = useState<typeof nativeEntries>([]);

  const label = (f: CaptureField) =>
    lang === "hi" ? f.labelHi : lang === "ta" ? f.labelTa : f.label;
  const patch = (id: string, p: Partial<CaptureField>) =>
    setFields((list) => list.map((f) => (f.id === id ? { ...f, ...p } : f)));
  const move = (index: number, d: number) =>
    setFields((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      if (item) next.splice(index + d, 0, item);
      return next;
    });
  const entries = [...testEntries, ...nativeEntries];
  const pending = entries.filter((e) => !decisions[e.id]).length;

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Performance Boards"
        title="Native capture"
        description="For teams without a tracking tool: simple forms filled on a phone, on WhatsApp or at a kiosk. Entries wait for approval before they count."
      />
      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="builder">Form builder</TabsTrigger>
          <TabsTrigger value="entries">
            Entries to review{pending ? ` (${pending})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6">
          <fieldset disabled={readOnly} className="grid min-w-0 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-4">
              <Card className="rounded-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">1 · Form basics</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="form-name">Form name</Label>
                    <Input id="form-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Entry frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger aria-label="Entry frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["daily", "weekly", "monthly", "event", "shift"].map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Linked performance board</Label>
                    <Select value={board} onValueChange={setBoard}>
                      <SelectTrigger aria-label="Linked board">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Factory Line Output Board",
                          "Zero-defect shifts",
                          "Safety suggestions",
                        ].map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <p className="text-sm font-medium">Entry channels</p>
                    <div
                      className="flex flex-wrap gap-1.5"
                      role="group"
                      aria-label="Entry channels"
                    >
                      {["web", "mobile", "WhatsApp", "kiosk"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-pressed={channels.includes(c)}
                          onClick={() =>
                            setChannels(
                              channels.includes(c)
                                ? channels.filter((x) => x !== c)
                                : [...channels, c],
                            )
                          }
                          className={cn(
                            "min-h-9 rounded-full border px-3 text-xs",
                            channels.includes(c)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border",
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">2 · Fields</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {captureFieldPalette.map((kind) => (
                      <Button
                        key={kind}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const id = `cf-${Date.now()}`;
                          setFields([
                            ...fields,
                            {
                              id,
                              label: `New ${kind.toLowerCase()} field`,
                              labelHi: "",
                              labelTa: "",
                              kind,
                              required: false,
                              validation: "",
                              defaultValue: "",
                            },
                          ]);
                          setOpenField(id);
                        }}
                      >
                        <Plus /> {kind}
                      </Button>
                    ))}
                  </div>
                  {fields.map((f, i) => (
                    <div key={f.id} className="rounded-md border border-border">
                      <div className="flex items-center gap-2 p-2">
                        <div className="flex flex-col">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            disabled={i === 0}
                            onClick={() => move(i, -1)}
                            aria-label={`Move ${f.label} up`}
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            disabled={i === fields.length - 1}
                            onClick={() => move(i, 1)}
                            aria-label={`Move ${f.label} down`}
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                        </div>
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          aria-expanded={openField === f.id}
                          onClick={() => setOpenField(openField === f.id ? null : f.id)}
                        >
                          <p className="truncate text-sm font-medium">
                            {f.label}
                            {f.required && <span className="text-destructive"> *</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {f.kind}
                            {f.validation && ` · ${f.validation}`}
                          </p>
                        </button>
                        <ChevronDown
                          className={cn(
                            "size-4 text-muted-foreground transition-transform",
                            openField === f.id && "rotate-180",
                          )}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label={`Remove ${f.label}`}
                          onClick={() => setFields(fields.filter((x) => x.id !== f.id))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      {openField === f.id && (
                        <div className="grid gap-2 border-t border-border bg-muted/40 p-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Label (English)</Label>
                            <Input
                              value={f.label}
                              onChange={(e) => patch(f.id, { label: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label (हिन्दी)</Label>
                            <Input
                              value={f.labelHi}
                              onChange={(e) => patch(f.id, { labelHi: e.target.value })}
                              placeholder="Falls back to English"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label (தமிழ்)</Label>
                            <Input
                              value={f.labelTa}
                              onChange={(e) => patch(f.id, { labelTa: e.target.value })}
                              placeholder="Falls back to English"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Validation rule</Label>
                            <Input
                              value={f.validation}
                              onChange={(e) => patch(f.id, { validation: e.target.value })}
                              placeholder="e.g. 0 – 1,000"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Default value</Label>
                            <Input
                              value={f.defaultValue}
                              onChange={(e) => patch(f.id, { defaultValue: e.target.value })}
                            />
                          </div>
                          <label className="flex items-end gap-2 pb-2 text-sm">
                            <Switch
                              checked={f.required}
                              onCheckedChange={(v) => patch(f.id, { required: v })}
                            />{" "}
                            Required
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">3 · Who enters & rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Who can enter">
                    {whoOptions.map((w) => (
                      <button
                        key={w}
                        type="button"
                        aria-pressed={who.includes(w)}
                        onClick={() =>
                          setWho(who.includes(w) ? who.filter((x) => x !== w) : [...who, w])
                        }
                        className={cn(
                          "min-h-9 rounded-full border px-3 text-xs",
                          who.includes(w)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        ["approval", "Approval required (recommended)"],
                        ["evidence", "Evidence photo required"],
                        ["lock", "Lock entries after the window closes"],
                        ["history", "Keep edit history"],
                      ] as const
                    ).map(([key, text]) => (
                      <label
                        key={key}
                        className="flex min-h-11 items-center justify-between gap-2 rounded-md border border-border px-3 text-sm"
                      >
                        {text}
                        <Switch
                          checked={rules[key]}
                          onCheckedChange={(v) => setRules({ ...rules, [key]: v })}
                        />
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-4">
                <Button
                  onClick={() => {
                    setSaved(true);
                    toast.success(
                      `${name} is live. ${who.includes("Supervisor/Manager") ? "Supervisors have been notified." : ""}`,
                    );
                  }}
                >
                  5 · Save & activate
                </Button>
                {saved && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Link copied")}
                    >
                      <Copy /> veronyx.in/f/rkm-output
                    </Button>
                    <span className="flex items-center gap-1 text-sm text-success">
                      <MessageCircle className="size-4" /> WhatsApp: send “OUTPUT” to +91 80470
                      12345
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Card className="rounded-lg">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Smartphone className="size-4" /> 4 · Mobile preview
                  </CardTitle>
                  <Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
                    <SelectTrigger className="h-8 w-24" aria-label="Preview language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">EN</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="ta">தமிழ்</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="mx-auto max-w-60 space-y-2 rounded-2xl border-4 border-foreground/80 p-3">
                    <p className="text-center text-xs font-semibold">{name}</p>
                    {fields.map((f) => (
                      <div key={f.id} className="rounded-md border border-border p-2 text-xs">
                        <span className="text-muted-foreground">
                          {label(f) || f.label}
                          {f.required ? " *" : ""}
                        </span>
                        <div className="mt-1 h-6 rounded bg-muted px-1.5 text-[11px] leading-6 text-muted-foreground">
                          {f.defaultValue}
                        </div>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setTestEntries((t) => [
                          {
                            id: `test-${Date.now()}`,
                            employee: "Test entry (you)",
                            form: name,
                            summary: "412 units · Shift A · today",
                            submitted: "Just now",
                            evidence: !rules.evidence,
                          },
                          ...t,
                        ]);
                        toast.success("Entry submitted. Pending approval.");
                      }}
                    >
                      Submit test entry
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="size-4" /> WhatsApp preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 rounded-lg bg-[#e5ddd5] p-3 text-xs text-black dark:bg-muted dark:text-foreground">
                    <p className="ml-auto w-fit rounded-lg bg-[#dcf8c6] p-2 dark:bg-primary dark:text-primary-foreground">
                      OUTPUT
                    </p>
                    {fields.slice(0, 4).map((f, i) => (
                      <div key={f.id} className="space-y-2">
                        <p className="w-fit rounded-lg bg-white p-2 shadow-sm dark:bg-card">
                          {i + 1}/{fields.length} {label(f) || f.label}?
                        </p>
                        <p className="ml-auto w-fit rounded-lg bg-[#dcf8c6] p-2 dark:bg-primary dark:text-primary-foreground">
                          {["RKM0009", "08/10/2026", "A", "412"][i]}
                        </p>
                      </div>
                    ))}
                    <p className="w-fit rounded-lg bg-white p-2 shadow-sm dark:bg-card">
                      Saved ✅ Waiting for your supervisor to approve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </fieldset>
        </TabsContent>

        <TabsContent value="entries" className="mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Entries only count on the board after a person approves them.
          </p>
          {entries.map((entry) => {
            const decision = decisions[entry.id];
            return (
              <Card key={entry.id} className="rounded-lg">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{entry.employee}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.form} · {entry.summary} · {entry.submitted}
                    </p>
                    {!entry.evidence && (
                      <p className="mt-1 text-xs text-warning">No photo attached</p>
                    )}
                  </div>
                  {decision ? (
                    <StatusBadge tone={decision === "approved" ? "success" : "error"}>
                      {decision === "approved" ? "Approved — counts on the board" : "Rejected"}
                    </StatusBadge>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={readOnly}
                        onClick={() => {
                          setDecisions((d) => ({ ...d, [entry.id]: "approved" }));
                          toast.success("Entry approved.");
                        }}
                      >
                        <Check /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={readOnly}
                        onClick={() => setDecisions((d) => ({ ...d, [entry.id]: "rejected" }))}
                      >
                        <X /> Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast("Asked the supervisor for a photo.")}
                      >
                        <Send /> Ask for evidence
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
