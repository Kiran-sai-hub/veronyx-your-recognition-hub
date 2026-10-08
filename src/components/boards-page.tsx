import { LayoutTemplate, Plus, Sparkles, Trophy } from "lucide-react";
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
import { boards, boardTemplates } from "@/lib/phase2-data";

export function BoardsPage({
  onOpenBoard,
  onAskAi,
}: {
  onOpenBoard: (id: string) => void;
  onAskAi: (prompt: string) => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Performance"
        title="Performance boards"
        description="Track the numbers that matter and turn them into recognition."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> New board
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {boards.map((board) => (
          <Card key={board.id} className="rounded-lg shadow-sm">
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">{board.name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {board.metric} · {board.scope}
                </p>
              </div>
              <StatusBadge tone={board.status === "Live" ? "success" : "neutral"}>
                {board.status}
              </StatusBadge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Source</span>
                <span className="text-foreground">{board.source}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Period</span>
                <span className="text-foreground">{board.period}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>People on board</span>
                <span className="text-foreground">{board.members}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => onOpenBoard(board.id)}>
                <Trophy /> Open board
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a board</DialogTitle>
            <DialogDescription>
              Start from a template, from scratch, or let AI suggest a setup — you review everything
              before it goes live.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {boardTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  onOpenBoard("board-sales");
                }}
                className="flex w-full items-start gap-3 rounded-md border border-border p-4 text-left hover:bg-muted"
              >
                <LayoutTemplate className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>
                  <span className="block font-medium">{template.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {template.description}
                  </span>
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCreateOpen(false);
                onAskAi("Help me set up a performance board for my team");
              }}
              className="flex w-full items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4 text-left hover:bg-primary/10"
            >
              <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium">Set up with AI</span>
                <span className="block text-sm text-muted-foreground">
                  Answer a few questions and review a suggested board. You can also do every step by
                  hand.
                </span>
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
