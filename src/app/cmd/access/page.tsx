
"use client";

import { DoorCard } from "@/components/agent/door-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { UserPlus, ShieldAlert, Timer, Map, List, KeyRound, RadioTower } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useFirestore } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useMemoFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";

export default function AccessControlPage() {
  const firestore = useFirestore();
  const doorsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'doors') : null),
    [firestore]
  );
  const { data: doorsData, isLoading: isLoadingDoors } = useCollection<{ id: string; name: string; state: "locked" | "unlocked"; health: "healthy" | "degraded" | "offline" }>(doorsQuery);

  const doors = doorsData || [];

  const logsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'accessLogs') : null),
    [firestore]
  );
  const { data: logsData } = useCollection<{ id: string; name: string; location: string; time: string; status: string; }>(logsQuery);
  const arrivalFeed = logsData || [];

  const handleOverride = () => {
      console.log('sc.agent.access.override_initiated');
      // Simulate API call
      setTimeout(() => {
          console.log('sc.agent.access.override_completed');
      }, 1000);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Access & Perimeter Control</h1>
       <Tabs defaultValue="monitor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/20 h-12">
                <TabsTrigger value="monitor" className="vx-tabs-trigger h-full flex items-center gap-2"><RadioTower /> Live Monitor</TabsTrigger>
                <TabsTrigger value="control" className="vx-tabs-trigger h-full flex items-center gap-2"><KeyRound /> Door Control</TabsTrigger>
            </TabsList>
            <TabsContent value="monitor" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                         <div className="relative vx-card p-0 aspect-[16/10] overflow-hidden">
                             <Image 
                                src="https://images.unsplash.com/photo-1621282636114-c3c76345156a?q=80&w=1932&auto=format&fit=crop" 
                                alt="Site Map" 
                                fill 
                                className="object-cover opacity-20"
                                data-ai-hint="dark map"
                             />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <p className="text-muted-foreground">Live Arrival Heatmap</p>
                             </div>
                             {/* Example of a glowing active zone outline */}
                             <div 
                                className="absolute" 
                                style={{
                                    top: '45%', left: '30%', width: '25%', height: '20%', 
                                    border: '2px solid var(--neon-1)', 
                                    borderRadius: '10px',
                                    boxShadow: '0 0 15px var(--neon-1), inset 0 0 15px var(--neon-1)'
                                }}
                            ></div>
                         </div>
                    </div>
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="vx-card p-0 h-[400px] flex flex-col">
                            <h2 className="text-xl font-bold p-6 pb-2">Live Arrivals</h2>
                            <div className="overflow-y-auto px-6 flex-1">
                                {arrivalFeed.map(item => (
                                    <div key={item.id} className="py-3 border-b border-white/10 last:border-0 text-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className={cn(item.status === 'granted' ? 'text-green-400' : 'text-red-400')}>{item.status}</p>
                                        </div>
                                        <p className="text-muted-foreground">{item.location} - {item.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="vx-card p-6">
                            <h2 className="text-xl font-bold mb-4">Temporary Code</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="temp-code-reason">Reason</Label>
                                    <Input id="temp-code-reason" placeholder="e.g., Emergency Access" className="vx-focus" />
                                </div>
                                <div>
                                    <Label htmlFor="temp-code-duration">Duration (minutes)</Label>
                                    <Input id="temp-code-duration" type="number" placeholder="15" className="vx-focus" />
                                </div>
                                <Button className="w-full vx-cta vx-focus">Generate Code</Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </TabsContent>
            <TabsContent value="control" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
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
                             <DialogContent className="sm:max-w-md bg-background border-[var(--neon-3)]/50" style={{boxShadow: '0 0 40px rgba(212,255,0,.35)'}}>
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-3)] to-transparent"></div>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2"><ShieldAlert className="text-[var(--neon-3)]" />Policy Override Request</DialogTitle>
                                    <DialogDescription>
                                        Requesting a temporary override requires multi-factor authentication and is fully audited.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 my-4 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-7xl font-black text-white/5 -rotate-12 select-none">
                                            HASH: 4B1D...A9F3
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="override-reason">Reason for Override</Label>
                                        <Input id="override-reason" placeholder="e.g., Emergency maintenance access" className="vx-focus" />
                                    </div>
                                    <div>
                                        <Label htmlFor="override-duration">Duration (minutes)</Label>
                                        <div className="relative">
                                            <Timer className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="override-duration" type="number" placeholder="30" className="vx-focus pl-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="mfa-code">Authentication Code</Label>
                                        <Input id="mfa-code" placeholder="Enter code from your authenticator app" className="vx-focus" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <Button variant="destructive" className="vx-focus" onClick={handleOverride}>Confirm & Override</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </aside>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
