"use client";

/* eslint-disable react-hooks/preserve-manual-memoization, react-hooks/purity, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, type CSSProperties } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, usePresence, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type SeatPlan = {
  name: string;
  /** the first seat count this plan applies to */
  from: number;
  /** badge and confetti colour */
  color?: string;
  /** text colour on the badge */
  ink?: string;
};
export type SeatCrowdProps = {
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  /** monthly price per seat (ignored when you pass price) */
  pricePerSeat?: number;
  /** monthly total for a seat count, for tiered pricing */
  price?: (seats: number) => number;
  currency?: string;
  plans?: SeatPlan[];
  defaultBilling?: "monthly" | "yearly";
  onBillingChange?: (billing: "monthly" | "yearly") => void;
  onChange?: (seats: number) => void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor icons (MIT) via Iconify, inlined
const ICON = {
  plant: { vb: 256, body: "<path fill=\"currentColor\" d=\"M205.41 159.07a60.9 60.9 0 0 1-31.83 8.86a71.7 71.7 0 0 1-27.36-5.66A55.55 55.55 0 0 0 136 194.51V224a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.25v-12.44l-38.62-38.62A52.5 52.5 0 0 1 63.44 176a45.8 45.8 0 0 1-23.92-6.67C17.73 156.09 6 125.62 8.27 87.79a8 8 0 0 1 7.52-7.52c37.83-2.23 68.3 9.46 81.5 31.25a46 46 0 0 1 6.45 28.48a4 4 0 0 1-6.89 2.43l-19.2-20.1a8 8 0 0 0-11.31 11.31l53.88 55.25c.06-.78.13-1.56.21-2.33a68.56 68.56 0 0 1 18.64-39.46l50.59-53.46a8 8 0 0 0-11.31-11.32l-49 51.82a4 4 0 0 1-6.78-1.74c-4.74-17.48-2.65-34.88 6.4-49.82c17.86-29.48 59.42-45.26 111.18-42.22a8 8 0 0 1 7.52 7.52c3 51.77-12.78 93.33-42.26 111.19\"/>" },
  team: { vb: 256, body: "<path fill=\"currentColor\" d=\"M64.12 147.8a4 4 0 0 1-4 4.2H16a8 8 0 0 1-7.8-6.17a8.35 8.35 0 0 1 1.62-6.93A67.8 67.8 0 0 1 37 117.51a40 40 0 1 1 66.46-35.8a3.94 3.94 0 0 1-2.27 4.18A64.08 64.08 0 0 0 64 144c0 1.28 0 2.54.12 3.8m182-8.91A67.76 67.76 0 0 0 219 117.51a40 40 0 1 0-66.46-35.8a3.94 3.94 0 0 0 2.27 4.18A64.08 64.08 0 0 1 192 144c0 1.28 0 2.54-.12 3.8a4 4 0 0 0 4 4.2H240a8 8 0 0 0 7.8-6.17a8.33 8.33 0 0 0-1.63-6.94Zm-89 43.18a48 48 0 1 0-58.37 0A72.13 72.13 0 0 0 65.07 212A8 8 0 0 0 72 224h112a8 8 0 0 0 6.93-12a72.15 72.15 0 0 0-33.74-29.93Z\"/>" },
  biz: { vb: 256, body: "<path fill=\"currentColor\" d=\"M239.73 208H224V96a16 16 0 0 0-16-16h-44a4 4 0 0 0-4 4v124h-16V32.41a16.43 16.43 0 0 0-6.16-13a16 16 0 0 0-18.72-.69L39.12 72A16 16 0 0 0 32 85.34V208H16.27A8.18 8.18 0 0 0 8 215.47a8 8 0 0 0 8 8.53h224a8 8 0 0 0 8-8.53a8.18 8.18 0 0 0-8.27-7.47M76 184a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.28v-15.45a8.19 8.19 0 0 1 7.47-8.27a8 8 0 0 1 8.53 8Zm0-56a8 8 0 0 1-8.53 8a8.19 8.19 0 0 1-7.47-8.28v-15.45a8.19 8.19 0 0 1 7.47-8.27a8 8 0 0 1 8.53 8Zm40 56a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.26v-15.47a8.19 8.19 0 0 1 7.47-8.26a8 8 0 0 1 8.53 8Zm0-56a8 8 0 0 1-8.53 8a8.19 8.19 0 0 1-7.47-8.26v-15.47a8.19 8.19 0 0 1 7.47-8.26a8 8 0 0 1 8.53 8Z\"/>" },
  gift: { vb: 256, body: "<path fill=\"currentColor\" d=\"M216 72h-35.08c.39-.33.79-.65 1.17-1A29.53 29.53 0 0 0 192 49.57A32.62 32.62 0 0 0 158.44 16A29.53 29.53 0 0 0 137 25.91a55 55 0 0 0-9 14.48a55 55 0 0 0-9-14.48A29.53 29.53 0 0 0 97.56 16A32.62 32.62 0 0 0 64 49.57A29.53 29.53 0 0 0 73.91 71c.38.33.78.65 1.17 1H40a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16v64a16 16 0 0 0 16 16h60a4 4 0 0 0 4-4v-92H40V88h80v32h16V88h80v32h-80v92a4 4 0 0 0 4 4h60a16 16 0 0 0 16-16v-64a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16M84.51 59a13.7 13.7 0 0 1-4.5-10a16.62 16.62 0 0 1 16.58-17h.49a13.7 13.7 0 0 1 10 4.5c8.39 9.48 11.35 25.2 12.39 34.92C109.71 70.39 94 67.43 84.51 59m87 0c-9.49 8.4-25.24 11.36-35 12.4C137.7 60.89 141 45.5 149 36.51a13.7 13.7 0 0 1 10-4.5h.49A16.62 16.62 0 0 1 176 49.08a13.7 13.7 0 0 1-4.51 9.92Z\"/>" },
} as const;

const PLANS: SeatPlan[] = [
  { name: "Starter", from: 1, color: "#2fd4a0", ink: "#033d2c" },
  { name: "Team", from: 6, color: "#3767ff", ink: "#ffffff" },
  { name: "Business", from: 21, color: "#7c3aed", ink: "#ffffff" },
];
const PLAN_ICON: (keyof typeof ICON)[] = ["plant", "team", "biz"];
const SHIRTS = ["#ff5a4f", "#ffc83d", "#3767ff", "#2fd4a0", "#8b5cf6", "#ff7aa8", "#14b8c4"];
const SKINS = ["#ffdcc6", "#f6c6a0", "#e2a578", "#c88756", "#9c603b", "#6f412a"];
const HAIRS = ["#2b1d1a", "#4a2a1c", "#7a3f22", "#b8652c", "#e6b85c", "#c4bdd0"];
const PANTS = ["#26305c", "#3c4166", "#4a64c9", "#5b4636", "#2e2b3a", "#c7a37a"];
const SHOES = ["#2a2340", "#2a2340", "#ffffff", "#ff5a4f", "#2a2340", "#3767ff"];
const STYLES = ["short", "bun", "curls", "long", "cap", "bald"] as const;
type HairStyle = (typeof STYLES)[number];
const STOP = Symbol("stop");
const U = 1.25; // px per drawing unit at full size
const FW = 44 * U;
const FH = 90 * U;
const SPACE = 39 * U; // shoulder to shoulder in a row
const STAGE_H = 224;
const T = 10; // ruler: px per seat
const INK = "#2b2238";
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${Math.round(x[0] + (y[0] - x[0]) * t)},${Math.round(x[1] + (y[1] - x[1]) * t)},${Math.round(x[2] + (y[2] - x[2]) * t)})`;
};
const rgba = (h: string, a: number) => {
  const c = hex(h);
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
};
function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

// ─── the people ───
type Look = {
  skin: string;
  skinShade: string;
  shirt: string;
  sleeve: string;
  pants: string;
  shoes: string;
  hair: string;
  style: HairStyle;
  cap: string;
  neck: "crew" | "pocket" | "collar" | "stripes";
  shirtShade: string;
  pantsShade: string;
  bottom: "pants" | "shorts" | "skirt";
  tights: boolean;
  trunk: number;
  glasses: boolean;
  beard: boolean;
  torso: number;
  blink: number;
  blinkAt: number;
  breath: number;
  breathAt: number;
};
const looks = new Map<number, Look>();
function lookFor(seat: number): Look {
  const hit = looks.get(seat);
  if (hit) return hit;
  const r = rng(seat * 7919 + 101);
  for (let i = 0; i < 4; i++) r(); // let neighbouring seeds drift apart
  const skinI = Math.floor(r() * SKINS.length);
  // darker skin tones mostly get darker hair; anyone can go silver
  const hairPool = skinI >= 3 ? [0, 0, 1, 1, 5] : [0, 1, 2, 3, 4, 5, 1, 4];
  const hair = HAIRS[hairPool[Math.floor(r() * hairPool.length)]];
  // neighbours never share a hairstyle or a shirt colour
  const style = STYLES[(seat * 5 + Math.floor(r() * 2)) % STYLES.length];
  const shirt = SHIRTS[(seat * 3) % SHIRTS.length];
  const capPick = SHIRTS[(seat * 3 + 3) % SHIRTS.length];
  const necks: Look["neck"][] = ["crew", "pocket", "collar", "stripes", "crew"];
  const pants = PANTS[Math.floor(r() * PANTS.length)];
  const b = r();
  const bottom: Look["bottom"] = b < 0.62 ? "pants" : b < 0.8 ? "shorts" : "skirt";
  const l: Look = {
    skin: SKINS[skinI],
    skinShade: mix(SKINS[skinI], "#5a2a1a", 0.14),
    shirt,
    sleeve: mix(shirt, "#1b1240", 0.13),
    pants: bottom === "skirt" ? SHIRTS[(seat * 3 + 5) % SHIRTS.length] : pants,
    shirtShade: mix(shirt, "#1b1240", 0.1),
    pantsShade: mix(pants, "#000000", 0.16),
    bottom,
    tights: r() < 0.4,
    trunk: 22 + r() * 3,
    shoes: SHOES[Math.floor(r() * SHOES.length)],
    hair,
    style,
    cap: capPick,
    neck: necks[Math.floor(r() * necks.length)],
    glasses: r() < 0.17,
    beard: style !== "long" && style !== "bun" && r() < 0.2,
    torso: 18.5 + r() * 2.5,
    blink: 3.2 + r() * 3.6,
    blinkAt: r() * 6,
    breath: 2.6 + r() * 1.2,
    breathAt: r() * 3,
  };
  looks.set(seat, l);
  return l;
}

type Pose = "idle" | "wave-l" | "wave-r" | "sign";
const ARM_IDLE = 8;
const Figure = memo(function Figure({ look: L, pose, calm }: { look: Look; pose: Pose; calm: boolean }) {
  const gid = `sc${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const tw = L.torso;
  const tx = 22 - tw / 2;
  const top = 31.4; // shoulders
  const waist = top + L.trunk;
  const sh = { l: { x: tx + 3, y: top + 3.6 }, r: { x: tx + tw - 3, y: top + 3.6 } };
  const armLen = 19.5;
  const arm = (side: "l" | "r") => {
    const p = sh[side];
    const sgn = side === "l" ? 1 : -1;
    const holding = pose === "sign" && side === "r";
    const style: CSSProperties = {
      transformBox: "view-box",
      transformOrigin: `${p.x}px ${p.y}px`,
      transform: `rotate(${sgn * (holding ? 172 : pose === "sign" ? 22 : ARM_IDLE)}deg)`,
      transition: calm ? undefined : "transform .35s cubic-bezier(.3,1.6,.5,1)",
    };
    if (pose === `wave-${side}` && !calm) style.animation = `sc-wave-${side} .9s ease-in-out forwards`;
    return (
      <g style={style}>
        <rect x={p.x - 2.75} y={p.y - 2.4} width={5.5} height={armLen} rx={2.75} fill={L.sleeve} />
        <circle cx={p.x} cy={p.y - 2.4 + armLen - 0.4} r={2.95} fill={L.skin} />
      </g>
    );
  };
  const breathe: CSSProperties = calm ? {} : { animation: `sc-breathe ${L.breath}s ease-in-out ${-L.breathAt}s infinite`, transformOrigin: "50% 100%" };
  const blink: CSSProperties = calm ? {} : { animation: `sc-blink ${L.blink}s linear ${-L.blinkAt}s infinite`, transformBox: "fill-box", transformOrigin: "center" };
  const legW = L.bottom === "pants" ? 6.4 : 5.2;
  const legX = L.bottom === "pants" ? [15.5, 22.1] : [16.4, 22.4];
  const legFill = L.bottom === "pants" ? `url(#${gid}p)` : L.tights ? "#2e2b3a" : L.skin;
  const torso = `M${tx + 7} ${top} H${tx + tw - 7} Q${tx + tw} ${top} ${tx + tw} ${top + 7} V${waist - 2.5} Q${tx + tw} ${waist} ${tx + tw - 2.5} ${waist} H${tx + 2.5} Q${tx} ${waist} ${tx} ${waist - 2.5} V${top + 7} Q${tx} ${top} ${tx + 7} ${top} Z`;
  return (
    <div className="sc-anim absolute inset-0" style={breathe}>
      <svg viewBox="0 0 44 90" width="100%" height="100%" overflow="visible" aria-hidden="true">
        <defs>
          <linearGradient id={`${gid}s`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.63" stopColor={L.shirt} />
            <stop offset="0.63" stopColor={L.shirtShade} />
          </linearGradient>
          <linearGradient id={`${gid}p`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.6" stopColor={L.pants} />
            <stop offset="0.6" stopColor={L.pantsShade} />
          </linearGradient>
        </defs>
        {/* long hair falls behind the shoulders */}
        {L.style === "long" && <path d="M11 23.6 C10 12.8 15.2 9.4 22 9.4 C28.8 9.4 34 12.8 33 23.6 L33.8 40.6 C33.8 42.8 32.2 43.8 30.2 43.4 L13.8 43.4 C11.8 43.8 10.2 42.8 10.2 40.6 Z" fill={L.hair} />}
        <rect x={19.5} y={26} width={5} height={8} rx={2.2} fill={L.skinShade} />
        {/* legs and shoes */}
        <rect x={legX[0]} y={waist - 1} width={legW} height={86 - waist} rx={legW / 2} fill={legFill} />
        <rect x={legX[1]} y={waist - 1} width={legW} height={86 - waist} rx={legW / 2} fill={legFill} />
        {L.bottom === "shorts" && <path d={`M${tx + 0.8} ${waist - 3} H${tx + tw - 0.8} L${tx + tw - 0.2} ${waist + 9} H${22.8} L22 ${waist + 3} L21.2 ${waist + 9} H${tx + 0.2} Z`} fill={`url(#${gid}p)`} />}
        {L.bottom === "skirt" && <path d={`M${tx + 1} ${waist - 3} H${tx + tw - 1} L${tx + tw + 2.6} ${waist + 11.5} Q22 ${waist + 13.2} ${tx - 2.6} ${waist + 11.5} Z`} fill={L.pants} />}
        {L.bottom === "pants" && <rect x={tx + 0.8} y={waist - 3} width={tw - 1.6} height={8} rx={2.4} fill={`url(#${gid}p)`} />}
        <rect x={13.1} y={83.2} width={8.7} height={5} rx={2.5} fill={L.shoes} />
        <rect x={22.2} y={83.2} width={8.7} height={5} rx={2.5} fill={L.shoes} />
        {L.shoes === "#ffffff" && <path d="M13.6 87.2 H21.3 M22.7 87.2 H30.4" stroke="#cfcadf" strokeWidth={1.1} strokeLinecap="round" />}
        {/* shirt */}
        <path d={torso} fill={`url(#${gid}s)`} />
        {L.neck === "stripes" && (
          <g fill="#ffffff" opacity={0.45}>
            <rect x={tx} y={top + 9} width={tw} height={2.2} />
            <rect x={tx} y={top + 14.4} width={tw} height={2.2} />
          </g>
        )}
        {L.neck === "pocket" && <rect x={tx + tw * 0.6} y={top + 7} width={4.6} height={4.4} rx={1.2} fill="none" stroke={L.sleeve} strokeWidth={1} />}
        <ellipse cx={22} cy={top + 0.9} rx={4.6} ry={1.6} fill="#1b1240" opacity={0.16} />
        {L.neck === "crew" && <path d={`M18.4 ${top + 0.3} Q22 ${top + 4} 25.6 ${top + 0.3}`} fill="none" stroke={L.sleeve} strokeWidth={1.3} strokeLinecap="round" />}
        {L.neck === "collar" && <path d={`M17.8 ${top} L21.6 ${top + 3.8} L19.4 ${top + 5.2} L16.8 ${top + 1.8} Z M26.2 ${top} L22.4 ${top + 3.8} L24.6 ${top + 5.2} L27.2 ${top + 1.8} Z`} fill="#ffffff" stroke="rgba(27,18,64,.14)" strokeWidth={0.5} strokeLinejoin="round" />}
        {arm("l")}
        {arm("r")}
        {/* head */}
        <circle cx={11.9} cy={22.2} r={2.4} fill={L.skinShade} />
        <circle cx={32.1} cy={22.2} r={2.4} fill={L.skinShade} />
        <circle cx={22} cy={20.6} r={10.3} fill={L.skin} />
        <circle cx={17.2} cy={25.6} r={2.1} fill="#ff6f91" opacity={0.32} />
        <circle cx={26.8} cy={25.6} r={2.1} fill="#ff6f91" opacity={0.32} />
        <g className="sc-anim" style={blink}>
          <ellipse cx={18.5} cy={22} rx={1.35} ry={1.65} fill={INK} />
          <ellipse cx={25.5} cy={22} rx={1.35} ry={1.65} fill={INK} />
        </g>
        <path d="M20.3 25.9 Q22 27.5 23.7 25.9" fill="none" stroke={INK} strokeWidth={1.1} strokeLinecap="round" />
        {L.beard && <path d="M12.3 22.8 C12.7 29.6 16.6 32.3 22 32.3 C27.4 32.3 31.3 29.6 31.7 22.8 C29.8 26.8 26.6 28 22 28 C17.4 28 14.2 26.8 12.3 22.8 Z" fill={L.hair} />}
        {/* hair */}
        {L.style === "short" && <path d="M11.5 23.6 C10.4 14.6 15 9.6 22.2 9.6 C29.2 9.6 33.8 14 32.6 22.8 C31.9 19.8 30.8 17.9 29.2 16.8 C26 18.7 20.6 18.3 17.7 15.9 C16.6 18.4 14.6 20.2 12.5 20.8 C12 21.7 11.7 22.6 11.5 23.6 Z" fill={L.hair} />}
        {L.style === "bun" && (
          <g fill={L.hair}>
            <circle cx={22} cy={8.4} r={5.2} />
            <path d="M11.6 21.4 C11.4 13.8 16 10.3 22 10.3 C28 10.3 32.6 13.8 32.4 21.4 C30.6 17.2 26.8 15.2 22 15.2 C17.2 15.2 13.4 17.2 11.6 21.4 Z" />
            <rect x={18.2} y={11.3} width={7.6} height={2.1} rx={1.05} fill={L.cap} />
          </g>
        )}
        {L.style === "curls" && (
          <g fill={L.hair}>
            <path d="M11.5 20.4 C11.5 13.2 16.2 9.8 22 9.8 C27.8 9.8 32.5 13.2 32.5 20.4 C30.6 17.8 26.8 16.4 22 16.4 C17.2 16.4 13.4 17.8 11.5 20.4 Z" />
            {[-170, -142, -116, -90, -64, -38, -10].map((a) => (
              <circle key={a} cx={22 + 10.9 * Math.cos((a * Math.PI) / 180)} cy={19.6 + 10.9 * Math.sin((a * Math.PI) / 180)} r={a === -170 || a === -10 ? 3.2 : 4.1} />
            ))}
            <circle cx={16.6} cy={12.4} r={3.5} />
            <circle cx={27.4} cy={12.4} r={3.5} />
          </g>
        )}
        {L.style === "long" && <path d="M11.4 22.4 C11.6 14.4 16.2 10.3 22 10.3 C27.8 10.3 32.4 14.4 32.6 22.4 C31 18.4 27.8 15.9 23.8 15.4 C22.8 18 19.2 19.4 15.4 19.6 C13.6 20 12.2 21.1 11.4 22.4 Z" fill={L.hair} />}
        {L.style === "cap" && (
          <g>
            <path d="M11.8 19.6 L14.6 19.6 L14.6 24.4 C13.1 24 12.1 22.6 11.8 19.6 Z M32.2 19.6 L29.4 19.6 L29.4 24.4 C30.9 24 31.9 22.6 32.2 19.6 Z" fill={L.hair} />
            <path d="M11.5 20 C11.5 12.8 16.2 9.4 22 9.4 C27.8 9.4 32.5 12.8 32.5 20 Z" fill={L.cap} />
            <path d="M18 10.4 C15.4 12.6 14.6 16 14.8 19.4" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.2} strokeLinecap="round" />
            <path d="M11.7 18.6 H32.3 V20 H11.7 Z" fill={mix(L.cap, "#1b1240", 0.22)} />
            <path d="M21 19 L35.8 19.6 C37.1 19.7 37.1 21.5 35.8 21.6 L21 21.2 Z" fill={mix(L.cap, "#1b1240", 0.16)} />
            <circle cx={22} cy={9.6} r={1.25} fill={mix(L.cap, "#1b1240", 0.22)} />
          </g>
        )}
        {L.style === "bald" && <ellipse cx={18} cy={14.2} rx={3.3} ry={1.5} transform="rotate(-26 18 14.2)" fill="#ffffff" opacity={0.32} />}
        {L.glasses && (
          <g fill="rgba(255,255,255,.14)" stroke={INK} strokeWidth={0.8}>
            <circle cx={18.5} cy={22} r={3} />
            <circle cx={25.5} cy={22} r={3} />
            <path d="M21.5 21.6 Q22 21.1 22.5 21.6" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
});

type Spot = { x: number; y: number; s: number; z: number };
type PersonProps = {
  seat: number;
  spot: Spot;
  from: number;
  delay: number;
  enter: boolean;
  exitDelays: Map<number, number>;
  stageW: number;
  reduced: boolean;
  sign: string | null;
  signColor: string;
  /** called when it hops away, so the others can close the gap */
  onLeave: (seat: number) => void;
};
const LAYOUT = { type: "spring", stiffness: 200, damping: 21, mass: 0.9 } as const;
function Person({ seat, spot, from, delay, enter, exitDelays, stageW, reduced, sign, signColor, onLeave }: PersonProps) {
  const [present, safeToRemove] = usePresence();
  const look = lookFor(seat);
  const hx = useMotionValue(enter && !reduced ? from : 0);
  const hy = useMotionValue(0);
  const sx = useMotionValue(1);
  const sy = useMotionValue(1);
  const rot = useMotionValue(0);
  const op = useMotionValue(enter && reduced ? 0 : 1);
  const shadowOp = useTransform([hy, op], ([h, o]: number[]) => o * clamp(1 + h / 60, 0.2, 1));
  const shadowS = useTransform(hy, [-60, 0], [0.5, 1]);
  const [pose, setPose] = useState<Pose>("idle");
  const anims = useRef<AnimationPlaybackControls[]>([]);
  const leaving = useRef(false);
  const spotRef = useRef(spot);
  spotRef.current = spot;
  const stop = () => {
    anims.current.forEach((a) => a.stop());
    anims.current = [];
  };
  // a hop: straight across, up and down on a parabola, stretched in the air and leaning into it
  const hop = (x0: number, x1: number, h: number, dur: number, wait: number, done?: () => void, fade = false) => {
    const dir = Math.sign(x1 - x0) || 1;
    anims.current.push(
      animate(0, 1, {
        duration: dur,
        delay: wait,
        ease: "linear",
        onUpdate: (t) => {
          const k = Math.sin(Math.PI * t);
          hx.set(x0 + (x1 - x0) * t);
          hy.set(-h * 4 * t * (1 - t));
          sy.set(1 + 0.11 * k);
          sx.set(1 - 0.08 * k);
          rot.set(dir * 10 * k);
          if (fade) op.set(clamp((1 - t) / 0.45, 0, 1));
        },
        onComplete: done,
      }),
    );
  };
  const land = () => {
    anims.current.push(
      animate(sy, [0.72, 1.1, 0.97, 1], { duration: 0.44, times: [0, 0.32, 0.68, 1], ease: "easeOut" }),
      animate(sx, [1.22, 0.94, 1.02, 1], { duration: 0.44, times: [0, 0.32, 0.68, 1], ease: "easeOut" }),
      animate(rot, 0, { type: "spring", stiffness: 420, damping: 14 }),
    );
  };

  useEffect(() => {
    if (!enter) return;
    if (reduced) {
      anims.current.push(animate(op, 1, { duration: 0.3, delay: delay / 1000 }));
      return stop;
    }
    const d = Math.abs(from);
    hop(from, 0, 20 + Math.min(34, d * 0.09), 0.38 + Math.min(0.32, d / 900), delay / 1000, land);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (present) {
      if (leaving.current) {
        // called back before it left
        leaving.current = false;
        stop();
        setPose("idle");
        anims.current.push(animate(hx, 0, LAYOUT), animate(hy, 0, LAYOUT), animate(op, 1, { duration: 0.2 }), animate(rot, 0, LAYOUT), animate(sx, 1, LAYOUT), animate(sy, 1, LAYOUT));
      }
      return;
    }
    leaving.current = true;
    stop();
    const wait = (exitDelays.get(seat) ?? 0) / 1000;
    if (reduced) {
      anims.current.push(animate(op, 0, { duration: 0.25, delay: wait, onComplete: () => safeToRemove() }));
      return;
    }
    const sp = spotRef.current;
    const toLeft = sp.x < stageW / 2;
    const out = toLeft ? -(sp.x + FW * sp.s + 24) : stageW - sp.x + FW * sp.s + 24;
    const t = window.setTimeout(() => setPose(toLeft ? "wave-l" : "wave-r"), wait * 1000);
    const t2 = window.setTimeout(() => onLeave(seat), (wait + 0.75) * 1000);
    hop(0, out, 26, 0.5 + Math.min(0.3, Math.abs(out) / 900), wait + 0.7, () => safeToRemove(), true);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present]);

  const lay = reduced ? { duration: 0 } : LAYOUT;
  return (
    <motion.div className="absolute left-0 top-0" style={{ zIndex: spot.z }} initial={false} animate={{ x: spot.x, y: spot.y }} transition={lay}>
      <motion.div className="absolute left-0 top-0" style={{ x: hx, opacity: shadowOp }}>
        <motion.span className="absolute block rounded-[50%]" style={{ left: -15 * U, top: -3.2 * U, width: 30 * U, height: 6.4 * U, scaleX: shadowS, background: "radial-gradient(closest-side, rgba(120,50,40,.32), rgba(120,50,40,0))" }} initial={false} animate={{ scale: spot.s }} transition={lay} />
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x: hx, y: hy, opacity: op }}>
        <motion.div className="absolute" style={{ left: -FW / 2, top: -FH, width: FW, height: FH, originX: 0.5, originY: 1 }} initial={false} animate={{ scale: spot.s }} transition={lay}>
          <motion.div className="absolute inset-0" style={{ scaleX: sx, scaleY: sy, rotate: rot, originX: 0.5, originY: 1 }}>
            <Figure look={look} pose={sign ? "sign" : pose} calm={reduced} />
            <AnimatePresence>
              {sign && (
                <motion.div key="sign" className="absolute" style={{ left: 31.4 * U, bottom: FH - 19.6 * U, originY: 1 }} initial={reduced ? { opacity: 0 } : { scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 16 }}>
                  <span className="absolute bottom-0 left-[-1.5px] block w-[3px] rounded-full" style={{ height: 30 * U, background: "linear-gradient(90deg, #c98a3b, #e6b85c)" }} />
                  <span className="absolute block" style={{ left: 0, bottom: 28 * U, transform: `translateX(-62%) scale(${clamp(0.95 / spot.s, 1, 3)})`, transformOrigin: "62% 100%" }}>
                    <span className="block whitespace-nowrap rounded-[7px] bg-white px-2 py-1 text-[12px] font-bold leading-none tabular-nums shadow-[0_3px_8px_-2px_rgba(43,34,56,.35),inset_0_0_0_1.5px_rgba(43,34,56,.08)]" style={{ color: signColor }}>
                      {sign}
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// where everyone stands: rows of up to perRow, newest at the ends, back rows smaller, higher and staggered
function crowd(n: number, W: number, perRow: number) {
  const rows = Math.max(1, Math.ceil(n / perRow));
  const front = Math.min(n, perRow);
  const camByRows = [1, 0.84, 0.74, 0.66, 0.6][rows - 1];
  const fit = (W - 20) / ((Math.max(front, 3) + (rows > 1 ? 0.5 : 0)) * SPACE);
  const cam = Math.min(camByRows, fit);
  const floor = STAGE_H - 22;
  const counts = Array.from({ length: rows }, (_, r) => Math.min(perRow, n - r * perRow));
  const shift = [0];
  for (let r = 1; r < rows; r++) shift[r] = counts[r] % 2 === counts[r - 1] % 2 ? (shift[r - 1] ? 0 : 0.5) : shift[r - 1];
  const spots: Spot[] = [];
  const sides: number[] = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / perRow);
    const k = i % perRow;
    const c = counts[row];
    const L = Math.floor((c - 1) / 2);
    const slot = k === 0 ? L : k % 2 ? L + (k + 1) / 2 : L - k / 2;
    const s = cam * (1 - 0.075 * row);
    const r = rng(i + 77);
    const x = W / 2 + (slot - (c - 1) / 2 + shift[row]) * SPACE * s + (r() - 0.5) * 3 * s;
    const y = floor - row * 27 * cam + (r() - 0.5) * 2.5;
    spots.push({ x, y, s, z: 60 - row * 10 });
    sides.push(k === 0 ? (row % 2 ? 1 : -1) : k % 2 ? 1 : -1);
  }
  return { spots, sides, cam, top: n ? Math.min(...spots.map((p) => p.y - FH * p.s)) : floor - FH };
}

// rolling digits
function Odometer({ text, reduced }: { text: string; reduced: boolean }) {
  const chars = text.split("");
  return (
    <span className="inline-flex tabular-nums" aria-hidden="true">
      {chars.map((ch, i) => {
        const k = chars.length - 1 - i;
        if (!/\d/.test(ch)) return <span key={`c${k}${ch}`}>{ch}</span>;
        const d = +ch;
        return (
          <span key={`d${k}`} className="relative inline-block overflow-hidden" style={{ height: "1.1em", lineHeight: "1.1em", maskImage: "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)" }}>
            <span className="invisible">0</span>
            <motion.span className="absolute left-0 top-0 flex flex-col" initial={false} animate={{ y: `${-d * 10}%` }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 18 }}>
              {"0123456789".split("").map((n) => (
                <span key={n} style={{ height: "1.1em" }}>
                  {n}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

const CSS = `
@keyframes sc-breathe { 0%, 100% { transform: translateY(0) scale(1, 1) } 50% { transform: translateY(-0.4px) scale(1.012, 1.024) } }
@keyframes sc-blink { 0%, 93%, 100% { transform: scaleY(1) } 95.5% { transform: scaleY(0.12) } }
@keyframes sc-wave-l { 0% { transform: rotate(9deg) } 22% { transform: rotate(158deg) } 42% { transform: rotate(124deg) } 62% { transform: rotate(158deg) } 82% { transform: rotate(126deg) } 100% { transform: rotate(150deg) } }
@keyframes sc-wave-r { 0% { transform: rotate(-9deg) } 22% { transform: rotate(-158deg) } 42% { transform: rotate(-124deg) } 62% { transform: rotate(-158deg) } 82% { transform: rotate(-126deg) } 100% { transform: rotate(-150deg) } }
.sc-still .sc-anim, .sc-still .sc-anim * { animation-play-state: paused !important }
`;

/**
 * The seat picker for a pricing page, as a crowd of little people. Drag or fling the yellow ruler and your team
 * appears on stage: each new person hops in from the side on an arc, lands with a squash and the row shuffles to
 * make room, while the camera zooms out as the crowd grows. Take seats away and the newest wave goodbye and hop off.
 * Cross into a bigger plan and the badge flips over with a pop of confetti in the plan's colour; past forty people,
 * the last one holds up a "+12 more" sign. The price rolls like an odometer, monthly or yearly.
 * Keyboard: focus the ruler; arrow keys add or remove one seat, Page Up and Page Down five, Home and End jump to
 * the ends. Arrow keys also switch between monthly and yearly billing.
 */
export function SeatCrowd({
  min = 1,
  max = 100,
  value,
  defaultValue = 8,
  pricePerSeat = 12,
  price,
  currency = "$",
  plans = PLANS,
  defaultBilling = "monthly",
  onBillingChange,
  onChange,
  autoplay = false,
  className = "",
}: SeatCrowdProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const first = clamp(Math.round(value ?? (autoplay && !reduced ? 3 : defaultValue)), min, max);
  const [seats, setSeats] = useState(first);
  const seatsRef = useRef(first);
  const [billing, setBillingS] = useState<"monthly" | "yearly">(defaultBilling);
  const setBilling = (b: "monthly" | "yearly") => {
    setBillingS(b);
    onBillingChange?.(b);
  };

  // ─── measure ───
  const [W, setW] = useState(440);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width + (parseFloat(getComputedStyle(el).paddingLeft) || 0) * 2));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = W < 360 ? 14 : 20;
  const SW = Math.max(200, W - pad * 2); // stage width

  // ─── the plan and the price ───
  const sorted = useMemo(() => [...plans].sort((a, b) => a.from - b.from), [plans]);
  let planI = 0;
  sorted.forEach((p, i) => seats >= p.from && (planI = i));
  const plan = sorted[planI] ?? PLANS[0];
  const planColor = plan.color ?? PLANS[Math.min(planI, 2)].color!;
  const planInk = plan.ink ?? "#ffffff";
  const monthly = price ? price(seats) : seats * pricePerSeat;
  const total = billing === "yearly" ? monthly * 10 : monthly;
  const each = billing === "yearly" ? (monthly * 10) / 12 / seats : monthly / seats;
  const money = (n: number) => `${currency}${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: n % 1 ? 2 : 0 })}`;
  const per = billing === "yearly" ? "year" : "month";
  const valueText = `${seats} ${seats === 1 ? "seat" : "seats"}, ${money(total)} per ${per}`;

  // ─── the crowd ───
  // about eight to a row and five rows deep; narrow stages use shorter rows so people stay a good size
  const perRow = SW >= 380 ? 8 : SW >= 320 ? 7 : 6;
  const cap = perRow * 5;
  const shown = Math.min(seats, cap);
  // people who are waving goodbye keep their spot until they hop away
  const departing = useRef(new Set<number>()).current;
  const [, bump] = useState(0);
  const prevShownR = useRef(shown);
  if (!reduced && shown < prevShownR.current) for (let i = shown; i < prevShownR.current; i++) departing.add(i);
  for (const i of [...departing]) if (i < shown || i >= cap) departing.delete(i);
  prevShownR.current = shown;
  const held = departing.size ? Math.max(shown, Math.max(...departing) + 1) : shown;
  const layout = useMemo(() => crowd(held, SW, perRow), [held, SW, perRow]);
  const onLeave = useMemo(
    () => (seat: number) => {
      if (departing.delete(seat)) bump((n) => n + 1);
    },
    [departing],
  );
  const mountedRef = useRef(false);
  const spawn = useRef({ next: 0, delays: new Map<number, number>(), quiet: new Set<number>() });
  const exitDelays = useRef(new Map<number, number>()).current;
  const prevShown = useRef(shown);
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  for (let i = 0; i < shown; i++) {
    if (spawn.current.delays.has(i)) continue;
    if (!mountedRef.current) {
      spawn.current.delays.set(i, 0);
      spawn.current.quiet.add(i);
      continue;
    }
    // many at once stream in, one after another
    const at = Math.max(now, spawn.current.next);
    spawn.current.delays.set(i, at - now);
    spawn.current.next = at + 48;
    exitDelays.delete(i);
  }
  if (shown < prevShown.current) for (let i = shown; i < prevShown.current; i++) if (!exitDelays.has(i)) exitDelays.set(i, (prevShown.current - 1 - i) * 55);
  useEffect(() => {
    mountedRef.current = true;
    prevShown.current = shown;
    for (const k of [...spawn.current.delays.keys()]) if (k >= shown) {
      spawn.current.delays.delete(k);
      spawn.current.quiet.delete(k);
    }
  }, [shown]);

  // ─── confetti when the plan goes up ───
  const parts = useRef<{ x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; c: string; life: number; round: boolean }[]>([]);
  const raf = useRef(0);
  const stageSize = useRef({ w: SW, h: STAGE_H });
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(SW * dpr);
    cv.height = Math.round(STAGE_H * dpr);
    stageSize.current = { w: SW, h: STAGE_H };
  }, [SW]);
  const burst = (color: string, x: number, y: number) => {
    const cv = canvasRef.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    const tones = [color, mix(color, "#ffffff", 0.45), mix(color, "#1b1240", 0.2), "#ffc83d", "#ffffff"];
    for (let i = 0; i < 56; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
      const v = 260 + Math.random() * 320;
      parts.current.push({ x: x + (Math.random() - 0.5) * 30, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 16, w: 4 + Math.random() * 4, h: 2.5 + Math.random() * 2.5, c: tones[i % tones.length], life: 1.3 + Math.random() * 0.7, round: Math.random() < 0.25 });
    }
    if (raf.current) return;
    let last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const { w, h } = stageSize.current;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      if (inViewRef.current) {
        parts.current = parts.current.filter((p) => (p.life -= dt) > 0 && p.y < h + 20);
        for (const p of parts.current) {
          p.vy += 820 * dt;
          p.vx *= 1 - 2.4 * dt;
          p.vy *= 1 - 1.6 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.r += p.vr * dt;
          g.save();
          g.globalAlpha = Math.min(1, p.life * 2);
          g.translate(p.x, p.y);
          g.rotate(p.r);
          g.fillStyle = p.c;
          if (p.round) {
            g.beginPath();
            g.arc(0, 0, p.h, 0, Math.PI * 2);
            g.fill();
          } else {
            g.scale(1, Math.cos(p.r * 1.7));
            g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          }
          g.restore();
        }
      }
      if (parts.current.length) raf.current = requestAnimationFrame(frame);
      else {
        g.clearRect(0, 0, w, h);
        raf.current = 0;
      }
    };
    raf.current = requestAnimationFrame(frame);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const [announce, setAnnounce] = useState("");
  const prevPlan = useRef(planI);
  const topRef = useRef(layout.top);
  topRef.current = layout.top;
  useEffect(() => {
    if (prevPlan.current === planI) return;
    const up = planI > prevPlan.current;
    prevPlan.current = planI;
    setAnnounce(`${plan.name} plan, ${money(each)} per seat${billing === "yearly" ? " a month" : ""}`);
    if (up && !reduced) window.setTimeout(() => burst(planColor, SW / 2, Math.max(24, topRef.current - 8)), 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planI]);

  // ─── the ruler: a tape you drag or fling, snapping to whole seats ───
  const off = useMotionValue((first - min) * T);
  const half = useMotionValue(SW / 2);
  useEffect(() => half.set(SW / 2), [SW, half]);
  const tapeX = useTransform([off, half], ([o, h]: number[]) => h - o);
  const hlX = useTransform(off, (o) => clamp(Math.round(o / T) * T, 0, (max - min) * T) - o);
  const settling = useRef<AnimationPlaybackControls | null>(null);
  useEffect(
    () =>
      off.on("change", (o) => {
        const v = clamp(Math.round(o / T) + min, min, max);
        if (v === seatsRef.current) return;
        seatsRef.current = v;
        setSeats(v);
        onChangeRef.current?.(v);
      }),
    [off, min, max],
  );
  const aim = useRef<number | null>(null); // where the tape is heading, so repeated keys add up
  const settle = (v: number, velocity = 0, soft = false) => {
    settling.current?.stop();
    const seat = clamp(Math.round(v), min, max);
    aim.current = seat;
    const target = (seat - min) * T;
    const done = () => (aim.current = null);
    if (reduced) {
      off.set(target);
      done();
    } else settling.current = animate(off, target, soft ? { type: "spring", velocity, stiffness: 120, damping: 20, restDelta: 0.5, onComplete: done } : { type: "spring", velocity, stiffness: 320, damping: 34, restDelta: 0.5, onComplete: done });
  };
  useEffect(() => {
    if (value === undefined) return;
    if (clamp(Math.round(value), min, max) !== seatsRef.current) settle(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const drag = useRef<{ x0: number; o0: number; moved: boolean; pts: { x: number; t: number }[] } | null>(null);
  const [grab, setGrab] = useState(false);
  const span = (max - min) * T;
  const band = (o: number) => (o < 0 ? o * 0.3 : o > span ? span + (o - span) * 0.3 : o);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    settling.current?.stop();
    aim.current = null;
    drag.current = { x0: e.clientX, o0: off.get(), moved: false, pts: [{ x: e.clientX, t: performance.now() }] };
    setGrab(true);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 3) d.moved = true;
    off.set(band(d.o0 - dx));
    const t = performance.now();
    d.pts.push({ x: e.clientX, t });
    while (d.pts.length > 2 && t - d.pts[0].t > 90) d.pts.shift();
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setGrab(false);
    if (!d.moved) {
      // a tap on the tape jumps to that tick
      const r = tapeRef.current?.getBoundingClientRect();
      if (r && e.clientY > r.top - 4) settle(seatsRef.current + Math.round((e.clientX - (r.left + r.width / 2)) / T));
      else settle(seatsRef.current);
      return;
    }
    const a = d.pts[0];
    const b = d.pts[d.pts.length - 1];
    const vx = b.t - a.t > 8 ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0;
    // a flick carries on with momentum; a slow drag stays where you let go
    const fling = Math.abs(vx) > 380;
    const projected = off.get() - (fling ? vx * 0.24 : 0);
    settle(Math.round(projected / T) + min, fling ? -vx : 0, fling);
  };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const v = aim.current ?? seatsRef.current;
    let n = v;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") n = v + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = v - 1;
    else if (e.key === "PageUp") n = v + 5;
    else if (e.key === "PageDown") n = v - 5;
    else if (e.key === "Home") n = min;
    else if (e.key === "End") n = max;
    else return;
    e.preventDefault();
    // the tape rolls there and the count follows it, one seat at a time
    settle(clamp(n, min, max));
  };

  // ─── autoplay: drag up from 3 to 12, fling to 24, drag back to 6 ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const own = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
      animate(gs, 1, { duration: 0.2 });
      setGrab(false);
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, v: number, duration: number, ease: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease, onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const box = () => {
      const r = tapeRef.current!.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return { cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height * 0.55 };
    };
    const moveTo = async (x: number, y: number, d: number) => {
      if (go.get() < 0.5) {
        gx.set(x - 24);
        gy.set(y + 34);
        await run(go, 1, 0.22);
      }
      await Promise.all([run(gx, x, d), run(gy, y, d)]);
    };
    // drag the tape with the ghost: it follows the finger 1:1
    const dragBy = async (from: number, dx: number, dur: number, ease?: [number, number, number, number]) => {
      const { cy } = box();
      await moveTo(from, cy, 0.34);
      await run(gs, 0.84, 0.08);
      settling.current?.stop();
      setGrab(true);
      const o0 = off.get();
      const x0 = gx.get();
      const follow = gx.on("change", (x) => off.set(band(o0 - (x - x0))));
      try {
        await run(gx, x0 + dx, dur, ease);
      } finally {
        follow();
      }
    };
    const release = async () => {
      setGrab(false);
      await run(gs, 1, 0.12);
    };
    (async () => {
      await wait(250);
      while (alive) {
        const { cx } = box();
        // 1. slowly up from 3 to 12
        if (seatsRef.current !== 3) settle(3);
        await dragBy(cx + 45, -(12 - 3) * T, 1.7, [0.3, 0, 0.6, 1]);
        settle(12);
        await release();
        await run(go, 0.35, 0.3);
        await wait(1100);
        // 2. fling to 24
        await dragBy(cx + 40, -60, 0.16, [0.3, 0, 0.9, 1]);
        settle(24, 380, true);
        await release();
        await run(go, 0, 0.3);
        await wait(2600);
        // 3. back down to 6: the newest wave and leave
        await dragBy(cx - 90, (seatsRef.current - 6) * T, 2.1, [0.45, 0, 0.55, 1]);
        settle(6);
        await release();
        await run(go, 0, 0.3);
        await wait(2400);
        // and quietly back to 3 for the next round
        await dragBy(cx - 15, 3 * T, 0.8);
        settle(3);
        await release();
        await run(go, 0, 0.3);
        await wait(1500);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const tint = rgba(planColor, 0.2);
  const ticks = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);
  const extra = seats - cap;
  const narrow = SW < 300;
  const flags = narrow ? 7 : 9;

  return (
    <div ref={rootRef} className={`scx relative w-full max-w-[460px] select-none rounded-[24px] bg-white pb-5 pt-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`} style={{ paddingLeft: pad, paddingRight: pad }}>
      <style>{CSS}</style>
      <div className="flex items-center justify-between gap-3">
        <h3 className={`m-0 font-semibold leading-tight tracking-[-0.02em] ${narrow ? "text-[16px]" : "text-[18px]"}`}>How big is your team?</h3>
        <div className="relative shrink-0 [perspective:500px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={plan.name}
              className="inline-flex items-center gap-1.5 rounded-full py-1.5 pl-2.5 pr-3 text-[13px] font-semibold leading-none shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
              style={{ background: planColor, color: planInk, boxShadow: `0 6px 14px -8px ${planColor}, inset 0 1px 0 rgba(255,255,255,.35)` }}
              initial={reduced ? { opacity: 0 } : { rotateX: -100, opacity: 0, y: 4 }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { rotateX: 100, opacity: 0, y: -4 }}
              transition={{ type: "spring", stiffness: 420, damping: 17 }}
            >
              {ic(PLAN_ICON[Math.min(planI, PLAN_ICON.length - 1)], 14)}
              {plan.name}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── the stage ─── */}
      <div className={`relative mt-4 overflow-hidden rounded-[20px] ${inView ? "" : "sc-still"}`} style={{ height: STAGE_H, background: "linear-gradient(180deg, #fbf7ff 0%, #fff6f0 58%, #ffe7da 100%)" }} aria-hidden="true">
        <motion.div className="absolute inset-0" initial={false} animate={{ backgroundColor: tint }} transition={{ duration: 0.6 }} style={{ maskImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,.55) 55%, transparent 80%)" }} />
        {/* floor */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: "46%", background: "radial-gradient(ellipse 80% 90% at 50% 100%, #ffc4aa 0%, #ffd6c3 45%, rgba(255,222,206,0) 78%)" }} />
        {/* spotlight */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 34% 95% at 50% -12%, rgba(255,255,255,.95), rgba(255,255,255,.35) 55%, rgba(255,255,255,0) 80%)" }} />
        <div className="absolute" style={{ left: "18%", right: "18%", bottom: 6, height: 46, background: "radial-gradient(closest-side, rgba(255,255,255,.85), rgba(255,255,255,0))" }} />
        {/* bunting */}
        <svg className="absolute inset-x-0 top-0" width="100%" height="36" viewBox="0 0 400 36" preserveAspectRatio="none">
          <path d="M-4 4 Q200 30 404 4" fill="none" stroke="rgba(43,34,56,.22)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute inset-x-0 top-0 flex justify-between" style={{ padding: `0 ${narrow ? 10 : 18}px` }}>
          {Array.from({ length: flags }, (_, i) => {
            const t = i / (flags - 1);
            const sag = 4 + 26 * (1 - (2 * t - 1) ** 2) * 0.5 + 2;
            return <span key={i} className="block" style={{ marginTop: sag, width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `11px solid ${SHIRTS[(i * 2) % SHIRTS.length]}`, opacity: 0.9 }} />;
          })}
        </div>

        {/* the crowd */}
        <div className="absolute inset-0">
          <AnimatePresence>
            {layout.spots.slice(0, shown).map((spot, i) => {
              const side = layout.sides[i];
              const from = side < 0 ? -(spot.x + FW * spot.s * 0.6 + 16) : SW - spot.x + FW * spot.s * 0.6 + 16;
              return (
                <Person
                  key={i}
                  seat={i}
                  spot={spot}
                  from={from}
                  delay={spawn.current.delays.get(i) ?? 0}
                  enter={!spawn.current.quiet.has(i)}
                  exitDelays={exitDelays}
                  stageW={SW}
                  reduced={reduced}
                  sign={i === cap - 1 && extra > 0 ? `+${extra} more` : null}
                  signColor={planColor === "#2fd4a0" ? "#0b7a57" : planColor}
                  onLeave={onLeave}
                />
              );
            })}
          </AnimatePresence>
        </div>
        <canvas ref={canvasRef} className="pointer-events-none absolute left-0 top-0" style={{ width: SW, height: STAGE_H }} />
      </div>

      {/* ─── the ruler ─── */}
      <div
        ref={rulerRef}
        role="slider"
        tabIndex={0}
        aria-label="Team size"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={seats}
        aria-valuetext={valueText}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className={`relative mt-4 touch-none rounded-[16px] outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${grab ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ height: 92, ["--tw-ring-color" as string]: planColor }}
      >
        {/* the pill above the tape */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <motion.div className="relative flex flex-col items-center" animate={{ scale: grab && !reduced ? 1.06 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
            <motion.span
              className="relative flex h-[32px] items-center gap-1 rounded-full px-3.5 text-[15px] font-semibold tabular-nums leading-none"
              initial={false}
              animate={{ backgroundColor: planColor, color: planInk }}
              transition={{ duration: 0.3 }}
              style={{ boxShadow: `0 8px 16px -9px ${planColor}, inset 0 1px 0 rgba(255,255,255,.35)` }}
            >
              <Odometer text={String(seats)} reduced={reduced} />
              <span className="font-medium opacity-90">{seats === 1 ? "seat" : "seats"}</span>
            </motion.span>
            <svg className="-mt-[1px] block" width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
              <motion.path d="M0 0 H14 L8.2 7.2 Q7 8.4 5.8 7.2 Z" initial={false} animate={{ fill: planColor }} transition={{ duration: 0.3 }} />
            </svg>
          </motion.div>
        </div>
        {/* the tape */}
        <div ref={tapeRef} className="absolute inset-x-0 bottom-0 overflow-hidden rounded-[14px]" style={{ height: 50, background: "linear-gradient(180deg, #ffd766 0%, #ffc83d 45%, #f5b521 100%)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.75), inset 0 -2px 0 rgba(190,120,0,.35), 0 8px 18px -10px rgba(214,140,0,.8)" }}>
          <div className="absolute inset-0" style={{ maskImage: "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)" }}>
            <motion.svg className="absolute left-0 top-0" width={span + 1} height={50} style={{ x: tapeX }} overflow="visible">
              {ticks.map((v) => {
                const x = (v - min) * T + 0.5;
                const tall = v % 10 === 0 ? 17 : v % 5 === 0 ? 12.5 : 7.5;
                return (
                  <g key={v}>
                    <line x1={x} x2={x} y1={0} y2={tall} stroke="#4a3200" strokeOpacity={v % 5 === 0 ? 0.85 : 0.5} strokeWidth={v % 5 === 0 ? 1.4 : 1} />
                    {(v % 10 === 0 || v === min) && (
                      <text x={x} y={36} textAnchor="middle" fontSize={11.5} fontWeight={650} fill="#3a2700" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {v}
                      </text>
                    )}
                  </g>
                );
              })}
            </motion.svg>
          </div>
          {/* the tick under the thumb */}
          <motion.span className="absolute top-0 block rounded-b-full" style={{ left: "50%", marginLeft: -1.75, width: 3.5, height: 22, x: hlX }} initial={false} animate={{ backgroundColor: planColor }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[10px]" style={{ background: "linear-gradient(180deg, rgba(150,90,0,.18), rgba(150,90,0,0))" }} />
        </div>
      </div>

      {/* ─── the price ─── */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
        <div className="min-w-0">
          <p className="m-0 flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[30px] font-semibold leading-none tracking-[-0.03em]">
              <Odometer text={money(total)} reduced={reduced} />
            </span>
            <span className="text-[14px] text-[#6e6e73]">per {per}</span>
            <span className="sr-only">
              {money(total)} per {per}
            </span>
          </p>
          <p className="m-0 mt-1.5 text-[13px] text-[#6e6e73]">
            {money(each)} per seat{billing === "yearly" ? " a month, " : ""}
            {billing === "yearly" && <span className="font-semibold text-[#0b7a57]">2 months free</span>}
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Billing"
          className="relative flex rounded-full bg-[#f1eff7] p-1"
          onKeyDown={(e) => {
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
              e.preventDefault();
              const b = billing === "monthly" ? "yearly" : "monthly";
              setBilling(b);
              (e.currentTarget.querySelector(`[data-billing=${b}]`) as HTMLElement | null)?.focus();
            }
          }}
        >
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={billing === b}
              tabIndex={billing === b ? 0 : -1}
              data-billing={b}
              onClick={() => setBilling(b)}
              className={`relative flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#3767ff] ${billing === b ? "text-[#1d1d1f]" : "text-[#5b5b66] hover:text-[#1d1d1f]"}`}
            >
              {billing === b && <motion.span layoutId={`sc-bill-${SW}`} className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.12),0_4px_10px_-6px_rgba(0,0,0,.25)]" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 34 }} />}
              <span className="relative">{b === "monthly" ? "Monthly" : "Yearly"}</span>
              {b === "yearly" && <span className="relative text-[#f0a500]">{ic("gift", 13)}</span>}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
