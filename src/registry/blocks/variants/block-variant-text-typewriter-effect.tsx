"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { TextAnimationTypewriterEffect } from "@/components/blocks/text-animations";

function TypewriterEffectDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-black px-5 py-12 text-[#f5f5f7] sm:px-8">
      <div className="w-full max-w-3xl">
        <p className="text-[13px] font-medium text-[#a1a1a6]">Hosting for small teams</p>
        <h3 className="mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">
          Push to main.
        </h3>
        <div className="mt-2 min-h-[2.6em] text-[34px] leading-[1.05] sm:text-5xl">
          <TextAnimationTypewriterEffect
            texts={["Preview every branch.", "Roll back in one click.", "Sleep through deploys."]}
            className="text-[34px] text-[#86868b] sm:text-5xl"
            delay={500}
          />
        </div>
        <p className="mt-8 max-w-xl text-pretty text-[16px] leading-7 text-[#a1a1a6]">
          Cycles through short claims, typing and deleting each one. The line keeps its height, so the copy below
          never shifts.
        </p>
      </div>
    </section>
  );
}

export function PreviewBlockVariantTextTypewriterEffect() {
  return <TypewriterEffectDemo />;
}
