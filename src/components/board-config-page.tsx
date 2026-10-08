import {
  ArrowDown,
  ArrowUp,
  Eye,
  LockKeyhole,
  Medal,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import {
  type BehaviourRule,
  type Board,
  type ComparisonMode,
  actionTypes,
  blankBoard,
  boardLeaderboard,
  boards,
  comparisonModes,
  fromTemplate,
  newRule,
  ruleTypes,
  teamAverage,
} from "@/lib/board-data";
import { go } from "@/lib/navigate";
import { CircularProgress } from "@/components/library/circular-progress";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

const sections = [
  ["board", "1 · Board"],
  ["tracking", "2 · Tracking"],
  ["scorecard", "3 · Scorecard"],
  ["targets", "4 · Targets"],
  ["rules", "5 · Behaviour rules"],
  ["comparison", "6 · Comparison"],
  ["visibility", "7 · Visibility"],
  ["preview", "8 · Preview"],
] as const;

function Sel({
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
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
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
    <div className="space-y-1.5">
      <p className="text-xs font-medium">{label}</p>
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
                "min-h-9 rounded-full border px-3 text-xs",
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
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
      <span>
        {label}
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function BoardConfigPage({
  boardId,
  industry,
  role,
  readOnly = false,
  aiEnabled,
  onAskAi,
}: {
  boardId: string;
  industry?: string | undefined;
  role?: string | undefined;
  readOnly?: boolean;
  aiEnabled: boolean;
  onAskAi: (prompt: string) => void;
}) {
  const { savedBoards, saveBoard } = useDemoStore();
  const initial = useMemo(() => {
    const saved = savedBoards.find((b) => b.id === boardId)?.board as Board | undefined;
    if (saved) return saved;
    const seeded = boards.find((b) => b.id === boardId);
    if (seeded) return structuredClone(seeded);
    if (industry && role) return fromTemplate(industry, role);
    return blankBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, industry, role]);
  const [board, setBoard] = useState<Board>(initial);
  const [ruleDraft, setRuleDraft] = useState<BehaviourRule | null>(null);
  const set = (patch: Partial<Board>) => !readOnly && setBoard((b) => ({ ...b, ...patch }));
  const weightTotal = board.metrics.reduce((s, m) => s + (Number(m.weight) || 0), 0);
  const weightsOk = weightTotal === 100;

  const save = (status: "draft" | "active") => {
    if (status === "active" && !weightsOk) {
      toast.error(
        `Scorecard weights add up to ${weightTotal}%. They must total 100% before activating.`,
      );
      return;
    }
    const id = board.id === "new" ? `board-${Date.now().toString(36)}` : board.id;
    const next = { ...board, id, status };
    saveBoard({ id, name: next.name, status, board: next });
    setBoard(next);
    toast.success(
      status === "active"
        ? `${next.name} is active. Tracking starts with the next entry.`
        : `${next.name} saved as draft.`,
    );
    if (board.id === "new") go(`/boards/${id}`, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <a href="/boards" className="text-sm text-muted-foreground hover:text-foreground">
            ← Performance boards
          </a>
          <h1 className="text-2xl font-bold sm:text-3xl">{board.name || "New board"}</h1>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge tone={board.status === "active" ? "success" : "neutral"}>
              {board.status === "active" ? "Active" : "Draft"}
            </StatusBadge>
            <span className="capitalize">{board.type}</span> · {board.sourceMode} source ·{" "}
            {board.members} people
          </p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            {aiEnabled && (
              <Button
                variant="outline"
                onClick={() => onAskAi(`Suggest a fair scorecard for the board “${board.name}”`)}
              >
                <Sparkles /> AI Setup
              </Button>
            )}
            <Button variant="outline" onClick={() => save("draft")}>
              Save as draft
            </Button>
            <Button onClick={() => save("active")}>Activate</Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="board">
        <TabsList className="flex h-auto flex-wrap justify-start">
          {sections.map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
              {value === "scorecard" && !weightsOk && (
                <span
                  className="ml-1 size-2 rounded-full bg-destructive"
                  aria-label="needs attention"
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <fieldset disabled={readOnly} className="min-w-0">
          <TabsContent value="board" className="mt-6">
            <Card className="rounded-lg">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="b-name">Board name</Label>
                  <Input
                    id="b-name"
                    value={board.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Factory Line Output Board"
                  />
                </div>
                <Sel
                  label="Board type"
                  value={board.type}
                  onChange={(v) => set({ type: v as Board["type"] })}
                  options={["sales", "support", "manufacturing", "retail", "logistics", "custom"]}
                />
                <div className="space-y-1.5">
                  <p className="text-xs font-medium">Source mode</p>
                  <div
                    className="grid grid-cols-3 gap-2"
                    role="radiogroup"
                    aria-label="Source mode"
                  >
                    {(["External", "Native", "Hybrid"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={board.sourceMode === m}
                        onClick={() => set({ sourceMode: m })}
                        className={cn(
                          "rounded-md border p-2 text-left text-xs",
                          board.sourceMode === m
                            ? "border-2 border-primary bg-primary/5"
                            : "border-border",
                        )}
                      >
                        <span className="block text-sm font-medium">{m}</span>
                        {m === "External"
                          ? "From your tools"
                          : m === "Native"
                            ? "Entered in Veronyx"
                            : "Both"}
                      </button>
                    ))}
                  </div>
                </div>
                <Chips
                  label="Departments"
                  options={["Manufacturing", "Quality", "Sales", "Operations"]}
                  value={board.scope.departments}
                  onChange={(v) => set({ scope: { ...board.scope, departments: v } })}
                />
                <Chips
                  label="Teams"
                  options={[
                    "Sales A",
                    "Sales B",
                    "Manufacturing A",
                    "Manufacturing B",
                    "Quality A",
                  ]}
                  value={board.scope.teams}
                  onChange={(v) => set({ scope: { ...board.scope, teams: v } })}
                />
                <Chips
                  label="Locations"
                  options={["Coimbatore", "Chennai", "Erode", "Tiruppur"]}
                  value={board.scope.locations}
                  onChange={(v) => set({ scope: { ...board.scope, locations: v } })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="mt-6 grid gap-4 lg:grid-cols-2">
            {(board.sourceMode === "External" || board.sourceMode === "Hybrid") && (
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">External source</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Sel
                    label="Connector"
                    value={board.tracking.connector}
                    onChange={(v) => set({ tracking: { ...board.tracking, connector: v } })}
                    options={[
                      "Zoho CRM",
                      "Freshdesk",
                      "Google Sheets · Quality log",
                      "Production ERP webhook",
                      "Monthly sales file",
                    ]}
                  />
                  <Sel
                    label="Event type"
                    value={board.tracking.eventType}
                    onChange={(v) => set({ tracking: { ...board.tracking, eventType: v } })}
                    options={[
                      "crm.deal_closed",
                      "ticket.resolved",
                      "sheet.row_added",
                      "production.output",
                    ]}
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="idp" className="text-xs">
                      Identity resolution policy
                    </Label>
                    <Input
                      id="idp"
                      value={board.tracking.identityPolicy}
                      onChange={(e) =>
                        set({ tracking: { ...board.tracking, identityPolicy: e.target.value } })
                      }
                    />
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/connectors/mapping">Map fields (mapping wizard)</a>
                  </Button>
                </CardContent>
              </Card>
            )}
            {(board.sourceMode === "Native" || board.sourceMode === "Hybrid") && (
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">Native capture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Sel
                    label="Capture form"
                    value={board.tracking.form}
                    onChange={(v) => set({ tracking: { ...board.tracking, form: v } })}
                    options={["Daily Factory Output", "Quality spot check", "Safety suggestion"]}
                  />
                  <Sel
                    label="Entry frequency"
                    value={board.tracking.frequency}
                    onChange={(v) =>
                      set({
                        tracking: {
                          ...board.tracking,
                          frequency: v as Board["tracking"]["frequency"],
                        },
                      })
                    }
                    options={["daily", "weekly", "monthly", "event", "shift"]}
                  />
                  <Chips
                    label="Who can enter"
                    options={["Employee self", "Supervisor/Manager", "HR Admin"]}
                    value={board.tracking.allowedRoles}
                    onChange={(v) => set({ tracking: { ...board.tracking, allowedRoles: v } })}
                  />
                  <Toggle
                    label="Entries need approval"
                    checked={board.tracking.approvalRequired}
                    onChange={(v) => set({ tracking: { ...board.tracking, approvalRequired: v } })}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <a href="/capture">Open form builder</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scorecard" className="mt-6">
            <Card className="rounded-lg">
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                <div className="flex items-center gap-3">
                  <CircularProgress
                    value={Math.min(weightTotal, 100)}
                    size={56}
                    stroke={6}
                    label="Scorecard weights total"
                    tone={weightsOk ? "success" : "warning"}
                  />
                  <div>
                    <CardTitle className="text-base">Scorecard</CardTitle>
                    <p
                      className={cn(
                        "text-sm",
                        weightsOk ? "text-muted-foreground" : "text-destructive",
                      )}
                      role={weightsOk ? undefined : "alert"}
                    >
                      Weights total {weightTotal}% {weightsOk ? "✓" : "— must add up to 100%"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    set({
                      metrics: [
                        ...board.metrics,
                        {
                          id: `m${Date.now()}`,
                          metric: "Attendance (%)",
                          weight: 0,
                          target: "95%",
                          min: "0%",
                          max: "100%",
                          direction: "higher",
                        },
                      ],
                    })
                  }
                >
                  <Plus /> Add metric
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="flex h-3 overflow-hidden rounded-full bg-muted"
                  aria-label="Weighted combination"
                >
                  {board.metrics.map((m, i) => (
                    <div
                      key={m.id}
                      title={`${m.metric} ${m.weight}%`}
                      style={{ width: `${Math.min(100, m.weight)}%`, opacity: 1 - i * 0.2 }}
                      className="bg-primary"
                    />
                  ))}
                </div>
                {board.metrics.map((m, i) => (
                  <div
                    key={m.id}
                    className="grid items-end gap-2 rounded-md border border-border p-3 md:grid-cols-[auto_1.5fr_80px_1fr_1fr_1fr_160px_auto]"
                  >
                    <div className="flex gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        aria-label="Move up"
                        disabled={i === 0}
                        onClick={() => {
                          const next = [...board.metrics];
                          [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                          set({ metrics: next });
                        }}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        aria-label="Move down"
                        disabled={i === board.metrics.length - 1}
                        onClick={() => {
                          const next = [...board.metrics];
                          [next[i + 1], next[i]] = [next[i]!, next[i + 1]!];
                          set({ metrics: next });
                        }}
                      >
                        <ArrowDown />
                      </Button>
                    </div>
                    <Sel
                      label="Metric"
                      value={m.metric}
                      onChange={(v) =>
                        set({
                          metrics: board.metrics.map((x) =>
                            x.id === m.id ? { ...x, metric: v } : x,
                          ),
                        })
                      }
                      options={[
                        ...new Set([
                          m.metric,
                          "Sales vs target (%)",
                          "Deals closed",
                          "Units produced",
                          "Reject rate (%)",
                          "Attendance (%)",
                          "Average CSAT",
                          "Defects per shift",
                        ]),
                      ]}
                    />
                    {(["weight", "target", "min", "max"] as const).map((k) => (
                      <div key={k} className="space-y-1.5">
                        <Label className="text-xs capitalize">
                          {k === "weight" ? "Weight %" : k}
                        </Label>
                        <Input
                          aria-label={`${k} for ${m.metric}`}
                          value={String(m[k])}
                          onChange={(e) =>
                            set({
                              metrics: board.metrics.map((x) =>
                                x.id === m.id
                                  ? {
                                      ...x,
                                      [k]:
                                        k === "weight"
                                          ? Number(e.target.value.replace(/\D/g, "")) || 0
                                          : e.target.value,
                                    }
                                  : x,
                              ),
                            })
                          }
                        />
                      </div>
                    ))}
                    <Sel
                      label="Direction"
                      value={m.direction === "higher" ? "Higher is better" : "Lower is better"}
                      onChange={(v) =>
                        set({
                          metrics: board.metrics.map((x) =>
                            x.id === m.id
                              ? { ...x, direction: v.startsWith("Higher") ? "higher" : "lower" }
                              : x,
                          ),
                        })
                      }
                      options={["Higher is better", "Lower is better"]}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${m.metric}`}
                      onClick={() => set({ metrics: board.metrics.filter((x) => x.id !== m.id) })}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                {board.metrics.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No metrics yet — add one from the metric catalogue.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="targets" className="mt-6">
            <Card className="rounded-lg">
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">Targets</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      toast.success("12 targets imported from “Targets FY26-27” sheet.")
                    }
                  >
                    <Upload /> Import from sheet
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      set({
                        targets: [
                          ...board.targets,
                          {
                            id: `t${Date.now()}`,
                            level: "Employee",
                            who: "Every member",
                            metric: board.metrics[0]?.metric ?? "",
                            window: "monthly",
                            value: "",
                            stretch: "",
                          },
                        ],
                      })
                    }
                  >
                    <Plus /> Add target
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {board.targets.length === 0 && (
                  <p className="text-sm text-muted-foreground">No targets yet.</p>
                )}
                {board.targets.map((t) => (
                  <div
                    key={t.id}
                    className="grid items-end gap-2 rounded-md border border-border p-3 sm:grid-cols-3 lg:grid-cols-[110px_1fr_1fr_120px_1fr_1fr_auto]"
                  >
                    <Sel
                      label="Level"
                      value={t.level}
                      onChange={(v) =>
                        set({
                          targets: board.targets.map((x) =>
                            x.id === t.id ? { ...x, level: v as typeof t.level } : x,
                          ),
                        })
                      }
                      options={["Employee", "Team", "Location", "Board"]}
                    />
                    {(["who", "metric"] as const).map((k) => (
                      <div key={k} className="space-y-1.5">
                        <Label className="text-xs capitalize">
                          {k === "who" ? "Applies to" : "Metric"}
                        </Label>
                        <Input
                          aria-label={k}
                          value={t[k]}
                          onChange={(e) =>
                            set({
                              targets: board.targets.map((x) =>
                                x.id === t.id ? { ...x, [k]: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </div>
                    ))}
                    <Sel
                      label="Window"
                      value={t.window}
                      onChange={(v) =>
                        set({
                          targets: board.targets.map((x) =>
                            x.id === t.id ? { ...x, window: v as typeof t.window } : x,
                          ),
                        })
                      }
                      options={["daily", "weekly", "monthly", "quarterly"]}
                    />
                    {(["value", "stretch"] as const).map((k) => (
                      <div key={k} className="space-y-1.5">
                        <Label className="text-xs capitalize">
                          {k === "value" ? "Target" : "Stretch"}
                        </Label>
                        <Input
                          aria-label={k}
                          value={t[k]}
                          onChange={(e) =>
                            set({
                              targets: board.targets.map((x) =>
                                x.id === t.id ? { ...x, [k]: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </div>
                    ))}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove target"
                      onClick={() => set({ targets: board.targets.filter((x) => x.id !== t.id) })}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Automatic actions based on performance. Poor-performance rules are private by
                default.
              </p>
              <Button size="sm" onClick={() => setRuleDraft(newRule())}>
                <Plus /> New rule
              </Button>
            </div>
            {board.rules.length === 0 && (
              <Card className="rounded-lg border-dashed">
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No behaviour rules yet.
                </CardContent>
              </Card>
            )}
            <div className="grid gap-3 lg:grid-cols-2">
              {board.rules.map((r) => (
                <Card key={r.id} className="rounded-lg">
                  <CardContent className="space-y-2 p-4 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.type.replace(/_/g, " ")}</p>
                      </div>
                      <Switch
                        checked={r.active}
                        aria-label={`${r.name} active`}
                        onCheckedChange={(v) =>
                          set({
                            rules: board.rules.map((x) =>
                              x.id === r.id ? { ...x, active: v } : x,
                            ),
                          })
                        }
                      />
                    </div>
                    <p>
                      <span className="text-muted-foreground">When</span> {r.trigger.toLowerCase()}:{" "}
                      {r.condition}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Then</span> {r.action.toLowerCase()} →{" "}
                      {r.audience}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {r.isPrivate ? (
                        <StatusBadge tone="private">Private</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">Visible to audience</StatusBadge>
                      )}
                      {r.managerConfirm && (
                        <StatusBadge tone="neutral">Manager confirms</StatusBadge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto"
                        onClick={() => setRuleDraft(r)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-2" role="radiogroup" aria-label="Comparison policy">
              {comparisonModes.map((c) => (
                <button
                  key={c.mode}
                  type="button"
                  role="radio"
                  aria-checked={board.comparison.mode === c.mode}
                  onClick={() => set({ comparison: { ...board.comparison, mode: c.mode } })}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md border p-3 text-left",
                    board.comparison.mode === c.mode
                      ? "border-2 border-primary bg-primary/5"
                      : "border-border",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 size-4 shrink-0 rounded-full border-2",
                      board.comparison.mode === c.mode
                        ? "border-primary bg-primary"
                        : "border-muted-foreground",
                    )}
                  />
                  <span>
                    <span className="block text-sm font-medium">{c.label}</span>
                    <span className="block text-sm text-muted-foreground">{c.detail}</span>
                  </span>
                </button>
              ))}
              {board.comparison.mode === "public_top_n" && (
                <div className="flex items-center gap-2 pl-7 text-sm">
                  <Label htmlFor="topn">N =</Label>
                  <Input
                    id="topn"
                    className="w-20"
                    value={board.comparison.topN}
                    onChange={(e) =>
                      set({
                        comparison: { ...board.comparison, topN: Number(e.target.value) || 1 },
                      })
                    }
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Toggle
                label="Show names"
                checked={board.comparison.showNames}
                onChange={(v) => set({ comparison: { ...board.comparison, showNames: v } })}
              />
              <Toggle
                label="Show photos"
                checked={board.comparison.showPhotos}
                onChange={(v) => set({ comparison: { ...board.comparison, showPhotos: v } })}
              />
              <Toggle
                label="Show low performers"
                hint="Off by default — the bottom of a list is never public"
                checked={board.comparison.showLowPerformers}
                onChange={(v) => set({ comparison: { ...board.comparison, showLowPerformers: v } })}
              />
              <Toggle
                label="Show team average"
                checked={board.comparison.showTeamAverage}
                onChange={(v) => set({ comparison: { ...board.comparison, showTeamAverage: v } })}
              />
              <Toggle
                label="Consent required for public display"
                hint="Captured under DPDP · see Privacy & DPDP"
                checked={board.comparison.consentRequired}
                onChange={(v) => set({ comparison: { ...board.comparison, consentRequired: v } })}
              />
              <LeaderboardPreview board={board} audience="employee" />
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="mt-6">
            <Card className="overflow-x-auto rounded-lg">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="border-b border-border text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">What</th>
                    <th className="p-3 font-medium">Employees</th>
                    <th className="p-3 font-medium">Managers</th>
                    <th className="p-3 font-medium">Kiosk display</th>
                  </tr>
                </thead>
                <tbody>
                  {board.visibility.map((v, i) => (
                    <tr key={v.item} className="border-b border-border last:border-0">
                      <td className="p-3">{v.item}</td>
                      {(["employees", "managers", "kiosk"] as const).map((k) => (
                        <td key={k} className="p-3">
                          <Switch
                            checked={v[k]}
                            aria-label={`${v.item} visible to ${k}`}
                            onCheckedChange={(c) =>
                              set({
                                visibility: board.visibility.map((x, j) =>
                                  j === i ? { ...x, [k]: c } : x,
                                ),
                              })
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="flex items-start gap-2 border-t border-border bg-private-surface p-3 text-sm text-private">
                <LockKeyhole className="mt-0.5 size-4 shrink-0" /> People near the bottom are never
                shown on shared screens. Their standing is visible only to them and their manager.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-6 grid gap-4 lg:grid-cols-2">
            <LeaderboardPreview board={board} audience="employee" />
            <LeaderboardPreview board={board} audience="manager" />
          </TabsContent>
        </fieldset>
      </Tabs>

      <RuleEditor
        rule={ruleDraft}
        onClose={() => setRuleDraft(null)}
        onSave={(r) => {
          set({
            rules: board.rules.some((x) => x.id === r.id)
              ? board.rules.map((x) => (x.id === r.id ? r : x))
              : [...board.rules, r],
          });
          setRuleDraft(null);
          toast.success("Rule created and active.");
        }}
      />
    </div>
  );
}

function LeaderboardPreview({
  board,
  audience,
}: {
  board: Board;
  audience: "employee" | "manager";
}) {
  const c = board.comparison;
  const me = boardLeaderboard[6];
  let rows = boardLeaderboard;
  let note = "";
  if (audience === "employee") {
    if (c.mode === "private_self_only" || c.mode === "manager_only") {
      rows = me ? [me] : [];
      note = "Employees see only their own number.";
    } else if (c.mode === "public_top_n") {
      rows = [...boardLeaderboard.slice(0, c.topN), ...(me && me.rank > c.topN ? [me] : [])];
      note = `Top ${c.topN} for everyone, plus your own rank.`;
    } else if (!c.showLowPerformers) {
      rows = boardLeaderboard.slice(0, Math.ceil(boardLeaderboard.length / 2));
      note = "Bottom half hidden.";
    }
  }
  const anonymous = c.mode === "anonymous_benchmark" && audience === "employee";
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="size-4" />{" "}
          {audience === "employee" ? "What an employee sees" : "What a manager sees"}
        </CardTitle>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardHeader>
      <CardContent className="space-y-1.5">
        {anonymous ? (
          <div className="space-y-2 rounded-md bg-muted p-4 text-sm">
            <p>
              Your score: <span className="font-semibold">{me?.score}</span>
            </p>
            <p>
              Team average: <span className="font-semibold">{teamAverage}</span>
            </p>
            <p className="text-xs text-muted-foreground">No names or ranks are shown.</p>
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.name}
              className={cn(
                "flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm",
                r === me && audience === "employee" && "border-primary bg-primary/5",
              )}
            >
              <span className="flex items-center gap-2">
                <Medal
                  className={cn("size-4", r.rank <= 3 ? "text-reward" : "text-muted-foreground")}
                />
                {r.rank}. {c.showNames || audience === "manager" ? r.name : `Person ${r.rank}`}
                {r === me && audience === "employee" && (
                  <span className="text-xs text-primary">(you)</span>
                )}
              </span>
              <span className="font-semibold">{r.score}</span>
            </div>
          ))
        )}
        {c.showTeamAverage && !anonymous && (
          <p className="pt-1 text-xs text-muted-foreground">Team average: {teamAverage}</p>
        )}
      </CardContent>
    </Card>
  );
}

const poorPerformanceTypes = [
  "manager_alert",
  "private_employee_nudge",
  "coaching_task",
  "escalation",
];

function RuleEditor({
  rule,
  onClose,
  onSave,
}: {
  rule: BehaviourRule | null;
  onClose: () => void;
  onSave: (r: BehaviourRule) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<BehaviourRule | null>(rule);
  const [tested, setTested] = useState(false);
  if (rule && draft?.id !== rule.id) {
    setDraft(rule);
    setStep(0);
    setTested(false);
  }
  if (!rule || !draft) return null;
  const set = (patch: Partial<BehaviourRule>) => setDraft({ ...draft, ...patch });
  const steps = ["Basics", "Trigger", "Action", "Privacy & safety", "Validate & test"];
  const exposesLowPerformers = poorPerformanceTypes.includes(draft.type) && !draft.isPrivate;
  const canNext = step !== 0 || draft.name.trim().length > 0;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{rule.name ? `Edit “${rule.name}”` : "New behaviour rule"}</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {steps.length}: {steps[step]}
          </DialogDescription>
        </DialogHeader>
        {step === 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="r-name">Rule name</Label>
              <Input
                id="r-name"
                value={draft.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Low attendance alert"
              />
            </div>
            <Sel
              label="Rule type"
              value={draft.type}
              onChange={(v) =>
                set({
                  type: v as BehaviourRule["type"],
                  isPrivate: poorPerformanceTypes.includes(v) ? true : draft.isPrivate,
                })
              }
              options={[...ruleTypes]}
            />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <Sel
              label="Trigger type"
              value={draft.trigger}
              onChange={(v) => set({ trigger: v as BehaviourRule["trigger"] })}
              options={["Metric threshold", "Schedule", "Event", "Manual"]}
            />
            <div className="space-y-1.5">
              <Label htmlFor="r-cond">Condition</Label>
              <Input
                id="r-cond"
                value={draft.condition}
                onChange={(e) => set({ condition: e.target.value })}
                placeholder="attendance < 90%"
              />
              <p className="text-xs text-muted-foreground">
                Field / metric, operator (eq, neq, gt, lt, between) and value.
              </p>
            </div>
            {draft.trigger === "Metric threshold" && (
              <Sel
                label="Window"
                value={draft.window}
                onChange={(v) => set({ window: v })}
                options={["last 7 days", "last 30 days", "this month", "this shift"]}
              />
            )}
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Sel
              label="Action"
              value={draft.action}
              onChange={(v) => set({ action: v as BehaviourRule["action"] })}
              options={[...actionTypes]}
            />
            <Sel
              label="Audience"
              value={draft.audience}
              onChange={(v) => set({ audience: v as BehaviourRule["audience"] })}
              options={["Employee (private)", "Manager", "HR", "Team"]}
            />
            <Sel
              label="Message template"
              value={draft.template}
              onChange={(v) => set({ template: v })}
              options={[
                "manager_alert_v2",
                "private_nudge_v1",
                "team_celebration_v3",
                "data_reminder_v1",
              ]}
            />
            <div className="space-y-1.5">
              <Label htmlFor="r-cool" className="text-xs">
                Cooldown (days, prevents spam)
              </Label>
              <Input
                id="r-cool"
                value={draft.cooldownDays}
                onChange={(e) => set({ cooldownDays: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-2">
            <Toggle
              label="Private"
              hint="Default for poor-performance rules"
              checked={draft.isPrivate}
              onChange={(v) => set({ isPrivate: v })}
            />
            <Toggle
              label="Manager confirms before anything is sent"
              checked={draft.managerConfirm}
              onChange={(v) => set({ managerConfirm: v })}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="r-imp" className="text-xs">
                  Improvement window before escalation (days)
                </Label>
                <Input
                  id="r-imp"
                  value={draft.improvementDays}
                  onChange={(e) => set({ improvementDays: Number(e.target.value) || 0 })}
                />
              </div>
              <Sel
                label="Language"
                value={draft.locale}
                onChange={(v) => set({ locale: v })}
                options={["Employee's language", "English", "हिन्दी", "தமிழ்"]}
              />
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-success">
              <ShieldCheck className="size-4" /> Rule syntax is valid.
            </p>
            {!tested ? (
              <Button variant="outline" onClick={() => setTested(true)}>
                Dry-run against the last 30 days
              </Button>
            ) : (
              <ul className="space-y-1 rounded-md bg-muted p-3">
                <li>Would have affected 6 people.</li>
                <li>Would have sent 9 messages ({draft.audience}).</li>
                <li>Cooldown blocked 3 repeat messages.</li>
              </ul>
            )}
            {exposesLowPerformers ? (
              <p role="alert" className="rounded-md bg-destructive/10 p-3 text-destructive">
                This rule would show low performers to others. Make it private before saving.
              </p>
            ) : (
              <p className="text-success">✓ No public exposure of low performers.</p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < steps.length - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          ) : (
            <Button
              disabled={exposesLowPerformers || !tested}
              onClick={() => onSave({ ...draft, active: true })}
            >
              Save & activate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
