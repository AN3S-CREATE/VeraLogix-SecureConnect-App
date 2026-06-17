"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Edit } from "lucide-react";

const waterfallData = [
  { name: 'Opening Arrears', value: 45210 },
  { name: 'New Invoices', value: 150000 },
  { name: 'Payments', value: -145000 },
  { name: 'Adjustments', value: -5000 },
  { name: 'Write-offs', value: -2000 },
  { name: 'Closing Arrears', value: 43210, isEnd: true },
];

let cumulative = 0;
const processedData = waterfallData.map((d, i) => {
    const isEnd = waterfallData[i].isEnd;
    const start = cumulative;
    cumulative += d.value;
    return {
        ...d,
        start,
        end: isEnd ? d.value : cumulative,
        isPositive: d.value >= 0,
    };
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border border-border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-sm">{`Value: ${payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</p>
      </div>
    );
  }
  return null;
};

export default function CollectionsOversightPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground">Collections Oversight</h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="vx-cta vx-focus"><Edit className="mr-2" /> Propose Policy Change</Button>
                    </SheetTrigger>
                    <SheetContent className="bg-background border-l border-white/10">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                        <SheetHeader>
                            <SheetTitle>New Collections Policy</SheetTitle>
                            <SheetDescription>
                                Propose a change to the automated collections strategy. This will be logged for audit.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 my-6">
                            <div>
                                <Label htmlFor="proposal-details">Proposal Details</Label>
                                <Textarea id="proposal-details" placeholder="e.g., Reduce reminder frequency for low-value arrears..." className="vx-focus min-h-[150px]" />
                            </div>
                        </div>
                        <Button className="w-full vx-cta vx-focus">
                            <CheckCircle className="mr-2 text-primary-foreground/80" style={{ filter: "drop-shadow(0 0 5px var(--neon-1))" }}/>
                            Submit Proposal
                        </Button>
                    </SheetContent>
                </Sheet>
            </div>

            <Card className="vx-card bg-black/50">
                <CardHeader>
                    <CardTitle>Arrears Waterfall (Month-to-Date)</CardTitle>
                    <CardDescription>Visualizing the flow of collections and adjustments.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value)/1000}k`} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted)/0.5)'}} />
                            <Bar dataKey="start" stackId="a" fill="transparent" />
                            <Bar dataKey="value" stackId="a">
                                {processedData.map((entry, index) => {
                                    if (entry.isEnd) return <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />;
                                    return <Cell key={`cell-${index}`} fill={entry.isPositive ? "hsl(var(--secondary))" : "hsl(var(--g4))"} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="vx-card">
                    <CardHeader>
                        <CardTitle>Cohort Recovery Analysis</CardTitle>
                        <CardDescription>Recovery rates by invoice month.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48">
                        <p className="text-muted-foreground">Cohort comparison chart placeholder</p>
                    </CardContent>
                </Card>
                <Card className="vx-card">
                    <CardHeader>
                        <CardTitle>Action Mix</CardTitle>
                        <CardDescription>Automated vs. manual collection actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-48">
                        <p className="text-muted-foreground">Action mix chart placeholder</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
