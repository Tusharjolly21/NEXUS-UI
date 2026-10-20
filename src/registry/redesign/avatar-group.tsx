"use client";

import { AvatarGroup, type AvatarData } from "@/components/avatar-group";

const TEAM: AvatarData[] = [
  { fallback: "AK", tooltip: "Aiko Kimura" },
  { fallback: "MR", tooltip: "Mateo Ruiz" },
  { fallback: "SN", tooltip: "Sofia Novak" },
  { fallback: "JO", tooltip: "James Okafor" },
  { fallback: "LP", tooltip: "Lena Park" },
  { fallback: "DV", tooltip: "Dev Varma" },
  { fallback: "EB", tooltip: "Elsa Berg" },
  { fallback: "TN", tooltip: "Tomas Nunez" },
];

export function PreviewAvatarGroupRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex flex-col items-center gap-5 rounded-[24px] bg-white px-7 pb-6 pt-14 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
        <AvatarGroup avatars={TEAM} size={compact ? 40 : 48} overlap={compact ? 12 : 14} max={6} autoplay />
        <div className="text-center">
          <p className="text-[15px] font-semibold tracking-[-0.01em]">Design team</p>
          <p className="text-[12px] text-[#86868b] dark:text-[#98989d]">Point along the stack. Tap +2 for the rest.</p>
        </div>
      </div>
    </div>
  );
}
