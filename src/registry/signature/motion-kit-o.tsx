"use client";

/**
 * Motion Kit previews (set O): liquid gauge, thermo dial, pull cord, scratch reveal, polaroid develop, wallet stack, confetti like, spark reactions. Every component ships an `autoplay` mode that
 * demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { LiquidGauge } from "@/components/liquid-gauge";
import { ThermoDial } from "@/components/thermo-dial";
import { PullCord } from "@/components/pull-cord";
import { ScratchReveal } from "@/components/scratch-reveal";
import { PolaroidDevelop } from "@/components/polaroid-develop";
import { WalletStack } from "@/components/wallet-stack";
import { ConfettiLike } from "@/components/like-burst";
import { SparkReactions } from "@/components/emoji-reactions";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewLiquidGauge({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <LiquidGauge autoplay />
    </Stage>
  );
}

export function PreviewThermoDial({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ThermoDial autoplay />
    </Stage>
  );
}

export function PreviewPullCord({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <PullCord autoplay />
    </Stage>
  );
}

export function PreviewScratchReveal({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ScratchReveal autoplay />
    </Stage>
  );
}

export function PreviewPolaroidDevelop({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[400px]">
      <PolaroidDevelop autoplay />
    </Stage>
  );
}

export function PreviewWalletStack({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[420px]">
      <WalletStack autoplay />
    </Stage>
  );
}

export function PreviewConfettiLike({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ConfettiLike autoplay />
    </Stage>
  );
}

export function PreviewSparkReactions({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SparkReactions autoplay />
    </Stage>
  );
}
