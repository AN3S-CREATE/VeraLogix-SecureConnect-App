
"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { QrCode, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthClient, useBackend, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import type { Pass } from "@/lib/entities";

type PassRow = Pass & { siteId: string };

type DisplayPass = {
  id: string;
  name: string;
  status: "Active" | "Upcoming" | "Revoked";
  code: string;
  areas: string[];
};

const AREA_OPTIONS = [
  { id: "lobby", label: "Main Lobby" },
  { id: "parking", label: "Visitor Parking" },
  { id: "pool", label: "Pool Area" },
] as const;

function displayNameFromCode(code: string) {
  const match = code.match(/^VISIT-(.+)-\d+$/i);
  if (match) return match[1].replace(/-/g, " ");
  return code;
}

function passStatus(row: PassRow): DisplayPass["status"] {
  if (row.status === "expired") return "Revoked";
  const now = Date.now();
  const start = new Date(row.start).getTime();
  const end = new Date(row.end).getTime();
  if (start > now) return "Upcoming";
  if (end < now) return "Revoked";
  return "Active";
}

export default function TenPassesPage() {
  const { user } = useBackend();
  const client = useAuthClient();
  const { toast } = useToast();
  const { data, isLoading, refresh } = useCollection<PassRow>("passes");

  const [selectedPass, setSelectedPass] = useState<DisplayPass | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [areas, setAreas] = useState<string[]>(["lobby"]);
  const [unitId, setUnitId] = useState<string | null>(null);

  const siteId = user?.siteIds[0];

  useEffect(() => {
    if (!siteId) return;
    client
      .list<{ id: string }>("units", { siteId, limit: 1 })
      .then((res) => setUnitId(res.data[0]?.id ?? null))
      .catch(() => setUnitId(null));
  }, [client, siteId]);

  const passes = useMemo<DisplayPass[]>(
    () =>
      (data ?? []).map((row) => ({
        id: row.id,
        name: displayNameFromCode(row.code),
        status: passStatus(row),
        code: row.code,
        areas: row.areas,
      })),
    [data],
  );

  const statusConfig = {
    Active: { className: "status-active" },
    Upcoming: { className: "status-active" },
    Revoked: { className: "chip-alert" },
  };

  const handleRevoke = async (passId: string) => {
    try {
      await client.update("passes", passId, { status: "expired" });
      await refresh();
      toast({ title: "Pass revoked", description: "Visitor pass is no longer valid." });
    } catch (err) {
      toast({
        title: "Revoke failed",
        description: err instanceof Error ? err.message : "Unable to revoke pass",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    if (!siteId || !unitId) {
      toast({
        title: "Missing site data",
        description: "Run db:seed or ensure your account has a unit assignment.",
        variant: "destructive",
      });
      return;
    }
    if (!visitorName.trim() || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Visitor name and validity window are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const slug = visitorName.trim().replace(/\s+/g, "-");
      const code = `VISIT-${slug}-${Date.now()}`;
      await client.create("passes", {
        siteId,
        unitId,
        code,
        areas,
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString(),
        status: "active",
      });
      await refresh();
      setDialogOpen(false);
      setVisitorName("");
      setStartDate("");
      setEndDate("");
      setAreas(["lobby"]);
      toast({ title: "Pass created", description: `Code ${code} is ready to share.` });
    } catch (err) {
      toast({
        title: "Create failed",
        description: err instanceof Error ? err.message : "Unable to create pass",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArea = (area: string, checked: boolean) => {
    setAreas((prev) => (checked ? [...prev, area] : prev.filter((a) => a !== area)));
  };

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="vx-focus"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                  />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start-date">Valid From</Label>
                        <Input
                          id="start-date"
                          type="datetime-local"
                          className="vx-focus"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="end-date">Valid Until</Label>
                        <Input
                          id="end-date"
                          type="datetime-local"
                          className="vx-focus"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allowed Areas</Label>
                <div className="p-4 border rounded-md bg-black/20 space-y-2">
                  {AREA_OPTIONS.map((area) => (
                    <div key={area.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`area-${area.id}`}
                        className="vx-focus"
                        checked={areas.includes(area.id)}
                        onCheckedChange={(checked) => toggleArea(area.id, checked === true)}
                      />
                      <Label htmlFor={`area-${area.id}`}>{area.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="button" className="vx-cta" disabled={submitting} onClick={() => void handleCreate()}>
                {submitting ? "Creating…" : "Create & Share"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="vx-card p-0">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left w-12"><Checkbox id="select-all" /></th>
                <th className="p-4 text-left font-semibold">Visitor</th>
                <th className="p-4 text-left font-semibold">Code</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Areas</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No passes yet. Create one or run <code className="text-xs">npm run db:seed</code>.
                  </td>
                </tr>
              ) : passes.map((item) => (
                <tr key={item.id} className="vx-table-row border-t border-white/10">
                  <td className="p-4"><Checkbox id={`select-${item.id}`} /></td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4 font-mono text-xs">{item.code}</td>
                  <td className="p-4">
                    <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", statusConfig[item.status]?.className)}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{item.areas.join(", ") || "—"}</td>
                  <td className="p-4 space-x-2">
                     <Sheet>
                        <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="vx-focus"
                              disabled={item.status === "Revoked"}
                              onClick={() => setSelectedPass(item)}
                            >
                                Share
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-screen bg-black/90 border-0 text-white flex flex-col items-center justify-center">
                            <div className="w-full max-w-sm text-center">
                                <h2 className="text-2xl font-bold mb-2">Visitor Pass: {selectedPass?.name}</h2>
                                <p className="text-muted-foreground mb-2">Scan this QR code at the entrance.</p>
                                <p className="font-mono text-sm mb-6">{selectedPass?.code}</p>
                                <div className="bg-white p-4 rounded-lg inline-block">
                                    <QrCode className="w-64 h-64 text-black"/>
                                </div>
                                <Button className="w-full mt-8 vx-cta vx-focus text-lg"><Share2 className="mr-2"/> Share Link</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                     <Button
                       variant="destructive"
                       size="sm"
                       className="vx-focus"
                       onClick={() => void handleRevoke(item.id)}
                       disabled={item.status === "Revoked"}
                     >
                       Revoke
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
