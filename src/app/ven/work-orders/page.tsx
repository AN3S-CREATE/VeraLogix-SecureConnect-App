"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthClient, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import type { Ticket } from "@/lib/entities";

type TicketRow = Ticket & { siteId: string };

function priorityFromSeverity(severity?: Ticket["severity"]): "High" | "Medium" | "Low" {
  if (severity === "critical" || severity === "high") return "High";
  if (severity === "medium") return "Medium";
  return "Low";
}

function statusLabel(status: string) {
  if (status === "sla_breached") return "SLA Breached";
  if (status === "in_progress" || status === "assigned") return "In Progress";
  if (status === "closed" || status === "resolved") return "Closed";
  return "New";
}

export default function VenWorkOrdersPage() {
  const client = useAuthClient();
  const { toast } = useToast();
  const { data, isLoading, refresh } = useCollection<TicketRow>("tickets", {
    realtimeTable: "tickets",
  });

  const workOrders = useMemo(
    () =>
      (data ?? []).map((row) => ({
        id: row.id,
        title: row.description,
        priority: priorityFromSeverity(row.severity),
        status: statusLabel(row.status),
        site: row.siteId.slice(0, 8),
        raw: row,
      })),
    [data],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedWorkOrder =
    workOrders.find((w) => w.id === selectedId) ?? workOrders[0] ?? null;

  useEffect(() => {
    if (!selectedId && workOrders[0]) setSelectedId(workOrders[0].id);
  }, [workOrders, selectedId]);

  const priorityConfig = {
    High: { label: "High", className: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
    Medium: { label: "Medium", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    Low: { label: "Low", className: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
  };

  const markInProgress = async () => {
    if (!selectedWorkOrder) return;
    try {
      await client.update("tickets", selectedWorkOrder.id, {
        status: "in_progress",
        timeline: [...(selectedWorkOrder.raw.timeline ?? []), `Vendor accepted ${new Date().toISOString()}`],
      });
      await refresh();
      toast({ title: "Work order accepted" });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unable to update ticket",
        variant: "destructive",
      });
    }
  };

  const markComplete = async () => {
    if (!selectedWorkOrder) return;
    try {
      await client.update("tickets", selectedWorkOrder.id, {
        status: "resolved",
        timeline: [...(selectedWorkOrder.raw.timeline ?? []), `Vendor completed ${new Date().toISOString()}`],
      });
      await refresh();
      toast({ title: "Work order completed" });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unable to update ticket",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-1 flex flex-col">
        <h1 className="text-3xl font-bold text-foreground mb-6">Work Orders</h1>
        <div className="flex-1">
          {isLoading && workOrders.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Spinner />
            </div>
          ) : workOrders.length > 0 ? (
            <ScrollArea className="h-full -mr-4 pr-4">
              <div className="space-y-4">
                {workOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className={cn(
                      "vx-card p-4 cursor-pointer",
                      selectedWorkOrder?.id === wo.id &&
                        "border-neon-1/50 shadow-[0_0_12px_rgba(182,255,46,.25)]",
                    )}
                    onClick={() => setSelectedId(wo.id)}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-foreground">{wo.id.slice(0, 8)}</p>
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-semibold rounded-full border",
                          priorityConfig[wo.priority].className,
                        )}
                      >
                        {priorityConfig[wo.priority].label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{wo.title}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {wo.status} @ site {wo.site}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <Wrench className="w-12 h-12 mb-2" />
              <h3 className="font-semibold text-foreground">No Work Orders</h3>
              <p className="text-sm">Live tickets assigned to your sites will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 vx-card p-0 flex flex-col">
        {selectedWorkOrder ? (
          <Tabs defaultValue="plan" className="flex-1 flex flex-col">
            <div className="p-6">
              <h2 className="text-xl font-bold">Work Order: {selectedWorkOrder.id.slice(0, 8)}</h2>
              <p className="text-muted-foreground text-sm">{selectedWorkOrder.title}</p>
              <TabsList className="mt-4 grid w-full grid-cols-2 bg-black/20">
                <TabsTrigger value="plan" className="vx-tabs-trigger">
                  Job Plan & Schedule
                </TabsTrigger>
                <TabsTrigger value="handover" className="vx-tabs-trigger">
                  Evidence & Handover
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="plan" className="flex-1 flex flex-col gap-4 px-6 pb-6 mt-0">
              <div className="text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  {selectedWorkOrder.raw.category}
                </p>
                <p>
                  <span className="text-muted-foreground">SLA deadline:</span>{" "}
                  {new Date(selectedWorkOrder.raw.slaDeadline).toLocaleString()}
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span> {selectedWorkOrder.status}
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="vx-cta vx-focus" onClick={() => void markInProgress()}>
                  Accept / In Progress
                </Button>
                <Button variant="outline" className="vx-focus" onClick={() => void markComplete()}>
                  Mark Complete
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Timeline</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {(selectedWorkOrder.raw.timeline ?? []).map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="handover" className="flex-1 px-6 pb-6 mt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Attach evidence via the evidence locker (`/api/v1/files` + incident/ticket media fields).
                Media refs on this ticket:
              </p>
              <ul className="text-sm space-y-2">
                {(selectedWorkOrder.raw.media ?? []).length ? (
                  selectedWorkOrder.raw.media!.map((m) => <li key={m}>{m}</li>)
                ) : (
                  <li className="text-muted-foreground">No media attached yet.</li>
                )}
              </ul>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a work order
          </div>
        )}
      </div>
    </div>
  );
}
