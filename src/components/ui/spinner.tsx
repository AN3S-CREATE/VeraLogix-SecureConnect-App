
"use client";

import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-8 h-8 border-4 border-transparent border-solid rounded-full vx-spinner animate-spin",
        className
      )}
      role="status"
      aria-label="Loading"
    ></div>
  );
}
