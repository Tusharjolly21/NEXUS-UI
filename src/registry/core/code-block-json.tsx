"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CodeBlock } from "@/components/code-block/code-block";

const SAMPLE_CODE_JSON = `{
  "name": "nexus-labs",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "framer-motion": "^11.0.0"
  }
}`;

export function PreviewCodeBlockJson() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_JSON}
          language="json"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}
