import {
  ArrowRight,
  Building2,
  Check,
  CircleHelp,
  Eye,
  EyeOff,
  GripVertical,
  Info,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { WhatsAppIcon, domainIcons } from "@/components/domain-icons";
import { EmptyState } from "@/components/empty-state";
import { EmptyIllustration, illustrationKinds } from "@/components/illustrations";
import { CircularProgress } from "@/components/library/circular-progress";
import { DataTable } from "@/components/library/data-table";
import { DatePicker, DateRangePicker } from "@/components/library/date-picker";
import { DiffViewer } from "@/components/library/diff-viewer";
import { FormulaEditor } from "@/components/library/formula-editor";
import { JsonViewer } from "@/components/library/json-viewer";
import { Kanban } from "@/components/library/kanban";
import { SearchableSelect } from "@/components/library/multi-select";
import { Stepper } from "@/components/library/stepper";
import { Timeline } from "@/components/library/timeline";
import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { versionDefinitions } from "@/lib/admin-data";
import { formatIndianNumber, formatRupees } from "@/lib/format";
import { lorenzCurve, pointsHistogram, recognitionPoints } from "@/lib/phase3-data";
import { cn } from "@/lib/utils";

/** Checklist §10.1 palette with the values implemented in styles.css. */
const colourTokens = [
  ["primary", "#2563EB", "#3B82F6", "Primary actions, links", "bg-primary"],
  ["primary-hover", "#1D4ED8", "#2563EB", "Hover state", "bg-primary/90"],
  ["success", "#16A34A", "#22C55E", "Success states, approved", "bg-success"],
  ["warning", "#D97706", "#F59E0B", "Warnings, pending", "bg-warning"],
  ["error", "#DC2626", "#EF4444", "Errors, rejected", "bg-destructive"],
  ["info", "#0891B2", "#06B6D4", "Info states", "bg-info"],
  ["background", "#FFFFFF", "#0F172A", "Page background", "bg-background border"],
  ["surface", "#F8FAFC", "#1E293B", "Card background", "bg-card border"],
  ["border", "#E2E8F0", "#334155", "Borders", "bg-border"],
  ["text-primary", "#0F172A", "#F8FAFC", "Primary text", "bg-foreground"],
  ["text-secondary", "#64748B", "#94A3B8", "Secondary text", "bg-muted-foreground"],
  ["text-disabled", "#94A3B8", "#475569", "Disabled text", "bg-muted-foreground/50"],
  ["reward", "#B7791F", "#EAB308", "Points, rewards (product addition)", "bg-reward"],
  ["private", "#64748B", "#94A3B8", "Private-only content (product addition)", "bg-private"],
] as const;

const typeScale = [
  ["h1", "30px", "Bold", "Page titles", "text-3xl font-bold"],
  ["h2", "24px", "Bold", "Section titles", "text-2xl font-bold"],
  ["h3", "20px", "Semibold", "Card titles", "text-xl font-semibold"],
  ["h4", "16px", "Semibold", "Sub-sections", "text-base font-semibold"],
  ["body", "14px", "Regular", "Body text", "text-sm"],
  ["small", "12px", "Regular", "Captions, labels", "text-xs"],
  ["mono", "13px", "Regular", "Code, IDs, JSON", "font-mono text-[13px]"],
] as const;

const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

const motion = [
  ["Micro (hover, toggle, press)", "150 ms", "ease-out", "Buttons, switches, checkboxes"],
  ["Overlay in/out", "200 ms", "ease-out / ease-in", "Dialogs, sheets, dropdowns, toasts"],
  ["Content change", "250 ms", "ease-in-out", "Tabs, accordions, chart transitions"],
  ["Page skeleton", "≤ 300 ms", "—", "Skeleton until the screen's data is ready"],
  ["Progress / typing", "continuous", "linear", "Dry-run progress, AI typing dots, spinners"],
] as const;

const breakpoints = [
  [
    "Mobile",
    "< 768 px",
    "Single column, bottom nav (4 items), hamburger menu, cards instead of tables",
  ],
  ["Tablet", "768–1024 px", "Two columns, hamburger + collapsible sidebar sheet"],
  ["Desktop", "1024–1440 px", "Fixed 256 px sidebar + content (max 1440 px)"],
  ["Large desktop", "> 1440 px", "Sidebar + content + optional right panel (AI Copilot docked)"],
] as const;

const scripts = [
  ["en", "English", "Recognised for great work", "Noto Sans / DM Sans"],
  ["hi", "हिन्दी", "शानदार काम के लिए सम्मान", "Noto Sans Devanagari"],
  ["mr", "मराठी", "उत्कृष्ट कामाबद्दल गौरव", "Noto Sans Devanagari"],
  ["ta", "தமிழ்", "சிறந்த பணிக்கான அங்கீகாரம்", "Noto Sans Tamil"],
  ["te", "తెలుగు", "అద్భుతమైన పనికి గుర్తింపు", "Noto Sans Telugu"],
  ["kn", "ಕನ್ನಡ", "ಅತ್ಯುತ್ತಮ ಕೆಲಸಕ್ಕೆ ಮನ್ನಣೆ", "Noto Sans Kannada"],
  ["bn", "বাংলা", "চমৎকার কাজের জন্য স্বীকৃতি", "Noto Sans Bengali"],
  ["gu", "ગુજરાતી", "ઉત્તમ કામ માટે માન્યતા", "Noto Sans Gujarati"],
  ["ml", "മലയാളം", "മികച്ച ജോലിക്ക് അംഗീകാരം", "Noto Sans Malayalam"],
] as const;

const sampleRows = [
  { id: "1", name: "Pooja Kumar", team: "Sales A", points: 1450, days: 2 },
  { id: "2", name: "Priya Nair", team: "Sales A", points: 1200, days: 5 },
  { id: "3", name: "Fatima Rao", team: "Sales A", points: 980, days: 7 },
  { id: "4", name: "Arjun Sharma", team: "Sales B", points: 760, days: 14 },
  { id: "5", name: "Meena Iyer", team: "Quality A", points: 520, days: 21 },
  { id: "6", name: "Ravi Teja", team: "Manufacturing A", points: 340, days: 28 },
  { id: "7", name: "Suresh Babu", team: "Operations A", points: 0, days: 41 },
];

export function DesignSystemPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Veronyx Recognise"
        title="Design system"
        description="Tokens, components and specs from the UI checklist (§7–§10, Appendix B) — the working reference for product and engineering. Everything here is the real code used in the app."
      />
      <Tabs defaultValue="foundations">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
          <TabsTrigger value="components">Core components</TabsTrigger>
          <TabsTrigger value="domain">Domain components</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
        </TabsList>
        <TabsContent value="foundations" className="mt-8 space-y-12">
          <Foundations />
        </TabsContent>
        <TabsContent value="components" className="mt-8 space-y-12">
          <CoreComponents />
        </TabsContent>
        <TabsContent value="domain" className="mt-8 space-y-12">
          <DomainComponents />
        </TabsContent>
        <TabsContent value="specs" className="mt-8 space-y-12">
          <Specs />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Foundations() {
  return (
    <>
      <Section
        title="Colour tokens (§10.1)"
        note="Light and dark values. Contrast checked to WCAG AA."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colourTokens.map(([name, light, dark, usage, cls]) => (
            <div key={name} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className={cn("size-10 shrink-0 rounded-md", cls)} aria-hidden />
              <div className="min-w-0 text-sm">
                <p className="font-mono text-[13px] font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {light} · dark {dark}
                </p>
                <p className="text-xs text-muted-foreground">{usage}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography (§10.2)" note="DM Sans with Noto Sans for every Indian script.">
        <div className="divide-y divide-border rounded-lg border border-border">
          {typeScale.map(([token, size, weight, usage, cls]) => (
            <div key={token} className="flex flex-wrap items-baseline justify-between gap-2 p-4">
              <span className={cls}>{usage}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {token} · {size} · {weight}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Spacing scale (§10.3)">
        <div className="space-y-2">
          {spacing.map((px) => (
            <div key={px} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-mono text-muted-foreground">{px}px</span>
              <span className="h-3 rounded-sm bg-primary" style={{ width: px * 3 }} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Border radius & shadows (§10.4, §10.5)">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["sm · 4px", "rounded-sm", "Inputs, small buttons"],
            ["md · 8px", "rounded-md", "Cards, buttons"],
            ["lg · 12px", "rounded-lg", "Modals, large cards"],
            ["full", "rounded-full", "Pills, avatars, badges"],
          ].map(([label, cls, usage]) => (
            <div key={label} className="space-y-2 text-center text-xs">
              <div className={cn("mx-auto size-16 border-2 border-primary bg-primary/10", cls)} />
              <p className="font-mono">{label}</p>
              <p className="text-muted-foreground">{usage}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            ["shadow-sm", "Cards at rest"],
            ["shadow-md", "Cards on hover, dropdowns"],
            ["shadow-lg", "Modals, popovers"],
            ["shadow-xl", "Toasts, floating elements"],
          ].map(([cls = "", usage]) => (
            <div key={cls} className={cn("rounded-lg bg-card p-4 text-xs", cls)}>
              <p className="font-mono">{cls.replace("shadow-", "")}</p>
              <p className="text-muted-foreground">{usage}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Iconography (§10.6)"
        note="Lucide outline icons. 20px small, 24px default, 32px large. Outline when inactive, filled when active."
      >
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {domainIcons.map(({ key, label, emoji, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Icon className="size-6 text-primary" aria-hidden />
              <span className="text-sm">
                {label} <span aria-hidden>{emoji}</span>
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <WhatsAppIcon className="size-6 text-[#25D366]" />
            <span className="text-sm">WhatsApp (brand)</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-6 text-xs text-muted-foreground">
          {[20, 24, 32].map((size) => (
            <span key={size} className="flex flex-col items-center gap-1">
              <Building2 style={{ width: size, height: size }} className="text-foreground" />
              {size}px
            </span>
          ))}
          <span className="flex flex-col items-center gap-1">
            <Building2 className="size-6 text-primary" />
            inactive
          </span>
          <span className="flex flex-col items-center gap-1">
            <Building2 className="size-6 text-primary" fill="currentColor" fillOpacity={0.18} />
            active
          </span>
        </div>
      </Section>

      <Section
        title="Illustration set (§10.7)"
        note="One flat style; diverse Indian workforce across factory, retail, office and field; no religious, caste or gendered-role markers. Hidden in low-data mode."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {illustrationKinds.map(({ kind, label }) => (
            <figure key={kind} className="rounded-lg border border-border p-3 text-center">
              <EmptyIllustration kind={kind} className="mx-auto h-24 w-auto" />
              <figcaption className="mt-2 text-xs text-muted-foreground">
                <span className="font-mono">{kind}</span> · {label}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}

function CoreComponents() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 8));
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 31),
  });
  const [single, setSingle] = useState<string[]>(["sales"]);
  const [multi, setMulti] = useState<string[]>(["sales", "chennai"]);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState<null | "confirm" | "form" | "info" | "error">(null);
  const [formula, setFormula] = useState("base * min(metric / target, 1.5)");
  const [cards, setCards] = useState([
    { id: "a", title: "Line star weekly", col: "draft" },
    { id: "b", title: "CSAT champion", col: "ready" },
    { id: "c", title: "Sales achievers", col: "live" },
  ]);
  const groups = [
    {
      label: "Departments",
      options: [
        { value: "sales", label: "Sales" },
        { value: "quality", label: "Quality" },
        { value: "manufacturing", label: "Manufacturing" },
      ],
    },
    {
      label: "Locations",
      options: [
        { value: "chennai", label: "Chennai" },
        { value: "coimbatore", label: "Coimbatore" },
      ],
    },
  ];

  return (
    <>
      <Section title="Button" note="Primary, Secondary, Ghost, Danger, Link · sizes SM, MD, LG.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Plus /> Primary
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Danger</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button>Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Refresh">
            <RefreshCw />
          </Button>
        </div>
      </Section>

      <Section
        title="Input"
        note="Text, Number, Email, Phone, Password, Textarea — with label, helper and error."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="ds-text" label="Employee name" helper="As on the ID card">
            <Input id="ds-text" placeholder="e.g. Priya Nair" aria-describedby="ds-text-help" />
          </Field>
          <Field id="ds-number" label="Points" helper="Whole numbers only">
            <Input
              id="ds-number"
              type="number"
              defaultValue={250}
              aria-describedby="ds-number-help"
            />
          </Field>
          <Field id="ds-email" label="Work email" error="Enter a valid work email.">
            <Input
              id="ds-email"
              type="email"
              defaultValue="priya@"
              aria-invalid
              aria-describedby="ds-email-error"
            />
          </Field>
          <Field id="ds-phone" label="Mobile number" helper="10 digits, used for WhatsApp and OTP">
            <div className="flex">
              <span className="grid place-items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm">
                +91
              </span>
              <Input
                id="ds-phone"
                type="tel"
                inputMode="numeric"
                className="rounded-l-none"
                defaultValue="98431 22014"
                aria-describedby="ds-phone-help"
              />
            </div>
          </Field>
          <Field id="ds-password" label="Password">
            <div className="relative">
              <Input
                id="ds-password"
                type={showPassword ? "text" : "password"}
                defaultValue="demo-password"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-0 right-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </Field>
          <Field
            id="ds-textarea"
            label="Why are you recognising them?"
            helper="Up to 280 characters"
          >
            <Textarea id="ds-textarea" rows={2} aria-describedby="ds-textarea-help" />
          </Field>
        </div>
      </Section>

      <Section title="Select" note="Single, Multi, Searchable, Grouped.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="ds-select" label="Single (native list)">
            <Select defaultValue="monthly">
              <SelectTrigger id="ds-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="ds-search" label="Searchable, grouped">
            <SearchableSelect id="ds-search" groups={groups} value={single} onChange={setSingle} />
          </Field>
          <Field id="ds-multi" label="Multi, grouped">
            <SearchableSelect
              id="ds-multi"
              groups={groups}
              value={multi}
              onChange={setMulti}
              multiple
            />
          </Field>
        </div>
      </Section>

      <Section title="Date picker" note="Single and range · DD/MM/YYYY by default.">
        <div className="flex flex-wrap gap-4">
          <Field id="ds-date" label="Date given">
            <DatePicker id="ds-date" value={date} onChange={setDate} />
          </Field>
          <Field id="ds-range" label="Campaign dates">
            <DateRangePicker id="ds-range" value={range} onChange={setRange} />
          </Field>
        </div>
      </Section>

      <Section title="Table" note="Sortable, filterable, paginated, expandable rows.">
        <DataTable
          caption="Recognition this month"
          pageSize={5}
          rows={sampleRows}
          filterPlaceholder="Filter by name or team"
          columns={[
            { key: "name", header: "Name", cell: (r) => r.name, value: (r) => r.name },
            {
              key: "team",
              header: "Team",
              cell: (r) => r.team,
              value: (r) => r.team,
              hideBelow: "sm",
            },
            {
              key: "points",
              header: "Points",
              align: "right",
              cell: (r) => formatIndianNumber(r.points),
              value: (r) => r.points,
            },
          ]}
          expand={(r) => <p className="text-sm">Last recognised {r.days} days ago.</p>}
        />
      </Section>

      <Section title="Card" note="Info, Stat, Action, Proposal.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-4 text-info" /> Info
              </CardTitle>
              <CardDescription>Payroll file for October is due on 01/11/2026.</CardDescription>
            </CardHeader>
          </Card>
          <StatCard label="Stat" value="71%" detail="Recognised in the last 30 days" icon={Users} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Action</CardTitle>
              <CardDescription>2 people not recognised in 30+ days.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm">
                Recognise now <ArrowRight />
              </Button>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="text-base">📋 Proposal</CardTitle>
              <CardDescription>
                Monthly CSAT champion · ID PR-7F3A · validation passed.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>

      <Section title="Modal" note="Confirm, Form, Info, Error — always with a backdrop.">
        <div className="flex flex-wrap gap-2">
          {(["confirm", "form", "info", "error"] as const).map((m) => (
            <Button key={m} variant="outline" onClick={() => setModal(m)} className="capitalize">
              {m}
            </Button>
          ))}
        </div>
        <Dialog open={modal !== null} onOpenChange={(o) => !o && setModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {modal === "confirm" && "Withdraw consent?"}
                {modal === "form" && "Record an offline reward"}
                {modal === "info" && "How the gift limit works"}
                {modal === "error" && "Couldn't save"}
              </DialogTitle>
              <DialogDescription>
                {modal === "confirm" && "This stops WhatsApp messages immediately."}
                {modal === "form" && "Counts towards the ₹15,000 yearly gift limit."}
                {modal === "info" &&
                  "Non-cash gifts above ₹15,000 in a financial year are taxed as salary."}
                {modal === "error" &&
                  "Something went wrong. Please try again. Error code API-503-2C9E."}
              </DialogDescription>
            </DialogHeader>
            {modal === "form" && (
              <Field id="ds-modal-what" label="What was given">
                <Input id="ds-modal-what" placeholder="Diwali sweet box" />
              </Field>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setModal(null)}>
                {modal === "info" ? "Close" : "Cancel"}
              </Button>
              {modal !== "info" && (
                <Button
                  variant={modal === "confirm" ? "destructive" : "default"}
                  onClick={() => setModal(null)}
                >
                  {modal === "confirm" ? "Withdraw" : modal === "error" ? "Retry" : "Save"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Toast" note="Success, Error, Warning, Info — auto-dismiss.">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Approved. Reward will be processed.")}
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error("Something went wrong. Please try again.", {
                action: { label: "Retry", onClick: () => undefined },
              })
            }
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning("Budget exhausted. This approval will be queued.")}
          >
            Warning
          </Button>
          <Button variant="outline" onClick={() => toast.info("First sync started.")}>
            Info
          </Button>
        </div>
      </Section>

      <Section title="Badge" note="Status, Count, Label.">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="success">Approved</StatusBadge>
          <StatusBadge tone="warning">Needs review</StatusBadge>
          <StatusBadge tone="error">Failed</StatusBadge>
          <StatusBadge tone="private">Private</StatusBadge>
          <StatusBadge tone="reward">+250 points</StatusBadge>
          <StatusBadge>Pending</StatusBadge>
          <span
            className="grid min-w-6 place-items-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-white"
            aria-label="6 pending"
          >
            6
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs">
            Manufacturing
          </span>
        </div>
      </Section>

      <Section title="Tabs" note="Horizontal and vertical.">
        <div className="grid gap-6 lg:grid-cols-2">
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">Runs</TabsTrigger>
              <TabsTrigger value="b">Versions</TabsTrigger>
            </TabsList>
            <TabsContent value="a" className="text-sm text-muted-foreground">
              Run history.
            </TabsContent>
            <TabsContent value="b" className="text-sm text-muted-foreground">
              Version history.
            </TabsContent>
          </Tabs>
          <Tabs defaultValue="org" orientation="vertical" className="flex gap-4">
            <TabsList className="flex h-auto flex-col items-stretch">
              <TabsTrigger value="org" className="justify-start">
                Org profile
              </TabsTrigger>
              <TabsTrigger value="roles" className="justify-start">
                Roles
              </TabsTrigger>
              <TabsTrigger value="billing" className="justify-start">
                Billing
              </TabsTrigger>
            </TabsList>
            <TabsContent value="org" className="mt-0 text-sm text-muted-foreground">
              Legal name, GSTIN, Udyam.
            </TabsContent>
            <TabsContent value="roles" className="mt-0 text-sm text-muted-foreground">
              Permission matrix.
            </TabsContent>
            <TabsContent value="billing" className="mt-0 text-sm text-muted-foreground">
              Plan and invoices.
            </TabsContent>
          </Tabs>
        </div>
      </Section>

      <Section title="Stepper" note="Horizontal and vertical.">
        <div className="grid gap-6 lg:grid-cols-2">
          <Stepper
            steps={[{ label: "Choose" }, { label: "Check" }, { label: "Confirm" }]}
            current={1}
          />
          <Stepper
            orientation="vertical"
            current={2}
            steps={[
              { label: "Organisation", description: "Name, GSTIN, size" },
              { label: "Departments", description: "Teams and managers" },
              { label: "Import employees", description: "CSV or Excel" },
              { label: "Connect data", description: "Optional" },
            ]}
          />
        </div>
      </Section>

      <Section title="Progress" note="Bar, Circular, Step.">
        <div className="flex flex-wrap items-center gap-8">
          <div className="w-64 space-y-1 text-sm">
            <p>Uploading… 64%</p>
            <Progress value={64} aria-label="Upload progress" />
          </div>
          <CircularProgress value={80} label="Weights total" tone="warning" />
          <p className="text-sm">Step 2 of 5 · Preview data</p>
        </div>
      </Section>

      <Section title="Skeleton" note="Text, Card, Table, Chart.">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-24 rounded-lg" />
          <div className="space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5" />
            ))}
          </div>
          <div className="flex h-24 items-end gap-1.5">
            {[40, 70, 55, 90, 65].map((h, i) => (
              <Skeleton key={i} className="w-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Empty state"
        note="Illustration + exact copy + call to action, per screen (§6.1)."
      >
        <EmptyState
          illustration="factory"
          title="No boards yet. Create a board to start tracking."
          action={<Button size="sm">Create a board</Button>}
        />
      </Section>

      <Section title="Tooltip, dropdown menu, avatar">
        <div className="flex flex-wrap items-center gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="What is coverage?">
                  <CircleHelp />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share of people recognised at least once in 30 days.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="About this field">
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Info: synced from Zoho CRM every hour.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Row actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Pause</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Go to</DropdownMenuLabel>
              <DropdownMenuItem>Run history</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>PN</AvatarFallback>
            </Avatar>
            <Avatar className="rounded-md">
              <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                <Users className="size-4" />
              </AvatarFallback>
            </Avatar>
            <Avatar className="rounded-md">
              <AvatarFallback className="rounded-md bg-reward/15 text-reward">RK</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">User · Team · Org</span>
          </div>
        </div>
      </Section>

      <Section
        title="Chart"
        note="Line, Bar, Pie, Distribution, Gini — every chart has a text alternative."
      >
        <ChartGallery />
      </Section>

      <Section title="Timeline" note="Vertical, for run history and audit trails.">
        <Timeline
          items={[
            { id: "1", title: "Run started", time: "01/10/2026 06:00", tone: "default" },
            { id: "2", title: "24 people checked · 3 qualified", time: "01/10/2026 06:01" },
            { id: "3", title: "Approved by Vikram Rao", time: "01/10/2026 11:20", tone: "success" },
          ]}
        />
      </Section>

      <Section title="Kanban" note="Columns and cards (workflow pipeline). Drag a card.">
        <Kanban
          columns={[
            { id: "draft", title: "Draft", items: cards.filter((c) => c.col === "draft") },
            { id: "ready", title: "Ready", items: cards.filter((c) => c.col === "ready") },
            { id: "live", title: "Active", items: cards.filter((c) => c.col === "live") },
            { id: "paused", title: "Paused", items: cards.filter((c) => c.col === "paused") },
          ]}
          onMove={(id, to) =>
            setCards((list) => list.map((c) => (c.id === id ? { ...c, col: to } : c)))
          }
          renderCard={(c) => <p className="text-sm font-medium">{c.title}</p>}
        />
      </Section>

      <Section
        title="DAG canvas & condition builder"
        note="Nodes, edges and drag-drop — the full version is the workflow builder."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ol className="space-y-0" aria-label="Example workflow">
            {[
              "⚡ Sales file imported",
              "Filter · active Sales",
              "Rule · sales ≥ 100%",
              "Approval · manager",
              "🎁 Reward · 500 points",
            ].map((label, i, arr) => (
              <li key={label}>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm">
                  <GripVertical className="size-4 text-muted-foreground" aria-hidden />
                  {label}
                  <Check className="ml-auto size-4 text-success" aria-label="valid" />
                </div>
                {i < arr.length - 1 && <div className="mx-auto h-5 w-px bg-border" aria-hidden />}
              </li>
            ))}
          </ol>
          <div className="space-y-2">
            <p className="text-sm font-medium">Condition builder</p>
            {[
              ["attendance_pct", "≥", "95"],
              ["units_produced", "between", "300 – 500"],
            ].map(([field, op, value]) => (
              <div key={field} className="grid grid-cols-[1fr_6rem_1fr_auto] items-center gap-2">
                <Input aria-label="Field" defaultValue={field} className="font-mono text-xs" />
                <Input aria-label="Operator" defaultValue={op} />
                <Input aria-label="Value" defaultValue={value} />
                <Button size="icon" variant="ghost" aria-label="Remove condition">
                  <X />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline">
              <Plus /> Add condition
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Formula editor" note="Syntax highlight and validation, for amount formulas.">
        <div className="max-w-xl">
          <FormulaEditor value={formula} onChange={setFormula} />
        </div>
      </Section>

      <Section title="JSON viewer & diff viewer">
        <div className="grid gap-6 lg:grid-cols-2">
          <JsonViewer
            data={{
              name: "Sales target achievers",
              trigger: { event: "sales_file.imported" },
              steps: [
                { kind: "threshold", metric: "sales.sales_vs_target", op: "gte", value: 100 },
              ],
            }}
          />
          <DiffViewer
            before={versionDefinitions[6] ?? []}
            after={versionDefinitions[7] ?? []}
            beforeLabel="Version 6"
            afterLabel="Version 7"
          />
        </div>
      </Section>
    </>
  );
}

function ChartGallery() {
  const line = [
    { m: "May", v: 210 },
    { m: "Jun", v: 236 },
    { m: "Jul", v: 251 },
    { m: "Aug", v: 244 },
    { m: "Sep", v: 289 },
  ];
  const pie = [
    { name: "Vouchers", value: 58 },
    { name: "Points", value: 27 },
    { name: "Cash", value: 15 },
  ];
  const colours = ["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-chart-1)"];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ChartBox
        title="Line · recognitions per month"
        alt={line.map((d) => `${d.m} ${d.v}`).join(", ")}
      >
        <LineChart data={line}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="m" fontSize={11} />
          <YAxis fontSize={11} />
          <ChartTooltip />
          <Line dataKey="v" stroke="var(--color-primary)" />
        </LineChart>
      </ChartBox>
      <ChartBox title="Pie · reward mix" alt={pie.map((d) => `${d.name} ${d.value}%`).join(", ")}>
        <PieChart>
          <Pie data={pie} dataKey="value" nameKey="name" outerRadius={60} label>
            {pie.map((d, i) => (
              <Cell key={d.name} fill={colours[i]} />
            ))}
          </Pie>
          <ChartTooltip />
        </PieChart>
      </ChartBox>
      <ChartBox title="Distribution · points per person" alt="Histogram of points per person">
        <BarChart data={pointsHistogram(recognitionPoints)}>
          <XAxis dataKey="bucket" fontSize={9} />
          <YAxis fontSize={11} />
          <ChartTooltip />
          <Bar dataKey="people" fill="var(--color-chart-2)" />
        </BarChart>
      </ChartBox>
      <ChartBox
        title="Gini · Lorenz curve"
        alt="Lorenz curve of points against a perfectly even line"
      >
        <LineChart data={lorenzCurve(recognitionPoints)}>
          <XAxis dataKey="people" fontSize={11} unit="%" />
          <YAxis fontSize={11} unit="%" />
          <ChartTooltip />
          <Line
            dataKey="even"
            stroke="var(--color-muted-foreground)"
            strokeDasharray="4 4"
            dot={false}
          />
          <Line dataKey="points" stroke="var(--color-primary)" />
        </LineChart>
      </ChartBox>
    </div>
  );
}

function ChartBox({
  title,
  alt,
  children,
}: {
  title: string;
  alt: string;
  children: React.ReactElement;
}) {
  return (
    <figure className="rounded-lg border border-border p-3">
      <figcaption className="mb-2 text-xs font-medium">{title}</figcaption>
      <div className="h-40" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      <p className="sr-only">{alt}</p>
    </figure>
  );
}

function DomainComponents() {
  const [policy, setPolicy] = useState("rank");
  return (
    <>
      <Section title="Workflow step node · Approval card · Proposal card">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-card p-3 ring-2 ring-primary/20">
            <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
              ⚡
            </span>
            <div className="text-sm">
              <p className="font-medium">3. Check a rule</p>
              <p className="text-xs text-muted-foreground">sales ≥ 100% of target</p>
            </div>
            <StatusBadge tone="success">Valid</StatusBadge>
          </div>
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">Pooja Kumar · Sales A</p>
                <StatusBadge tone="warning">SLA 6 h left</StatusBadge>
              </div>
              <p>500 points · Sales target achievers</p>
              <p className="text-xs text-muted-foreground">
                Evidence: sales 128% of target (Zoho CRM)
              </p>
              <div className="flex gap-2">
                <Button size="sm">Approve</Button>
                <Button size="sm" variant="outline">
                  Modify
                </Button>
                <Button size="sm" variant="ghost">
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/30">
            <CardContent className="space-y-1 p-4 text-sm">
              <p className="font-semibold">📋 Workflow proposal · PR-7F3A</p>
              <p>Monthly, Support dept, top 2 by CSAT, min 50 tickets.</p>
              <p className="text-xs">
                ✅ Validation passed (1 warning) · 📊 3 periods, ₹9,000 · ⚖️ 2 of 3 shifts
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                <Button size="sm" variant="outline">
                  Confirm & Save Draft
                </Button>
                <Button size="sm">Confirm & Activate</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Decision trace · Metric card · Leaderboard row">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="space-y-1.5 p-4 text-sm">
              <p className="font-medium">Why Ravi didn't win Line Star</p>
              {[
                ["Filter · active", true],
                ["Attendance ≥ 95% · had 91%", false],
                ["Rank by output", null],
              ].map(([label, ok]) => (
                <p key={String(label)} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full text-[10px]",
                      ok === true && "bg-success/15 text-success",
                      ok === false && "bg-destructive/15 text-destructive",
                      ok === null && "bg-muted text-muted-foreground",
                    )}
                  >
                    {ok === true ? "✓" : ok === false ? "✕" : "–"}
                  </span>
                  {label}
                </p>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Sales vs target · October (MTD)</p>
              <p className="text-3xl font-bold">112%</p>
              <p className="text-xs text-success">▲ 8 points vs September</p>
              <p className="text-xs text-muted-foreground">Source: Zoho CRM · synced 11:00</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              {[
                [1, "Pooja Kumar", "128%", "🥇"],
                [2, "Priya Nair", "121%", "🥈"],
                [null, "You", "96%", ""],
              ].map(([rank, name, value, badge]) => (
                <div key={String(name)} className="flex items-center gap-3">
                  <span className="w-6 text-center font-semibold">{rank ?? "—"}</span>
                  <span className="flex-1">{name}</span>
                  <span className="font-medium">{value}</span>
                  <span aria-hidden>{badge}</span>
                </div>
              ))}
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <LockKeyhole className="size-3" /> Ranks below the top half are hidden.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Budget pool card · Tax tracker row · Connector status card">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <p className="font-medium">Sales A — Vikram</p>
              <p className="text-xs text-muted-foreground">
                {formatRupees(51300)} used of {formatRupees(70000)} · {formatRupees(18700)} left
              </p>
              <Progress value={73} aria-label="Pool used" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex justify-between">
                <span>Meera Nair · RKM0007</span>
                <StatusBadge tone="error">Over limit</StatusBadge>
              </div>
              <Progress value={100} aria-label="Gift limit used" />
              <p className="text-xs text-muted-foreground">
                {formatRupees(16200)} of {formatRupees(15000)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Zoho CRM</span>
                <StatusBadge tone="error">Sign-in expired</StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground">Last sync 05/10/2026 18:00</p>
              <p className="text-xs text-destructive">Authentication failed. Please reconnect.</p>
              <Button size="sm" variant="outline">
                Reconnect
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Identity match card · Native entry form · Scorecard editor">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <p className="font-mono text-xs">zoho:8812 · “P. Kumar”</p>
              {[
                ["Pooja Kumar · RKM0019", "92%"],
                ["Prakash Kumar · RKM0071", "41%"],
              ].map(([name, conf]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-md border border-border p-2"
                >
                  <span>{name}</span>
                  <StatusBadge tone={conf === "92%" ? "success" : "neutral"}>{conf}</StatusBadge>
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm">Confirm</Button>
                <Button size="sm" variant="ghost">
                  Ignore
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-4 text-sm">
              <Field id="ds-units" label="Units produced (இன்று)">
                <Input id="ds-units" inputMode="numeric" className="h-11" defaultValue="412" />
              </Field>
              <Field id="ds-shift" label="Shift">
                <Select defaultValue="day">
                  <SelectTrigger id="ds-shift" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Button className="h-11 w-full">Submit entry</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex items-center gap-3">
                <CircularProgress value={100} size={48} stroke={5} label="Weights" tone="success" />
                <p>Weights total 100% ✓</p>
              </div>
              {[
                ["Output", 50],
                ["Quality pass rate", 30],
                ["Attendance", 20],
              ].map(([m, w]) => (
                <div key={String(m)} className="flex items-center gap-2">
                  <GripVertical className="size-4 text-muted-foreground" aria-hidden />
                  <span className="flex-1">{m}</span>
                  <span className="font-mono">{w}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Comparison policy selector · Behaviour rule card">
        <div className="grid gap-4 lg:grid-cols-2">
          <RadioGroup value={policy} onValueChange={setPolicy} className="space-y-2">
            {[
              ["rank", "Rank", "Pooja #1 · Priya #2 · Fatima #3"],
              ["target", "Against own target", "Pooja 128% · Priya 121%"],
              ["improvement", "Improvement", "Fatima +14% · Pooja +6%"],
            ].map(([value = "", label, preview]) => (
              <Label
                key={value}
                htmlFor={`pol-${value}`}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 font-normal",
                  policy === value ? "border-primary bg-primary/5" : "border-border",
                )}
              >
                <RadioGroupItem id={`pol-${value}`} value={value} className="mt-0.5" />
                <span>
                  <span className="block font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">Preview: {preview}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">Low attendance nudge</p>
                <StatusBadge tone="private">Private</StatusBadge>
              </div>
              <p>
                When attendance &lt; 90% for 2 weeks → private nudge to the employee, then alert the
                manager after 14 days.
              </p>
              <p className="text-xs text-muted-foreground">
                Active · cooldown 7 days · needs manager confirmation
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Switch defaultChecked aria-label="Rule active" /> Active
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}

function Specs() {
  return (
    <>
      <Section title="Responsive breakpoints (§8.1)">
        <SpecTable head={["Breakpoint", "Width", "Layout"]} rows={breakpoints.map((b) => [...b])} />
        <p className="mt-2 text-xs text-muted-foreground">
          Tap targets are at least 44 × 44 px. On phones, approvals support swipe right to approve
          and swipe left to reject, lists support pull to refresh, and wide tables become cards.
        </p>
      </Section>

      <Section title="Dark mode (§10.1)">
        <p className="text-sm text-muted-foreground">
          Every colour is a token with a light and a dark value (see Foundations). Charts use chart
          tokens, illustrations use theme tokens, and the WhatsApp preview keeps its brand colours
          only in light mode. Toggle with the moon icon in the top bar; the choice is remembered.
        </p>
      </Section>

      <Section title="Motion (Appendix B)">
        <SpecTable head={["Use", "Duration", "Easing", "Where"]} rows={motion.map((m) => [...m])} />
        <p className="mt-2 text-xs text-muted-foreground">
          When the OS asks for reduced motion, or the person turns on “Reduce motion” in
          Preferences, animations and transitions are switched off.
        </p>
      </Section>

      <Section title="Multi-language layout (§8.3, §8.4)">
        <div className="divide-y divide-border rounded-lg border border-border">
          {scripts.map(([code, name, sample, font]) => (
            <div
              key={code}
              className="grid gap-1 p-3 sm:grid-cols-[4rem_7rem_1fr_12rem] sm:items-center"
            >
              <span className="font-mono text-xs text-muted-foreground">{code}</span>
              <span className="font-medium">{name}</span>
              <span lang={code}>{sample}</span>
              <span className="text-xs text-muted-foreground">{font}</span>
            </div>
          ))}
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Layouts allow 30–40% longer text: labels wrap, buttons never truncate verbs.</li>
          <li>Line height 1.5 for Indic scripts so matras and conjuncts are not clipped.</li>
          <li>
            Numbers use Indian grouping ({formatIndianNumber(100000)}), money “
            {formatRupees(100000)}”, dates DD/MM/YYYY, time IST.
          </li>
          <li>Language names are shown in their own script in every dropdown.</li>
          <li>Missing translations fall back to English and the admin is warned.</li>
        </ul>
      </Section>

      <Section title="Accessibility (§9)">
        <p className="text-sm text-muted-foreground">
          The audit report, the handoff notes and the full checklist coverage matrix live in the
          repository under <code>docs/</code>. Preferences offers high contrast, larger text,
          reduced motion and low-data mode; skip links, focus outlines, labelled icon buttons and
          live regions are used throughout.
        </p>
      </Section>
    </>
  );
}

function SpecTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            {head.map((h) => (
              <th key={h} scope="col" className="p-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-border last:border-0">
              {row.map((cell, i) => (
                <td key={i} className={cn("p-3", i === 0 && "font-medium")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({
  id,
  label,
  helper,
  error,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {helper && (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
