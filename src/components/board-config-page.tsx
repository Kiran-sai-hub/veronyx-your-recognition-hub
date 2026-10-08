import { Eye, LockKeyhole, Medal, Sparkles } from "lucide-react";

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
  boards,
  boardLeaderboard,
  behaviourRules,
  comparisonPolicies,
  scorecardMetrics,
  boardTargets,
} from "@/lib/phase2-data";

export function BoardConfigPage({
  boardId,
  onAskAi,
}: {
  boardId: string;
  onAskAi: (prompt: string) => void;
}) {
  const board = boards.find((b) => b.id === boardId) ?? boards[0]!;

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Performance"
        title={board.name}
        description={`${board.metric} · ${board.scope} · ${board.period}`}
        action={
          <Button
            variant="outline"
            onClick={() => onAskAi(`Suggest improvements for the board "${board.name}"`)}
          >
            <Sparkles /> AI setup help
          </Button>
        }
      />

      <Tabs defaultValue="setup">
        <TabsList className="flex-wrap">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Source & scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="board-source">Where the numbers come from</Label>
                <Select defaultValue={board.source}>
                  <SelectTrigger id="board-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Connector">Connector (sales file)</SelectItem>
                    <SelectItem value="Native form">Native form</SelectItem>
                    <SelectItem value="Manual">Manual entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="board-scope">Who is on this board</Label>
                <Select defaultValue={board.scope}>
                  <SelectTrigger id="board-scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales department">Sales department</SelectItem>
                    <SelectItem value="All locations">All locations</SelectItem>
                    <SelectItem value="Quality department">Quality department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="board-period">Period</Label>
                <Select defaultValue={board.period}>
                  <SelectTrigger id="board-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save setup</Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {boardTargets.map((target) => (
                <div key={target.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">{target.metric}</p>
                  <p className="text-muted-foreground">
                    {target.target} · {target.appliesTo}
                  </p>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="New target, e.g. 105% of monthly target"
                  aria-label="New target"
                />
                <Button variant="outline">Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scorecard" className="mt-6">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Scorecard</CardTitle>
              <p className="text-sm text-muted-foreground">
                Weights must add up to 100. Current total:{" "}
                {scorecardMetrics.reduce((sum, m) => sum + m.weight, 0)}.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {scorecardMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="grid items-center gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_120px_1fr]"
                >
                  <p className="font-medium">{metric.metric}</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={metric.weight}
                      aria-label={`Weight for ${metric.metric}`}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.direction}</p>
                </div>
              ))}
              <Button>Save scorecard</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Behaviour rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {behaviourRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">{rule.detail}</p>
                  </div>
                  <Switch defaultChecked={rule.active} aria-label={`Turn ${rule.name} on or off`} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Comparison policy</CardTitle>
              <p className="text-sm text-muted-foreground">
                People are only compared where comparison is fair.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {comparisonPolicies.map((policy) => (
                <label
                  key={policy.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 has-checked:border-primary has-checked:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="comparison"
                    defaultChecked={policy.recommended}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      {policy.name}
                      {policy.recommended && <StatusBadge tone="success">Recommended</StatusBadge>}
                    </span>
                    <span className="block text-sm text-muted-foreground">{policy.detail}</span>
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility" className="mt-6 space-y-4">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Who sees what</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Employees see their own rank and the top 10", on: true },
                { label: "Managers see their whole team", on: true },
                { label: "Show this board on the kiosk display", on: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <p className="text-sm">{item.label}</p>
                  <Switch defaultChecked={item.on} aria-label={item.label} />
                </div>
              ))}
              <div className="flex items-start gap-3 rounded-md bg-private-surface p-4">
                <LockKeyhole className="mt-0.5 size-5 shrink-0 text-private" />
                <p className="text-sm text-muted-foreground">
                  People near the bottom are never shown on shared screens. Their standing is
                  private — visible only to them and their manager.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="size-4" /> Employee preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {boardLeaderboard.slice(0, 4).map((row) => (
                <div
                  key={row.code}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Medal className="size-4 text-reward" />
                    {row.rank}. {row.name}
                  </span>
                  <span className="font-semibold">{row.score}%</span>
                </div>
              ))}
              <p className="pt-2 text-xs text-muted-foreground">
                Employees see their own position plus the top of the board.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="size-4" /> Manager preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {boardLeaderboard.map((row) => (
                <div
                  key={row.code}
                  className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
                >
                  <span>
                    {row.rank}. {row.name}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{row.code}</span>
                  </span>
                  <span className="font-semibold">
                    {row.score}% · {row.points} pts
                  </span>
                </div>
              ))}
              <p className="pt-2 text-xs text-muted-foreground">
                Managers see the full team with suggested points.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
