import { BadgeCheck, CheckCircle2, Plug, Search, Star, Users } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { SegmentedControl } from "@/components/library/segmented-control";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIndianNumber } from "@/lib/format";
import {
  filterMarketplace,
  marketplaceIndustries,
  marketplaceTemplates,
  type MarketplaceTemplate,
} from "@/lib/marketplace-data";

const categories = [
  "All",
  "Sales",
  "Service",
  "Production",
  "Quality",
  "Attendance",
  "Tenure",
  "Peer",
];

/** Template marketplace (P3): browse workflow templates by industry and install one as a draft. */
export function TemplateMarketplacePage({ readOnly = false }: { readOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string>("All industries");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"popular" | "rating">("popular");
  const [open, setOpen] = useState<MarketplaceTemplate | null>(null);

  const list = filterMarketplace(marketplaceTemplates, { query, industry, category }).sort(
    (a, b) => (sort === "popular" ? b.installs - a.installs : b.rating - a.rating),
  );

  return (
    <div className="space-y-6">
      <a href="/workflows" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to workflows
      </a>
      <PageHeading
        eyebrow="Workflows"
        title="Template marketplace"
        description="Ready-made programmes from Veronyx, partners and other businesses. Installing creates a draft you can change — nothing runs until you validate and activate it."
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search templates"
            aria-label="Search templates"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger className="w-full sm:w-52" aria-label="Industry">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {marketplaceIndustries.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All" ? "All categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SegmentedControl
          label="Sort"
          value={sort}
          onChange={setSort}
          options={[
            { value: "popular", label: "Most installed" },
            { value: "rating", label: "Top rated" },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          illustration="data"
          title="No templates match."
          description="Try another industry, or start from a blank workflow."
          action={
            <Button asChild>
              <a href="/workflows/new">Blank workflow</a>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((t) => {
            const missing = t.metrics.filter((m) => !m.connected).length;
            return (
              <Card key={t.id} className="rounded-lg">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border px-2.5 py-1 text-xs">
                      {t.industry}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                      {t.publisher === "Veronyx" && (
                        <BadgeCheck className="size-3.5 text-primary" aria-label="Verified" />
                      )}
                      {t.publisher}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">by {t.publisherName}</p>
                  </div>
                  <p className="flex-1 text-sm text-muted-foreground">{t.summary}</p>
                  <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-current text-reward" aria-hidden />
                      {t.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" aria-hidden />
                      {formatIndianNumber(t.installs)} installs
                    </span>
                    <span>{t.languages.length} languages</span>
                  </p>
                  <p
                    className={
                      missing
                        ? "text-xs text-warning-foreground dark:text-warning"
                        : "text-xs text-success"
                    }
                  >
                    {missing ? (
                      <span className="flex items-center gap-1">
                        <Plug className="size-3.5" /> Needs {missing} data source
                        {missing === 1 ? "" : "s"} you haven't connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> Works with your connected data
                      </span>
                    )}
                  </p>
                  <Button variant="outline" onClick={() => setOpen(t)}>
                    View details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.name}</DialogTitle>
                <DialogDescription>
                  {open.industry} · {open.category} · by {open.publisherName} · ★{" "}
                  {open.rating.toFixed(1)} · {formatIndianNumber(open.installs)} installs
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p>{open.summary}</p>
                <div>
                  <p className="mb-1 font-medium">What it does</p>
                  <ol className="list-decimal space-y-0.5 pl-5">
                    {open.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="mb-1 font-medium">Data it needs</p>
                  <ul className="space-y-1">
                    {open.metrics.map((m) => (
                      <li key={m.key} className="flex items-center justify-between gap-2">
                        <span>
                          {m.label} <code className="text-xs text-muted-foreground">{m.key}</code>
                        </span>
                        <StatusBadge tone={m.connected ? "success" : "warning"}>
                          {m.connected ? "Connected" : "Not connected"}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="rounded-md bg-muted p-3">⚖️ {open.fairness}</p>
                <p className="text-xs text-muted-foreground">
                  Messages available in: {open.languages.join(", ").toUpperCase()}
                </p>
              </div>
              <DialogFooter>
                {open.metrics.some((m) => !m.connected) && (
                  <Button variant="outline" asChild>
                    <a href="/connectors">Connect data first</a>
                  </Button>
                )}
                {!readOnly && (
                  <Button asChild>
                    <a href={`/workflows/new?template=${open.base}`}>Install as draft</a>
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
