"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/phone-input";

export function PreviewPhoneInput({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[200px]" : "min-h-[280px] py-8",
      )}
    >
      <PhoneInput placeholder="Phone number" label="Phone number" />
    </div>
  );
}
