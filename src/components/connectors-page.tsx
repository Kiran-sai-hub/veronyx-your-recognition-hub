import { CheckCircle2, Plug, RefreshCw, TriangleAlert, Upload } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  connectorGallery,
  connectors,
  dataHealth,
  type ConnectorStatus,
  type GalleryConnector,
} from "@/lib/phase2-data";
import { formatIndianNumber } from "@/lib/format";

const statusTone: Record<
  ConnectorStatus,
  { tone: "success" | "warning" | "error" | "neutral"; label: string }
> = {
  connected: { tone: "success", label: "Connected" },
  attention: { tone: "warning", label: "Needs attention" },
  failed: { tone: "error", label: "Failed" },
  "not-connected": { tone: "neutral", label: "Not connected" },
};

export function ConnectorsPage({ onOpenMapping }: { onOpenMapping: () => void }) {
  const [selected, setSelected] = useState<GalleryConnector | null>(null);
  const [setupStep, setSetupStep] = useState(0);
  const [done, setDone] = useState(false);

  const openSetup = (connector: GalleryConnector) => {
    setSelected(connector);
    setSetupStep(0);
    setDone(false);
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Data"
        title="Connectors & data"
        description="Bring performance data in from files, sheets and your other software. Nothing changes until you confirm it."
        action={<Button onClick={onOpenMapping}>Open field mapping</Button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Data health">
        <StatCard
          label="Records matched"
          value={formatIndianNumber(dataHealth.matchedRecords)}
          detail={`Last import ${dataHealth.lastImport}`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Unmatched records"
          value={String(dataHealth.unmatchedRecords)}
          detail="Waiting in the identity queue"
          icon={TriangleAlert}
        />
        <StatCard
          label="Possible duplicates"
          value={String(dataHealth.duplicateRecords)}
          detail="Review before merging"
          icon={TriangleAlert}
        />
        <StatCard
          label="Sources failed"
          value={String(dataHealth.failedSources)}
          detail="Zoho CRM needs a new sign-in"
          icon={Plug}
        />
      </section>

      <section aria-label="Your connectors">
        <h2 className="mb-4 text-lg font-semibold">Your connectors</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connectors.map((connector) => {
            const status = statusTone[connector.status];
            return (
              <Card key={connector.id} className="rounded-lg shadow-sm">
                <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                  <div>
                    <CardTitle className="text-base">{connector.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{connector.kind}</p>
                  </div>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Last sync</span>
                    <span className="text-foreground">{connector.lastSync}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Records</span>
                    <span className="text-foreground">{formatIndianNumber(connector.records)}</span>
                  </div>
                  {connector.note && (
                    <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                      {connector.note}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    {connector.status === "not-connected" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          openSetup(
                            connectorGallery.find(
                              (g) =>
                                connector.kind.startsWith(g.name.split(" ")[0] ?? "") ||
                                g.name === connector.kind,
                            ) ?? connectorGallery[0]!,
                          )
                        }
                      >
                        Set up
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <RefreshCw /> Sync now
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={onOpenMapping}>
                      Mapping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-label="Add a connector">
        <h2 className="mb-4 text-lg font-semibold">Add a connector</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {connectorGallery.map((connector) => (
            <Card key={connector.id} className="rounded-lg shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Upload className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{connector.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{connector.description}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openSetup(connector)}>
                  Set up
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Set up {selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.description} This is a simulated setup — no real account is connected.
                </DialogDescription>
              </DialogHeader>
              {!done ? (
                <div className="space-y-4">
                  <Progress value={((setupStep + 1) / selected.setupSteps.length) * 100} />
                  <p className="text-sm font-medium">
                    Step {setupStep + 1} of {selected.setupSteps.length}:{" "}
                    {selected.setupSteps[setupStep]}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelected(null)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (setupStep + 1 < selected.setupSteps.length) setSetupStep(setupStep + 1);
                        else setDone(true);
                      }}
                    >
                      {setupStep + 1 < selected.setupSteps.length ? "Continue" : "Finish setup"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <CheckCircle2 className="mx-auto size-10 text-success" />
                  <p className="font-semibold">{selected.name} is ready</p>
                  <p className="text-sm text-muted-foreground">
                    Next, match its columns to Veronyx fields so the data lands in the right place.
                  </p>
                  <Button
                    onClick={() => {
                      setSelected(null);
                      onOpenMapping();
                    }}
                  >
                    Match columns now
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
