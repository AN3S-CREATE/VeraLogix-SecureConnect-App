
"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TenWalletPage() {
  const transactions = [
    { id: "TRN-001", type: "Amenity Booking", amount: -27.50, date: "2024-08-01" },
    { id: "TRN-002", type: "Account Top-up", amount: 100.00, date: "2024-07-30" },
    { id: "TRN-003", type: "EV Charging", amount: -12.75, date: "2024-07-29" },
    { id: "TRN-004", type: "Guest Pass Fee", amount: -5.00, date: "2024-07-28" },
  ];

  return (
    <div className="space-y-8" id="pay">
      <div className="vx-card p-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-foreground/80">Current Balance</p>
          <p className="text-4xl font-bold text-gradient-primary">$250.00</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="vx-cta vx-focus">Pay Now</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-white/10">
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(to right, transparent, var(--neon-2), transparent)' }}></div>
            <DialogHeader>
              <DialogTitle>Make a Payment</DialogTitle>
              <DialogDescription>Top up your account balance.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="$50.00" className="vx-focus" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary">Cancel</Button>
              <Button className="vx-cta vx-focus">Confirm Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="vx-card p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold">Date</th>
                  <th className="p-4 text-left font-semibold">Description</th>
                  <th className="p-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id} className="vx-table-row border-t border-white/10">
                    <td className="p-4 text-muted-foreground">{item.date}</td>
                    <td className="p-4">{item.type}</td>
                    <td className={`p-4 text-right font-medium ${item.amount > 0 ? 'delta-positive' : 'text-foreground'}`}>
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
