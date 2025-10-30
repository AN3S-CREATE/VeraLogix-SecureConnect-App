"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Barcode, Calendar, CheckSquare, GripVertical, ImagePlus, ListTodo, Plus, Signature, Trash, Users, Download } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function VenWorkOrdersPage() {
  const workOrders = [
    { id: "WO-001", title: "HVAC maintenance for rooftop units", priority: "High", status: "Scheduled", site: "The Grand Regency" },
    { id: "WO-002", title: "Leaky Faucet in Unit 101", priority: "Medium", status: "New", site: "The Grand Regency" },
    { id: "WO-003", title: "Jammed security gate", priority: "High", status: "In Progress", site: "Oceanview Towers" },
  ];

  const [selectedWorkOrder, setSelectedWorkOrder] = useState(workOrders[0]);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const priorityConfig = {
    High: { label: "High", className: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
    Medium: { label: "Medium", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    Low: { label: "Low", className: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
  };

  const evidencePhotos = [
      "https://picsum.photos/seed/hvac1/300/200",
      "https://picsum.photos/seed/hvac2/300/200",
      "https://picsum.photos/seed/hvac3/300/200",
  ]

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

      {/* Job Plan & Handover */}
      <div className="lg:col-span-2 vx-card p-0 flex flex-col">
        {selectedWorkOrder ? (
          <Tabs defaultValue="plan" className="flex-1 flex flex-col">
            <div className="p-6">
                <h2 className="text-xl font-bold">Work Order: {selectedWorkOrder.id}</h2>
                <p className="text-muted-foreground text-sm">{selectedWorkOrder.title}</p>
                <TabsList className="mt-4 grid w-full grid-cols-2 bg-black/20">
                    <TabsTrigger value="plan" className="vx-tabs-trigger">Job Plan & Schedule</TabsTrigger>
                    <TabsTrigger value="handover" className="vx-tabs-trigger">Evidence & Handover</TabsTrigger>
                </TabsList>
            </div>
            
            {/* Job Plan Content */}
            <TabsContent value="plan" className="flex-1 flex flex-col gap-6 px-6 pb-6 mt-0">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                {/* Left Panel: Steps & Checklist */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><ListTodo /> Steps</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 group"><GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" /><Input defaultValue="Isolate power to rooftop units" className="vx-focus" /><Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive"><Trash /></Button></div>
                      <div className="flex items-center gap-2 group"><GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" /><Input defaultValue="Replace compressor on Unit #3" className="vx-focus" /><Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive"><Trash /></Button></div>
                      <Button variant="outline" size="sm" className="w-full vx-focus"><Plus /> Add Step</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Checkbox /> Pre-work Checklist</h3>
                    <div className="space-y-2"><div className="flex items-center gap-2"><Checkbox id="check-1" className="vx-focus" /><Label htmlFor="check-1">Lockout/Tagout confirmed</Label></div><div className="flex items-center gap-2"><Checkbox id="check-2" className="vx-focus" /><Label htmlFor="check-2">Hot work permit obtained</Label></div></div>
                  </div>
                </div>

                {/* Right Panel: Parts & Crew */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><h3 className="font-semibold">Parts Required</h3><Sheet><SheetTrigger asChild><Button size="sm" variant="outline" className="vx-focus"><Barcode className="mr-2" /> Scan Part</Button></SheetTrigger><SheetContent className="bg-background border-l border-white/10"><div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div><SheetHeader><SheetTitle>Scan Barcode</SheetTitle><SheetDescription>Use your device camera to scan a part&apos;s barcode to add it to the list.</SheetDescription></SheetHeader><div className="aspect-square bg-black/50 rounded-md my-6 flex items-center justify-center"><p className="text-muted-foreground">Camera feed</p></div></SheetContent></Sheet></div>
                    <div className="p-4 rounded-md border bg-black/20 text-sm text-muted-foreground"><p>Compressor Model #ABC-123</p><p>Filter Kit #XYZ-456</p></div>
                  </div>
                  <div className="space-y-2"><h3 className="font-semibold flex items-center gap-2"><Users /> Crew</h3><Select><SelectTrigger className="w-full vx-focus"><SelectValue placeholder="Assign crew members" /></SelectTrigger><SelectContent><SelectItem value="team_a">Team A (2 members)</SelectItem><SelectItem value="team_b">Team B (4 members)</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><h3 className="font-semibold flex items-center gap-2"><Calendar /> Schedule</h3><Input type="datetime-local" className="vx-focus" /><p className="text-xs text-muted-foreground">No scheduling conflicts detected.</p></div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border"><Button variant="secondary">Cancel</Button><Button className="vx-cta vx-focus">Save Plan & Schedule</Button></div>
            </TabsContent>
            
            {/* Handover Content */}
            <TabsContent value="handover" className="flex-1 flex flex-col gap-6 px-6 pb-6 mt-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    {/* Evidence Gallery */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Evidence Gallery</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {evidencePhotos.map(src => (
                                <div key={src} className={cn("relative rounded-md overflow-hidden border-2", selectedMedia === src ? "border-neon-1" : "border-transparent")} onClick={() => setSelectedMedia(src)}>
                                    <Image src={src} alt="Evidence photo" width={300} height={200} className="object-cover cursor-pointer" data-ai-hint="construction site" />
                                </div>
                            ))}
                             <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/50 px-6 py-10 bg-black/20">
                                <div className="text-center">
                                    <ImagePlus className="mx-auto h-12 w-12 text-gray-500" aria-hidden="true" />
                                    <p className="mt-2 text-sm text-gray-400">Upload geo-stamped media</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* QA Checklist & Sign-off */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <h3 className="font-semibold flex items-center gap-2"><CheckSquare /> Handover QA</h3>
                             <div className="space-y-2">
                                <div className="flex items-center gap-2"><Checkbox id="qa-1" className="vx-focus" /><Label htmlFor="qa-1">Work area clean and tidy</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="qa-2" className="vx-focus" /><Label htmlFor="qa-2">All tools and materials removed</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="qa-3" className="vx-focus" /><Label htmlFor="qa-3">Asset tested and operational</Label></div>
                            </div>
                        </div>
                         <div className="space-y-2">
                             <h3 className="font-semibold flex items-center gap-2"><Signature /> Client Sign-off</h3>
                             <div className="aspect-video w-full bg-black/20 rounded-md border border-border flex items-center justify-center text-muted-foreground vx-focus" tabIndex={0} style={{boxShadow: '0 0 0 0px var(--neon-1)'}}>
                                <p>Signature Pad</p>
                            </div>
                         </div>
                    </div>
                </div>
                 <div className="flex justify-between items-center gap-2 pt-4 border-t border-border">
                    <Button variant="outline" className="vx-focus"><Download className="mr-2" /> Export Handover PDF</Button>
                    <div className="flex gap-2">
                        <Button variant="secondary">Save as Draft</Button>
                        <Button className="vx-cta vx-focus">Complete & Submit</Button>
                    </div>
                </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a work order to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}
