"use client";

import * as React from "react";

export function SceneOrionAI() {
  return (
    <div className="flex h-full min-h-[420px] flex-col bg-white overflow-hidden rounded-3xl border border-gray-100">
      {/* Navbar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-2">
          {/* 4-circle grid logo in indigo */}
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="4" cy="4" r="2.5" fill="white" fillOpacity="0.9" />
              <circle cx="10" cy="4" r="2.5" fill="white" fillOpacity="0.6" />
              <circle cx="4" cy="10" r="2.5" fill="white" fillOpacity="0.6" />
              <circle cx="10" cy="10" r="2.5" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">Orion</span>
        </div>
        <div className="flex items-center gap-5 text-[11px] text-gray-500">
          <span>Product</span>
          <span>Security</span>
          <span>Pricing</span>
        </div>
        <button className="rounded-full bg-gray-900 px-3 py-1 text-[11px] font-semibold text-white">
          Get early access
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-start gap-3 px-8 pt-8 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-600">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Enterprise-ready · SOC 2 Type II
        </span>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
          Agents that execute.<br />
          <span className="text-indigo-600">Teams that govern.</span>
        </h1>
        <p className="max-w-xs text-[11px] leading-relaxed text-gray-500">
          Automate multi-step enterprise workflows with AI agents that know when to act and when to ask.
        </p>
        <div className="flex gap-2 pt-1">
          <button className="rounded-full bg-indigo-600 px-4 py-1.5 text-[11px] font-semibold text-white">
            Book a demo →
          </button>
          <button className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-600">
            See it in action
          </button>
        </div>
      </div>

      {/* Kanban Mockup */}
      <div className="mx-4 mb-4 flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-lg">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="ml-3 flex-1 rounded bg-white px-2 py-0.5 text-[9px] text-gray-400 border border-gray-200">
            app.orion.ai/workflows
          </span>
        </div>

        {/* App shell */}
        <div className="flex h-full bg-gray-50">
          {/* Sidebar */}
          <div className="w-24 shrink-0 border-r border-gray-100 bg-gray-950 px-2 py-3">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600">
                <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                  <circle cx="4" cy="4" r="2.5" fill="white" fillOpacity="0.9" />
                  <circle cx="10" cy="4" r="2.5" fill="white" fillOpacity="0.6" />
                  <circle cx="4" cy="10" r="2.5" fill="white" fillOpacity="0.6" />
                  <circle cx="10" cy="10" r="2.5" fill="white" fillOpacity="0.9" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-white">Orion</span>
            </div>
            <div className="space-y-0.5">
              {[
                { label: "Workflows", active: true },
                { label: "Agents", active: false },
                { label: "Approvals", active: false },
                { label: "Audit Log", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-md px-2 py-1 text-[9px] font-medium ${
                    item.active
                      ? "bg-indigo-600/20 text-indigo-400"
                      : "text-gray-500"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Kanban board */}
          <div className="flex flex-1 gap-2 overflow-hidden p-2">
            {[
              {
                label: "Queued",
                color: "bg-gray-200",
                textColor: "text-gray-600",
                cards: [
                  { title: "Q4 Report Draft", tag: "Finance", progress: 0 },
                  { title: "User Sync Batch", tag: "Data", progress: 0 },
                ],
              },
              {
                label: "Running",
                color: "bg-blue-200",
                textColor: "text-blue-700",
                cards: [
                  { title: "Lead Enrichment", tag: "Sales", progress: 65 },
                ],
              },
              {
                label: "Approval",
                color: "bg-yellow-200",
                textColor: "text-yellow-700",
                cards: [
                  { title: "Contract Review", tag: "Legal", progress: 90 },
                ],
              },
              {
                label: "Done",
                color: "bg-emerald-200",
                textColor: "text-emerald-700",
                cards: [
                  { title: "Email Campaign", tag: "Marketing", progress: 100 },
                ],
              },
            ].map((col) => (
              <div key={col.label} className="flex w-1/4 flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-[8px] font-semibold ${col.color} ${col.textColor}`}>
                    {col.label}
                  </span>
                </div>
                {col.cards.map((card) => (
                  <div key={card.title} className="rounded-lg border border-gray-100 bg-white p-2 shadow-sm">
                    <p className="text-[9px] font-semibold text-gray-800 leading-snug mb-1">{card.title}</p>
                    <span className="inline-block rounded bg-indigo-50 px-1 py-0.5 text-[7px] font-medium text-indigo-600 mb-1.5">
                      {card.tag}
                    </span>
                    {card.progress > 0 && (
                      <div className="h-0.5 rounded-full bg-gray-100">
                        <div
                          className="h-0.5 rounded-full bg-indigo-500"
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
