"use client";

import * as React from "react";

export function SceneHelixAI() {
  return (
    <div className="flex h-full min-h-[420px] flex-col bg-white overflow-hidden rounded-3xl border border-gray-100">
      {/* Navbar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded bg-gray-950">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 4.5V7.5L6 11L1 7.5V4.5L6 1Z" fill="white" />
              <path d="M6 4L9 5.75V8.25L6 10L3 8.25V5.75L6 4Z" fill="black" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-950">Helix</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] text-gray-400">
          <span>Features</span>
          <span>Product</span>
          <span>Pricing</span>
        </div>
        <button className="rounded-full bg-gray-950 px-3 py-1 text-[11px] font-semibold text-white">
          Start free trial
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-start gap-2.5 px-6 pt-7 pb-3">
        <h1 className="text-[22px] font-black leading-tight tracking-tight text-gray-950">
          AI agents that act.<br />
          <span className="text-gray-400">Humans who decide.</span>
        </h1>
        <p className="max-w-xs text-[11px] leading-relaxed text-gray-500">
          Deploy AI agents that plan, act through your tools, and report outcomes — without changing how your teams work.
        </p>
        <div className="flex items-center gap-3 pt-0.5">
          <button className="rounded-full bg-gray-950 px-4 py-1.5 text-[11px] font-semibold text-white">
            Start free trial →
          </button>
          <button className="text-[11px] font-medium text-gray-500">
            View demos
          </button>
        </div>
      </div>

      {/* Product Mockup */}
      <div className="mx-4 mb-4 flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-md">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="ml-3 flex-1 rounded bg-white px-2 py-0.5 text-[9px] text-gray-400 border border-gray-200">
            app.helix.ai/workspace
          </span>
        </div>

        {/* Task tracker */}
        <div className="flex h-full bg-white">
          {/* Dark sidebar */}
          <div className="w-32 shrink-0 border-r border-gray-100 bg-gray-950 px-2 py-3">
            <div className="mb-3 flex items-center gap-1.5 px-2">
              <div className="flex size-5 items-center justify-center rounded bg-white/10">
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L11 4.5V7.5L6 11L1 7.5V4.5L6 1Z" fill="white" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-white">Helix</span>
            </div>
            {[
              { label: "Marketing Ops", active: true },
              { label: "Revenue Ops", active: false },
              { label: "Support Ops", active: false },
              { label: "Finance Ops", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${item.active ? "bg-white/10" : ""}`}
              >
                <span className={`size-1.5 rounded-full ${item.active ? "bg-emerald-400" : "bg-gray-700"}`} />
                <span className={`text-[9px] font-medium leading-tight ${item.active ? "text-white" : "text-gray-600"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/50 px-4 py-2">
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Task</span>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
            </div>
            {[
              { title: "Sync and enrich lead records", status: "done",    dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
              { title: "Generate Q4 performance report", status: "done",  dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
              { title: "Run outreach personalisation",   status: "running",dot: "bg-sky-500",     badge: "bg-sky-50 text-sky-600 border-sky-100" },
              { title: "Review and approve copy",        status: "pending",dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-600 border-amber-100" },
              { title: "Publish assets to channels",     status: "queued", dot: "bg-gray-300",    badge: "bg-gray-50 text-gray-400 border-gray-100" },
            ].map((task) => (
              <div key={task.title} className="flex items-center justify-between border-b border-gray-50 px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`size-1.5 shrink-0 rounded-full ${task.dot}`} />
                  <span className={`truncate text-[9px] font-medium ${task.status === "queued" ? "text-gray-300" : "text-gray-700"}`}>
                    {task.title}
                  </span>
                </div>
                <span className={`ml-2 shrink-0 rounded-full border px-1.5 py-0.5 text-[7px] font-semibold capitalize ${task.badge}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
