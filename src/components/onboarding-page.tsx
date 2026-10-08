import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileSpreadsheet,
  MapPin,
  MessageCircle,
  Plus,
  SkipForward,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Brand } from "@/components/brand";
import { EmployeeImportWizard } from "@/components/employee-import";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isValidGstin, isValidUdyam } from "@/lib/format";
import { languageOptions } from "@/lib/mock-data";
import { go } from "@/lib/navigate";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";

const steps = [
  {
    label: "Org profile",
    description: "Tell us about your organisation. This personalises templates and suggestions.",
  },
  {
    label: "Departments & teams",
    description: "Add how your people are organised, who manages each team, and where they work.",
  },
  { label: "Import employees", description: "Bring your employee list into Veronyx." },
  {
    label: "Invite team",
    description: "Invite the HR Admin and managers who will run the programme.",
  },
  {
    label: "First data source",
    description: "Choose where performance data will come from. You can also do this later.",
  },
] as const;

const industries = [
  "Manufacturing",
  "IT Services",
  "Retail",
  "BFSI",
  "Healthcare",
  "Logistics",
  "Hospitality",
  "Other",
];
const employeeBands = ["1–24", "25–99", "100–249", "250–499", "500+"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const locationTypes = ["Office", "Plant", "Store", "Warehouse", "Field", "Remote"];

type Org = {
  legalName: string;
  displayName: string;
  gstin: string;
  udyam: string;
  industry: string;
  band: string;
  timezone: string;
  fiscalStart: string;
  locale: string;
};

type Department = { name: string; code: string; teams: { name: string; manager: string }[] };
type Location = { name: string; type: string };
type Invite = {
  contact: string;
  role: "HR Admin" | "Manager";
  channel: "Email" | "WhatsApp";
  scope: string;
};

export function OnboardingPage() {
  const [account, setAccount] = useState(false);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(true);
  const [touched, setTouched] = useState(false);
  const [org, setOrg] = useState<Org>({
    legalName: "Radha Krishna Mills Private Limited",
    displayName: "Radha Krishna Mills",
    gstin: "",
    udyam: "",
    industry: "Manufacturing",
    band: "100–249",
    timezone: "Asia/Kolkata",
    fiscalStart: "April",
    locale: "en",
  });
  const [departments, setDepartments] = useState<Department[]>([
    {
      name: "Manufacturing",
      code: "MFG",
      teams: [
        { name: "Manufacturing A", manager: "Selvi Murugan" },
        { name: "Manufacturing B", manager: "" },
      ],
    },
    { name: "Quality", code: "QA", teams: [{ name: "Quality A", manager: "Anjali Desai" }] },
    { name: "Sales", code: "SAL", teams: [{ name: "Sales A", manager: "Vikram Rao" }] },
  ]);
  const [locations, setLocations] = useState<Location[]>([
    { name: "Coimbatore", type: "Plant" },
    { name: "Chennai", type: "Office" },
  ]);
  const [imported, setImported] = useState(0);
  const [invites, setInvites] = useState<Invite[]>([
    {
      contact: "lakshmi@rkmills.in",
      role: "HR Admin",
      channel: "Email",
      scope: "Whole organisation",
    },
  ]);
  const [source, setSource] = useState<string | null>(null);
  const setPersona = useAppStore((s) => s.setPersona);
  const finishOnboarding = useDemoStore((s) => s.finishOnboarding);

  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => setSaved(true), 600);
    return () => window.clearTimeout(timer);
  }, [step, org, departments, locations, invites]);

  const gstinInvalid = org.gstin.length > 0 && !isValidGstin(org.gstin);
  const udyamInvalid = org.udyam.length > 0 && !isValidUdyam(org.udyam);
  const orgValid = org.legalName.trim().length > 0 && !gstinInvalid && !udyamInvalid;

  const next = () => {
    if (step === 0 && !orgValid) {
      setTouched(true);
      return;
    }
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const finish = () => {
    finishOnboarding();
    setPersona("owner");
    toast.success("Your organisation is ready.");
    go("/dashboard/owner");
  };

  if (!account) return <SignUp onDone={() => setAccount(true)} />;

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Brand />
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {saved ? "All changes saved" : "Saving…"}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="sr-only">Set up your organisation</h1>
        <div className="mb-8">
          <div className="mb-3 flex justify-between text-xs text-muted-foreground">
            <span>
              Step {step + 1} of {steps.length}
            </span>
            <span>{steps[step]?.label}</span>
          </div>
          <Progress value={((step + 1) / steps.length) * 100} aria-label="Setup progress" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <ol className="hidden space-y-1 lg:block" aria-label="Setup steps">
            {steps.map((s, index) => (
              <li key={s.label}>
                <button
                  type="button"
                  disabled={index > step}
                  onClick={() => setStep(index)}
                  aria-current={index === step ? "step" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm",
                    index === step
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground",
                    index < step && "hover:bg-background",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full border border-current text-xs",
                      index < step && "border-success bg-success text-success-foreground",
                    )}
                  >
                    {index < step ? <Check className="size-3" /> : index + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{steps[step]?.label}</CardTitle>
              <CardDescription>{steps[step]?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {step === 0 && <OrgForm org={org} onChange={setOrg} touched={touched} />}
              {step === 1 && (
                <TeamsForm
                  departments={departments}
                  onDepartments={setDepartments}
                  locations={locations}
                  onLocations={setLocations}
                />
              )}
              {step === 2 &&
                (imported > 0 ? (
                  <div className="flex items-center gap-3 rounded-md border border-success/30 bg-success/10 p-4 text-sm">
                    <Check className="text-success" /> {imported} employees imported.
                    <Button
                      variant="link"
                      className="ml-auto h-auto p-0"
                      onClick={() => setImported(0)}
                    >
                      Import more
                    </Button>
                  </div>
                ) : (
                  <EmployeeImportWizard onDone={setImported} />
                ))}
              {step === 3 && (
                <InviteForm invites={invites} onInvites={setInvites} departments={departments} />
              )}
              {step === 4 && <DataSource value={source} onChange={setSource} />}
            </CardContent>
            <div className="sticky bottom-0 flex flex-wrap justify-between gap-3 border-t border-border bg-background p-5">
              <Button
                variant="outline"
                onClick={() => setStep((v) => Math.max(0, v - 1))}
                disabled={step === 0}
              >
                <ArrowLeft />
                Back
              </Button>
              {step < steps.length - 1 ? (
                <div className="flex gap-2">
                  {step === 2 && imported === 0 && (
                    <Button variant="ghost" onClick={next}>
                      Do this later
                    </Button>
                  )}
                  {!(step === 2 && imported === 0) && (
                    <Button onClick={next}>
                      Continue
                      <ArrowRight />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={finish}>
                    <SkipForward /> Skip — do later
                  </Button>
                  <Button onClick={finish} disabled={!source}>
                    Finish setup
                    <Check />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  help,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string | false;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : help ? (
        <p className="mt-1 text-xs text-muted-foreground">{help}</p>
      ) : null}
    </div>
  );
}

function SimpleSelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[] | string[];
}) {
  const pairs = options.map((o) => (typeof o === "string" ? ([o, o] as const) : o));
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {pairs.map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function OrgForm({
  org,
  onChange,
  touched,
}: {
  org: Org;
  onChange: (o: Org) => void;
  touched: boolean;
}) {
  const set = (patch: Partial<Org>) => onChange({ ...org, ...patch });
  const gstinError =
    org.gstin.length > 0 &&
    !isValidGstin(org.gstin) &&
    "Enter a valid 15-character GSTIN, e.g. 33ABCDE1234F1Z5.";
  const udyamError =
    org.udyam.length > 0 && !isValidUdyam(org.udyam) && "Use the format UDYAM-TN-03-0012345.";
  const nameError = touched && !org.legalName.trim() && "Legal name is required.";
  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field id="legal-name" label="Legal name" error={nameError}>
            <Input
              id="legal-name"
              value={org.legalName}
              onChange={(e) => set({ legalName: e.target.value })}
              aria-required
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "legal-name-error" : undefined}
            />
          </Field>
        </div>
        <Field
          id="display-name"
          label="Display name"
          optional
          help="Shown to employees on WhatsApp and the app."
        >
          <Input
            id="display-name"
            value={org.displayName}
            onChange={(e) => set({ displayName: e.target.value })}
          />
        </Field>
        <Field id="gstin" label="GSTIN" optional error={gstinError}>
          <Input
            id="gstin"
            className="uppercase"
            value={org.gstin}
            onChange={(e) => set({ gstin: e.target.value })}
            placeholder="33ABCDE1234F1Z5"
            aria-invalid={Boolean(gstinError)}
            aria-describedby={gstinError ? "gstin-error" : undefined}
          />
        </Field>
        <Field id="udyam" label="Udyam number" optional error={udyamError}>
          <Input
            id="udyam"
            className="uppercase"
            value={org.udyam}
            onChange={(e) => set({ udyam: e.target.value })}
            placeholder="UDYAM-TN-03-0012345"
            aria-invalid={Boolean(udyamError)}
            aria-describedby={udyamError ? "udyam-error" : undefined}
          />
        </Field>
      </div>
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-semibold">Industry & team size</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="industry" label="Industry">
            <SimpleSelect
              id="industry"
              value={org.industry}
              onChange={(v) => set({ industry: v })}
              options={industries}
            />
          </Field>
          <Field id="band" label="Employee count">
            <SimpleSelect
              id="band"
              value={org.band}
              onChange={(v) => set({ band: v })}
              options={employeeBands}
            />
          </Field>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-primary">
          <Sparkles className="size-3.5" /> We'll suggest {org.industry.toLowerCase()} templates for
          a team of {org.band}.
        </p>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="timezone" label="Timezone">
          <SimpleSelect
            id="timezone"
            value={org.timezone}
            onChange={(v) => set({ timezone: v })}
            options={[
              ["Asia/Kolkata", "Asia/Kolkata (IST, UTC+5:30)"],
              ["Asia/Dubai", "Asia/Dubai (GST, UTC+4)"],
              ["Asia/Singapore", "Asia/Singapore (UTC+8)"],
            ]}
          />
        </Field>
        <Field id="fiscal" label="Fiscal year starts">
          <SimpleSelect
            id="fiscal"
            value={org.fiscalStart}
            onChange={(v) => set({ fiscalStart: v })}
            options={months}
          />
        </Field>
        <Field id="locale" label="Default language">
          <SimpleSelect
            id="locale"
            value={org.locale}
            onChange={(v) => set({ locale: v })}
            options={languageOptions.map(([code, name]) => [code, `${name} (${code}-IN)`] as const)}
          />
        </Field>
      </div>
    </div>
  );
}

function TeamsForm({
  departments,
  onDepartments,
  locations,
  onLocations,
}: {
  departments: Department[];
  onDepartments: (d: Department[]) => void;
  locations: Location[];
  onLocations: (l: Location[]) => void;
}) {
  const [dept, setDept] = useState({ name: "", code: "" });
  const [team, setTeam] = useState({ dept: departments[0]?.name ?? "", name: "", manager: "" });
  const [loc, setLoc] = useState({ name: "", type: "Plant" });
  const managers = ["Suresh Babu", "Meena Pillai", "Vikram Rao", "Arun Kumar", "Kavitha Iyer"];

  return (
    <div className="space-y-6">
      <section className="space-y-3" aria-labelledby="dept-heading">
        <h3 id="dept-heading" className="flex items-center gap-2 font-semibold">
          <Building2 className="size-4 text-primary" /> Departments & teams
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {departments.map((d) => (
            <div key={d.code} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between">
                <p className="font-semibold">
                  {d.name} <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={`Remove ${d.name}`}
                  onClick={() => onDepartments(departments.filter((x) => x.code !== d.code))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {d.teams.length === 0 && <li className="text-muted-foreground">No teams yet</li>}
                {d.teams.map((t) => (
                  <li key={t.name} className="flex justify-between gap-2">
                    <span>{t.name}</span>
                    <span className={t.manager ? "text-muted-foreground" : "text-warning"}>
                      {t.manager || "No manager — skip for now"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="grid gap-2 rounded-md bg-muted/60 p-3 sm:grid-cols-[1fr_120px_auto]">
          <Input
            aria-label="Department name"
            placeholder="Department name"
            value={dept.name}
            onChange={(e) => setDept({ ...dept, name: e.target.value })}
          />
          <Input
            aria-label="Department code"
            placeholder="Code"
            value={dept.code}
            onChange={(e) => setDept({ ...dept, code: e.target.value.toUpperCase() })}
          />
          <Button
            variant="outline"
            disabled={!dept.name.trim() || !dept.code.trim()}
            onClick={() => {
              onDepartments([...departments, { ...dept, teams: [] }]);
              setTeam({ ...team, dept: dept.name });
              setDept({ name: "", code: "" });
            }}
          >
            <Plus /> Add department
          </Button>
        </div>
        <div className="grid gap-2 rounded-md bg-muted/60 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <SimpleSelect
            id="team-dept"
            value={team.dept}
            onChange={(v) => setTeam({ ...team, dept: v })}
            options={departments.map((d) => d.name)}
          />
          <Input
            aria-label="Team name"
            placeholder="Team name"
            value={team.name}
            onChange={(e) => setTeam({ ...team, name: e.target.value })}
          />
          <Select
            value={team.manager || "skip"}
            onValueChange={(v) => setTeam({ ...team, manager: v === "skip" ? "" : v })}
          >
            <SelectTrigger aria-label="Team manager">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Assign manager later</SelectItem>
              {managers.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={!team.name.trim() || !team.dept}
            onClick={() => {
              onDepartments(
                departments.map((d) =>
                  d.name === team.dept
                    ? { ...d, teams: [...d.teams, { name: team.name, manager: team.manager }] }
                    : d,
                ),
              );
              setTeam({ ...team, name: "", manager: "" });
            }}
          >
            <Users /> Add team
          </Button>
        </div>
      </section>
      <section className="space-y-3" aria-labelledby="loc-heading">
        <h3 id="loc-heading" className="flex items-center gap-2 font-semibold">
          <MapPin className="size-4 text-primary" /> Locations
        </h3>
        <ul className="flex flex-wrap gap-2">
          {locations.map((l) => (
            <li
              key={l.name}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
            >
              {l.name} <span className="text-xs text-muted-foreground">{l.type}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${l.name}`}
                onClick={() => onLocations(locations.filter((x) => x.name !== l.name))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 rounded-md bg-muted/60 p-3 sm:grid-cols-[1fr_160px_auto]">
          <Input
            aria-label="Location name"
            placeholder="Location name, e.g. Tiruppur unit"
            value={loc.name}
            onChange={(e) => setLoc({ ...loc, name: e.target.value })}
          />
          <SimpleSelect
            id="loc-type"
            value={loc.type}
            onChange={(v) => setLoc({ ...loc, type: v })}
            options={locationTypes}
          />
          <Button
            variant="outline"
            disabled={!loc.name.trim()}
            onClick={() => {
              onLocations([...locations, loc]);
              setLoc({ name: "", type: "Plant" });
            }}
          >
            <Plus /> Add location
          </Button>
        </div>
      </section>
    </div>
  );
}

function InviteForm({
  invites,
  onInvites,
  departments,
}: {
  invites: Invite[];
  onInvites: (i: Invite[]) => void;
  departments: Department[];
}) {
  const [draft, setDraft] = useState<Invite>({
    contact: "",
    role: "Manager",
    channel: "Email",
    scope: departments[0]?.teams[0]?.name ?? "Whole organisation",
  });
  const valid =
    draft.channel === "Email"
      ? /^\S+@\S+\.\S+$/.test(draft.contact)
      : draft.contact.replace(/\D/g, "").length === 10;
  const scopes = ["Whole organisation", ...departments.flatMap((d) => d.teams.map((t) => t.name))];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-md bg-muted/60 p-3 sm:grid-cols-2 lg:grid-cols-[110px_120px_1fr_1fr_auto]">
        <SimpleSelect
          id="invite-role"
          value={draft.role}
          onChange={(v) =>
            setDraft({
              ...draft,
              role: v as Invite["role"],
              channel: v === "HR Admin" ? "Email" : draft.channel,
            })
          }
          options={["HR Admin", "Manager"]}
        />
        <SimpleSelect
          id="invite-channel"
          value={draft.channel}
          onChange={(v) => setDraft({ ...draft, channel: v as Invite["channel"], contact: "" })}
          options={draft.role === "HR Admin" ? ["Email"] : ["Email", "WhatsApp"]}
        />
        <Input
          aria-label={draft.channel === "Email" ? "Work email" : "WhatsApp number"}
          placeholder={draft.channel === "Email" ? "name@company.in" : "+91 98765 43210"}
          value={draft.contact}
          onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
        />
        <SimpleSelect
          id="invite-scope"
          value={draft.scope}
          onChange={(v) => setDraft({ ...draft, scope: v })}
          options={scopes}
        />
        <Button
          disabled={!valid}
          onClick={() => {
            onInvites([...invites, draft]);
            setDraft({ ...draft, contact: "" });
            toast.success(`Invitation added for ${draft.contact}`);
          }}
        >
          <Plus /> Add
        </Button>
      </div>
      <ul className="divide-y divide-border rounded-md border border-border">
        {invites.map((i) => (
          <li
            key={i.contact}
            className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
          >
            <div>
              <p className="flex items-center gap-2 font-medium">
                {i.channel === "WhatsApp" && <MessageCircle className="size-4 text-success" />}
                {i.contact}
              </p>
              <p className="text-xs text-muted-foreground">
                {i.role} · Scope: {i.scope} · via {i.channel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-success">Will be sent when you finish</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Remove ${i.contact}`}
                onClick={() => onInvites(invites.filter((x) => x.contact !== i.contact))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataSource({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="First data source">
        {[
          ["CSV upload", "Upload a monthly file from your computer", "2 min"],
          ["Google Sheets", "Keep a supervisor's sheet in sync", "5 min"],
          ["Zoho CRM", "Pull deals and targets from Zoho", "5 min · OAuth"],
        ].map(([name, detail, time]) => (
          <button
            type="button"
            role="radio"
            aria-checked={value === name}
            key={name}
            onClick={() => onChange(name!)}
            className={cn(
              "rounded-lg border p-5 text-left",
              value === name
                ? "border-2 border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
            )}
          >
            <FileSpreadsheet className="size-6 text-primary" />
            <p className="mt-4 font-semibold">{name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            <p className="mt-2 text-xs text-muted-foreground">Setup: {time}</p>
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {value
          ? `${value} will be the first step on your dashboard checklist.`
          : "Not sure yet? Skip — you can connect sources any time from Connectors & Data."}
      </p>
    </div>
  );
}

/** Checklist §4.1 step 1: sign up with email + password or SSO, then go to the setup wizard. */
function SignUp({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("ramesh@rkmills.in");
  const [password, setPassword] = useState("");
  const [restrict, setRestrict] = useState(true);
  const [error, setError] = useState("");
  const domain = email.split("@")[1] ?? "";
  const strength =
    password.length >= 12 && /\d/.test(password) && /[A-Za-z]/.test(password)
      ? "Strong"
      : password.length >= 8
        ? "Okay"
        : "Too short";
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid work email.");
    if (/@(gmail|yahoo|outlook|hotmail)\./i.test(email) && restrict)
      return setError(
        "That looks like a personal address. Use your work email, or turn off the domain check.",
      );
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    setError("");
    toast.success("Account created. Let's set up your organisation.");
    onDone();
  };
  return (
    <main className="grid min-h-screen place-items-center bg-muted p-4">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <Brand />
          <h1 className="pt-4 text-2xl font-semibold">Create your account</h1>
          <CardDescription>Then a short 5-step setup for your organisation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit} noValidate>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={onDone}>
                Google
              </Button>
              <Button type="button" variant="outline" onClick={onDone}>
                Microsoft
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">or with email</p>
            <div className="space-y-1.5">
              <Label htmlFor="su-email">Work email</Label>
              <Input
                id="su-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "su-error" : undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="su-password">Password</Label>
              <Input
                id="su-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="su-strength"
              />
              <p id="su-strength" className="text-xs text-muted-foreground">
                Strength: {password ? strength : "—"} · at least 8 characters
              </p>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4"
                checked={restrict}
                onChange={(e) => setRestrict(e.target.checked)}
              />
              <span>
                Only people with an <b>@{domain || "your-company"}</b> email can join with email
                sign-in (optional). Frontline staff still sign in with mobile OTP.
              </span>
            </label>
            {error && (
              <p id="su-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full">
              Create account and continue
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
