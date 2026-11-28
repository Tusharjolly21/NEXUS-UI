"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { KpiStrip } from "@/components/pulse-dashboard-kpis";

export function PreviewDashboardKpi() {
  return (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center p-6">
      <KpiStrip className="max-w-[960px]" />
    </div>
  );
}
