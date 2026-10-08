import { WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { go } from "@/lib/navigate";
import { useStatusStore } from "@/store/status-store";

/** "You're offline" banner (checklist §6.3), driven by the browser or the demo switch. */
export function OfflineBanner() {
  const simulated = useStatusStore((s) => s.simulatedOffline);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline && !simulated) return null;
  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-foreground px-4 py-2 text-sm text-background"
    >
      <WifiOff className="size-4" aria-hidden />
      You're offline. Changes will sync when you reconnect.
    </div>
  );
}

const IDLE_MS = 30 * 60 * 1000;
const WARNING_SECONDS = 60;

/**
 * Session timeout (checklist §6.3): after 30 idle minutes a warning counts down for 60 seconds,
 * then the session ends and the login screen says why.
 */
export function SessionTimeout() {
  const warning = useStatusStore((s) => s.sessionWarning);
  const setWarning = useStatusStore((s) => s.setSessionWarning);
  const [left, setLeft] = useState(WARNING_SECONDS);
  const idle = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      if (idle.current) window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => setWarning(true), IDLE_MS);
    };
    reset();
    const events = ["pointerdown", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, reset));
    return () => {
      if (idle.current) window.clearTimeout(idle.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [setWarning]);

  useEffect(() => {
    if (!warning) {
      setLeft(WARNING_SECONDS);
      return;
    }
    if (left <= 0) {
      setWarning(false);
      go("/login?expired=1");
      return;
    }
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [warning, left, setWarning]);

  return (
    <Dialog open={warning} onOpenChange={(open) => !open && setWarning(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you still there?</DialogTitle>
          <DialogDescription>
            For your security you'll be signed out in{" "}
            <span aria-live="polite" className="font-semibold text-foreground">
              {left} seconds
            </span>{" "}
            because you've been inactive.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setWarning(false);
              go("/login");
            }}
          >
            Sign out now
          </Button>
          <Button onClick={() => setWarning(false)}>Stay signed in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Standard API error toast with a retry button and a support code (checklist §6.3). */
export function showApiError(retry: () => void, code = "API-503-2C9E") {
  toast.error("Something went wrong. Please try again.", {
    description: `Error code for support: ${code}`,
    action: { label: "Retry", onClick: retry },
  });
}

/** Skeleton that matches the common page layout: heading, stat cards, then table rows. */
export function PageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading page">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 rounded-md" />
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading…
      </span>
    </div>
  );
}
