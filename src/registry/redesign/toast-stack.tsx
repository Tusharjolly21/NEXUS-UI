"use client";

import { useEffect, useRef } from "react";
import { ToastStack, useToastStack, type ToastItem } from "@/components/toast-stack";

const FEED: Omit<ToastItem, "id">[] = [
  { type: "success", title: "Invoice sent", description: "billing@lumenlabs.co will get it shortly." },
  { type: "info", title: "Draft saved", description: "Last edit 2 seconds ago.", action: { label: "Undo" } },
  { type: "error", title: "Payment declined", description: "Try another card.", action: { label: "Retry" } },
  { type: "warning", title: "Storage almost full", description: "92% of 200 GB used." },
  { type: "success", title: "Deployed to production", description: "Build 4182 is live in 41s." },
];

export function PreviewToastStackRedesign({ compact = false }: { compact?: boolean } = {}) {
  const { toasts, push, dismiss } = useToastStack([
    { id: "a", ...FEED[0] },
    { id: "b", ...FEED[1] },
    { id: "c", ...FEED[2] },
  ]);
  const next = useRef(3);

  // Keep the pile topped up so the demo never runs dry.
  useEffect(() => {
    if (toasts.length >= 3) return;
    const t = window.setTimeout(() => {
      push(FEED[next.current % FEED.length]);
      next.current += 1;
    }, 900);
    return () => window.clearTimeout(t);
  }, [toasts.length, push]);

  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-4 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex h-[232px] w-full items-end justify-center">
        <ToastStack toasts={toasts} onDismiss={dismiss} onAction={(t) => dismiss(t.id)} width={compact ? 320 : 352} autoplay />
      </div>
      <p className="m-0 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Hover to fan out. Fling one away.</p>
    </div>
  );
}
