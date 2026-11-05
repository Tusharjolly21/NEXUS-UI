"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "./hooks";
import { Icon } from "./icons";
import { BLUE, EASE, INK, MUTED, SURFACE } from "./theme";
import { Reveal, SectionTitle } from "./ui";

/** A white rounded tile of the bento grid. It fades in with the rest of the grid. */
function Tile({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <Reveal className={`overflow-hidden rounded-[28px] bg-white p-8 sm:p-10 ${className}`}>
      <div style={style} className="h-full">
        {children}
      </div>
    </Reveal>
  );
}

function TileLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[17px] font-semibold" style={{ color: MUTED }}>
      {children}
    </div>
  );
}

/** A ring with a blue arc that keeps sweeping round, around the number of minutes between updates. */
function UpdateRing() {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto mt-8 h-36 w-36">
      <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 0 10px #f0f0f2" }} />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, rgba(0,113,227,0) 0deg, ${BLUE} 300deg, rgba(0,113,227,0) 300deg)`,
          WebkitMask: "radial-gradient(closest-side, transparent 78%, #000 79%)",
          mask: "radial-gradient(closest-side, transparent 78%, #000 79%)",
        }}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[34px] font-semibold tracking-[-0.03em]">5</div>
          <div className="text-[12px]" style={{ color: MUTED }}>
            minutes
          </div>
        </div>
      </div>
    </div>
  );
}

const SUN_ARC = "M10,110 Q150,-60 290,110";

/** The sun's path across the day: a dotted arc with a bright segment that draws in when it scrolls into view. */
function DaylightArc() {
  return (
    <svg viewBox="0 0 300 130" className="mt-6 block w-full" aria-hidden="true">
      <defs>
        <linearGradient id="nb-sun-path" x1="0" x2="1">
          <stop offset="0" stopColor="#ff9f0a" />
          <stop offset=".5" stopColor="#ffd60a" />
          <stop offset="1" stopColor="#ff9f0a" />
        </linearGradient>
      </defs>
      <line x1="0" x2="300" y1="110" y2="110" stroke="#e5e5ea" />
      <path d={SUN_ARC} fill="none" stroke="#e5e5ea" strokeWidth="2" strokeDasharray="3 5" />
      <motion.path
        d={SUN_ARC}
        fill="none"
        stroke="url(#nb-sun-path)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 0.62 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: EASE }}
      />
      <text x="10" y="126" fontSize="11" fill={MUTED}>
        06:42
      </text>
      <text x="290" y="126" fontSize="11" fill={MUTED} textAnchor="end">
        20:58
      </text>
    </svg>
  );
}

/** "Small details. Big difference.": a bento of six facts about the app. */
export function Details() {
  return (
    <section className="px-5 py-28 sm:py-36" style={{ background: SURFACE }}>
      <div className="mx-auto max-w-[1024px]">
        <Reveal>
          <SectionTitle>
            Small details.
            <br />
            Big difference.
          </SectionTitle>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <Tile className="md:col-span-2">
            <TileLabel>Resolution</TileLabel>
            <div
              className="mt-3 font-semibold leading-none tracking-[-0.06em]"
              style={{
                fontSize: "clamp(88px, 13vw, 150px)",
                background: "linear-gradient(90deg,#0a84ff,#5ac8fa 60%,#64d2ff)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              1 km
            </div>
            <p className="m-0 mt-4 max-w-[440px] text-[19px] leading-[1.4]" style={{ color: INK }}>
              Forecasts for your street, not your city. The park and the office get their own weather.
            </p>
          </Tile>

          <Tile>
            <TileLabel>Updated every</TileLabel>
            <UpdateRing />
            <p className="m-0 mt-6 text-center text-[17px] leading-[1.4]">Fresh radar and forecasts, all day.</p>
          </Tile>

          <Tile style={{ display: "flex", flexDirection: "column" }}>
            <Icon name="lock-simple" size={44} style={{ color: INK }} />
            <div className="mt-auto pt-10 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em]">
              No ads.
              <br />
              No tracking.
              <br />
              Ever.
            </div>
          </Tile>

          <Tile>
            <TileLabel>Feels like</TileLabel>
            <div className="mt-2 text-[64px] font-semibold leading-none tracking-[-0.05em]">27°</div>
            <div className="relative mt-6 h-2 rounded-full" style={{ background: "linear-gradient(90deg,#5ac8fa,#a3e635,#ffd60a,#ff9f0a,#ff3b30)" }}>
              <motion.span
                className="absolute top-1/2 h-5 w-5 rounded-full bg-white"
                style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.1), 0 2px 8px rgba(0,0,0,.2)", y: "-50%" }}
                initial={{ left: "0%" }}
                whileInView={{ left: "calc(68% - 10px)" }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 60, damping: 14 }}
              />
            </div>
            <p className="m-0 mt-5 text-[17px] leading-[1.4]">Humidity makes 24° feel like 27°.</p>
          </Tile>

          <Tile>
            <div className="flex items-center gap-2 text-[17px] font-semibold" style={{ color: MUTED }}>
              <Icon name="sun-horizon" size={18} />
              Daylight
            </div>
            <DaylightArc />
            <p className="m-0 mt-3 text-[17px] leading-[1.4]">5 h 51 min of light left today.</p>
          </Tile>
        </div>
      </div>
    </section>
  );
}
