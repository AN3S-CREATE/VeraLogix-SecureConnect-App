"use client";

import { ConnectorCard } from "@/components/agent/connector-card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function IntegrationsPage() {
  const connectors: { id: string; name: string; category: string; status: "connected" | "disconnected" | "error" }[] = [
    { id: "pms-1", name: "Guesty", category: "Property Management", status: "connected" },
    { id: "acc-1", name: "Xero", category: "Accounting", status: "disconnected" },
    { id: "bms-1", name: "Honeywell Forge", category: "Building Management", status: "connected" },
    { id: "pay-1", name: "Stripe", category: "Payment Gateway", status: "error" },
    { id: "mtr-1", name: "Siemens SmartMeters", category: "Utility Meters", status: "connected" },
    { id: "iot-1", name: "Verdant", category: "Smart Thermostats", status: "disconnected" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Integrations Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectors.map((connector) => (
          <Sheet key={connector.id}>
            <SheetTrigger asChild>
                <div>
                    <ConnectorCard {...connector} />
                </div>
            </SheetTrigger>
            <SheetContent className="bg-background border-l border-white/10">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
                <SheetHeader>
                    <SheetTitle>Configure {connector.name}</SheetTitle>
                    <SheetDescription>
                        Manage settings and credentials for the {connector.category} integration.
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 my-6">
                    <div>
                        <Label htmlFor="api-key">API Key</Label>
                        <Input id="api-key" type="password" defaultValue="••••••••••••••••" className="vx-focus" />
                    </div>
                    <div>
                        <Label htmlFor="api-secret">API Secret</Label>
                        <Input id="api-secret" type="password" defaultValue="••••••••••••••••" className="vx-focus" />
                    </div>
                    <Button className="w-full vx-cta vx-focus">Save & Test Connection</Button>
                </div>
                <div className="mt-8">
                    <h3 className="font-semibold mb-2">Event Log</h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>[2024-08-01 10:00] Connection established.</p>
                        <p>[2024-07-31 09:00] Configuration updated.</p>
                    </div>
                </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );
}
