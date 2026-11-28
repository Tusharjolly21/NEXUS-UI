"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { TypewriterEffect } from "@/components/typewriter-effect";

export function PreviewTypewriterEffect({
  compact = true,
}: { compact?: boolean } = {}) {
  const prefixText = "Ship delightful interfaces with ";
  const baseSpeed = compact ? 36 : 44;
  const accentDelay = prefixText.length * baseSpeed;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 px-5",
        compact ? "min-h-[190px]" : "min-h-[280px] py-10",
      )}
    >
      <div className="flex w-full justify-center text-center">
        <h2
          className={cn(
            "text-balance font-semibold tracking-tight text-foreground",
            compact ? "text-2xl" : "text-5xl lg:text-6xl",
          )}
        >
          <TypewriterEffect
            as="span"
            text={prefixText}
            typingSpeed={baseSpeed}
            deletingSpeed={0}
            pauseDuration={compact ? 900 : 1200}
            loop={false}
            showCursor={false}
          />
          <TypewriterEffect
            as="span"
            text="Nexus-UI"
            typingSpeed={compact ? 44 : 54}
            deletingSpeed={0}
            delay={accentDelay}
            pauseDuration={compact ? 900 : 1200}
            loop={false}
            className="text-primary"
            cursorClassName="bg-primary"
          />
        </h2>
      </div>
    </div>
  );
}
