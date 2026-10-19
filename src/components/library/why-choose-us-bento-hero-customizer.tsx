"use client";

import WhyChooseUsBento from "@/components/blocks/animated-bento-grid";

export function WhyChooseUsBentoHeroCustomizer() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white dark:bg-zinc-950">
      <div className="absolute left-0 top-0 w-[139%] origin-top-left scale-[0.72]">
        <WhyChooseUsBento />
      </div>
    </div>
  );
}
