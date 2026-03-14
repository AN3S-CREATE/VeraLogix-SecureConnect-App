"use client";

import { ArrowUp, ArrowDown, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const chartData = [
  { month: "January", incidents: 12 },
  { month: "February", incidents: 15 },
  { month: "March", incidents: 8 },
  { month: "April", incidents: 19 },
  { month: "May", incidents: 14 },
  { month: "June", incidents: 21 },
]

const chartConfig = {
  incidents: {
    label: "Incidents",
    color: "hsl(var(--primary))",
  },
}

export default function SecurityPosturePage() {

    const exceptions = [
        { id: 'OV-001', type: 'Policy Override', details: 'Main Lobby Entrance, 30 mins', user: 'John Doe', date: '2024-08-01' },
        { id: 'FP-001', type: 'False Positive', details: 'Sector 4 perimeter sensor', user: 'System', date: '2024-07-30' },
    ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Security Posture</h1>
        <Button variant="outline" className="vx-focus"><Download className="mr-2" /> Export Summary</Button>
      </div>
      
      {/* KPI Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="MTTR" value="48m" trend="-12%" trendDirection="positive" />
        <KpiCard title="Incident Rate" value="3.2/100" trend="+5%" trendDirection="negative" />
        <KpiCard title="SLA Breaches" value="2" trend="+1" trendDirection="negative" />
        <KpiCard title="Policy Deviations" value="1" trend="-50%" trendDirection="positive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
             <Card className={cn("vx-card")}>
                <CardHeader>
                <CardTitle>Incident Trend</CardTitle>
                <CardDescription>Last 6 Months</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="incidents" fill="var(--color-incidents)" radius={4} />
                    </BarChart>
                </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Risk Matrix</h2>
            <div className="vx-card p-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                    <div className="col-start-2">Likely</div>
                    <div>Almost Certain</div>
                    
                    <div className="text-right">High</div>
                    <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-md p-4">Medium Risk</div>
                    <div className="bg-red-500/20 text-red-400 border border-red-500/50 rounded-md p-4">High Risk</div>

                    <div className="text-right">Medium</div>
                    <div className="bg-green-500/20 text-green-400 border border-green-500/50 rounded-md p-4">Low Risk</div>
                    <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-md p-4">Medium Risk</div>

                    <div className="text-right">Low</div>
                    <div className="bg-green-500/20 text-green-400 border border-green-500/50 rounded-md p-4">Low Risk</div>
                    <div className="bg-green-500/20 text-green-400 border border-green-500/50 rounded-md p-4">Low Risk</div>
                </div>
            </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Policy Exception Log</h2>
         <div className="vx-card p-0">
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="border-b border-white/10">
                    <th className="p-4 text-left font-semibold">ID</th>
                    <th className="p-4 text-left font-semibold">Type</th>
                    <th className="p-4 text-left font-semibold">Details</th>
                    <th className="p-4 text-left font-semibold">User</th>
                    <th className="p-4 text-left font-semibold">Date</th>
                </tr>
                </thead>
                <tbody>
                {exceptions.map((item) => (
                    <tr key={item.id} className="vx-table-row border-t border-white/10">
                    <td className="p-4">{item.id}</td>
                     <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full chip-alert">
                        {item.type}
                        </span>
                    </td>
                    <td className="p-4">{item.details}</td>
                    <td className="p-4">{item.user}</td>
                    <td className="p-4">{item.date}</td>
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

function KpiCard({ title, value, trend, trendDirection }: { title: string, value: string, trend: string, trendDirection: 'positive' | 'negative' | 'neutral' }) {
  return (
    <div className="p-6 vx-card">
      <p className="text-sm text-foreground/80">{title}</p>
      <p className="text-4xl font-bold text-gradient-primary my-2">{value}</p>
      <div className={cn("flex items-center text-sm", trendDirection === 'positive' ? 'delta-positive' : 'delta-negative')}>
        {trendDirection === 'positive' && <ArrowUp className="h-4 w-4 mr-1" />}
        {trendDirection === 'negative' && <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}
