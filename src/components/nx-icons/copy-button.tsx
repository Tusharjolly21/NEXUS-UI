"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { playIconSound } from "./icon-sounds";
import { CopyIcon } from "./icons/copy";

/**
 * Copies on one click. Give it the text, or the slug of an icon and it fetches that icon's source.
 * The button is the library's own Copy icon: it taps and ticks, and (with the site's sound on) makes its own sound.
 * The clipboard is written from the click itself, with the text still on its way, so Safari allows it too.
 */
async function copy(text: string | Promise<string>) {
  const write = async () => {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const blob = Promise.resolve(text).then((t) => new Blob([t], { type: "text/plain" }));
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
    } else {
      await navigator.clipboard.writeText(await text);
    }
  };
  try {
    await write();
    return true;
  } catch {
    try {
      await navigator.clipboard.writeText(await text);
      return true;
    } catch {
      return false;
    }
  }
}

export function CopyButton({
  text,
  slug,
  name,
  label = "Copy code",
  copiedLabel = "Copied",
  compact = false,
  className,
}: {
  /** The text to copy. */
  text?: string;
  /** Or an icon's slug: its source file is fetched when the button is pressed. */
  slug?: string;
  /** What is being copied, for the button's accessible name (an icon's title). */
  name?: string;
  label?: string;
  copiedLabel?: string;
  /** An icon-only round button, for a corner of a tile. */
  compact?: boolean;
  className?: string;
}) {
  const [hover, setHover] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
  const timer = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const press = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const source = text ?? fetch(`/api/icons/${slug}`).then((r) => (r.ok ? r.text() : Promise.reject(new Error("missing"))));
    const ok = await copy(source);
    setState(ok ? "copied" : "failed");
    if (ok) playIconSound("copy", { volume: 0.7 });
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  const copied = state === "copied";
  const text_ = copied ? copiedLabel : state === "failed" ? "Press Ctrl+C" : label;
  return (
    <button
      type="button"
      onClick={press}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label={compact ? `${label}${name ? ` for ${name}` : ""}` : undefined}
      title={compact ? text_ : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "size-8 rounded-full" : "h-9 rounded-full px-3.5",
        copied ? "bg-[#30d158] text-white" : "bg-foreground/[0.07] text-foreground hover:bg-foreground/[0.13]",
        className,
      )}
    >
      <CopyIcon size={compact ? 16 : 16} strokeWidth={2} play={hover || copied} accent={copied ? "#ffffff" : "#30d158"} />
      {compact ? <span className="sr-only" aria-live="polite">{copied ? copiedLabel : ""}</span> : <span aria-live="polite">{text_}</span>}
    </button>
  );
}
