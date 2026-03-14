
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plug, PlugZap, XCircle } from "lucide-react";
import React from 'react';

type ConnectorStatus = "connected" | "disconnected" | "error";

interface ConnectorCardProps {
  name: string;
  category: string;
  status: ConnectorStatus;
}

const statusConfig: Record<ConnectorStatus, { label: string; icon: React.ReactNode; className: string; glow: boolean }> = {
  connected: { label: "Connected", icon: <PlugZap />, className: "chip-info", glow: true },
  disconnected: { label: "Disconnected", icon: <Plug />, className: "text-muted-foreground", glow: false },
  error: { label: "Error", icon: <XCircle />, className: "chip-alert", glow: false },
};

export const ConnectorCard = React.forwardRef<HTMLDivElement, ConnectorCardProps>(({ name, category, status }, ref) => {
  const { label, icon, className, glow } = statusConfig[status];
  
  const cardGlowStyle = glow ? {
    boxShadow: '0 0 24px rgba(182,255,46,.45), 0 0 6px color-mix(in oklab,var(--neon-2) 35%, transparent) inset, 0 0 0 1px color-mix(in oklab, var(--g1) 50%, transparent) inset'
  } : {};

  return (
    <div ref={ref} className="vx-card p-4 flex flex-col justify-between h-48 cursor-pointer group vx-focus" style={cardGlowStyle} tabIndex={0} role="button" aria-label={`Configure ${name}`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg pr-2">{name}</h3>
          <span className={cn("px-2 py-1 text-xs rounded-full flex items-center gap-1", className)}>
            {icon} {label}
          </span>
        </div>
        <p className="text-sm mt-1 text-muted-foreground">{category}</p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" variant="outline" className="w-full vx-focus" onClick={(e) => e.stopPropagation()}>
            Configure
        </Button>
      </div>
    </div>
  );
});

ConnectorCard.displayName = "ConnectorCard";
