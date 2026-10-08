import { CheckCircle2, CircleDashed, LockKeyhole, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { decisionTrace, workflowRuns, workflowVersions, workflows } from "@/lib/admin-data";

const resultTone = { success: "success", failed: "error", running: "warning" } as const;
const resultLabel = { success: "Worked", failed: "Failed", running: "Running" } as const;

export function WorkflowRunsPage({ workflowId }: { workflowId: string }) {
  const workflow = workflows.find((w) => w.id === workflowId) ?? workflows[1];
  const [restore, setRestore] = useState<number | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);
  const failed = workflowRuns.find((r) => r.result === "failed");

  return (
    <div className="space-y-6">
      <a href={`/workflows/${workflow?.id}`} className="text-sm text-muted-foreground hover:text-foreground">← Back to builder</a>
      <PageHeading title={workflow?.name ?? "Workflow"} description="Every run, every version, and why each person did or did not get a reward." action={<Button onClick={() => setTraceOpen(true)}>Explain a decision</Button>} />
      {failed && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>Last run failed ({failed.started})</AlertTitle>
          <AlertDescription>{failed.error}</AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>
        <TabsContent value="runs">
          <Card className="rounded-lg">
            <Table>
              <TableHeader><TableRow><TableHead>Run</TableHead><TableHead>Started</TableHead><TableHead>Result</TableHead><TableHead>People checked</TableHead><TableHead>Rewarded</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {workflowRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.id}</TableCell>
                    <TableCell>{run.started} · {run.duration}</TableCell>
                    <TableCell><StatusBadge tone={resultTone[run.result]}>{resultLabel[run.result]}</StatusBadge></TableCell>
                    <TableCell>{run.evaluated}</TableCell>
                    <TableCell>{run.rewarded}</TableCell>
                    <TableCell className="text-right">
                      {run.result === "failed" ? (
                        <Button size="sm" variant="outline" onClick={() => toast("Re-run queued. It will use the corrected file once uploaded.")}><RotateCcw /> Re-run</Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setTraceOpen(true)}>See decisions</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="versions">
          <Card className="rounded-lg">
            <CardContent className="divide-y divide-border p-0">
              {workflowVersions.map((v) => (
                <div key={v.version} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">Version {v.version} {v.current && <StatusBadge tone="success">Live</StatusBadge>}</p>
                    <p className="text-sm text-muted-foreground">{v.note} · {v.author} · {v.date}</p>
                  </div>
                  {!v.current && <Button size="sm" variant="outline" onClick={() => setRestore(v.version)}>Restore</Button>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={restore !== null} onOpenChange={(o) => !o && setRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore version {restore}?</DialogTitle>
            <DialogDescription>This creates a new draft from version {restore}. The live version keeps running until you publish.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestore(null)}>Cancel</Button>
            <Button onClick={() => { toast.success(`Draft created from version ${restore}`); setRestore(null); }}>Create draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={traceOpen} onOpenChange={setTraceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why {decisionTrace.employee} was not rewarded</DialogTitle>
            <DialogDescription className="flex items-center gap-1.5"><LockKeyhole className="size-3.5" /> Private · Run 117 · {decisionTrace.code}</DialogDescription>
          </DialogHeader>
          <Card className="rounded-lg">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Step by step</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {decisionTrace.steps.map((step) => (
                  <li key={step.title} className="flex gap-3 text-sm">
                    {step.passed === true ? <CheckCircle2 className="size-5 text-success" /> : step.passed === false ? <LockKeyhole className="size-5 text-private" /> : <CircleDashed className="size-5 text-muted-foreground" />}
                    <div><p className="font-medium">{step.title}</p><p className="text-muted-foreground">{step.detail}</p></div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <DialogFooter><Button variant="outline" onClick={() => setTraceOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
