import {
  AlertTriangle,
  Check,
  Coins,
  LoaderCircle,
  LockKeyhole,
  Medal,
  Plus,
  Send,
} from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export function DesignSystemPage() {
  return (
    <div className="space-y-12">
      <PageHeading
        eyebrow="Veronyx Recognise"
        title="Design system"
        description="The working visual reference for product teams and engineering."
      />
      <Section title="Colour tokens">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Primary", "bg-primary text-primary-foreground"],
            ["Reward", "bg-reward text-reward-foreground"],
            ["Success", "bg-success text-success-foreground"],
            ["Warning", "bg-warning text-warning-foreground"],
            ["Error", "bg-destructive text-destructive-foreground"],
            ["Private", "bg-private-surface text-private"],
            ["Surface", "bg-card text-card-foreground"],
            ["Muted", "bg-muted text-muted-foreground"],
          ].map(([name, classes]) => (
            <div key={name} className={`flex h-24 items-end rounded-lg p-4 ${classes}`}>
              <span className="text-sm font-semibold">{name}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Typography">
        <div className="space-y-5">
          <div>
            <p className="text-3xl font-bold">Page title, 30 px bold</p>
            <p className="text-xs text-muted-foreground">Clear, sentence case and direct.</p>
          </div>
          <p className="text-2xl font-bold">Section title, 24 px bold</p>
          <p className="text-xl font-semibold">Card title, 20 px semibold</p>
          <p className="text-sm">Body copy is 14 px and written in plain language.</p>
          <code className="text-[13px]">workflow.run.rkm-2026-10</code>
        </div>
      </Section>
      <Section title="Actions and inputs">
        <div className="flex flex-wrap gap-3">
          <Button>
            <Plus />
            Primary action
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="sample">Employee name</Label>
            <Input id="sample" className="mt-2" placeholder="Search by name or code" />
          </div>
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="text-sm font-medium">WhatsApp updates</p>
              <p className="text-xs text-muted-foreground">Recognition and reward messages</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Section>
      <Section title="Status and feedback">
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="success">Approved</StatusBadge>
          <StatusBadge tone="warning">Needs review</StatusBadge>
          <StatusBadge tone="error">Failed</StatusBadge>
          <StatusBadge tone="private">Private</StatusBadge>
          <StatusBadge tone="reward">250 points</StatusBadge>
          <StatusBadge>Pending</StatusBadge>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Feedback
            icon={Check}
            title="Success"
            copy="200 employees imported."
            tone="text-success bg-success/10"
          />
          <Feedback
            icon={AlertTriangle}
            title="Needs attention"
            copy="One mobile number needs checking."
            tone="text-warning-foreground bg-warning/10"
          />
          <Feedback
            icon={LoaderCircle}
            title="Loading"
            copy="Checking employee rows…"
            tone="text-primary bg-primary/10"
          />
        </div>
      </Section>
      <Section title="Cards and domain components">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Available points"
            value="1,850"
            detail="250 expire on 31/12/2026"
            icon={Coins}
            reward
          />
          <Card className="rounded-lg">
            <CardHeader>
              <StatusBadge tone="reward">+250 points</StatusBadge>
              <CardTitle className="pt-3">Quality champion</CardTitle>
              <CardDescription>For catching a fabric defect before dispatch.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between">
              <span className="text-sm">From Arun Kumar</span>
              <Medal className="text-reward" />
            </CardContent>
          </Card>
          <Card className="rounded-lg border-private/25 bg-private-surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-private">
                <LockKeyhole />
                Private insight
              </CardTitle>
              <CardDescription>Only the employee and manager can see this.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>
      <Section title="Loading, progress and empty states">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-lg">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardContent className="p-5">
              <p className="font-medium">Importing employees</p>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">160 of 200 rows</p>
              <Progress value={80} />
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardContent className="py-8 text-center">
              <Send className="mx-auto text-muted-foreground" />
              <p className="mt-3 font-medium">Nothing here yet</p>
              <p className="text-sm text-muted-foreground">Your first shoutout will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
function Feedback({
  icon: Icon,
  title,
  copy,
  tone,
}: {
  icon: typeof Check;
  title: string;
  copy: string;
  tone: string;
}) {
  return (
    <div className={`rounded-lg p-4 ${tone}`}>
      <Icon className="size-5" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm">{copy}</p>
    </div>
  );
}
