"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function TenEvPage() {
  const bays = [
    { id: 1, status: 'available' },
    { id: 2, status: 'charging' },
    { id: 3, status: 'unavailable' },
    { id: 4, status: 'available' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">EV Charging</h1>

      <div className="vx-card p-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold">Active Session: Bay 2</h2>
                <p className="text-muted-foreground">Tesla Model 3</p>
            </div>
            <Button variant="destructive" className="vx-focus">Stop Charging</Button>
        </div>
        <div className="mt-4 relative flex items-center justify-center w-48 h-48 mx-auto">
            <div className="absolute inset-0 rounded-full bg-muted"></div>
            <div className="absolute inset-2 rounded-full bg-background"></div>
            <div 
                className="absolute inset-0 rounded-full border-4 border-primary"
                style={{
                    boxShadow: '0 0 15px var(--neon-1)',
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 0% 75%)' // Example for 75% charged
                }}
            ></div>
            <div className="z-10 text-center">
                <p className="text-4xl font-bold text-gradient-primary">75%</p>
                <p className="text-sm text-muted-foreground">12.5 kWh delivered</p>
            </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Charging Bays</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bays.map(bay => (
            <div key={bay.id} className={`vx-card p-4 text-center space-y-2 ${bay.status !== 'available' ? 'opacity-50' : ''}`}>
              <Zap className={`mx-auto h-8 w-8 ${bay.status === 'charging' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              <p className="font-semibold">Bay {bay.id}</p>
              <p className={`text-sm capitalize ${bay.status === 'available' ? 'text-primary' : 'text-muted-foreground'}`}>{bay.status}</p>
              <Button size="sm" className="w-full vx-cta vx-focus" disabled={bay.status !== 'available'}>Reserve</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}