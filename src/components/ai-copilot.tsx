import { Maximize2, Sparkles, X } from "lucide-react";

import { CopilotConversation } from "@/components/copilot-conversation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { go } from "@/lib/navigate";
import { useAppStore } from "@/store/app-store";

/** The single shell-level Copilot. Screens open it with openCopilot(prompt); it knows the screen. */
export function AiCopilot({ screen }: { screen: string }) {
  const { copilotOpen, copilotPrompt, closeCopilot, persona } = useAppStore();
  const docked = useMediaQuery("(min-width: 1440px)");
  const conversation = copilotOpen && (
    <CopilotConversation
      persona={persona}
      screen={screen}
      variant="sheet"
      initialPrompt={copilotPrompt}
      onConsumePrompt={() => useAppStore.setState({ copilotPrompt: null })}
      onLeave={closeCopilot}
    />
  );

  // Large desktop (§8.1): the Copilot docks as a right panel next to the screen it is about.
  if (docked)
    return copilotOpen ? (
      <aside
        aria-label="AI Copilot"
        className="fixed inset-y-0 right-0 z-30 flex w-[420px] flex-col border-l border-border bg-background shadow-lg"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-5 text-primary" /> 🤖 AI Copilot
          </h2>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                closeCopilot();
                go("/copilot");
              }}
            >
              <Maximize2 /> Full page
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Close AI Copilot"
              onClick={closeCopilot}
            >
              <X />
            </Button>
          </div>
        </div>
        <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
          Uses only data you can see. It proposes — you decide.
        </p>
        {conversation}
      </aside>
    ) : null;

  return (
    <Sheet open={copilotOpen} onOpenChange={(open) => !open && closeCopilot()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border p-4 pr-12">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> 🤖 AI Copilot
            </SheetTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                closeCopilot();
                go("/copilot");
              }}
            >
              <Maximize2 /> Full page
            </Button>
          </div>
          <SheetDescription>
            Uses only data you can see. It proposes — you decide. It never pays, approves or sends
            messages.
          </SheetDescription>
        </SheetHeader>
        {conversation}
      </SheetContent>
    </Sheet>
  );
}
