"use client";

/**
 * Motion Kit previews (batch 22): Frozen Card, Seat Crowd, Flap Clock, Image Press, Jelly Splitter, Effort Slider, Window Seat Toggle, Smear Carousel, Forecast Status, Paperclip Attach, Aquarium Prompt, Elemental Picker, Oracle Orb, Clock Picker, Vine Progress, Bloom Gift Card, Genie Uploader, Piano Text, Highlight Popover. Each plays itself (autoplay) until a real pointer arrives, so the preview only adds a little room around it.
 */

import { FrozenCard } from "@/components/frozen-card";
import { SeatCrowd } from "@/components/seat-crowd";
import { FlapClock } from "@/components/flap-clock";
import { ImagePress } from "@/components/image-press";
import { JellySplitter } from "@/components/jelly-splitter";
import { EffortSlider } from "@/components/effort-slider";
import { WindowSeatToggle } from "@/components/window-seat-toggle";
import { SmearCarousel } from "@/components/smear-carousel";
import { ForecastStatus } from "@/components/forecast-status";
import { PaperclipAttach } from "@/components/paperclip-attach";
import { AquariumPrompt } from "@/components/aquarium-prompt";
import { ElementalPicker } from "@/components/elemental-picker";
import { OracleOrb } from "@/components/oracle-orb";
import { ClockPicker } from "@/components/clock-picker";
import { VineProgress } from "@/components/vine-progress";
import { BloomGiftCard } from "@/components/bloom-gift-card";
import { GenieUploader } from "@/components/genie-uploader";
import { PianoText } from "@/components/piano-text";
import { HighlightPopover } from "@/components/highlight-popover";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewFrozenCard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[520px]">
        <FrozenCard autoplay />
      </div>
    </div>
  );
}

export function PreviewSeatCrowd({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[760px]">
        <SeatCrowd autoplay />
      </div>
    </div>
  );
}

export function PreviewFlapClock({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[680px]">
        <FlapClock autoplay />
      </div>
    </div>
  );
}

export function PreviewImagePress({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[760px]">
        <ImagePress autoplay />
      </div>
    </div>
  );
}

export function PreviewJellySplitter({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[680px]">
        <JellySplitter autoplay />
      </div>
    </div>
  );
}

export function PreviewEffortSlider({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[600px]">
        <EffortSlider autoplay />
      </div>
    </div>
  );
}

export function PreviewWindowSeatToggle({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[560px]">
        <WindowSeatToggle autoplay />
      </div>
    </div>
  );
}

export function PreviewSmearCarousel({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[960px]">
        <SmearCarousel autoplay />
      </div>
    </div>
  );
}

export function PreviewForecastStatus({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[460px]">
        <ForecastStatus autoplay />
      </div>
    </div>
  );
}

export function PreviewPaperclipAttach({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[600px]">
        <PaperclipAttach autoplay />
      </div>
    </div>
  );
}

export function PreviewAquariumPrompt({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[760px]">
        <AquariumPrompt autoplay />
      </div>
    </div>
  );
}

export function PreviewElementalPicker({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[600px]">
        <ElementalPicker autoplay />
      </div>
    </div>
  );
}

export function PreviewOracleOrb({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[600px]">
        <OracleOrb autoplay />
      </div>
    </div>
  );
}

export function PreviewClockPicker({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[460px]">
        <ClockPicker autoplay />
      </div>
    </div>
  );
}

export function PreviewVineProgress({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[520px]">
        <VineProgress autoplay />
      </div>
    </div>
  );
}

export function PreviewBloomGiftCard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[460px]">
        <BloomGiftCard autoplay />
      </div>
    </div>
  );
}

export function PreviewGenieUploader({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[600px]">
        <GenieUploader autoplay />
      </div>
    </div>
  );
}

export function PreviewPianoText({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[760px]">
        <PianoText autoplay />
      </div>
    </div>
  );
}

export function PreviewHighlightPopover({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[360px]" : "min-h-[480px]"}`}>
      <div className="w-full max-w-[700px]">
        <HighlightPopover autoplay />
      </div>
    </div>
  );
}
