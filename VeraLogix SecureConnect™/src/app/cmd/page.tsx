
"use client";

import { KpiTile } from "@/components/agent/kpi-tile";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CmdOverviewPage() {
    const incidents = [
        { id: 'INC-001', description: 'Unauthorised access attempt on main entrance.', time: '2m ago' },
        { id: 'INC-002', description: 'Perimeter fence breach detected near Sector 4.', time: '15m ago' },
        { id: 'INC-003', description: 'CCTV camera offline in parking garage P2.', time: '1h ago' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-foreground">Command Center Overview</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Estate Map */}
                    <div className="relative vx-card p-0 aspect-[16/9] overflow-hidden">
                        <Image 
                            src="https://images.unsplash.com/photo-1621282636114-c3c76345156a?q=80&w=1932&auto=format&fit=crop" 
                            alt="Site Map" 
                            fill 
                            className="object-cover opacity-20"
                            data-ai-hint="dark map"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-muted-foreground">Live Estate Map Placeholder</p>
                        </div>
                    </div>

                    {/* KPI Tiles */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <KpiTile title="Security" value="Normal" status="healthy" link="/cmd/incidents" />
                        <KpiTile title="Energy" value="85 kW" status="healthy" link="/cmd/ev-charging" />
                        <KpiTile title="Water" value="98%" status="healthy" />
                        <KpiTile title="EV" value="75%" status="healthy" link="/cmd/ev-charging" />
                        <KpiTile title="Wellness" value="92" status="healthy" />
                        <KpiTile title="Community" value="Active" status="healthy" />
                    </div>
                </div>

                {/* Right Rail */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="vx-card p-6">
                        <h2 className="text-xl font-bold mb-4">Key Insights</h2>
                        <div className="space-y-3 text-sm">
                            <p>📈 Energy consumption is 5% above average for this time of day.</p>
                            <p>⚠️ Security patrol in Sector 3 is 10 minutes overdue.</p>
                            <p>✅ All systems are currently reporting normal operational status.</p>
                        </div>
                    </div>
                    <div className="vx-card p-6">
                        <h2 className="text-xl font-bold mb-4">Incident Ticker</h2>
                        <div className="space-y-4">
                            {incidents.map(incident => (
                                <Link href="/cmd/incidents" key={incident.id} className="block group">
                                     <div className="flex items-start gap-3">
                                        <ShieldAlert className="w-5 h-5 mt-0.5 text-orange-400"/>
                                        <div>
                                            <p className="font-semibold group-hover:text-primary">{incident.description}</p>
                                            <p className="text-xs text-muted-foreground">{incident.time}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                         <Button asChild variant="outline" className="w-full mt-4 vx-focus">
                             <Link href="/cmd/incidents">View All Incidents <ArrowRight className="ml-2" /></Link>
                         </Button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
