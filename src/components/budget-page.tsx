import { ArrowRightLeft, IndianRupee, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
  budgetPools,
  burnForecast,
  checkBudgetMove,
  ledgerEntries,
  poolRemaining,
} from "@/lib/phase2-data";

export function BudgetPage() {
  const [moveOpen, setMoveOpen] = useState(false);
  const [fromId, setFromId] = useState("pool-quality");
  const [toId, setToId] = useState("pool-mfg-b");
  const [amount, setAmount] = useState("5000");
  const [moved, setMoved] = useState<string | null>(null);

  const fromPool = budgetPools.find((pool) => pool.id === fromId) ?? budgetPools[0]!;
  const toPool = budgetPools.find((pool) => pool.id === toId) ?? budgetPools[1]!;
  const check = checkBudgetMove(fromPool, toPool, Number(amount));

  const totalAllocated = budgetPools.find((p) => p.level === "Organisation")?.allocated ?? 0;
  const totalSpent = budgetPools.find((p) => p.level === "Organisation")?.spent ?? 0;

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Money"
        title="Budget & ledger"
        description="See every rupee from the company pool down to each manager. Budget only moves when you confirm it."
        action={
          <Button onClick={() => setMoveOpen(true)}>
            <ArrowRightLeft /> Move budget
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Budget summary">
        <StatCard
          label="Yearly pool"
          value={formatRupees(totalAllocated)}
          detail="April 2026 – March 2027"
          icon={Wallet}
        />
        <StatCard
          label="Spent so far"
          value={formatRupees(totalSpent)}
          detail={`${Math.round((totalSpent / totalAllocated) * 100)}% of the yearly pool`}
          icon={IndianRupee}
        />
        <StatCard
          label="Left to spend"
          value={formatRupees(totalAllocated - totalSpent)}
          detail="Across all departments"
          icon={TrendingUp}
          reward
        />
      </section>

      <section aria-label="Budget pools">
        <h2 className="mb-4 text-lg font-semibold">Pools</h2>
        <div className="space-y-3">
          {budgetPools.map((pool) => {
            const remaining = poolRemaining(pool);
            const used = Math.round((pool.spent / pool.allocated) * 100);
            const exhausted = remaining <= 0;
            return (
              <Card key={pool.id} className="rounded-lg shadow-sm">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {pool.name}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {pool.level}
                        {pool.parent
                          ? ` · under ${budgetPools.find((p) => p.id === pool.parent)?.name}`
                          : ""}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatRupees(pool.spent)} spent of {formatRupees(pool.allocated)} · expires{" "}
                      {pool.expires}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
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
          })}
        </div>
      </section>

      <section aria-label="Burn forecast">
        <Card className="rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Burn forecast</CardTitle>
            <p className="text-sm text-muted-foreground">
              At the current pace the yearly pool lasts until March 2027.
            </p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burnForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="actual"
                  name="Actual spend"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="forecast"
                  name="Forecast"
                  fill="var(--color-chart-3)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Ledger">
        <h2 className="mb-4 text-lg font-semibold">Ledger</h2>
        <Card className="rounded-lg shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Pool</th>
                  <th className="p-4 text-right font-medium">Amount</th>
                  <th className="hidden p-4 font-medium sm:table-cell">By</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
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
                    <td className="hidden p-4 text-muted-foreground sm:table-cell">{entry.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move budget</DialogTitle>
            <DialogDescription>
              This only happens after you confirm. Both pools are updated together.
            </DialogDescription>
          </DialogHeader>
          {moved ? (
            <div className="space-y-4 text-center">
              <p className="font-semibold text-success">{moved}</p>
              <Button
                onClick={() => {
                  setMoved(null);
                  setMoveOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="move-from">From pool</Label>
                <Select value={fromId} onValueChange={setFromId}>
                  <SelectTrigger id="move-from">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="move-to">To pool</Label>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger id="move-to">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  After the move: {fromPool.name} will have {formatRupees(check.fromAfter)} left,{" "}
                  {toPool.name} will have {formatRupees(check.toAfter)}.
                </p>
              ) : (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {check.reason}
                </p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setMoveOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!check.ok}
                  onClick={() =>
                    setMoved(
                      `Moved ${formatRupees(Number(amount))} from ${fromPool.name} to ${toPool.name}.`,
                    )
                  }
                >
                  Confirm move
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
