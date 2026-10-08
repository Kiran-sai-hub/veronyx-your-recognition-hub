import {
  ArrowRightLeft,
  CalendarClock,
  IndianRupee,
  PlusCircle,
  SlidersHorizontal,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatRupees } from "@/lib/format";
import {
  BUDGET_TODAY,
  budgetPools as initialPools,
  checkBudgetMove,
  forecastPool,
  ledgerEntries as initialLedger,
  pointExpiries,
  poolBurn,
  poolRemaining,
  type BudgetPool,
  type LedgerEntry,
} from "@/lib/phase2-data";
import { cn } from "@/lib/utils";

const fmtDate = (d: Date) => d.toLocaleDateString("en-GB");
const todayText = fmtDate(BUDGET_TODAY);

/** Month-by-month projected balance for one pool, from today to its expiry. */
function projection(pool: BudgetPool) {
  const burn = poolBurn[pool.id] ?? 0;
  const [d = 1, m = 1, y = 2027] = pool.expires.split("/").map(Number);
  const expiry = new Date(y, m - 1, d);
  const points: { month: string; balance: number }[] = [];
  let balance = poolRemaining(pool);
  const cursor = new Date(BUDGET_TODAY);
  for (let i = 0; i < 12 && cursor <= expiry; i++) {
    points.push({
      month: cursor.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      balance: Math.max(0, Math.round(balance)),
    });
    balance -= burn;
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return points;
}

/**
 * H-04 Budget & Wallets: organisation → department → manager allocations, top-ups, expiries,
 * moves and per-pool forecasting. Managers see only their own wallet (checklist §1.3).
 */
export function BudgetPage({ ownPoolId }: { ownPoolId?: string | undefined }) {
  const [pools, setPools] = useState(initialPools);
  const [ledger, setLedger] = useState(initialLedger);
  const [dialog, setDialog] = useState<null | "move" | "topup" | "allocate">(null);
  const [fromId, setFromId] = useState("pool-quality");
  const [toId, setToId] = useState("pool-mfg-b");
  const [amount, setAmount] = useState("5000");
  const [topupId, setTopupId] = useState("pool-org");
  const [topupAmount, setTopupAmount] = useState("50000");
  const [topupNote, setTopupNote] = useState("Diwali release approved by MD");
  const [alloc, setAlloc] = useState<Record<string, string>>({});
  const [forecastId, setForecastId] = useState(ownPoolId ?? "pool-org");
  const [ledgerType, setLedgerType] = useState("all");

  const org = pools.find((p) => p.level === "Organisation") ?? pools[0];
  const departments = pools.filter((p) => p.level === "Department");
  const managersOf = (id: string) => pools.filter((p) => p.parent === id);
  const own = ownPoolId ? pools.find((p) => p.id === ownPoolId) : undefined;
  const scopedPools = own ? [own] : pools;
  const fromPool = pools.find((pool) => pool.id === fromId) ?? pools[0];
  const toPool = pools.find((pool) => pool.id === toId) ?? pools[1];
  const check =
    fromPool && toPool
      ? checkBudgetMove(fromPool, toPool, Number(amount))
      : ({ ok: false, reason: "Choose two pools." } as const);

  const addLedger = (entry: Omit<LedgerEntry, "id" | "date">) =>
    setLedger((l) => [{ ...entry, id: `le-${Date.now()}`, date: todayText }, ...l]);

  const warnings = scopedPools
    .map((pool) => ({ pool, forecast: forecastPool(pool, poolBurn[pool.id] ?? 0) }))
    .filter(
      ({ forecast, pool }) =>
        forecast.runsOutEarly || (forecast.unspentAtExpiry > 0 && pool.level === "Manager"),
    );

  const deptAllocTotal = departments.reduce(
    (sum, d) => sum + Number(alloc[d.id] ?? d.allocated),
    0,
  );
  const allocError =
    org && deptAllocTotal > org.allocated
      ? `Departments add up to ${formatRupees(deptAllocTotal)} — more than the ${formatRupees(org.allocated)} yearly pool.`
      : departments.some((d) => Number(alloc[d.id] ?? d.allocated) < d.spent)
        ? "A department can't be given less than it has already spent."
        : null;

  const forecastPoolSel = pools.find((p) => p.id === forecastId) ?? org;
  const chart = forecastPoolSel ? projection(forecastPoolSel) : [];
  const selForecast = forecastPoolSel
    ? forecastPool(forecastPoolSel, poolBurn[forecastPoolSel.id] ?? 0)
    : null;

  const poolRow = (pool: BudgetPool, depth: number) => {
    const remaining = poolRemaining(pool);
    const used = Math.round((pool.spent / pool.allocated) * 100);
    const exhausted = remaining <= 0;
    const forecast = forecastPool(pool, poolBurn[pool.id] ?? 0);
    return (
      <Card
        key={pool.id}
        className={cn("rounded-lg shadow-sm", depth === 1 && "sm:ml-6", depth === 2 && "sm:ml-12")}
      >
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium">
              {pool.name}
              <span className="ml-2 text-xs font-normal text-muted-foreground">{pool.level}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatRupees(pool.spent)} spent of {formatRupees(pool.allocated)} · expires{" "}
              {pool.expires}
            </p>
            <p
              className={cn(
                "mt-1 text-xs",
                forecast.runsOutEarly ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {exhausted
                ? "Used up — new rewards from this pool are queued."
                : forecast.runsOutEarly && forecast.runOut
                  ? `At the current pace this runs out around ${fmtDate(forecast.runOut)}, before it expires.`
                  : forecast.unspentAtExpiry > 0
                    ? `At the current pace about ${formatRupees(forecast.unspentAtExpiry)} will be unspent on ${pool.expires}.`
                    : "On track to be used by its expiry date."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-28">
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.min(used, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${pool.name} used`}
              >
                <div
                  className={exhausted ? "h-full bg-destructive" : "h-full bg-primary"}
                  style={{ width: `${Math.min(used, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{used}% used</p>
            </div>
            {exhausted ? (
              <StatusBadge tone="error">Used up</StatusBadge>
            ) : (
              <StatusBadge tone="success">{formatRupees(remaining)} left</StatusBadge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Budget & Ledger"
        title={own ? "My budget" : "Budget & wallets"}
        description={
          own
            ? "Your team's reward pool, how fast it is being used and when it expires."
            : "Every rupee from the company pool down to each manager. Budget only moves when you confirm it."
        }
        action={
          !own && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setDialog("topup")}>
                <PlusCircle /> Top up
              </Button>
              <Button variant="outline" onClick={() => setDialog("allocate")}>
                <SlidersHorizontal /> Allocate to departments
              </Button>
              <Button onClick={() => setDialog("move")}>
                <ArrowRightLeft /> Move budget
              </Button>
            </div>
          )
        }
      />

      {own ? (
        <section className="grid gap-4 sm:grid-cols-3" aria-label="My wallet">
          <StatCard
            label="Left in my pool"
            value={formatRupees(poolRemaining(own))}
            detail={`of ${formatRupees(own.allocated)} · expires ${own.expires}`}
            icon={Wallet}
            reward
          />
          <StatCard
            label="Spent so far"
            value={formatRupees(own.spent)}
            detail={`${Math.round((own.spent / own.allocated) * 100)}% used`}
            icon={IndianRupee}
          />
          <StatCard
            label="Monthly pace"
            value={formatRupees(poolBurn[own.id] ?? 0)}
            detail="Average of the last 3 months"
            icon={TrendingUp}
          />
        </section>
      ) : (
        org && (
          <section className="grid gap-4 sm:grid-cols-3" aria-label="Budget summary">
            <StatCard
              label="Yearly pool"
              value={formatRupees(org.allocated)}
              detail="April 2026 – March 2027"
              icon={Wallet}
            />
            <StatCard
              label="Spent so far"
              value={formatRupees(org.spent)}
              detail={`${Math.round((org.spent / org.allocated) * 100)}% of the yearly pool`}
              icon={IndianRupee}
            />
            <StatCard
              label="Left to spend"
              value={formatRupees(poolRemaining(org))}
              detail="Across all departments"
              icon={TrendingUp}
              reward
            />
          </section>
        )
      )}

      {warnings.length > 0 && (
        <section aria-label="Forecast alerts" className="space-y-2">
          {warnings.map(({ pool, forecast }) => (
            <div
              key={pool.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 text-sm",
                forecast.runsOutEarly
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-warning/30 bg-warning/10",
              )}
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <p>
                <b>{pool.name}</b>{" "}
                {poolRemaining(pool) <= 0
                  ? "is used up. New rewards are queued until it is topped up."
                  : forecast.runsOutEarly && forecast.runOut
                    ? `will run out around ${fmtDate(forecast.runOut)} — before it expires on ${pool.expires}.`
                    : `will have about ${formatRupees(forecast.unspentAtExpiry)} unspent when it expires on ${pool.expires}.`}
              </p>
            </div>
          ))}
        </section>
      )}

      <section aria-labelledby="pools-heading">
        <h2 id="pools-heading" className="mb-4 text-lg font-semibold">
          {own ? "My pool" : "Organisation → department → manager"}
        </h2>
        <div className="space-y-3">
          {own
            ? poolRow(own, 0)
            : org && (
                <>
                  {poolRow(org, 0)}
                  {departments.map((dept) => (
                    <div key={dept.id} className="space-y-3">
                      {poolRow(dept, 1)}
                      {managersOf(dept.id).map((mgr) => poolRow(mgr, 2))}
                    </div>
                  ))}
                </>
              )}
        </div>
      </section>

      <section aria-labelledby="forecast-heading">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle id="forecast-heading" className="text-base">
                Budget forecast
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Projected balance at the current monthly pace (
                {formatRupees(poolBurn[forecastId] ?? 0)}/month).{" "}
                {selForecast?.runsOutEarly && selForecast.runOut
                  ? `Runs out around ${fmtDate(selForecast.runOut)}.`
                  : `About ${formatRupees(selForecast?.unspentAtExpiry ?? 0)} left at expiry.`}
              </p>
            </div>
            {!own && (
              <Select value={forecastId} onValueChange={setForecastId}>
                <SelectTrigger className="w-full sm:w-64" aria-label="Pool to forecast">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pools.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip formatter={(v) => formatRupees(Number(v))} />
                <ReferenceLine y={0} stroke="var(--color-destructive)" />
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Projected balance"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="expiry-heading">
        <h2 id="expiry-heading" className="mb-4 text-lg font-semibold">
          Upcoming expiries
        </h2>
        <Card className="rounded-lg shadow-sm">
          <CardContent className="divide-y divide-border p-0 text-sm">
            {scopedPools
              .filter((p) => p.level !== "Organisation" || !own)
              .filter((p) => p.expires !== "31/03/2027" || p.level === "Organisation")
              .map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-muted-foreground" />
                    {p.name} pool
                  </span>
                  <span className="text-muted-foreground">
                    {formatRupees(Math.max(0, poolRemaining(p)))} left · expires {p.expires}
                  </span>
                </div>
              ))}
            {!own &&
              pointExpiries.map((e) => (
                <div
                  key={e.label}
                  className="flex flex-wrap items-center justify-between gap-2 p-4"
                >
                  <span className="flex items-center gap-2">
                    <CalendarClock className="size-4 text-muted-foreground" />
                    {e.label}
                  </span>
                  <span className="text-muted-foreground">
                    {e.points.toLocaleString("en-IN")} points · {e.people} people · {e.date}
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() =>
                        toast.success(
                          `Reminder sent to ${e.people} people to redeem before ${e.date}.`,
                        )
                      }
                    >
                      Remind
                    </Button>
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="ledger-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="ledger-heading" className="text-lg font-semibold">
            Ledger
          </h2>
          <Select value={ledgerType} onValueChange={setLedgerType}>
            <SelectTrigger className="w-44" aria-label="Ledger entry type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entries</SelectItem>
              {["Allocation", "Top-up", "Reward", "Move", "Expiry"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Card className="rounded-lg shadow-sm">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Pool</th>
                  <th className="p-4 text-right font-medium">Amount</th>
                  <th className="p-4 font-medium">By / reason</th>
                </tr>
              </thead>
              <tbody>
                {ledger
                  .filter((e) => ledgerType === "all" || e.type === ledgerType)
                  .filter((e) => !own || e.pool.includes(own.name))
                  .map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-0">
                      <td className="p-4">{entry.date}</td>
                      <td className="p-4">
                        <StatusBadge
                          tone={
                            entry.type === "Reward" || entry.type === "Expiry"
                              ? "neutral"
                              : entry.type === "Move"
                                ? "warning"
                                : "success"
                          }
                        >
                          {entry.type}
                        </StatusBadge>
                      </td>
                      <td className="p-4">{entry.pool}</td>
                      <td className="p-4 text-right font-mono">
                        {entry.amount > 0 ? "+" : ""}
                        {formatRupees(entry.amount)}
                      </td>
                      <td className="p-4 text-muted-foreground">{entry.by}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <Dialog open={dialog === "move"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move budget</DialogTitle>
            <DialogDescription>
              This only happens after you confirm. Both pools are updated together.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <PoolSelect
              id="move-from"
              label="From pool"
              value={fromId}
              onChange={setFromId}
              pools={pools}
            />
            <PoolSelect
              id="move-to"
              label="To pool"
              value={toId}
              onChange={setToId}
              pools={pools}
            />
            <div className="space-y-2">
              <Label htmlFor="move-amount">Amount (₹)</Label>
              <Input
                id="move-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {check.ok ? (
              <p className="rounded-md bg-muted p-3 text-sm">
                After the move: {fromPool?.name} will have {formatRupees(check.fromAfter)} left,{" "}
                {toPool?.name} will have {formatRupees(check.toAfter)}.
              </p>
            ) : (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {check.reason}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              disabled={!check.ok}
              onClick={() => {
                const value = Number(amount);
                setPools((list) =>
                  list.map((p) =>
                    p.id === fromId
                      ? { ...p, allocated: p.allocated - value }
                      : p.id === toId
                        ? { ...p, allocated: p.allocated + value }
                        : p,
                  ),
                );
                addLedger({
                  type: "Move",
                  pool: `${fromPool?.name} → ${toPool?.name}`,
                  amount: value,
                  by: "You",
                });
                toast.success(
                  `Moved ${formatRupees(value)} from ${fromPool?.name} to ${toPool?.name}.`,
                );
                setDialog(null);
              }}
            >
              Confirm move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "topup"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top up a pool</DialogTitle>
            <DialogDescription>
              Adds new money. A department or manager top-up is taken from its parent pool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <PoolSelect
              id="topup-pool"
              label="Pool"
              value={topupId}
              onChange={setTopupId}
              pools={pools}
            />
            <div className="space-y-2">
              <Label htmlFor="topup-amount">Amount (₹)</Label>
              <Input
                id="topup-amount"
                type="number"
                min={1}
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topup-note">Reason</Label>
              <Input
                id="topup-note"
                value={topupNote}
                onChange={(e) => setTopupNote(e.target.value)}
              />
            </div>
            {(() => {
              const target = pools.find((p) => p.id === topupId);
              const parent = target?.parent ? pools.find((p) => p.id === target.parent) : undefined;
              const value = Number(topupAmount);
              if (!(value > 0))
                return (
                  <p className="text-sm text-destructive">Enter an amount greater than zero.</p>
                );
              if (parent && value > poolRemaining(parent))
                return (
                  <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    Insufficient budget. Remaining: {formatRupees(poolRemaining(parent))}. Required:{" "}
                    {formatRupees(value)}.
                  </p>
                );
              return (
                <p className="rounded-md bg-muted p-3 text-sm">
                  {target?.name} goes to{" "}
                  {formatRupees((target ? poolRemaining(target) : 0) + value)} left
                  {parent ? `, taken from ${parent.name}` : " — new money for the year"}.
                </p>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              disabled={(() => {
                const target = pools.find((p) => p.id === topupId);
                const parent = target?.parent
                  ? pools.find((p) => p.id === target.parent)
                  : undefined;
                const value = Number(topupAmount);
                return (
                  !(value > 0) || !topupNote.trim() || (!!parent && value > poolRemaining(parent))
                );
              })()}
              onClick={() => {
                const value = Number(topupAmount);
                const target = pools.find((p) => p.id === topupId);
                setPools((list) =>
                  list.map((p) =>
                    p.id === topupId ? { ...p, allocated: p.allocated + value } : p,
                  ),
                );
                addLedger({
                  type: "Top-up",
                  pool: target?.name ?? "",
                  amount: value,
                  by: topupNote.trim(),
                });
                toast.success(`${target?.name} topped up by ${formatRupees(value)}.`);
                setDialog(null);
              }}
            >
              Confirm top-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "allocate"} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate to departments</DialogTitle>
            <DialogDescription>
              Split the {formatRupees(org?.allocated ?? 0)} yearly pool between departments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {departments.map((d) => (
              <div key={d.id} className="grid grid-cols-[1fr_9rem] items-center gap-3">
                <Label htmlFor={`alloc-${d.id}`}>
                  {d.name}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {formatRupees(d.spent)} already spent
                  </span>
                </Label>
                <Input
                  id={`alloc-${d.id}`}
                  type="number"
                  min={0}
                  value={alloc[d.id] ?? String(d.allocated)}
                  onChange={(e) => setAlloc((a) => ({ ...a, [d.id]: e.target.value }))}
                />
              </div>
            ))}
            <p className="text-sm">
              Allocated {formatRupees(deptAllocTotal)} of {formatRupees(org?.allocated ?? 0)} ·
              unallocated {formatRupees(Math.max(0, (org?.allocated ?? 0) - deptAllocTotal))}
            </p>
            {allocError && (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {allocError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              disabled={!!allocError}
              onClick={() => {
                setPools((list) =>
                  list.map((p) =>
                    p.level === "Department" && alloc[p.id] !== undefined
                      ? { ...p, allocated: Number(alloc[p.id]) }
                      : p,
                  ),
                );
                departments.forEach((d) => {
                  const next = Number(alloc[d.id] ?? d.allocated);
                  if (next !== d.allocated)
                    addLedger({
                      type: "Allocation",
                      pool: d.name,
                      amount: next - d.allocated,
                      by: "You",
                    });
                });
                setAlloc({});
                toast.success("Department allocations saved.");
                setDialog(null);
              }}
            >
              Save allocations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PoolSelect({
  id,
  label,
  value,
  onChange,
  pools,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  pools: BudgetPool[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pools.map((pool) => (
            <SelectItem key={pool.id} value={pool.id}>
              {pool.name} · {formatRupees(poolRemaining(pool))} left
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
