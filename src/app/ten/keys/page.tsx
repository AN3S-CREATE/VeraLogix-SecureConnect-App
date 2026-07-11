
"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QrCode, WifiOff, History } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthClient, useCollection } from "@/backend";

type AccessLogRow = {
  id: string;
  name?: string | null;
  location?: string | null;
  ts?: string;
  result: "granted" | "denied";
};

export default function TenKeysPage() {
  const { toast } = useToast();
  const client = useAuthClient();
  const [showQr, setShowQr] = useState(false);
  const [progress, setProgress] = useState(100);

  const { data: logsData, refresh } = useCollection<AccessLogRow>("access-logs", {
    realtimeTable: "access_logs",
  });
  const { data: doorsData } = useCollection<{ id: string; name: string }>("doors", {
    realtimeTable: "doors",
  });
  const accessHistory = (logsData || []).map((log) => ({
    door: log.location ?? "—",
    result: log.result === "granted" ? "Granted" : "Denied",
    time: log.ts ? new Date(log.ts).toLocaleString() : "Just now",
  }));

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showQr) {
      setProgress(100);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setShowQr(false);
            return 0;
          }
          return prev - 100 / 30; // 30 second timer
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQr]);

  const handleTapToOpen = async (door_id: string) => {
    console.log("sc.res.access.open_initiated", { door_id });
    try {
      const door =
        doorsData?.find((d) => d.id === door_id) ??
        doorsData?.find((d) => d.name.toLowerCase().includes("main")) ??
        doorsData?.[0];
      if (!door) {
        toast({
          title: "No doors available",
          description: "Seed the backend or assign a site role first.",
          variant: "destructive",
        });
        return;
      }
      const { accessLog } = await client.unlockDoor(door.id, "granted");
      await refresh();
      console.log("sc.res.access.open_result", { door_id: door.id, accessLog });
      toast({
        title: "Success",
        description: "Gate opened successfully. Entry recorded in history.",
      });
    } catch (e) {
      console.error("Error unlocking door:", e);
      toast({
        title: "Unlock failed",
        description: e instanceof Error ? e.message : "Unable to open door",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="keys" className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Digital Keys</h1>
        <TabsList className="bg-black/20">
            <TabsTrigger value="keys" className="vx-tabs-trigger">Keys</TabsTrigger>
            <TabsTrigger value="history" className="vx-tabs-trigger">History</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="keys" className="mt-0 space-y-8" id="tap">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="vx-card p-6 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Main Entrance</h2>
                <span className="chip-info px-2 py-1 text-xs rounded-full">In Range</span>
                </div>
                <p className="text-muted-foreground mt-1">Lobby and package room access</p>
            </div>
            <Button className="w-full mt-6 vx-cta tap-button h-20 text-xl" onClick={() => handleTapToOpen('main-entrance')}>
                Tap to Open
            </Button>
            </div>
            <div className="vx-card p-6 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Garage Door</h2>
                <span className="chip-alert px-2 py-1 text-xs rounded-full flex items-center gap-1"><WifiOff className="w-3 h-3" /> Out of Range</span>
                </div>
                <p className="text-muted-foreground mt-1">Resident parking area</p>
            </div>
            <Button className="w-full mt-6 vx-cta tap-button h-20 text-xl" disabled>
                Tap to Open
            </Button>
            </div>
        </div>
      
        <div>
            <h2 className="text-xl font-semibold mb-4">Dynamic QR Code</h2>
            <Button variant="outline" className="vx-focus" onClick={() => setShowQr(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            Show QR for Guest Access
            </Button>
        </div>
      </TabsContent>

      <TabsContent value="history" className="mt-0">
        <div className="vx-card p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Door</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accessHistory.map((entry, index) => (
                            <TableRow key={index} className="vx-table-row">
                                <TableCell className="font-medium">{entry.door}</TableCell>
                                <TableCell>{entry.result}</TableCell>
                                <TableCell className="text-right">{entry.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
      </TabsContent>

      {showQr && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-in fade-in-0"
          onClick={() => setShowQr(false)}
        >
          <div className="vx-card p-8 relative" onClick={(e) => e.stopPropagation()}>
             <div 
              className="absolute inset-0 border-2 border-neon-1 rounded-[20px] pointer-events-none animate-pulse-glow"
             ></div>

            <div className="flex flex-col items-center gap-4">
                <QrCode className="w-64 h-64 text-foreground"/>
                <div className="w-full text-center">
                    <p className="qr-timer-chip inline-block px-2 py-1 text-xs">Expires in {Math.round(progress * 30 / 100)}s</p>
                    <Progress value={progress} className="mt-2 h-2 [&>div]:bg-neon-1" />
                </div>
            </div>
          </div>
        </div>
      )}
    </Tabs>
  );
}
