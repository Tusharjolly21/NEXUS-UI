"use client";

/**
 * Made by sound previews. Five components that borrow from audio: a logo drawn in water, a player whose
 * ripples follow the beat, an upload bar made of vibrating sand, a recorder with a liquid level and a
 * toast that lands like a drop. Every one ships an `autoplay` mode that demonstrates itself until
 * someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { SoundMark } from "@/components/sound-mark";
import { RippleNowPlaying } from "@/components/ripple-now-playing";
import { ChladniUpload } from "@/components/chladni-upload";
import { TankRecorder } from "@/components/tank-recorder";
import { RippleToast } from "@/components/ripple-toast";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[380px] w-full items-center justify-center p-6 text-[#1d1d1f] sm:p-8 dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewSoundMark({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[440px]">
      <SoundMark autoplay />
    </Stage>
  );
}

export function PreviewRippleNowPlaying({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[520px]">
      <RippleNowPlaying autoplay />
    </Stage>
  );
}

export function PreviewChladniUpload({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[560px]">
      <ChladniUpload autoplay />
    </Stage>
  );
}

export function PreviewTankRecorder({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[460px]">
      <TankRecorder autoplay />
    </Stage>
  );
}

export function PreviewRippleToast({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[440px]">
      <RippleToast autoplay />
    </Stage>
  );
}
