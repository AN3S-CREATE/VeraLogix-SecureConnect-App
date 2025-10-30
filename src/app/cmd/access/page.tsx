"use client";

import { DoorCard } from "@/components/agent/door-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, ShieldAlert } from "lucide-react";

export default function AccessControlPage() {
  const doors = [
    { id: "D-101", name: "Main Lobby Entrance", state: "locked", health: "healthy" },
    { id: "D-102", name: "Parking Garage P1", state: "unlocked", health: "healthy" },
    { id: "D-201", name: "Floor 2 - East Wing", state: "locked", health: "degraded" },
    { id: "D-202", name: "Floor 2 - West Wing", state: "locked", health: "healthy" },
    { id: "D-300", name: "Rooftop Access", state: "locked", health: "offline" },
    { id: "SRV-01", name: "Server Room", state: "locked", health: "healthy" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-foreground mb-6">Access & Perimeter Control</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doors.map((door) => (
            <DoorCard key={door.id} {...door} />
          ))}
        </div>
      </div>
      <aside className="lg:col-span-1 space-y-6">
        <div className="vx-card p-6">
            <h2 className="text-xl font-bold mb-4">Visitor Management</h2>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full vx-cta vx-focus"><UserPlus className="mr-2" /> Issue Visitor Pass</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-background border-white/10">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                    <DialogHeader>
                        <DialogTitle>Issue New Visitor Pass</DialogTitle>
                        <DialogDescription>Create a temporary pass for a visitor.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="visitor-name">Visitor Name</Label>
                            <Input id="visitor-name" placeholder="John Smith" className="vx-focus" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="valid-until">Valid Until</Label>
                            <Input id="valid-until" type="datetime-local" className="vx-focus" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary">Cancel</Button>
                        <Button className="vx-cta">Generate & Share Pass</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <div className="vx-card p-6">
            <h2 className="text-xl font-bold mb-4">Policy Overrides</h2>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-destructive/50 text-destructive-foreground hover:bg-destructive/20 hover:text-destructive-foreground vx-focus"><ShieldAlert className="mr-2" /> Request Override</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-background border-white/10">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-3)] to-transparent"></div>
                    <DialogHeader>
                        <DialogTitle>Policy Override Request</DialogTitle>
                        <DialogDescription>
                            Requesting a temporary override requires multi-factor authentication and is fully audited.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                         <div>
                            <Label htmlFor="override-reason">Reason for Override</Label>
                            <Input id="override-reason" placeholder="e.g., Emergency maintenance access" className="vx-focus" />
                        </div>
                        <div>
                            <Label htmlFor="mfa-code">Authentication Code</Label>
                            <Input id="mfa-code" placeholder="Enter code from your authenticator app" className="vx-focus" />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="secondary">Cancel</Button>
                        <Button variant="destructive" className="vx-focus">Confirm & Override</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </aside>
    </div>
  );
}
