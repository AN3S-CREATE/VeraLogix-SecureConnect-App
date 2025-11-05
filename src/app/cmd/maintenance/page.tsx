
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Hammer, Wrench } from "lucide-react";
import Image from "next/image";

export default function MaintenancePage() {
  const tickets = [
    { id: "TKT-001", title: "Leaky Faucet", unit: "Unit 101", status: "New", risk: "low" },
    { id: "TKT-002", title: "AC Not Cooling", unit: "Unit 204", status: "New", risk: "medium" },
    { id: "TKT-003", title: "Broken Light Fixture", unit: "Lobby", status: "Assigned", risk: "low" },
    { id: "TKT-004", title: "Jammed security gate", unit: "Garage P1", status: "New", risk: "high" },
  ];

  const riskConfig = {
    low: { label: "Low", className: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
    medium: { label: "Medium", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    high: { label: "High", className: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
  };

  const rulCards = [
      { asset: "HVAC-01", rul: "85%", health: "Good" },
      { asset: "PUMP-03", rul: "45%", health: "Fair" },
      { asset: "GATE-P1", rul: "15%", health: "Poor" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Maintenance Work Orders</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="relative vx-card p-0 aspect-[16/9] overflow-hidden">
                <Image 
                    src="https://images.unsplash.com/photo-1621282636114-c3c76345156a?q=80&w=1932&auto=format&fit=crop" 
                    alt="Site Map" 
                    fill 
                    className="object-cover opacity-10"
                    data-ai-hint="dark map"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">Asset Risk Heatmap Placeholder</p>
                </div>
            </div>
             <div className="vx-card p-0">
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-white/10">
                        <th className="p-4 text-left w-12"><Checkbox id="select-all" /></th>
                        <th className="p-4 text-left font-semibold">Ticket ID</th>
                        <th className="p-4 text-left font-semibold">Title</th>
                        <th className="p-4 text-left font-semibold">Unit</th>
                        <th className="p-4 text-left font-semibold">Risk</th>
                        <th className="p-4 text-left font-semibold">Status</th>
                        <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id} className="vx-table-row border-t border-white/10">
                        <td className="p-4"><Checkbox id={`select-${ticket.id}`} /></td>
                        <td className="p-4">{ticket.id}</td>
                        <td className="p-4">{ticket.title}</td>
                        <td className="p-4">{ticket.unit}</td>
                        <td className="p-4">
                            <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", riskConfig[ticket.risk as keyof typeof riskConfig].className)}>
                            {riskConfig[ticket.risk as keyof typeof riskConfig].label}
                            </span>
                        </td>
                        <td className="p-4">{ticket.status}</td>
                        <td className="p-4">
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                size="sm"
                                variant="outline"
                                className="vx-focus"
                                disabled={ticket.status === 'Assigned'}
                                >
                                <Hammer className="mr-2" />
                                Create Work Order
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-background border-white/10">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                                <DialogHeader>
                                <DialogTitle>Create Work Order for {ticket.id}</DialogTitle>
                                <DialogDescription>
                                    Assign a vendor and set an SLA for this maintenance ticket.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 my-4">
                                <div>
                                    <Label htmlFor="vendor">Assign Vendor</Label>
                                    <Select>
                                    <SelectTrigger id="vendor" className="w-full vx-focus">
                                        <SelectValue placeholder="Select a vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="plumbco">PlumbCo</SelectItem>
                                        <SelectItem value="electrix">ElectriX</SelectItem>
                                        <SelectItem value="hvac-pros">HVAC Pros</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="sla">SLA (in hours)</Label>
                                    <Input id="sla" type="number" placeholder="24" className="vx-focus" />
                                </div>
                                <div className="flex items-center space-x-2">
                                        <Checkbox id="notify" defaultChecked className="vx-focus"/>
                                        <Label htmlFor="notify" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Notify resident of assignment
                                        </Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                <Button variant="secondary">Cancel</Button>
                                <Button className="vx-cta vx-focus">Create & Assign</Button>
                                </DialogFooter>
                            </DialogContent>
                            </Dialog>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
        <aside className="lg:col-span-1 space-y-6">
            <div className="vx-card p-6">
                <h2 className="text-xl font-bold mb-4">Remaining Useful Life (RUL)</h2>
                <div className="space-y-4">
                    {rulCards.map(card => (
                        <div key={card.asset} className="p-3 border rounded-md bg-black/20">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold">{card.asset}</span>
                                <span className={cn(card.health === "Poor" && "text-destructive font-bold")}>{card.health}</span>
                            </div>
                            <p className="text-lg font-bold text-gradient-primary">{card.rul}</p>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
      </div>

     
    </div>
  );
}
