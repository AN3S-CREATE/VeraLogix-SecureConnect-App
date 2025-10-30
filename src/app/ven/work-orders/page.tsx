"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Barcode, Calendar, GripVertical, ListTodo, Plus, Trash, Users } from "lucide-react";
import { useState } from "react";

export default function VenWorkOrdersPage() {
  const workOrders = [
    { id: "WO-001", title: "HVAC maintenance for rooftop units", priority: "High", status: "Scheduled", site: "The Grand Regency" },
    { id: "WO-002", title: "Leaky Faucet in Unit 101", priority: "Medium", status: "New", site: "The Grand Regency" },
    { id: "WO-003", title: "Jammed security gate", priority: "High", status: "In Progress", site: "Oceanview Towers" },
  ];

  const [selectedWorkOrder, setSelectedWorkOrder] = useState(workOrders[0]);

  const priorityConfig = {
    High: { label: "High", className: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
    Medium: { label: "Medium", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    Low: { label: "Low", className: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
      {/* Work Orders List */}
      <div className="lg:col-span-1 flex flex-col">
        <h1 className="text-3xl font-bold text-foreground mb-6">Work Orders</h1>
        <ScrollArea className="flex-1 -mr-4 pr-4">
          <div className="space-y-4">
            {workOrders.map((wo) => (
              <div
                key={wo.id}
                className={cn("vx-card p-4 cursor-pointer", selectedWorkOrder?.id === wo.id && "border-neon-1/50 shadow-[0_0_12px_rgba(182,255,46,.25)]")}
                onClick={() => setSelectedWorkOrder(wo)}
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-foreground">{wo.id}</p>
                  <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", priorityConfig[wo.priority as keyof typeof priorityConfig].className)}>
                    {priorityConfig[wo.priority as keyof typeof priorityConfig].label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{wo.title}</p>
                <p className="text-xs text-muted-foreground mt-2">{wo.status} @ {wo.site}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Job Plan & Schedule */}
      <div className="lg:col-span-2 vx-card p-6 flex flex-col gap-6">
        {selectedWorkOrder ? (
          <>
            <div>
              <h2 className="text-xl font-bold">Job Plan: {selectedWorkOrder.id}</h2>
              <p className="text-muted-foreground text-sm">{selectedWorkOrder.title}</p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Panel: Steps & Checklist */}
              <div className="space-y-6">
                {/* Steps */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2"><ListTodo /> Steps</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 group">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                      <Input defaultValue="Isolate power to rooftop units" className="vx-focus" />
                      <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive"><Trash /></Button>
                    </div>
                    <div className="flex items-center gap-2 group">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                      <Input defaultValue="Replace compressor on Unit #3" className="vx-focus" />
                      <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive"><Trash /></Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full vx-focus"><Plus /> Add Step</Button>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2"><Checkbox /> Checklist</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox id="check-1" className="vx-focus"/>
                        <Label htmlFor="check-1">Lockout/Tagout confirmed</Label>
                    </div>
                     <div className="flex items-center gap-2">
                        <Checkbox id="check-2" className="vx-focus"/>
                        <Label htmlFor="check-2">Hot work permit obtained</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Parts & Crew */}
              <div className="space-y-6">
                {/* Parts */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Parts Required</h3>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button size="sm" variant="outline" className="vx-focus"><Barcode className="mr-2" /> Scan Part</Button>
                      </SheetTrigger>
                       <SheetContent className="bg-background border-l border-white/10">
                         <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                          <SheetHeader>
                              <SheetTitle>Scan Barcode</SheetTitle>
                              <SheetDescription>
                                  Use your device camera to scan a part&apos;s barcode to add it to the list.
                              </SheetDescription>
                          </SheetHeader>
                          <div className="aspect-square bg-black/50 rounded-md my-6 flex items-center justify-center">
                            <p className="text-muted-foreground">Camera feed</p>
                          </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className="p-4 rounded-md border bg-black/20 text-sm text-muted-foreground">
                    <p>Compressor Model #ABC-123</p>
                    <p>Filter Kit #XYZ-456</p>
                  </div>
                </div>

                {/* Crew & Schedule */}
                <div className="space-y-2">
                   <h3 className="font-semibold flex items-center gap-2"><Users /> Crew</h3>
                   <Select>
                      <SelectTrigger className="w-full vx-focus">
                          <SelectValue placeholder="Assign crew members" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="team_a">Team A (2 members)</SelectItem>
                          <SelectItem value="team_b">Team B (4 members)</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <h3 className="font-semibold flex items-center gap-2"><Calendar /> Schedule</h3>
                   <Input type="datetime-local" className="vx-focus" />
                   <p className="text-xs text-muted-foreground">No scheduling conflicts detected.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="secondary">Cancel</Button>
                <Button className="vx-cta vx-focus">Save Plan & Schedule</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a work order to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}
