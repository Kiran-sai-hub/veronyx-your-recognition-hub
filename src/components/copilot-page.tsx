import { Coins, MessageSquare, Plus } from "lucide-react";

import { CopilotConversation } from "@/components/copilot-conversation";
import { CopilotTabs } from "@/components/copilot-tabs";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Persona } from "@/store/app-store";
import { useCopilotStore } from "@/store/copilot-store";

type CopilotPageProps = { persona: Persona; aiAvailable: boolean };

/** Full-page Copilot (global nav entry, checklist §5.1). Same sessions as the shell sheet. */
export function CopilotPage({ persona, aiAvailable }: CopilotPageProps) {
  const { sessions, activeId, setActive, newSession } = useCopilotStore();
  const queries = sessions.reduce((n, s) => n + s.turns.length, 0);
  return (
    <div className="space-y-5">
      <PageHeading
        eyebrow="AI"
        title="AI Copilot"
        description="Create workflows, explain outcomes and ask about your data in plain language. Nothing changes until you confirm."
        action={<CopilotTabs active="copilot" />}
      />
      {!aiAvailable ? (
        <Card>
          <CardContent className="p-6 text-sm">
            AI is unavailable right now. Everything still works by hand — use{" "}
            <a className="text-primary underline" href="/workflows/new">
              Workflows
            </a>
            ,{" "}
            <a className="text-primary underline" href="/analytics">
              Analytics
            </a>{" "}
            and{" "}
            <a className="text-primary underline" href="/approvals">
              Approvals
            </a>{" "}
            directly.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="min-w-0 space-y-3">
            <Button className="w-full" onClick={() => newSession()}>
              <Plus /> New session
            </Button>
            <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-1" aria-label="Sessions">
              {sessions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setActive(s.id)}
                    aria-current={s.id === activeId ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 truncate whitespace-nowrap rounded-md px-3 py-2 text-left text-sm",
                      s.id === activeId ? "bg-muted font-medium" : "hover:bg-muted/60",
                    )}
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{s.title}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="hidden rounded-md border border-border p-3 text-xs text-muted-foreground lg:block">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <Coins className="size-3.5" /> Usage (admins only)
              </p>
              <p className="mt-1">
                {queries} question{queries === 1 ? "" : "s"} · ~
                {(queries * 1850).toLocaleString("en-IN")} tokens this month
              </p>
              <p>Every AI interaction is logged in the audit trail.</p>
            </div>
          </aside>
          <div className="flex h-[75vh] min-h-[520px] min-w-0 flex-col">
            <CopilotConversation persona={persona} screen="copilot" variant="page" />
          </div>
        </div>
      )}
    </div>
  );
}
