"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { TextGenerateTypewriter } from "@/components/blocks/text-animations";

function TextGenerateTypewriterDemo() {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center overflow-hidden bg-[#f5f5f7] px-5 py-12 dark:bg-black sm:px-8">
      <div className="w-full max-w-2xl">
        <div className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-[#0071e3] px-4 py-3 text-[15px] text-white">
          Why did churn go up last quarter?
        </div>
        <TextGenerateTypewriter
          text="Churn rose 1.8 points, almost entirely from annual plans that renewed in August. Most of those accounts never invited a second teammate, so the fastest lever is an invite prompt in week one."
          startOnView
          typingSpeed={40}
          className="mt-4"
        />
      </div>
    </section>
  );
}

export function PreviewBlockVariantTextGenerate() {
  return <TextGenerateTypewriterDemo />;
}
