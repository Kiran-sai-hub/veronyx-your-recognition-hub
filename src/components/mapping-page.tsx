import { Check, Link2, TriangleAlert, X } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fieldMappings,
  fieldRegistry,
  identityQueue,
  schemaDriftAlerts,
  targetFields,
} from "@/lib/phase2-data";

type IdentityDecision = "pending" | "confirmed" | "rejected";

export function MappingPage({ tab = "mapping" }: { tab?: string | undefined }) {
  const [decisions, setDecisions] = useState<Record<string, IdentityDecision>>({});
  const pending = identityQueue.filter((item) => (decisions[item.id] ?? "pending") === "pending");

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Data"
        title="Field mapping & identity"
        description="Tell Veronyx which column means what, and confirm who each record belongs to. People are never linked automatically."
      />

      {schemaDriftAlerts.length > 0 && (
        <section aria-label="Schema drift alerts" className="space-y-3">
          {schemaDriftAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4"
            >
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-medium">
                  {alert.source} · {alert.date}
                </p>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <Tabs key={tab} defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="mapping">Field mapping</TabsTrigger>
          <TabsTrigger value="identity">
            Identity queue{pending.length > 0 ? ` (${pending.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="registry">Field registry</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="mt-6">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Monthly sales file → Veronyx fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fieldMappings.map((mapping) => (
                <div
                  key={mapping.source}
                  className="grid items-center gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_auto_1fr]"
                >
                  <div>
                    <p className="font-mono text-sm">{mapping.source}</p>
                    <p className="text-xs text-muted-foreground">e.g. {mapping.sample}</p>
                  </div>
                  <Link2 className="hidden size-4 text-muted-foreground sm:block" />
                  <Select defaultValue={mapping.target ?? "unmapped"}>
                    <SelectTrigger aria-label={`Map ${mapping.source}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unmapped">Not mapped yet</SelectItem>
                      {targetFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
                <span className="text-muted-foreground">
                  Preview: 48 rows · 45 will import, 3 skipped as duplicates
                </span>
                <Button size="sm">Save mapping</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identity" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Every link below needs your confirmation. Veronyx never joins records to a person on its
            own.
          </p>
          {identityQueue.map((item) => {
            const decision = decisions[item.id] ?? "pending";
            return (
              <Card key={item.id} className="rounded-lg shadow-sm">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {item.sourceName}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {item.sourceDetail}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.candidateName
                        ? `Possible match: ${item.candidateName} (${item.candidateCode})`
                        : "No matching employee found"}
                      {" · "}
                      {item.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      tone={
                        item.confidence === "High"
                          ? "success"
                          : item.confidence === "Medium"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {item.confidence}
                    </StatusBadge>
                    {decision === "pending" ? (
                      <>
                        <Button
                          size="sm"
                          disabled={!item.candidateName}
                          onClick={() => setDecisions((d) => ({ ...d, [item.id]: "confirmed" }))}
                        >
                          <Check /> Confirm link
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDecisions((d) => ({ ...d, [item.id]: "rejected" }))}
                        >
                          <X /> Not this person
                        </Button>
                      </>
                    ) : (
                      <StatusBadge tone={decision === "confirmed" ? "success" : "neutral"}>
                        {decision === "confirmed" ? "Linked by you" : "Skipped"}
                      </StatusBadge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="registry" className="mt-6">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Field registry</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 font-medium">Field</th>
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Used by</th>
                    <th className="py-2 font-medium">Personal data</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldRegistry.map((field) => (
                    <tr key={field.field} className="border-t border-border">
                      <td className="py-2.5 font-medium">{field.field}</td>
                      <td className="py-2.5">{field.type}</td>
                      <td className="py-2.5 text-muted-foreground">{field.usedBy}</td>
                      <td className="py-2.5">
                        {field.pii ? (
                          <StatusBadge tone="private">Yes — protected</StatusBadge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
