"use client";

import * as React from "react";
import { ToastStack, useToastStack, type ToastItem } from "@/components/toast-stack";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";

const FEED: Omit<ToastItem, "id">[] = [
  { type: "error", title: "Payment declined", description: "Try another card.", action: { label: "Retry" } },
  { type: "success", title: "Invoice sent", description: "acme@studio.co will get it shortly." },
  { type: "info", title: "Draft saved", description: "Last edit 2 seconds ago.", action: { label: "Undo" } },
  { type: "success", title: "Deployed to production", description: "nexus-ui.com · 41s" },
];

// The front toast is pinned at 58% of the box height; the stack fans out upwards.
const SCRIPT: DemoStep[] = [
  { x: 0.5, y: 0.4, ms: 800, wait: 1300 },
  { x: 0.42, y: 0.58, ms: 450, wait: 250, action: "down" },
  { x: 0.95, y: 0.6, ms: 420, wait: 120, action: "up" },
  { x: 0.6, y: 0.97, ms: 600, wait: 400 },
];

export function PreviewToastStack({ compact = true }: { compact?: boolean } = {}) {
  void compact;
  const { toasts, push, dismiss } = useToastStack([
    { id: "a", ...FEED[1] },
    { id: "b", ...FEED[2] },
    { id: "c", ...FEED[0] },
  ]);
  const next = React.useRef(3);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      if (toasts.length >= 3) return;
      push(FEED[next.current % FEED.length]);
      next.current += 1;
    }, 1500);
    return () => window.clearInterval(timer);
  }, [toasts.length, push]);

  return (
    <div className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6">
      <div className="absolute bottom-[42%] left-1/2 -translate-x-1/2 translate-y-[32px]">
        <ToastStack toasts={toasts} onDismiss={dismiss} onAction={(t) => dismiss(t.id)} width={340} />
      </div>
      <DemoCursor script={SCRIPT} />
    </div>
  );
}
