import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarHeart,
  Check,
  CheckSquare,
  Circle,
  Coins,
  Database,
  Eye,
  Gift,
  HeartHandshake,
  LockKeyhole,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Users,
  WalletCards,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePendingApprovals } from "@/hooks/use-pending-approvals";
import { monthlyTrend } from "@/lib/admin-data";
import { type Approval, isBudgetExhausted } from "@/lib/approvals-data";
import {
  managerTeam,
  orgPulse,
  recognitionTypes,
  setupSteps,
  teamComparison,
  teamLeaderboards,
  teamTrends,
} from "@/lib/dashboard-data";
import { formatIndianNumber, formatRupees } from "@/lib/format";
import {
  gini,
  negativeReport,
  recognitionPoints,
  retentionSignals,
  shiftCoverage,
  topTenShare,
} from "@/lib/phase3-data";
import { cn } from "@/lib/utils";
import { useAppStore, useCopilotEnabled } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
};

function TrendChart({
  data,
  dataKey,
  label,
  unit = "",
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  label: string;
  unit?: string;
}) {
  return (
    <figure aria-label={label}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} unit={unit} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey={dataKey}
            name={label}
            stroke="var(--primary)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <figcaption className="sr-only">{label} by month, May to October 2026.</figcaption>
    </figure>
  );
}

function AskBox() {
  const enabled = useCopilotEnabled();
  const openCopilot = useAppStore((s) => s.openCopilot);
  const [question, setQuestion] = useState("");
  if (!enabled) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        AI answers are unavailable right now. Every figure below is still up to date — use{" "}
        <a href="/analytics" className="text-primary underline">
          Analytics
        </a>{" "}
        for detailed questions.
      </div>
    );
  }
  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        if (question.trim()) openCopilot(question);
        setQuestion("");
      }}
    >
      <div className="flex flex-1 items-center gap-2">
        <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything, e.g. “Which department had the lowest recognition last month?”"
          aria-label="Ask AI about your programme"
          className="bg-background"
        />
      </div>
      <Button type="submit" variant="outline">
        Ask AI
      </Button>
    </form>
  );
}

function SectionCard({
  title,
  description,
  href,
  linkLabel,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  icon?: typeof Users;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0 rounded-lg", className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            {Icon && <Icon className="size-4 text-primary" aria-hidden />}
            {title}
          </CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        {href && (
          <Button variant="ghost" size="sm" asChild>
            <a href={href}>
              {linkLabel ?? "Open"} <ArrowRight />
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** D-02 on the dashboard: one-tap decisions on the most urgent items. */
function PendingDecisions({ items, limit = 3 }: { items: Approval[]; limit?: number }) {
  const { decide, undoDecision } = useDemoStore();
  const approve = (a: Approval) => {
    const queued = isBudgetExhausted(a);
    decide(a.id, { kind: queued ? "queued" : "approve", at: Date.now() });
    const undo = { label: "Undo", onClick: () => undoDecision(a.id) };
    if (queued) toast.warning("Budget exhausted. This approval will be queued.", { action: undo });
    else toast.success("Approved. Reward will be processed.", { action: undo });
  };
  if (items.length === 0)
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No pending approvals. You're all caught up! 🎉
      </p>
    );
  return (
    <ul className="space-y-2">
      {[...items]
        .sort((a, b) => a.slaHours - a.hoursAgo - (b.slaHours - b.hoursAgo))
        .slice(0, limit)
        .map((a) => {
          const left = a.slaHours - a.hoursAgo;
          return (
            <li
              key={a.id}
              className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {a.employee} ·{" "}
                  <span className="text-reward">{formatIndianNumber(a.points)} pts</span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.workflow} · {a.metrics[0]?.label}: {a.metrics[0]?.value}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    left < 0
                      ? "text-destructive"
                      : left < 6
                        ? "text-warning"
                        : "text-muted-foreground",
                  )}
                >
                  {left < 0 ? `SLA passed ${-left}h ago` : `${left}h left on SLA`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approve(a)}>
                  <Check /> Approve
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/approvals?id=${a.id}`}>Review</a>
                </Button>
              </div>
            </li>
          );
        })}
    </ul>
  );
}

function EmptyOrgDashboard({ name }: { name: string }) {
  const aiOn = useCopilotEnabled();
  const openCopilot = useAppStore((s) => s.openCopilot);
  const setEmptyOrg = useDemoStore((s) => s.setEmptyOrg);
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Radha Krishna Mills"
        title={`Welcome, ${name}`}
        description="Your organisation is set up. Here is what to do next."
      />
      <Card className="rounded-lg border-dashed">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Workflow className="size-7" />
          </div>
          <div>
            <p className="text-lg font-semibold">No workflows yet.</p>
            <p className="text-sm text-muted-foreground">
              Create your first workflow or let AI help.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <a href="/workflows/new">Create a workflow</a>
            </Button>
            {aiOn && (
              <Button
                variant="outline"
                onClick={() => openCopilot("Help me set up my first workflow")}
              >
                <Sparkles /> Let AI help you set up
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <SectionCard
        title="Guided next steps"
        description="About 30 minutes to your first recognition."
      >
        <ol className="space-y-2">
          {setupSteps.map((step, i) => (
            <li key={step.id}>
              <a
                href={step.href}
                className="flex min-h-11 items-center gap-3 rounded-md border border-border p-3 text-sm hover:bg-muted"
              >
                {step.done ? (
                  <Check className="size-5 text-success" aria-label="Done" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" aria-label="To do" />
                )}
                <span className={cn("flex-1", step.done && "text-muted-foreground line-through")}>
                  {i + 1}. {step.label}
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ol>
      </SectionCard>
      <p className="text-center text-xs text-muted-foreground">
        Demo:{" "}
        <button type="button" className="underline" onClick={() => setEmptyOrg(false)}>
          load sample data for Radha Krishna Mills
        </button>
      </p>
    </div>
  );
}

export function OwnerDashboard() {
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  const pending = usePendingApprovals("owner");
  if (emptyOrg) return <EmptyOrgDashboard name="Ramesh" />;
  const g = gini(recognitionPoints);
  const top = topTenShare(recognitionPoints);
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Radha Krishna Mills · October 2026"
        title="Good morning, Ramesh"
        description="How recognition is going across your company this month."
        action={
          <Button asChild>
            <a href="/approvals">
              <CheckSquare /> Review {pending.length} decisions
            </a>
          </Button>
        }
      />
      <AskBox />
      <section aria-label="Pulse" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="People recognised"
          value={`${orgPulse.recognisedPct}%`}
          detail={`${orgPulse.recognisedCount} of ${orgPulse.activeEmployees} active employees this month`}
          icon={Users}
        />
        <StatCard
          label="Rewards given"
          value={formatRupees(orgPulse.rupeesThisMonth)}
          detail={`${formatIndianNumber(orgPulse.pointsThisMonth)} points so far in October`}
          icon={Coins}
          reward
        />
        <StatCard
          label="Budget left"
          value={formatRupees(orgPulse.budgetLeft)}
          detail={`Of ${formatRupees(orgPulse.budgetYear)} for FY 2026-27 (Apr–Mar)`}
          icon={WalletCards}
        />
        <StatCard
          label="Pending decisions"
          value={String(pending.length)}
          detail={`${pending.filter((a) => a.slaHours - a.hoursAgo < 6).length} close to or past their SLA`}
          icon={CheckSquare}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard
          className="lg:col-span-3"
          title="Pending decisions"
          description="Most urgent first. Open the queue to see full evidence."
          href="/approvals"
          linkLabel="All decisions"
          icon={CheckSquare}
        >
          <PendingDecisions items={pending} />
        </SectionCard>
        <SectionCard className="lg:col-span-2" title="Needs attention" icon={AlertTriangle}>
          <ul className="space-y-2">
            <AttentionRow
              tone="error"
              text="Sales target achievers failed on 07/10/2026"
              href="/workflows/wf-sales/runs"
              action="See why"
            />
            <AttentionRow
              tone="warning"
              text="Manufacturing B pool is used up — 1 approval queued"
              href="/budget"
              action="Top up"
            />
            <AttentionRow
              tone="warning"
              text="1 approval crosses the ₹ 15,000 yearly gift limit"
              href="/approvals?id=ap-2"
              action="Review"
            />
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Team comparison"
        description="This month, by department. Coverage = share of people recognised."
        href="/analytics"
        linkLabel="Analytics"
        icon={BarChart3}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <figure aria-label="Coverage by department">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={teamComparison} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="department" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="coverage"
                  name="Coverage %"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <figcaption className="sr-only">
              Coverage: {teamComparison.map((t) => `${t.department} ${t.coverage}%`).join(", ")}.
            </figcaption>
          </figure>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Department</th>
                  <th className="py-2 text-right font-medium">Recognised</th>
                  <th className="py-2 text-right font-medium">Spend</th>
                  <th className="py-2 text-right font-medium">Per person</th>
                </tr>
              </thead>
              <tbody>
                {teamComparison.map((t) => (
                  <tr key={t.department} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium">{t.department}</td>
                    <td className="py-2.5 text-right">
                      {t.recognised}/{t.people}{" "}
                      <span
                        className={cn(
                          "text-xs",
                          t.coverage < 55 ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        ({t.coverage}%)
                      </span>
                    </td>
                    <td className="py-2.5 text-right">{formatRupees(t.spend)}</td>
                    <td className="py-2.5 text-right">{formatRupees(t.perPerson)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Fairness"
          description="Last 90 days"
          href="/fairness"
          linkLabel="Fairness panel"
          icon={Scale}
        >
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-muted p-3">
              <dt className="text-xs text-muted-foreground">Gini coefficient</dt>
              <dd className="text-xl font-bold">{g.toFixed(2)}</dd>
            </div>
            <div className="rounded-md bg-muted p-3">
              <dt className="text-xs text-muted-foreground">Top 10% share</dt>
              <dd className="text-xl font-bold">{Math.round(top * 100)}%</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Coverage by shift</p>
          <ul className="mt-2 space-y-2">
            {shiftCoverage.map((s) => (
              <li key={s.group}>
                <div className="flex justify-between text-xs">
                  <span>{s.group}</span>
                  <span
                    className={
                      s.coverage < 50 ? "font-semibold text-destructive" : "text-muted-foreground"
                    }
                  >
                    {s.coverage}%
                  </span>
                </div>
                <Progress
                  value={s.coverage}
                  aria-label={`${s.group} coverage ${s.coverage}%`}
                  className="h-1.5"
                />
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard
          title="Negative report"
          description="Gaps to close"
          href="/fairness?tab=negative"
          linkLabel="Full report"
          icon={TrendingDown}
        >
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between gap-2">
              <span>People with zero recognition (60+ days)</span>
              <span className="font-semibold">{negativeReport.zeroRecognition.length}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Teams without any workflow</span>
              <span className="font-semibold">
                {negativeReport.noWorkflowTeams.map((t) => t.team).join(", ")}
              </span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Boards with no winner</span>
              <span className="font-semibold">
                {negativeReport.noWinnerBoards.map((b) => b.board).join(", ")}
              </span>
            </li>
          </ul>
        </SectionCard>
        <SectionCard
          title="Retention signals"
          description="Recognition frequency vs exits"
          icon={HeartHandshake}
        >
          <ul className="space-y-3 text-sm">
            {retentionSignals.map((r) => (
              <li key={r.team} className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <p className="font-medium">
                  {r.team} · {r.people} people
                </p>
                <p className="text-xs text-muted-foreground">{r.signal}</p>
              </li>
            ))}
            <li className="text-xs text-muted-foreground">
              Teams recognised less than once a month had 2.3× more exits in the last 6 months.
            </li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Recognitions per month" icon={BarChart3}>
        <TrendChart data={monthlyTrend} dataKey="recognitions" label="Recognitions" />
      </SectionCard>
    </div>
  );
}

function AttentionRow({
  tone,
  text,
  href,
  action,
}: {
  tone: "error" | "warning";
  text: string;
  href: string;
  action: string;
}) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
      <span className="flex items-start gap-2 text-sm">
        <AlertTriangle
          aria-label={tone === "error" ? "Error" : "Warning"}
          className={cn(
            "mt-0.5 size-4 shrink-0",
            tone === "error" ? "text-destructive" : "text-warning",
          )}
        />
        {text}
      </span>
      <Button variant="outline" size="sm" asChild>
        <a href={href}>{action}</a>
      </Button>
    </li>
  );
}

const hrTools = [
  {
    id: "H-02",
    label: "Programme manager",
    detail: "3 live · 1 paused · 1 draft",
    href: "/workflows",
    icon: Workflow,
  },
  {
    id: "H-03",
    label: "Data health",
    detail: "1 failed · 7 unmatched · 1 drift",
    href: "/connectors",
    icon: Database,
  },
  {
    id: "H-04",
    label: "Budget & wallets",
    detail: "1 pool used up",
    href: "/budget",
    icon: WalletCards,
  },
  {
    id: "H-05",
    label: "Compliance centre",
    detail: "1 tax alert · 2 consents missing",
    href: "/compliance",
    icon: ShieldCheck,
  },
  {
    id: "H-06",
    label: "Campaigns",
    detail: "Diwali starts 01/11",
    href: "/campaigns",
    icon: CalendarHeart,
  },
  {
    id: "H-07",
    label: "Anti-gaming alerts",
    detail: "2 open alerts",
    href: "/fairness?tab=gaming",
    icon: ShieldAlert,
  },
];

export function HrDashboard() {
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  const workflowStatus = useDemoStore((s) => s.workflowStatus);
  if (emptyOrg) return <EmptyOrgDashboard name="Lakshmi" />;
  const paused = Object.values(workflowStatus).filter((s) => s === "paused").length;
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="HR overview"
        title="Programme health"
        description="Programmes, data health and compliance in one place."
        action={
          <Button asChild>
            <a href="/workflows">Programme manager</a>
          </Button>
        }
      />
      <section aria-label="Pulse" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Programme reach"
          value="71%"
          detail="Employees recognised in the last 30 days"
          icon={HeartHandshake}
        />
        <StatCard
          label="Redemption rate"
          value="64%"
          detail="Points turned into rewards this quarter"
          icon={Gift}
          reward
        />
        <StatCard
          label="Data sources healthy"
          value="3 of 5"
          detail="Zoho CRM sign-in expired · sales file drift"
          icon={Database}
        />
        <StatCard
          label="Compliance alerts"
          value="3"
          detail="1 tax limit · 2 consent records missing"
          icon={ShieldCheck}
        />
      </section>
      <section aria-label="HR toolkit" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {hrTools.map((t) => (
          <a
            key={t.id}
            href={t.href}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
              <t.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{t.label}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {t.id === "H-02" && paused ? `${paused} paused by you · ` : ""}
                {t.detail}
              </span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </a>
        ))}
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Programme health"
          description="Recognitions per month across all workflows"
        >
          <TrendChart data={monthlyTrend} dataKey="recognitions" label="Recognitions" />
        </SectionCard>
        <SectionCard title="Data health" href="/connectors" linkLabel="Monitor">
          <ul className="space-y-3 text-sm">
            {[
              ["Attendance register (Sheets)", "success", "Synced today 06:00"],
              ["Production ERP webhook", "success", "Synced today 11:00"],
              ["Monthly sales file", "warning", "Schema drift: “Target” missing"],
              ["Zoho CRM", "error", "Sign-in expired 05/10/2026"],
              ["Unmatched people", "warning", "7 records need a person to confirm"],
            ].map(([name, tone, detail]) => (
              <li key={name} className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
                <StatusBadge tone={tone as "success" | "warning" | "error"}>
                  {tone === "success" ? "Healthy" : tone === "error" ? "Failed" : "Check"}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
      <SectionCard
        title="Compliance alerts"
        href="/compliance"
        linkLabel="Compliance centre"
        icon={ShieldCheck}
      >
        <ul className="space-y-2">
          <AttentionRow
            tone="warning"
            text="Pooja Kumar would cross the ₹ 15,000 yearly gift limit if approved"
            href="/approvals?id=ap-2"
            action="Review"
          />
          <AttentionRow
            tone="warning"
            text="2 employees have not acknowledged privacy notice v3"
            href="/compliance?tab=consent"
            action="Send reminder"
          />
          <AttentionRow
            tone="error"
            text="1 workflow run failed this week"
            href="/workflows/wf-sales/runs"
            action="Open run"
          />
        </ul>
      </SectionCard>
    </div>
  );
}

export function ManagerDashboard({ viewer = "manager" }: { viewer?: string }) {
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  const pending = usePendingApprovals("manager");
  const team = managerTeam.members;
  const [wallet, setWallet] = useState(managerTeam.wallet.balance);
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [type, setType] = useState(recognitionTypes[0] ?? "");
  const [note, setNote] = useState("");
  const [points, setPoints] = useState("200");
  const [boardId, setBoardId] = useState(teamLeaderboards[0]?.id ?? "");
  const [trend, setTrend] = useState<"salesPct" | "deals" | "recognitions">("salesPct");
  const board = teamLeaderboards.find((b) => b.id === boardId) ?? teamLeaderboards[0]!;
  const ranked = [...team].sort((a, b) => board.value(b) - board.value(a));
  const missed = [...team]
    .filter((m) => m.daysSince >= 30)
    .sort((a, b) => b.daysSince - a.daysSince);
  const amount = Number(points) || 0;
  const recognisedCount = team.filter((m) => m.daysSince < 30).length;

  const startRecognise = (name = "") => {
    setRecipient(name);
    setNote("");
    setPoints("200");
    setOpen(true);
  };

  if (emptyOrg)
    return (
      <div className="space-y-6">
        <PageHeading
          eyebrow="Sales A"
          title="Your team"
          description="Recognise good work and see who has been missed."
        />
        <Card className="rounded-lg border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Not enough data yet. Your team will appear here once HR imports employees and activates
            a workflow.
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow={
          viewer === "manager"
            ? `${managerTeam.name} · ${team.length} people`
            : `Team view · ${managerTeam.name} (${managerTeam.manager})`
        }
        title={viewer === "manager" ? "Your team" : `${managerTeam.name} team`}
        description="Recognise good work, clear your approvals and see who has been missed."
        action={
          <Button onClick={() => startRecognise()}>
            <Send /> Recognise now
          </Button>
        }
      />
      <section aria-label="Team pulse" className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-lg shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My wallet</p>
                <p className="mt-2 text-2xl font-bold">{formatIndianNumber(wallet)} pts</p>
              </div>
              <span className="grid size-9 place-items-center rounded-md bg-reward/10 text-reward">
                <WalletCards className="size-5" aria-hidden />
              </span>
            </div>
            <Progress
              value={((managerTeam.wallet.cap - wallet) / managerTeam.wallet.cap) * 100}
              aria-label="Monthly cap used"
            />
            <p className="text-xs text-muted-foreground">
              {formatIndianNumber(managerTeam.wallet.cap - wallet)} of{" "}
              {formatIndianNumber(managerTeam.wallet.cap)} monthly cap used · refills{" "}
              {managerTeam.wallet.refill}
            </p>
          </CardContent>
        </Card>
        <StatCard
          label="Team recognised"
          value={`${recognisedCount} of ${team.length}`}
          detail="In the last 30 days"
          icon={Users}
        />
        <StatCard
          label="My approvals"
          value={String(pending.length)}
          detail="From your team, oldest first"
          icon={CheckSquare}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="My approvals"
          description="Assigned to you, with SLA timers"
          href="/approvals"
          linkLabel="Open queue"
          icon={CheckSquare}
        >
          <PendingDecisions items={pending} />
        </SectionCard>
        <Card className="rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <LockKeyhole className="size-4 text-private" aria-hidden /> Who haven't I recognised?
            </CardTitle>
            <CardDescription className="text-private">Only you can see this list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {missed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Everyone in your team was recognised in the last 30 days. 🎉
              </p>
            ) : (
              missed.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-private-surface p-3 text-sm"
                >
                  <span>
                    <span className="font-medium">{m.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      Last recognised {m.lastRecognised}
                    </span>
                  </span>
                  <Button size="sm" variant="outline" onClick={() => startRecognise(m.name)}>
                    Recognise
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader className="gap-3 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">Team leaderboard</CardTitle>
              <Select value={boardId} onValueChange={setBoardId}>
                <SelectTrigger className="h-9 w-56" aria-label="Choose workflow leaderboard">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamLeaderboards.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" aria-hidden /> Visibility: {board.visibility}
            </p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5">
              {ranked.map((m, index) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full text-xs font-bold",
                        index < 3 ? "bg-reward/15 text-reward" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                    {m.name}
                  </span>
                  <span className="font-semibold">
                    {formatIndianNumber(board.value(m))}
                    {board.unit}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">Team metric trends</CardTitle>
              <Select value={trend} onValueChange={(v) => setTrend(v as typeof trend)}>
                <SelectTrigger className="h-9 w-48" aria-label="Choose metric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salesPct">Sales vs target</SelectItem>
                  <SelectItem value="deals">Deals closed</SelectItem>
                  <SelectItem value="recognitions">Recognitions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Source: Zoho CRM via the metrics layer · October is month-to-date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={teamTrends}
              dataKey={trend}
              label={
                {
                  salesPct: "Sales vs target",
                  deals: "Deals closed",
                  recognitions: "Recognitions",
                }[trend]
              }
              unit={trend === "salesPct" ? "%" : ""}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recognise someone</DialogTitle>
            <DialogDescription>
              Points come from your wallet ({formatIndianNumber(wallet)} pts left). They get an
              in-app and WhatsApp message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Team member</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger aria-label="Team member">
                  <SelectValue placeholder="Choose a team member" />
                </SelectTrigger>
                <SelectContent>
                  {team.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name} · last recognised {m.lastRecognised}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Recognition type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger aria-label="Recognition type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recognitionTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rec-points">Points</Label>
                <Input
                  id="rec-points"
                  inputMode="numeric"
                  value={points}
                  onChange={(e) => setPoints(e.target.value.replace(/\D/g, ""))}
                  aria-invalid={amount > wallet}
                  aria-describedby="rec-points-help"
                />
                <p
                  id="rec-points-help"
                  className={cn(
                    "text-xs",
                    amount > wallet ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {amount > wallet
                    ? `Insufficient budget. Remaining: ${formatIndianNumber(wallet)}. Required: ${formatIndianNumber(amount)}.`
                    : "Within your wallet balance."}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rec-note">What did they do well?</Label>
              <Textarea
                id="rec-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Closed the Salem distributor deal ahead of schedule"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!recipient || !note.trim() || amount <= 0 || amount > wallet}
              onClick={() => {
                const previous = wallet;
                setWallet(wallet - amount);
                toast.success(`Sent ${formatIndianNumber(amount)} points to ${recipient}`, {
                  action: { label: "Undo", onClick: () => setWallet(previous) },
                });
                setOpen(false);
              }}
            >
              Send recognition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
