
"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { QrCode, Share2 } from "lucide-react";
import { useState } from "react";

export default function TenPassesPage() {
  const [passes, setPasses] = useState([
    { id: "PASS-001", name: "John Doe", status: "Active", startDate: "2024-08-01T09:00", endDate: "2024-08-01T17:00", areas: ["Lobby"], vehicle: "N/A" },
    { id: "PASS-002", name: "Jane Smith", status: "Upcoming", startDate: "2024-08-05T10:00", endDate: "2024-08-05T18:00", areas: ["Lobby", "Pool"], vehicle: "CA-12345" },
    { id: "PASS-003", name: "Peter Jones", status: "Revoked", startDate: "2024-07-28T12:00", endDate: "2024-07-28T16:00", areas: ["Lobby"], vehicle: "N/A" },
  ]);

  const [selectedPass, setSelectedPass] = useState(passes[0]);

  const statusConfig = {
    Active: { className: "status-active" },
    Upcoming: { className: "status-active" },
    Revoked: { className: "chip-alert" },
  };

  const handleRevoke = (passId: string) => {
    setPasses(passes.map(p => p.id === passId ? { ...p, status: 'Revoked' } : p));
  }

  return (
    <div className="space-y-8">
       <style jsx global>{`
        .status-active {
          background-color: hsl(var(--neon-2) / 0.2);
          color: hsl(var(--neon-2) / 0.9);
          border-color: hsl(var(--neon-2) / 0.5);
        }
      `}</style>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Visitor Passes</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="vx-cta vx-focus">New Pass</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl bg-background border-white/10">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
            <DialogHeader>
              <DialogTitle>Create New Visitor Pass</DialogTitle>
              <DialogDescription>
                Fill in the details to issue a new pass. The QR code will be generated upon creation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Visitor Name</Label>
                  <Input id="name" placeholder="John Doe" className="vx-focus" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start-date">Valid From</Label>
                        <Input id="start-date" type="datetime-local" className="vx-focus" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="end-date">Valid Until</Label>
                        <Input id="end-date" type="datetime-local" className="vx-focus" />
                    </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vehicle-plate">Vehicle Plate (Optional)</Label>
                  <Input id="vehicle-plate" placeholder="CA-12345" className="vx-focus" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allowed Areas</Label>
                <div className="p-4 border rounded-md bg-black/20 space-y-2">
                  <div className="flex items-center gap-2"><Checkbox id="area-lobby" defaultChecked className="vx-focus" /><Label htmlFor="area-lobby">Main Lobby</Label></div>
                  <div className="flex items-center gap-2"><Checkbox id="area-parking" className="vx-focus" /><Label htmlFor="area-parking">Visitor Parking</Label></div>
                  <div className="flex items-center gap-2"><Checkbox id="area-pool" className="vx-focus" /><Label htmlFor="area-pool">Pool Area</Label></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary">Cancel</Button>
              <Button type="submit" className="vx-cta">Create & Share</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="vx-card p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left w-12"><Checkbox id="select-all" /></th>
                <th className="p-4 text-left font-semibold">Visitor</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Vehicle</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passes.map((item) => (
                <tr key={item.id} className="vx-table-row border-t border-white/10">
                  <td className="p-4"><Checkbox id={`select-${item.id}`} /></td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">
                    <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", statusConfig[item.status as keyof typeof statusConfig]?.className)}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">{item.vehicle}</td>
                  <td className="p-4 space-x-2">
                     <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="vx-focus" disabled={item.status === 'Revoked'} onClick={() => setSelectedPass(item)}>
                                Share
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-screen bg-black/90 border-0 text-white flex flex-col items-center justify-center">
                            <div className="w-full max-w-sm text-center">
                                <h2 className="text-2xl font-bold mb-2">Visitor Pass: {selectedPass?.name}</h2>
                                <p className="text-muted-foreground mb-6">Scan this QR code at the entrance.</p>
                                <div className="bg-white p-4 rounded-lg inline-block">
                                    <QrCode className="w-64 h-64 text-black"/>
                                </div>
                                <Button className="w-full mt-8 vx-cta vx-focus text-lg"><Share2 className="mr-2"/> Share Link</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                     <Button variant="destructive" size="sm" className="vx-focus" onClick={() => handleRevoke(item.id)} disabled={item.status === 'Revoked'}>Revoke</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
