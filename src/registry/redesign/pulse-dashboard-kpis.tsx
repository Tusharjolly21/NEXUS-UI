"use client";

import { KpiStrip } from "@/components/pulse-dashboard-kpis";

export function PreviewPulseDashboardKpisRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <KpiStrip autoplay className={compact ? "max-w-[640px]" : "max-w-[900px]"} />
    </div>
  );
}
