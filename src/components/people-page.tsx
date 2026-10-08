import { ChevronLeft, ChevronRight, MapPin, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employees, type Employee } from "@/lib/mock-data";
import { departmentSummary, locations } from "@/lib/phase2-data";

const PAGE_SIZE = 10;

export function PeoplePage() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter(
      (employee) =>
        (department === "all" || employee.department === department) &&
        (q === "" ||
          employee.name.toLowerCase().includes(q) ||
          employee.code.toLowerCase().includes(q)),
    );
  }, [query, department]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-8">
      <PageHeading
        eyebrow="People"
        title="People & teams"
        description="Everyone at Radha Krishna Mills, their teams and locations."
      />

      <Tabs defaultValue="people">
        <TabsList>
          <TabsTrigger value="people">Employees</TabsTrigger>
          <TabsTrigger value="structure">Departments & teams</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name or code"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                aria-label="Search employees"
              />
            </div>
            <Select
              value={department}
              onValueChange={(v) => {
                setDepartment(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="sm:w-52" aria-label="Filter by department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departmentSummary.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="rounded-lg shadow-sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Code</th>
                    <th className="hidden p-4 font-medium md:table-cell">Department</th>
                    <th className="hidden p-4 font-medium md:table-cell">Team</th>
                    <th className="hidden p-4 font-medium lg:table-cell">Location</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((employee) => (
                    <tr
                      key={employee.id}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                      onClick={() => setSelected(employee)}
                    >
                      <td className="p-4 font-medium">{employee.name}</td>
                      <td className="p-4 font-mono text-xs">{employee.code}</td>
                      <td className="hidden p-4 md:table-cell">{employee.department}</td>
                      <td className="hidden p-4 md:table-cell">{employee.team}</td>
                      <td className="hidden p-4 lg:table-cell">{employee.location}</td>
                      <td className="p-4">
                        <StatusBadge tone={employee.status === "active" ? "success" : "neutral"}>
                          {employee.status === "active" ? "Active" : "Exited"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Nobody matches that search. Try a different name or code.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length} people · page {safePage + 1} of {pageCount}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft /> Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage + 1 >= pageCount}
                onClick={() => setPage(safePage + 1)}
              >
                Next <ChevronRight />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="structure" className="mt-6 grid gap-4 md:grid-cols-2">
          {departmentSummary.map((dept) => (
            <Card key={dept.name} className="rounded-lg shadow-sm">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4 text-primary" /> {dept.name}
                </CardTitle>
                <StatusBadge tone="neutral">{dept.headcount} people</StatusBadge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {dept.teams.map((team) => (
                  <span key={team} className="rounded-md border border-border px-2.5 py-1 text-xs">
                    {team}
                  </span>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="locations" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {locations.map((location) => (
            <Card key={location.name} className="rounded-lg shadow-sm">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{location.name}</p>
                  <p className="text-sm text-muted-foreground">{location.headcount} people</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.code} · {selected.team} · {selected.location}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge tone={selected.status === "active" ? "success" : "neutral"}>
                    {selected.status === "active" ? "Active" : "Exited"}
                  </StatusBadge>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <span className="text-muted-foreground">Points balance</span>
                  <span className="font-semibold text-reward">{selected.points} pts</span>
                </div>
                <div className="rounded-md bg-private-surface p-3 text-sm text-private">
                  <p className="flex items-center gap-2 font-medium">Private performance notes</p>
                  <p className="mt-1 text-muted-foreground">
                    Only you and this person's manager can see these. Nothing here is shown on any
                    board.
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
