
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Zap, Power, BatteryCharging } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function EvChargingPlannerPage() {

    const bays = [
        { id: 1, status: 'charging', user: 'John D.', kwh: 12.5, time: '45m left' },
        { id: 2, status: 'available', user: null, kwh: 0, time: null },
        { id: 3, status: 'reserved', user: 'Jane S.', kwh: 0, time: 'Starts in 15m' },
        { id: 4, status: 'charging', user: 'Mike T.', kwh: 28.1, time: '1h 12m left' },
        { id: 5, status: 'error', user: null, kwh: 0, time: 'Requires maintenance' },
        { id: 6, status: 'available', user: null, kwh: 0, time: null },
    ];

    const statusConfig = {
        charging: { label: "Charging", className: "border-neon-1/50 shadow-[0_0_12px_rgba(182,255,46,.25)]" },
        available: { label: "Available", className: "border-border" },
        reserved: { label: "Reserved", className: "border-yellow-500/50" },
        error: { label: "Error", className: "border-destructive/50" },
    } as const;

    const plannerData = [
        { hour: '00:00', load: 30, capacity: 100 },
        { hour: '01:00', load: 25, capacity: 100 },
        { hour: '02:00', load: 20, capacity: 100 },
        { hour: '03:00', load: 20, capacity: 100 },
        { hour: '04:00', load: 35, capacity: 100 },
        { hour: '05:00', load: 50, capacity: 100 },
        { hour: '06:00', load: 70, capacity: 100 },
        { hour: '07:00', load: 90, capacity: 100 },
        { hour: '08:00', load: 110, capacity: 100 }, // Over capacity
        { hour: '09:00', load: 105, capacity: 100 }, // Over capacity
        { hour: '10:00', load: 95, capacity: 100 },
        { hour: '11:00', load: 80, capacity: 100 },
    ];
    
    const handleLoadShed = () => {
        console.log('sc.agent.ev.load_shed_initiated');
        // This would typically stop some charging sessions
    };

    const handleTariffUpdate = () => {
        console.log('sc.agent.ev.tariff_updated');
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-foreground">EV Site Load Planner</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Bay Grid */}
                    <div className="vx-card p-6">
                        <h2 className="text-xl font-bold mb-4">Bay Status</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {bays.map(bay => {
                                const config = statusConfig[bay.status as keyof typeof statusConfig];
                                return (
                                    <div key={bay.id} className={cn("p-4 rounded-lg border", config.className)}>
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold">Bay {bay.id}</p>
                                            <span className={cn("text-xs capitalize", bay.status === 'charging' ? 'text-primary' : 'text-muted-foreground')}>{config.label}</span>
                                        </div>
                                        <div className="mt-2 text-center">
                                            <BatteryCharging className={cn("mx-auto h-10 w-10", bay.status === 'charging' ? 'text-primary animate-pulse' : 'text-muted-foreground')} />
                                        </div>
                                        {bay.user && <p className="text-sm mt-2">{bay.user}</p>}
                                        {bay.time && <p className="text-xs text-muted-foreground">{bay.time}</p>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    {/* Load Shedding Planner */}
                     <div className="vx-card p-6">
                        <h2 className="text-xl font-bold mb-4">Load Shedding Planner</h2>
                         <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={plannerData}>
                                     <defs>
                                        <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
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
                                        cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                                    />
                                    <Legend />
                                    <Bar dataKey="load" name="Projected Load" fill="url(#colorLoad)" radius={[4, 4, 0, 0]} />
                                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="vx-card p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Power /> Demand Response</h2>
                         <div className="p-4 border rounded-md bg-black/20 text-center">
                             <p className="font-bold text-2xl text-gradient-primary">85 kW</p>
                             <p className="text-sm text-muted-foreground">Current Site Load</p>
                         </div>
                         <Button className="w-full mt-4 vx-cta vx-focus bg-destructive hover:bg-destructive/80 text-destructive-foreground" onClick={handleLoadShed}>
                            Initiate Load Shed
                        </Button>
                    </div>

                    <div className="vx-card p-6">
                        <h2 className="text-xl font-bold mb-4">Time-of-Use Tariffs</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="peak-rate">Peak Rate ($/kWh)</Label>
                                <Input id="peak-rate" type="number" defaultValue="0.35" className="vx-focus" />
                            </div>
                            <div>
                                <Label htmlFor="offpeak-rate">Off-Peak Rate ($/kWh)</Label>
                                <Input id="offpeak-rate" type="number" defaultValue="0.12" className="vx-focus" />
                            </div>
                             <div>
                                <Label htmlFor="peak-hours">Peak Hours (e.g. 17:00-21:00)</Label>
                                <Input id="peak-hours" defaultValue="17:00-21:00" className="vx-focus" />
                            </div>
                            <Button className="w-full vx-cta vx-focus" onClick={handleTariffUpdate}>Update Tariffs</Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
