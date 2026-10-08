import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Fragment, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DataColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Value used for sorting and filtering. */
  value?: (row: T) => string | number;
  align?: "left" | "right";
  /** Hide below this breakpoint; the expanded row still shows it. */
  hideBelow?: "sm" | "md" | "lg";
};

/**
 * Table with sorting, text filtering, pagination and expandable rows (checklist §7.1). On phones
 * it keeps the first columns and moves the rest into the expandable detail.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  pageSize = 8,
  expand,
  filterPlaceholder = "Filter…",
  caption,
}: {
  rows: T[];
  columns: DataColumn<T>[];
  pageSize?: number;
  expand?: ((row: T) => ReactNode) | undefined;
  filterPlaceholder?: string;
  caption: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rows.filter((r) =>
          columns.some((c) =>
            String(c.value?.(r) ?? "")
              .toLowerCase()
              .includes(q),
          ),
        )
      : rows;
    if (!sort) return list;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.value) return list;
    return [...list].sort((a, b) => {
      const x = col.value!(a);
      const y = col.value!(b);
      const cmp =
        typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, columns, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safe = Math.min(page, pages - 1);
  const shown = filtered.slice(safe * pageSize, safe * pageSize + pageSize);
  const hide = {
    sm: "hidden sm:table-cell",
    md: "hidden md:table-cell",
    lg: "hidden lg:table-cell",
  };

  return (
    <div className="space-y-3">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={filterPlaceholder}
          aria-label={filterPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {expand && (
                <th className="w-10 p-3">
                  <span className="sr-only">Expand</span>
                </th>
              )}
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={
                      active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                    }
                    className={cn(
                      "p-3 font-medium",
                      c.align === "right" && "text-right",
                      c.hideBelow && hide[c.hideBelow],
                    )}
                  >
                    {c.value ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={() =>
                          setSort(
                            active && sort.dir === "asc"
                              ? { key: c.key, dir: "desc" }
                              : { key: c.key, dir: "asc" },
                          )
                        }
                      >
                        {c.header}
                        {active ? (
                          sort.dir === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : (
                            <ArrowDown className="size-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (expand ? 1 : 0)}
                  className="p-6 text-center text-muted-foreground"
                >
                  Nothing matches “{query}”.
                </td>
              </tr>
            )}
            {shown.map((row) => (
              <Fragment key={row.id}>
                <tr className="border-b border-border last:border-0">
                  {expand && (
                    <td className="p-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        aria-expanded={open === row.id}
                        aria-label={open === row.id ? "Hide details" : "Show details"}
                        onClick={() => setOpen(open === row.id ? null : row.id)}
                      >
                        {open === row.id ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                    </td>
                  )}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "p-3",
                        c.align === "right" && "text-right",
                        c.hideBelow && hide[c.hideBelow],
                      )}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
                {expand && open === row.id && (
                  <tr className="border-b border-border bg-muted/40">
                    <td colSpan={columns.length + 1} className="p-4">
                      {expand(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {filtered.length === 0 ? 0 : safe * pageSize + 1}–
          {Math.min(filtered.length, (safe + 1) * pageSize)} of {filtered.length}
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={safe === 0}
            onClick={() => setPage(safe - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={safe >= pages - 1}
            onClick={() => setPage(safe + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
