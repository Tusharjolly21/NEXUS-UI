"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { OrbitFooter } from "@/components/orbit-footer";

export function PreviewFooterMini() {
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center p-6">
      <OrbitFooter className="max-w-[980px]" />
    </div>
  );
}
