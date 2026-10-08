import {
  AlertTriangle,
  CheckSquare,
  Coins,
  Database,
  Gift,
  HeartHandshake,
  LockKeyhole,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
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
import { Textarea } from "@/components/ui/textarea";
import {
  approvals,
  departmentCoverage,
  monthlyTrend,
  teamMembers,
  workflows,
} from "@/lib/admin-data";
import { formatIndianNumber, formatRupees } from "@/lib/format";
import { useAppStore } from "@/store/app-store";

function TrendChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={monthlyTrend} margin={{ left: -16, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        />
        <Line
          type="monotone"
          dataKey="recognitions"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CoverageChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={departmentCoverage} margin={{ left: -16, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="department" stroke="var(--muted-foreground)" fontSize={11} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="%" />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        />
        <Bar dataKey="coverage" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AskBox() {
  const { openCopilot, aiAvailable } = useAppStore();
  const [question, setQuestion] = useState("");
  if (!aiAvailable) {
    return (
      <Card className="rounded-lg border-dashed">
        <CardContent className="p-4 text-sm text-muted-foreground">
          AI answers are unavailable right now. All figures below are still up to date.
        </CardContent>
      </Card>
    );
  }
  return (
    <form
      className="flex gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (question.trim()) openCopilot(question);
        setQuestion("");
      }}
    >
      <Sparkles className="mt-2.5 size-5 shrink-0 text-primary" />
      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask anything, e.g. “Which department had the lowest recognition last month?”"
        aria-label="Ask AI about your programme"
        className="bg-background"
      />
      <Button type="submit" variant="outline">
        Ask
      </Button>
    </form>
  );
}

export function OwnerDashboard() {
  const pending = approvals.length;
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Radha Krishna Mills"
        title="Good morning, Ramesh"
        description="Here is how recognition is going across your company this month."
        action={
          <Button asChild>
            <a href="/approvals">
              <CheckSquare /> Review {pending} approvals
            </a>
          </Button>
        }
      />
      <AskBox />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="People recognised"
          value="71%"
          detail="141 of 199 active employees this month"
          icon={Users}
        />
        <StatCard
          label="Points given"
          value={formatIndianNumber(34600)}
          detail={`${formatRupees(34600)} spent so far in October`}
          icon={Coins}
          reward
        />
        <StatCard
          label="Budget left"
          value={formatRupees(118400)}
          detail="Of ₹2,00,000 for this quarter"
          icon={WalletCards}
        />
        <StatCard
          label="Waiting for you"
          value={String(pending)}
          detail="Approvals older than 2 days: 2"
          icon={CheckSquare}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-base">Recognitions per month</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-base">Coverage by department</CardTitle>
          </CardHeader>
          <CardContent>
            <CoverageChart />
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-base">Needs attention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AttentionRow
            tone="error"
            text="Sales target achievers failed on 07/10/2026"
            href="/workflows/wf-sales/runs"
            action="See why"
          />
          <AttentionRow
            tone="warning"
            text="Manufacturing B budget pool is used up — 1 approval is queued"
            href="/approvals"
            action="Open approvals"
          />
          <AttentionRow
            tone="warning"
            text="1 approval crosses the ₹15,000 yearly gift limit"
            href="/approvals"
            action="Review"
          />
        </CardContent>
      </Card>
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
    <div className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle
          className={tone === "error" ? "size-4 text-destructive" : "size-4 text-warning"}
        />
        {text}
      </div>
      <Button variant="outline" size="sm" asChild>
        <a href={href}>{action}</a>
      </Button>
    </div>
  );
}

export function HrDashboard() {
  const failed = workflows.filter((w) => w.lastRunResult === "failed").length;
  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Programme health"
        title="HR overview"
        description="Programme health, data health and compliance in one place."
        action={
          <Button asChild>
            <a href="/workflows">Manage workflows</a>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          value="4 of 5"
          detail="Zoho CRM last synced 2 days ago"
          icon={Database}
        />
        <StatCard
          label="Compliance alerts"
          value="3"
          detail="1 tax limit · 2 consent records missing"
          icon={ShieldCheck}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Programme health</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-base">Data health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ["Attendance (biometric CSV)", "success", "Synced today 06:00"],
              ["Payroll (Excel)", "success", "Synced 01/10/2026"],
              ["Google Sheets – Quality", "success", "Synced today 09:15"],
              ["Zoho CRM – Sales", "warning", "Last sync 06/10/2026"],
              ["Unmatched people", "warning", "7 records need a person to confirm"],
            ].map(([name, tone, detail]) => (
              <div key={name} className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
                <StatusBadge tone={tone as "success" | "warning"}>
                  {tone === "success" ? "Healthy" : "Check"}
                </StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-base">Compliance alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AttentionRow
            tone="warning"
            text="Priya Kumar would cross the ₹15,000 yearly gift limit if approved"
            href="/approvals"
            action="Review"
          />
          <AttentionRow
            tone="warning"
            text="2 employees have not accepted the privacy notice"
            href="/dashboard/hr"
            action="Send reminder"
          />
          {failed > 0 && (
            <AttentionRow
              tone="error"
              text={`${failed} workflow run failed this week`}
              href="/workflows"
              action="Open workflows"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ManagerDashboard() {
  const [recipient, setRecipient] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [points, setPoints] = useState("200");
  const [wallet, setWallet] = useState(4200);
  const ranked = [...teamMembers]
    .filter((m) => m.monthPoints > 0)
    .sort((a, b) => b.monthPoints - a.monthPoints);
  const unrecognised = teamMembers.filter((m) => m.monthPoints === 0);
  const amount = Number(points) || 0;

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Sales A · 8 people"
        title="Your team"
        description="Recognise good work and see who has been missed."
        action={
          <Button onClick={() => setRecipient(teamMembers[0]?.name ?? "")}>
            <Send /> Recognise now
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="My wallet"
          value={`${formatIndianNumber(wallet)} pts`}
          detail="Refills on 01/11/2026"
          icon={WalletCards}
          reward
        />
        <StatCard
          label="Team recognised"
          value={`${ranked.length} of ${teamMembers.length}`}
          detail="In the last 30 days"
          icon={Users}
        />
        <StatCard
          label="Waiting for you"
          value="3"
          detail="Approvals from your team"
          icon={CheckSquare}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="text-base">Team leaderboard · October</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {ranked.map((member, index) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-full bg-reward/10 text-xs font-bold text-reward">
                      {index + 1}
                    </span>
                    {member.name}
                  </span>
                  <span className="font-semibold text-reward">
                    {formatIndianNumber(member.monthPoints)} pts
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LockKeyhole className="size-4 text-private" /> Not recognised recently
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-private">Only you can see this list.</p>
              {unrecognised.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-md bg-private-surface p-3 text-sm text-private"
                >
                  <span>
                    {member.name} · {member.lastRecognised}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setRecipient(member.name)}>
                    Recognise
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-base">Team sales trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={recipient !== null} onOpenChange={(open) => !open && setRecipient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recognise {recipient}</DialogTitle>
            <DialogDescription>
              Points come from your wallet. {recipient} will get an app and WhatsApp message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rec-points">Points</Label>
              <Input
                id="rec-points"
                inputMode="numeric"
                value={points}
                onChange={(e) => setPoints(e.target.value.replace(/\D/g, ""))}
              />
              {amount > wallet && (
                <p className="text-xs text-destructive">
                  You have only {formatIndianNumber(wallet)} points left.
                </p>
              )}
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
            <Button variant="outline" onClick={() => setRecipient(null)}>
              Cancel
            </Button>
            <Button
              disabled={!note.trim() || amount <= 0 || amount > wallet}
              onClick={() => {
                const previous = wallet;
                setWallet(wallet - amount);
                toast.success(`Sent ${amount} points to ${recipient}`, {
                  action: { label: "Undo", onClick: () => setWallet(previous) },
                });
                setRecipient(null);
                setNote("");
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
