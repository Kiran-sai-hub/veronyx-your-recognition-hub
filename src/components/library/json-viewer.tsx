import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function Value({ value }: { value: Json }) {
  if (value === null) return <span className="text-muted-foreground">null</span>;
  if (typeof value === "string") return <span className="text-success">"{value}"</span>;
  if (typeof value === "number") return <span className="text-reward">{value}</span>;
  if (typeof value === "boolean") return <span className="text-private">{String(value)}</span>;
  return null;
}

function Node({ name, value, depth }: { name?: string | undefined; value: Json; depth: number }) {
  const isObject = value !== null && typeof value === "object";
  const [open, setOpen] = useState(depth < 2);
  const label = name !== undefined && <span className="text-primary">"{name}"</span>;
  if (!isObject)
    return (
      <div style={{ paddingLeft: depth * 14 }}>
        {label}
        {name !== undefined && ": "}
        <Value value={value} />
      </div>
    );
  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v] as const)
    : Object.entries(value);
  const [openBrace, closeBrace] = Array.isArray(value) ? ["[", "]"] : ["{", "}"];
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-0.5 hover:bg-muted"
        style={{ paddingLeft: depth * 14 }}
      >
        <ChevronRight
          className={cn("size-3 transition-transform", open && "rotate-90")}
          aria-hidden
        />
        {label}
        {name !== undefined && ": "}
        {openBrace}
        {!open && (
          <span className="text-muted-foreground">
            {" "}
            {entries.length} items {closeBrace}
          </span>
        )}
      </button>
      {open && (
        <>
          {entries.map(([k, v]) => (
            <Node key={k} name={Array.isArray(value) ? undefined : k} value={v} depth={depth + 1} />
          ))}
          <div style={{ paddingLeft: depth * 14 + 14 }}>{closeBrace}</div>
        </>
      )}
    </div>
  );
}

/** Collapsible, syntax-highlighted JSON (checklist §7.1) for workflow definitions. */
export function JsonViewer({ data, className }: { data: unknown; className?: string }) {
  const json = JSON.parse(JSON.stringify(data ?? null)) as Json;
  return (
    <div
      className={cn(
        "max-h-80 overflow-auto rounded-md bg-muted/60 p-3 font-mono text-[12px] leading-relaxed",
        className,
      )}
      role="tree"
      aria-label="Definition as JSON"
    >
      <Node value={json} depth={0} />
    </div>
  );
}
