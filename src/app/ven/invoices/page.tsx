"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthClient, useBackend, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/lib/entities";
import { cn } from "@/lib/utils";
import { Download, Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

type InvoiceRow = Invoice & { siteId: string };

function amountNumber(amount: Invoice["amount"]) {
  const n = typeof amount === "number" ? amount : Number(amount);
  return Number.isFinite(n) ? n : 0;
}

export default function VenInvoicesPage() {
  const { user } = useBackend();
  const client = useAuthClient();
  const { toast } = useToast();
  const { data, isLoading, refresh } = useCollection<InvoiceRow>("invoices");

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("850");
  const [woId, setWoId] = useState("WO-NEW");
  const [submitting, setSubmitting] = useState(false);

  const invoices = useMemo(
    () =>
      (data ?? []).map((inv) => ({
        id: inv.id,
        amount: amountNumber(inv.amount),
        status: inv.status === "paid" ? "Paid" : "Submitted",
        date: new Date(inv.due).toISOString().slice(0, 10),
        woId: inv.ledger?.[1] ?? "—",
      })),
    [data],
  );

  const statusConfig = {
    Paid: { className: "chip-info" },
    Submitted: { className: "text-yellow-400 border-yellow-500/50" },
  };

  const handleCreate = async () => {
    const siteId = user?.siteIds[0];
    if (!siteId || !user?.id) {
      toast({
        title: "Sign in required",
        description: "Vendor account needs a site assignment.",
        variant: "destructive",
      });
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await client.create("invoices", {
        siteId,
        userId: user.id,
        amount: value,
        due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "unpaid",
        ledger: [user.name || user.email || "vendor", woId.trim() || "WO"],
      });
      await refresh();
      setOpen(false);
      toast({ title: "Invoice submitted" });
    } catch (err) {
      toast({
        title: "Submit failed",
        description: err instanceof Error ? err.message : "Unable to create invoice",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Invoicing</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="vx-cta vx-focus">
              <Plus className="mr-2" /> New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background border-white/10">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Submits via `POST /api/v1/invoices`.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="wo">Work order ref</Label>
                <Input id="wo" value={woId} onChange={(e) => setWoId(e.target.value)} className="vx-focus" />
              </div>
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="vx-focus"
                />
              </div>
              <div className="space-y-2 rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold">Submit for Payment</h3>
                </div>
                <Button className="w-full vx-cta vx-focus" disabled={submitting} onClick={handleCreate}>
                  {submitting ? "Submitting…" : "Submit Invoice"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="vx-card p-0">
        {isLoading && invoices.length === 0 ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No invoices yet. Create one to push it into the agent approval queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id} className="vx-table-row">
                      <TableCell className="font-medium font-mono text-xs">{inv.id.slice(0, 8)}</TableCell>
                      <TableCell>{inv.woId}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-semibold rounded-full border",
                            statusConfig[inv.status as keyof typeof statusConfig].className,
                          )}
                        >
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {inv.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="vx-focus" disabled>
                          <Download className="mr-2" /> Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
