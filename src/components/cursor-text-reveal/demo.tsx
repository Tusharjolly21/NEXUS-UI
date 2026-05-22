"use client";

import { CursorTextReveal } from "./cursor-text-reveal";

export function CursorTextRevealDemo() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <CursorTextReveal
        baseText="The first rule of motion is clarity."
        revealText="The second rule is feeling."
        maskSize={310}
        smoothness={0.16}
        enableGlow={false}
        showAmbient={false}
        showGrid={false}
        revealBackgroundClassName="bg-black"
        baseTextClassName="text-zinc-950"
        revealTextClassName="text-white"
        containerClassName="border-zinc-200 bg-white text-zinc-950 shadow-sm"
      />

      <div className="grid gap-8">
        <CursorTextReveal
          baseText="We chase moments in time to feel alive."
          revealText="We keep the moments we usually ignore."
          backgroundImage="https://images.unsplash.com/photo-1730874829217-f7f666e94822?auto=format&fit=crop&w=1800&q=85"
          backgroundPosition="42% center"
          mode="image"
          revealImage="https://images.unsplash.com/photo-1649787652660-df5ac7c91532?auto=format&fit=crop&w=1800&q=85"
          revealImagePosition="center"
          maskSize={340}
          smoothness={0.2}
          enableGlow={false}
          showAmbient={false}
          showGrid={false}
          fontSize="clamp(2.6rem, 6vw, 6.4rem)"
          baseTextClassName="text-white/45"
          revealTextClassName="text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.45)]"
          containerClassName="min-h-[620px] border-white/10 bg-zinc-950 shadow-2xl shadow-black/50"
        />
      </div>
    </section>
  );
}
