"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function PreviewCursorTextRevealImage({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("w-full", compact ? "h-[420px]" : "h-[560px]")}>
      <CursorTextReveal
        baseText="We chase moments in time to feel alive."
        revealText="We keep the moments we usually ignore."
        backgroundImage="https://images.unsplash.com/photo-1730874829217-f7f666e94822?auto=format&fit=crop&w=1800&q=85"
        backgroundPosition="42% center"
        mode="image"
        revealImage="https://images.unsplash.com/photo-1649787652660-df5ac7c91532?auto=format&fit=crop&w=1800&q=85"
        revealImagePosition="center"
        maskSize={compact ? 215 : 340}
        initialMaskSize={compact ? 90 : 0}
        smoothness={0.2}
        enableGlow={false}
        showAmbient={false}
        showGrid={false}
        fontSize={compact ? "clamp(2rem, 7vw, 4.4rem)" : "clamp(3rem, 7vw, 6.5rem)"}
        baseTextClassName="text-white/45"
        revealTextClassName="text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.45)]"
        containerClassName="h-full min-h-0 rounded-3xl border-white/10 bg-zinc-950 shadow-2xl shadow-black/50"
      />
    </div>
  );
}
