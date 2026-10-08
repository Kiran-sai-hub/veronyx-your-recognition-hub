import { RefreshCw } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const THRESHOLD = 70;

/**
 * Pull-to-refresh for lists on touch screens (checklist §8.2). Only starts when the page is
 * scrolled to the top; a visible Refresh button stays available for mouse and keyboard users.
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}) {
  const start = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);

  return (
    <div
      onTouchStart={(e) => {
        if (window.scrollY <= 0 && !busy) start.current = e.touches[0]?.clientY ?? null;
      }}
      onTouchMove={(e) => {
        if (start.current === null) return;
        const dy = (e.touches[0]?.clientY ?? 0) - start.current;
        setPull(Math.max(0, Math.min(dy * 0.5, THRESHOLD * 1.4)));
      }}
      onTouchEnd={async () => {
        const ready = pull >= THRESHOLD;
        start.current = null;
        setPull(0);
        if (!ready) return;
        setBusy(true);
        try {
          await onRefresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      <div
        aria-live="polite"
        className={cn(
          "flex items-center justify-center gap-2 overflow-hidden text-xs text-muted-foreground transition-[height] motion-reduce:transition-none",
        )}
        style={{ height: busy ? 36 : pull }}
      >
        {(busy || pull > 0) && (
          <>
            <RefreshCw
              className={cn("size-4", busy && "animate-spin")}
              style={{ transform: busy ? undefined : `rotate(${pull * 4}deg)` }}
            />
            {busy ? "Refreshing…" : pull >= THRESHOLD ? "Release to refresh" : "Pull to refresh"}
          </>
        )}
      </div>
      {children}
    </div>
  );
}
