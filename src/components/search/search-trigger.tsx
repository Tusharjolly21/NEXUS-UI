import * as React from "react";
import { Search } from "lucide-react";

/* ── Search trigger button ─────────────────────────────────────────────────── */
export function SearchTrigger({
  onClick,
  variant = "default",
  buttonRef,
  onWarm,
}: {
  onClick: () => void;
  variant?: "default" | "capsule";
  buttonRef?: React.Ref<HTMLButtonElement>;
  /** Fired on hover / focus, so the palette can start loading before the click. */
  onWarm?: () => void;
}) {
  if (variant === "capsule") {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onPointerEnter={onWarm}
        onFocus={onWarm}
        aria-label="Search components"
        aria-haspopup="dialog"
        className="group inline-flex h-9 items-center gap-2 rounded-full bg-foreground/[0.06] pl-3 pr-1.5 text-[13.5px] text-foreground/60 transition-colors duration-200 hover:bg-foreground/[0.1] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:bg-foreground/[0.12]"
      >
        <Search className="size-4 shrink-0" strokeWidth={2} aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <kbd className="ml-1 hidden rounded-full bg-foreground/[0.07] px-2 py-0.5 font-sans text-[11px] text-foreground/55 transition-colors group-hover:text-foreground/70 sm:inline">
          ⌘K
        </kbd>
      </button>
    );
  }
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onPointerEnter={onWarm}
      onFocus={onWarm}
      aria-label="Open search"
      aria-haspopup="dialog"
      className="group inline-flex h-9 items-center gap-2.5 rounded-full bg-foreground/[0.06] pl-3 pr-1.5 text-[13.5px] text-muted-foreground transition-colors duration-200 hover:bg-foreground/[0.1] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Search className="size-4 shrink-0" strokeWidth={2} aria-hidden />
      <span className="hidden md:inline">Search components…</span>
      <kbd className="rounded-full bg-foreground/[0.07] px-2 py-0.5 font-sans text-[11px] text-foreground/55">⌘K</kbd>
    </button>
  );
}
