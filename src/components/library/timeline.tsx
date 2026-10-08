import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  title: ReactNode;
  time: string;
  detail?: ReactNode;
  tone?: "default" | "success" | "warning" | "error";
};

/** Vertical timeline for run history and audit trails (checklist §7.1). */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-5 border-l border-border pl-6", className)}>
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            aria-hidden
            className={cn(
              "absolute -left-[31px] top-1 size-3.5 rounded-full border-2 border-background",
              item.tone === "success" && "bg-success",
              item.tone === "warning" && "bg-warning",
              item.tone === "error" && "bg-destructive",
              (!item.tone || item.tone === "default") && "bg-primary",
            )}
          />
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.time}</p>
          {item.detail && <div className="mt-1 text-sm text-muted-foreground">{item.detail}</div>}
        </li>
      ))}
    </ol>
  );
}
