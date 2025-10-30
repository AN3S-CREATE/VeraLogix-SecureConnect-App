"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Paperclip } from "lucide-react";

export default function TenMaintenancePage() {
  const tickets = [
    { id: "TKT-001", title: "Leaky Faucet", status: "In Progress", sla: 75 },
    { id: "TKT-002", title: "AC Not Cooling", status: "Resolved", sla: 100 },
    { id: "TKT-003", title: "Broken Light Fixture", status: "New", sla: 10 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="vx-cta vx-focus rounded-full w-14 h-14"><Plus className="w-6 h-6" /></Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-white/10">
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
            <DialogHeader>
              <DialogTitle>New Maintenance Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Leaky Faucet" className="vx-focus" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the issue in detail." className="vx-focus" />
              </div>
              <div>
                <Label htmlFor="media">Attachments</Label>
                <div className="border border-dashed border-border rounded-md p-6 text-center mt-1">
                  <Paperclip className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Drag & drop files or click to browse</p>
                  <Input id="media" type="file" className="sr-only" />
                </div>
              </div>
            </div>
            <DialogFooter>
                <Button variant="secondary">Cancel</Button>
                <Button className="vx-cta">Submit Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="vx-card p-4 flex justify-between items-center">
            <div>
              <p className="font-bold">{ticket.title}</p>
              <p className={`text-sm ${ticket.status === 'New' ? 'chip-info' : 'text-muted-foreground'}`}>{ticket.status}</p>
            </div>
            <div className="w-1/3 text-right">
              <div className="flex items-center gap-2 justify-end">
                <p className="text-xs text-muted-foreground">SLA</p>
                <Progress value={ticket.sla} className={`h-2 w-24 [&>div]:bg-neon-2 ${ticket.sla > 85 ? '[&>div]:bg-neon-3' : ''}`} />
              </div>
               <p className="text-xs text-muted-foreground mt-1">Chat about this issue</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}