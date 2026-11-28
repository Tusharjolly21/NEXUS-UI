"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { Compare } from "@/components/compare";

const CMP = {
  colorA: "https://picsum.photos/seed/cmp-a/1200/675",
  grayA: "https://picsum.photos/seed/cmp-a/1200/675?grayscale",
  colorB: "https://picsum.photos/seed/cmp-b/1200/675",
  blurB: "https://picsum.photos/seed/cmp-b/1200/675?blur=4",
};

export function PreviewCompareDefault() {
  return (
    <div className="p-6">
      <Compare
        beforeImage={CMP.grayA}
        afterImage={CMP.colorA}
        beforeLabel="Before"
        afterLabel="After"
        className="aspect-video w-full"
      />
    </div>
  );
}
