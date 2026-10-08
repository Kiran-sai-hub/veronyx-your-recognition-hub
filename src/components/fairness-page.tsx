import { Eye, LockKeyhole, ShieldAlert, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  canShowGenderCut,
  departmentCoverage,
  gamingAlerts as initialAlerts,
  gini,
  locationCoverage,
  managerSpread,
  negativeReport,
  privateFollowUps,
  recognitionPoints,
  retentionSignals,
  shiftCoverage,
  tenureCoverage,
  topTenShare,
  type GamingAlert,
} from "@/lib/phase3-data";

type FairnessPageProps = { canSeePrivate: boolean };

function CoverageList({ rows }: { rows: { group: string; coverage: number; people: number }[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.group}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{row.group}</span>
            <span className="text-muted-foreground">
              {row.coverage}% of {row.people}
            </span>
          </div>
          <Progress value={row.coverage} aria-label={`${row.group} coverage`} />
        </li>
      ))}
    </ul>
  );
}

export function FairnessPage({ canSeePrivate }: FairnessPageProps) {
  const [alerts, setAlerts] = useState<GamingAlert[]>(initialAlerts);
  const genderConsent = false;
  const g = gini(recognitionPoints);
  const top = topTenShare(recognitionPoints);

  const resolve = (id: string, status: GamingAlert["status"]) => {
    const previous = alerts;
    setAlerts((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success(status === "held" ? "Rewards on hold until you review" : "Alert cleared", {
      action: { label: "Undo", onClick: () => setAlerts(previous) },
    });
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Fairness"
        title="Fairness & coverage"
        description="See who is being recognised, who is being missed, and anything that looks unusual."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Spread score"
          value={g.toFixed(2).replace(".", ",")}
          detail="0 is perfectly even. Below 0,40 is healthy."
          icon={Users}
        />
        <StatCard
          label="Top 10% share"
          value={`${Math.round(top * 100)}%`}
          detail="Share of points held by the top tenth"
          icon={Eye}
        />
        <StatCard
          label="Open alerts"
          value={String(alerts.filter((a) => a.status === "open").length)}
          detail="Unusual patterns waiting for a person to check"
          icon={ShieldAlert}
        />
      </div>

      <Tabs defaultValue="equity">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="equity">Equity cuts</TabsTrigger>
          <TabsTrigger value="spread">Manager spread</TabsTrigger>
          <TabsTrigger value="negative">Who is missed</TabsTrigger>
          <TabsTrigger value="gaming">Unusual activity</TabsTrigger>
          {canSeePrivate && <TabsTrigger value="private">Private follow-ups</TabsTrigger>}
        </TabsList>

        <TabsContent value="equity" className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            ["By department", departmentCoverage],
            ["By location", locationCoverage],
            ["By shift", shiftCoverage],
            ["By tenure", tenureCoverage],
          ].map(([title, rows]) => (
            <Card key={title as string}>
              <CardHeader>
                <CardTitle className="text-base">{title as string}</CardTitle>
              </CardHeader>
              <CardContent>
                <CoverageList rows={rows as typeof departmentCoverage} />
              </CardContent>
            </Card>
          ))}
          <Card className="lg:col-span-2">
            <CardContent className="flex items-start gap-3 p-5 text-sm">
              <LockKeyhole className="mt-0.5 size-4 text-private" />
              <p className="text-muted-foreground">
                {canShowGenderCut(genderConsent)
                  ? "Gender cut available."
                  : "Gender cut is hidden. It appears only after employees consent to this analysis in the privacy notice."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spread" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How widely each manager recognises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {managerSpread.map((m) => {
                const pct = Math.round((m.distinct / m.team) * 100);
                return (
                  <div key={m.manager}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{m.manager}</span>
                      <span className="text-muted-foreground">
                        {m.distinct} of {m.team} people · {pct}%
                      </span>
                    </div>
                    <Progress value={pct} aria-label={`${m.manager} spread`} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negative" className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">No recognition in 60+ days</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {negativeReport.zeroRecognition.map((p) => (
                  <li key={p.name} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-muted-foreground">{p.team}</p>
                    </div>
                    <span className="text-muted-foreground">{p.days} days</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-4"
                onClick={() => toast.success("Nudge sent to their managers")}
              >
                Nudge their managers
              </Button>
            </CardContent>
          </Card>
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
          </div>
        </TabsContent>

        <TabsContent value="gaming" className="mt-6 space-y-3">
          {alerts.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
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
