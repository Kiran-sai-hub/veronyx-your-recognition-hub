import { BarChart3, Download, Table2 } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function AnalyticsPage() {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="Reports"
        title="Analytics"
        description="Six plain answers about your recognition programme. Switch any card between chart and table."
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

      <div className="grid gap-4 lg:grid-cols-2">
        {analyticsMetrics.map((metric) => (
          <Card key={metric.id} className="rounded-lg shadow-sm">
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">{metric.label}</CardTitle>
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
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metric.series}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
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
    </div>
  );
}
