"use client";

/**
 * Motion Kit previews (batch e): fan deck, receipt unfold, page curl, sign & seal,
 * streak counter and capsule toggles. Each component demonstrates itself through
 * its `autoplay` mode, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { FanDeck } from "@/components/fan-deck";
import { ReceiptUnfold } from "@/components/receipt-unfold";
import { PageCurl } from "@/components/page-curl";
import { SignAndSeal } from "@/components/sign-and-seal";
import { StreakCounter } from "@/components/streak-counter";
import { CapsuleToggles } from "@/components/capsule-toggles";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewFanDeck({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <FanDeck autoplay />
    </Stage>
  );
}

export function PreviewReceiptUnfold({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ReceiptUnfold autoplay />
    </Stage>
  );
}

export function PreviewPageCurl({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <PageCurl autoplay />
    </Stage>
  );
}

export function PreviewSignAndSeal({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SignAndSeal autoplay />
    </Stage>
  );
}

export function PreviewStreakCounter({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <StreakCounter autoplay />
    </Stage>
  );
}

export function PreviewCapsuleToggles({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <CapsuleToggles autoplay />
    </Stage>
  );
}
