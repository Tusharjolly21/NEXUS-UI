"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useProAccess } from "@/components/pro/pro-access";

/**
 * Stands in for a Pro icon's code or sound when the visitor does not have Pro. The lines behind it are a
 * placeholder pattern, not the real file: the real code is never sent to the browser. The icon above stays
 * fully playable, so the visitor sees exactly what they would be unlocking.
 */
export function LockedCode({ name, what }: { name: string; what: "code" | "sound" }) {
  const { requestUpgrade } = useProAccess();
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#1c1c1e]">
      <div aria-hidden className="select-none px-6 py-6 font-mono text-[13px] leading-[1.9] text-white/10">
        {[62, 38, 74, 0, 55, 81, 47, 66, 30, 72, 44].map((w, i) => (
          <div key={i} className="flex gap-4">
            <span className="w-4 text-right text-white/10">{i + 1}</span>
            <span className="h-[10px] self-center rounded-full bg-white/[0.09]" style={{ width: `${w}%`, opacity: w ? 1 : 0 }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-[#1c1c1e]/70 px-5 text-center backdrop-blur-[2px]">
        <div className="max-w-[420px]">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/10 text-white">
            <Lock className="size-5" strokeWidth={2.2} aria-hidden />
          </span>
          <p className="mt-4 text-[18px] font-semibold text-white">The {name} {what} is part of Pro</p>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/65">
            Preview and play it above, with its looks and its sound. Pro unlocks the {what === "code" ? "file to copy" : "score to play"} for every Pro icon.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => requestUpgrade(name, `icon ${what}`)}
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[15px] font-semibold text-[#1d1d1f] outline-none transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Unlock with Pro
            </button>
            <Link href="/pricing" className="inline-flex h-11 items-center rounded-full px-4 text-[15px] font-medium text-[#2997ff] hover:underline hover:underline-offset-4">
              See plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
