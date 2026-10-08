import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type KanbanColumn<T> = { id: string; title: string; hint?: string; items: T[] };

/**
 * Kanban board (checklist §7.1, v1): columns of cards that can be dragged between columns, or
 * moved with the keyboard through the `onMove` actions the card renders.
 */
export function Kanban<T extends { id: string }>({
  columns,
  renderCard,
  onMove,
  canDrop,
}: {
  columns: KanbanColumn<T>[];
  renderCard: (item: T, column: KanbanColumn<T>) => ReactNode;
  onMove: (itemId: string, toColumn: string) => void;
  canDrop?: (itemId: string, toColumn: string) => boolean;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => {
        const allowed = dragging ? (canDrop?.(dragging, col.id) ?? true) : true;
        return (
          <section
            key={col.id}
            aria-label={`${col.title} column`}
            onDragOver={(e) => {
              if (!allowed) return;
              e.preventDefault();
              setOver(col.id);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging && allowed) onMove(dragging, col.id);
              setDragging(null);
              setOver(null);
            }}
            className={cn(
              "min-h-40 space-y-2 rounded-lg border border-border bg-muted/40 p-3",
              over === col.id && "border-primary bg-primary/5",
              dragging && !allowed && "opacity-60",
            )}
          >
            <header className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <span className="text-xs text-muted-foreground">{col.items.length}</span>
            </header>
            {col.hint && <p className="text-xs text-muted-foreground">{col.hint}</p>}
            {col.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragging(item.id)}
                onDragEnd={() => {
                  setDragging(null);
                  setOver(null);
                }}
                className={cn(
                  "cursor-grab rounded-md border border-border bg-card p-3 shadow-sm active:cursor-grabbing",
                  dragging === item.id && "opacity-50",
                )}
              >
                {renderCard(item, col)}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
