"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthClient, useCollection } from "@/backend";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/lib/entities";
import { cn } from "@/lib/utils";
import { CheckCircle, FileSearch } from "lucide-react";
import { useMemo, useState } from "react";

type InvoiceRow = Invoice & { siteId: string };

function amountNumber(amount: Invoice["amount"]) {
  const n = typeof amount === "number" ? amount : Number(amount);
  return Number.isFinite(n) ? n : 0;
}

export default function AgentInvoicesPage() {
  const client = useAuthClient();
  const { toast } = useToast();
  const { data, isLoading, refresh } = useCollection<InvoiceRow>("invoices");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const invoices = useMemo(
    () =>
      (data ?? []).map((inv) => ({
        id: inv.id,
        amount: amountNumber(inv.amount),
        status: inv.status === "paid" ? "Paid" : "Submitted",
        date: new Date(inv.due).toISOString().slice(0, 10),
        vendor: inv.ledger?.[0] ?? "Vendor",
        woId: inv.ledger?.[1] ?? "—",
        raw: inv,
      })),
    [data],
  );

  const statusConfig = {
    Paid: { className: "chip-info" },
    Submitted: { className: "text-yellow-400 border-yellow-500/50" },
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const row = data?.find((i) => i.id === id);
      await client.update("invoices", id, {
        status: "paid",
        ledger: [...(row?.ledger ?? []), `approved:${new Date().toISOString()}`],
      });
      await refresh();
      toast({ title: "Invoice approved" });
    } catch (err) {
      toast({
        title: "Approve failed",
        description: err instanceof Error ? err.message : "Unable to update invoice",
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Invoice Approval</h1>
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
                  <TableHead>Vendor</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No invoices yet. Vendors can submit from `/ven/invoices` or run db:seed.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id} className="vx-table-row">
                      <TableCell className="font-medium font-mono text-xs">{inv.id.slice(0, 8)}</TableCell>
                      <TableCell>{inv.woId}</TableCell>
                      <TableCell>{inv.vendor}</TableCell>
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
                        {inv.status === "Paid" ? (
                          <span className="text-xs text-muted-foreground">Approved</span>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="vx-focus">
                                <FileSearch className="mr-2" /> Review & Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg bg-background border-white/10">
                              <DialogHeader>
                                <DialogTitle>Approve Invoice {inv.id.slice(0, 8)}</DialogTitle>
                                <DialogDescription>
                                  Marks the invoice paid via `PATCH /api/v1/invoices/:id`.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-2 text-sm my-4">
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-muted-foreground">Vendor</span>
                                  <span className="font-semibold">{inv.vendor}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-muted-foreground">Amount</span>
                                  <span className="font-semibold">
                                    {inv.amount.toLocaleString("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                    })}
                                  </span>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  className="vx-cta vx-focus"
                                  disabled={approvingId === inv.id}
                                  onClick={() => handleApprove(inv.id)}
                                >
                                  <CheckCircle className="mr-2" />
                                  {approvingId === inv.id ? "Saving…" : "Approve & Export"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
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
