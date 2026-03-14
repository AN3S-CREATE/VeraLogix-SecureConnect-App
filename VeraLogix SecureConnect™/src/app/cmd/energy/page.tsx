
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Fan, Zap } from "lucide-react";

export default function EnergyPage() {

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-foreground">Energy & Environmental</h1>
            
            <Tabs defaultValue="energy" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/20 h-12">
                    <TabsTrigger value="energy" className="vx-tabs-trigger h-full flex items-center gap-2"><Zap /> Energy</TabsTrigger>
                    <TabsTrigger value="water" className="vx-tabs-trigger h-full flex items-center gap-2"><Droplets /> Water</TabsTrigger>
                    <TabsTrigger value="iaq" className="vx-tabs-trigger h-full flex items-center gap-2"><Fan /> Indoor Air Quality</TabsTrigger>
                </TabsList>
                
                <TabsContent value="energy" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 vx-card">
                             <CardHeader>
                                <CardTitle>Energy Consumption (kWh)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center">
                                <p className="text-muted-foreground">Energy Chart Placeholder</p>
                            </CardContent>
                        </div>
                        <aside className="lg:col-span-1 vx-card">
                             <CardHeader>
                                <CardTitle>Zone Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-[300px]">
                                <p className="text-muted-foreground">Leaderboard Placeholder</p>
                            </CardContent>
                        </aside>
                    </div>
                </TabsContent>

                <TabsContent value="water" className="mt-6">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 vx-card">
                             <CardHeader>
                                <CardTitle>Water Consumption (Liters)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center">
                                <p className="text-muted-foreground">Water Chart Placeholder</p>
                            </CardContent>
                        </div>
                        <aside className="lg:col-span-1 vx-card">
                             <CardHeader>
                                <CardTitle>Zone Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-[300px]">
                                <p className="text-muted-foreground">Leaderboard Placeholder</p>
                            </CardContent>
                        </aside>
                    </div>
                </TabsContent>

                <TabsContent value="iaq" className="mt-6">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 vx-card">
                             <CardHeader>
                                <CardTitle>Indoor Air Quality Index</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center">
                                <p className="text-muted-foreground">IAQ Chart Placeholder</p>
                            </CardContent>
                        </div>
                        <aside className="lg:col-span-1 vx-card">
                             <CardHeader>
                                <CardTitle>Zone Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-[300px]">
                                <p className="text-muted-foreground">Leaderboard Placeholder</p>
                            </CardContent>
                        </aside>
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
