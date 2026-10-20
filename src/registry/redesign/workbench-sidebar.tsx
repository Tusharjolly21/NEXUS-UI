"use client";

import { WorkbenchSidebar } from "@/components/workbench-sidebar";

const STATS = [
  { k: "Deploys", v: "128", d: "+12%" },
  { k: "Open issues", v: "23", d: "-4" },
  { k: "Build time", v: "41s", d: "-8s" },
];

export function PreviewWorkbenchSidebarRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[860px] flex-col items-center gap-3">
        <div className="@container flex w-full gap-2 rounded-[26px] bg-[#e8e8ed]/70 p-2 dark:bg-[#2c2c2e]/60" style={{ height: compact ? 420 : 440 }}>
          <WorkbenchSidebar autoplay />
          <div className="hidden min-w-0 flex-1 flex-col rounded-[22px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] @[520px]:flex">
            <p className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Northwind</p>
            <p className="mt-0.5 text-[22px] font-semibold tracking-[-0.03em]">Good morning, Ada</p>
            <div className="mt-4 grid grid-cols-1 gap-2 @[700px]:grid-cols-3">
              {STATS.map((c) => (
                <div key={c.k} className="rounded-[16px] bg-[#f5f5f7] p-3 dark:bg-[#2c2c2e]">
                  <p className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{c.k}</p>
                  <p className="text-[22px] font-semibold tabular-nums tracking-[-0.03em]">{c.v}</p>
                  <p className="text-[12px] font-medium text-[#248a3d] dark:text-[#30d158]">{c.d} this week</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex-1 rounded-[16px] bg-[#f5f5f7] dark:bg-[#2c2c2e]" />
          </div>
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Pick a row, type to filter, or fold it to a rail.</span>
      </div>
    </div>
  );
}
