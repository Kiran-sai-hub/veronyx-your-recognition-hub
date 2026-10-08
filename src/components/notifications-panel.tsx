import { Bell, BellOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationsFor } from "@/lib/notifications-data";
import { cn } from "@/lib/utils";
import type { Persona } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";

const toneDot = {
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-destructive",
  success: "bg-success",
} as const;

export function NotificationsPanel({
  persona,
  align,
  side,
}: {
  persona: Persona;
  align: "start" | "end";
  side: "top" | "bottom";
}) {
  const emptyOrg = useDemoStore((s) => s.emptyOrg);
  const read = useDemoStore((s) => s.readNotifications);
  const markRead = useDemoStore((s) => s.markNotificationsRead);
  const items = notificationsFor(persona, emptyOrg);
  const unread = items.filter((n) => !read.includes(n.id)).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-11 shrink-0"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} side={side} className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => markRead(items.map((n) => n.id))}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
            <BellOff className="size-6" />
            No notifications yet.
          </div>
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto" aria-live="polite">
            {items.map((n) => (
              <li key={n.id}>
                <a
                  href={n.href}
                  onClick={() => markRead([n.id])}
                  className="flex gap-3 px-4 py-3 text-sm hover:bg-muted"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      read.includes(n.id) ? "bg-transparent" : toneDot[n.tone],
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className={cn("block", !read.includes(n.id) && "font-semibold")}>
                      {n.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">{n.detail}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{n.when}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
