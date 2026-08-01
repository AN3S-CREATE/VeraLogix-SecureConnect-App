
"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FilePlus2, Filter, Download, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useAuthClient, useBackend, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import type { Incident } from "@/lib/entities";

type IncidentRow = Incident & { siteId: string };

type DisplayIncident = {
  id: string;
  desc: string;
  severity: "critical" | "high" | "medium" | "low";
  status: string;
  assignee: string;
  sla: number;
};

function incidentDescription(row: IncidentRow) {
  return row.evidence?.[0] || `Incident ${row.id.slice(0, 8)}`;
}

function incidentAssignee(row: IncidentRow) {
  const tag = row.evidence?.find((e) => e.startsWith("assignee:"));
  return tag ? tag.replace("assignee:", "") : "Unassigned";
}

function slaPercent(deadline: string) {
  const remaining = new Date(deadline).getTime() - Date.now();
  const windowMs = 4 * 60 * 60 * 1000;
  const pct = Math.round(Math.max(0, Math.min(100, (remaining / windowMs) * 100)));
  return Number.isFinite(pct) ? pct : 0;
}

export default function IncidentsPage() {
    const { user } = useBackend();
    const client = useAuthClient();
    const { toast } = useToast();
    const { data, isLoading, refresh } = useCollection<IncidentRow>("incidents", {
      realtimeTable: "incidents",
    });

    const displayData = useMemo<DisplayIncident[]>(
      () =>
        (data ?? []).map((row) => ({
          id: row.id,
          desc: incidentDescription(row),
          severity: row.severity,
          status: row.status,
          assignee: incidentAssignee(row),
          sla: slaPercent(row.slaDeadline),
        })),
      [data],
    );

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [copilotSummary, setCopilotSummary] = useState<string | null>(null);
    const [copilotBusy, setCopilotBusy] = useState(false);
    const selectedIncident = displayData.find((i) => i.id === selectedId) ?? displayData[0] ?? null;

    useEffect(() => {
      if (!selectedId && displayData[0]) setSelectedId(displayData[0].id);
    }, [displayData, selectedId]);

    const severityConfig = {
        critical: { label: 'Critical', className: 'bg-red-500/20 text-red-400 border-red-500/50' },
        high: { label: 'High', className: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
        medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
        low: { label: 'Low', className: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    } as const;

    const patchIncident = async (
      id: string,
      patch: { status?: string; evidence?: string[] },
      success: string,
    ) => {
      try {
        await client.update("incidents", id, patch);
        await refresh();
        toast({ title: success });
      } catch (err) {
        toast({
          title: "Update failed",
          description: err instanceof Error ? err.message : "Unable to update incident",
          variant: "destructive",
        });
      }
    };

    const handleAssign = async (assignee: string) => {
        if (!selectedIncident) return;
        const row = data?.find((r) => r.id === selectedIncident.id);
        const evidence = [...(row?.evidence ?? []).filter((e) => !e.startsWith("assignee:")), `assignee:${assignee}`];
        await patchIncident(selectedIncident.id, { status: "assigned", evidence }, `Assigned to ${assignee}`);
    };
    
    const handleResolve = async () => {
        if (!selectedIncident) return;
        await patchIncident(selectedIncident.id, { status: "closed" }, "Incident resolved");
    };

    const handleSummarize = async () => {
      if (!selectedIncident) return;
      setCopilotBusy(true);
      try {
        const result = await client.summarizeIncident({ incidentId: selectedIncident.id });
        setCopilotSummary(
          `${result.summary}\n\nUrgency: ${result.urgency} · Model: ${result.model}\nActions: ${result.recommendedActions.join("; ")}`,
        );
        toast({ title: "Copilot summary ready" });
      } catch (err) {
        toast({
          title: "Summary failed",
          description: err instanceof Error ? err.message : "Unable to summarize",
          variant: "destructive",
        });
      } finally {
        setCopilotBusy(false);
      }
    };

    const handleCreate = async () => {
      const siteId = user?.siteIds[0];
      if (!siteId) {
        toast({
          title: "No site access",
          description: "Log in with an agent or admin account that has a site assignment.",
          variant: "destructive",
        });
        return;
      }
      const deadline = new Date(Date.now() + 4 * 60 * 60 * 1000);
      try {
        await client.create("incidents", {
          siteId,
          severity: "medium",
          status: "open",
          slaDeadline: deadline.toISOString(),
          evidence: ["Manual incident created from agent console"],
        });
        await refresh();
        toast({ title: "Incident created" });
      } catch (err) {
        toast({
          title: "Create failed",
          description: err instanceof Error ? err.message : "Unable to create incident",
          variant: "destructive",
        });
      }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
            <div className="lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Incidents Inbox</h1>
                    <Button variant="outline" className="vx-focus"><Filter className="mr-2" /> Filter</Button>
                </div>

                <div className="vx-card p-0 flex-1 overflow-hidden">
                   {isLoading && displayData.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <Spinner />
                        </div>
                   ) : displayData.length > 0 ? (
                        <div className="overflow-y-auto h-full">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-4 text-left w-12"><Checkbox id="select-all" aria-label="Select all incidents" className="vx-focus" /></th>
                                        <th className="p-4 text-left font-semibold">Severity</th>
                                        <th className="p-4 text-left font-semibold">Description</th>
                                        <th className="p-4 text-left font-semibold">Assignee</th>
                                        <th className="p-4 text-left font-semibold">SLA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayData.map((incident) => (
                                        <tr
                                          key={incident.id}
                                          className="vx-table-row cursor-pointer"
                                          data-state={incident.id === selectedIncident?.id ? 'selected' : 'unselected'}
                                          onClick={() => setSelectedId(incident.id)}
                                        >
                                            <td className="p-4"><Checkbox id={`select-${incident.id}`} aria-label={`Select incident ${incident.id}`} className="vx-focus" /></td>
                                            <td className="p-4">
                                                <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", severityConfig[incident.severity]?.className)}>
                                                    {severityConfig[incident.severity]?.label}
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-sm truncate">{incident.desc}</td>
                                            <td className="p-4">{incident.assignee}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 text-right text-sm">{incident.sla}%</div>
                                                    <div className={cn("h-2 w-2 rounded-full", incident.sla > 80 ? "bg-neon-3 animate-pulse" : "bg-neon-2")}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                   ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No Open Incidents</h3>
                            <p className="text-sm text-muted-foreground mb-4">The incident queue is clear. Well done.</p>
                            <Button className="vx-cta vx-focus" onClick={() => void handleCreate()}>Create Manual Incident</Button>
                        </div>
                   )}
                </div>
            </div>

            <aside className="lg:col-span-1 vx-card p-6 flex flex-col gap-6">
                {selectedIncident ? (
                    <>
                        <div>
                            <h2 className="text-xl font-bold">Playbook: {selectedIncident.id.slice(0, 8)}</h2>
                            <p className="text-muted-foreground text-sm">{selectedIncident.desc}</p>
                            <p className="text-xs text-muted-foreground mt-1">Status: {selectedIncident.status}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 vx-focus"
                              disabled={copilotBusy}
                              onClick={() => void handleSummarize()}
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              {copilotBusy ? "Summarizing…" : "AI Summarize"}
                            </Button>
                            {copilotSummary ? (
                              <pre className="mt-3 whitespace-pre-wrap rounded-md border border-white/10 bg-black/30 p-3 text-xs text-muted-foreground">
                                {copilotSummary}
                              </pre>
                            ) : null}
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold">Assign</h3>
                             <Select
                               value={selectedIncident.assignee !== "Unassigned" ? selectedIncident.assignee : undefined}
                               onValueChange={(v) => void handleAssign(v)}
                             >
                                <SelectTrigger className="w-full vx-focus">
                                    <SelectValue placeholder="Select an assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="John Doe">John Doe</SelectItem>
                                    <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                                    <SelectItem value="System Admin">System Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold">Add Internal Note</h3>
                            <Textarea placeholder="Type your note..." className="vx-focus" />
                            <Button size="sm" className="w-full vx-cta vx-focus">Add Note</Button>
                        </div>
                        
                        <div className="space-y-2">
                             <h3 className="font-semibold">Evidence</h3>
                            <div className="border border-dashed border-border rounded-md p-6 text-center">
                                <FilePlus2 className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">Attach evidence files</p>
                                 <Input id="media" type="file" className="sr-only" />
                            </div>
                        </div>

                        <div className="flex-1"></div>

                        <div className="space-y-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full vx-cta vx-focus" disabled={selectedIncident.status === "closed"}>Resolve Incident</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg bg-background border-white/10">
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                                    <DialogHeader>
                                        <DialogTitle>Resolve Incident: {selectedIncident.id.slice(0, 8)}</DialogTitle>
                                        <DialogDescription>
                                            Verify evidence, select an outcome, and add final notes to resolve this incident.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 my-4 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <p className="text-7xl font-black text-white/5 -rotate-12 select-none">
                                                HASH: {selectedIncident.id.substring(0,4)}...C4A9
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="outcome">Resolution Outcome</Label>
                                            <Select>
                                                <SelectTrigger id="outcome" className="w-full vx-focus">
                                                    <SelectValue placeholder="Select an outcome" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                    <SelectItem value="false_alarm">False Alarm</SelectItem>
                                                    <SelectItem value="escalated_externally">Escalated Externally</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="resolution-notes">Final Notes</Label>
                                            <Textarea id="resolution-notes" placeholder="Add your closing remarks..." className="vx-focus" />
                                        </div>
                                    </div>
                                    <DialogFooter className="sm:justify-between">
                                        <Button variant="outline" className="vx-focus"><Download className="mr-2" /> Export Report</Button>
                                        <div>
                                            <DialogClose asChild>
                                              <Button variant="secondary" className="vx-focus">Cancel</Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                              <Button className="vx-cta vx-focus ml-2" onClick={() => void handleResolve()}>Confirm Resolution</Button>
                                            </DialogClose>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button variant="destructive" className="w-full vx-focus">Escalate</Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <p>Select an incident to view its playbook.</p>
                    </div>
                )}
            </aside>
        </div>
    );
}
