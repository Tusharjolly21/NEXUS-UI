"use client";

import { useRef } from "react";
import { FloatGlassNavbar } from "@/components/float-glass-navbar";

const CARDS = [
  { t: "Motion", c: "linear-gradient(135deg,#5ac8fa,#0071e3)" },
  { t: "Glass", c: "linear-gradient(135deg,#ffd60a,#ff9f0a)" },
  { t: "Type", c: "linear-gradient(135deg,#bf5af2,#5e5ce6)" },
  { t: "Color", c: "linear-gradient(135deg,#30d158,#0b8f6a)" },
  { t: "Depth", c: "linear-gradient(135deg,#ff6482,#ff3b30)" },
  { t: "Sound", c: "linear-gradient(135deg,#64d2ff,#5856d6)" },
];

export function PreviewFloatGlassNavbarRedesign({ compact = false }: { compact?: boolean } = {}) {
  const page = useRef<HTMLDivElement>(null);
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-4 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[960px] flex-col items-center gap-3">
        <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f5f5f7] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-black dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
          <div ref={page} className="relative overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ height: compact ? 360 : 400 }}>
            <FloatGlassNavbar scrollContainerRef={page} onNavigate={() => {}} autoplay />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[260px]" aria-hidden style={{ background: "radial-gradient(60% 80% at 30% 0%, rgba(90,200,250,.35), transparent 70%), radial-gradient(50% 70% at 80% 10%, rgba(191,90,242,.25), transparent 70%)" }} />
            <section className="relative px-6 pb-8 pt-12 text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0071e3] dark:text-[#0a84ff]">New in 2.0</p>
              <h2 className="mx-auto mt-2 max-w-[440px] text-[32px] font-semibold leading-[1.05] tracking-[-0.04em]">Interfaces that feel alive.</h2>
              <p className="mx-auto mt-3 max-w-[380px] text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">Scroll this page and the bar tucks itself into a compact pill.</p>
            </section>
            <div className="relative grid grid-cols-2 gap-3 px-6 pb-8 sm:grid-cols-3">
              {CARDS.map((c) => (
                <div key={c.t} className="rounded-[20px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                  <div className="h-20 rounded-[14px]" style={{ background: c.c }} />
                  <p className="mt-2 text-[13px] font-semibold tracking-[-0.01em]">{c.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Point along the links, then scroll the page.</span>
      </div>
    </div>
  );
}
