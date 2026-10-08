import { Eye, LockKeyhole, ShieldAlert, Users } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { managerTeam } from "@/lib/dashboard-data";
import {
  departmentCoverage,
  gamingAlerts as initialAlerts,
  GENDER_CONSENTED,
  genderCoverage,
  gini,
  locationCoverage,
  lorenzCurve,
  managerSpread,
  MIN_GROUP_SIZE,
  negativeReport,
  pointsHistogram,
  privateFollowUps,
  recognitionPoints,
  retentionByTeam,
  retentionSignals,
  shiftCoverage,
  tenureCoverage,
  topTenShare,
  type GamingAlert,
} from "@/lib/phase3-data";

type Row = { group: string; coverage: number; people: number };

function CoverageList({ rows }: { rows: Row[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.group}>
          <div className="mb-1 flex justify-between gap-2 text-sm">
            <span>{row.group}</span>
            <span className="text-muted-foreground">
              {row.people < MIN_GROUP_SIZE
                ? `Hidden — fewer than ${MIN_GROUP_SIZE} people`
                : `${row.coverage}% of ${row.people}`}
            </span>
          </div>
          <Progress
            value={row.people < MIN_GROUP_SIZE ? 0 : row.coverage}
            aria-label={`${row.group} coverage`}
          />
        </li>
      ))}
    </ul>
  );
}

function DistributionCharts({ values, title }: { values: number[]; title: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}: points per person</CardTitle>
        </CardHeader>
        <CardContent className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pointsHistogram(values)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="bucket" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar
                dataKey="people"
                name="People"
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Concentration (Lorenz curve)</CardTitle>
          <p className="text-sm text-muted-foreground">
            The further the curve sags below the straight line, the more points sit with a few
            people.
          </p>
        </CardHeader>
        <CardContent className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={lorenzCurve(values)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="people"
                unit="%"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis unit="%" stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                dataKey="even"
                name="Perfectly even"
                stroke="var(--color-muted-foreground)"
                strokeDasharray="4 4"
                dot={false}
              />
              <Line dataKey="points" name="Share of points" stroke="var(--color-primary)" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * D-03 fairness panel, AN-05 concentration, AN-06 manager spread, AN-07 equity cuts, AN-08 negative
 * report, D-05 retention signals and H-07 anti-gaming alerts. Managers see their own team only.
 */
export function FairnessPage({
  canSeePrivate,
  tab,
  team,
}: {
  canSeePrivate: boolean;
  tab?: string | undefined;
  /** Manager view: restrict to this team. */
  team?: string | undefined;
}) {
  const [alerts, setAlerts] = useState<GamingAlert[]>(initialAlerts);
  const [showGender, setShowGender] = useState(false);
  const teamValues = managerTeam.members.map((m) => m.monthPoints);
  const values = team ? teamValues : recognitionPoints;
  const g = gini(values);
  const top = topTenShare(values);
  const ownSpread = managerSpread.find((m) => m.teamName === team);

  const resolve = (id: string, status: GamingAlert["status"]) => {
    const previous = alerts;
    setAlerts((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success(status === "held" ? "Rewards on hold until you review" : "Alert cleared", {
      action: { label: "Undo", onClick: () => setAlerts(previous) },
    });
  };

  const defaultTab = tab ?? (team ? "distribution" : "equity");

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Analytics & Fairness"
        title={team ? `Fairness · ${team}` : "Fairness & coverage"}
        description="See who is being recognised, who is being missed, and anything that looks unusual."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Gini (spread score)"
          value={g.toFixed(2)}
          detail="0 is perfectly even. Below 0.40 is healthy."
          icon={Users}
        />
        <StatCard
          label="Top 10% share"
          value={`${Math.round(top * 100)}%`}
          detail="Share of points held by the top tenth"
          icon={Eye}
        />
        {team && ownSpread ? (
          <StatCard
            label="Your spread"
            value={`${ownSpread.distinct} of ${ownSpread.team}`}
            detail="Different people you recognised in 90 days"
            icon={ShieldAlert}
          />
        ) : (
          <StatCard
            label="Open anti-gaming alerts"
            value={String(alerts.filter((a) => a.status === "open").length)}
            detail="Unusual patterns waiting for a person to check"
            icon={ShieldAlert}
          />
        )}
      </div>

      <Tabs key={defaultTab} defaultValue={defaultTab}>
        <TabsList className="flex h-auto flex-wrap justify-start">
          {!team && <TabsTrigger value="equity">Equity cuts</TabsTrigger>}
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          {!team && <TabsTrigger value="spread">Manager spread</TabsTrigger>}
          <TabsTrigger value="negative">Who is missed</TabsTrigger>
          {!team && <TabsTrigger value="retention">Retention signals</TabsTrigger>}
          {!team && <TabsTrigger value="gaming">Anti-gaming alerts</TabsTrigger>}
          {canSeePrivate && <TabsTrigger value="private">Private follow-ups</TabsTrigger>}
        </TabsList>

        {!team && (
          <TabsContent value="equity" className="mt-6 grid gap-4 lg:grid-cols-2">
            {(
              [
                ["By department", departmentCoverage],
                ["By location", locationCoverage],
                ["By shift", shiftCoverage],
                ["By tenure", tenureCoverage],
              ] as const
            ).map(([title, rows]) => (
              <Card key={title}>
                <CardHeader>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Recognised at least once in the last 90 days
                  </p>
                </CardHeader>
                <CardContent>
                  <CoverageList rows={rows} />
                </CardContent>
              </Card>
            ))}
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LockKeyhole className="size-4 text-private" /> By gender
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Uses only the {GENDER_CONSENTED} employees who consented to gender-based
                    analysis. Groups under {MIN_GROUP_SIZE} people are hidden.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowGender((v) => !v)}>
                  {showGender ? "Hide gender cut" : "Show gender cut"}
                </Button>
              </CardHeader>
              {showGender && (
                <CardContent>
                  <CoverageList rows={genderCoverage} />
                </CardContent>
              )}
            </Card>
          </TabsContent>
        )}

        <TabsContent value="distribution" className="mt-6">
          <DistributionCharts values={values} title={team ? team : "Whole company"} />
        </TabsContent>

        {!team && (
          <TabsContent value="spread" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How widely each manager recognises</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Different people recognised in 90 days ÷ team size.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {managerSpread.map((m) => {
                  const pct = Math.round((m.distinct / m.team) * 100);
                  return (
                    <div key={m.manager}>
                      <div className="mb-1 flex flex-wrap justify-between gap-2 text-sm">
                        <span className="font-medium">
                          {m.manager}{" "}
                          <span className="font-normal text-muted-foreground">· {m.teamName}</span>
                        </span>
                        <span className="text-muted-foreground">
                          {m.distinct} of {m.team} people · {pct}%{pct < 50 && " · low"}
                        </span>
                      </div>
                      <Progress value={pct} aria-label={`${m.manager} spread`} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="negative" className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                {team ? "Not recognised in 30+ days" : "No recognition in 60+ days"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {(team
                  ? managerTeam.members
                      .filter((m) => m.daysSince >= 30)
                      .map((m) => ({ name: m.name, team: team, days: m.daysSince }))
                  : negativeReport.zeroRecognition
                ).map((p) => (
                  <li key={p.name} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-muted-foreground">{p.team}</p>
                    </div>
                    <span className="text-muted-foreground">{p.days} days</span>
                  </li>
                ))}
              </ul>
              {team ? (
                <Button className="mt-4" asChild>
                  <a href="/dashboard/manager">Recognise someone now</a>
                </Button>
              ) : (
                <Button
                  className="mt-4"
                  onClick={() => toast.success("Nudge sent to their managers")}
                >
                  Nudge their managers
                </Button>
              )}
            </CardContent>
          </Card>
          {!team && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Teams with no workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {negativeReport.noWorkflowTeams.map((t) => (
                    <p key={t.team}>
                      {t.team} <span className="text-muted-foreground">· {t.people} people</span>
                    </p>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Boards with no winner</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {negativeReport.noWinnerBoards.map((b) => (
                    <p key={b.board}>
                      {b.board} <span className="text-muted-foreground">· {b.periods} periods</span>
                    </p>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {!team && (
          <TabsContent value="retention" className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Recognition frequency vs exits</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Last 6 months, per team. Teams that are rarely recognised lose more people.
                </p>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={retentionByTeam}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="team" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      allowDecimals={false}
                      stroke="var(--color-muted-foreground)"
                      fontSize={12}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="recognitions"
                      name="Recognitions per person"
                      fill="var(--color-chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      dataKey="exits"
                      name="Exits"
                      stroke="var(--color-destructive)"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Teams to check in with</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {retentionSignals.map((r) => (
                  <div key={r.team}>
                    <p className="font-medium">{r.team}</p>
                    <p className="text-muted-foreground">{r.signal}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {!team && (
          <TabsContent value="gaming" className="mt-6 space-y-3">
            {alerts.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{a.kind}</p>
                      <StatusBadge
                        tone={
                          a.status === "open"
                            ? "warning"
                            : a.status === "held"
                              ? "neutral"
                              : "success"
                        }
                      >
                        {a.status === "open"
                          ? "Needs review"
                          : a.status === "held"
                            ? "On hold"
                            : "Cleared"}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm">{a.detail}</p>
                    <p className="text-xs text-muted-foreground">Evidence: {a.evidence}</p>
                  </div>
                  {a.status === "open" && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => resolve(a.id, "cleared")}>
                        Looks fine
                      </Button>
                      <Button onClick={() => resolve(a.id, "held")}>Hold rewards</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            <p className="text-xs text-muted-foreground">
              Nothing is blocked automatically except self-approval. A person decides every hold.
            </p>
          </TabsContent>
        )}

        {canSeePrivate && (
          <TabsContent value="private" className="mt-6">
            <Card className="border-private/30 bg-private-surface">
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <LockKeyhole className="size-4 text-private" />
                <CardTitle className="text-base text-private">Only you can see this</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {privateFollowUps.map((p) => (
                    <li key={p.name} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-muted-foreground">
                          {p.metric} · {p.periods} period{p.periods > 1 ? "s" : ""} below target
                        </p>
                      </div>
                      <StatusBadge tone="private">{p.value}</StatusBadge>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Facts from your boards only. Have a supportive one-to-one conversation.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
