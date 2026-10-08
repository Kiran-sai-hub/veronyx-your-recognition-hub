import {
  Download,
  FileSpreadsheet,
  FileText,
  Megaphone,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatRupees } from "@/lib/format";
import { personaUser } from "@/lib/navigation";
import { exportHistory, toCsv } from "@/lib/phase2-data";
import {
  auditLog,
  auditTypeLabel,
  consentRecords as initialConsents,
  DPR_SLA_DAYS,
  dprRequests as initialRequests,
  NOTICE_AUDIENCE,
  noticeText,
  noticeVersions,
  purposes,
  retentionClasses as initialRetention,
  slaDaysLeft,
  TAX_THRESHOLD,
  taxRows,
  taxStatus,
  today,
  type ConsentRecord,
  type DprRequest,
  type DprStage,
} from "@/lib/phase3-data";
import { useAppStore } from "@/store/app-store";
import { useDemoStore } from "@/store/demo-store";

const stages: DprStage[] = ["Received", "Acknowledged", "Processing", "Responded", "Closed"];
const noticeLanguages = ["English", "தமிழ்", "हिन्दी", "తెలుగు"];
const retentionOptions = [6, 12, 18, 24, 36, 60, 96];

function downloadFile(name: string, content: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function stamp(date = new Date()) {
  return `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

function months(n: number) {
  return n >= 24 && n % 12 === 0 ? `${n / 12} years` : `${n} months`;
}

/** H-05 Compliance centre and S-03…S-09 privacy screens — checklist §4.14. */
export function CompliancePage({ tab = "overview" }: { tab?: string | undefined }) {
  const persona = useAppStore((s) => s.persona);
  const user = personaUser[persona].name;
  const auditEvents = useDemoStore((s) => s.auditEvents);
  const payrollExports = useDemoStore((s) => s.payrollExports);
  const payrollSent = useDemoStore((s) => s.payrollSent);
  const logAudit = useDemoStore((s) => s.logAudit);

  const [requests, setRequests] = useState(initialRequests);
  const [consents, setConsents] = useState(initialConsents);
  const [retention, setRetention] = useState(initialRetention);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [noticeLang, setNoticeLang] = useState("English");
  const [notices, setNotices] = useState(noticeText);
  const [published, setPublished] = useState(false);
  const [consentPurpose, setConsentPurpose] = useState("all");
  const [consentState, setConsentState] = useState("all");
  const [auditQuery, setAuditQuery] = useState("");
  const [auditType, setAuditType] = useState("all");
  const [auditFrom, setAuditFrom] = useState("");
  const [auditTo, setAuditTo] = useState("");
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignAudience, setCampaignAudience] = useState("not-opted");
  const [campaign, setCampaign] = useState<{ sent: number; joined: number } | null>(null);
  const [withdrawing, setWithdrawing] = useState<ConsentRecord | null>(null);
  const [erasing, setErasing] = useState<DprRequest | null>(null);
  const [eraseConfirm, setEraseConfirm] = useState("");
  const [overriding, setOverriding] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState("");

  const sortedTax = [...taxRows].sort((a, b) => b.cumulative - a.cumulative);
  const taxAlerts = sortedTax.filter((r) => taxStatus(r.cumulative) !== "clear");
  const openRequests = requests.filter((r) => r.stage !== "Closed");
  const nearestSla = Math.min(
    ...openRequests.map((r) => slaDaysLeft(r.receivedOn, DPR_SLA_DAYS, today)),
  );
  const ackVersion = noticeVersions.find((v) => v.status === "published");
  const withdrawnCount = consents.filter((c) => c.state === "withdrawn").length;
  const allExports = [
    ...payrollExports.map((e) => ({ ...e })),
    ...exportHistory.map((e) => ({ ...e, csv: "" })),
  ];

  const filteredConsents = consents.filter(
    (c) =>
      (consentPurpose === "all" || c.purpose === consentPurpose) &&
      (consentState === "all" || c.state === consentState),
  );

  const toIso = (dmy: string) => {
    const [d = "", m = "", y = ""] = dmy.slice(0, 10).split("/");
    return `${y}-${m}-${d}`;
  };
  const allAudit = [
    ...auditEvents.map((e, i) => ({
      id: e.id,
      at: stamp(new Date(e.at)),
      actor: e.actor,
      action: e.action,
      target: e.target,
      type: e.type as string,
      hash: `${(0xc41f00 + i * 4099).toString(16)}…${(0x7a10 + i * 17).toString(16)}`,
    })),
    ...auditLog,
  ];
  const filteredAudit = allAudit.filter((a) => {
    const iso = toIso(a.at);
    return (
      `${a.actor} ${a.action} ${a.target}`.toLowerCase().includes(auditQuery.toLowerCase()) &&
      (auditType === "all" || a.type === auditType) &&
      (!auditFrom || iso >= auditFrom) &&
      (!auditTo || iso <= auditTo)
    );
  });

  const advance = (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (!request) return;
    const next = stages[Math.min(stages.indexOf(request.stage) + 1, stages.length - 1)];
    if (!next) return;
    if (request.type === "erasure" && next === "Responded") {
      setErasing(request);
      setEraseConfirm("");
      return;
    }
    moveTo(request, next);
  };

  const moveTo = (request: DprRequest, next: DprStage) => {
    setRequests((list) =>
      list.map((r) =>
        r.id === request.id
          ? { ...r, stage: next, log: [...r.log, { stage: next, at: stamp(), by: user }] }
          : r,
      ),
    );
    logAudit({
      actor: user,
      action: `Data request moved to ${next}`,
      target: `${request.id} · ${request.type} · ${request.code}`,
      type: "privacy",
    });
    toast.success(`${request.id}: ${next} — step logged in the audit trail`);
  };

  const exportData = (request: DprRequest) => {
    const data = {
      request: request.id,
      generated: stamp(),
      employee: { name: request.employee, code: request.code },
      recognitions: [{ date: "02/10/2026", from: "Vikram Rao", message: "Diwali rush help" }],
      rewards: [{ date: "28/09/2026", item: "Amazon Pay ₹500", status: "fulfilled" }],
      consents: consents
        .filter((c) => c.code === request.code)
        .map((c) => ({ purpose: c.purpose, state: c.state, channel: c.channel })),
    };
    downloadFile(
      `data_export_${request.code}.json`,
      JSON.stringify(data, null, 2),
      "application/json",
    );
    logAudit({
      actor: user,
      action: "Data export generated",
      target: `${request.id} · ${request.code}`,
      type: "privacy",
    });
  };

  const withdraw = (record: ConsentRecord) => {
    setConsents((list) =>
      list.map((c) =>
        c.id === record.id ? { ...c, state: "withdrawn", withdrawnAt: stamp() } : c,
      ),
    );
    logAudit({
      actor: user,
      action: "Consent withdrawn",
      target: `${record.purpose} · ${record.code} · suppressed immediately`,
      type: "consent",
    });
    toast.success(`Withdrawn. ${record.purpose} for ${record.employee} stopped immediately.`);
    setWithdrawing(null);
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Settings · Privacy & DPDP"
        title="Compliance centre"
        description="Tax limits, payroll exports, DPDP status, privacy notice, consent, data requests, retention and the audit trail in one place."
      />

      <Tabs key={tab} defaultValue={tab}>
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="overview">DPDP status</TabsTrigger>
          <TabsTrigger value="tax">Tax tracker</TabsTrigger>
          <TabsTrigger value="payroll">Payroll exports</TabsTrigger>
          <TabsTrigger value="notice">Privacy notice</TabsTrigger>
          <TabsTrigger value="consent">Consent records</TabsTrigger>
          <TabsTrigger value="requests">Data requests</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-lg">
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-muted-foreground">
                  Privacy notice v{ackVersion?.version}
                </p>
                <p className="text-2xl font-semibold">
                  {Math.round(((ackVersion?.acknowledged ?? 0) / NOTICE_AUDIENCE) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  acknowledged · {ackVersion?.acknowledged} of {NOTICE_AUDIENCE}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-lg">
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-muted-foreground">Consent records</p>
                <p className="text-2xl font-semibold">{consents.length}</p>
                <p className="text-xs text-muted-foreground">
                  {withdrawnCount} withdrawn — messages suppressed
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-lg">
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-muted-foreground">Open data requests</p>
                <p className="text-2xl font-semibold">{openRequests.length}</p>
                <p className="text-xs text-muted-foreground">
                  {openRequests.length === 0
                    ? "All closed"
                    : nearestSla < 0
                      ? `${-nearestSla} days overdue — act now`
                      : `Nearest deadline in ${nearestSla} days`}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-lg">
              <CardContent className="space-y-2 p-5">
                <p className="text-sm text-muted-foreground">Next scheduled erasure</p>
                <p className="text-2xl font-semibold">{retention[0]?.next}</p>
                <p className="text-xs text-muted-foreground">
                  {retention[0]?.dataClass} · {retention[0]?.items} · notice sent
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-base">Needs attention</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {taxAlerts.length > 0 && (
                  <li className="flex items-start gap-2">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                    {taxAlerts.length} employees are near or over the {formatRupees(TAX_THRESHOLD)}{" "}
                    gift limit —{" "}
                    <a className="text-primary underline" href="/compliance?tab=tax">
                      tax tracker
                    </a>
                  </li>
                )}
                {openRequests
                  .filter((r) => slaDaysLeft(r.receivedOn, DPR_SLA_DAYS, today) < 7)
                  .map((r) => (
                    <li key={r.id} className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                      {r.id} ({r.type}) is due{" "}
                      {slaDaysLeft(r.receivedOn, DPR_SLA_DAYS, today) < 0 ? "— overdue" : "soon"} —{" "}
                      <a className="text-primary underline" href="/compliance?tab=requests">
                        data requests
                      </a>
                    </li>
                  ))}
                <li className="flex items-start gap-2">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                  {NOTICE_AUDIENCE - (ackVersion?.acknowledged ?? 0)} employees have not
                  acknowledged the privacy notice —{" "}
                  <a className="text-primary underline" href="/compliance?tab=notice">
                    send reminder
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <FileSpreadsheet className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  October 2026 payroll file not generated yet —{" "}
                  <a className="text-primary underline" href="/payroll">
                    payroll export
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Non-cash rewards this financial year vs {formatRupees(TAX_THRESHOLD)} limit
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Above the limit, the extra value is a taxable perquisite and goes to payroll.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedTax.slice(0, 12).map((row) => {
                const status = taxStatus(row.cumulative);
                return (
                  <div key={row.code}>
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span>
                        {row.name} <span className="text-muted-foreground">· {row.code}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {formatRupees(row.cumulative)} / {formatRupees(TAX_THRESHOLD)}
                        <StatusBadge
                          tone={
                            status === "over" ? "error" : status === "near" ? "warning" : "success"
                          }
                        >
                          {status === "over"
                            ? "Over limit"
                            : status === "near"
                              ? "Near limit"
                              : "Clear"}
                        </StatusBadge>
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (row.cumulative / TAX_THRESHOLD) * 100)}
                      aria-label={`${row.name} tax progress`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-6 space-y-3">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                    <TableHead>Exported</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allExports.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.file}</TableCell>
                      <TableCell>{e.system}</TableCell>
                      <TableCell className="text-right">{e.rows}</TableCell>
                      <TableCell>
                        {e.date} · {e.by}
                      </TableCell>
                      <TableCell>
                        {(payrollSent[e.id] ?? e.sent) ? (
                          <StatusBadge tone="success">Sent to payroll</StatusBadge>
                        ) : (
                          <StatusBadge tone="warning">Not sent yet</StatusBadge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Button asChild>
            <a href="/payroll">
              <FileSpreadsheet className="size-4" /> New payroll export
            </a>
          </Button>
        </TabsContent>

        <TabsContent value="notice" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">
                Privacy notice · version 3 {published ? "(published)" : "(draft)"}
              </CardTitle>
              <Select value={noticeLang} onValueChange={setNoticeLang}>
                <SelectTrigger className="w-40" aria-label="Notice language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {noticeLanguages.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="space-y-4">
              {!notices[noticeLang] && (
                <p className="rounded-md bg-warning/10 p-3 text-sm">
                  Telugu translation missing — employees who chose Telugu will see the English
                  version until you add it.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="notice-text">Notice text ({noticeLang})</Label>
                <Textarea
                  id="notice-text"
                  rows={4}
                  value={notices[noticeLang] ?? ""}
                  placeholder={notices["English"]}
                  onChange={(e) => setNotices((n) => ({ ...n, [noticeLang]: e.target.value }))}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Legal basis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purposes.map((p) => (
                    <TableRow key={p.purpose}>
                      <TableCell>{p.purpose}</TableCell>
                      <TableCell>
                        <code className="text-xs">{p.basis}</code>
                        <span className="block text-xs text-muted-foreground">{p.plain}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  disabled={published}
                  onClick={() => {
                    setPublished(true);
                    logAudit({
                      actor: user,
                      action: "Published privacy notice",
                      target: "Version 3 · English, தமிழ், हिन्दी",
                      type: "privacy",
                    });
                    toast.success("Version 3 published. Employees will be asked to acknowledge.");
                  }}
                >
                  <FileText className="size-4" /> {published ? "Published" : "Publish version 3"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employee acknowledgements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {noticeVersions.map((v) => {
                const ack = v.version === 3 && published ? 0 : v.acknowledged;
                return (
                  <div key={v.version} className="space-y-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span>
                        Version {v.version} ·{" "}
                        {v.version === 3 && published ? "published today" : v.status}
                        {v.published !== "—" && ` · ${v.published}`}
                      </span>
                      <span className="text-muted-foreground">
                        {ack} of {NOTICE_AUDIENCE} acknowledged
                      </span>
                    </div>
                    <Progress
                      value={(ack / NOTICE_AUDIENCE) * 100}
                      aria-label={`Version ${v.version} acknowledgements`}
                    />
                  </div>
                );
              })}
              <Button
                variant="outline"
                onClick={() =>
                  toast.success(
                    `Reminder sent to ${NOTICE_AUDIENCE - (ackVersion?.acknowledged ?? 0)} employees on WhatsApp and in the app.`,
                  )
                }
              >
                Remind employees who have not acknowledged
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-6 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full space-y-1 sm:w-56">
              <Label htmlFor="consent-purpose">Purpose</Label>
              <Select value={consentPurpose} onValueChange={setConsentPurpose}>
                <SelectTrigger id="consent-purpose">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All purposes</SelectItem>
                  {purposes.map((p) => (
                    <SelectItem key={p.purpose} value={p.purpose}>
                      {p.purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-1 sm:w-44">
              <Label htmlFor="consent-state">State</Label>
              <Select value={consentState} onValueChange={setConsentState}>
                <SelectTrigger id="consent-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="granted">Granted</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="sm:ml-auto" onClick={() => setCampaignOpen(true)}>
              <Megaphone className="size-4" /> WhatsApp opt-in campaign
            </Button>
          </div>
          {campaign && (
            <p className="rounded-md border border-border bg-muted/40 p-3 text-sm">
              Opt-in campaign sent to {campaign.sent} employees · {campaign.joined} replied JOIN so
              far. Each JOIN is stored below as consent with its WhatsApp message ID.
            </p>
          )}
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Captured at</TableHead>
                    <TableHead>Withdrawn at</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsents.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        {c.employee}
                        <span className="block font-mono text-xs text-muted-foreground">
                          {c.code}
                        </span>
                      </TableCell>
                      <TableCell>{c.purpose}</TableCell>
                      <TableCell>
                        <StatusBadge tone={c.state === "withdrawn" ? "neutral" : "success"}>
                          {c.state}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{c.channel}</TableCell>
                      <TableCell className="font-mono text-xs">{c.evidence}</TableCell>
                      <TableCell className="whitespace-nowrap">{c.capturedAt}</TableCell>
                      <TableCell className="whitespace-nowrap">{c.withdrawnAt ?? "—"}</TableCell>
                      <TableCell>
                        {c.state !== "withdrawn" && (
                          <Button size="sm" variant="ghost" onClick={() => setWithdrawing(c)}>
                            Withdraw
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Withdrawing consent suppresses that purpose immediately — e.g. no more WhatsApp
            messages; the attempt is logged as <code>suppressed_no_optin</code>.
          </p>
        </TabsContent>

        <TabsContent value="requests" className="mt-6 space-y-3">
          {requests.map((r) => {
            const left = slaDaysLeft(r.receivedOn, DPR_SLA_DAYS, today);
            const closed = r.stage === "Closed";
            return (
              <Card key={r.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {r.id} · <span className="capitalize">{r.type}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {r.employee} ({r.code}) · received {r.received}
                      </p>
                      <p className="mt-1 text-sm">{r.detail}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {!closed && (
                        <StatusBadge tone={left < 0 ? "error" : left <= 7 ? "warning" : "neutral"}>
                          {left < 0
                            ? `${-left} days overdue`
                            : `${left} of ${DPR_SLA_DAYS} days left`}
                        </StatusBadge>
                      )}
                      {r.type === "access" && (
                        <Button size="sm" variant="outline" onClick={() => exportData(r)}>
                          <Download className="size-4" /> Data export
                        </Button>
                      )}
                      {!closed && (
                        <Button size="sm" onClick={() => advance(r.id)}>
                          {r.type === "erasure" && r.stage === "Processing"
                            ? "Confirm erasure"
                            : `Mark ${stages[stages.indexOf(r.stage) + 1]}`}
                        </Button>
                      )}
                      {closed && <StatusBadge tone="success">Closed</StatusBadge>}
                    </div>
                  </div>
                  <ol className="flex flex-wrap gap-x-1 text-xs" aria-label="Request progress">
                    {stages.map((s, i) => (
                      <li
                        key={s}
                        className={
                          i <= stages.indexOf(r.stage) ? "font-medium" : "text-muted-foreground"
                        }
                      >
                        {s}
                        {i < stages.length - 1 ? " →" : ""}
                      </li>
                    ))}
                  </ol>
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Step log ({r.log.length})</summary>
                    <ul className="mt-2 space-y-1">
                      {r.log.map((entry) => (
                        <li key={entry.stage + entry.at}>
                          {entry.at} · {entry.stage} · {entry.by}
                        </li>
                      ))}
                    </ul>
                  </details>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="retention" className="mt-6 space-y-3">
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data class</TableHead>
                    <TableHead>Keep for</TableHead>
                    <TableHead>Next scheduled erasure</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>
                      <span className="sr-only">Override</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retention.map((r) => (
                    <TableRow key={r.dataClass}>
                      <TableCell className="font-medium">{r.dataClass}</TableCell>
                      <TableCell>
                        <Select
                          value={String(r.months)}
                          onValueChange={(v) => {
                            setRetention((list) =>
                              list.map((x) =>
                                x.dataClass === r.dataClass ? { ...x, months: Number(v) } : x,
                              ),
                            );
                            logAudit({
                              actor: user,
                              action: "Changed retention period",
                              target: `${r.dataClass}: ${months(r.months)} → ${months(Number(v))}`,
                              type: "settings",
                            });
                          }}
                        >
                          <SelectTrigger className="w-32" aria-label={`Keep ${r.dataClass} for`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {retentionOptions.map((m) => (
                              <SelectItem key={m} value={String(m)}>
                                {months(m)}
                                {m === r.defaultMonths ? " (default)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {overrides[r.dataClass] ? (
                          <span>
                            Postponed
                            <span className="block text-xs text-muted-foreground">
                              Reason: {overrides[r.dataClass]}
                            </span>
                          </span>
                        ) : (
                          <span>
                            {r.next}
                            {r.noticeSent && (
                              <span className="block text-xs text-muted-foreground">
                                Advance notice sent 30 days before
                              </span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.items}</TableCell>
                      <TableCell>
                        {r.next !== "—" && !overrides[r.dataClass] && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setOverriding(r.dataClass);
                              setOverrideReason("");
                            }}
                          >
                            Override
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Defaults: raw ingest 18 months, canonical events 3 years, ledger 8 years, audit 8 years.
            Employees get notice 30 days before erasure. Overrides need a written reason.
          </p>
        </TabsContent>

        <TabsContent value="audit" className="mt-6 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full space-y-1 sm:w-64">
              <Label htmlFor="audit-search">Search</Label>
              <Input
                id="audit-search"
                placeholder="Person, action or record"
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
              />
            </div>
            <div className="w-full space-y-1 sm:w-52">
              <Label htmlFor="audit-type">Type</Label>
              <Select value={auditType} onValueChange={setAuditType}>
                <SelectTrigger id="audit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(auditTypeLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="audit-from">From</Label>
              <Input
                id="audit-from"
                type="date"
                value={auditFrom}
                onChange={(e) => setAuditFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="audit-to">To</Label>
              <Input
                id="audit-to"
                type="date"
                value={auditTo}
                onChange={(e) => setAuditTo(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="sm:ml-auto"
              onClick={() =>
                downloadFile(
                  "audit_log.csv",
                  toCsv(
                    ["ID", "When", "Who", "Type", "Action", "Target", "Hash"],
                    filteredAudit.map((a) => [
                      a.id,
                      a.at,
                      a.actor,
                      a.type,
                      a.action,
                      `"${a.target}"`,
                      a.hash,
                    ]),
                  ),
                )
              }
            >
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Who</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Chain hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudit.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">
                        No entries match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredAudit.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap">{a.at}</TableCell>
                      <TableCell>{a.actor}</TableCell>
                      <TableCell>
                        {a.action}
                        <span className="block text-xs text-muted-foreground">
                          {auditTypeLabel[a.type] ?? a.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.target}</TableCell>
                      <TableCell className="font-mono text-xs">{a.hash}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Hash chain verified — no entries changed.
          </p>
        </TabsContent>
      </Tabs>

      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>WhatsApp opt-in campaign</DialogTitle>
            <DialogDescription>
              Sends the approved <code>optin_invite</code> utility template in each employee’s
              language. Only people who reply JOIN get recognition messages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="campaign-audience">Send to</Label>
            <Select value={campaignAudience} onValueChange={setCampaignAudience}>
              <SelectTrigger id="campaign-audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-opted">Everyone not opted in yet (37)</SelectItem>
                <SelectItem value="manufacturing">Manufacturing, not opted in (24)</SelectItem>
                <SelectItem value="quality">Quality, not opted in (8)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Languages: Tamil 21 · Hindi 9 · English 7. Employees without a mobile number are
              skipped.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const sent =
                  campaignAudience === "manufacturing"
                    ? 24
                    : campaignAudience === "quality"
                      ? 8
                      : 37;
                setCampaign({ sent, joined: 0 });
                setCampaignOpen(false);
                logAudit({
                  actor: user,
                  action: "Sent WhatsApp opt-in campaign",
                  target: `${sent} employees · optin_invite (ta, hi, en)`,
                  type: "consent",
                });
                toast.success(`Opt-in invite sent to ${sent} employees.`);
              }}
            >
              Send invites
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawing !== null} onOpenChange={(open) => !open && setWithdrawing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record consent withdrawal?</DialogTitle>
            <DialogDescription>
              {withdrawing?.employee} ({withdrawing?.code}) withdraws consent for “
              {withdrawing?.purpose}”. This takes effect immediately and cannot be undone by HR —
              only the employee can grant it again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawing(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => withdrawing && withdraw(withdrawing)}>
              Withdraw consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={erasing !== null} onOpenChange={(open) => !open && setErasing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm erasure for {erasing?.code}</DialogTitle>
            <DialogDescription>
              Personal data (name, phone, recognitions, consents) will be erased. Ledger and payroll
              entries are kept for 8 years as required by law, with the name replaced by the code.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="erase-confirm">Type {erasing?.code} to confirm</Label>
            <Input
              id="erase-confirm"
              value={eraseConfirm}
              onChange={(e) => setEraseConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setErasing(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={eraseConfirm.trim().toUpperCase() !== erasing?.code}
              onClick={() => {
                if (erasing) moveTo(erasing, "Responded");
                setErasing(null);
              }}
            >
              Erase data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={overriding !== null} onOpenChange={(open) => !open && setOverriding(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postpone scheduled erasure</DialogTitle>
            <DialogDescription>
              {overriding} is due for erasure. A manual override needs a reason; it is written to
              the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="override-reason">Reason</Label>
            <Textarea
              id="override-reason"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Labour court case 114/2026 needs these records"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverriding(null)}>
              Cancel
            </Button>
            <Button
              disabled={overrideReason.trim().length < 10}
              onClick={() => {
                if (!overriding) return;
                setOverrides((o) => ({ ...o, [overriding]: overrideReason.trim() }));
                logAudit({
                  actor: user,
                  action: "Postponed scheduled erasure",
                  target: `${overriding} · ${overrideReason.trim()}`,
                  type: "privacy",
                });
                setOverriding(null);
              }}
            >
              Save override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
