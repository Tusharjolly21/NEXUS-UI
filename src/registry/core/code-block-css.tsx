"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CodeBlock } from "@/components/code-block/code-block";

const SAMPLE_CODE_CSS = `.button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}`;

export function PreviewCodeBlockCss() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_CSS}
          language="css"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}
