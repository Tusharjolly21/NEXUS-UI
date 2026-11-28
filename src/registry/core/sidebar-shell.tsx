"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { WorkbenchSidebar } from "@/components/workbench-sidebar";
import { cn } from "@/lib/utils";

export function PreviewSidebarShell() {
  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center p-6">
      <div className="flex h-[672px] w-full max-w-[920px] gap-2 rounded-[28px] border border-zinc-200/80 bg-zinc-100 p-2 dark:border-white/10 dark:bg-zinc-900">
        <WorkbenchSidebar />
        <div className="min-w-0 flex-1 rounded-[22px] bg-white p-6 dark:bg-zinc-950">
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">Northwind · Overview</p>
          <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-zinc-950 dark:text-white">Good morning, Ada</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { k: "Deploys", v: "128", d: "+12%" },
              { k: "Open issues", v: "23", d: "-4" },
              { k: "Build time", v: "41s", d: "-8s" },
            ].map((c) => (
              <div key={c.k} className="rounded-2xl border border-zinc-200/80 p-4 dark:border-white/10">
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">{c.k}</p>
                <p className="mt-1 text-[24px] font-semibold tabular-nums tracking-[-0.03em] text-zinc-950 dark:text-white">{c.v}</p>
                <p className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">{c.d} this week</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl border border-zinc-200/80 p-4 dark:border-white/10">
            <p className="text-[13px] font-medium text-zinc-950 dark:text-white">Recent activity</p>
            <ul className="mt-3 space-y-3 text-[13px] text-zinc-600 dark:text-zinc-400">
              {[
                ["Mei merged", "Pricing page v3", "2m"],
                ["Tomás deployed", "api@1.18.0 to production", "18m"],
                ["Jonah opened", "Dark mode for charts", "1h"],
              ].map(([who, what, when]) => (
                <li key={what} className="flex items-center justify-between gap-3">
                  <span className="truncate"><span className="font-medium text-zinc-950 dark:text-white">{who}</span> {what}</span>
                  <span className="shrink-0 tabular-nums text-zinc-400">{when}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 rounded-2xl border border-zinc-200/80 p-4 dark:border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-zinc-950 dark:text-white">Deploys per day</p>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Last 14 days</p>
            </div>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {[34, 52, 41, 66, 48, 72, 58, 44, 80, 62, 75, 54, 88, 70].map((v, i) => (
                <span
                  key={i}
                  className={cn("flex-1 rounded-t-[4px]", i === 12 ? "bg-indigo-500" : "bg-zinc-200 dark:bg-white/10")}
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
