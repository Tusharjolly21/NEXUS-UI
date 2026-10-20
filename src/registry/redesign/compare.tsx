"use client";

import { Compare } from "@/components/compare";

export function PreviewCompareRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-3 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <Compare beforeLabel="Original" afterLabel="Graded" className={compact ? "max-w-[300px]" : "max-w-[400px]"} autoplay />
      <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">Drag anywhere on the photo, or use the arrow keys.</span>
    </div>
  );
}

const Code = ({ lines }: { lines: string[] }) => (
  <pre className="absolute inset-0 overflow-hidden p-5 font-mono text-[12.5px] leading-6">
    {lines.map((l, i) => (
      <div key={i} className="whitespace-pre">
        <span className="mr-4 inline-block w-4 text-right opacity-35">{i + 1}</span>
        {l}
      </div>
    ))}
  </pre>
);

const BEFORE = ["function total(items) {", "  let t = 0;", "  for (let i = 0; i < items.length; i++) {", "    t = t + items[i].price * items[i].qty;", "  }", "  return t;", "}"];
const AFTER = ["const total = (items: Item[]) =>", "  items.reduce(", "    (sum, { price, qty }) => sum + price * qty,", "    0,", "  );"];

export function PreviewCompareCodeRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-3 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <Compare
        beforeLabel="Before"
        afterLabel="After"
        beforeContent={
          <div className="absolute inset-0 bg-[#fbfbfd] text-[#6e6e73] dark:bg-[#1c1c1e] dark:text-[#a1a1a6]">
            <Code lines={BEFORE} />
          </div>
        }
        afterContent={
          <div className="absolute inset-0 bg-[#1d1d1f] text-[#f5f5f7]">
            <Code lines={AFTER} />
          </div>
        }
        className={compact ? "aspect-[4/3] max-w-[300px]" : "aspect-[16/10] max-w-[440px]"}
      />
      <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">Any two nodes work, not just images.</span>
    </div>
  );
}
