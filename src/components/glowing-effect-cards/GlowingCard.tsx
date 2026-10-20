"use client";

import type { ReactNode } from "react";
import { GlowingEffect, type GlowingEffectProps } from "./GlowingEffect";

export type GlowingCardProps = {
  title: string;
  description: string;
  /** Icon shown in the tinted tile, usually an inline SVG. */
  icon?: ReactNode;
  /** Tint for the icon tile and the call to action. */
  accent?: string;
  className?: string;
  /** Spreads the content out for a tall card. */
  tall?: boolean;
  /** Call-to-action label at the bottom. */
  cta?: string;
  /** Turns the whole card into a link. */
  href?: string;
  /** Passed through to the glow. */
  glow?: Omit<GlowingEffectProps, "children" | "className">;
};

function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** A feature card with a pointer-reactive glowing rim: icon, title, one line and an optional call to action. */
export function GlowingCard({ title, description, icon, accent = "#0071e3", className = "", tall = false, cta, href, glow }: GlowingCardProps) {
  const body = (
    <div className={`flex h-full flex-col p-4 ${tall ? "justify-between" : "justify-start"}`}>
      <div>
        {icon ? (
          <span className="mb-2.5 inline-grid size-9 place-items-center rounded-[10px]" style={{ background: `${accent}1f`, color: accent }}>
            {icon}
          </span>
        ) : null}
        <h3 className="text-[16px] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
        <p className="mt-1 text-[13px] leading-[1.4] text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p>
      </div>
      {cta ? (
        <span className="group/cta mt-2 inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: accent }}>
          {cta}
          <span className="transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/cta:translate-x-1">
            <Arrow />
          </span>
        </span>
      ) : null}
    </div>
  );
  return (
    <GlowingEffect className={`h-full ${className}`} {...glow}>
      {href ? (
        <a
          href={href}
          className="block h-full rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        >
          {body}
        </a>
      ) : (
        body
      )}
    </GlowingEffect>
  );
}
