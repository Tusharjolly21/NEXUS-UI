"use client";

import * as React from "react";

export function SceneStartupLandingPage() {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl bg-black text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-[66%] bg-[radial-gradient(circle_at_50%_18%,rgba(116,147,142,.3),transparent_22%),linear-gradient(90deg,transparent,rgba(255,93,24,.35))]" />
        <div className="absolute right-[-26%] top-[23%] h-[42%] w-[78%] -skew-y-12">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute left-0 h-1.5 w-full rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,116,22,.95),rgba(255,214,92,.85),transparent)] blur-[1px]"
              style={{ top: `${i * 31}%` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,.86)_42%,rgba(0,0,0,.24)_70%,#000_100%)]" />
      </div>

      <div className="relative flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-1.5">
          <div className="relative h-3 w-6">
            <span className="absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full border border-white" />
            <span className="absolute left-[7px] top-1/2 size-2 -translate-y-1/2 rounded-full border border-white" />
            <span className="absolute left-[14px] top-1/2 size-2 -translate-y-1/2 rounded-full border border-white" />
          </div>
          <span className="text-[10px] font-semibold">aureon</span>
        </div>
        <div className="hidden items-center gap-4 text-[8px] text-white/45 sm:flex">
          <span>Home</span>
          <span>About</span>
          <span>Pricing</span>
          <span>Contact</span>
        </div>
        <button className="rounded-full bg-white px-3 py-1 text-[8px] font-semibold text-black">
          Get Started
        </button>
      </div>

      <div className="relative flex flex-1 flex-col justify-between px-6 pb-5 pt-10">
        <div>
          <h1 className="max-w-[250px] text-[26px] font-normal leading-[0.96] tracking-[-0.05em]">
            Investment decisions guided by intelligence
          </h1>
          <button className="mt-5 rounded-full bg-white px-3 py-1.5 text-[8px] font-semibold text-black">
            Get Started
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_120px] sm:items-end">
          <p className="max-w-[270px] text-[8px] leading-relaxed text-white/45">
            Connect your portfolio and unlock AI-powered analysis. Get real-time
            insights, risk assessments, and strategic guidance tailored to your goals.
          </p>
          <p className="hidden text-[8px] leading-relaxed text-white/55 sm:block">
            Meet Nova, your AI investment advisor
          </p>
        </div>
      </div>
    </div>
  );
}
