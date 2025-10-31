
"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TenEvPage() {
  const bays = [
    { id: 1, status: 'available' },
    { id: 2, status: 'charging' },
    { id: 3, status: 'unavailable' },
    { id: 4, status: 'available' },
  ];

  const activeSession = true; // Set to false to see the other state

  const handleStopCharging = () => {
    console.log('sc.agent.ev.session_stopped', { bayId: 2, reason: 'user_request' });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">EV Charging</h1>

      {activeSession ? (
        <div className="vx-card p-6 border-neon-1/50 shadow-[0_0_24px_rgba(182,255,46,.45)]">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-xl font-bold">Active Session: Bay 2</h2>
                  <p className="text-muted-foreground">Tesla Model 3</p>
              </div>
              <Button variant="destructive" className="vx-focus" onClick={handleStopCharging}>Stop Charging</Button>
          </div>
          <div className="mt-4 relative flex items-center justify-center w-48 h-48 mx-auto">
              <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="stroke-muted" strokeWidth="5" fill="transparent" />
                  <circle 
                      cx="50" cy="50" r="45" 
                      className="stroke-primary" strokeWidth="5" fill="transparent"
                      strokeDasharray="282.74" // 2 * PI * 45
                      strokeDashoffset="70.685" // 282.74 * (1 - 0.75)
                      transform="rotate(-90 50 50)"
                      style={{
                          filter: 'drop-shadow(0 0 5px var(--neon-1))'
                      }}
                  />
              </svg>
              <div className="z-10 text-center">
                  <p className="text-4xl font-bold text-gradient-primary">75%</p>
                  <p className="text-sm text-muted-foreground">12.5 kWh delivered</p>
              </div>
          </div>
           <div className="mt-4 p-2 text-center text-sm rounded-md"
             style={{
                border: '1px solid var(--neon-3)',
                color: 'var(--neon-3)',
                backgroundColor: 'color-mix(in lch, var(--neon-3) 20%, transparent)'
            }}
           >
                Charging will complete at 80%
           </div>
        </div>
      ) : (
         <div className="vx-card p-6 text-center">
            <h2 className="text-xl font-bold">No Active Session</h2>
            <p className="text-muted-foreground">Reserve a bay below to start charging.</p>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Charging Bays</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bays.map(bay => {
            const isAvailable = bay.status === 'available';
            return (
              <div 
                key={bay.id} 
                className={cn(
                    "vx-card p-4 text-center space-y-2", 
                    !isAvailable && "opacity-50",
                    isAvailable && "border-neon-1/50"
                )}
                style={isAvailable ? {
                    boxShadow: '0 0 24px rgba(182,255,46,.45), 0 0 6px color-mix(in oklab,var(--neon-1) 35%, transparent) inset'
                } : {}}
              >
                <Zap className={cn("mx-auto h-8 w-8", bay.status === 'charging' ? 'text-primary animate-pulse' : 'text-muted-foreground')} />
                <p className="font-semibold">Bay {bay.id}</p>
                <p className={cn("text-sm capitalize", isAvailable ? 'delta-positive' : 'text-muted-foreground')}>{bay.status}</p>
                <Button size="sm" className="w-full vx-cta vx-focus" disabled={!isAvailable}>Reserve</Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
