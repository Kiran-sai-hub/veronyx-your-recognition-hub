import { CalendarHeart, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { campaigns as initialCampaigns, festivals, type Campaign } from "@/lib/phase3-data";

const tone = {
  draft: "neutral",
  scheduled: "warning",
  live: "success",
  ended: "neutral",
} as const;

export function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>(initialCampaigns);
  const [open, setOpen] = useState(false);
  const [festival, setFestival] = useState("Diwali");
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("50000");
  const amount = Number(budget);
  const valid = name.trim().length > 2 && Number.isFinite(amount) && amount > 0;

  const create = () => {
    setItems((list) => [
      {
        id: `c${list.length + 1}`,
        name: name.trim(),
        festival,
        start: "—",
        end: "—",
        budget: amount,
        status: "draft",
        audience: "Everyone",
      },
      ...list,
    ]);
    setOpen(false);
    setName("");
    toast.success("Campaign saved as draft. Nothing is sent until you schedule it.");
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Engagement"
        title="Campaigns"
        description="Run festival and theme campaigns with their own budget and dates."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New campaign
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="grid size-9 place-items-center rounded-md bg-reward/10 text-reward">
                  <CalendarHeart className="size-5" />
                </div>
                <StatusBadge tone={tone[c.status]}>{c.status}</StatusBadge>
              </div>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.festival} · {c.audience}
                </p>
              </div>
              <p className="text-2xl font-bold">{formatRupees(c.budget)}</p>
              <p className="text-xs text-muted-foreground">
                {c.start} to {c.end}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Festival calendar</h2>
        <div className="flex flex-wrap gap-2">
          {festivals.map((f) => (
            <button
              key={f.name}
              type="button"
              onClick={() => {
                setFestival(f.name);
                setName(`${f.name} recognition`);
                setOpen(true);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              {f.name} <span className="text-muted-foreground">· {f.month}</span>
            </button>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label>Festival or theme</Label>
              <Select value={festival} onValueChange={setFestival}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {festivals.map((f) => (
                    <SelectItem key={f.name} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom theme">Custom theme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-budget">Budget (₹)</Label>
              <Input
                id="c-budget"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
              />
              <p className="text-xs text-muted-foreground">
                Taken from the org pool only when you schedule it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!valid} onClick={create}>
              Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
