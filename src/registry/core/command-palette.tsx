"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CommandPalette } from "@/components/command-palette";

export function PreviewCommandPalette() {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-3xl bg-[#111111]">
      <CommandPalette className="h-full" />
    </div>
  );
}
