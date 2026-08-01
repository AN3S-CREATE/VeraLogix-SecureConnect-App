"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Ticket } from "@/lib/entities";
import { useAuthClient, useBackend, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import { Hammer } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type TicketRow = Ticket & { siteId: string };

function riskFromSeverity(severity?: Ticket["severity"]): "low" | "medium" | "high" {
  if (severity === "critical" || severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function displayStatus(status: string) {
  if (status === "assigned" || status === "in_progress") return "Assigned";
  if (status === "closed" || status === "resolved") return "Resolved";
  return "New";
}

export default function MaintenancePage() {
  const { user } = useBackend();
  const client = useAuthClient();
  const { toast } = useToast();
  const { data, isLoading, refresh } = useCollection<TicketRow>("tickets", {
    realtimeTable: "tickets",
  });
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [vendor, setVendor] = useState("plumbco");

  const tickets = useMemo(
    () =>
      (data ?? []).map((row) => ({
        id: row.id,
        title: row.description,
        unit: row.unitId.slice(0, 8),
        status: displayStatus(row.status),
        risk: riskFromSeverity(row.severity),
        raw: row,
      })),
    [data],
  );

  const riskConfig = {
    low: { label: "Low", className: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
    medium: { label: "Medium", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    high: { label: "High", className: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
  };

  const handleAssign = async (ticketId: string) => {
    setAssigningId(ticketId);
    try {
      const row = data?.find((t) => t.id === ticketId);
      await client.update("tickets", ticketId, {
        status: "assigned",
        timeline: [...(row?.timeline ?? []), `Assigned vendor:${vendor} by ${user?.email ?? "agent"}`],
      });
      await refresh();
      toast({ title: "Work order created", description: `Ticket assigned to ${vendor}.` });
    } catch (err) {
      toast({
        title: "Assign failed",
        description: err instanceof Error ? err.message : "Unable to update ticket",
        variant: "destructive",
      });
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Maintenance Work Orders</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative vx-card p-0 aspect-[16/9] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1621282636114-c3c76345156a?q=80&w=1932&auto=format&fit=crop"
              alt="Site Map"
              fill
              className="object-cover opacity-10"
              data-ai-hint="dark map"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">Live tickets from `/api/v1/tickets`</p>
            </div>
          </div>
          <div className="vx-card p-0">
            {isLoading && tickets.length === 0 ? (
              <div className="p-10 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-left w-12">
                        <Checkbox id="select-all" />
                      </th>
                      <th className="p-4 text-left font-semibold">Ticket ID</th>
                      <th className="p-4 text-left font-semibold">Title</th>
                      <th className="p-4 text-left font-semibold">Unit</th>
                      <th className="p-4 text-left font-semibold">Risk</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No tickets yet. Residents can create them from `/ten/maintenance`, or run `npm run db:seed`.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => (
                        <tr key={ticket.id} className="vx-table-row border-t border-white/10">
                          <td className="p-4">
                            <Checkbox id={`select-${ticket.id}`} />
                          </td>
                          <td className="p-4 font-mono text-xs">{ticket.id.slice(0, 8)}</td>
                          <td className="p-4">{ticket.title}</td>
                          <td className="p-4">{ticket.unit}</td>
                          <td className="p-4">
                            <span
                              className={cn(
                                "px-2 py-1 text-xs font-semibold rounded-full border",
                                riskConfig[ticket.risk].className,
                              )}
                            >
                              {riskConfig[ticket.risk].label}
                            </span>
                          </td>
                          <td className="p-4">{ticket.status}</td>
                          <td className="p-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="vx-focus"
                                  disabled={ticket.status === "Assigned" || ticket.status === "Resolved"}
                                >
                                  <Hammer className="mr-2" />
                                  Create Work Order
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md bg-background border-white/10">
                                <DialogHeader>
                                  <DialogTitle>Create Work Order</DialogTitle>
                                  <DialogDescription>
                                    Assign a vendor for ticket {ticket.id.slice(0, 8)}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 my-4">
                                  <div>
                                    <Label htmlFor="vendor">Assign Vendor</Label>
                                    <Select value={vendor} onValueChange={setVendor}>
                                      <SelectTrigger id="vendor" className="w-full vx-focus">
                                        <SelectValue placeholder="Select a vendor" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="plumbco">PlumbCo</SelectItem>
                                        <SelectItem value="electrix">ElectriX</SelectItem>
                                        <SelectItem value="hvac-pros">HVAC Pros</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    className="vx-cta vx-focus"
                                    disabled={assigningId === ticket.id}
                                    onClick={() => handleAssign(ticket.id)}
                                  >
                                    {assigningId === ticket.id ? "Saving…" : "Create & Assign"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <aside className="lg:col-span-1 space-y-6">
          <div className="vx-card p-6">
            <h2 className="text-xl font-bold mb-2">Queue</h2>
            <p className="text-sm text-muted-foreground">
              {tickets.filter((t) => t.status === "New").length} open ·{" "}
              {tickets.filter((t) => t.status === "Assigned").length} assigned
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
