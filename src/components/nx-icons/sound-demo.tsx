"use client";

import * as React from "react";
import { ICONS } from "@/lib/icons/catalog";
import { cn } from "@/lib/utils";
import { playIconSound } from "./icon-sounds";
import { NX_ICONS } from "./registry";

const PICKS = ["bell", "heart", "rocket", "trash", "coin", "lock", "camera", "trophy", "cake", "gamepad", "dice", "key"];

/** Press any icon to play it with its own sound, so visitors can hear what they are about to add. */
export function SoundDemo() {
  const [active, setActive] = React.useState<string | null>(null);
  const timer = React.useRef<number | null>(null);
  React.useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  const press = (slug: string) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setActive(null);
    window.setTimeout(() => {
      setActive(slug);
      playIconSound(slug, { force: true });
      timer.current = window.setTimeout(() => setActive(null), 2200);
    }, 30);
  };
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {PICKS.map((slug) => {
        const meta = ICONS.find((i) => i.slug === slug);
        const Icon = NX_ICONS[slug];
        if (!meta || !Icon) return null;
        return (
          <li key={slug}>
            <button
              type="button"
              onClick={() => press(slug)}
              aria-label={`Play the ${meta.title} sound`}
              className={cn(
                "flex w-full flex-col items-center gap-3 rounded-[20px] bg-card px-3 py-5 text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.05)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
                active === slug && "ring-2 ring-foreground/30",
              )}
            >
              <Icon size={34} accent={meta.accent} play={active === slug} />
              <span className="text-[13px] text-muted-foreground">{meta.title}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
