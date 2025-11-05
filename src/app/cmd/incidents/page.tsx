
"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FilePlus2, Filter, Download, ShieldAlert } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { Ticket } from "@/lib/entities";

export default function IncidentsPage() {
    const firestore = useFirestore();
    const ticketsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'tickets') : null, [firestore]);
    const { data: incidents, isLoading } = useCollection<Ticket>(ticketsCollection);
    
    const [selectedIncident, setSelectedIncident] = useState<Ticket | null>(null);

    // Update selected incident when incidents data changes
    useEffect(() => {
        if (incidents && incidents.length > 0) {
            if (selectedIncident) {
                // If there's a selected incident, find its updated version in the new data
                const updatedSelected = incidents.find(i => i.id === selectedIncident.id);
                setSelectedIncident(updatedSelected || incidents[0]);
            } else {
                // Otherwise, default to the first incident
                setSelectedIncident(incidents[0]);
            }
        } else if (!isLoading) {
            // If there are no incidents and we are not loading, clear the selection
            setSelectedIncident(null);
        }
    }, [incidents, isLoading, selectedIncident?.id]);


    const severityConfig = {
        critical: { label: 'Critical', className: 'bg-red-500/20 text-red-400 border-red-500/50' },
        high: { label: 'High', className: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
        medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
        low: { label: 'Low', className: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    } as const;

    const handleAssign = (assignee: string) => {
        if (!selectedIncident) return;
        console.log('sc.agent.incidents.assign', { incidentId: selectedIncident.id, assignee });
    };
    
    const handleResolve = () => {
        if (!selectedIncident) return;
        console.log('sc.agent.incidents.resolve', { incidentId: selectedIncident.id });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
            <div className="lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Incidents Inbox</h1>
                    <Button variant="outline" className="vx-focus"><Filter className="mr-2" /> Filter</Button>
                </div>

                <div className="vx-card p-0 flex-1 overflow-hidden">
                   {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <Spinner />
                        </div>
                   ) : incidents && incidents.length > 0 ? (
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
                                    {incidents.map((incident) => (
                                        <tr key={incident.id} className="vx-table-row" data-state={incident.id === selectedIncident?.id ? 'selected' : 'unselected'} onClick={() => setSelectedIncident(incident)}>
                                            <td className="p-4"><Checkbox id={`select-${incident.id}`} aria-label={`Select incident ${incident.id}`} className="vx-focus" /></td>
                                            <td className="p-4">
                                                <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", severityConfig[incident.severity as keyof typeof severityConfig]?.className)}>
                                                    {severityConfig[incident.severity as keyof typeof severityConfig]?.label}
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-sm truncate">{incident.desc}</td>
                                            <td className="p-4">{incident.assignee || 'Unassigned'}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 text-right text-sm">{incident.sla || 0}%</div>
                                                    <div className={cn("h-2 w-2 rounded-full", incident.sla && incident.sla > 80 ? "bg-neon-3 animate-pulse" : "bg-neon-2")}></div>
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
                            <Button className="vx-cta vx-focus">Create Manual Incident</Button>
                        </div>
                   )}
                </div>
            </div>

            <aside className="lg:col-span-1 vx-card p-6 flex flex-col gap-6">
                {selectedIncident ? (
                    <>
                        <div>
                            <h2 className="text-xl font-bold">Playbook: {selectedIncident.id}</h2>
                            <p className="text-muted-foreground text-sm">{selectedIncident.desc}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold">Assign</h3>
                             <Select defaultValue={selectedIncident.assignee && selectedIncident.assignee !== 'Unassigned' ? selectedIncident.assignee : undefined} onValueChange={handleAssign}>
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
                                    <Button className="w-full vx-cta vx-focus">Resolve Incident</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg bg-background border-white/10">
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                                    <DialogHeader>
                                        <DialogTitle>Resolve Incident: {selectedIncident.id}</DialogTitle>
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
                                              <Button className="vx-cta vx-focus ml-2" onClick={handleResolve}>Confirm Resolution</Button>
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
