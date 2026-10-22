"use client";

import * as React from "react";
import { Volume2, VolumeOff } from "lucide-react";
import { configureSounds, playSound, useSoundsEnabled } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

// Nexus UI is a wall of live previews, so it stays quiet until a visitor asks for sound. In your own
// app the default is on; this line is the only difference.
configureSounds({ defaultEnabled: false });

/**
 * The one switch for every interface sound on the site. Off until chosen, remembered in this browser,
 * and it answers a switch-on with a small tick so you know it worked. The icon variant sits in the nav
 * and menu; the pill variant carries a label for the pages whose components make sound.
 */
export function SoundSwitch({ variant = "icon", className }: { variant?: "icon" | "pill"; className?: string }) {
  const [enabled, setEnabled] = useSoundsEnabled();
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) playSound("on", 0.8, true);
  };
  const Icon = enabled ? Volume2 : VolumeOff;
  if (variant === "pill") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        className={cn(
          "pg-float inline-flex h-9 items-center gap-2 rounded-full bg-card px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
      >
        <Icon className="size-4" aria-hidden />
        {enabled ? "Sound on" : "Sound off"}
      </button>
    );
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Interface sounds"
      title={enabled ? "Sound on" : "Sound off"}
      onClick={toggle}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        enabled && "text-foreground",
        className,
      )}
    >
      <Icon className="size-[15px]" aria-hidden />
    </button>
  );
}
