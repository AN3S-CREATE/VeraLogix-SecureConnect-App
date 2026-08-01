"use client";

import { ArrowUp, ArrowDown, Download } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCollection } from "@/backend";
import type { Invoice, Ticket, EVSession, Incident } from "@/lib/entities";
import {
  formatMoney,
  useEvKpis,
  useInvoiceKpis,
  useSecurityKpis,
  useTicketKpis,
} from "@/lib/portal-kpis";

export default function TrusteeOverviewPage() {
  const { data: invoices, isLoading: invLoading } = useCollection<Invoice & { id: string }>("invoices");
  const { data: tickets } = useCollection<Ticket & { id: string }>("tickets");
  const { data: sessions } = useCollection<EVSession & { id: string }>("ev-sessions");
  const { data: incidents } = useCollection<Incident & { id: string }>("incidents");

  const fin = useInvoiceKpis(invoices);
  const wo = useTicketKpis(tickets);
  const ev = useEvKpis(sessions);
  const sec = useSecurityKpis(incidents);

  const budgetData = [
    {
      category: "Maintenance",
      budget: Math.max(5000, wo.total * 800),
      actual: wo.open * 650,
    },
    {
      category: "Utilities",
      budget: 3000,
      actual: Math.round(fin.paidTotal * 0.12) || 1200,
    },
    {
      category: "Security",
      budget: 7000,
      actual: 5000 + sec.open * 400,
    },
    {
      category: "EV / Mobility",
      budget: 2500,
      actual: Math.round(ev.revenue) || 0,
    },
  ].map((r) => ({ ...r, variance: r.actual - r.budget }));

  const handleExport = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            invoices: fin,
            tickets: wo,
            ev,
            security: sec,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trustee-overview.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (invLoading && !invoices) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <style jsx global>{`
        .delta-negative-trustee {
          color: #d4ff00;
        }
      `}</style>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Portfolio Performance</h1>
        <Button variant="outline" className="vx-focus" onClick={handleExport}>
          <Download className="mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="Collected (paid invoices)"
          value={formatMoney(fin.paidTotal)}
          trend={`${fin.paidCount} paid`}
          trendDirection="positive"
        />
        <KpiCard
          title="Arrears (unpaid)"
          value={formatMoney(fin.arrears)}
          trend={`${fin.unpaidCount} open`}
          trendDirection={fin.arrears > 0 ? "negative" : "positive"}
        />
        <KpiCard
          title="Open work orders"
          value={String(wo.open)}
          trend={`${wo.breached} SLA breach`}
          trendDirection={wo.breached ? "negative" : "positive"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="vx-card">
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
              <CardDescription>Derived from live invoice due dates</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fin.cashflow} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fill="url(#colorIncome)" />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--destructive))"
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Insights</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-md border border-[var(--neon-2)]/50 bg-[var(--neon-2)]/20 text-sm">
              <span className="font-semibold text-[var(--neon-2)]">Operations:</span> {wo.open} open
              tickets · {sec.open} open incidents.
            </div>
            <div className="p-3 rounded-md border border-[var(--neon-3)]/50 bg-[var(--neon-3)]/20 text-sm">
              <span className="font-semibold text-[var(--neon-3)]">Collections:</span>{" "}
              {formatMoney(fin.arrears)} unpaid across {fin.unpaidCount} invoices.
            </div>
            <div className="p-3 rounded-md border border-[var(--neon-2)]/50 bg-[var(--neon-2)]/20 text-sm">
              <span className="font-semibold text-[var(--neon-2)]">Mobility:</span> EV revenue{" "}
              {formatMoney(ev.revenue)} · {ev.charging} active sessions.
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Budget vs. Actual (live proxies)</h2>
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
                        item.variance > 0
                          ? "delta-negative-trustee"
                          : item.variance < 0
                            ? "delta-positive"
                            : "text-muted-foreground",
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
          trendDirection === "positive" ? "delta-positive" : "delta-negative-trustee",
        )}
      >
        {trendDirection === "positive" && <ArrowUp className="h-4 w-4 mr-1" />}
        {trendDirection === "negative" && <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}
