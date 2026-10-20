"use client";

import { CodeBlock } from "@/components/code-block";

const SAMPLE = `import { motion } from "framer-motion";

export function Badge({ count }: { count: number }) {
  // Springs, not durations.
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.6 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 600 }}
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}`;

export function PreviewCodeBlockRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[540px] flex-col items-center gap-3">
        <div className="w-full" style={{ height: compact ? 300 : 340 }}>
          <CodeBlock
            code={SAMPLE}
            language="tsx"
            theme="dark"
            autoplay
            highlightLines={[8, 9, 10]}
            header={{ enabled: true, showDots: true, title: "badge.tsx", copy: { enabled: true, label: "Copy", copiedLabel: "Copied" } }}
          />
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Move over the code, then copy it.</span>
      </div>
    </div>
  );
}

export function PreviewCodeBlockAutoRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="w-full max-w-[540px]" style={{ height: compact ? 300 : 340 }}>
        <CodeBlock code={SAMPLE} language="tsx" theme="auto" header={{ enabled: true, showDots: false, title: "badge.tsx", copy: { enabled: true } }} />
      </div>
    </div>
  );
}
