"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "system", label: "Match system theme", Icon: Monitor },
  { value: "dark", label: "Dark theme", Icon: Moon },
] as const;

const noop = () => () => {};

/** Light / system / dark switch for the nav capsule. */
export function ThemeTrio({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // the saved choice is only known in the browser, so the server renders nothing selected
  const mounted = React.useSyncExternalStore(noop, () => true, () => false);

  return (
    <div role="radiogroup" aria-label="Theme" className={cn("flex items-center gap-0.5 rounded-full bg-foreground/[0.06] p-0.5", className)}>
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              "grid size-7 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
              active ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "text-foreground/50 hover:text-foreground",
            )}
          >
            <Icon className="size-[15px]" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
