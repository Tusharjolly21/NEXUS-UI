"use client";

/**
 * Motion Kit previews (batch 23): Pixel Atlas, Glass Recorder.
 * Both fill a positioned parent, so the stage is a relative box with a floor height.
 */

import { PixelAtlas } from "@/components/pixel-atlas";
import { GlassRecorder } from "@/components/glass-recorder";

export function PreviewPixelAtlas({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`relative h-full w-full bg-[#0a0d11] ${compact ? "min-h-[360px]" : "min-h-[520px]"}`}>
      <PixelAtlas height="fill" />
    </div>
  );
}

export function PreviewGlassRecorder({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`relative h-full w-full ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <GlassRecorder height="fill" listen="simulate" autoplay />
    </div>
  );
}
