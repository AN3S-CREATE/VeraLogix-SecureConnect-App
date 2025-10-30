"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Paperclip, Download, ShieldCheck } from "lucide-react";

export default function VenInvoicesPage() {

    const invoices = [
        { id: "INV-001", woId: "WO-001", amount: 1250.00, status: 'Paid', date: '2024-07-15' },
        { id: "INV-002", woId: "WO-003", amount: 850.50, status: 'Submitted', date: '2024-08-01' },
    ];

    const statusConfig = {
        Paid: { className: "chip-info" },
        Submitted: { className: "text-yellow-400 border-yellow-500/50" },
        Draft: { className: "text-muted-foreground" }
    }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Invoicing</h1>
        <Dialog>
            <DialogTrigger asChild>
                <Button className="vx-cta vx-focus"><Plus className="mr-2" /> New Invoice</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-background border-white/10">
                 <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                <DialogHeader>
                    <DialogTitle>Create Invoice INV-003</DialogTitle>
                    <DialogDescription>Create a new invoice from a work order or from scratch.</DialogDescription>
                </DialogHeader>
                
                <div className="grid md:grid-cols-3 gap-8 py-4">
                    <div className="md:col-span-2 space-y-4">
                        <Label>Line Items</Label>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-24">Qty</TableHead>
                                    <TableHead className="w-32">Unit Price</TableHead>
                                    <TableHead className="w-32 text-right">Total</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell><Input defaultValue="Compressor Model #ABC-123" className="vx-focus" /></TableCell>
                                    <TableCell><Input type="number" defaultValue={1} className="vx-focus" /></TableCell>
                                    <TableCell><Input type="number" defaultValue={450.00} className="vx-focus" /></TableCell>
                                    <TableCell className="text-right font-medium">$450.00</TableCell>
                                    <TableCell><Button size="icon" variant="ghost"><Trash2 className="text-muted-foreground" /></Button></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Input defaultValue="Labor" className="vx-focus" /></TableCell>
                                    <TableCell><Input type="number" defaultValue={4} className="vx-focus" /></TableCell>
                                    <TableCell><Input type="number" defaultValue={100.00} className="vx-focus" /></TableCell>
                                    <TableCell className="text-right font-medium">$400.00</TableCell>
                                    <TableCell><Button size="icon" variant="ghost"><Trash2 className="text-muted-foreground" /></Button></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                         <Button variant="outline" size="sm" className="w-full vx-focus"><Plus /> Add Line Item</Button>
                    </div>
                    <div className="space-y-6">
                        <div className="vx-card p-6">
                            <h3 className="font-bold">Totals</h3>
                            <div className="mt-2 space-y-2 text-sm">
                                <div className="flex justify-between"><span>Subtotal</span><span>$850.00</span></div>
                                <div className="flex justify-between"><span>Tax (15%)</span><span>$127.50</span></div>
                                <div className="flex justify-between text-lg font-bold text-gradient-primary pt-2 border-t border-border"><span>Total Due</span><span>$977.50</span></div>
                            </div>
                        </div>

                         <div>
                            <Label htmlFor="attachments">Attach Evidence</Label>
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/50 px-6 py-10 bg-black/20">
                                <div className="text-center">
                                    <Paperclip className="mx-auto h-8 w-8 text-gray-500" />
                                    <p className="mt-2 text-xs text-gray-400">Attach handover PDF</p>
                                </div>
                            </div>
                        </div>
                        
                         <div className="space-y-2 rounded-lg border border-border p-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                                <h3 className="font-semibold">Submit for Payment</h3>
                            </div>
                            <p className="text-xs text-muted-foreground">This requires authentication and will be logged.</p>
                            <Input placeholder="Enter auth code" className="vx-focus" />
                            <Button className="w-full vx-cta vx-focus">Submit Invoice</Button>
                         </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
      </div>
      
      <div className="vx-card p-0">
          <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Work Order</TableHead>
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
                              <TableCell>{inv.date}</TableCell>
                              <TableCell>
                                 <span className={cn("px-2 py-1 text-xs font-semibold rounded-full border", statusConfig[inv.status as keyof typeof statusConfig].className)}>
                                    {inv.status}
                                 </span>
                              </TableCell>
                              <TableCell className="text-right font-medium">{inv.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                              <TableCell className="text-right">
                                  <Button size="sm" variant="outline" className="vx-focus"><Download className="mr-2" /> Download</Button>
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
