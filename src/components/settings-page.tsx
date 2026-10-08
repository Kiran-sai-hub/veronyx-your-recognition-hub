import { Check, Download, Minus, Pencil, Plus, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatRupees, isValidGstin, isValidUdyam } from "@/lib/format";
import {
  invoices,
  localeName,
  notificationTemplates as initialTemplates,
  permissions as initialPermissions,
  roleAssignments as initialAssignments,
  roleDescriptions,
  roles,
  templateLocales,
  whatsappTemplates as initialWa,
  type NotificationTemplate,
} from "@/lib/phase3-data";
import { useDemoStore } from "@/store/demo-store";

export function SettingsPage({ tab = "org" }: { tab?: string | undefined }) {
  const [legalName, setLegalName] = useState("Radha Krishna Mills Private Limited");
  const [gstin, setGstin] = useState("33AABCR1234F1Z5");
  const [udyam, setUdyam] = useState("UDYAM-TN-03-0012345");
  const [saved, setSaved] = useState(true);
  const [perms, setPerms] = useState(initialPermissions);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [templates, setTemplates] = useState(initialTemplates);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [editLocale, setEditLocale] = useState<string>("en");
  const [waTemplates, setWaTemplates] = useState(initialWa);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("Manager");
  const logAudit = useDemoStore((s) => s.logAudit);
  const gstinOk = isValidGstin(gstin);
  const udyamOk = isValidUdyam(udyam);

  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 800);
    return () => clearTimeout(t);
  }, [legalName, gstin, udyam]);

  const toggle = (row: number, col: number) => {
    if (roles[col] === "Owner") return;
    setPerms((list) =>
      list.map((p, i) =>
        i === row ? { ...p, grants: p.grants.map((g, j) => (j === col ? !g : g)) } : p,
      ),
    );
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Settings"
        title="Organisation settings"
        description="Org profile, roles and permissions, notification templates, integrations and your plan. Privacy & DPDP lives in the Compliance centre."
      />

      <Tabs key={tab} defaultValue={tab}>
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="org">Org Profile</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notification Templates</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp templates</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing & plan</TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Company details</CardTitle>
              <span className="text-xs text-muted-foreground">
                {saved ? "All changes saved" : "Saving…"}
              </span>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="legal">Legal name</Label>
                <Input
                  id="legal"
                  value={legalName}
                  maxLength={120}
                  onChange={(e) => setLegalName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={gstin}
                  aria-invalid={!gstinOk}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                />
                {!gstinOk && (
                  <p className="text-xs text-destructive">15 characters, like 33AABCR1234F1Z5</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="udyam">Udyam number</Label>
                <Input
                  id="udyam"
                  value={udyam}
                  aria-invalid={!udyamOk}
                  onChange={(e) => setUdyam(e.target.value.toUpperCase())}
                />
                {!udyamOk && (
                  <p className="text-xs text-destructive">Format: UDYAM-TN-03-0012345</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>MSME category</Label>
                <Select defaultValue="Small">
                  <SelectTrigger aria-label="MSME category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Micro", "Small", "Medium"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time zone</Label>
                <Input value="Asia/Kolkata (IST)" readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    {roles.map((r) => (
                      <TableHead key={r} className="text-center">
                        {r}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perms.map((p, row) => (
                    <TableRow key={p.name}>
                      <TableCell>{p.name}</TableCell>
                      {p.grants.map((g, col) => (
                        <TableCell key={roles[col]} className="text-center">
                          <button
                            type="button"
                            aria-label={`${p.name} for ${roles[col]}: ${g ? "allowed" : "not allowed"}`}
                            aria-pressed={g}
                            disabled={roles[col] === "Owner"}
                            onClick={() => toggle(row, col)}
                            className={
                              g
                                ? "mx-auto grid size-7 place-items-center rounded-md bg-primary/10 text-primary disabled:opacity-60"
                                : "mx-auto grid size-7 place-items-center rounded-md bg-muted text-muted-foreground"
                            }
                          >
                            {g ? <Check className="size-4" /> : <Minus className="size-4" />}
                          </button>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                logAudit({
                  actor: "Lakshmi Menon",
                  action: "Saved permission matrix",
                  target: "Roles & Permissions",
                  type: "settings",
                });
                toast.success("Permissions saved and logged");
              }}
            >
              Save permissions
            </Button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_2fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {roles.map((r) => (
                  <div key={r}>
                    <p className="font-medium">
                      {r}{" "}
                      <span className="font-normal text-muted-foreground">
                        ·{" "}
                        {assignments.filter((a) => a.role === r).length ||
                          (r === "Employee" ? 199 : 0)}{" "}
                        people
                      </span>
                    </p>
                    <p className="text-muted-foreground">{roleDescriptions[r]}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignments</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Everyone else has the Employee role. Changes take effect at the next sign-in and
                  are logged.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="divide-y divide-border">
                  {assignments.map((a, i) => (
                    <li
                      key={a.email}
                      className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="min-w-0">
                        <span className="font-medium">{a.name}</span>
                        <span className="block truncate text-muted-foreground">
                          {a.email} · {a.scope}
                        </span>
                      </span>
                      <Select
                        value={a.role}
                        disabled={a.role === "Owner"}
                        onValueChange={(v) => {
                          setAssignments((list) =>
                            list.map((x, j) => (j === i ? { ...x, role: v as typeof a.role } : x)),
                          );
                          logAudit({
                            actor: "Lakshmi Menon",
                            action: "Changed role",
                            target: `${a.name} · ${a.role} → ${v}`,
                            type: "settings",
                          });
                          toast.success(`${a.name} is now ${v}.`);
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-36" aria-label={`Role for ${a.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r} value={r} disabled={r === "Owner"}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </li>
                  ))}
                </ul>
                <form
                  className="flex flex-col gap-2 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!/^\S+@\S+\.\S+$/.test(inviteEmail)) {
                      toast.error("Enter a valid email address.");
                      return;
                    }
                    setAssignments((list) => [
                      ...list,
                      {
                        name: inviteEmail.split("@")[0] ?? inviteEmail,
                        email: inviteEmail,
                        role: inviteRole as (typeof roles)[number],
                        scope: "Invite sent",
                      },
                    ]);
                    setInviteEmail("");
                    toast.success(`Invite sent to ${inviteEmail}.`);
                  }}
                >
                  <Input
                    type="email"
                    placeholder="name@rkmills.in"
                    aria-label="Email to invite"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-full sm:w-36" aria-label="Role to give">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles
                        .filter((r) => r !== "Owner")
                        .map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit">
                    <Plus className="size-4" /> Invite
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-3">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>
                      <span className="sr-only">Edit</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((t) => {
                    const missing = templateLocales.filter((l) => !t.body[l]);
                    return (
                      <TableRow key={t.name}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>{t.channel}</TableCell>
                        <TableCell>
                          <span className="flex flex-wrap gap-1">
                            {templateLocales.map((l) => (
                              <span
                                key={l}
                                className={
                                  t.body[l]
                                    ? "rounded border border-border px-1.5 text-xs uppercase"
                                    : "rounded border border-dashed border-warning px-1.5 text-xs uppercase text-muted-foreground line-through"
                                }
                                title={
                                  t.body[l]
                                    ? localeName[l]
                                    : `${localeName[l]} missing — English is sent`
                                }
                              >
                                {l}
                              </span>
                            ))}
                          </span>
                          {missing.length > 0 && (
                            <span className="mt-1 flex items-center gap-1 text-xs text-warning-foreground">
                              <TriangleAlert className="size-3" /> {missing.length} missing — falls
                              back to English
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditing(t);
                              setEditLocale("en");
                            }}
                          >
                            <Pencil className="size-4" /> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {editing && (
            <Card>
              <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">
                  {editing.name} · {editing.channel}
                </CardTitle>
                <div className="flex flex-wrap gap-1" role="group" aria-label="Language">
                  {templateLocales.map((l) => (
                    <Button
                      key={l}
                      size="sm"
                      variant={editLocale === l ? "default" : "outline"}
                      aria-pressed={editLocale === l}
                      onClick={() => setEditLocale(l)}
                    >
                      {localeName[l]}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {!editing.body[editLocale as (typeof templateLocales)[number]] && (
                  <p className="rounded-md bg-warning/10 p-3 text-sm">
                    No {localeName[editLocale]} version yet. People who chose{" "}
                    {localeName[editLocale]} get the English text until you add one.
                  </p>
                )}
                <Label htmlFor="template-body">Message ({localeName[editLocale]})</Label>
                <Textarea
                  id="template-body"
                  rows={3}
                  value={editing.body[editLocale as (typeof templateLocales)[number]] ?? ""}
                  placeholder={editing.body.en}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      body: { ...editing.body, [editLocale]: e.target.value },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Variables in double braces are filled in per person, e.g. {"{{name}}"}.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setTemplates((list) =>
                        list.map((t) => (t.name === editing.name ? editing : t)),
                      );
                      setEditing(null);
                      toast.success("Template saved.");
                    }}
                  >
                    Save template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6 space-y-3">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Meta approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waTemplates.map((t) => (
                    <TableRow key={t.name}>
                      <TableCell>
                        <span className="font-mono text-sm">{t.name}</span>
                        {t.note && (
                          <span className="block max-w-sm text-xs text-muted-foreground">
                            {t.note}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell className="uppercase text-muted-foreground">
                        {t.languages.join(" · ")}
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            tone={
                              t.status === "Approved"
                                ? "success"
                                : t.status === "Pending"
                                  ? "warning"
                                  : "error"
                            }
                          >
                            {t.status}
                          </StatusBadge>
                          {t.status === "Rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setWaTemplates((list) =>
                                  list.map((x) =>
                                    x.name === t.name
                                      ? {
                                          ...x,
                                          status: "Pending",
                                          note: "Resubmitted to Meta today.",
                                        }
                                      : x,
                                  ),
                                );
                                toast.success(`${t.name} resubmitted for approval.`);
                              }}
                            >
                              Fix & resubmit
                            </Button>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Utility templates carry recognition and voucher updates; Authentication is only for
            OTPs; Marketing needs separate consent. Only approved templates can be sent.
          </p>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            [
              "Sign-in (SSO)",
              "Google Workspace and Microsoft 365 sign-in for office staff.",
              "Connected · Google",
              true,
            ],
            [
              "WhatsApp Business API",
              "Sends recognition, OTPs and vouchers from +91 80470 12345.",
              "Connected · quality rating High",
              true,
            ],
            [
              "Payroll",
              "Monthly export format for Keka, greytHR, RazorpayX, Zoho Payroll or CSV.",
              "Format: Keka",
              true,
            ],
            [
              "Voucher aggregator",
              "Supplies Amazon, Flipkart, Swiggy and fuel vouchers.",
              "Connected · wallet ₹ 85,000",
              true,
            ],
            [
              "Email (SMTP)",
              "Sends weekly summaries from rewards@rkmills.in.",
              "Not connected",
              false,
            ],
          ].map(([name, detail, status, on]) => (
            <Card key={name as string} className="rounded-lg">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="font-medium">{name as string}</p>
                  <p className="text-sm text-muted-foreground">{detail as string}</p>
                  <p
                    className={
                      on ? "mt-2 text-xs text-success" : "mt-2 text-xs text-muted-foreground"
                    }
                  >
                    {status as string}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.success(
                      on ? `${name as string} settings opened` : `Connecting ${name as string}…`,
                    )
                  }
                >
                  {on ? "Manage" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
          <Card className="rounded-lg border-dashed md:col-span-2">
            <CardContent className="flex flex-wrap items-center justify-between gap-2 p-5 text-sm">
              Performance data sources (CRM, sheets, helpdesk, webhooks) are managed in Connectors &
              Data.
              <Button size="sm" variant="ghost" asChild>
                <a href="/connectors">Open Connectors & Data</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Growth plan · 200 seats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="mb-1 flex justify-between">
                  <span>Active employees</span>
                  <span>199 of 200</span>
                </div>
                <Progress value={99.5} aria-label="Seat usage" />
              </div>
              <div>
                <div className="mb-1 flex justify-between">
                  <span>WhatsApp messages this month</span>
                  <span>3,420 of 5,000</span>
                </div>
                <Progress value={68} aria-label="Message usage" />
              </div>
              <p className="text-muted-foreground">Renews on 01/11/2026</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border text-sm">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-2 py-2">
                    <span>
                      {inv.id} <span className="text-muted-foreground">· {inv.date} · paid</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {formatRupees(inv.amount)}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Download ${inv.id}`}
                        onClick={() => toast.success(`${inv.id}.pdf downloaded (sample)`)}
                      >
                        <Download className="size-4" />
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
