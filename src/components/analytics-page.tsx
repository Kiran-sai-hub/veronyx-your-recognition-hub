import { BarChart3, Download, Table2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { analyticsMetrics, toCsv } from "@/lib/phase2-data";

function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const url = URL.createObjectURL(new Blob([toCsv(headers, rows)], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const codes: Record<string, string> = {
  coverage: "AN-01",
  spend: "AN-02",
  "budget-use": "AN-03",
  redemption: "AN-04",
  spread: "AN-06",
  lift: "AN-09",
};

const fairnessLinks = [
  {
    code: "AN-05",
    title: "Concentration / Gini",
    detail: "Gini 0.27 · top 10% hold 17% of points",
    href: "/fairness",
  },
  {
    code: "AN-07",
    title: "Equity cuts",
    detail: "By department, location, shift and tenure · night shift lowest at 41%",
    href: "/fairness",
  },
  {
    code: "AN-08",
    title: "Negative report",
    detail: "4 people with no recognition in 60+ days · 2 teams without workflows",
    href: "/fairness?tab=negative",
  },
];

export function AnalyticsPage({ emptyOrg = false }: { emptyOrg?: boolean }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, []);
  if (emptyOrg)
    return (
      <div className="space-y-8">
        <PageHeading
          eyebrow="Analytics & Fairness"
          title="Analytics"
          description="Plain answers about your recognition programme."
        />
        <Card className="rounded-lg border-dashed">
          <CardContent className="p-10 text-center">
            <p className="font-semibold">
              Not enough data yet. Activate a workflow to start collecting.
            </p>
            <Button className="mt-4" asChild>
              <a href="/workflows/new">Create a workflow</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Analytics & Fairness"
        title="Analytics"
        description="Plain answers about your recognition programme (AN-01 to AN-09). Switch between chart and table, or export any card."
        action={
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as "chart" | "table")}
            aria-label="View as chart or table"
          >
            <ToggleGroupItem value="chart" aria-label="Chart view">
              <BarChart3 className="size-4" /> Chart
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <Table2 className="size-4" /> Table
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading analytics">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {analyticsMetrics.map((metric) => (
            <Card key={metric.id} className="rounded-lg shadow-sm">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {codes[metric.id]}
                    </span>
                    {metric.label}
                  </CardTitle>
                  <p className="mt-1 text-2xl font-bold">{metric.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{metric.detail}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    exportCsv(`${metric.id}.csv`, metric.table.headers, metric.table.rows)
                  }
                >
                  <Download /> CSV
                </Button>
              </CardHeader>
              <CardContent>
                {view === "chart" ? (
                  <div
                    className="h-52"
                    role="img"
                    aria-label={`${metric.label}: ${metric.series.map((p) => `${p.label} ${p.value}`).join(", ")}`}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metric.series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                          dataKey="label"
                          stroke="var(--color-muted-foreground)"
                          fontSize={12}
                        />
                        <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="value" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        {metric.table.headers.map((header) => (
                          <th key={header} className="py-2 font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metric.table.rows.map((row) => (
                        <tr key={row.join()} className="border-t border-border">
                          {row.map((cell) => (
                            <td key={cell} className="py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <section aria-labelledby="fair-links" className="space-y-3">
        <h2 id="fair-links" className="text-lg font-semibold">
          Fairness views
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {fairnessLinks.map((l) => (
            <a
              key={l.code}
              href={l.href}
              className="rounded-lg border border-border bg-card p-4 hover:border-primary"
            >
              <p className="font-mono text-xs text-muted-foreground">{l.code}</p>
              <p className="font-medium">{l.title}</p>
              <p className="text-sm text-muted-foreground">{l.detail}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
