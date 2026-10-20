"use client";

import { OrbitalLoader } from "@/components/orbital-loader";

export function PreviewOrbitalLoaderRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <OrbitalLoader autoplay size={compact ? 132 : 148} messages={["Uploading your files", "Checking for duplicates", "Making thumbnails"]} doneMessage="All 24 files uploaded" />
    </div>
  );
}

export function PreviewOrbitalLoaderEndless() {
  return (
    <div className="relative flex h-full min-h-[300px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <OrbitalLoader size={120} />
    </div>
  );
}
