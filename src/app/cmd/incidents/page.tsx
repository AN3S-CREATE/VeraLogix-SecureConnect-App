"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FilePlus2, Filter, User } from "lucide-react";

export default function IncidentsPage() {

    const incidents = [
        { id: 'INC-001', severity: 'critical', description: 'Unauthorised access attempt on main entrance.', assignee: 'John Doe', sla: 95 },
        { id: 'INC-002', severity: 'high', description: 'Perimeter fence breach detected near Sector 4.', assignee: 'Jane Smith', sla: 60 },
        { id: 'INC-003', severity: 'medium', description: 'CCTV camera offline in parking garage P2.', assignee: 'Unassigned', sla: 25 },
        { id: 'INC-004', severity: 'low', description: 'Scheduled fire alarm test failure.', assignee: 'Unassigned', sla: 10 },
    ];

    const selectedIncident = incidents[1];

    const severityConfig = {
        critical: { label: 'Critical', className: 'bg-red-500/20 text-red-400 border-red-500/50' },
        high: { label: 'High', className: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
        medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
        low: { label: 'Low', className: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    } as const;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
            <div className="lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Incidents Inbox</h1>
                    <Button variant="outline" className="vx-focus"><Filter className="mr-2" /> Filter</Button>
                </div>

                <div className="vx-card p-0 flex-1 overflow-hidden">
                    <div className="overflow-y-auto h-full">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-4 text-left w-12"><Checkbox id="select-all" /></th>
                                    <th className="p-4 text-left font-semibold">Severity</th>
                                    <th className="p-4 text-left font-semibold">Description</th>
                                    <th className="p-4 text-left font-semibold">Assignee</th>
                                    <th className="p-4 text-left font-semibold">SLA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.map((incident) => (
                                    <tr key={incident.id} className="vx-table-row border-t border-white/10" data-state={incident.id === selectedIncident.id ? 'selected' : 'unselected'}>
                                        <td className="p-4"><Checkbox id={`select-${incident.id}`} /></td>
                                        <td className="p-4">
                                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", severityConfig[incident.severity as keyof typeof severityConfig].className)}>
                                                {severityConfig[incident.severity as keyof typeof severityConfig].label}
                                            </span>
                                        </td>
                                        <td className="p-4 max-w-sm truncate">{incident.description}</td>
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
                </div>
            </div>

            <aside className="lg:col-span-1 vx-card p-6 flex flex-col gap-6">
                <div>
                    <h2 className="text-xl font-bold">Playbook: {selectedIncident.id}</h2>
                    <p className="text-muted-foreground text-sm">{selectedIncident.description}</p>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold">Assign</h3>
                     <Select defaultValue={selectedIncident.assignee !== 'Unassigned' ? selectedIncident.assignee : undefined}>
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
                    <Button className="w-full vx-cta vx-focus">Resolve Incident</Button>
                    <Button variant="destructive" className="w-full vx-focus">Escalate</Button>
                </div>
            </aside>
        </div>
    );
}
