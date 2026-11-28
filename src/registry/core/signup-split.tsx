"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { SplitSignup } from "@/components/split-signup-convert";

export function PreviewSignupSplit() {
  return (
    <div className="flex h-full min-h-[480px] w-full items-center justify-center p-6">
      <SplitSignup className="max-w-[920px]" />
    </div>
  );
}
