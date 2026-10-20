"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a live preview of a Pro item for visitors without Pro. Everything stays visible and works
 * (clicks, drags, typing), but the easy ways of lifting the design are switched off: the right-click
 * menu (Save image, Inspect), selecting and copying the text, and dragging images or SVGs out to the
 * desktop. Inputs keep normal selection so typing still works. A small mark says it's a Pro preview.
 *
 * This is a deterrent, not the lock: the source, usage code, install and build prompt are refused
 * by the server without Pro, and the site never ships source maps.
 */
export function PreviewShield({
  active,
  children,
  className,
  mark = true,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  /** Show the small "Pro preview" mark in the corner. */
  mark?: boolean;
}) {
  if (!active) return <>{children}</>;
  const editable = (t: EventTarget | null) =>
    t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || (t instanceof HTMLElement && t.isContentEditable);

  return (
    <div
      className={cn(
        "relative select-none [-webkit-touch-callout:none] [&_input]:select-text [&_textarea]:select-text [&_[contenteditable=true]]:select-text",
        className,
      )}
      onContextMenu={(e) => {
        if (!editable(e.target)) e.preventDefault();
      }}
      onCopy={(e) => {
        if (!editable(e.target)) e.preventDefault();
      }}
      onCut={(e) => {
        if (!editable(e.target)) e.preventDefault();
      }}
      onDragStart={(e) => {
        const t = e.target;
        if (t instanceof HTMLImageElement || t instanceof SVGElement || t instanceof HTMLAnchorElement) e.preventDefault();
      }}
    >
      {children}
      {mark ? (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 left-3 z-[5] inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em] text-white/90 backdrop-blur-md"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.5" y="11" width="15" height="10" rx="2.4" />
            <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" />
          </svg>
          Pro preview
        </span>
      ) : null}
    </div>
  );
}
