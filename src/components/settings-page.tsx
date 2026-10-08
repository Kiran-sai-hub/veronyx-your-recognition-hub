import { Check, Minus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRupees, isValidGstin, isValidUdyam } from "@/lib/format";
import {
  invoices,
  notificationTemplates,
  permissions as initialPermissions,
  roles,
  whatsappTemplates,
} from "@/lib/phase3-data";

export function SettingsPage() {
  const [legalName, setLegalName] = useState("Radha Krishna Mills Private Limited");
  const [gstin, setGstin] = useState("33AABCR1234F1Z5");
  const [udyam, setUdyam] = useState("UDYAM-TN-03-0012345");
  const [saved, setSaved] = useState(true);
  const [perms, setPerms] = useState(initialPermissions);
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
        description="Company details, who can do what, message templates and your plan."
      />

      <Tabs defaultValue="org">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="org">Organisation</TabsTrigger>
          <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp templates</TabsTrigger>
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
                <Input value="Small" readOnly />
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
            <Button onClick={() => toast.success("Permissions saved and logged")}>
              Save permissions
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Languages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationTemplates.map((t) => (
                    <TableRow key={t.name}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.channel}</TableCell>
                      <TableCell className="uppercase text-muted-foreground">
                        {t.locales.join(" · ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="mt-3 text-xs text-muted-foreground">
            Missing a language? Employees get the English version automatically.
          </p>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Meta approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whatsappTemplates.map((t) => (
                    <TableRow key={t.name}>
                      <TableCell className="font-mono text-sm">{t.name}</TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  <li key={inv.id} className="flex justify-between py-2">
                    <span>
                      {inv.id} <span className="text-muted-foreground">· {inv.date}</span>
                    </span>
                    <span>{formatRupees(inv.amount)}</span>
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
