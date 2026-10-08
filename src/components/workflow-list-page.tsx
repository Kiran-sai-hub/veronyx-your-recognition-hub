import { GitBranch, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Workflow, workflows } from "@/lib/admin-data";
import { useAppStore } from "@/store/app-store";

const statusTone = {
  live: "success",
  draft: "neutral",
  paused: "private",
  failed: "error",
} as const;
const runLabel: Record<Workflow["lastRunResult"], string> = {
  success: "Worked",
  failed: "Failed",
  running: "Running now",
  none: "Not run yet",
};
const runTone = {
  success: "success",
  failed: "error",
  running: "warning",
  none: "neutral",
} as const;

export function WorkflowListPage() {
  const [query, setQuery] = useState("");
  const { openCopilot, aiAvailable } = useAppStore();
  const visible = workflows.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Automation"
        title="Workflows"
        description="Rules that decide who gets rewarded, and when. Every reward still needs a person to approve it."
        action={
          <Button asChild>
            <a href="/workflows/new">
              <Plus /> Create workflow
            </a>
          </Button>
        }
      />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search workflows"
        aria-label="Search workflows"
        className="max-w-sm"
      />
      {visible.length === 0 ? (
        <Card className="rounded-lg border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <GitBranch className="size-8 text-muted-foreground" />
            <p className="font-semibold">No workflows match “{query}”</p>
            <p className="text-sm text-muted-foreground">
              Try another name, or describe the workflow and let AI draft it.
            </p>
            {aiAvailable && (
              <Button
                variant="outline"
                onClick={() => openCopilot(`Suggest a workflow for ${query}`)}
              >
                <Sparkles /> Draft with AI
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden rounded-lg md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Starts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last run</TableHead>
                  <TableHead className="text-right">Rewards this month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <a
                        href={`/workflows/${w.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {w.name}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        v{w.version} · {w.owner}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{w.trigger}</TableCell>
                    <TableCell>
                      <StatusBadge tone={statusTone[w.status]}>
                        {w.status[0]?.toUpperCase() + w.status.slice(1)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <a href={`/workflows/${w.id}/runs`}>
                        <StatusBadge tone={runTone[w.lastRunResult]}>
                          {runLabel[w.lastRunResult]}
                        </StatusBadge>
                      </a>
                      <p className="mt-1 text-xs text-muted-foreground">{w.lastRun}</p>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{w.rewardsThisMonth}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="space-y-3 md:hidden">
            {visible.map((w) => (
              <a
                key={w.id}
                href={`/workflows/${w.id}`}
                className="block rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{w.name}</p>
                  <StatusBadge tone={runTone[w.lastRunResult]}>
                    {runLabel[w.lastRunResult]}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{w.trigger}</p>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
