
"use client";

import { ArrowUp, ArrowDown, Download } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const cashflowData = [
  { month: 'Jan', income: 4000, expenses: 2400 },
  { month: 'Feb', income: 3000, expenses: 1398 },
  { month: 'Mar', income: 2000, expenses: 9800 },
  { month: 'Apr', income: 2780, expenses: 3908 },
  { month: 'May', income: 1890, expenses: 4800 },
  { month: 'Jun', income: 2390, expenses: 3800 },
];

const budgetData = [
    { category: "Maintenance", budget: 5000, actual: 4500, variance: -500 },
    { category: "Utilities", budget: 3000, actual: 3200, variance: 200 },
    { category: "Security", budget: 7000, actual: 6500, variance: -500 },
    { category: "Admin", budget: 2500, actual: 2500, variance: 0 },
]

export default function TrusteeOverviewPage() {

    useEffect(() => {
        console.log('sc.trust.overview.loaded');
    }, []);

    const handleExport = () => {
        console.log('sc.trust.export.triggered');
    }

  return (
    <div className="space-y-8">
       <style jsx global>{`
        .delta-negative-trustee { color: #D4FF00; }
       `}</style>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Portfolio Performance</h1>
        <Button variant="outline" className="vx-focus" onClick={handleExport}><Download className="mr-2" /> Export Report</Button>
      </div>
      
      {/* KPI Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Net Operating Income" value="$1.2M" trend="+5.2%" trendDirection="positive" />
        <KpiCard title="Arrears (30+ days)" value="$45,210" trend="+2.1%" trendDirection="negative" />
        <KpiCard title="Budget Variance" value="-$5,800" trend="-1.5%" trendDirection="negative" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Cashflow Chart */}
        <div className="lg:col-span-3">
             <Card className="vx-card">
                <CardHeader>
                    <CardTitle>Cash Flow</CardTitle>
                    <CardDescription>Last 6 Months</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cashflowData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value)/1000}k`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" fill="url(#colorExpenses)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        {/* Insight Rail */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Insights</h2>
            <div className="space-y-3">
                <div className="p-3 rounded-md border border-[var(--neon-2)]/50 bg-[var(--neon-2)]/20 text-sm">
                    <span className="font-semibold text-[var(--neon-2)]">Positive Variance:</span> Maintenance budget is underspent by 10%.
                </div>
                <div className="p-3 rounded-md border border-[var(--neon-3)]/50 bg-[var(--neon-3)]/20 text-sm">
                    <span className="font-semibold text-[var(--neon-3)]">Action Required:</span> Utility costs are 7% over budget.
                </div>
                 <div className="p-3 rounded-md border border-[var(--neon-2)]/50 bg-[var(--neon-2)]/20 text-sm">
                     <span className="font-semibold text-[var(--neon-2)]">Opportunity:</span> EV charging revenue is up 15% month-over-month.
                </div>
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
                                <TableCell className="text-right">{item.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                <TableCell className="text-right">{item.actual.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                <TableCell className={cn("text-right", item.variance > 0 ? "delta-negative-trustee" : item.variance < 0 ? "delta-positive" : "text-muted-foreground")}>
                                    {item.variance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
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

function KpiCard({ title, value, trend, trendDirection }: { title: string, value: string, trend: string, trendDirection: 'positive' | 'negative' | 'neutral' }) {
  return (
    <div className="p-6 vx-card">
      <p className="text-sm text-foreground/80">{title}</p>
      <p className="text-4xl font-bold text-gradient-primary my-2">{value}</p>
      <div className={cn("flex items-center text-sm", trendDirection === 'positive' ? 'delta-positive' : 'delta-negative-trustee')}>
        {trendDirection === 'positive' && <ArrowUp className="h-4 w-4 mr-1" />}
        {trendDirection === 'negative' && <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}
