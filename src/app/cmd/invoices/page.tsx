"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FileSearch, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AgentInvoicesPage() {

    const invoices = [
        { id: "INV-002", woId: "WO-003", vendor: "ElectriX", amount: 850.50, status: 'Submitted', date: '2024-08-01' },
        { id: "INV-004", woId: "WO-005", vendor: "PlumbCo", amount: 350.00, status: 'Submitted', date: '2024-08-02' },
    ];

    const statusConfig = {
        Paid: { className: "chip-info" },
        Submitted: { className: "text-yellow-400 border-yellow-500/50" },
        Draft: { className: "text-muted-foreground" }
    }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Invoice Approval</h1>
      </div>
      
      <div className="vx-card p-0">
          <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Work Order</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {invoices.map(inv => (
                          <TableRow key={inv.id} className="vx-table-row">
                              <TableCell className="font-medium">{inv.id}</TableCell>
                              <TableCell>{inv.woId}</TableCell>
                              <TableCell>{inv.vendor}</TableCell>
                              <TableCell>{inv.date}</TableCell>
                              <TableCell>
                                 <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", statusConfig[inv.status as keyof typeof statusConfig].className)}>
                                    {inv.status}
                                 </span>
                              </TableCell>
                              <TableCell className="text-right font-medium">{inv.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                              <TableCell className="text-right">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline" className="vx-focus">
                                            <FileSearch className="mr-2" /> Review & Approve
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-lg bg-background border-white/10">
                                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                                        <DialogHeader>
                                            <DialogTitle>Approve Invoice {inv.id}</DialogTitle>
                                            <DialogDescription>
                                                Review the invoice details and linked evidence before final approval and export to accounting.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 my-4 text-sm relative">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <p className="text-7xl font-black text-white/5 -rotate-12 select-none">
                                                    HASH: {inv.id.substring(0,4)}...A4B2
                                                </p>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-muted-foreground">Vendor:</span>
                                                <span className="font-semibold">{inv.vendor}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-muted-foreground">Work Order:</span>
                                                <span className="font-semibold">{inv.woId}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-muted-foreground">Amount:</span>
                                                <span className="font-semibold">{inv.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                            </div>
                                            <div className="pt-4">
                                                <Button variant="outline" asChild className="w-full vx-focus">
                                                    <Link href="#" target="_blank">View Attached Evidence (Handover.pdf)</Link>
                                                </Button>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="secondary">Reject</Button>
                                            <Button className="vx-cta vx-focus">
                                                <CheckCircle className="mr-2" />
                                                Approve & Export
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
      </div>
    </div>
  );
}
