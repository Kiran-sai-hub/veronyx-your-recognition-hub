import { Download, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { formatRupees } from "@/lib/format";
import { toCsv } from "@/lib/phase2-data";
import {
  auditLog,
  consentRecords,
  DPR_SLA_DAYS,
  dprRequests as initialRequests,
  purposes,
  retentionClasses,
  slaDaysLeft,
  TAX_THRESHOLD,
  taxRows,
  taxStatus,
  today,
  type DprRequest,
} from "@/lib/phase3-data";

const stages: DprRequest["stage"][] = [
  "Received",
  "Acknowledged",
  "Processing",
  "Responded",
  "Closed",
];
const noticeLanguages = ["English", "தமிழ்", "हिन्दी", "తెలుగు"];

function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function CompliancePage() {
  const [requests, setRequests] = useState(initialRequests);
  const [noticeLang, setNoticeLang] = useState("English");
  const [auditQuery, setAuditQuery] = useState("");
  const filteredAudit = auditLog.filter((a) =>
    `${a.actor} ${a.action} ${a.target}`.toLowerCase().includes(auditQuery.toLowerCase()),
  );
  const sortedTax = [...taxRows].sort((a, b) => b.cumulative - a.cumulative);

  const advance = (id: string) => {
    setRequests((list) =>
      list.map((r) => {
        if (r.id !== id) return r;
        const next = stages[Math.min(stages.indexOf(r.stage) + 1, stages.length - 1)];
        return { ...r, stage: next };
      }),
    );
    toast.success("Step recorded in the audit log");
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Compliance"
        title="Compliance centre"
        description="Privacy notices, consent, data requests, retention, tax and the audit trail in one place."
      />

      <Tabs defaultValue="tax">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="tax">Tax tracker</TabsTrigger>
          <TabsTrigger value="notice">Privacy notice</TabsTrigger>
          <TabsTrigger value="consent">Consent records</TabsTrigger>
          <TabsTrigger value="requests">Data requests</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="tax" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Non-cash rewards this financial year vs {formatRupees(TAX_THRESHOLD)} limit
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Above the limit, the full value is a taxable perquisite and goes to payroll.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedTax.slice(0, 12).map((row) => {
                const status = taxStatus(row.cumulative);
                return (
                  <div key={row.code}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span>
                        {row.name} <span className="text-muted-foreground">· {row.code}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {formatRupees(row.cumulative)}
                        {status !== "clear" && (
                          <StatusBadge tone="warning">
                            {status === "over" ? "Over limit" : "Near limit"}
                          </StatusBadge>
                        )}
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

        <TabsContent value="notice" className="mt-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Privacy notice · version 3 (draft)</CardTitle>
              <Select value={noticeLang} onValueChange={setNoticeLang}>
                <SelectTrigger className="w-40">
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
              {noticeLang === "తెలుగు" && (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Telugu translation missing — employees will see the English version.
                </p>
              )}
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
                      <TableCell className="text-muted-foreground">{p.basis}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Version 2 acknowledged by 162 of 199
                </p>
                <Button
                  onClick={() =>
                    toast.success("Version 3 published. Employees will be asked to acknowledge.")
                  }
                >
                  <FileText className="size-4" /> Publish version
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consentRecords.map((c, i) => (
                    <TableRow key={`${c.employee}-${i}`}>
                      <TableCell>{c.employee}</TableCell>
                      <TableCell>{c.purpose}</TableCell>
                      <TableCell>
                        <StatusBadge tone={c.state === "withdrawn" ? "neutral" : "success"}>
                          {c.state}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{c.channel}</TableCell>
                      <TableCell className="font-mono text-xs">{c.evidence}</TableCell>
                      <TableCell>{c.at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="mt-3 text-xs text-muted-foreground">
            Withdrawn consent stops that kind of message immediately.
          </p>
        </TabsContent>

        <TabsContent value="requests" className="mt-6 space-y-3">
          {requests.map((r) => {
            const left = slaDaysLeft(r.receivedOn, DPR_SLA_DAYS, today);
            const closed = r.stage === "Closed";
            return (
              <Card key={r.id}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      {r.id} · <span className="capitalize">{r.type}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {r.employee} · received {r.received}
                    </p>
                    <p className="mt-1 text-xs">
                      {stages.map((s, i) => (
                        <span
                          key={s}
                          className={
                            i <= stages.indexOf(r.stage) ? "font-medium" : "text-muted-foreground"
                          }
                        >
                          {s}
                          {i < stages.length - 1 ? " → " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!closed && (
                      <StatusBadge tone={left < 0 ? "error" : left <= 7 ? "warning" : "neutral"}>
                        {left < 0 ? `${-left} days overdue` : `${left} days left`}
                      </StatusBadge>
                    )}
                    {!closed && <Button onClick={() => advance(r.id)}>Next step</Button>}
                    {closed && <StatusBadge tone="success">Closed</StatusBadge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="retention" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Keep for</TableHead>
                    <TableHead>Next scheduled erasure</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retentionClasses.map((r) => (
                    <TableRow key={r.dataClass}>
                      <TableCell className="font-medium">{r.dataClass}</TableCell>
                      <TableCell>
                        {r.months >= 24 ? `${r.months / 12} years` : `${r.months} months`}
                      </TableCell>
                      <TableCell>{r.next}</TableCell>
                      <TableCell className="text-muted-foreground">{r.items}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="mt-3 text-xs text-muted-foreground">
            Employees get notice 30 days before erasure. Overrides need a written reason.
          </p>
        </TabsContent>

        <TabsContent value="audit" className="mt-6 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Input
              placeholder="Filter by person or action"
              value={auditQuery}
              onChange={(e) => setAuditQuery(e.target.value)}
              className="sm:max-w-xs"
            />
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  "audit-log.csv",
                  toCsv(
                    ["ID", "When", "Who", "Action", "Target", "Hash"],
                    filteredAudit.map((a) => [a.id, a.at, a.actor, a.action, a.target, a.hash]),
                  ),
                )
              }
            >
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
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
                  {filteredAudit.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap">{a.at}</TableCell>
                      <TableCell>{a.actor}</TableCell>
                      <TableCell>{a.action}</TableCell>
                      <TableCell className="text-muted-foreground">{a.target}</TableCell>
                      <TableCell className="font-mono text-xs">{a.hash}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Chain verified — no entries changed.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
