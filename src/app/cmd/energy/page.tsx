"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useCollection } from "@/backend";
import type { Energy } from "@/lib/entities";
import { Droplets, Fan, Zap } from "lucide-react";
import { useMemo } from "react";

type EnergyRow = Energy & { id: string };

function num(v: number | string) {
  return typeof v === "number" ? v : Number(v);
}

function ZoneLeaderboard({
  rows,
  metric,
}: {
  rows: EnergyRow[];
  metric: "kwh" | "waterL" | "iaqIndex";
}) {
  const ranked = useMemo(() => {
    const byZone = new Map<string, number>();
    for (const r of rows) {
      const prev = byZone.get(r.zone) ?? 0;
      byZone.set(r.zone, prev + (metric === "iaqIndex" ? r.iaqIndex : num(r[metric])));
    }
    return [...byZone.entries()]
      .map(([zone, value]) => ({ zone, value }))
      .sort((a, b) => b.value - a.value);
  }, [rows, metric]);

  if (!ranked.length) {
    return <p className="text-muted-foreground text-sm">No zone data yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {ranked.map((z, i) => (
        <li key={z.zone} className="flex justify-between text-sm border-b border-white/10 pb-2">
          <span>
            #{i + 1} {z.zone}
          </span>
          <span className="font-semibold text-primary">
            {metric === "iaqIndex" ? z.value.toFixed(0) : z.value.toFixed(1)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReadingTable({
  rows,
  columns,
}: {
  rows: EnergyRow[];
  columns: { key: "kwh" | "waterL" | "iaqIndex"; label: string }[];
}) {
  const sorted = [...rows].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="p-3">Time</th>
            <th className="p-3">Zone</th>
            {columns.map((c) => (
              <th key={c.key} className="p-3">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id} className="border-b border-white/5">
              <td className="p-3 text-muted-foreground">{new Date(r.ts).toLocaleString()}</td>
              <td className="p-3">{r.zone}</td>
              {columns.map((c) => (
                <td key={c.key} className="p-3 font-medium">
                  {c.key === "iaqIndex" ? r.iaqIndex : num(r[c.key]).toFixed(1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EnergyPage() {
  const { data, isLoading } = useCollection<EnergyRow>("energy", {
    realtimeTable: "energy_readings",
  });
  const rows = data ?? [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Energy & Environmental</h1>

      {isLoading && rows.length === 0 ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : (
        <Tabs defaultValue="energy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 h-12">
            <TabsTrigger value="energy" className="vx-tabs-trigger h-full flex items-center gap-2">
              <Zap /> Energy
            </TabsTrigger>
            <TabsTrigger value="water" className="vx-tabs-trigger h-full flex items-center gap-2">
              <Droplets /> Water
            </TabsTrigger>
            <TabsTrigger value="iaq" className="vx-tabs-trigger h-full flex items-center gap-2">
              <Fan /> Indoor Air Quality
            </TabsTrigger>
          </TabsList>

          {(
            [
              { value: "energy", metric: "kwh" as const, label: "Energy Consumption (kWh)" },
              { value: "water", metric: "waterL" as const, label: "Water Consumption (Liters)" },
              { value: "iaq", metric: "iaqIndex" as const, label: "Indoor Air Quality Index" },
            ] as const
          ).map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 vx-card">
                  <CardHeader>
                    <CardTitle>{tab.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {rows.length ? (
                      <ReadingTable
                        rows={rows}
                        columns={[{ key: tab.metric, label: tab.label.split(" ")[0] }]}
                      />
                    ) : (
                      <p className="text-muted-foreground text-center py-16">
                        No readings yet. Seed the API or post to `/api/v1/energy`.
                      </p>
                    )}
                  </CardContent>
                </div>
                <aside className="lg:col-span-1 vx-card">
                  <CardHeader>
                    <CardTitle>Zone Leaderboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ZoneLeaderboard rows={rows} metric={tab.metric} />
                  </CardContent>
                </aside>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
