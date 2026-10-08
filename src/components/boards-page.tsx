import { BarChart3, LayoutTemplate, Plus, Sparkles, SquareDashed, Users } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Board,
  boardIndustryTemplates,
  boards as seeded,
  comparisonModes,
} from "@/lib/board-data";
import { useDemoStore } from "@/store/demo-store";

const sourceTone = { External: "neutral", Native: "reward", Hybrid: "private" } as const;

export function BoardsPage({
  onOpenBoard,
  onAskAi,
  aiEnabled,
  readOnly = false,
}: {
  onOpenBoard: (id: string, search?: Record<string, string>) => void;
  onAskAi: (prompt: string) => void;
  aiEnabled: boolean;
  readOnly?: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [industry, setIndustry] = useState(boardIndustryTemplates[0]!.industry);
  const [role, setRole] = useState(boardIndustryTemplates[0]!.roles[0]!);
  const { savedBoards, emptyOrg } = useDemoStore();
  const all: Board[] = emptyOrg
    ? []
    : [
        ...savedBoards
          .filter((s) => !seeded.some((b) => b.id === s.id))
          .map((s) => s.board as Board),
        ...seeded.map(
          (b) => (savedBoards.find((s) => s.id === b.id)?.board as Board | undefined) ?? b,
        ),
      ];
  const roles = boardIndustryTemplates.find((t) => t.industry === industry)?.roles ?? [];

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Performance"
        title="Performance boards"
        description="Track the numbers that matter — from your tools or entered here — and turn them into fair recognition."
        action={
          !readOnly && (
            <div className="flex flex-wrap gap-2">
              {aiEnabled && (
                <Button
                  variant="outline"
                  onClick={() => onAskAi("Create a performance board for my factory team")}
                >
                  <Sparkles /> AI Setup
                </Button>
              )}
              <Button onClick={() => setCreateOpen(true)}>
                <Plus /> New board
              </Button>
            </div>
          )
        }
      />
      {all.length === 0 ? (
        <Card className="rounded-lg border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <BarChart3 className="size-8 text-muted-foreground" />
            <p className="font-semibold">No boards yet. Create a board to start tracking.</p>
            {!readOnly && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus /> Create a board
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {all.map((board) => (
            <Card key={board.id} className="flex flex-col rounded-lg shadow-sm">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">{board.name}</CardTitle>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">
                    {board.type} board
                  </p>
                </div>
                <StatusBadge tone={board.status === "active" ? "success" : "neutral"}>
                  {board.status === "active" ? "Active" : "Draft"}
                </StatusBadge>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Source mode</span>
                  <StatusBadge tone={sourceTone[board.sourceMode]}>{board.sourceMode}</StatusBadge>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tracking</span>
                  <span className="text-right text-foreground">
                    {[
                      board.tracking.connector,
                      board.tracking.form && `Form: ${board.tracking.form}`,
                    ]
                      .filter(Boolean)
                      .join(" + ") || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Scorecard</span>
                  <span className="text-foreground">
                    {board.metrics.length} metrics · {board.rules.length} rules
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Comparison</span>
                  <span className="text-foreground">
                    {comparisonModes.find((c) => c.mode === board.comparison.mode)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" /> People
                  </span>
                  <span className="text-foreground">{board.members}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-auto w-fit"
                  onClick={() => onOpenBoard(board.id)}
                >
                  {readOnly ? "View board" : "Open board"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a performance board</DialogTitle>
            <DialogDescription>
              Start from an industry template, a blank canvas, or an AI suggestion. You review
              everything before it goes live.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <section className="space-y-3 rounded-lg border border-border p-4">
              <p className="flex items-center gap-2 font-medium">
                <LayoutTemplate className="size-4 text-primary" /> From an industry template
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Select
                    value={industry}
                    onValueChange={(v) => {
                      setIndustry(v);
                      setRole(boardIndustryTemplates.find((t) => t.industry === v)?.roles[0] ?? "");
                    }}
                  >
                    <SelectTrigger aria-label="Industry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {boardIndustryTemplates.map((t) => (
                        <SelectItem key={t.industry} value={t.industry}>
                          {t.industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Role / team type</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger aria-label="Role or team type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Pre-fills metrics, scorecard, targets and behaviour rules.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setCreateOpen(false);
                  onOpenBoard("new", { industry, role });
                }}
              >
                Use template
              </Button>
            </section>
            <button
              type="button"
              onClick={() => {
                setCreateOpen(false);
                onOpenBoard("new", { blank: "1" });
              }}
              className="flex w-full items-start gap-3 rounded-lg border border-border p-4 text-left hover:bg-muted"
            >
              <SquareDashed className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium">Blank canvas</span>
                <span className="block text-sm text-muted-foreground">Start from scratch.</span>
              </span>
            </button>
            {aiEnabled && (
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  onAskAi("Create a performance board for my factory team");
                }}
                className="flex w-full items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-left hover:bg-primary/10"
              >
                <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium">From an AI suggestion</span>
                  <span className="block text-sm text-muted-foreground">
                    Describe your team; review the suggested board.
                  </span>
                </span>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
