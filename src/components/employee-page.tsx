import {
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  Download,
  Gift,
  Heart,
  IndianRupee,
  Languages,
  Loader2,
  LockKeyhole,
  Medal,
  MessageCircle,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Trophy,
  TriangleAlert,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
  badges,
  colleagues,
  me,
  pastRedemptions,
  pointActivity,
  recognitionsGiven,
  trackers,
} from "@/lib/employee-data";
import { formatIndianNumber, formatRupees } from "@/lib/format";
import { hasTranslation, useT } from "@/lib/i18n";
import {
  languageOptions,
  recognitions,
  rewardCategories,
  rewards,
  type Reward,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { type Redemption, useDemoStore } from "@/store/demo-store";

export type EmployeePageKind =
  "home" | "wallet" | "recognitions" | "tracking" | "rewards" | "shoutout" | "preferences";

export function EmployeePage({ kind }: { kind: EmployeePageKind }) {
  return (
    <>
      <LanguageFallbackNotice />
      {kind === "home" && <EmployeeHome />}
      {kind === "wallet" && <WalletPage />}
      {kind === "recognitions" && <RecognitionsPage />}
      {kind === "tracking" && <TrackingPage />}
      {kind === "rewards" && <RewardsPage />}
      {kind === "shoutout" && <ShoutoutPage />}
      {kind === "preferences" && <PreferencesPage />}
    </>
  );
}

function LanguageFallbackNotice() {
  const language = useAppStore((s) => s.language);
  const t = useT();
  if (hasTranslation(language)) return null;
  const name = languageOptions.find(([c]) => c === language)?.[1] ?? language;
  return (
    <p
      className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
      role="note"
    >
      {t("pref.fallback", { language: name })}
    </p>
  );
}

function InstallPrompt() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm lg:hidden">
      <Smartphone className="size-5 shrink-0 text-primary" />
      <span className="flex-1">
        Add Radha Krishna Mills Rewards to your home screen — works on slow networks.
      </span>
      <Button
        size="sm"
        onClick={() => {
          setDismissed(true);
          toast.success("Added to home screen");
        }}
      >
        <Download /> Install
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setDismissed(true)} aria-label="Dismiss">
        ✕
      </Button>
    </div>
  );
}

function EmployeeHome() {
  const t = useT();
  const points = useDemoStore((s) => s.employeePoints);
  return (
    <div className="space-y-8">
      <InstallPrompt />
      <PageHeading
        eyebrow={t("home.greeting", { name: me.firstName })}
        title={t("home.title")}
        description={t("home.desc")}
        action={
          <Button asChild>
            <a href="/me/redeem">
              <Gift />
              {t("home.redeem")}
            </a>
          </Button>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label={t("home.available")}
          value={formatIndianNumber(points)}
          detail={t("home.expiring", { points: me.expiring.points, date: me.expiring.date })}
          icon={Coins}
          reward
        />
        <StatCard
          label={t("home.recognitionsMonth")}
          value="3"
          detail={t("home.recognitionsDetail")}
          icon={Trophy}
        />
        <a href="/me/tracking" className="block">
          <StatCard
            label={t("home.milestone")}
            value="98.4%"
            detail={`${t("home.milestoneDetail")} · #3 / 18`}
            icon={Sparkles}
          />
        </a>
      </section>
      {me.expiring.points > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
          <span className="flex items-center gap-2">
            <Clock3 className="size-4 text-warning" />{" "}
            {t("home.expiring", { points: me.expiring.points, date: me.expiring.date })}
          </span>
          <Button size="sm" variant="outline" asChild>
            <a href="/me/redeem">{t("home.redeem")}</a>
          </Button>
        </div>
      )}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t("home.recent")}</h2>
          <Button variant="ghost" asChild>
            <a href="/me/recognitions">
              {t("home.viewAll")} <ChevronRight />
            </a>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {recognitions.map((item) => (
            <Card key={item.id} className="rounded-lg shadow-sm">
              <CardHeader>
                <div className="mb-3 grid size-10 place-items-center rounded-md bg-reward/10 text-reward">
                  <Medal className="size-5" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.message}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("home.from", { name: item.from })}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <StatusBadge tone="reward">{t("home.points", { points: item.points })}</StatusBadge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <a
        href="/me/shoutout"
        className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary"
      >
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Heart className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">{t("home.thank")}</span>
          <span className="block text-sm text-muted-foreground">{t("home.thankDesc")}</span>
        </span>
        <ChevronRight className="text-muted-foreground" />
      </a>
    </div>
  );
}

const statusFlow = ["requested", "hold", "ordered", "fulfilled"] as const;
const statusLabel: Record<Redemption["status"], string> = {
  requested: "Requested",
  hold: "Points on hold",
  ordered: "Ordered",
  fulfilled: "Fulfilled",
  failed: "Failed — points returned",
};

function StatusSteps({ status }: { status: Redemption["status"] }) {
  const reached = status === "failed" ? 2 : statusFlow.indexOf(status);
  return (
    <ol
      className="flex flex-wrap items-center gap-1 text-[11px]"
      aria-label={`Status: ${statusLabel[status]}`}
    >
      {statusFlow.map((s, i) => (
        <li key={s} className="flex items-center gap-1">
          <span
            className={cn(
              "rounded-full px-2 py-0.5",
              i <= reached ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
              status === "failed" && i === 2 && "bg-destructive/15 text-destructive",
            )}
          >
            {status === "failed" && i === 2 ? "Failed" : statusLabel[s]}
          </span>
          {i < statusFlow.length - 1 && (
            <ChevronRight className="size-3 text-muted-foreground" aria-hidden />
          )}
        </li>
      ))}
    </ol>
  );
}

function WalletPage() {
  const t = useT();
  const { employeePoints, redemptions } = useDemoStore();
  const held = redemptions
    .filter((r) => r.status === "hold" || r.status === "ordered")
    .reduce((s, r) => s + r.points, 0);
  const [open, setOpen] = useState<{
    title: string;
    code?: string | undefined;
    expiry: string;
  } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const history = [
    ...redemptions.map((r) => ({
      id: r.id,
      title: r.title,
      points: r.points,
      date: new Date(r.at).toLocaleDateString("en-GB"),
      status: r.status,
      code: r.code,
      expiry: "08/10/2027",
    })),
    ...pastRedemptions,
  ];
  return (
    <div className="space-y-8">
      <PageHeading
        title={t("wallet.title")}
        description={t("wallet.desc")}
        action={
          <Button asChild>
            <a href="/me/redeem">
              <Gift />
              {t("wallet.browse")}
            </a>
          </Button>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("wallet.coins")}
          value={formatIndianNumber(employeePoints)}
          detail={t("wallet.coinsDetail")}
          icon={WalletCards}
          reward
        />
        <StatCard
          label="Cash via payroll (INR)"
          value={formatRupees(me.cashViaPayroll)}
          detail="Paid with your October salary · taxable"
          icon={IndianRupee}
        />
        <StatCard
          label={t("wallet.held")}
          value={formatIndianNumber(held)}
          detail={t("wallet.heldDetail")}
          icon={LockKeyhole}
        />
        <StatCard
          label={t("wallet.expiring")}
          value={formatIndianNumber(me.expiring.points)}
          detail={`${me.expiring.date}`}
          icon={Clock3}
          reward
        />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>{t("wallet.history")}</CardTitle>
            <CardDescription>Requested → Points on hold → Ordered → Fulfilled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("wallet.noHistory")}</p>
            )}
            {history.map((r) => (
              <div key={r.id} className="space-y-2 rounded-md border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.id} · {r.date} · −{formatIndianNumber(r.points)} pts
                    </p>
                  </div>
                  {r.status === "fulfilled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRevealed(false);
                        setOpen({ title: r.title, code: r.code, expiry: r.expiry });
                      }}
                    >
                      View voucher
                    </Button>
                  )}
                </div>
                <StatusSteps status={r.status} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>{t("wallet.activity")}</CardTitle>
            <CardDescription>{t("wallet.activityDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {pointActivity.map((row) => (
              <div
                key={row.title + row.date}
                className="flex items-center justify-between border-b border-border py-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">{row.date}</p>
                </div>
                <p
                  className={cn(
                    "font-semibold",
                    row.value > 0
                      ? "text-success"
                      : row.kind === "expire"
                        ? "text-destructive"
                        : "",
                  )}
                >
                  {row.value > 0 ? "+" : "−"}
                  {formatIndianNumber(Math.abs(row.value))}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>Redemption detail · expires {open.expiry}</DialogDescription>
              </DialogHeader>
              {revealed ? (
                <div className="rounded-md border border-reward/30 bg-reward/10 p-4 text-center font-mono text-lg font-bold tracking-widest text-reward">
                  {open.code}
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    For your safety, the code is shown after a one-time password.
                  </p>
                  <Button
                    onClick={() => {
                      setRevealed(true);
                      toast.success("OTP verified");
                    }}
                  >
                    <ShieldCheck /> Verify OTP and reveal code
                  </Button>
                </div>
              )}
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                <li>Cannot be exchanged for cash or returned once revealed.</li>
                <li>Also sent to your WhatsApp ({me.mobile}).</li>
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecognitionsPage() {
  const t = useT();
  return (
    <div className="space-y-8">
      <PageHeading
        title={t("rec.title")}
        description={t("rec.desc")}
        action={
          <Button asChild>
            <a href="/me/shoutout">
              <Send />
              {t("rec.send")}
            </a>
          </Button>
        }
      />
      <section aria-labelledby="badges-heading" className="space-y-3">
        <h2 id="badges-heading" className="text-lg font-semibold">
          {t("rec.badges")}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {badges.map((b) => (
            <li
              key={b.name}
              className={cn(
                "rounded-lg border border-border p-4 text-center",
                b.locked && "opacity-60",
              )}
            >
              <span className="text-3xl" aria-hidden>
                {b.icon}
              </span>
              <p className="mt-2 text-sm font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground">
                {b.locked ? b.earned : `Earned ${b.earned}`}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">
            {t("rec.received")} ({recognitions.length})
          </TabsTrigger>
          <TabsTrigger value="given">
            {t("rec.given")} ({recognitionsGiven.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-5 grid gap-4 md:grid-cols-2">
          {recognitions.map((item) => (
            <Card key={item.id} className="rounded-lg">
              <CardHeader>
                <StatusBadge tone="reward">{t("home.points", { points: item.points })}</StatusBadge>
                <CardTitle className="pt-3 text-lg">{item.title}</CardTitle>
                <CardDescription>{item.message}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{t("home.from", { name: item.from })}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="given" className="mt-5 grid gap-4 md:grid-cols-2">
          {recognitionsGiven.map((g) => (
            <Card key={g.to + g.date} className="rounded-lg">
              <CardContent className="space-y-1 p-5">
                <p className="flex items-center gap-2 font-medium">
                  <Heart className="size-4 text-primary" /> To {g.to}
                </p>
                <p className="text-sm text-muted-foreground">“{g.message}”</p>
                <p className="text-xs text-muted-foreground">{g.date}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrackingPage() {
  const t = useT();
  return (
    <div className="space-y-8">
      <PageHeading title={t("track.title")} description={t("track.desc")} />
      <div className="rounded-lg border border-private/25 bg-private-surface p-4 text-private">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">{t("track.private")}</p>
            <p className="mt-1 text-sm">{t("track.privateDesc")}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {trackers.map((tr) => (
          <Card key={tr.workflow} className="rounded-lg">
            <CardHeader className="pb-3">
              <CardDescription>{tr.workflow}</CardDescription>
              <CardTitle className="text-base">{tr.metric}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">{t("track.yourValue")}</p>
                <p className="text-3xl font-bold">{tr.value}</p>
                <Progress
                  value={tr.progress}
                  className="mt-2"
                  aria-label={`${tr.metric} progress ${tr.progress}%`}
                />
              </div>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {t("track.rule")}
                </p>
                <p>{tr.rule}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>
                  <span className="text-muted-foreground">{t("track.rank")}: </span>
                  {tr.rank ? (
                    <span className="font-semibold">
                      #{tr.rank.position} / {tr.rank.of}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t("track.rankHidden")}</span>
                  )}
                </span>
                <StatusBadge tone={tr.daysLeft <= 3 ? "warning" : "neutral"}>
                  {t("track.timeLeft", { days: tr.daysLeft })}
                </StatusBadge>
              </div>
              {tr.rankNote && <p className="text-xs text-muted-foreground">{tr.rankNote}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

type Stage = "detail" | "confirm" | "otp" | "processing" | "success" | "failed";
type Sort = "popular" | "low" | "new";
const DEMO_OTP = "246810";

function RewardsPage() {
  const t = useT();
  const { employeePoints, addRedemption, updateRedemption } = useDemoStore();
  const [category, setCategory] = useState<string>("all");
  const [delivery, setDelivery] = useState("all");
  const [maxPoints, setMaxPoints] = useState("all");
  const [sort, setSort] = useState<Sort>("popular");
  const [selected, setSelected] = useState<Reward | null>(null);
  const [stage, setStage] = useState<Stage>("detail");
  const [channel, setChannel] = useState("WhatsApp");
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState(0);
  const [retried, setRetried] = useState(false);
  const locked = attempts >= 3;

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const items = useMemo(
    () =>
      rewards
        .filter(
          (r) =>
            (category === "all" || r.category === category) &&
            (delivery === "all" || r.delivery === delivery) &&
            (maxPoints === "all" || r.points <= Number(maxPoints)),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.points - b.points
            : sort === "new"
              ? Number(Boolean(b.isNew)) - Number(Boolean(a.isNew))
              : b.popularity - a.popularity,
        ),
    [category, delivery, maxPoints, sort],
  );

  const open = (reward: Reward) => {
    setSelected(reward);
    setStage("detail");
    setOtp("");
    setAttempts(0);
    setRating(0);
    setRetried(false);
  };

  const process = (reward: Reward, isRetry: boolean) => {
    const id = `ord-${Math.floor(1100 + Math.random() * 800)}`;
    setOrderId(id);
    setStage("processing");
    addRedemption({
      id,
      itemId: reward.id,
      title: reward.title,
      points: reward.points,
      value: reward.value,
      status: "hold",
      at: Date.now(),
    });
    window.setTimeout(() => updateRedemption(id, { status: "ordered" }), 900);
    window.setTimeout(() => {
      // Demo: the fuel provider fails on the first try so the failure path can be shown.
      if (reward.id === "fuel-1000" && !isRetry) {
        updateRedemption(id, { status: "failed" });
        setStage("failed");
      } else {
        updateRedemption(id, {
          status: "fulfilled",
          code: `${reward.brand.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        });
        setStage("success");
      }
    }, 2200);
  };

  const verify = () => {
    if (!selected) return;
    if (otp === DEMO_OTP) process(selected, false);
    else {
      setAttempts((a) => a + 1);
      setOtp("");
    }
  };

  const taxAfter = selected ? me.nonCashThisYear + selected.value : 0;
  const expiry = (r: Reward) =>
    r.validityMonths ? `Valid ${r.validityMonths} months from today` : "No expiry";
  const close = () => setSelected(null);

  return (
    <div className="space-y-6">
      <PageHeading
        title={t("shop.title")}
        description={t("shop.desc", { points: formatIndianNumber(employeePoints) })}
      />
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Category">
          {["all", ...rewardCategories].map((c) => (
            <Button
              key={c}
              variant={category === c ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c === "all" ? t("shop.all") : c}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <Select value={maxPoints} onValueChange={setMaxPoints}>
            <SelectTrigger className="sm:w-44" aria-label="Filter by points">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any points</SelectItem>
              <SelectItem value="300">Up to 300 pts</SelectItem>
              <SelectItem value="500">Up to 500 pts</SelectItem>
              <SelectItem value={String(employeePoints)}>I can afford</SelectItem>
            </SelectContent>
          </Select>
          <Select value={delivery} onValueChange={setDelivery}>
            <SelectTrigger className="sm:w-44" aria-label="Filter by delivery type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any delivery</SelectItem>
              {["Code", "Link", "Physical", "UPI", "Payroll"].map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="sm:w-44" aria-label={t("shop.sort")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="low">Points: low to high</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {items.length === 0 ? (
        <Card className="rounded-lg border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No rewards match these filters.
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((reward) => (
            <Card key={reward.id} className="overflow-hidden rounded-lg">
              <div
                className="relative grid h-28 place-items-center bg-reward/10"
                role="img"
                aria-label={`${reward.brand} logo`}
              >
                <div className="grid size-14 place-items-center rounded-lg bg-reward text-lg font-bold text-reward-foreground">
                  {reward.accent}
                </div>
                {reward.isNew && (
                  <span className="absolute left-3 top-3">
                    <StatusBadge tone="success">New</StatusBadge>
                  </span>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardDescription>{reward.brand}</CardDescription>
                    <CardTitle className="mt-1 text-base">{reward.title}</CardTitle>
                  </div>
                  <StatusBadge tone="reward">{formatIndianNumber(reward.points)} pts</StatusBadge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-muted px-2 py-1">
                    {formatRupees(reward.value)} value
                  </span>
                  <span className="rounded-md bg-muted px-2 py-1">Delivery: {reward.delivery}</span>
                  <span className="rounded-md bg-muted px-2 py-1">{reward.taxNature}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => open(reward)}
                  disabled={reward.points > employeePoints}
                >
                  {reward.points > employeePoints
                    ? `Need ${formatIndianNumber(reward.points - employeePoints)} more pts`
                    : t("shop.view")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(o) => !o && stage !== "processing" && close()}
      >
        <DialogContent className={cn(stage === "success" && "sm:max-w-md")}>
          {selected && stage === "detail" && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.brand} · {formatIndianNumber(selected.points)} pts ·{" "}
                  {formatRupees(selected.value)} face value
                </DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border p-3">
                  <dt className="text-xs text-muted-foreground">Delivery</dt>
                  <dd className="font-medium">{selected.delivery}</dd>
                </div>
                <div className="rounded-md border border-border p-3">
                  <dt className="text-xs text-muted-foreground">Validity</dt>
                  <dd className="font-medium">{expiry(selected)}</dd>
                </div>
              </dl>
              <div className="rounded-md border border-border bg-muted p-3 text-sm">
                <p className="font-medium">Tax nature: {selected.taxNature}</p>
                <p className="mt-1 text-muted-foreground">
                  {selected.taxNature === "Non-cash gift" &&
                    "Counts towards the ₹ 15,000 yearly gift limit. Above it, the extra is taxable."}
                  {selected.taxNature === "Cash equivalent" &&
                    "Treated like salary: the full amount is taxable and shows in your payslip."}
                  {selected.taxNature === "Meal voucher" &&
                    "Meal vouchers have their own tax exemption, separate from gifts."}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Terms & conditions</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {selected.terms.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button onClick={() => setStage("confirm")}>Redeem</Button>
              </DialogFooter>
            </>
          )}
          {selected && stage === "confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Redeem {formatIndianNumber(selected.points)} points for {selected.brand}{" "}
                  {formatRupees(selected.value)}?
                </DialogTitle>
                <DialogDescription>
                  Balance after: {formatIndianNumber(employeePoints - selected.points)} points
                </DialogDescription>
              </DialogHeader>
              {selected.taxNature === "Non-cash gift" && taxAfter > 15000 && (
                <p className="flex gap-2 rounded-md bg-warning/10 p-3 text-sm">
                  <TriangleAlert className="size-4 shrink-0 text-warning" /> This takes your gifts
                  this year to {formatRupees(taxAfter)}, above ₹ 15,000.{" "}
                  {formatRupees(taxAfter - 15000)} will be taxable.
                </p>
              )}
              {selected.taxNature === "Cash equivalent" && (
                <p className="flex gap-2 rounded-md bg-warning/10 p-3 text-sm">
                  <TriangleAlert className="size-4 shrink-0 text-warning" /> Cash is fully taxable.
                  It will appear in your next payslip.
                </p>
              )}
              <div className="space-y-1.5">
                <Label>Send it to me on</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger aria-label="Delivery channel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp ({me.mobile})</SelectItem>
                    <SelectItem value="In-app">In the app only</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStage("detail")}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    setStage("otp");
                    setResendIn(30);
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </>
          )}
          {stage === "otp" && (
            <>
              <DialogHeader>
                <DialogTitle>Enter the OTP</DialogTitle>
                <DialogDescription>
                  We sent a 6-digit code to your registered WhatsApp {me.mobile}. Demo code:{" "}
                  {DEMO_OTP}
                </DialogDescription>
              </DialogHeader>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={locked}
                aria-label="One-time password"
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPSlot key={index} index={index} className="size-11" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {attempts > 0 && !locked && (
                <p role="alert" className="text-sm text-destructive">
                  That code did not match. {3 - attempts} attempt{3 - attempts === 1 ? "" : "s"}{" "}
                  left.
                </p>
              )}
              {locked && (
                <p role="alert" className="text-sm text-destructive">
                  Too many wrong codes. Redemption is locked for 30 minutes. Your points are safe.
                </p>
              )}
              <div className="flex items-center justify-between">
                <Button
                  variant="link"
                  className="px-0"
                  disabled={resendIn > 0 || locked}
                  onClick={() => {
                    setResendIn(30);
                    toast.success("New code sent");
                  }}
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button onClick={verify} disabled={otp.length !== 6 || locked}>
                  Verify and redeem
                </Button>
              </DialogFooter>
            </>
          )}
          {selected && stage === "processing" && (
            <div className="space-y-4 py-6 text-center" role="status" aria-live="polite">
              <Loader2 className="mx-auto size-10 animate-spin text-primary" />
              <DialogTitle>Processing your order…</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {formatIndianNumber(selected.points)} points are on hold in your wallet while we
                place the order with {selected.brand}.
              </p>
              <p className="text-xs text-muted-foreground">Order {orderId}</p>
            </div>
          )}
          {selected && stage === "failed" && (
            <div className="space-y-4 py-4 text-center" role="alert">
              <XCircle className="mx-auto size-12 text-destructive" />
              <DialogTitle>Order failed. Points returned.</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selected.brand} could not issue the card right now. Your{" "}
                {formatIndianNumber(selected.points)} points are back in your wallet.
              </p>
              <p className="text-xs text-muted-foreground">
                Need help? WhatsApp HR on +91 98400 11223 · order {orderId}
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={close}>
                  Close
                </Button>
                <Button
                  disabled={retried}
                  onClick={() => {
                    setRetried(true);
                    process(selected, true);
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
          {selected && stage === "success" && (
            <div className="space-y-4 py-2 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-9" />
              </div>
              <DialogTitle className="text-xl">
                🎉 Redemption successful! Your voucher is on the way.
              </DialogTitle>
              <DialogDescription>
                Sent to you via {channel}. The link is protected by an OTP. {expiry(selected)}.
              </DialogDescription>
              {selected.delivery === "Code" || selected.delivery === "Link" ? (
                <div className="rounded-md border border-reward/30 bg-reward/10 p-4 font-mono text-lg font-bold tracking-widest text-reward">
                  {useDemoStore.getState().redemptions.find((r) => r.id === orderId)?.code ?? "—"}
                </div>
              ) : (
                <p className="rounded-md bg-muted p-3 text-sm">
                  {selected.delivery === "UPI"
                    ? "Money will reach your UPI ID within 2 working days."
                    : "Collect it from HR at your location within 7 days."}
                </p>
              )}
              <div>
                <p className="text-sm">Rate your experience (optional)</p>
                <div
                  className="mt-1 flex justify-center gap-1"
                  role="radiogroup"
                  aria-label="Rating"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      className="grid size-11 place-items-center"
                      onClick={() => {
                        setRating(n);
                        updateRedemption(orderId, { rating: n });
                      }}
                    >
                      <Star
                        className={cn(
                          "size-6",
                          n <= rating ? "fill-reward text-reward" : "text-muted-foreground",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" asChild>
                  <a href="/me/wallet">See redemption history</a>
                </Button>
                <Button onClick={close}>Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShoutoutPage() {
  const t = useT();
  const [colleague, setColleague] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const tooShort = message.trim().length > 0 && message.trim().length < 10;
  if (sent)
    return (
      <div className="mx-auto max-w-xl py-16 text-center" role="status">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
          <Heart className="size-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">{t("shout.sent", { name: sent })}</h1>
        <p className="mt-2 text-muted-foreground">They'll see it in the app and on WhatsApp.</p>
        <Button
          className="mt-6"
          onClick={() => {
            setSent(null);
            setColleague("");
            setMessage("");
          }}
        >
          {t("shout.send")}
        </Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeading title={t("shout.title")} description={t("shout.desc")} />
      <Card className="rounded-lg">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="colleague">{t("shout.colleague")}</Label>
            <Select value={colleague} onValueChange={setColleague}>
              <SelectTrigger id="colleague">
                <SelectValue placeholder="Choose a colleague" />
              </SelectTrigger>
              <SelectContent>
                {colleagues.map((c) => (
                  <SelectItem key={c.code} value={c.name}>
                    {c.name} · {c.team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">{t("shout.what")}</Label>
            <Textarea
              id="reason"
              className="min-h-28"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 280))}
              placeholder="Stepped in to help our line finish the Diwali order on time."
              aria-invalid={tooShort}
              aria-describedby="reason-help"
            />
            <p
              id="reason-help"
              className={cn("text-xs", tooShort ? "text-destructive" : "text-muted-foreground")}
            >
              {tooShort
                ? "Say a little more about what they did (at least 10 characters)."
                : `${message.length}/280 · Specific thanks mean more.`}
            </p>
          </div>
          <Button
            className="h-11 w-full"
            disabled={!colleague || message.trim().length < 10}
            onClick={() => setSent(colleague)}
          >
            <Send />
            {t("shout.send")}
          </Button>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="size-4 text-success" /> On WhatsApp, send: THANKS @name reason
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferencesPage() {
  const t = useT();
  const { language, setLanguage } = useAppStore();
  const [whatsapp, setWhatsapp] = useState(true);
  const [email, setEmail] = useState(false);
  const [quiet, setQuiet] = useState(true);
  const [quietFrom, setQuietFrom] = useState("21:00");
  const [quietTo, setQuietTo] = useState("08:00");
  return (
    <div className="space-y-8">
      <PageHeading title={t("pref.title")} description={t("pref.desc")} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="size-5" />
              {t("pref.language")}
            </CardTitle>
            <CardDescription>Used in the app, WhatsApp messages and AI answers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value);
                toast.success(
                  useAppStore.getState().language === value ? t("pref.saved") : "Saved",
                );
              }}
            >
              <SelectTrigger aria-label={t("pref.language")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name} {hasTranslation(code) ? "" : "· partial"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="size-5" />
              Notifications
            </CardTitle>
            <CardDescription>Choose how we contact you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              title="WhatsApp messages"
              description={
                whatsapp
                  ? "Opted in on 12/06/2026 · reply STOP to opt out"
                  : "Opted out — you won't get WhatsApp messages"
              }
              checked={whatsapp}
              onChange={(v) => {
                setWhatsapp(v);
                toast.success(
                  v
                    ? "WhatsApp opt-in saved"
                    : "You've opted out of WhatsApp. Messages stop immediately.",
                );
              }}
            />
            <ToggleRow
              title="Email summaries"
              description="A weekly overview every Monday"
              checked={email}
              onChange={setEmail}
            />
            <ToggleRow
              title="Quiet hours"
              description="No messages during these hours"
              checked={quiet}
              onChange={setQuiet}
            />
            {quiet && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["From", quietFrom, setQuietFrom],
                  ["To", quietTo, setQuietTo],
                ].map(([label, value, set]) => (
                  <div key={label as string} className="space-y-1">
                    <Label className="text-xs">{label as string}</Label>
                    <Select value={value as string} onValueChange={set as (v: string) => void}>
                      <SelectTrigger aria-label={`Quiet hours ${label as string}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["06:00", "07:00", "08:00", "20:00", "21:00", "22:00"].map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Evidence uploads</CardTitle>
            <CardDescription>
              Use your camera when a form asks for a photo as evidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted">
              <Camera className="size-4" /> Open camera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={() => toast.success("Photo saved")}
              />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}
