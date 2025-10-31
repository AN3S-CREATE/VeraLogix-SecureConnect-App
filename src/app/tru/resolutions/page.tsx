"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Plus, SendHorizonal, Signature, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useState } from "react";

export default function ResolutionsPage() {

    const resolutions = [
        { id: 'RES-2024-01', title: 'Approve 2025 Budget', status: 'Voting Open', quorum: 75, votesFor: 60, votesAgainst: 15 },
        { id: 'RES-2024-02', title: 'Appoint New Auditor', status: 'Passed', quorum: 90, votesFor: 85, votesAgainst: 5 },
        { id: 'RES-2024-03', title: 'Amend Bylaw Section 3.A', status: 'Failed', quorum: 80, votesFor: 40, votesAgainst: 40 },
        { id: 'RES-2024-04', title: 'New Landscaping Vendor Contract', status: 'Draft', quorum: 0, votesFor: 0, votesAgainst: 0 },
    ];
    
    const [selectedResolution, setSelectedResolution] = useState(resolutions[0]);

    const statusConfig = {
        'Voting Open': { className: 'status-voting' },
        'Passed': { className: 'chip-info' },
        'Failed': { className: 'chip-alert' },
        'Draft': { className: 'text-muted-foreground' },
    } as const;

    const discussion = [
        { user: "AB", text: "I'm in favor, the budget seems well-allocated.", time: "2h ago" },
        { user: "CD", text: "I have some concerns about the maintenance allocation. Can we get more details?", time: "1h ago" },
        { user: "EF", text: "Seconding CD's comment. The increase seems steep.", time: "30m ago" },
    ];

    return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
            <style jsx global>{`
                .status-voting {
                  background-color: hsl(var(--neon-2) / 0.2);
                  color: hsl(var(--neon-2) / 0.9);
                  border-color: hsl(var(--neon-2) / 0.5);
                  animation: pulse-border 2s infinite;
                }
                @keyframes pulse-border {
                    0% { box-shadow: 0 0 0 0 hsl(var(--neon-2) / 0.4); }
                    70% { box-shadow: 0 0 0 5px hsl(var(--neon-2) / 0); }
                    100% { box-shadow: 0 0 0 0 hsl(var(--neon-2) / 0); }
                }
                .signature-pad:focus-visible {
                  outline: 2px solid #B6FF2E;
                  outline-offset: 2px;
                  box-shadow: 0 0 20px #B6FF2E;
                }
            `}</style>

            {/* Left Panel: Resolution List */}
            <div className="lg:col-span-1 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Resolutions</h1>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="vx-cta vx-focus"><Plus className="mr-2"/> New Proposal</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg bg-background border-white/10">
                            <DialogHeader>
                                <DialogTitle>Propose New Resolution</DialogTitle>
                            </DialogHeader>
                            <Textarea placeholder="Write the full text of the resolution here..." className="vx-focus min-h-[200px]" />
                            <DialogFooter>
                                <Button variant="secondary">Cancel</Button>
                                <Button className="vx-cta">Submit for Review</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="vx-card p-0 flex-1 overflow-hidden">
                    <div className="overflow-y-auto h-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Resolution</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resolutions.map(res => (
                                    <TableRow key={res.id} onClick={() => setSelectedResolution(res)} className={cn("vx-table-row cursor-pointer", selectedResolution?.id === res.id && 'data-[state=selected]:bg-muted/80')}>
                                        <TableCell>
                                            <p className="font-medium">{res.id}</p>
                                            <p className="text-sm text-muted-foreground">{res.title}</p>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", statusConfig[res.status as keyof typeof statusConfig].className)}>
                                                {res.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Right Panel: Details & Actions */}
            <div className="lg:col-span-2 vx-card p-6 flex flex-col gap-6">
                 {/* Vote Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedResolution.title}</CardTitle>
                        <CardDescription>{selectedResolution.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                             <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                                <span>Quorum: {selectedResolution.quorum}%</span>
                                <span>{selectedResolution.votesFor + selectedResolution.votesAgainst}% Voted</span>
                            </div>
                            <Progress value={selectedResolution.quorum} className="h-2 [&>div]:bg-neon-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button className="w-full bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 h-12 text-lg vx-focus">
                                <ThumbsUp className="mr-2" />Approve
                            </Button>
                            <Button className="w-full bg-destructive/20 text-destructive-foreground border border-destructive/50 hover:bg-destructive/30 h-12 text-lg vx-focus">
                                <ThumbsDown className="mr-2" />Decline
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Discussion Thread */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 -mr-2">
                    <h3 className="font-semibold">Discussion Thread</h3>
                    {discussion.map((msg, i) => (
                         <div key={i} className="flex items-start gap-3">
                            <Avatar>
                                <AvatarFallback>{msg.user}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm bg-black/30 p-2 rounded-md">{msg.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                            </div>
                        </div>
                    ))}
                     <div className="flex items-center gap-2 pt-2">
                        <Textarea placeholder="Add a comment..." rows={1} className="vx-focus" />
                        <Button className="vx-cta"><SendHorizonal /></Button>
                    </div>
                </div>

                {/* E-Signature */}
                <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-semibold flex items-center gap-2"><Signature /> E-Signature to Ratify</h3>
                    <div className="aspect-[3/1] w-full bg-black/20 rounded-md border border-border flex items-center justify-center text-muted-foreground signature-pad" tabIndex={0}>
                        <p>Sign here to ratify the passed resolution</p>
                    </div>
                     <Button className="w-full vx-cta vx-focus" disabled={selectedResolution.status !== 'Passed'}>
                        <Check className="mr-2" /> Ratify Resolution
                    </Button>
                </div>
            </div>
        </div>
    );
}
