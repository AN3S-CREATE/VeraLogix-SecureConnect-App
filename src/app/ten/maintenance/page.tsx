"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAuthClient, useBackend, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import type { Ticket } from "@/lib/entities";
import { cn } from "@/lib/utils";
import { Paperclip, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TicketRow = Ticket & { siteId: string };

function slaPercent(deadline: string) {
  const remaining = new Date(deadline).getTime() - Date.now();
  const windowMs = 48 * 60 * 60 * 1000;
  const pct = Math.round(Math.max(0, Math.min(100, (remaining / windowMs) * 100)));
  return Number.isFinite(pct) ? pct : 0;
}

function displayStatus(status: string) {
  if (status === "assigned" || status === "in_progress") return "In Progress";
  if (status === "closed" || status === "resolved") return "Resolved";
  return "New";
}

export default function TenMaintenancePage() {
  const { user } = useBackend();
  const client = useAuthClient();
  const { toast } = useToast();
  const { data, isLoading, refresh } = useCollection<TicketRow>("tickets", {
    realtimeTable: "tickets",
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const siteId = user?.siteIds[0];

  useEffect(() => {
    if (!siteId) return;
    client
      .list<{ id: string }>("units", { siteId, limit: 1 })
      .then((res) => setUnitId(res.data[0]?.id ?? null))
      .catch(() => setUnitId(null));
  }, [client, siteId]);

  const tickets = useMemo(
    () =>
      (data ?? []).map((row) => ({
        id: row.id,
        title: row.description,
        status: displayStatus(row.status),
        sla: row.sla ?? slaPercent(row.slaDeadline),
      })),
    [data],
  );

  const handleTicketCreate = async () => {
    if (!siteId || !unitId) {
      toast({
        title: "Missing site data",
        description: "Log in with a resident account that has a unit, or run db:seed.",
        variant: "destructive",
      });
      return;
    }
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await client.create("tickets", {
        siteId,
        unitId,
        category: "general",
        description: title.trim() + (description.trim() ? ` — ${description.trim()}` : ""),
        status: "open",
        severity: "medium",
        slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        timeline: [`Opened by ${user?.email ?? "resident"}`],
      });
      await refresh();
      setOpen(false);
      setTitle("");
      setDescription("");
      toast({ title: "Ticket submitted" });
    } catch (err) {
      toast({
        title: "Submit failed",
        description: err instanceof Error ? err.message : "Unable to create ticket",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8" id="new">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="vx-cta vx-focus rounded-full w-14 h-14">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background border-white/10">
            <DialogHeader>
              <DialogTitle>New Maintenance Ticket</DialogTitle>
              <DialogDescription>Describe your issue. It is stored via the SecureConnect API.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Leaky Faucet in Kitchen"
                  className="vx-focus"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide as much detail as possible."
                  className="vx-focus"
                />
              </div>
              <div>
                <Label htmlFor="media-upload">Attachments</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/50 px-6 py-10 bg-black/20">
                  <div className="text-center">
                    <Paperclip className="mx-auto h-12 w-12 text-gray-500" aria-hidden="true" />
                    <p className="mt-2 text-xs text-muted-foreground">File upload uses MinIO in a later phase</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button className="vx-cta" disabled={submitting} onClick={handleTicketCreate}>
                {submitting ? "Submitting…" : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && tickets.length === 0 ? (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <p className="text-muted-foreground">No tickets yet. Create one with the + button.</p>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="vx-card p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="flex-1">
                  <p className="font-bold">{ticket.title}</p>
                  <p
                    className={`text-sm ${ticket.status === "New" ? "text-primary font-semibold" : "text-muted-foreground"}`}
                  >
                    {ticket.status}
                  </p>
                </div>
                <div className="w-full sm:w-1/3 text-left sm:text-right">
                  <div className="flex items-center gap-2 sm:justify-end">
                    <p className="text-xs text-muted-foreground">SLA</p>
                    <Progress
                      value={ticket.sla}
                      className={cn("h-2 w-24", ticket.sla < 85 ? "[&>div]:bg-neon-2" : "[&>div]:bg-neon-3")}
                    />
                    <span
                      className={cn("text-xs font-mono", ticket.sla < 85 ? "text-neon-2" : "text-neon-3")}
                    >
                      {ticket.sla}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
