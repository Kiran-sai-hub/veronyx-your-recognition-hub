import {
  Camera,
  ChevronRight,
  Clock3,
  Coins,
  Gift,
  Heart,
  Languages,
  LockKeyhole,
  Medal,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  languageOptions,
  recognitions,
  rewards,
  trackingMetrics,
  type Reward,
} from "@/lib/mock-data";
import { formatRupees } from "@/lib/format";
import { useAppStore } from "@/store/app-store";

export type EmployeePageKind =
  "home" | "wallet" | "recognitions" | "tracking" | "rewards" | "shoutout" | "preferences";

export function EmployeePage({ kind }: { kind: EmployeePageKind }) {
  if (kind === "home") return <EmployeeHome />;
  if (kind === "wallet") return <WalletPage />;
  if (kind === "recognitions") return <RecognitionsPage />;
  if (kind === "tracking") return <TrackingPage />;
  if (kind === "rewards") return <RewardsPage />;
  if (kind === "shoutout") return <ShoutoutPage />;
  return <PreferencesPage />;
}

function EmployeeHome() {
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Good morning, Priya"
        title="Your work is making a difference"
        description="Here is your recognition and rewards update for October."
        action={
          <Button asChild>
            <a href="/me/redeem">
              <Gift />
              Redeem points
            </a>
          </Button>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Available points"
          value="1,850"
          detail="250 points expire on 31/12/2026"
          icon={Coins}
          reward
        />
        <StatCard
          label="Recognitions this month"
          value="3"
          detail="Two more than September"
          icon={Trophy}
        />
        <StatCard
          label="Current milestone"
          value="92%"
          detail="Quality champion target"
          icon={Sparkles}
        />
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent recognition</h2>
          <Button variant="ghost" asChild>
            <a href="/me/recognitions">
              View all <ChevronRight />
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
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.message}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">From {item.from}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <StatusBadge tone="reward">+{item.points} points</StatusBadge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function WalletPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="My wallet"
        description="See your available points, upcoming expiries and past activity."
        action={
          <Button asChild>
            <a href="/me/redeem">
              <Gift />
              Browse rewards
            </a>
          </Button>
        }
      />
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Available"
          value="1,850"
          detail="Ready to redeem"
          icon={WalletCards}
          reward
        />
        <StatCard
          label="Expiring soon"
          value="250"
          detail="Expires 31/12/2026"
          icon={Clock3}
          reward
        />
        <StatCard
          label="Earned this year"
          value="3,425"
          detail="Across 12 recognitions"
          icon={Trophy}
        />
      </section>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Point activity</CardTitle>
          <CardDescription>Latest credits and redemptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            { title: "Quality champion", date: "06/10/2026", value: "+250" },
            { title: "Swiggy meal voucher", date: "02/10/2026", value: "−300" },
            { title: "Perfect attendance", date: "01/10/2026", value: "+300" },
          ].map((row) => (
            <div
              key={row.title}
              className="flex items-center justify-between border-b border-border py-4 last:border-0"
            >
              <div>
                <p className="font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.date}</p>
              </div>
              <p
                className={
                  row.value.startsWith("+") ? "font-semibold text-success" : "font-semibold"
                }
              >
                {row.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RecognitionsPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="My recognitions"
        description="Celebrate the work you received and the appreciation you shared."
        action={
          <Button asChild>
            <a href="/me/shoutout">
              <Send />
              Send a shoutout
            </a>
          </Button>
        }
      />
      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="given">Given</TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-5 grid gap-4 md:grid-cols-2">
          {recognitions.map((item) => (
            <Card key={item.id} className="rounded-lg">
              <CardHeader>
                <StatusBadge tone="reward">+{item.points} points</StatusBadge>
                <CardTitle className="pt-3">{item.title}</CardTitle>
                <CardDescription>{item.message}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  From <strong>{item.from}</strong>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="given">
          <Card className="mt-5 rounded-lg">
            <CardContent className="py-12 text-center">
              <Heart className="mx-auto size-8 text-primary" />
              <h3 className="mt-4 font-semibold">You thanked two colleagues this month</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Small moments of appreciation build stronger teams.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrackingPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="How I’m tracking"
        description="Your current progress, explained in plain language."
      />
      <div className="rounded-lg border border-private/25 bg-private-surface p-4 text-private">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">This view is private</p>
            <p className="mt-1 text-sm">Only you and your manager can see these details.</p>
          </div>
        </div>
      </div>
      <section className="grid gap-4 lg:grid-cols-3">
        {trackingMetrics.map((metric) => (
          <Card key={metric.label} className="rounded-lg">
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={metric.progress} />
              <p className="mt-3 text-sm text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Quality champion</CardTitle>
          <CardDescription>October 2026 · 12 days remaining</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {[
              "Complete at least 1,750 units",
              "Keep quality checks at or above 97%",
              "Maintain at least 95% attendance",
            ].map((rule, index) => (
              <li key={rule} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm">{rule}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function RewardsPage() {
  const [selected, setSelected] = useState<Reward | null>(null);
  const [stage, setStage] = useState<"confirm" | "otp" | "success">("confirm");
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= 3;
  const confirmOtp = () => {
    if (otp === "246810") setStage("success");
    else {
      setAttempts((value) => value + 1);
      setOtp("");
    }
  };
  const close = () => {
    setSelected(null);
    setStage("confirm");
    setOtp("");
    setAttempts(0);
  };
  return (
    <div className="space-y-8">
      <PageHeading title="Reward catalogue" description="You have 1,850 points ready to redeem." />
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["All", "Shopping", "Food", "Fuel", "Experience", "Donation"].map((category, index) => (
          <Button key={category} variant={index === 0 ? "default" : "outline"} size="sm">
            {category}
          </Button>
        ))}
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => (
          <Card key={reward.id} className="overflow-hidden rounded-lg">
            <div className="grid h-32 place-items-center bg-reward/10">
              <div className="grid size-16 place-items-center rounded-lg bg-reward text-xl font-bold text-reward-foreground">
                {reward.accent}
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardDescription>{reward.brand}</CardDescription>
                  <CardTitle className="mt-1 text-base">{reward.title}</CardTitle>
                </div>
                <StatusBadge tone="reward">{reward.points} pts</StatusBadge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between text-sm">
                <span>{formatRupees(reward.value)} value</span>
                <StatusBadge>{reward.taxNature}</StatusBadge>
              </div>
              <Button className="w-full" onClick={() => setSelected(reward)}>
                View reward
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
      <Dialog open={selected !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          {selected && stage === "confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  Redeem {selected.points} points for {formatRupees(selected.value)}?
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-md border border-border bg-muted p-4">
                <p className="text-sm font-medium">Tax nature</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.taxNature}. This will appear in your redemption history.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button onClick={() => setStage("otp")}>Continue to OTP</Button>
              </DialogFooter>
            </>
          )}
          {stage === "otp" && (
            <>
              <DialogHeader>
                <DialogTitle>Verify your redemption</DialogTitle>
                <DialogDescription>
                  Enter the six-digit code sent to your registered mobile. Demo code: 246810.
                </DialogDescription>
              </DialogHeader>
              <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={locked}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPSlot key={index} index={index} className="size-11" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {attempts > 0 && !locked && (
                <p role="alert" className="text-sm text-destructive">
                  That code did not match. {3 - attempts} attempts remaining.
                </p>
              )}
              {locked && (
                <p role="alert" className="text-sm text-destructive">
                  Too many attempts. Try again after 30 minutes.
                </p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button onClick={confirmOtp} disabled={otp.length !== 6 || locked}>
                  Verify and redeem
                </Button>
              </DialogFooter>
            </>
          )}
          {stage === "success" && (
            <div className="py-4 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/10 text-success">
                <ShieldCheck className="size-7" />
              </div>
              <DialogTitle className="mt-5">Redemption successful</DialogTitle>
              <DialogDescription className="mt-2">
                Your voucher code is now revealed and can no longer be cancelled.
              </DialogDescription>
              <div className="my-5 rounded-md border border-reward/30 bg-reward/10 p-4 font-mono text-lg font-bold tracking-widest text-reward">
                RKM5-82PL-7XQ
              </div>
              <Button onClick={close}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShoutoutPage() {
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
          <Heart className="size-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold">Your thanks was sent</h1>
        <p className="mt-2 text-muted-foreground">
          Arjun will see your note in their recognition feed.
        </p>
        <Button className="mt-6" onClick={() => setSent(false)}>
          Thank someone else
        </Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeading
        title="Send a shoutout"
        description="Thank a colleague for something specific they did."
      />
      <Card className="rounded-lg">
        <CardContent className="space-y-5 p-6">
          <div>
            <Label htmlFor="colleague">Colleague</Label>
            <Select>
              <SelectTrigger id="colleague" className="mt-2">
                <SelectValue placeholder="Choose a colleague" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arjun">Arjun Kumar · Manufacturing B</SelectItem>
                <SelectItem value="deepa">Deepa Iyer · Quality A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="reason">What did they do?</Label>
            <Textarea
              id="reason"
              className="mt-2 min-h-28"
              placeholder="Arjun stepped in to help our line finish the Diwali order on time."
            />
          </div>
          <Button className="w-full" onClick={() => setSent(true)}>
            <Send />
            Send shoutout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferencesPage() {
  const { language, setLanguage } = useAppStore();
  const languageName = useMemo(
    () => languageOptions.find(([code]) => code === language)?.[1] ?? "English",
    [language],
  );
  return (
    <div className="space-y-8">
      <PageHeading
        title="Preferences"
        description="Choose your language and how Radha Krishna Mills contacts you."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="size-5" />
              Language
            </CardTitle>
            <CardDescription>
              Current language: {languageName}. Missing translations fall back to English.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value);
                toast.success("Language preference saved");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
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
            <CardDescription>Manage messages and quiet hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              ["WhatsApp updates", "Recognition and reward messages"],
              ["Email summaries", "A weekly overview every Monday"],
              ["Quiet hours", "Pause messages from 21:00 to 08:00"],
            ].map(([title, description], index) => (
              <div key={title} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Switch defaultChecked={index !== 1} aria-label={title} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Evidence uploads</CardTitle>
            <CardDescription>
              Use your camera when a form asks for supporting evidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              <Camera />
              Open camera
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
