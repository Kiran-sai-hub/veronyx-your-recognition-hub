import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

/**
 * PWA install prompt (checklist §8.2). Uses the browser's install event where supported (Android
 * Chrome); on iPhone it explains "Share → Add to Home Screen". Dismissal is remembered.
 */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("veronyx-install-dismissed") === "1";
    } catch {
      dismissed = false;
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (dismissed || standalone) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    // Show the explainer on phones even before (or without) the browser event.
    if (isIos || window.matchMedia("(max-width: 767px)").matches) setHidden(false);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;
  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem("veronyx-install-dismissed", "1");
    } catch {
      // Private mode: the banner simply shows again next time.
    }
  };

  return (
    <div
      role="region"
      aria-label="Install the app"
      className="mb-5 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm"
    >
      <img src="/icons/icon-192.png" alt="" className="size-10 rounded-md" data-decorative="" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Add Recognise to your home screen</p>
        <p className="text-muted-foreground">
          {ios
            ? "Tap Share, then “Add to Home Screen”. It opens like an app and works on slow networks."
            : "Opens like an app, works on slow networks and keeps your wallet one tap away."}
        </p>
        {!ios && (
          <Button
            size="sm"
            className="mt-2"
            onClick={async () => {
              if (event) {
                await event.prompt();
                await event.userChoice;
              }
              dismiss();
            }}
          >
            <Download /> Install app
          </Button>
        )}
      </div>
      <Button size="icon" variant="ghost" className="size-8" aria-label="Not now" onClick={dismiss}>
        <X />
      </Button>
    </div>
  );
}
