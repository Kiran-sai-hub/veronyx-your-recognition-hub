import {
  GitBranch,
  LayoutTemplate,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Workflow, workflows as seeded } from "@/lib/admin-data";
import { workflowTemplates } from "@/lib/workflow-model";
import { useDemoStore } from "@/store/demo-store";

type Status = "live" | "draft" | "paused";
const statusTone = { live: "success", draft: "neutral", paused: "private" } as const;
const statusLabel = { live: "Active", draft: "Draft", paused: "Paused" } as const;
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

type Row = {
  id: string;
  name: string;
  trigger: string;
  status: Status;
  owner: string;
  version: number;
  lastRun: string;
  lastRunResult: Workflow["lastRunResult"];
  rewardsThisMonth: number;
  fromAi: boolean;
};

export function WorkflowListPage({
  readOnly = false,
  aiEnabled,
  onAskAi,
}: {
  readOnly?: boolean;
  aiEnabled: boolean;
  onAskAi: (prompt: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const { workflowStatus, setWorkflowStatus, savedWorkflows, emptyOrg } = useDemoStore();

  const rows: Row[] = emptyOrg
    ? []
    : [
        ...savedWorkflows
          .filter((w) => !seeded.some((s) => s.id === w.id))
          .map((w) => ({
            id: w.id,
            name: w.name,
            trigger: w.trigger ?? "—",
            status: w.status,
            owner: "You",
            version: w.version,
            lastRun: "Never",
            lastRunResult: "none" as const,
            rewardsThisMonth: 0,
            fromAi: Boolean(w.fromAi),
          })),
        ...seeded.map((w) => {
          const saved = savedWorkflows.find((s) => s.id === w.id);
          return {
            ...w,
            status: (workflowStatus[w.id] ?? (w.status === "failed" ? "live" : w.status)) as Status,
            version: saved?.version ?? w.version,
            fromAi: false,
          };
        }),
      ];
  const visible = rows.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || w.status === filter),
  );

  const toggle = (w: Row) => {
    const next: Status = w.status === "live" ? "paused" : "live";
    setWorkflowStatus(w.id, next);
    toast.success(
      next === "live"
        ? `${w.name} activated. Next run scheduled for 01/11/2026.`
        : `${w.name} paused. No new runs until you resume it.`,
      {
        action: { label: "Undo", onClick: () => setWorkflowStatus(w.id, w.status) },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Programme manager"
        title="Workflows"
        description="Rules that decide who gets rewarded, and when. Every reward still waits for a person to approve it."
        action={
          !readOnly && (
            <Button asChild>
              <a href="/workflows/new">
                <Plus /> New workflow
              </a>
            </Button>
          )
        }
      />
      {rows.length === 0 ? (
        <Card className="rounded-lg border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <GitBranch className="size-8 text-muted-foreground" />
            <p className="font-semibold">No workflows. Start from a template or use AI Copilot.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <a href="/workflows/new">
                  <LayoutTemplate /> Start from a template
                </a>
              </Button>
              {aiEnabled && (
                <Button
                  variant="outline"
                  onClick={() => onAskAi("Help me set up my first workflow")}
                >
                  <Sparkles /> Use AI Copilot
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
                <TabsTrigger value="live">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="paused">Paused</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workflows"
              aria-label="Search workflows"
              className="sm:max-w-xs"
            />
          </div>
          {visible.length === 0 ? (
            <Card className="rounded-lg border-dashed">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-sm">
                <p className="font-semibold">No workflows match.</p>
                {aiEnabled && !readOnly && query && (
                  <Button
                    variant="outline"
                    onClick={() => onAskAi(`Create a workflow for ${query}`)}
                  >
                    <Sparkles /> Draft “{query}” with AI
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
                      <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                      </TableHead>
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
                            {w.fromAi && " · from AI proposal"}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-56 text-sm">{w.trigger}</TableCell>
                        <TableCell>
                          <StatusBadge tone={statusTone[w.status]}>
                            {statusLabel[w.status]}
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
                        <TableCell className="text-right font-semibold">
                          {w.rewardsThisMonth}
                        </TableCell>
                        <TableCell>
                          {!readOnly && <RowMenu row={w} onToggle={() => toggle(w)} />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
              <ul className="space-y-3 md:hidden">
                {visible.map((w) => (
                  <li key={w.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <a href={`/workflows/${w.id}`} className="font-medium text-primary">
                        {w.name}
                      </a>
                      {!readOnly && <RowMenu row={w} onToggle={() => toggle(w)} />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{w.trigger}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge tone={statusTone[w.status]}>{statusLabel[w.status]}</StatusBadge>
                      <StatusBadge tone={runTone[w.lastRunResult]}>
                        Last run: {runLabel[w.lastRunResult]}
                      </StatusBadge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {!readOnly && (
        <section aria-labelledby="templates" className="space-y-3">
          <h2 id="templates" className="flex items-center gap-2 text-lg font-semibold">
            <LayoutTemplate className="size-5 text-primary" /> Template library
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workflowTemplates.map((t) => (
              <Card key={t.id} className="rounded-lg">
                <CardContent className="flex h-full flex-col gap-2 p-4">
                  <StatusBadge tone="neutral">{t.industry}</StatusBadge>
                  <p className="font-medium">{t.name}</p>
                  <p className="flex-1 text-sm text-muted-foreground">{t.description}</p>
                  <Button size="sm" variant="outline" className="w-fit" asChild>
                    <a href={`/workflows/new?template=${t.id}`}>Use template</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RowMenu({ row, onToggle }: { row: Row; onToggle: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label={`Actions for ${row.name}`}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/workflows/${row.id}`}>Edit in builder</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/workflows/${row.id}/runs`}>Run history & versions</a>
        </DropdownMenuItem>
        {row.status !== "draft" && (
          <DropdownMenuItem onSelect={onToggle}>
            {row.status === "live" ? <Pause /> : <Play />}{" "}
            {row.status === "live" ? "Pause" : "Resume"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
