"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { AskNexusInput } from "@/components/ask-nexus-input";

export function PreviewAskNexusInput() {
  return (
    <div className="flex min-h-[440px] w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-white px-8 dark:border-white/10">
      <AskNexusInput />
    </div>
  );
}
