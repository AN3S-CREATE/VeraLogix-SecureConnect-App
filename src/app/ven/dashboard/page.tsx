
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarPlus, CheckCircle, Clock, Plus, QrCode, Share2, UserPlus, XCircle } from "lucide-react";
import Link from "next/link";

export default function VenDashboardPage() {

    const accessWindows = [
        { id: 'AW-001', status: 'approved', start: '2024-08-10 09:00', end: '2024-08-10 17:00', notes: 'HVAC maintenance for rooftop units.' },
        { id: 'AW-002', status: 'pending', start: '2024-08-12 10:00', end: '2024-08-12 14:00', notes: 'Window cleaning for south facade.' },
        { id: 'AW-003', status: 'rejected', start: '2024-08-09 08:00', end: '2024-08-09 12:00', notes: 'Landscaping services.' },
    ];

    const statusConfig = {
        approved: { label: 'Approved', icon: <CheckCircle />, className: 'chip-info' },
        pending: { label: 'Pending', icon: <Clock />, className: 'text-yellow-400' },
        rejected: { label: 'Rejected', icon: <XCircle />, className: 'chip-alert' },
    } as const;

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Vendor Dashboard</h1>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="vx-cta vx-focus"><CalendarPlus className="mr-2" /> Request Access Window</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-background border-white/10">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                    <DialogHeader>
                        <DialogTitle>New Access Request</DialogTitle>
                        <DialogDescription>
                            Request a time window to access the property for work.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                         <div>
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input id="start-time" type="datetime-local" className="vx-focus" />
                        </div>
                        <div>
                            <Label htmlFor="end-time">End Time</Label>
                            <Input id="end-time" type="datetime-local" className="vx-focus" />
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason for Access</Label>
                            <Textarea id="reason" placeholder="e.g., Scheduled HVAC maintenance" className="vx-focus" />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="secondary">Cancel</Button>
                        <Button className="vx-cta vx-focus">Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card">
            <p className="font-semibold">Your safety induction is pending.</p>
            <p className="text-sm text-muted-foreground">Complete your induction to be able to request permits to work.</p>
            <Button asChild size="sm" className="mt-2 vx-cta vx-focus">
                <Link href="/ven/safety">Start Induction</Link>
            </Button>
        </div>
        
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Access Windows</h2>
            {accessWindows.map(window => {
                const { label, icon, className } = statusConfig[window.status as keyof typeof statusConfig];
                return (
                    <div key={window.id} className={cn("vx-card p-4", window.status === 'approved' && "border-neon-1/50 shadow-[0_0_12px_rgba(182,255,46,.25)]")}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn("px-2 py-1 text-xs rounded-full flex items-center gap-1", className)}>
                                        {icon} {label}
                                    </span>
                                    <p className="font-semibold text-foreground">{window.id}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{window.notes}</p>
                                <p className="text-sm text-muted-foreground mt-1">{`From: ${window.start} To: ${window.end}`}</p>
                            </div>
                            <div className="flex gap-2 mt-4 sm:mt-0">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="vx-focus"><UserPlus /> Issue Crew Pass</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-xs bg-black">
                                        <div className="absolute inset-0 bg-black/80" />
                                        <div className="relative z-10 flex flex-col items-center gap-4 p-4 text-center">
                                            <h2 className="text-lg font-bold">Crew Pass: John Smith</h2>
                                            <QrCode className="w-48 h-48 text-white"/>
                                            <p className="text-sm text-muted-foreground">Valid: {window.start} - {window.end}</p>
                                            <Button className="w-full vx-cta vx-focus"><Share2 /> Share Pass</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
}
