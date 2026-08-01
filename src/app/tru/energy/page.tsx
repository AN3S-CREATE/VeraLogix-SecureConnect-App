"use client";

import { ArrowUp, ArrowDown, Download } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCollection } from "@/backend";
import type { Energy, EVSession } from "@/lib/entities";
import { formatMoney, useEnergyKpis, useEvKpis } from "@/lib/portal-kpis";
import { useMemo } from "react";

export default function EnergyOversightPage() {
  const { data: readings, isLoading } = useCollection<Energy & { id: string }>("energy", {
    realtimeTable: "energy_readings",
  });
  const { data: sessions } = useCollection<EVSession & { id: string }>("ev-sessions", {
    realtimeTable: "ev_sessions",
  });
  const energy = useEnergyKpis(readings);
  const ev = useEvKpis(sessions);

  const loadCurveData = useMemo(() => {
    const rows = [...(readings ?? [])].sort(
      (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
    );
    if (!rows.length) {
      return [
        { hour: "00:00", load: 0, capacity: 100 },
        { hour: "12:00", load: 0, capacity: 100 },
      ];
    }
    return rows.map((r) => ({
      hour: new Date(r.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      load: Math.round(Number(r.kwh)),
      capacity: 100,
    }));
  }, [readings]);

  const evRevenueData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map = new Map(days.map((d) => [d, 0]));
    for (const s of sessions ?? []) {
      const day = days[new Date(s.startedAt).getDay()] ?? "Mon";
      map.set(day, (map.get(day) ?? 0) + Number(s.cost || 0));
    }
    return days.map((day) => ({ day, revenue: Math.round(map.get(day) ?? 0) }));
  }, [sessions]);

  const utilPct = ev.total ? Math.round((ev.charging / Math.max(ev.total, 1)) * 100) : 0;

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ energy, ev, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "energy-oversight.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !readings) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <style jsx global>{`
        .delta-negative-energy {
          color: var(--neon-3);
        }
      `}</style>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Energy & Mobility Oversight</h1>
        <Button variant="outline" className="vx-focus" onClick={handleExport}>
          <Download className="mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="Site kWh (readings)"
          value={energy.kwh.toFixed(0)}
          trend={`${energy.count} samples`}
          trendDirection="neutral"
        />
        <KpiCard
          title="EV utilization"
          value={`${utilPct}%`}
          trend={`${ev.charging} charging`}
          trendDirection="positive"
        />
        <KpiCard
          title="EV revenue"
          value={formatMoney(ev.revenue)}
          trend={`${ev.kwh.toFixed(0)} kWh delivered`}
          trendDirection="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="vx-card bg-black">
          <CardHeader>
            <CardTitle>Site Load Curve</CardTitle>
            <CardDescription>Live energy readings vs capacity proxy</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loadCurveData}>
                <defs>
                  <linearGradient id="colorLoadCurve" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                <YAxis unit="kW" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Area type="monotone" dataKey="load" stroke="hsl(var(--primary))" fill="url(#colorLoadCurve)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="vx-card bg-black">
          <CardHeader>
            <CardTitle>EV Revenue</CardTitle>
            <CardDescription>From live session costs</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
          trendDirection === "positive" ? "delta-positive" : "delta-negative-energy",
        )}
      >
        {trendDirection === "positive" && <ArrowUp className="h-4 w-4 mr-1" />}
        {trendDirection === "negative" && <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}
