"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { SpectraFrame } from "@/components/spectra-frame/spectra-frame";

export function PreviewSpectraFrame({ compact = false }: { compact?: boolean } = {}) {
  return (
    <SpectraFrame
      imageCount={14}
      gap={compact ? 6 : 10}
      aspectRatio="4/3"
      transitionSpeed={550}
      scaleAmount={1.04}
      backgroundColor="#0d0d14"
      grayscaleIntensity={100}
      borderRadius={14}
      cellMinHeight={compact ? 100 : 140}
      hoveredMinHeight={compact ? 150 : 200}
    />
  );
}
