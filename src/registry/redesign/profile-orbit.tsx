"use client";

import { ProfileOrbit } from "@/components/profile-orbit";

export function PreviewProfileOrbitRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <ProfileOrbit autoplay hint={compact ? "" : undefined} />
    </div>
  );
}
