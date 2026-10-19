"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ variant = "default" }: { variant?: "default" | "capsule" } = {}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    if (variant === "capsule") return <span className="size-9 shrink-0" aria-hidden />;
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="border-border bg-background/80 shrink-0"
        disabled
        aria-hidden
      >
        <Sun className="size-4 opacity-40" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  if (variant === "capsule") {
    return (
      <button
        type="button"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="grid size-9 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
      >
        {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="border-border bg-background/80 shrink-0"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400" aria-hidden />
      ) : (
        <Moon className="size-4 text-slate-600" aria-hidden />
      )}
    </Button>
  );
}
