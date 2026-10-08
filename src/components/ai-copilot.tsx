import { Bot, Download, Loader2, Send, Sparkles, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { aiSuggestionsByScreen, departmentCoverage, teamMembers } from "@/lib/admin-data";
import { useAppStore } from "@/store/app-store";

type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
  table?: { headers: string[]; rows: string[][] };
};

/** Deterministic answers built only from prototype data — never invented facts. */
function answerFor(question: string): Omit<Message, "id" | "role"> {
  const q = question.toLowerCase();
  if (q.includes("fix") || q.includes("validation")) {
    return {
      text: "I found 2 problems. The “Give points” step has no amount, and I can set it to 500 points to match version 6. Review the change in the builder before saving — nothing is applied automatically.",
    };
  }
  if (q.includes("department") || q.includes("lowest")) {
    return {
      text: "Operations had the lowest recognition coverage this month at 58%.",
      table: {
        headers: ["Department", "Coverage"],
        rows: departmentCoverage.map((row) => [row.department, `${row.coverage}%`]),
      },
    };
  }
  if (q.includes("not been recognised") || q.includes("recently") || q.includes("30 days")) {
    const rows = teamMembers.filter((member) => member.monthPoints === 0);
    return {
      text: `${rows.length} people have no recognition in the last 30 days.`,
      table: {
        headers: ["Name", "Last recognised"],
        rows: rows.map((r) => [r.name, r.lastRecognised]),
      },
    };
  }
  if (q.includes("fail")) {
    return {
      text: "Run 118 of “Sales target achievers” failed because the sales file had no “Target” column. Re-upload the file with that column, then re-run.",
    };
  }
  if (q.includes("tax") || q.includes("15,000")) {
    return {
      text: "1 pending approval would take an employee past the ₹15,000 yearly gift limit. It is marked on the approvals screen.",
    };
  }
  return {
    text: "I can only answer from the data in Veronyx Recognise. Try one of the suggestions, or open the screen you want to work on.",
  };
}

const progressSteps = ["Reading your data", "Checking permissions", "Writing the answer"];

function downloadCsv(table: NonNullable<Message["table"]>) {
  const csv = [table.headers, ...table.rows].map((row) => row.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "copilot-answer.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function AiCopilot({ screen }: { screen: string }) {
  const { copilotOpen, copilotPrompt, closeCopilot, aiAvailable, setAiAvailable } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const suggestions = aiSuggestionsByScreen[screen] ?? aiSuggestionsByScreen["default"] ?? [];

  const ask = (question: string) => {
    if (!question.trim() || progress !== null) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: question }]);
    setDraft("");
    setProgress(0);
    progressSteps.forEach((_, index) => {
      window.setTimeout(() => setProgress(index + 1), 450 * (index + 1));
    });
    window.setTimeout(
      () => {
        setProgress(null);
        setMessages((current) => [
          ...current,
          { id: Date.now() + 1, role: "ai", ...answerFor(question) },
        ]);
      },
      450 * (progressSteps.length + 1),
    );
  };

  useEffect(() => {
    if (copilotOpen && copilotPrompt && aiAvailable) ask(copilotPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copilotOpen, copilotPrompt]);

  return (
    <Sheet open={copilotOpen} onOpenChange={(open) => !open && closeCopilot()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> AI Copilot
          </SheetTitle>
          <SheetDescription>
            Answers use only your Veronyx data on this screen. It suggests — you decide.
          </SheetDescription>
          <div className="flex items-center gap-2 pt-2">
            <Switch id="ai-available" checked={aiAvailable} onCheckedChange={setAiAvailable} />
            <Label htmlFor="ai-available" className="text-xs text-muted-foreground">
              Simulate AI available
            </Label>
          </div>
        </SheetHeader>

        {!aiAvailable ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <WifiOff className="size-8 text-muted-foreground" />
            <p className="font-semibold">AI is unavailable right now</p>
            <p className="text-sm text-muted-foreground">
              Everything still works by hand. Use the menu to open workflows, approvals or
              dashboards.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Suggested for this screen</p>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => ask(suggestion)}
                      className="block w-full rounded-md border border-border p-3 text-left text-sm hover:bg-muted"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : "flex gap-2"}
                >
                  {message.role === "ai" && <Bot className="mt-1 size-5 shrink-0 text-primary" />}
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                        : "max-w-[90%] space-y-3 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    }
                  >
                    <p>{message.text}</p>
                    {message.table && (
                      <>
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              {message.table.headers.map((h) => (
                                <th
                                  key={h}
                                  className="py-1 text-left font-medium text-muted-foreground"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {message.table.rows.map((row) => (
                              <tr key={row.join()} className="border-t border-border">
                                {row.map((cell) => (
                                  <td key={cell} className="py-1">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => message.table && downloadCsv(message.table)}
                        >
                          <Download /> Export CSV
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {progress !== null && (
                <ol className="space-y-1 rounded-lg border border-border p-3 text-sm">
                  {progressSteps.map((step, index) => (
                    <li
                      key={step}
                      className={index < progress ? "text-foreground" : "text-muted-foreground"}
                    >
                      {index === progress ? (
                        <Loader2 className="mr-2 inline size-3.5 animate-spin" />
                      ) : (
                        "• "
                      )}
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <form
              className="flex gap-2 border-t border-border p-4"
              onSubmit={(event) => {
                event.preventDefault();
                ask(draft);
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about your programme"
                aria-label="Ask AI Copilot"
              />
              <Button type="submit" size="icon" aria-label="Send question">
                <Send />
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
