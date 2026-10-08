import { Maximize2, Sparkles } from "lucide-react";

import { CopilotConversation } from "@/components/copilot-conversation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { go } from "@/lib/navigate";
import { useAppStore } from "@/store/app-store";

/** The single shell-level Copilot. Screens open it with openCopilot(prompt); it knows the screen. */
export function AiCopilot({ screen }: { screen: string }) {
  const { copilotOpen, copilotPrompt, closeCopilot, persona } = useAppStore();
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
        {copilotOpen && (
          <CopilotConversation
            persona={persona}
            screen={screen}
            variant="sheet"
            initialPrompt={copilotPrompt}
            onConsumePrompt={() => useAppStore.setState({ copilotPrompt: null })}
            onLeave={closeCopilot}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
