import { Gift, PackageX, Pencil, Plus, RotateCcw, Search, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatRupees } from "@/lib/format";
import { employees, rewardCategories } from "@/lib/mock-data";
import {
  catalogueItems as initialItems,
  offlineRewards as initialOffline,
  orderStatuses,
  redemptionOrders as initialOrders,
  rewardProviders,
  taxNatureLabel,
  taxNatures,
  type CatalogueItem,
  type OfflineReward,
  type OrderStatus,
  type RedemptionOrder,
  type TaxNature,
} from "@/lib/phase2-data";
import { cn } from "@/lib/utils";

const statusTone: Record<OrderStatus, "success" | "neutral" | "error" | "warning"> = {
  Requested: "neutral",
  Hold: "warning",
  Ordered: "neutral",
  Fulfilled: "success",
  Failed: "error",
};

const blankItem: CatalogueItem = {
  id: "",
  title: "",
  brand: "",
  provider: "Xoxoday",
  sku: "",
  denominations: [500],
  points: 500,
  value: 500,
  category: "Ecommerce",
  taxNature: "perquisite_noncash",
  delivery: "Code",
  stock: null,
  active: true,
};

/**
 * R-01 catalogue, R-02 add/edit item, R-04 redemption status and R-05 offline rewards.
 * Managers get the team view from checklist §1.3: read-only catalogue and their team's orders.
 */
export function AdminRewardsPage({
  readOnly = false,
  team,
  emptyOrg = false,
}: {
  readOnly?: boolean;
  /** Restrict orders to this team (manager view). */
  team?: string | undefined;
  emptyOrg?: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [orders, setOrders] = useState(initialOrders);
  const [offline, setOffline] = useState(initialOffline);
  const [editing, setEditing] = useState<CatalogueItem | null>(null);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [provider, setProvider] = useState("all");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const visibleItems = emptyOrg
    ? []
    : items.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          (provider === "all" || item.provider === provider) &&
          `${item.title} ${item.brand} ${item.sku}`.toLowerCase().includes(query.toLowerCase()),
      );
  const grouped = rewardCategories
    .map((cat) => ({ cat, list: visibleItems.filter((item) => item.category === cat) }))
    .filter((group) => group.list.length > 0);
  const scopedOrders = (emptyOrg ? [] : orders).filter(
    (o) => (!team || o.team === team) && (statusFilter === "all" || o.status === statusFilter),
  );

  const updateOrder = (id: string, patch: Partial<RedemptionOrder>) =>
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  const saveItem = (item: CatalogueItem) => {
    if (item.id) {
      setItems((list) => list.map((i) => (i.id === item.id ? item : i)));
      toast.success(`${item.title} updated in the employee catalogue.`);
    } else {
      setItems((list) => [{ ...item, id: `item-${list.length + 1}` }, ...list]);
      toast.success(`${item.title} added to the employee catalogue.`);
    }
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Rewards & Catalogue"
        title={team ? `Rewards · ${team}` : "Catalogue & orders"}
        description={
          team
            ? "What your team can redeem, and the status of their orders."
            : "Manage what people can redeem, track every order and record rewards given offline."
        }
        action={
          !readOnly && (
            <Button onClick={() => setEditing({ ...blankItem })}>
              <Plus /> Add item
            </Button>
          )
        }
      />

      <Tabs defaultValue="catalogue">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
          <TabsTrigger value="orders">Redemption status</TabsTrigger>
          {!readOnly && <TabsTrigger value="offline">Offline rewards</TabsTrigger>}
        </TabsList>

        <TabsContent value="catalogue" className="mt-6 space-y-6">
          {!emptyOrg && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search item, brand or SKU"
                  aria-label="Search catalogue"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-44" aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {rewardCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="w-full sm:w-44" aria-label="Provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  {rewardProviders.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {emptyOrg ? (
            <EmptyState
              illustration="retail"
              title="No rewards configured. Add items or connect an aggregator."
              action={
                !readOnly && (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => setEditing({ ...blankItem })}>
                      <Plus /> Add item
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/settings?tab=integrations">Connect an aggregator</a>
                    </Button>
                  </div>
                )
              }
            />
          ) : grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items match these filters.</p>
          ) : (
            grouped.map((group) => (
              <section key={group.cat} aria-labelledby={`cat-${group.cat}`} className="space-y-3">
                <h2 id={`cat-${group.cat}`} className="font-semibold">
                  {group.cat}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    · {group.list.length}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.list.map((item) => (
                    <Card
                      key={item.id}
                      className={cn("rounded-lg shadow-sm", !item.active && "opacity-70")}
                    >
                      <CardContent className="space-y-3 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="grid size-10 place-items-center rounded-md bg-reward/10 font-semibold text-reward">
                            {item.brand.slice(0, 2)}
                          </div>
                          {item.stock === 0 ? (
                            <StatusBadge tone="error">
                              <PackageX className="size-3.5" /> Out of stock
                            </StatusBadge>
                          ) : item.active ? (
                            <StatusBadge tone="success">Live</StatusBadge>
                          ) : (
                            <StatusBadge>Hidden</StatusBadge>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.provider} · SKU{" "}
                            <span className="font-mono text-xs">{item.sku}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.denominations.map((d) => formatRupees(d)).join(" / ")} ·{" "}
                            <code>{item.taxNature}</code>
                            {item.stock !== null && item.stock > 0 && ` · ${item.stock} in stock`}
                          </p>
                        </div>
                        <p className="text-sm">
                          <span className="font-semibold text-reward">{item.points} pts</span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {formatRupees(item.value)}
                          </span>
                        </p>
                        {!readOnly && (
                          <Button size="sm" variant="outline" onClick={() => setEditing(item)}>
                            <Pencil /> Edit
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-6 space-y-4">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter by status"
          >
            {["all", ...orderStatuses].map((s) => {
              const count =
                s === "all"
                  ? scopedOrders.length
                  : (emptyOrg ? [] : orders).filter(
                      (o) => (!team || o.team === team) && o.status === s,
                    ).length;
              return (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "default" : "outline"}
                  onClick={() => setStatusFilter(s)}
                  aria-pressed={statusFilter === s}
                >
                  {s === "all" ? "All" : s}{" "}
                  {s !== "all" && <span className="opacity-70">{count}</span>}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Requested → Hold (points held) → Ordered (sent to provider) → Fulfilled or Failed.
            Failed orders keep the points held until you retry or refund.
          </p>
          {scopedOrders.length === 0 ? (
            <EmptyState illustration="inbox" title="No orders with this status." />
          ) : (
            <ul className="space-y-3">
              {scopedOrders.map((order) => (
                <li key={order.id}>
                  <Card className="rounded-lg shadow-sm">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium">
                          {order.item}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            · {order.points} pts
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.employee} ({order.code}) · {order.team} · {order.date} ·{" "}
                          <span className="font-mono text-xs">{order.id}</span>
                        </p>
                        <ol className="flex flex-wrap gap-x-1 text-xs" aria-label="Order progress">
                          {(
                            [
                              "Requested",
                              "Hold",
                              "Ordered",
                              order.status === "Failed" ? "Failed" : "Fulfilled",
                            ] as OrderStatus[]
                          ).map((s, i, arr) => {
                            const reached =
                              orderStatuses.indexOf(order.status) >= orderStatuses.indexOf(s) ||
                              (order.status === "Failed" && s !== "Fulfilled");
                            return (
                              <li
                                key={s}
                                className={cn(
                                  reached ? "font-medium" : "text-muted-foreground",
                                  s === "Failed" && "text-destructive",
                                )}
                              >
                                {s}
                                {i < arr.length - 1 ? " →" : ""}
                              </li>
                            );
                          })}
                        </ol>
                        {order.note && (
                          <p className="text-xs text-muted-foreground">{order.note}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={order.refunded ? "warning" : statusTone[order.status]}>
                          {order.refunded ? "Failed · refunded" : order.status}
                        </StatusBadge>
                        {!readOnly && order.status === "Failed" && !order.refunded && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                updateOrder(order.id, {
                                  status: "Ordered",
                                  note: "Retried with the provider — waiting for the code.",
                                });
                                toast.success(`${order.id} sent to the provider again.`);
                              }}
                            >
                              <RotateCcw /> Retry
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                updateOrder(order.id, {
                                  refunded: true,
                                  note: `${order.points} points returned to ${order.employee}'s wallet.`,
                                });
                                toast.success(
                                  `${order.points} points returned to ${order.employee}.`,
                                );
                              }}
                            >
                              <Undo2 /> Refund points
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {!readOnly && (
          <TabsContent value="offline" className="mt-6 space-y-4">
            <Card className="rounded-lg border-dashed shadow-sm">
              <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Record an offline reward</p>
                  <p className="text-sm text-muted-foreground">
                    Gave cash or a gift in person, like a Diwali sweet box? Log it so the yearly
                    gift limit and payroll stay correct.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setOfflineOpen(true)}>
                  <Gift /> Record offline reward
                </Button>
              </CardContent>
            </Card>
            <ul className="space-y-2">
              {offline.map((o) => (
                <li key={o.id} className="rounded-lg border border-border p-4 text-sm">
                  <p className="font-medium">
                    {o.what} · {formatRupees(o.value)}{" "}
                    <code className="text-xs font-normal">{o.taxNature}</code>
                  </p>
                  <p className="text-muted-foreground">
                    {o.employee} ({o.code}) · given {o.date} · recorded by {o.by}
                  </p>
                  <p className="text-muted-foreground">Reason: {o.reason}</p>
                </li>
              ))}
            </ul>
          </TabsContent>
        )}
      </Tabs>

      {editing && <ItemDialog item={editing} onClose={() => setEditing(null)} onSave={saveItem} />}
      {offlineOpen && (
        <OfflineDialog
          onClose={() => setOfflineOpen(false)}
          onSave={(record) => {
            setOffline((list) => [record, ...list]);
            setOfflineOpen(false);
            toast.success(
              `Recorded. ${formatRupees(record.value)} added to ${record.code}'s yearly gift total.`,
            );
          }}
        />
      )}
    </div>
  );
}

function ItemDialog({
  item,
  onClose,
  onSave,
}: {
  item: CatalogueItem;
  onClose: () => void;
  onSave: (item: CatalogueItem) => void;
}) {
  const [draft, setDraft] = useState(item);
  const [denoms, setDenoms] = useState(item.denominations.join(", "));
  const set = <K extends keyof CatalogueItem>(key: K, value: CatalogueItem[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const parsed = denoms
    .split(",")
    .map((d) => Number(d.trim()))
    .filter((d) => Number.isFinite(d) && d > 0);
  const errors = [
    !draft.title.trim() && "Add a title.",
    !draft.sku.trim() && "Add the provider SKU.",
    parsed.length === 0 && "Add at least one denomination in rupees.",
  ].filter(Boolean) as string[];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.id ? "Edit catalogue item" : "Add catalogue item"}</DialogTitle>
          <DialogDescription>Changes apply to the employee reward catalogue.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="item-title">Title</Label>
              <Input
                id="item-title"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Amazon Pay e-gift card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-brand">Brand</Label>
              <Input
                id="item-brand"
                value={draft.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder="Amazon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-provider">Provider</Label>
              <Select value={draft.provider} onValueChange={(v) => set("provider", v)}>
                <SelectTrigger id="item-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rewardProviders.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-sku">Provider SKU</Label>
              <Input
                id="item-sku"
                className="font-mono"
                value={draft.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="AMZ-500-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id="item-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rewardCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-tax">Tax nature</Label>
              <Select
                value={draft.taxNature}
                onValueChange={(v) => set("taxNature", v as TaxNature)}
              >
                <SelectTrigger id="item-tax">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taxNatures.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n} — {taxNatureLabel[n]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="item-denoms">Denominations (₹, comma separated)</Label>
              <Input
                id="item-denoms"
                value={denoms}
                onChange={(e) => setDenoms(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-points">Points for the lowest value</Label>
              <Input
                id="item-points"
                type="number"
                min={1}
                value={draft.points}
                onChange={(e) => set("points", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-stock">Stock (blank = unlimited)</Label>
              <Input
                id="item-stock"
                type="number"
                min={0}
                value={draft.stock ?? ""}
                onChange={(e) =>
                  set("stock", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <Label htmlFor="item-active">Show in the employee catalogue</Label>
            <Switch
              id="item-active"
              checked={draft.active}
              onCheckedChange={(v) => set("active", v)}
            />
          </div>
          {errors.length > 0 && (
            <ul className="text-sm text-destructive" role="alert">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={errors.length > 0}
            onClick={() => onSave({ ...draft, denominations: parsed, value: Math.min(...parsed) })}
          >
            Save item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OfflineDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (record: OfflineReward) => void;
}) {
  const [code, setCode] = useState("");
  const [what, setWhat] = useState("");
  const [value, setValue] = useState("");
  const [nature, setNature] = useState<TaxNature>("perquisite_noncash");
  const [date, setDate] = useState("2026-10-08");
  const [reason, setReason] = useState("");
  const person = employees.find((e) => e.code === code.trim().toUpperCase());
  const valid = person && what.trim() && Number(value) > 0 && reason.trim().length >= 5 && date;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record an offline reward</DialogTitle>
          <DialogDescription>
            Counts towards the person’s ₹15,000 yearly gift limit and appears in the payroll export.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="offline-emp">Employee code</Label>
            <Input
              id="offline-emp"
              placeholder="RKM0001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {code.trim() && (
              <p className={cn("text-xs", person ? "text-muted-foreground" : "text-destructive")}>
                {person ? `${person.name} · ${person.team}` : "No employee with this code."}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="offline-date">Date given</Label>
            <Input
              id="offline-date"
              type="date"
              value={date}
              max="2026-10-08"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="offline-what">What was given</Label>
            <Input
              id="offline-what"
              placeholder="Diwali sweet box"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offline-value">Value (₹)</Label>
            <Input
              id="offline-value"
              type="number"
              min={1}
              placeholder="500"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offline-nature">Tax nature</Label>
            <Select value={nature} onValueChange={(v) => setNature(v as TaxNature)}>
              <SelectTrigger id="offline-nature">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taxNatures.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="offline-reason">Reason</Label>
            <Textarea
              id="offline-reason"
              placeholder="e.g. Helped clear the Diwali backlog on Line B"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const [y = "", m = "", d = ""] = date.split("-");
              onSave({
                id: `off-${Date.now()}`,
                employee: person?.name ?? code.trim().toUpperCase(),
                code: code.trim().toUpperCase(),
                what: what.trim(),
                value: Number(value),
                taxNature: nature,
                date: `${d}/${m}/${y}`,
                reason: reason.trim(),
                by: "You",
              });
            }}
          >
            Record reward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
