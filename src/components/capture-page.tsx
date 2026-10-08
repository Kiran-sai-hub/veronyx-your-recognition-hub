import { ArrowDown, ArrowUp, Check, MessageCircle, Smartphone, X } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  captureFieldPalette,
  captureFields,
  nativeEntries,
  type CaptureField,
} from "@/lib/phase2-data";

export function CapturePage() {
  const [fields, setFields] = useState<CaptureField[]>(captureFields);
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});

  const move = (id: string, direction: -1 | 1) => {
    setFields((current) => {
      const index = current.findIndex((f) => f.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item!);
      return next;
    });
  };

  const addField = (kind: CaptureField["kind"]) => {
    setFields((current) => [
      ...current,
      { id: `cf-${Date.now()}`, label: `New ${kind.toLowerCase()} field`, kind, required: false },
    ]);
  };

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Performance"
        title="Native capture"
        description="Build simple forms your team fills in on their phone or on WhatsApp, and review what comes in."
      />

      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="builder">Form builder</TabsTrigger>
          <TabsTrigger value="entries">Entries to review</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Add a field</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {captureFieldPalette.map((kind) => (
                  <Button key={kind} size="sm" variant="outline" onClick={() => addField(kind)}>
                    + {kind}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Form fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <div className="flex flex-col">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        disabled={index === 0}
                        onClick={() => move(field.id, -1)}
                        aria-label={`Move ${field.label} up`}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        disabled={index === fields.length - 1}
                        onClick={() => move(field.id, 1)}
                        aria-label={`Move ${field.label} down`}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{field.label}</p>
                      <p className="text-xs text-muted-foreground">{field.kind}</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Required
                      <Switch
                        defaultChecked={field.required}
                        aria-label={`${field.label} required`}
                      />
                    </label>
                  </div>
                ))}
                <Button>Save form</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smartphone className="size-4" /> Phone preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mx-auto max-w-56 space-y-2 rounded-2xl border border-border p-3">
                  <p className="text-center text-xs font-semibold">Shift quality log</p>
                  {fields.slice(0, 4).map((field) => (
                    <div key={field.id} className="rounded-md border border-border p-2 text-xs">
                      <span className="text-muted-foreground">
                        {field.label}
                        {field.required ? " *" : ""}
                      </span>
                      <div className="mt-1 h-6 rounded bg-muted" />
                    </div>
                  ))}
                  <div className="rounded-md bg-primary py-1.5 text-center text-xs font-medium text-primary-foreground">
                    Submit
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="size-4" /> WhatsApp preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 rounded-lg bg-muted p-3 text-xs">
                  <p className="w-fit rounded-lg bg-card p-2 shadow-sm">Shift date? (DD/MM/YYYY)</p>
                  <p className="ml-auto w-fit rounded-lg bg-primary p-2 text-primary-foreground">
                    08/10/2026
                  </p>
                  <p className="w-fit rounded-lg bg-card p-2 shadow-sm">Defects found?</p>
                  <p className="ml-auto w-fit rounded-lg bg-primary p-2 text-primary-foreground">
                    0
                  </p>
                  <p className="w-fit rounded-lg bg-card p-2 shadow-sm">
                    Thanks! Your log is saved. ✅
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entries" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Entries from native forms wait here until a person approves them.
          </p>
          {nativeEntries.map((entry) => {
            const decision = decisions[entry.id];
            return (
              <Card key={entry.id} className="rounded-lg shadow-sm">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{entry.employee}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.form} · {entry.summary} · {entry.submitted}
                    </p>
                    {!entry.evidence && (
                      <p className="mt-1 text-xs text-warning-foreground">No photo attached</p>
                    )}
                  </div>
                  {decision ? (
                    <StatusBadge tone={decision === "approved" ? "success" : "error"}>
                      {decision === "approved" ? "Approved" : "Rejected"}
                    </StatusBadge>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setDecisions((d) => ({ ...d, [entry.id]: "approved" }))}
                      >
                        <Check /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDecisions((d) => ({ ...d, [entry.id]: "rejected" }))}
                      >
                        <X /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
