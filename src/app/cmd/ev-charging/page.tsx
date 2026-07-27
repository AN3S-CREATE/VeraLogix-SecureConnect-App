"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useAuthClient, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import type { EVSession } from "@/lib/entities";
import { BatteryCharging } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EvRow = EVSession & { id: string; siteId: string };

function num(v: number | string) {
  return typeof v === "number" ? v : Number(v);
}

export default function EvChargingPlannerPage() {
  const client = useAuthClient();
  const { toast } = useToast();
  const { data, isLoading, refresh } = useCollection<EvRow>("ev-sessions", {
    realtimeTable: "ev_sessions",
  });

  const sessions = data ?? [];
  const bays = useMemo(() => {
    const map = new Map<string, EvRow>();
    for (const s of sessions) {
      const prev = map.get(s.bayId);
      if (!prev || new Date(s.startedAt).getTime() > new Date(prev.startedAt).getTime()) {
        map.set(s.bayId, s);
      }
    }
    return [...map.entries()].map(([bayId, session]) => ({ bayId, session }));
  }, [sessions]);

  const plannerData = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, i) => {
      const hour = `${String(i).padStart(2, "0")}:00`;
      const load = sessions
        .filter((s) => s.status === "charging")
        .reduce((sum, s) => sum + num(s.kwh) * (0.6 + (i % 5) * 0.08), 0);
      return { hour, load: Math.round(load), capacity: 100 };
    });
    return hours;
  }, [sessions]);

  const handleLoadShed = async () => {
    const active = sessions.filter((s) => s.status === "charging");
    try {
      await Promise.all(
        active.map((s) =>
          client.update("ev-sessions", s.id, {
            status: "completed",
            endedAt: new Date().toISOString(),
          }),
        ),
      );
      await refresh();
      toast({ title: "Load shed applied", description: `Stopped ${active.length} session(s).` });
    } catch (err) {
      toast({
        title: "Load shed failed",
        description: err instanceof Error ? err.message : "Unable to update sessions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">EV Site Load Planner</h1>
        <Button className="vx-cta vx-focus" onClick={() => void handleLoadShed()}>
          Initiate Load Shed
        </Button>
      </div>

      {isLoading && sessions.length === 0 ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="vx-card p-6">
              <h2 className="text-xl font-bold mb-4">Bay Status</h2>
              {bays.length === 0 ? (
                <p className="text-muted-foreground text-sm">No EV sessions yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {bays.map(({ bayId, session }) => {
                    const charging = session.status === "charging";
                    return (
                      <div
                        key={bayId}
                        className={cn(
                          "p-4 rounded-lg border",
                          charging
                            ? "border-neon-1/50 shadow-[0_0_12px_rgba(182,255,46,.25)]"
                            : "border-border",
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-bold">{bayId}</p>
                          <span className="text-xs capitalize text-muted-foreground">
                            {session.status}
                          </span>
                        </div>
                        <div className="mt-2 text-center">
                          <BatteryCharging
                            className={cn(
                              "mx-auto h-10 w-10",
                              charging ? "text-primary animate-pulse" : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <p className="text-sm mt-2">{num(session.kwh).toFixed(1)} kWh</p>
                        <p className="text-xs text-muted-foreground">
                          R {num(session.cost).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="vx-card p-6">
              <h2 className="text-xl font-bold mb-4">Load Shedding Planner</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plannerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                    <YAxis unit="kW" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="load" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 vx-card p-6 space-y-4">
            <h2 className="text-xl font-bold">Live sessions</h2>
            <p className="text-sm text-muted-foreground">
              {sessions.filter((s) => s.status === "charging").length} charging · {sessions.length}{" "}
              total
            </p>
            <ul className="space-y-3 text-sm">
              {sessions.slice(0, 8).map((s) => (
                <li key={s.id} className="border-b border-white/10 pb-2">
                  <div className="font-medium">
                    {s.bayId} · {s.status}
                  </div>
                  <div className="text-muted-foreground">
                    {num(s.kwh).toFixed(1)} kWh · started {new Date(s.startedAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
