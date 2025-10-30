"use client";

import { ArrowUp, ArrowDown, Download } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const loadCurveData = [
  { hour: '00:00', load: 30, capacity: 100 },
  { hour: '04:00', load: 35, capacity: 100 },
  { hour: '08:00', load: 90, capacity: 100 },
  { hour: '12:00', load: 80, capacity: 100 },
  { hour: '16:00', load: 110, capacity: 100 },
  { hour: '20:00', load: 95, capacity: 100 },
];

const evRevenueData = [
    { day: 'Mon', revenue: 450 },
    { day: 'Tue', revenue: 520 },
    { day: 'Wed', revenue: 600 },
    { day: 'Thu', revenue: 580 },
    { day: 'Fri', revenue: 750 },
    { day: 'Sat', revenue: 900 },
    { day: 'Sun', revenue: 850 },
];

export default function EnergyOversightPage() {

  return (
    <div className="space-y-8">
       <style jsx global>{`
        .delta-negative-energy { color: var(--neon-3); }
        .export-glow {
            box-shadow: 0 0 15px var(--neon-1), inset 0 0 5px var(--neon-1);
        }
       `}</style>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Energy & Mobility Oversight</h1>
        <Button variant="outline" className="vx-focus export-glow">
            <Download className="mr-2" /> Export Report
        </Button>
      </div>
      
      {/* KPI Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Peak Clipping Events" value="12" trend="+20%" trendDirection="negative" />
        <KpiCard title="EV Utilization" value="78%" trend="+5%" trendDirection="positive" />
        <KpiCard title="EV Revenue" value="$4,520" trend="+15.2%" trendDirection="positive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Load Curve Chart */}
        <Card className="vx-card bg-black">
            <CardHeader>
                <CardTitle>Site Load Curve (24h)</CardTitle>
                <CardDescription>Today's energy consumption vs. capacity.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loadCurveData}>
                         <defs>
                            <linearGradient id="colorLoadCurve" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                        <YAxis unit="kW" tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                            }}
                        />
                        <Area type="monotone" dataKey="load" name="Load" stroke="hsl(var(--primary))" fill="url(#colorLoadCurve)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* EV Utilization Revenue Chart */}
        <Card className="vx-card bg-black">
            <CardHeader>
                <CardTitle>EV Utilization Revenue</CardTitle>
                <CardDescription>Last 7 Days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={evRevenueData}>
                         <defs>
                            <linearGradient id="colorEvRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                            }}
                            cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                        />
                        <Bar dataKey="revenue" name="Revenue" fill="url(#colorEvRevenue)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, trendDirection }: { title: string, value: string, trend: string, trendDirection: 'positive' | 'negative' | 'neutral' }) {
  return (
    <div className="p-6 vx-card">
      <p className="text-sm text-foreground/80">{title}</p>
      <p className="text-4xl font-bold text-gradient-primary my-2">{value}</p>
      <div className={cn("flex items-center text-sm", trendDirection === 'positive' ? 'delta-positive' : 'delta-negative-energy')}>
        {trendDirection === 'positive' && <ArrowUp className="h-4 w-4 mr-1" />}
        {trendDirection === 'negative' && <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}
