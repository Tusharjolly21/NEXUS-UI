"use client";

/**
 * Motion Kit previews: interaction studies brought over from the Motion Kit design.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { OtpInput } from "@/components/otp-input";
import { RadioCards } from "@/components/radio-cards";
import { HoldToConfirm } from "@/components/hold-to-confirm";
import { BeforeAfter } from "@/components/before-after";
import { PriceOdometer } from "@/components/price-odometer";
import { PasswordStrength } from "@/components/password-strength";
import { TiltPass } from "@/components/tilt-pass";
import { AnimatedTabs } from "@/components/animated-tabs";
import { SharedElementCards } from "@/components/shared-element-cards";
import { RotatingHeadline } from "@/components/rotating-headline";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewOtpInput({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <div className="flex flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="m-0 text-[28px] font-semibold tracking-[-0.025em]">Enter the code</p>
          <p className="m-0 text-[15px] text-[#6e6e73] dark:text-[#a1a1a6]">We sent six digits to your phone.</p>
        </div>
        <OtpInput autoplay="482913" />
      </div>
    </Stage>
  );
}

export function PreviewRadioCards({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <RadioCards autoplay />
    </Stage>
  );
}

export function PreviewHoldToConfirm({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-[#ff3b30] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_24px_-12px_rgba(0,0,0,.2)] dark:bg-[#2c2c2e] dark:text-[#ff453a] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="m-0 text-[26px] font-semibold tracking-[-0.025em]">Delete this project?</p>
          <p className="m-0 max-w-[340px] text-[15px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]">Deployments and domains go with it. Hold the button so it can’t happen by accident.</p>
        </div>
        <HoldToConfirm autoplay />
      </div>
    </Stage>
  );
}

/** A small painted landscape; `graded` is the colour-corrected "after" shot. */
function Landscape({ graded }: { graded: boolean }) {
  return (
    <div className="absolute inset-0" style={{ filter: graded ? undefined : "grayscale(1) contrast(.78) brightness(1.08)" }}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#7fb3e8_0%,#b9d6f2_42%,#f6d9b8_70%,#f9c99a_80%)]" />
      <span className="absolute left-[12%] top-[18%] h-3.5 w-[70px] rounded-full bg-white/75" />
      <span className="absolute left-[20%] top-[24%] h-3.5 w-11 rounded-full bg-white/75" />
      <span className="absolute left-[70%] top-[14%] h-3.5 w-14 rounded-full bg-white/75" />
      <span className="absolute left-[64%] top-[58%] -ml-[55px] -mt-[55px] h-[110px] w-[110px] rounded-full bg-[radial-gradient(circle,#fffdf4_0_32%,#ffe7b3_50%,rgba(255,220,160,0)_70%)]" />
      <div className="absolute inset-0 bg-[#6e8fb3] [clip-path:polygon(0_64%,10%_52%,22%_58%,34%_40%,47%_58%,58%_48%,70%_60%,82%_42%,100%_56%,100%_100%,0_100%)]" />
      <div className="absolute inset-0 bg-[#3e5f7e] [clip-path:polygon(0_76%,15%_61%,28%_70%,42%_55%,56%_72%,68%_64%,84%_74%,100%_64%,100%_100%,0_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(180deg,#9cc3e3,#2f4c68)]">
        <span className="absolute left-[62%] top-[24%] -ml-3.5 h-0.5 w-[60px] rounded-full bg-[#fff6de]/85" />
        <span className="absolute left-[62%] top-1/2 ml-0.5 h-0.5 w-[34px] rounded-full bg-[#fff6de]/85" />
        <span className="absolute left-[62%] top-[74%] ml-2.5 h-0.5 w-4 rounded-full bg-[#fff6de]/85" />
      </div>
    </div>
  );
}

export function PreviewBeforeAfter({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <div className="w-full max-w-[536px]">
        <BeforeAfter autoplay before={<Landscape graded={false} />} after={<Landscape graded />} />
      </div>
    </Stage>
  );
}

export function PreviewPriceOdometer({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <PriceOdometer autoplay />
    </Stage>
  );
}

export function PreviewPasswordStrength({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <PasswordStrength autoplay />
    </Stage>
  );
}

export function PreviewTiltPass({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <TiltPass autoplay />
    </Stage>
  );
}

export function PreviewAnimatedTabs({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <AnimatedTabs autoplay />
    </Stage>
  );
}

export function PreviewSharedElementCards({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SharedElementCards autoplay />
    </Stage>
  );
}

export function PreviewRotatingHeadline({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <RotatingHeadline />
    </Stage>
  );
}
