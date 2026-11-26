"use client";

/**
 * Motion Kit previews (batch 34, the Halo set and more): Thinking Matrix, Border Beam, Coupon Apply, Dictation Card,
 * Shapeshift Hero, Burst Like, Halo Switch, Rim Card, Glow Dock and Sync Ring.
 * Each plays its own demo until the visitor touches it, so the previews only add a light stage around them.
 */

import type { ReactNode } from "react";
import { ThinkingMatrix } from "@/components/thinking-matrix";
import { BorderBeam } from "@/components/border-beam";
import { CouponApply } from "@/components/coupon-apply";
import { DictationCard } from "@/components/dictation-card";
import { ShapeshiftHero } from "@/components/shapeshift-hero";
import { BurstLike } from "@/components/burst-like";
import { HaloSwitch } from "@/components/halo-switch";
import { RimCard } from "@/components/rim-card";
import { GlowDock } from "@/components/glow-dock";
import { SyncRing } from "@/components/sync-ring";

function Stage({ compact, width = 420, children }: { compact: boolean; width?: number; children: ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 dark:bg-black sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full [&>div]:mx-auto" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewThinkingMatrix({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <div className="flex justify-center"><ThinkingMatrix pattern="spiral" /></div>
    </Stage>
  );
}

export function PreviewBorderBeam({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={760}>
      <BorderBeam />
    </Stage>
  );
}

export function PreviewCouponApply({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <CouponApply autoplay />
    </Stage>
  );
}

export function PreviewDictationCard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <DictationCard autoplay />
    </Stage>
  );
}

export function PreviewShapeshiftHero({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={900}>
      <ShapeshiftHero autoplay />
    </Stage>
  );
}

export function PreviewBurstLike({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <BurstLike autoplay />
    </Stage>
  );
}

export function PreviewHaloSwitch({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <HaloSwitch autoplay />
    </Stage>
  );
}

export function PreviewRimCard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <RimCard autoplay />
    </Stage>
  );
}

export function PreviewGlowDock({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <GlowDock autoplay />
    </Stage>
  );
}

export function PreviewSyncRing({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <SyncRing autoplay />
    </Stage>
  );
}
