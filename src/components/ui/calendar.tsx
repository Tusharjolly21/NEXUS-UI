"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  mode?: "single";
  selected?: Date;
  className?: string;
}

export function Calendar({ mode: _mode, selected, className }: CalendarProps) {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const cells = Array.from({ length: 35 }, (_, i) => {
    const n = i - 2; // offset for month start
    const d = new Date(2022, 4, n);
    const isSelected = selected && d.toDateString() === selected.toDateString();
    const isToday = new Date().toDateString() === d.toDateString();
    return { n, isSelected, isToday, valid: n >= 1 && n <= 31 };
  });

  return (
    <div className={cn("rounded-xl border border-white/[0.07] bg-white/[0.02] p-4", className)}>
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60">May 2022</span>
        <div className="flex gap-1">
          <div className="size-4 rounded bg-white/5" />
          <div className="size-4 rounded bg-white/5" />
        </div>
      </div>

      {/* day labels */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {days.map((d) => (
          <div key={d} className="flex items-center justify-center text-[7px] text-white/25">{d}</div>
        ))}
      </div>

      {/* cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              "flex aspect-square items-center justify-center rounded-sm text-[8px]",
              c.valid
                ? c.isSelected
                  ? "bg-cyan-500/30 text-cyan-200 font-medium"
                  : c.isToday
                  ? "text-white/60"
                  : "text-white/25"
                : "text-transparent",
            )}
          >
            {c.valid ? c.n : ""}
          </div>
        ))}
      </div>
    </div>
  );
}