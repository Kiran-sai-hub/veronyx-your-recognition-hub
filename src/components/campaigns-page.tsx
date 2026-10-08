import { Cake, CalendarHeart, Medal, PartyPopper, Plus } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
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
import { DateRangePicker, formatDmy } from "@/components/library/date-picker";
import { SearchableSelect } from "@/components/library/multi-select";
import { formatRupees } from "@/lib/format";
import {
  campaignAudiences,
  campaigns as initialCampaigns,
  campaignTemplates,
  campaignTypeLabel,
  festivals,
  longServiceMilestones,
  upcomingMoments,
  type Campaign,
  type CampaignType,
} from "@/lib/phase3-data";

const tone = {
  draft: "neutral",
  scheduled: "warning",
  live: "success",
  ended: "neutral",
} as const;

const typeIcon = {
  festival: PartyPopper,
  birthday: Cake,
  anniversary: CalendarHeart,
  long_service: Medal,
} as const;

/** Organisation pool remaining — campaigns draw from it when scheduled. */
const ORG_REMAINING = 218600;

/** H-06 Campaign Manager: festivals, birthdays, anniversaries and long-service awards. */
export function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>(initialCampaigns);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CampaignType>("festival");
  const [festival, setFestival] = useState("Diwali");
  const [name, setName] = useState("");
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 9, 20),
    to: new Date(2026, 9, 27),
  });
  const [audience, setAudience] = useState<string[]>(["everyone"]);
  const [reward, setReward] = useState("300");
  const [template, setTemplate] = useState(campaignTemplates.festival[0] ?? "");

  const alwaysOn = type !== "festival";
  const chosen = campaignAudiences.filter((a) => audience.includes(a.id));
  const audienceRow = audience.includes("everyone")
    ? campaignAudiences[0]
    : {
        id: audience.join("+"),
        label: chosen.map((a) => a.label).join(" + ") || "Nobody",
        people: Math.min(
          199,
          chosen.reduce((sum, a) => sum + a.people, 0),
        ),
      };
  // Always-on campaigns are estimated for the next 12 months (about 1 in 12 people per month).
  const recipients = alwaysOn
    ? type === "long_service"
      ? 6
      : Math.round((audienceRow?.people ?? 0) * (type === "birthday" ? 1 : 0.85))
    : (audienceRow?.people ?? 0);
  const perPerson = Number(reward);
  const budget = recipients * (Number.isFinite(perPerson) ? perPerson : 0);
  const committed = items
    .filter((c) => c.status === "scheduled" || c.status === "live")
    .reduce((sum, c) => sum + c.budget, 0);
  const remaining = ORG_REMAINING - committed;
  const errors = [
    name.trim().length < 3 && "Give the campaign a name.",
    !(perPerson > 0) && "Enter a reward per person.",
    !alwaysOn && (!range?.from || !range.to) && "Choose start and end dates.",
    audience.length === 0 && "Choose who the campaign is for.",
    budget > remaining &&
      `Insufficient budget. Remaining: ${formatRupees(remaining)}. Required: ${formatRupees(budget)}.`,
  ].filter(Boolean) as string[];

  const openNew = (t: CampaignType, fest = "Diwali") => {
    setType(t);
    setFestival(fest);
    setName(t === "festival" ? `${fest} recognition` : campaignTypeLabel[t]);
    setReward(
      t === "long_service"
        ? "5000"
        : t === "birthday"
          ? "250"
          : t === "anniversary"
            ? "500"
            : "300",
    );
    setTemplate(campaignTemplates[t][0] ?? "");
    setOpen(true);
  };

  const create = (status: Campaign["status"]) => {
    setItems((list) => [
      {
        id: `c${list.length + 1}`,
        type,
        name: name.trim(),
        festival: type === "festival" ? festival : "—",
        start: alwaysOn ? "Always on" : formatDmy(range?.from),
        end: alwaysOn ? "" : formatDmy(range?.to),
        rewardPerPerson: perPerson,
        recipients,
        budget,
        status,
        audience: audienceRow?.label ?? "Everyone",
        template,
      },
      ...list,
    ]);
    setOpen(false);
    toast.success(
      status === "draft"
        ? "Campaign saved as draft. Nothing is sent until you schedule it."
        : `Scheduled. ${formatRupees(budget)} reserved from the organisation pool.`,
    );
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Rewards & Catalogue"
        title="Campaign manager"
        description="Festivals, birthdays, work anniversaries and long-service awards — each with its own dates, audience, reward and message."
        action={
          <Button onClick={() => openNew("festival")}>
            <Plus className="size-4" /> New campaign
          </Button>
        }
      />

      <p className="text-sm text-muted-foreground">
        Organisation pool: {formatRupees(ORG_REMAINING)} left · {formatRupees(committed)} reserved
        by scheduled and live campaigns.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => {
          const Icon = typeIcon[c.type];
          return (
            <Card key={c.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid size-9 place-items-center rounded-md bg-reward/10 text-reward">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <StatusBadge tone={tone[c.status]}>{c.status}</StatusBadge>
                </div>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {campaignTypeLabel[c.type]}
                    {c.type === "festival" && ` · ${c.festival}`} · {c.audience}
                  </p>
                </div>
                <p className="text-2xl font-bold">{formatRupees(c.budget)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRupees(c.rewardPerPerson)} × {c.recipients} people ·{" "}
                  {c.end ? `${c.start} to ${c.end}` : `${c.start} (on each person's date)`}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{c.template}</p>
                {c.status === "draft" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (c.budget > remaining) {
                        toast.error(
                          `Insufficient budget. Remaining: ${formatRupees(remaining)}. Required: ${formatRupees(c.budget)}.`,
                        );
                        return;
                      }
                      setItems((list) =>
                        list.map((x) => (x.id === c.id ? { ...x, status: "scheduled" } : x)),
                      );
                      toast.success(`${c.name} scheduled.`);
                    }}
                  >
                    Schedule
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coming up in the next 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border text-sm">
              {upcomingMoments.map((m) => (
                <li key={m.name + m.date} className="flex justify-between gap-2 py-2">
                  <span>
                    {m.name} <span className="text-muted-foreground">· {m.kind}</span>
                  </span>
                  <span className="text-muted-foreground">{m.date}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Birthdays are used only for people who shared them in their profile.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start a campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["birthday", "anniversary", "long_service"] as const).map((t) => {
                const Icon = typeIcon[t];
                return (
                  <Button key={t} variant="outline" onClick={() => openNew(t)}>
                    <Icon className="size-4" /> {campaignTypeLabel[t]}
                  </Button>
                );
              })}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Festival calendar</p>
              <div className="flex flex-wrap gap-2">
                {festivals.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => openNew("festival", f.name)}
                    className="min-h-9 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    {f.name} <span className="text-muted-foreground">· {f.month}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New campaign</DialogTitle>
            <DialogDescription>
              Nothing is sent and no budget is used until you schedule it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  const t = v as CampaignType;
                  setType(t);
                  setTemplate(campaignTemplates[t][0] ?? "");
                }}
              >
                <SelectTrigger id="c-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(campaignTypeLabel) as CampaignType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {campaignTypeLabel[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {type === "festival" && (
              <div className="space-y-2">
                <Label htmlFor="c-festival">Festival or theme</Label>
                <Select value={festival} onValueChange={setFestival}>
                  <SelectTrigger id="c-festival">
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
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-name">Name</Label>
              <Input
                id="c-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
            </div>
            {type === "festival" ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="c-range">Dates</Label>
                <DateRangePicker id="c-range" value={range} onChange={setRange} />
              </div>
            ) : (
              <p className="rounded-md bg-muted p-3 text-sm sm:col-span-2">
                Always on — runs automatically on each person’s{" "}
                {type === "birthday"
                  ? "birthday"
                  : type === "anniversary"
                    ? "joining anniversary"
                    : `service milestone (${longServiceMilestones.map((m) => `${m.years} yrs ${formatRupees(m.reward)}`).join(", ")})`}
                .
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="c-audience">Audience</Label>
              <SearchableSelect
                id="c-audience"
                multiple
                value={audience}
                onChange={(v) =>
                  setAudience(
                    v.includes("everyone") && !audience.includes("everyone")
                      ? ["everyone"]
                      : v.filter((x) => x !== "everyone" || v.length === 1),
                  )
                }
                groups={[
                  {
                    label: "Whole company",
                    options: [{ value: "everyone", label: "Everyone (199)" }],
                  },
                  {
                    label: "Departments",
                    options: campaignAudiences
                      .filter((a) =>
                        ["manufacturing", "quality", "sales", "operations"].includes(a.id),
                      )
                      .map((a) => ({ value: a.id, label: `${a.label} (${a.people})` })),
                  },
                  {
                    label: "Locations",
                    options: campaignAudiences
                      .filter((a) => a.id === "coimbatore")
                      .map((a) => ({ value: a.id, label: `${a.label} (${a.people})` })),
                  },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-reward">Reward per person (₹)</Label>
              <Input
                id="c-reward"
                inputMode="numeric"
                value={reward}
                onChange={(e) => setReward(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="c-template">Message template</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger id="c-template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {campaignTemplates[type].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Sent in each person’s language (English, தமிழ், हिन्दी) on WhatsApp and in the app.
              </p>
            </div>
            <p className="rounded-md border border-border p-3 text-sm sm:col-span-2">
              Budget: {formatRupees(perPerson || 0)} × {recipients} people
              {alwaysOn ? " (next 12 months)" : ""} = <b>{formatRupees(budget)}</b> · organisation
              pool has {formatRupees(remaining)} free.
            </p>
            {errors.length > 0 && (
              <ul className="text-sm text-destructive sm:col-span-2" role="alert">
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              disabled={name.trim().length < 3}
              onClick={() => create("draft")}
            >
              Save draft
            </Button>
            <Button
              disabled={errors.length > 0}
              onClick={() => create(alwaysOn ? "live" : "scheduled")}
            >
              {alwaysOn ? "Turn on" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
