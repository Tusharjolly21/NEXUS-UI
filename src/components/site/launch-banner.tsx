"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { BrandMark, type MarkName } from "@/components/mcp/brand-marks";
import { useSlots } from "@/components/site/use-slots";
import { slotsLeft } from "@/lib/launch-slots";
import { LAUNCH_BANNER_COOKIE, LAUNCH_BANNER_ID } from "@/lib/launch-banner";

/** The coding agents the MCP server works with, as small overlapping logo coins. */
const AGENTS: { mark: MarkName; bg: string }[] = [
  { mark: "claude", bg: "bg-[#fbeee8]" },
  { mark: "cursor", bg: "bg-black text-white ring-white/25" },
  { mark: "vscode", bg: "bg-[#e8f3fc]" },
  { mark: "openai", bg: "bg-white" },
];

function AgentCoins() {
  return (
    <span aria-hidden className="mr-1 inline-flex items-center">
      {AGENTS.map((a, i) => (
        <span key={a.mark} className={`grid size-[22px] place-items-center rounded-full ring-2 ring-[#1d1d1f] ${a.bg} ${i ? "-ml-1.5" : ""}`}>
          <BrandMark name={a.mark} className="size-3" />
        </span>
      ))}
    </span>
  );
}

/**
 * The thin strip above the nav: the newest thing (the MCP server for coding agents, with Pro unlocking every
 * component through it), with one link to its setup and, for free visitors, the early-prices line.
 * It names no per-category counts (templates and blocks are the smaller numbers and read as "not much
 * for the price"); only the components figure, which is well past it, and that more is coming.
 * Closing it stores a cookie for 60 days; the site shell reads that cookie on the server so the
 * strip never flashes back in on the next page. It is one line, never animates and never returns
 * for someone who closed it.
 */
export function LaunchBanner({ isPro = false }: { isPro?: boolean }) {
  const [open, setOpen] = React.useState(true);
  // Free visitors see how many early slots are left (counted from the database) where the plans line used to be.
  const slots = useSlots(!isPro);
  const left = slotsLeft(slots ?? null);
  const loading = slots === undefined;
  if (!open) return null;

  const close = () => {
    document.cookie = `${LAUNCH_BANNER_COOKIE}=${LAUNCH_BANNER_ID}; Max-Age=${60 * 60 * 24 * 60}; Path=/; SameSite=Lax`;
    setOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative z-[51] flex min-h-10 items-center justify-center bg-[#1d1d1f] px-12 py-2 text-center text-[13px] leading-snug text-white/85 dark:bg-[#1c1c1e] dark:shadow-[inset_0_-0.5px_0_rgba(255,255,255,0.12)]"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-1.5">
        {isPro ? (
          <span className="inline-flex rounded-full bg-[linear-gradient(135deg,#ffd60a,#ff9f0a)] px-2 py-px text-[11px] font-semibold text-black">Pro</span>
        ) : (
          <span className="inline-flex rounded-full bg-[conic-gradient(from_210deg,#0a84ff,#bf5af2,#ff375f,#ff9f0a,#0a84ff)] px-2 py-px text-[11px] font-semibold text-white">New</span>
        )}
        <AgentCoins />
        {isPro ? (
          <>
            <span className="hidden sm:inline">Your MCP server is ready: Claude Code, Cursor or Codex can add any Nexus UI component for you. </span>
            <span className="sm:hidden">Your MCP server is ready. </span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">
              <strong className="font-semibold text-white">MCP server</strong>: your coding agent adds components by name. Pro unlocks every one.{" "}
            </span>
            <span className="sm:hidden">
              <strong className="font-semibold text-white">MCP server</strong> for your coding agent.{" "}
            </span>
          </>
        )}
        <Link href="/mcp" className={`whitespace-nowrap font-medium hover:underline hover:underline-offset-4 ${isPro ? "text-[#ffd60a]" : "text-[#2997ff]"}`}>
          {isPro ? "Connect it ›" : "Set it up ›"}
        </Link>
        {isPro ? null : (
          // The early-slots line. On a phone it sits on its own row under the icons line; from tablet width it joins it.
          // While the numbers load it is there but invisible (same size), so nothing jumps or flashes the old text.
          // If the numbers can't be read, a phone shows nothing extra and wider screens show the plain plans line.
          <span
            className={`flex basis-full items-center justify-center gap-x-1.5 pt-1 md:inline-flex md:basis-auto md:pt-0 ${loading ? "invisible" : ""} ${!left && !loading ? "hidden md:inline-flex" : ""}`}
            aria-hidden={loading || undefined}
          >
            <span aria-hidden className="hidden text-white/30 md:inline">|</span>
            {left || loading ? (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff9f0a]/[0.16] px-2.5 py-0.5 text-[#ffd60a] ring-1 ring-inset ring-[#ff9f0a]/35"
              >
                <span aria-hidden className="relative flex size-1.5 shrink-0">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff9f0a] opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#ff9f0a]" />
                </span>
                <span className="whitespace-nowrap">
                  <span className="hidden md:inline">Early prices: </span>
                  <strong className="font-semibold text-white">{left ? left.total : 98}</strong> {left && left.total === 1 ? "slot" : "slots"} left, then prices go up
                </span>
              </Link>
            ) : (
              "Pro unlocks the rest."
            )}
            <Link href="/pricing" className="hidden whitespace-nowrap font-medium text-[#2997ff] hover:underline hover:underline-offset-4 md:inline">
              See plans ›
            </Link>
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={close}
        aria-label="Close announcement"
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#2997ff]"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
