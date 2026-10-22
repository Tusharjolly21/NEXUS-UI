"use client";

/**
 * Previews for the essentials variants that live inside existing component pages: the magnetic button (Glow Button),
 * the lit border (Glowing Effect Cards), marker annotations (Hover Highlight Text), the zoom lens (Glass Lens) and
 * the cursor card (Link Preview). Each demonstrates itself with `autoplay` until someone takes over.
 */

import { useState, type ReactNode } from "react";
import { MagneticButton } from "@/components/glow-button";
import { LightGroup, LitBorder } from "@/components/glowing-effect-cards";
import { MarkerAnnotations } from "@/components/hover-highlight-text";
import { ZoomLens } from "@/components/glass-lens";
import { CursorCard } from "@/components/link-preview";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>{children}</div>;
}

export function PreviewMagneticButton({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  const [n, setN] = useState(0);
  return (
    <Stage className="min-h-[320px]">
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center">
          <MagneticButton autoplay onClick={() => setN((k) => k + 1)} />
          <MagneticButton variant="outline" strength={0.25}>
            Talk to sales
          </MagneticButton>
        </div>
        <p className="m-0 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]" role="status">
          {n ? `Pressed ${n} time${n > 1 ? "s" : ""}` : "Move toward a button, then in and out of it"}
        </p>
      </div>
    </Stage>
  );
}

const PLANS = [
  { name: "Starter", price: "$0", blurb: "For side projects and trying things out.", hot: false },
  { name: "Studio", price: "$19", blurb: "For solo makers who ship every week.", hot: true },
  { name: "Scale", price: "$49", blurb: "Shared tokens and seats for five people.", hot: false },
];

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

export function PreviewLitBorder({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[420px]">
      <LightGroup autoplay className="flex w-full max-w-[720px] flex-col gap-3 p-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLANS.map((c) => (
            <LitBorder key={c.name} className="h-full">
              <div className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{c.name}</span>
                  {c.hot && <span className="rounded-full bg-[#eef5ff] px-2 py-0.5 text-[11px] font-semibold text-[#0062c4] dark:bg-[#0a84ff]/20 dark:text-[#64b5ff]">Popular</span>}
                </div>
                <div className="mt-3 text-[32px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {c.price}
                  <span className="text-[14px] font-normal text-[#6e6e73] dark:text-[#a1a1a6]"> /month</span>
                </div>
                <p className="m-0 mt-1 flex-1 text-[13.5px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]">{c.blurb}</p>
                <button
                  type="button"
                  className={`mt-4 h-10 rounded-full text-[14px] font-medium ${FOCUS} ${c.hot ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"}`}
                >
                  Choose {c.name}
                </button>
              </div>
            </LitBorder>
          ))}
        </div>
        <LitBorder radius={999}>
          <label className="flex h-12 items-center gap-2.5 rounded-full px-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-[#6e6e73] dark:text-[#a1a1a6]" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              placeholder="Search plans"
              aria-label="Search plans"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#6e6e73] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93]"
            />
          </label>
        </LitBorder>
      </LightGroup>
    </Stage>
  );
}

export function PreviewMarkerAnnotations({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[380px]">
      <MarkerAnnotations autoplay />
    </Stage>
  );
}

export function PreviewZoomLens({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[440px]">
      <ZoomLens autoplay />
    </Stage>
  );
}

export function PreviewCursorCard({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[520px]">
      <CursorCard autoplay />
    </Stage>
  );
}
