"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { EncryptedText } from "@/components/encrypted-text";

export function PreviewEncryptedText({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-xl bg-zinc-950 px-6",
        compact ? "min-h-[280px] py-6" : "min-h-[420px] py-14",
      )}
    >
      <EncryptedText
        text="ACCESS GRANTED"
        trigger="load"
        loop
        loopDelay={1800}
        speed={55}
        shuffleSpeed={28}
        iterations={8}
        className={cn(
          "font-bold tracking-[0.18em] text-white",
          compact ? "text-2xl" : "text-4xl",
        )}
      />
      <EncryptedText
        text="DECRYPTING DATA..."
        trigger="load"
        loop
        loopDelay={2400}
        speed={38}
        shuffleSpeed={22}
        iterations={5}
        revealDelay={700}
        className={cn(
          "tracking-[0.22em] text-foreground/60",
          compact ? "text-xs" : "text-sm",
        )}
      />
    </div>
  );
}
