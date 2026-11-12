"use client";

/**
 * Motion Kit previews (batch 27): LED Button, Glass Compare, Silk Print, Glyph Rain, Airmail Globe, Sand Drift Gallery,
 * Diffusion Loader, Warp CTA, Print Styles, Inspect Text, Soap Bubble, Ink Drop Picker, Tear-off Coupon and Breadcrumb
 * Branch. Each card plays its own demo until the visitor touches it, so the preview only adds a light stage around it.
 */

import type { ReactNode } from "react";
import { LEDButton } from "@/components/led-button";
import { GlassCompare } from "@/components/glass-compare";
import { SilkPrint } from "@/components/silk-print";
import { GlyphRain } from "@/components/glyph-rain";
import { AirmailGlobe } from "@/components/airmail-globe";
import { SandDriftGallery } from "@/components/sand-drift-gallery";
import { DiffusionLoader } from "@/components/diffusion-loader";
import { WarpCTA } from "@/components/warp-cta";
import { PrintStyles } from "@/components/print-styles";
import { InspectText } from "@/components/inspect-text";
import { SoapBubble } from "@/components/soap-bubble";
import { InkDropPicker } from "@/components/ink-drop-picker";
import { TearOffCoupon } from "@/components/tear-off-coupon";
import { BreadcrumbBranch } from "@/components/breadcrumb-branch";

function Stage({ compact, width = 380, children }: { compact: boolean; width?: number; children: ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full [&>div]:mx-auto" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewLEDButton({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <LEDButton autoplay />
    </Stage>
  );
}

export function PreviewGlassCompare({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={520}>
      <GlassCompare autoplay />
    </Stage>
  );
}

export function PreviewSilkPrint({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <SilkPrint autoplay />
    </Stage>
  );
}

export function PreviewGlyphRain({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={880}>
      <GlyphRain autoplay />
    </Stage>
  );
}

export function PreviewAirmailGlobe({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <AirmailGlobe autoplay />
    </Stage>
  );
}

export function PreviewSandDriftGallery({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={900}>
      <SandDriftGallery autoplay />
    </Stage>
  );
}

export function PreviewDiffusionLoader({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <DiffusionLoader autoplay />
    </Stage>
  );
}

export function PreviewWarpCTA({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <WarpCTA autoplay />
    </Stage>
  );
}

export function PreviewPrintStyles({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <PrintStyles autoplay />
    </Stage>
  );
}

export function PreviewInspectText({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={520}>
      <InspectText autoplay />
    </Stage>
  );
}

export function PreviewSoapBubble({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <SoapBubble autoplay />
    </Stage>
  );
}

export function PreviewInkDropPicker({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={340}>
      <InkDropPicker autoplay />
    </Stage>
  );
}

export function PreviewTearOffCoupon({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={380}>
      <TearOffCoupon autoplay />
    </Stage>
  );
}

export function PreviewBreadcrumbBranch({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={900}>
      <BreadcrumbBranch autoplay />
    </Stage>
  );
}
