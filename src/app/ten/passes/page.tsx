"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TenPassesPage() {
  const passes = [
    { id: "PASS-001", name: "John Doe", status: "Active", date: "2024-08-01" },
    { id: "PASS-002", name: "Jane Smith", status: "Upcoming", date: "2024-08-05" },
    { id: "PASS-003", name: "Peter Jones", status: "Revoked", date: "2024-07-28" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Visitor Passes</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="vx-cta vx-focus">New Pass</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px] bg-background border-white/10">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
            <DialogHeader>
              <DialogTitle>Create New Visitor Pass</DialogTitle>
              <DialogDescription>
                Fill in the details to issue a new pass. The QR code will be generated upon creation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Visitor Name</Label>
                <Input id="name" defaultValue="John Doe" className="col-span-3 vx-focus" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Valid From</Label>
                <Input id="date" type="date" className="col-span-3 vx-focus" />
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
                <th className="p-4 text-left font-semibold">ID</th>
                <th className="p-4 text-left font-semibold">Visitor</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Date</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passes.map((item, index) => (
                <tr key={item.id} className="vx-table-row border-t border-white/10">
                  <td className="p-4"><Checkbox id={`select-${item.id}`} /></td>
                  <td className="p-4">{item.id}</td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'Revoked' ? 'chip-alert' : 'chip-info'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">{item.date}</td>
                  <td className="p-4 space-x-2">
                    <Button variant="outline" size="sm" className="vx-focus">Share</Button>
                     <Button variant="destructive" size="sm" className="vx-focus">Revoke</Button>
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