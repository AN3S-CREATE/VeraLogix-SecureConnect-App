
"use client";

import { Lock, Unlock, Wifi, WifiOff, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DoorHealth = "healthy" | "degraded" | "offline";

interface DoorCardProps {
  id: string;
  name: string;
  state: "locked" | "unlocked";
  health: DoorHealth;
  busy?: boolean;
  onUnlock?: (id: string) => void;
  onLock?: (id: string) => void;
}

const healthConfig: Record<DoorHealth, { label: string; icon: React.ReactNode; className: string }> = {
  healthy: { label: "Healthy", icon: <Wifi />, className: "chip-info" },
  degraded: { label: "Degraded", icon: <AlertTriangle />, className: "chip-alert" },
  offline: { label: "Offline", icon: <WifiOff />, className: "chip-alert" },
};

export function DoorCard({ id, name, state, health, busy, onUnlock, onLock }: DoorCardProps) {
  const isLocked = state === "locked";
  const { label, icon, className } = healthConfig[health];

  const cardGlowStyle = health === 'healthy' ? {
    boxShadow: '0 0 24px rgba(182,255,46,.45), 0 0 6px color-mix(in oklab,var(--neon-2) 35%, transparent) inset, 0 0 0 1px color-mix(in oklab, var(--g1) 50%, transparent) inset'
  } : {};

  return (
    <div className="vx-card p-4 flex flex-col justify-between h-48" style={health === 'healthy' ? cardGlowStyle : {}}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg pr-2">{name}</h3>
          <span className={cn("px-2 py-1 text-xs rounded-full flex items-center gap-1", className)}>
            {icon} {label}
          </span>
        </div>
        <p className={`text-sm mt-1 flex items-center gap-2 ${isLocked ? 'text-muted-foreground' : 'delta-positive'}`}>
            {isLocked ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
            {isLocked ? "Locked" : "Unlocked"}
        </p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          size="sm"
          variant="outline"
          className="w-full vx-focus"
          disabled={!isLocked || busy || health === 'offline'}
          onClick={() => onUnlock?.(id)}
        >
          {busy && isLocked ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full vx-focus"
          disabled={isLocked || busy || health === 'offline'}
          onClick={() => onLock?.(id)}
        >
          {busy && !isLocked ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lock"}
        </Button>
      </div>
    </div>
  );
}
