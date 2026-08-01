"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarPlus, CheckCircle, Clock, QrCode, UserPlus, XCircle, Wrench } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthClient, useBackend, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import type { Ticket, Pass } from "@/lib/entities";

type TicketRow = Ticket & { id: string; siteId: string };
type PassRow = Pass & { id: string; siteId?: string };

export default function VenDashboardPage() {
  const { user } = useBackend();
  const client = useAuthClient();
  const { toast } = useToast();
  const { data: tickets, isLoading, refresh } = useCollection<TicketRow>("tickets", {
    realtimeTable: "tickets",
  });
  const { data: passes } = useCollection<PassRow>("passes");

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  const workOrders = useMemo(() => (tickets ?? []).slice(0, 8), [tickets]);
  const accessWindows = useMemo(() => {
    return (passes ?? []).map((p) => ({
      id: p.id,
      status: p.status === "active" ? ("approved" as const) : ("rejected" as const),
      start: new Date(p.start).toLocaleString(),
      end: new Date(p.end).toLocaleString(),
      notes: `Areas: ${(p.areas ?? []).join(", ") || "general"} · code ${p.code}`,
    }));
  }, [passes]);

  const statusConfig = {
    approved: { label: "Approved", icon: <CheckCircle />, className: "chip-info" },
    pending: { label: "Pending", icon: <Clock />, className: "text-yellow-400" },
    rejected: { label: "Expired", icon: <XCircle />, className: "chip-alert" },
  } as const;

  const submitAccess = async () => {
    const siteId = user?.siteIds[0];
    if (!siteId || !user?.id) {
      toast({
        title: "Sign in required",
        description: "Vendor account with site access needed.",
        variant: "destructive",
      });
      return;
    }
    try {
      await client.create("passes", {
        siteId,
        unitId: user.siteIds[0], // may fail if unit required — tickets fallback
        code: `VEN-${Date.now().toString(36).toUpperCase()}`,
        areas: ["vendor", "service"],
        start: start ? new Date(start).toISOString() : new Date().toISOString(),
        end: end ? new Date(end).toISOString() : new Date(Date.now() + 8 * 3600_000).toISOString(),
        status: "active",
      });
      await refresh();
      setOpen(false);
      toast({ title: "Access window requested", description: reason || "Submitted" });
    } catch {
      // Passes require unitId — create a ticket instead as access request trail
      try {
        const unitId =
          (tickets?.[0]?.unitId as string | undefined) ??
          "00000000-0000-4000-8000-000000000001";
        await client.create("tickets", {
          siteId,
          unitId,
          category: "vendor_access",
          description: reason || "Vendor access window request",
          status: "open",
          severity: "medium",
          slaDeadline: end
            ? new Date(end).toISOString()
            : new Date(Date.now() + 8 * 3600_000).toISOString(),
          timeline: [
            `Access requested ${start || "now"} → ${end || "+8h"} by ${user.email}`,
          ],
        });
        await refresh();
        setOpen(false);
        toast({ title: "Access request logged as work ticket" });
      } catch (err) {
        toast({
          title: "Request failed",
          description: err instanceof Error ? err.message : "Unable to submit",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading && !tickets) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Vendor Dashboard</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="vx-cta vx-focus">
              <CalendarPlus className="mr-2" /> Request Access Window
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background border-white/10">
            <DialogHeader>
              <DialogTitle>New Access Request</DialogTitle>
              <DialogDescription>
                Request a time window to access the property for work.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  className="vx-focus"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  className="vx-focus"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reason">Reason for Access</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Scheduled HVAC maintenance"
                  className="vx-focus"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="vx-cta vx-focus" onClick={() => void submitAccess()}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 rounded-lg border border-border bg-card">
        <p className="font-semibold">Open work orders: {workOrders.filter((t) => t.status !== "resolved" && t.status !== "closed").length}</p>
        <p className="text-sm text-muted-foreground">
          Complete safety induction before high-risk permits.
        </p>
        <Button asChild size="sm" className="mt-2 vx-cta vx-focus">
          <Link href="/ven/safety">Safety</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="mt-2 ml-2 vx-focus">
          <Link href="/ven/work-orders">
            <Wrench className="mr-1 h-4 w-4" /> Work orders
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Access Windows</h2>
        {accessWindows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No passes yet — request an access window above.</p>
        ) : (
          accessWindows.map((window) => {
            const { label, icon, className } = statusConfig[window.status];
            return (
              <div
                key={window.id}
                className={cn(
                  "vx-card p-4",
                  window.status === "approved" &&
                    "border-neon-1/50 shadow-[0_0_12px_rgba(182,255,46,.25)]",
                )}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-1 text-xs rounded-full flex items-center gap-1", className)}>
                        {icon} {label}
                      </span>
                      <p className="font-semibold text-foreground">{window.id.slice(0, 8)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{window.notes}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      From: {window.start} To: {window.end}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="vx-focus"
                          disabled={window.status !== "approved"}
                        >
                          <UserPlus /> Issue Crew Pass
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xs bg-black p-0 border-0">
                        <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
                          <h2 className="text-lg font-bold">Crew Pass</h2>
                          <div className="bg-white p-2 rounded-md">
                            <QrCode className="w-48 h-48 text-black" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Valid: {window.start} - {window.end}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Recent tickets</h2>
        <ul className="space-y-2 text-sm">
          {workOrders.map((t) => (
            <li key={t.id} className="vx-card p-3 flex justify-between">
              <span>{t.description}</span>
              <span className="text-muted-foreground">{t.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
