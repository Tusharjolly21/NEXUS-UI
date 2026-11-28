"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { TextAnimationBlurFadeIn } from "@/components/blocks/text-animations";

export function BlurFadeInDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-white px-5 py-12 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8">
      <div className="w-full max-w-3xl">
        <p className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">From the founders</p>
        <TextAnimationBlurFadeIn
          text={"We built the tool we kept wishing for.\nIt does fewer things than the others.\nEach of them, properly."}
          by="word"
          stagger={0.045}
          once={false}
          repeat
          className="mt-5 text-[30px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-5xl"
        />
        <p className="mt-8 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">Ana Ruiz and Tom Becker, co-founders</p>
      </div>
    </section>
  );
}
