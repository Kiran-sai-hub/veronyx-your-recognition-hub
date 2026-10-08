import { Gift, PackageX, Pencil, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRupees } from "@/lib/format";
import { catalogueItems, redemptionOrders, type RedemptionOrder } from "@/lib/phase2-data";

const orderTone: Record<RedemptionOrder["status"], "success" | "neutral" | "error" | "warning"> = {
  Delivered: "success",
  Processing: "neutral",
  Failed: "error",
  Refunded: "warning",
};

export function AdminRewardsPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [retried, setRetried] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Rewards"
        title="Rewards & catalogue"
        description="Manage what people can redeem and track every order."
        action={
          <Button
            onClick={() => {
              setSaved(false);
              setEditOpen(true);
            }}
          >
            <Plus /> Add item
          </Button>
        }
      />

      <Tabs defaultValue="catalogue">
        <TabsList>
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
          <TabsTrigger value="orders">Redemption orders</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogue" className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalogueItems.map((item) => (
              <Card key={item.id} className="rounded-lg shadow-sm">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid size-10 place-items-center rounded-md bg-reward/10 font-semibold text-reward">
                      {item.brand.slice(0, 2)}
                    </div>
                    {item.stock === 0 ? (
                      <StatusBadge tone="error">
                        <PackageX className="size-3.5" /> Out of stock
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="success">Live</StatusBadge>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.brand} · {item.category} · {item.taxNature}
                    </p>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold text-reward">{item.points} pts</span>
                    <span className="text-muted-foreground"> · {formatRupees(item.value)}</span>
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSaved(false);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil /> Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="rounded-lg border-dashed shadow-sm">
            <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Record an offline reward</p>
                <p className="text-sm text-muted-foreground">
                  Gave a gift in person, like a Diwali sweet box? Log it here so tax tracking stays
                  correct.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSaved(false);
                  setOfflineOpen(true);
                }}
              >
                <Gift /> Record offline reward
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card className="rounded-lg shadow-sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-4 font-medium">Order</th>
                    <th className="p-4 font-medium">Employee</th>
                    <th className="hidden p-4 font-medium md:table-cell">Item</th>
                    <th className="hidden p-4 font-medium lg:table-cell">Tax nature</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptionOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-mono text-xs">{order.id}</td>
                      <td className="p-4">
                        {order.employee}
                        <span className="block text-xs text-muted-foreground">
                          {order.code} · {order.date}
                        </span>
                      </td>
                      <td className="hidden p-4 md:table-cell">{order.item}</td>
                      <td className="hidden p-4 lg:table-cell text-muted-foreground">
                        {order.taxNature}
                      </td>
                      <td className="p-4">
                        <StatusBadge tone={orderTone[order.status]}>{order.status}</StatusBadge>
                        {order.note && (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {order.note}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {order.status === "Failed" && !retried.includes(order.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRetried((r) => [...r, order.id])}
                          >
                            <RotateCcw /> Retry
                          </Button>
                        )}
                        {order.status === "Failed" && retried.includes(order.id) && (
                          <StatusBadge tone="neutral">Retry requested</StatusBadge>
                        )}
                        {order.status === "Failed" && (
                          <Button size="sm" variant="ghost" className="ml-2">
                            Refund points
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catalogue item</DialogTitle>
            <DialogDescription>Changes apply to the employee reward catalogue.</DialogDescription>
          </DialogHeader>
          {saved ? (
            <div className="space-y-4 text-center">
              <p className="font-semibold text-success">Item saved.</p>
              <Button onClick={() => setEditOpen(false)}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-title">Title</Label>
                <Input id="item-title" defaultValue="Amazon shopping voucher" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="item-points">Points</Label>
                  <Input id="item-points" type="number" defaultValue={500} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-value">Value (₹)</Label>
                  <Input id="item-value" type="number" defaultValue={500} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-tax">Tax nature</Label>
                <Select defaultValue="Non-cash gift">
                  <SelectTrigger id="item-tax">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non-cash gift">Non-cash gift</SelectItem>
                    <SelectItem value="Cash equivalent">Cash equivalent</SelectItem>
                    <SelectItem value="Meal voucher">Meal voucher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setSaved(true)}>Save item</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={offlineOpen} onOpenChange={setOfflineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record an offline reward</DialogTitle>
            <DialogDescription>
              This adds to the person's non-cash total for the ₹15,000 yearly gift limit.
            </DialogDescription>
          </DialogHeader>
          {saved ? (
            <div className="space-y-4 text-center">
              <p className="font-semibold text-success">Offline reward recorded.</p>
              <Button onClick={() => setOfflineOpen(false)}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="offline-emp">Employee code</Label>
                <Input id="offline-emp" placeholder="RKM0001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offline-what">What was given</Label>
                <Input id="offline-what" placeholder="Diwali sweet box" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offline-value">Value (₹)</Label>
                <Input id="offline-value" type="number" placeholder="500" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOfflineOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setSaved(true)}>Record reward</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
