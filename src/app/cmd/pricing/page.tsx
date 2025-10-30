"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function PricingPage() {

    const experiments = [
        { id: 'EXP-001', name: 'Weekend Surge', status: 'Active', impact: '+5.2%' },
        { id: 'EXP-002', name: 'Off-Peak Discount', status: 'Paused', impact: '-1.8%' },
    ];

    const decisions = [
        { amenity: 'Pool', time: 'Sat 2:00 PM', price: 35.00, reason: 'Weekend peak hour' },
        { amenity: 'Cinema Room', time: 'Mon 10:00 AM', price: 20.00, reason: 'Off-peak baseline' },
        { amenity: 'Rooftop BBQ', time: 'Fri 7:00 PM', price: 45.00, reason: 'High demand forecast' },
    ]

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Amenity Pricing & Policies</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Guardrail Form */}
                <div className="vx-card p-6">
                    <h2 className="text-xl font-bold mb-4">Pricing Guardrails</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="base-price">Pool - Base Price ($/hr)</Label>
                            <Input id="base-price" type="number" defaultValue="25" className="vx-focus" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="peak-markup">Peak Hour Markup (%)</Label>
                            <Input id="peak-markup" type="number" defaultValue="50" className="vx-focus" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weekend-surcharge">Weekend Surcharge ($)</Label>
                            <Input id="weekend-surcharge" type="number" defaultValue="10" className="vx-focus" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="min-price">Min Price ($)</Label>
                            <Input id="min-price" type="number" defaultValue="15" className="vx-focus" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="max-price">Max Price ($)</Label>
                            <Input id="max-price" type="number" defaultValue="100" className="vx-focus" />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Switch id="dynamic-pricing" defaultChecked className="vx-focus" />
                            <Label htmlFor="dynamic-pricing" className="font-medium">Enable Dynamic Pricing</Label>
                        </div>
                    </div>
                    <div className="mt-6 text-right">
                        <Button className="vx-cta vx-focus">Save Policy</Button>
                    </div>
                </div>

                {/* Experiments Table */}
                <div className="vx-card p-0">
                     <div className="flex justify-between items-center p-6">
                        <h2 className="text-xl font-bold">Pricing Experiments</h2>
                        <Button variant="outline" className="vx-focus"><Plus className="mr-2"/> New Experiment</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Experiment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Impact</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {experiments.map(exp => (
                                    <TableRow key={exp.id} className="vx-table-row">
                                        <TableCell className="font-medium">{exp.name}</TableCell>
                                        <TableCell>
                                             <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", exp.status === 'Active' ? 'chip-info' : 'text-muted-foreground')}>
                                                {exp.status}
                                             </span>
                                        </TableCell>
                                        <TableCell className={cn(exp.impact.startsWith('+') ? 'delta-positive' : 'delta-negative')}>
                                            {exp.impact}
                                        </TableCell>
                                        <TableCell><Button size="sm" variant="outline" className="vx-focus">Manage</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Decision Feed */}
            <aside className="lg:col-span-1 vx-card p-6">
                <h2 className="text-xl font-bold mb-4">Decision Feed</h2>
                <div className="space-y-4">
                    {decisions.map((decision, i) => (
                         <div key={i} className="p-4 rounded-md border border-border bg-black/20">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{decision.amenity} @ {decision.time}</p>
                                    <p className="text-2xl font-bold text-gradient-primary">
                                        {decision.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </p>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="chip-info vx-focus">
                                            Why this price?
                                        </Button>
                                    </DialogTrigger>
                                     <DialogContent className="sm:max-w-md bg-background border-[var(--neon-2)]/50" style={{boxShadow: '0 0 40px rgba(182,255,46,.35)'}}>
                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                                        <DialogHeader>
                                            <DialogTitle>Pricing Decision Explanation</DialogTitle>
                                            <DialogDescription>
                                                This modal explains how the price of {decision.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} was determined.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-4 text-sm space-y-2">
                                            <p><span className="font-semibold text-primary">Reason:</span> {decision.reason}</p>
                                            <p>This is a placeholder for a detailed explanation of the pricing logic, including factors like demand, time of day, and active experiments.</p>
                                        </div>
                                         <DialogFooter>
                                            <DialogClose asChild>
                                                <Button className="vx-focus">Close</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                         </div>
                    ))}
                </div>
            </aside>
        </div>
    </div>
  );
}
