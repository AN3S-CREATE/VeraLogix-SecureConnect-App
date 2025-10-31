
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TenMaintenancePage() {
  const tickets = [
    { id: "TKT-001", title: "Leaky Faucet", status: "In Progress", sla: 75 },
    { id: "TKT-002", title: "AC Not Cooling", status: "Resolved", sla: 100 },
    { id: "TKT-003", title: "Broken Light Fixture", status: "New", sla: 10 },
    { id: "TKT-004", title: "Jammed security gate", status: "In Progress", sla: 90 },
  ];

  const handleTicketCreate = () => {
    console.log('sc.res.maint.ticket_created');
  };

  return (
    <div className="space-y-8" id="new">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="vx-cta vx-focus rounded-full w-14 h-14"><Plus className="w-6 h-6" /></Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background border-white/10">
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
            <DialogHeader>
              <DialogTitle>New Maintenance Ticket</DialogTitle>
              <DialogDescription>Describe your issue and attach any relevant photos or videos.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g., Leaky Faucet in Kitchen" className="vx-focus" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Please provide as much detail as possible." className="vx-focus" />
              </div>
              <div>
                <Label htmlFor="media-upload">Attachments</Label>
                 <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/50 px-6 py-10 bg-black/20">
                    <div className="text-center">
                        <Paperclip className="mx-auto h-12 w-12 text-gray-500" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-400">
                            <label htmlFor="media-upload" className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background hover:text-primary/80">
                                <span>Upload a file</span>
                                <Input id="media-upload" name="media-upload" type="file" className="sr-only" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-500">PNG, JPG, MP4 up to 10MB</p>
                    </div>
                </div>
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button className="vx-cta" onClick={handleTicketCreate}>Submit Ticket</Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="vx-card p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold">{ticket.title}</p>
              <p className={`text-sm ${ticket.status === 'New' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{ticket.status}</p>
            </div>
            <div className="w-full sm:w-1/3 text-left sm:text-right">
              <div className="flex items-center gap-2 sm:justify-end">
                <p className="text-xs text-muted-foreground">SLA</p>
                <Progress value={ticket.sla} className={cn(
                    "h-2 w-24",
                    ticket.sla < 85 ? "[&>div]:bg-neon-2" : "[&>div]:bg-neon-3"
                  )} />
                 <span className={cn(
                    "text-xs font-mono",
                    ticket.sla < 85 ? "text-neon-2" : "text-neon-3"
                  )}>{ticket.sla}%</span>
              </div>
               <p className="text-xs text-muted-foreground mt-1">Chat about this issue</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
