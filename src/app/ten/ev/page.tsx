"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuthClient, useBackend, useCollection } from "@/backend";
import type { EVSession } from "@/lib/entities";
import { useMemo } from "react";

type EvRow = EVSession & { id: string; siteId: string };

function num(v: number | string) {
  return typeof v === "number" ? v : Number(v);
}

export default function TenEvPage() {
  const { toast } = useToast();
  const { user } = useBackend();
  const client = useAuthClient();
  const { data, isLoading, refresh } = useCollection<EvRow>("ev-sessions", {
    realtimeTable: "ev_sessions",
  });

  const sessions = data ?? [];
  const mine = useMemo(
    () => sessions.filter((s) => !user?.id || s.userId === user.id),
    [sessions, user?.id],
  );
  const active = mine.find((s) => s.status === "charging") ?? null;

  const bays = useMemo(() => {
    const ids = new Set(sessions.map((s) => s.bayId));
    if (ids.size === 0) return ["Bay-1", "Bay-2", "Bay-3", "Bay-4"];
    return [...ids];
  }, [sessions]);

  const handleStopCharging = async () => {
    if (!active) return;
    try {
      await client.update("ev-sessions", active.id, {
        status: "completed",
        endedAt: new Date().toISOString(),
      });
      await refresh();
      toast({
        title: "Charging Stopped",
        description: "Your EV charging session has been stopped.",
      });
    } catch (err) {
      toast({
        title: "Stop failed",
        description: err instanceof Error ? err.message : "Unable to stop session",
        variant: "destructive",
      });
    }
  };

  const handleReserve = async (bayId: string) => {
    const siteId = user?.siteIds[0];
    if (!siteId || !user?.id) {
      toast({
        title: "Sign in required",
        description: "Log in with a resident account that has a site assignment.",
        variant: "destructive",
      });
      return;
    }
    try {
      await client.create("ev-sessions", {
        siteId,
        bayId,
        userId: user.id,
        kwh: 0,
        cost: 0,
        status: "charging",
      });
      await refresh();
      toast({
        title: "Bay Reserved",
        description: `Charging started on ${bayId}.`,
      });
    } catch (err) {
      toast({
        title: "Reserve failed",
        description: err instanceof Error ? err.message : "Unable to start session",
        variant: "destructive",
      });
    }
  };

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">EV Charging</h1>

      {active ? (
        <div className="vx-card p-6 border-neon-1/50 shadow-[0_0_24px_rgba(182,255,46,.45)]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Active Session: {active.bayId}</h2>
              <p className="text-muted-foreground">Started {new Date(active.startedAt).toLocaleString()}</p>
            </div>
            <Button variant="destructive" className="vx-focus" onClick={() => void handleStopCharging()}>
              Stop Charging
            </Button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-5xl font-bold text-gradient-primary">{num(active.kwh).toFixed(1)} kWh</p>
            <p className="text-sm text-muted-foreground mt-2">Cost R {num(active.cost).toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <div className="vx-card p-6 text-center">
          <h2 className="text-xl font-bold">No Active Session</h2>
          <p className="text-muted-foreground">Reserve a bay below to start charging.</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Charging Bays</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bays.map((bayId) => {
            const session = sessions.find((s) => s.bayId === bayId && s.status === "charging");
            const isAvailable = !session;
            return (
              <div
                key={bayId}
                className={cn(
                  "vx-card p-4 text-center space-y-2",
                  !isAvailable && "opacity-80",
                  isAvailable && "border-neon-1/50",
                )}
              >
                <Zap className={cn("mx-auto", isAvailable ? "text-primary" : "text-muted-foreground")} />
                <p className="font-bold">{bayId}</p>
                <p className="text-xs text-muted-foreground">{isAvailable ? "available" : "in use"}</p>
                <Button
                  size="sm"
                  className="vx-cta vx-focus w-full"
                  disabled={!isAvailable || Boolean(active)}
                  onClick={() => void handleReserve(bayId)}
                >
                  Reserve
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
