"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Filter, Search } from "lucide-react";

export default function AuditLogPage() {
    const auditLogs = [
        { id: 'EVT-001', actor: 'John Doe (Agent)', action: 'policy.override', resource: 'Door D-101', signature: '4B1D...A9F3', timestamp: '2024-08-01 10:30:15' },
        { id: 'EVT-002', actor: 'System', action: 'pricing.update', resource: 'Amenity: Pool', signature: '9E2C...B8D4', timestamp: '2024-08-01 09:45:00' },
        { id: 'EVT-003', actor: 'Jane Smith (Trustee)', action: 'resolution.approved', resource: 'RES-2024-02', signature: 'F3A0...1C5E', timestamp: '2024-07-31 15:00:00' },
    ];

    const handleSearch = () => {
        console.log('sc.trust.audit.searched', { filters: { q: 'policy' } });
    }

    const handleExport = () => {
        console.log('sc.trust.audit.exported');
    }

    return (
        <div className="space-y-8">
             <style jsx global>{`
                .export-glow {
                    box-shadow: 0 0 15px var(--neon-1), inset 0 0 5px var(--neon-1);
                }
             `}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
                <Button variant="outline" className="vx-focus export-glow" onClick={handleExport}>
                    <Download className="mr-2" /> Export
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search logs by actor, action, or resource..." className="pl-8 vx-focus font-mono" onChange={handleSearch}/>
                </div>
                <Button variant="outline" className="vx-focus"><Filter className="mr-2" /> Filter</Button>
            </div>

            <div className="vx-card p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Resource</TableHead>
                                <TableHead>Signature</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="font-mono text-xs">
                            {auditLogs.map(log => (
                                <TableRow key={log.id} className="vx-table-row">
                                    <TableCell>{log.timestamp}</TableCell>
                                    <TableCell>{log.actor}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.resource}</TableCell>
                                    <TableCell>
                                        <span className="bg-muted px-2 py-1 rounded-full text-muted-foreground">{log.signature}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
