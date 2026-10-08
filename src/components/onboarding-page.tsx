import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileSpreadsheet,
  MapPin,
  Plus,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Brand } from "@/components/brand";
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

const steps = ["Organisation", "Teams", "Employees", "Invite", "Data source"];

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [gstin, setGstin] = useState("");
  const [udyam, setUdyam] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSaved(true), 700);
    return () => window.clearTimeout(timer);
  }, [step, gstin, udyam]);
  const next = () => {
    setSaved(false);
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };
  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Brand />
          <span className="text-xs text-muted-foreground">{saved ? "Saved" : "Saving…"}</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8">
          <div className="mb-3 flex justify-between text-xs text-muted-foreground">
            <span>
              Step {step + 1} of {steps.length}
            </span>
            <span>{steps[step]}</span>
          </div>
          <Progress value={(step + 1) * 20} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <ol className="hidden space-y-1 lg:block">
            {steps.map((label, index) => (
              <li
                key={label}
                className={
                  index === step
                    ? "flex items-center gap-3 rounded-md bg-primary/10 px-3 py-3 text-sm font-semibold text-primary"
                    : "flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground"
                }
              >
                <span
                  className={
                    index < step
                      ? "grid size-6 place-items-center rounded-full bg-success text-success-foreground"
                      : "grid size-6 place-items-center rounded-full border border-current"
                  }
                >
                  {index < step ? <Check className="size-3" /> : index + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{steps[step]}</CardTitle>
              <CardDescription>
                {
                  [
                    "Tell us about your organisation.",
                    "Add how your people are organised.",
                    "Bring your employee list into Veronyx.",
                    "Invite the people who will manage the programme.",
                    "Choose where performance data will come from.",
                  ][step]
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 0 && (
                <OrgForm gstin={gstin} udyam={udyam} onGstin={setGstin} onUdyam={setUdyam} />
              )}
              {step === 1 && <TeamsForm />}
              {step === 2 && <ImportEmployees />}
              {step === 3 && <InviteForm />}
              {step === 4 && <DataSource />}
            </CardContent>
            <div className="sticky bottom-0 flex justify-between gap-3 border-t border-border bg-background p-5">
              <Button
                variant="outline"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0}
              >
                <ArrowLeft />
                Back
              </Button>
              {step < 4 ? (
                <Button onClick={next}>
                  Continue
                  <ArrowRight />
                </Button>
              ) : (
                <Button asChild>
                  <a href="/me">
                    Finish setup
                    <Check />
                  </a>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function OrgForm({
  gstin,
  udyam,
  onGstin,
  onUdyam,
}: {
  gstin: string;
  udyam: string;
  onGstin: (value: string) => void;
  onUdyam: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="legal-name">Legal name</Label>
        <Input
          id="legal-name"
          className="mt-2"
          defaultValue="Radha Krishna Mills Private Limited"
        />
      </div>
      <div>
        <Label htmlFor="display-name">Display name</Label>
        <Input id="display-name" className="mt-2" defaultValue="Radha Krishna Mills" />
      </div>
      <div>
        <Label>Industry</Label>
        <Select defaultValue="manufacturing">
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="it">IT services</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="gstin">
          GSTIN <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="gstin"
          className="mt-2 uppercase"
          value={gstin}
          onChange={(event) => onGstin(event.target.value)}
          placeholder="33ABCDE1234F1Z5"
          aria-invalid={gstin.length > 0 && !isValidGstin(gstin)}
        />
        {gstin.length > 0 && !isValidGstin(gstin) && (
          <p className="mt-1 text-xs text-destructive">Enter a valid 15-character GSTIN.</p>
        )}
      </div>
      <div>
        <Label htmlFor="udyam">
          Udyam number <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="udyam"
          className="mt-2 uppercase"
          value={udyam}
          onChange={(event) => onUdyam(event.target.value)}
          placeholder="UDYAM-TN-03-0012345"
          aria-invalid={udyam.length > 0 && !isValidUdyam(udyam)}
        />
        {udyam.length > 0 && !isValidUdyam(udyam) && (
          <p className="mt-1 text-xs text-destructive">Use the format UDYAM-TN-03-0012345.</p>
        )}
      </div>
      <div>
        <Label>Team size</Label>
        <Select defaultValue="100">
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25–99</SelectItem>
            <SelectItem value="100">100–249</SelectItem>
            <SelectItem value="250">250–499</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Default locale</Label>
        <Select defaultValue="en-IN">
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-IN">English (India)</SelectItem>
            <SelectItem value="ta-IN">தமிழ்</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
function TeamsForm() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Manufacturing", "4 teams · 2 locations"],
          ["Quality", "2 teams · 2 locations"],
          ["Sales", "3 teams · 4 locations"],
          ["Operations", "2 teams · 2 locations"],
        ].map(([name, detail]) => (
          <div key={name} className="rounded-md border border-border p-4">
            <Building2 className="size-5 text-primary" />
            <p className="mt-3 font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline">
          <Plus />
          Add department
        </Button>
        <Button variant="outline">
          <Users />
          Add team
        </Button>
        <Button variant="outline">
          <MapPin />
          Add location
        </Button>
      </div>
    </div>
  );
}
function ImportEmployees() {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="space-y-5">
      {!uploaded ? (
        <button
          type="button"
          onClick={() => setUploaded(true)}
          className="flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-primary/50 bg-primary/5 p-8 text-center"
        >
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Upload />
          </div>
          <p className="mt-4 font-semibold">Drop your CSV or Excel file here</p>
          <p className="mt-1 text-sm text-muted-foreground">Up to 20 MB and 50,000 rows</p>
          <span className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Choose file
          </span>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border border-success/30 bg-success/10 p-4">
            <FileSpreadsheet className="text-success" />
            <div className="flex-1">
              <p className="font-medium">employee_master_october.xlsx</p>
              <p className="text-xs text-muted-foreground">200 rows · 46 KB</p>
            </div>
            <Check className="text-success" />
          </div>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="p-3">Source column</th>
                  <th className="p-3">Maps to</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Employee ID", "Employee code"],
                  ["Full Name", "Full name"],
                  ["Dept", "Department"],
                  ["Mobile", "WhatsApp number"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t">
                    <td className="p-3">{row[0]}</td>
                    <td className="p-3">{row[1]}</td>
                    <td className="p-3 text-success">Mapped</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            198 valid rows · 1 warning · 1 exited employee retained for history
          </p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline">Connect Google Sheet</Button>
        <Button variant="outline">Add employees manually</Button>
      </div>
    </div>
  );
}
function InviteForm() {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="invite-email">Work email</Label>
        <div className="mt-2 flex gap-2">
          <Input id="invite-email" placeholder="manager@company.in" />
          <Button onClick={() => toast.success("Invitation added")}>Add</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Arun Kumar</p>
            <p className="text-sm text-muted-foreground">arun@rkmills.in · Manager</p>
          </div>
          <span className="text-sm text-success">Ready</span>
        </div>
      </div>
    </div>
  );
}
function DataSource() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        ["CSV upload", "Bring a file when needed"],
        ["Google Sheets", "Keep a sheet in sync"],
        ["Zoho CRM", "Connect sales activity"],
      ].map(([name, detail], index) => (
        <button
          type="button"
          key={name}
          className={
            index === 1
              ? "rounded-lg border-2 border-primary bg-primary/5 p-5 text-left"
              : "rounded-lg border border-border p-5 text-left hover:border-primary/50"
          }
        >
          <FileSpreadsheet className="size-6 text-primary" />
          <p className="mt-4 font-semibold">{name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </button>
      ))}
    </div>
  );
}
