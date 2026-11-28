"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { GlassLogin } from "@/components/glass-login-stack";

export function PreviewLoginGlass() {
  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center p-6">
      <GlassLogin className="max-w-[880px]" />
    </div>
  );
}
