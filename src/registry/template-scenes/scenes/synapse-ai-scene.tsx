"use client";

import * as React from "react";

export function SceneSynapseAI() {
  return (
    <div className="flex h-full min-h-[420px] flex-col bg-white overflow-hidden rounded-3xl border border-gray-100">
      {/* Navbar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">Synapse</span>
        </div>
        <div className="flex items-center gap-5 text-[11px] text-gray-500">
          <span>Features</span>
          <span>Pricing</span>
          <span>Docs</span>
        </div>
        <button className="rounded-full bg-orange-500 px-3 py-1 text-[11px] font-semibold text-white">
          Get started
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-4 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10px] font-medium text-orange-600">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          Now in public beta
        </span>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
          Build AI agents<br />
          <span className="text-orange-500">without limits</span>
        </h1>
        <p className="max-w-xs text-[11px] leading-relaxed text-gray-500">
          Connect any model, tool, or data source. Deploy autonomous agents that work around the clock.
        </p>
        <div className="flex gap-2 pt-1">
          <button className="rounded-full bg-gray-900 px-4 py-1.5 text-[11px] font-semibold text-white">
            Start building →
          </button>
          <button className="rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-medium text-gray-600">
            View demo
          </button>
        </div>
      </div>

      {/* App Mockup */}
      <div className="mx-4 mb-4 flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-lg">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="ml-3 flex-1 rounded bg-white px-2 py-0.5 text-[9px] text-gray-400 border border-gray-200">
            app.synapse.ai/dashboard
          </span>
        </div>

        {/* App shell */}
        <div className="flex h-full bg-gray-50">
          {/* Sidebar */}
          <div className="w-28 shrink-0 border-r border-gray-100 bg-white px-2 py-3">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-orange-500">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-gray-800">Synapse</span>
            </div>
            <div className="space-y-0.5">
              {[
                { label: "Dashboard", active: true },
                { label: "Agents", active: false },
                { label: "Workflows", active: false },
                { label: "Integrations", active: false },
                { label: "Settings", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-md px-2 py-1 text-[9px] font-medium ${
                    item.active
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-500"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden p-3">
            {/* KPI strip */}
            <div className="mb-2 grid grid-cols-3 gap-2">
              {[
                { label: "Active Agents", value: "24" },
                { label: "Tasks/day", value: "1,284" },
                { label: "Uptime", value: "99.9%" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-gray-100 bg-white p-2">
                  <p className="text-[8px] text-gray-400">{kpi.label}</p>
                  <p className="text-sm font-bold text-gray-900">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Agent list */}
            <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
              <div className="border-b border-gray-50 px-3 py-1.5">
                <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Active Agents</span>
              </div>
              {[
                { name: "Data Processor", status: "Running", color: "bg-emerald-400" },
                { name: "Email Responder", status: "Idle", color: "bg-gray-300" },
                { name: "Report Builder", status: "Running", color: "bg-emerald-400" },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-50 last:border-0">
                  <span className={`h-1.5 w-1.5 rounded-full ${agent.color}`} />
                  <span className="flex-1 text-[9px] font-medium text-gray-700">{agent.name}</span>
                  <span className="text-[8px] text-gray-400">{agent.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
