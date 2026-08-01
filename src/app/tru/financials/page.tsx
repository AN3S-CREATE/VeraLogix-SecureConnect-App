"use client";

import { ArrowUp, ArrowDown, Download } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCollection } from "@/backend";
import type { Invoice, Ticket } from "@/lib/entities";
import { formatMoney, useInvoiceKpis, useTicketKpis } from "@/lib/portal-kpis";

export default function FinancialsPage() {
  const { data: invoices, isLoading } = useCollection<Invoice & { id: string }>("invoices");
  const { data: tickets } = useCollection<Ticket & { id: string }>("tickets");
  const fin = useInvoiceKpis(invoices);
  const wo = useTicketKpis(tickets);

  const agingTotal =
    fin.aging.current + fin.aging.d30 + fin.aging.d60 + fin.aging.d90 || 1;
  const agingBuckets = [
    { label: "Current", amount: fin.aging.current, color: "bg-green-500/50" },
    { label: "30-60 Days", amount: fin.aging.d30, color: "bg-yellow-500/50" },
    { label: "60-90 Days", amount: fin.aging.d60, color: "bg-orange-500/50" },
    { label: "90+ Days", amount: fin.aging.d90, color: "bg-red-500/50" },
  ].map((b) => ({ ...b, percentage: Math.round((b.amount / agingTotal) * 100) }));

  const budgetData = [
    { category: "Maintenance", budget: 5000, actual: Math.max(wo.open * 700, 500) },
    { category: "Collections opex", budget: 2000, actual: fin.unpaidCount * 150 },
    { category: "Admin", budget: 2500, actual: 2500 },
  ].map((r) => ({ ...r, variance: r.actual - r.budget }));

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ fin, wo, exportedAt: new Date().toISOString() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trustee-financials.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !invoices) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Financials & Performance</h1>
        <Button variant="outline" className="vx-focus" onClick={handleExport}>
          <Download className="mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="Net collections"
          value={formatMoney(fin.paidTotal)}
          trend={`${fin.paidCount} paid invoices`}
          trendDirection="positive"
        />
        <KpiCard
          title="Arrears"
          value={formatMoney(fin.arrears)}
          trend={`${fin.unpaidCount} unpaid`}
          trendDirection={fin.arrears > 0 ? "negative" : "positive"}
        />
        <KpiCard
          title="Budget variance (proxy)"
          value={formatMoney(budgetData.reduce((s, b) => s + b.variance, 0))}
          trend="vs category budgets"
          trendDirection="negative"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="vx-card">
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
              <CardDescription>Live invoice-derived series</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fin.cashflow} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorIncomeFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpensesFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${Number(value) / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fill="url(#colorIncomeFin)" />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--destructive))"
                    fill="url(#colorExpensesFin)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Arrears Aging</h2>
          <div className="vx-card p-6 space-y-4">
            {agingBuckets.map((b) => (
              <AgingBucket
                key={b.label}
                label={b.label}
                amount={b.amount}
                percentage={b.percentage}
                color={b.color}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Budget vs. Actual</h2>
        <div className="vx-card p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetData.map((item) => (
                  <TableRow key={item.category} className="vx-table-row">
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.budget.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.actual.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        item.variance > 0 ? "text-orange-400" : "delta-positive",
                      )}
                    >
                      {item.variance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgingBucket({
  label,
  amount,
  percentage,
  color,
}: {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {formatMoney(amount)} · {percentage}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full", color)} style={{ width: `${Math.min(100, percentage)}%` }} />
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  trend,
  trendDirection,
}: {
  title: string;
  value: string;
  trend: string;
  trendDirection: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="p-6 vx-card">
      <p className="text-sm text-foreground/80">{title}</p>
      <p className="text-4xl font-bold text-gradient-primary my-2">{value}</p>
      <div
        className={cn(
          "flex items-center text-sm",
          trendDirection === "positive" ? "delta-positive" : "text-orange-400",
        )}
      >
        {trendDirection === "positive" && <ArrowUp className="h-4 w-4 mr-1" />}
        {trendDirection === "negative" && <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}
