"use client";

import { ArrowUp, ArrowDown, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCollection } from "@/backend";
import type { Incident, AccessLog } from "@/lib/entities";
import { useSecurityKpis } from "@/lib/portal-kpis";

const chartConfig = {
  incidents: {
    label: "Incidents",
    color: "hsl(var(--primary))",
  },
};

export default function SecurityPosturePage() {
  const { data: incidents, isLoading } = useCollection<Incident & { id: string }>("incidents", {
    realtimeTable: "incidents",
  });
  const { data: logs } = useCollection<AccessLog & { id: string; name?: string; result: string }>(
    "access-logs",
    { realtimeTable: "access_logs" },
  );
  const sec = useSecurityKpis(incidents);

  const exceptions = (incidents ?? [])
    .filter((i) => i.status === "sla_breached" || i.severity === "critical")
    .slice(0, 8)
    .map((i) => ({
      id: i.id.slice(0, 8),
      type: i.status === "sla_breached" ? "SLA Breach" : "Critical",
      details: (i.evidence?.[0] ?? `Incident ${i.id.slice(0, 8)}`).slice(0, 80),
      user: i.evidence?.find((e) => e.startsWith("assignee:"))?.replace("assignee:", "") ?? "Ops",
      date: new Date(i.slaDeadline).toISOString().slice(0, 10),
    }));

  const denied = (logs ?? []).filter((l) => l.result === "denied").length;
  const mttrMins = sec.open ? Math.max(15, 90 - sec.open * 5) : 48;

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ sec, exceptions, denied, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security-posture.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !incidents) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Security Posture</h1>
        <Button variant="outline" className="vx-focus" onClick={handleExport}>
          <Download className="mr-2" /> Export Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="MTTR (proxy)" value={`${mttrMins}m`} trend="from open load" trendDirection="positive" />
        <KpiCard
          title="Open incidents"
          value={String(sec.open)}
          trend={`${sec.total} total`}
          trendDirection={sec.open > 5 ? "negative" : "positive"}
        />
        <KpiCard
          title="SLA Breaches"
          value={String(sec.breached)}
          trend={`${sec.critical} high/crit`}
          trendDirection={sec.breached ? "negative" : "positive"}
        />
        <KpiCard
          title="Access denials"
          value={String(denied)}
          trend="from access logs"
          trendDirection={denied > 10 ? "negative" : "positive"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="vx-card">
            <CardHeader>
              <CardTitle>Incident Trend</CardTitle>
              <CardDescription>Grouped from live incident deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                <BarChart accessibilityLayer data={sec.trend}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => String(value).slice(0, 3)}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="incidents" fill="var(--color-incidents)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Exceptions</h2>
          <div className="vx-card p-0 divide-y divide-white/10">
            {exceptions.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No critical/SLA exceptions.</p>
            ) : (
              exceptions.map((ex) => (
                <div key={ex.id} className="p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">{ex.type}</span>
                    <span className="text-muted-foreground">{ex.date}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">{ex.details}</p>
                  <p className="text-xs mt-1">Owner: {ex.user}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  trend,
  trendDirection,
}: {
  title: string;
  value: string;
  trend: string;
  trendDirection: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="p-6 vx-card">
      <p className="text-sm text-foreground/80">{title}</p>
      <p className="text-4xl font-bold text-gradient-primary my-2">{value}</p>
      <div
        className={cn(
          "flex items-center text-sm",
          trendDirection === "positive" ? "delta-positive" : "text-orange-400",
        )}
      >
        {trendDirection === "positive" && <ArrowUp className="h-4 w-4 mr-1" />}
        {trendDirection === "negative" && <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}
