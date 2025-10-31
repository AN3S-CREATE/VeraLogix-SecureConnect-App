"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import React from 'react';

type KpiStatus = "healthy" | "warning" | "critical";

interface KpiTileProps {
  title: string;
  value: string;
  status: KpiStatus;
  link?: string;
}

const statusConfig: Record<KpiStatus, { icon: React.ReactNode; className: string; glow: boolean }> = {
  healthy: { icon: <CheckCircle />, className: "chip-info", glow: true },
  warning: { icon: <AlertTriangle />, className: "text-yellow-400", glow: false },
  critical: { icon: <AlertTriangle />, className: "chip-alert", glow: false },
};

export function KpiTile({ title, value, status, link }: KpiTileProps) {
  const { icon, className, glow } = statusConfig[status];
  
  const cardGlowStyle = glow ? {
    boxShadow: '0 0 24px rgba(182,255,46,.45), 0 0 6px color-mix(in oklab,var(--neon-2) 35%, transparent) inset, 0 0 0 1px color-mix(in oklab, var(--g1) 50%, transparent) inset'
  } : {};

  const cardContent = (
    <>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{title}</h3>
        <span className={cn("px-2 py-1 text-xs rounded-full flex items-center gap-1", className)}>
          {icon}
        </span>
      </div>
      <p className="text-3xl font-bold text-gradient-primary my-2">{value}</p>
      {link ? (
        <span className="text-sm text-muted-foreground group-hover:text-primary flex items-center">
            View Details <ArrowRight className="ml-1 w-4 h-4" />
        </span>
      ) : (
         <span className="text-sm text-muted-foreground">&nbsp;</span>
      )}
    </>
  );

  if (link) {
    return (
        <Link href={link} className="vx-card p-4 flex flex-col justify-between h-36 group" style={cardGlowStyle}>
            {cardContent}
        </Link>
    );
  }

  return (
    <div className="vx-card p-4 flex flex-col justify-between h-36" style={cardGlowStyle}>
      {cardContent}
    </div>
  );
}