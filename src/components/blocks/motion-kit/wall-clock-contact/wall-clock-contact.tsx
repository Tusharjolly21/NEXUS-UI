"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, LayoutGroup, motion, useAnimationControls, useInView, useMotionValue, useReducedMotion, useSpring, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICONS = {
  envelope: "M9.484 48.191h37.734c4.22 0 6.657-2.437 6.657-7.265V15.05c0-4.805-2.46-7.242-7.36-7.242H8.782c-4.195 0-6.656 2.414-6.656 7.242v25.875c0 4.851 2.484 7.265 7.36 7.265m15.727-19.007L7.516 11.723c.515-.211 1.124-.328 1.851-.328h37.29c.726 0 1.359.117 1.898.375L30.883 29.184c-1.008 1.007-1.899 1.453-2.836 1.453c-.938 0-1.828-.446-2.836-1.453M5.71 40.926v-26.11l13.476 13.22L5.734 41.323c-.023-.117-.023-.258-.023-.398m44.578-25.852v26.18L36.906 28.035L50.29 14.887zM9.367 44.606c-.68 0-1.242-.094-1.734-.305l14.015-13.852l1.524 1.5c1.64 1.617 3.21 2.297 4.875 2.297c1.64 0 3.234-.68 4.875-2.297l1.523-1.5l13.993 13.828c-.493.235-1.102.328-1.782.328Z",
  phone: "M39.156 50.934c4.078 0 6.774-1.102 9.164-3.774c.188-.187.352-.398.54-.586c1.406-1.57 2.062-3.117 2.062-4.593c0-1.688-.984-3.258-3.07-4.712l-6.82-4.734c-2.11-1.453-4.571-1.617-6.54.328l-1.804 1.805c-.54.539-1.008.563-1.547.234c-1.242-.797-3.797-3.023-5.532-4.757c-1.828-1.805-3.609-3.82-4.523-5.297c-.328-.54-.281-.985.258-1.524l1.781-1.805c1.969-1.968 1.805-4.453.352-6.538l-4.758-6.82c-1.43-2.087-3-3.048-4.688-3.071c-1.476-.024-3.023.656-4.593 2.062c-.211.188-.399.352-.61.516c-2.648 2.39-3.75 5.086-3.75 9.14c0 6.704 4.125 14.86 11.696 22.43c7.523 7.524 15.703 11.696 22.382 11.696m.024-3.61c-5.977.117-13.64-4.476-19.711-10.523c-6.117-6.094-10.922-14.016-10.805-19.992c.047-2.579.938-4.805 2.79-6.399c.14-.14.28-.258.444-.375c.68-.61 1.454-.937 2.11-.937c.703 0 1.312.257 1.758.96l4.547 6.82c.492.727.539 1.548-.188 2.274l-2.062 2.063c-1.641 1.617-1.5 3.586-.328 5.156c1.335 1.805 3.656 4.43 5.437 6.211c1.805 1.805 4.64 4.336 6.445 5.695c1.57 1.172 3.563 1.29 5.18-.328l2.062-2.062c.727-.727 1.524-.68 2.25-.211l6.82 4.547c.704.468.985 1.054.985 1.758c0 .68-.328 1.43-.96 2.132a6 6 0 0 1-.352.446c-1.617 1.828-3.844 2.718-6.422 2.765",
  "arrow-up-right": "M44.02 36.215V14.207c0-1.336-.844-2.227-2.227-2.227l-22.008.047c-1.289 0-2.156.961-2.156 2.063c0 1.101.984 2.039 2.062 2.039h6.985l11.156-.422l-4.266 3.75l-20.93 20.977c-.421.422-.655.937-.655 1.43c0 1.1.984 2.156 2.132 2.156c.54 0 1.032-.211 1.453-.633L36.543 22.41l3.75-4.242l-.422 10.664v7.477c0 1.078.938 2.062 2.063 2.062c1.101 0 2.086-.914 2.086-2.156",
  "checkmark-alt": "m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0",
  "doc-on-doc": "M11.505 56h21.4c4.561 0 6.721-2.314 6.721-6.92v-4.077h4.298c4.54 0 6.81-2.314 6.81-6.92V19.636c0-2.71-.53-4.43-2.182-6.126L37.422 2.182C35.836.573 34.006 0 31.648 0h-9.013c-4.54 0-6.833 2.314-6.833 6.92v4.077h-4.297c-4.54 0-6.832 2.314-6.832 6.92V49.08c0 4.628 2.292 6.92 6.832 6.92m28.121-24.683c0-2.821-.33-4.055-2.093-5.863L25.389 13.092c-1.675-1.72-3.063-2.094-5.553-2.094h-.485V6.964c0-2.16 1.19-3.416 3.46-3.416h9.3v11.526c0 2.535 1.256 3.769 3.769 3.769h11.306v19.196c0 2.181-1.169 3.416-3.46 3.416h-4.1Zm-3.217-15.67c-.794 0-1.102-.33-1.102-1.101V4.253l11.195 11.394ZM11.68 52.452c-2.27 0-3.46-1.234-3.46-3.438V17.96c0-2.16 1.19-3.415 3.482-3.415h7.648v12.782c0 2.777 1.41 4.143 4.143 4.143h12.584v17.543c0 2.204-1.19 3.438-3.482 3.438Zm12.232-24.309c-.882 0-1.234-.352-1.234-1.212V15.23l12.716 12.914Z",
  "paperplane-fill": "M32.781 52.55c1.688 0 2.883-1.452 3.75-3.702L51.883 8.746c.422-1.078.68-2.039.68-2.836c0-1.523-.961-2.46-2.485-2.46c-.797 0-1.758.234-2.836.656L6.93 19.55c-1.97.75-3.493 1.945-3.493 3.656c0 2.156 1.641 2.883 3.891 3.563l12.68 3.843c1.476.47 2.32.422 3.328-.515l25.71-24.024c.305-.281.657-.234.892-.023c.234.234.257.586-.024.89l-23.93 25.805c-.89.961-.984 1.758-.515 3.328l3.703 12.375c.703 2.367 1.43 4.102 3.61 4.102",
} as const;

type IconName = keyof typeof ICONS;

function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

export interface WallClockContactPerson {
  /** First name, used in "Amara will reply by 16:30". */
  name: string;
  /** What this person covers. Shown as a choice in the "To" row. */
  topic: string;
}

export interface WallClockContactMessage {
  /** The topic that was picked. */
  topic: string;
  /** Who covers that topic. */
  recipient: string;
  name: string;
  email: string;
  message: string;
  /** When a reply is promised, in the office's time, for example `by 16:30` or `tomorrow by 10:30`. */
  replyBy: string;
}

export interface WallClockContactProps {
  /** Heading above the clock. */
  title?: string;
  /** Line under the heading. */
  subtitle?: string;
  /** Name of the office, printed on the dial and used in "14:32 in London". */
  city?: string;
  /** IANA time zone the office keeps. The server and the client both start from the same rest pose, so this never causes a hydration mismatch. Unknown zones fall back to UTC. */
  timeZone?: string;
  /** Hour the office opens, 0 to 24 (decimals allowed, 9.5 is 09:30). */
  openHour?: number;
  /** Hour the office closes, 0 to 24. Must be later than `openHour`. */
  closeHour?: number;
  /** Days the office is open, 0 (Sunday) to 6 (Saturday). */
  openDays?: number[];
  /** Working hours between sending a message and the reply. */
  replyAfterHours?: number;
  /** Who answers which topic. At least one person; the first is picked by default. */
  team?: WallClockContactPerson[];
  /** Address that copies with one press. */
  email?: string;
  /** Number that dials. */
  phone?: string;
  /** Accent colour on the light theme. Used behind white text on the Send button, so keep it dark enough for that. Defaults to #0071e3. */
  accent?: string;
  /** Accent colour on the dark theme. Defaults to #2997ff. */
  accentDark?: string;
  /**
   * Called with the validated, trimmed message when someone presses Send. The block never sends anything
   * itself: it only shows the confirmation, so wire your own request in here. The autoplay demo never calls it.
   */
  onSend?: (message: WallClockContactMessage) => void;
  /** Writes a message and sends it by itself, so the hands sweep, until the first pointer, key or touch. Off under reduced motion, paused when under 30% in view. */
  autoplay?: boolean;
  className?: string;
}

const DEFAULT_TEAM: WallClockContactPerson[] = [
  { name: "Amara", topic: "Sales" },
  { name: "Jon", topic: "Support" },
  { name: "Priya", topic: "Partnerships" },
  { name: "Theo", topic: "Press" },
];
const DEFAULT_DAYS = [1, 2, 3, 4, 5];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_MESSAGE = 600;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEMO_NAME = "Rowan Ellis";
const DEMO_EMAIL = "rowan@example.com";
const DEMO_BODY = "we are planning a rollout for forty seats next month and would like a walkthrough.";

// ---------------------------------------------------------------------------------------------
// Time. Nothing here runs during render: "now" only ever comes from an effect or an event handler.
// ---------------------------------------------------------------------------------------------

interface Hours {
  timeZone: string;
  open: number;
  close: number;
  days: number[];
  replyAfter: number;
}
interface Zoned {
  day: number;
  h: number;
  m: number;
  s: number;
}
interface Reply {
  h: number;
  m: number;
  label: string;
}
interface Plan {
  open: boolean;
  line: string;
  reply: Reply;
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmtMins = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(Math.round(mins % 60))}`;
const dur = (mins: number) => {
  if (mins < 60) return `${Math.max(1, Math.round(mins))} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m === 60 ? `${h + 1}h` : m ? `${h}h ${m}m` : `${h}h`;
};

function normalise(timeZone: string, open: number, close: number, days: number[], replyAfter: number): Hours {
  const ok = Number.isFinite(open) && Number.isFinite(close) && close > open;
  const clean = Array.from(new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))).sort((a, b) => a - b);
  return {
    timeZone,
    open: ok ? Math.max(0, open) : 9,
    close: ok ? Math.min(24, close) : 18,
    days: clean.length ? clean : DEFAULT_DAYS,
    replyAfter: Number.isFinite(replyAfter) ? Math.max(0, replyAfter) : 2,
  };
}

const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { weekday: "short", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" };
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatterFor(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat("en-US", { ...FORMAT_OPTIONS, timeZone });
    } catch {
      f = new Intl.DateTimeFormat("en-US", { ...FORMAT_OPTIONS, timeZone: "UTC" });
    }
    formatters.set(timeZone, f);
  }
  return f;
}

/** The office's weekday, hour, minute and second at the instant `d`. */
function zoneNow(timeZone: string, d: Date): Zoned {
  const parts = formatterFor(timeZone).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return { day: Math.max(0, SHORT_DAYS.indexOf(get("weekday"))), h: parseInt(get("hour"), 10) % 24, m: parseInt(get("minute"), 10), s: parseInt(get("second"), 10) };
}

function daysLabel(days: number[]) {
  if (days.length === 7) return "Every day";
  if (days.length > 2 && days.every((d, i) => i === 0 || d === days[i - 1] + 1)) return `${SHORT_DAYS[days[0]]} to ${SHORT_DAYS[days[days.length - 1]]}`;
  return days.map((d) => SHORT_DAYS[d]).join(", ");
}

/** When a message sent at `t` is answered: `replyAfter` hours into working time, rounded up to ten minutes. */
function replyFor(hrs: Hours, t: Zoned): Reply {
  const open = hrs.open * 60;
  const close = hrs.close * 60;
  let need = hrs.replyAfter * 60;
  let offset = 0;
  let at = t.h * 60 + t.m + t.s / 60;
  for (let guard = 0; guard < 30; guard++) {
    if (hrs.days.includes((t.day + offset) % 7) && at < close) {
      if (at < open) at = open;
      const take = Math.min(need, close - at);
      at += take;
      need -= take;
      if (need <= 1e-6) break;
    }
    offset += 1;
    at = 0;
  }
  let rounded = Math.ceil(at / 10 - 1e-6) * 10;
  if (rounded >= 1440) {
    rounded -= 1440;
    offset += 1;
  }
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  const when = offset === 0 ? "" : offset === 1 ? "tomorrow " : `on ${WEEKDAYS[(t.day + offset) % 7]} `;
  return { h, m, label: `${when}by ${pad(h)}:${pad(m)}` };
}

/** Open or not, when that changes, and when a message sent now is answered. */
function planFor(hrs: Hours, t: Zoned): Plan {
  const open = hrs.open * 60;
  const close = hrs.close * 60;
  const mins = t.h * 60 + t.m + t.s / 60;
  const isOpen = hrs.days.includes(t.day) && mins >= open && mins < close;
  let line = "";
  if (isOpen) line = `Closes in ${dur(close - mins)}`;
  else {
    for (let k = 0; k < 8; k++) {
      const day = (t.day + k) % 7;
      if (!hrs.days.includes(day) || (k === 0 && mins >= open)) continue;
      const wait = k * 1440 + open - mins;
      line = wait < 720 ? `Opens in ${dur(wait)}` : `Opens ${k === 1 ? "tomorrow" : WEEKDAYS[day]} at ${fmtMins(open)}`;
      break;
    }
  }
  return { open: isOpen, line, reply: replyFor(hrs, t) };
}

// ---------------------------------------------------------------------------------------------
// The clock
// ---------------------------------------------------------------------------------------------

const svgUrl = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const GRAIN = svgUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='a'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .45 -.22'/></filter><rect width='100%' height='100%' filter='url(#a)'/></svg>`,
);

/** The pose before the real time arrives (and on the server): ten past ten, the way a shop window shows it. */
const REST: Zoned = { day: 0, h: 10, m: 10, s: 0 };

/** Turn a hand to an angle without ever unwinding: forward only, or by the shorter way round. */
function turn(mv: MotionValue<number>, to: number, forward: boolean) {
  const cur = mv.get();
  let d = (((to - cur) % 360) + 360) % 360;
  if (d > 359.99) d = 0;
  if (!forward && d > 180) d -= 360;
  mv.set(cur + d);
}

/** One hand, drawn pointing at twelve in a 200 box and turned about the centre. Its shadow falls down and right. */
function Hand({ rot, shadow, children }: { rot: MotionValue<number>; shadow: number; children: ReactNode }) {
  return (
    <>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30" style={{ rotate: rot, x: shadow * 0.5, y: shadow, filter: `blur(${shadow * 0.5}px)` }}>
        <svg viewBox="0 0 200 200" className="h-full w-full brightness-0">
          {children}
        </svg>
      </motion.div>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ rotate: rot }}>
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {children}
        </svg>
      </motion.div>
    </>
  );
}

interface ClockProps {
  time: Zoned | null;
  hours: Hours;
  city: string;
  open: boolean;
  label: string;
  preview: { h: number; m: number } | null;
  mark: { h: number; m: number } | null;
  reduce: boolean;
}

/**
 * A turned-aluminium wall clock with a domed crystal. The open hours are marked round the inside of the dial and a
 * quartz second hand ticks with a little overshoot. `preview` sweeps the hands forward to another time (the reply
 * time) and `mark` leaves a pip on the dial there.
 */
function Clock({ time, hours, city, open, label, preview, mark, reduce }: ClockProps) {
  const base = time ?? REST;
  const secMv = useMotionValue(REST.s * 6);
  const minMv = useMotionValue(REST.m * 6);
  const hrMv = useMotionValue((REST.h % 12) * 30 + REST.m * 0.5);
  const secS = useSpring(secMv, { stiffness: 900, damping: 26 });
  const minS = useSpring(minMv, { stiffness: 60, damping: 15, mass: 1.2 });
  const hrS = useSpring(hrMv, { stiffness: 50, damping: 15, mass: 1.4 });

  const { h: bh, m: bm, s: bs } = base;
  const ph = preview?.h;
  const pm = preview?.m;
  useEffect(() => {
    const previewing = ph !== undefined && pm !== undefined;
    const h = previewing ? ph : bh;
    const m = previewing ? pm : bm;
    turn(secMv, bs * 6, true);
    turn(minMv, m * 6 + (previewing ? 0 : bs * 0.1), previewing);
    turn(hrMv, (h % 12) * 30 + m * 0.5, previewing);
  }, [bh, bm, bs, ph, pm, secMv, minMv, hrMv]);

  const at = (hour: number, r: number) => {
    const a = (hour / 12) * Math.PI * 2 - Math.PI / 2;
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
  };
  const span = hours.close - hours.open;
  const [ax, ay] = at(hours.open, 70);
  const [bx, by] = at(hours.close, 70);
  const arc = span >= 12 ? "M100 30 A70 70 0 1 1 99.99 30" : `M${ax.toFixed(2)} ${ay.toFixed(2)} A70 70 0 ${span > 6 ? 1 : 0} 1 ${bx.toFixed(2)} ${by.toFixed(2)}`;
  const pip = mark ? at((mark.h % 12) + mark.m / 60, 70) : null;
  const ink = "#1d1d1f";

  return (
    <div
      role="img"
      aria-label={label}
      className="relative aspect-square w-[clamp(168px,48cqi,224px)] shrink-0 rounded-full p-[4.4%] shadow-[0_1px_1px_rgba(0,0,0,.18),0_18px_34px_-14px_rgba(0,0,0,.35),0_40px_70px_-40px_rgba(0,0,0,.3),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_1px_rgba(0,0,0,.12)] dark:shadow-[0_1px_1px_rgba(0,0,0,.6),0_22px_40px_-14px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.08),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_1px_rgba(0,0,0,.12)]"
      style={{ background: "conic-gradient(from 210deg, #d4d4d9, #fbfbfc 12%, #c4c4ca 26%, #f4f4f6 40%, #cfcfd4 55%, #ffffff 68%, #c8c8cd 84%, #d4d4d9)" }}
    >
      {/* turned rings in the metal */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full" style={{ background: "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0 1px, rgba(0,0,0,.035) 1px 2px)" }} />
      <div
        className="relative h-full w-full overflow-hidden rounded-full"
        style={{ background: "radial-gradient(circle at 50% 40%, #ffffff, #f6f5f2 62%, #ebe9e4)", boxShadow: "inset 0 4px 8px rgba(0,0,0,.22), inset 0 -1px 1px rgba(255,255,255,.9), 0 0 0 1px rgba(0,0,0,.08)" }}
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-multiply" style={{ backgroundImage: GRAIN, opacity: 0.35 }} />
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* the open hours, round the inside of the track */}
          <path d={arc} fill="none" style={{ stroke: "var(--mk-a)" }} strokeOpacity={open ? 0.2 : 0.1} strokeWidth={9} strokeLinecap="round" />
          <path d={arc} fill="none" style={{ stroke: "var(--mk-a)" }} strokeOpacity={open ? 0.9 : 0.4} strokeWidth={1.4} strokeLinecap="round" />
          {Array.from({ length: 60 }, (_, i) => {
            const big = i % 5 === 0;
            const main = i % 15 === 0;
            const [x1, y1] = at(i / 5, big ? 80 : 88);
            const [x2, y2] = at(i / 5, 93);
            return <line key={i} x1={x1.toFixed(2)} y1={y1.toFixed(2)} x2={x2.toFixed(2)} y2={y2.toFixed(2)} stroke={big ? "#2a2a2c" : "#a8a8ad"} strokeWidth={main ? 3.4 : big ? 2.2 : 0.7} strokeLinecap={big ? "round" : "butt"} />;
          })}
          <text x="100" y="70" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#6e6e73" style={{ letterSpacing: "0.16em" }}>
            {city.toUpperCase()}
          </text>
          {time && (
            <text x="100" y="138" textAnchor="middle" fontSize="8" fontWeight="600" fill={open ? "#0a6f2b" : "#6e6e73"} style={{ letterSpacing: "0.18em" }}>
              {open ? "OPEN" : "CLOSED"}
            </text>
          )}
          {pip && (
            <g>
              <motion.circle cx={pip[0]} cy={pip[1]} fill="#fff" style={{ stroke: "var(--mk-a)" }} strokeWidth={2} initial={{ r: 0 }} animate={{ r: 5.5 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 14, delay: 1.2 }} />
              <motion.circle cx={pip[0]} cy={pip[1]} style={{ fill: "var(--mk-a)" }} initial={{ r: 0 }} animate={{ r: 2 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 14, delay: 1.3 }} />
            </g>
          )}
        </svg>
        <Hand rot={reduce ? hrMv : hrS} shadow={3}>
          <path d="M97.6 108 L98.6 56 Q100 50 101.4 56 L102.4 108 Q100 110 97.6 108Z" fill={ink} />
        </Hand>
        <Hand rot={reduce ? minMv : minS} shadow={4}>
          <path d="M98.3 110 L99.2 30 Q100 25 100.8 30 L101.7 110 Q100 111.5 98.3 110Z" fill={ink} />
        </Hand>
        {reduce ? (
          <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <circle cx="100" cy="100" r="3.4" style={{ fill: "var(--mk-a)" }} />
            <circle cx="100" cy="100" r="1.3" fill="#fff" />
          </svg>
        ) : (
          <Hand rot={secS} shadow={5}>
            <line x1="100" y1="124" x2="100" y2="22" style={{ stroke: "var(--mk-a)" }} strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="100" cy="116" r="3.2" style={{ fill: "var(--mk-a)" }} />
            <circle cx="100" cy="100" r="3.4" style={{ fill: "var(--mk-a)" }} />
            <circle cx="100" cy="100" r="1.3" fill="#fff" />
          </Hand>
        )}
        {/* the crystal: a domed glass catching the room light */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full" style={{ background: "radial-gradient(120% 70% at 28% 8%, rgba(255,255,255,.75), rgba(255,255,255,0) 42%), linear-gradient(200deg, rgba(255,255,255,0) 55%, rgba(255,255,255,.35) 72%, rgba(255,255,255,0) 80%)" }} />
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.6), inset 0 -10px 20px -12px rgba(0,0,0,.15)" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// The block
// ---------------------------------------------------------------------------------------------

interface Values {
  name: string;
  email: string;
  message: string;
}
type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;
interface Sent {
  person: WallClockContactPerson;
  email: string;
  reply: Reply;
  demo: boolean;
}

const subscribeNever = () => () => {};

const EMPTY: Values = { name: "", email: "", message: "" };

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 2) errors.name = "Add your name so we know who to answer.";
  if (!v.email.trim()) errors.email = "Add an email we can reply to.";
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "That email address looks incomplete.";
  if (v.message.trim().length < 10) errors.message = "Write a few more words so we know how to help.";
  return errors;
}

const SHEET =
  "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_2px_4px_rgba(0,0,0,.04),0_40px_70px_-44px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_40px_70px_-40px_rgba(0,0,0,.9)]";
const ROW =
  "relative flex items-center gap-3 border-t border-black/[.06] px-5 after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-[3px] after:bg-[color:var(--mk-x)] after:opacity-0 after:transition-opacity focus-within:after:opacity-100 data-invalid:after:bg-[#ff3b30] data-invalid:after:opacity-100 dark:border-white/10";
const LABEL = "w-14 shrink-0 text-[14px] text-[#6e6e73] dark:text-[#98989d]";
const INPUT =
  "min-w-0 flex-1 bg-transparent py-3.5 text-[15px] text-[#1d1d1f] outline-hidden placeholder:text-[#767680] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93]";
const ERROR = "m-0 px-5 pb-2.5 text-[12.5px] leading-[1.4] text-[#c4001a] dark:text-[#ff6961]";

/**
 * Contact section built round a wall clock set to the office's time: its open hours are marked on the dial and a
 * quartz second hand ticks. Beside it sit open or closed and when that changes, an email that copies with one
 * press and a phone number that dials. The message is written on a compose sheet addressed to whoever covers the
 * topic you pick. Send it and the sheet flies off, the clock's hands sweep forward to when you will hear back and
 * leave a pip on the dial there, then settle back to now.
 */
export function WallClockContact({
  title = "Talk to a person.",
  subtitle = "A real team reads every message. This is their clock.",
  city = "London",
  timeZone = "Europe/London",
  openHour = 9,
  closeHour = 18,
  openDays = DEFAULT_DAYS,
  replyAfterHours = 2,
  team = DEFAULT_TEAM,
  email = "hello@studio.example",
  phone = "+44 20 7946 0321",
  accent = "#0071e3",
  accentDark = "#2997ff",
  onSend,
  autoplay = true,
  className,
}: WallClockContactProps) {
  // framer-motion reads the media query on the very first client render, which would not match the server's markup.
  // Waiting for hydration keeps the first render identical on both sides; the reduced layout follows straight after.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  const prefersReduced = useReducedMotion();
  const reduce = hydrated && !!prefersReduced;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { amount: 0.3 });

  const daysKey = openDays.join(",");
  const hours = useMemo(
    () => normalise(timeZone, openHour, closeHour, daysKey ? daysKey.split(",").map(Number) : [], replyAfterHours),
    [timeZone, openHour, closeHour, daysKey, replyAfterHours],
  );
  const people = team.length > 0 ? team : DEFAULT_TEAM;

  // Latest props for timers and handlers, so the demo does not restart when a parent passes new inline values.
  const latest = useRef({ hours, people, onSend });
  useEffect(() => {
    latest.current = { hours, people, onSend };
  });

  // "Now" is unknown on the server and on the first client render, so both draw the same rest pose.
  const [now, setNow] = useState<Date | null>(null);
  const zoned = useMemo(() => (now ? zoneNow(hours.timeZone, now) : null), [now, hours.timeZone]);
  const plan = useMemo(() => (zoned ? planFor(hours, zoned) : null), [zoned, hours]);
  useEffect(() => {
    if (!inView) return;
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, reduce ? 15000 : 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [inView, reduce]);

  const [touched, setTouched] = useState(false);
  const wake = useCallback(() => setTouched(true), []);

  const [pick, setPick] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<Sent | null>(null);
  const [preview, setPreview] = useState<{ h: number; m: number } | null>(null);
  const [mark, setMark] = useState<{ h: number; m: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const who = people[Math.min(pick, people.length - 1)];

  const shake = useAnimationControls();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const sentHead = useRef<HTMLParagraphElement>(null);
  const clockBox = useRef<HTMLDivElement>(null);
  const refocus = useRef(false);
  const sweep = useRef<number[]>([]);
  const copyTimer = useRef(0);

  const clearSweep = useCallback(() => {
    sweep.current.forEach((id) => window.clearTimeout(id));
    sweep.current = [];
  }, []);
  useEffect(
    () => () => {
      sweep.current.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(copyTimer.current);
    },
    [],
  );

  /** Show the confirmation, send the hands off to the reply time and, for a real send, hand the message to `onSend`. */
  const commit = useCallback(
    (idx: number, vals: Values, demo: boolean) => {
      const { hours: h, people: p, onSend: callback } = latest.current;
      const person = p[Math.min(idx, p.length - 1)];
      const reply = replyFor(h, zoneNow(h.timeZone, new Date()));
      clearSweep();
      setErrors({});
      setMark(null);
      setSent({ person, email: vals.email.trim(), reply, demo });
      // the hands go and show when you will hear back, leave a mark, and come home
      sweep.current.push(
        window.setTimeout(() => {
          setPreview({ h: reply.h, m: reply.m });
          setMark({ h: reply.h, m: reply.m });
        }, 350),
        window.setTimeout(() => setPreview(null), 3400),
      );
      if (!demo) callback?.({ topic: person.topic, recipient: person.name, name: vals.name.trim(), email: vals.email.trim(), message: vals.message.trim(), replyBy: reply.label });
    },
    [clearSweep],
  );

  const restart = useCallback(() => {
    clearSweep();
    setSent(null);
    setMark(null);
    setPreview(null);
    setErrors({});
  }, [clearSweep]);

  // The demo: pick a topic, write a message, send it, watch the hands, start again.
  const demoOn = autoplay && !reduce && inView && !touched;
  useEffect(() => {
    if (!demoOn) return;
    const ids: number[] = [];
    const after = (ms: number, fn: () => void) => {
      ids.push(window.setTimeout(fn, ms));
    };
    const round = (k: number) => {
      const p = latest.current.people;
      const idx = k % p.length;
      const words = `Hi ${p[idx].name}, ${DEMO_BODY}`.split(" ");
      let t = 900;
      after(t, () => setPick(idx));
      t += 800;
      after(t, () => setValues({ name: DEMO_NAME, email: DEMO_EMAIL, message: "" }));
      t += 600;
      words.forEach((_, i) => after(t + i * 95, () => setValues((v) => ({ ...v, message: words.slice(0, i + 1).join(" ") }))));
      t += words.length * 95 + 700;
      after(t, () => commit(idx, { name: DEMO_NAME, email: DEMO_EMAIL, message: words.join(" ") }, true));
      t += 5200;
      after(t, () => {
        setValues(EMPTY);
        restart();
      });
      after(t + 1200, () => round(k + 1));
    };
    round(0);
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      setValues(EMPTY);
      restart();
    };
  }, [demoOn, commit, restart]);

  // Focus follows a person's actions only, never the demo.
  useEffect(() => {
    if (sent && !sent.demo) sentHead.current?.focus({ preventScroll: true });
    if (!sent && refocus.current) {
      refocus.current = false;
      messageRef.current?.focus({ preventScroll: true });
    }
  }, [sent]);

  const setField = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: validate(next)[field] }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    const first = next.name ? nameRef : next.email ? emailRef : next.message ? messageRef : null;
    if (first) {
      first.current?.focus();
      if (!reduce) void shake.start({ x: [0, -9, 8, -6, 4, -2, 0], transition: { duration: 0.45 } });
      return;
    }
    commit(pick, values, false);
    // on a narrow screen the clock is above the sheet: bring it into view so the hands can be seen
    const clock = clockBox.current;
    if (clock) {
      const r = clock.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) clock.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  };

  const again = () => {
    refocus.current = true;
    setValues((v) => ({ ...v, message: "" }));
    restart();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  const onRadioKey = (e: ReactKeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = people.length;
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    setPick(next);
    radios.current[next]?.focus();
  };

  const range = `${fmtMins(hours.open * 60)} to ${fmtMins(hours.close * 60)}`;
  const week = daysLabel(hours.days);
  const clockLabel = zoned ? `Wall clock set to ${city} time, ${pad(zoned.h)}:${pad(zoned.m)}. Open ${week}, ${range}.` : `Wall clock for ${city}. Open ${week}, ${range}.`;
  const isOpen = !!plan?.open;
  const replyLine = plan ? `${plan.reply.label} ${city} time` : "";
  const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
  const soft = "text-[#6e6e73] dark:text-[#98989d]";
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 32 };

  return (
    <section
      ref={root}
      aria-labelledby={`${uid}-title`}
      onPointerDown={wake}
      onPointerMove={wake}
      onKeyDown={wake}
      onTouchStart={wake}
      className={cn("@container w-full bg-[#f5f5f7] text-[#1d1d1f] [--mk-x:var(--mk-a)] dark:bg-black dark:text-[#f5f5f7] dark:[--mk-x:var(--mk-ad)]", className)}
      style={{ "--mk-a": accent, "--mk-ad": accentDark } as CSSProperties}
    >
      <div className="mx-auto grid w-full max-w-[1040px] gap-10 px-5 py-14 @2xl:px-8 @2xl:py-20 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @4xl:items-start @4xl:gap-14">
        <div className="min-w-0">
          <h2 id={`${uid}-title`} className={cn("m-0 text-[clamp(30px,6cqi,48px)] font-semibold leading-[1.05] tracking-[-0.035em]", ink)}>
            {title}
          </h2>
          {subtitle && <p className={cn("m-0 mt-3 max-w-[380px] text-[17px] leading-[1.45]", soft)}>{subtitle}</p>}

          <div className="mt-9 flex flex-col items-start gap-6 @xl:flex-row @xl:items-center @xl:gap-8">
            <div ref={clockBox} className="shrink-0">
              <Clock time={zoned} hours={hours} city={city} open={isOpen} label={clockLabel} preview={preview} mark={mark} reduce={reduce} />
            </div>
            <div className="min-w-0">
              <p className={cn("m-0 flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.015em]", ink)}>
                <span className="relative grid size-2.5 place-items-center" aria-hidden="true">
                  {isOpen && inView && !reduce && <span className="absolute inset-0 animate-ping rounded-full bg-[#30d158] opacity-50" />}
                  <span className={cn("relative size-2.5 rounded-full", plan ? (isOpen ? "bg-[#30d158]" : "bg-[#ff9f0a]") : "bg-[#8e8e93]")} />
                </span>
                {plan ? (isOpen ? "Open now" : "Closed right now") : "Office hours"}
              </p>
              <p className={cn("m-0 mt-1.5 text-[15px] tabular-nums", soft)}>{plan ? plan.line : "Hours are on the dial"}</p>
              <p className={cn("m-0 mt-0.5 text-[13.5px] tabular-nums", soft)}>{zoned ? `${pad(zoned.h)}:${pad(zoned.m)} in ${city}` : `Shown in ${city} time`}</p>
              <p className={cn("m-0 mt-0.5 text-[13.5px] tabular-nums", soft)}>
                {week}, <span className="whitespace-nowrap">{range}</span>
              </p>
              <div aria-live={demoOn ? "off" : "polite"} className="mt-4 max-w-[300px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={mark && sent ? "marked" : "idle"}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
                    className={cn("m-0 text-[13.5px] leading-[1.5]", ink)}
                  >
                    {mark && sent
                      ? `${sent.person.name} will reply ${sent.reply.label} ${city} time. That is the dot on the dial.`
                      : plan
                        ? `Send a message now and you will hear back ${replyLine}.`
                        : "Messages are answered during open hours."}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-9 overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
            <button
              type="button"
              onClick={copy}
              aria-label={`Email ${email}. Press to copy the address.`}
              className="flex min-h-16 w-full items-center gap-3 border-b border-black/[.06] px-4 py-3 text-left outline-hidden transition-colors hover:bg-black/[.025] focus-visible:ring-2 focus-visible:ring-[color:var(--mk-x)] focus-visible:ring-inset dark:border-white/10 dark:hover:bg-white/[.04]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] dark:bg-white/10 dark:text-[#f5f5f7]">
                <Icon name="envelope" size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[12.5px]", soft)}>Email</span>
                <span className={cn("block truncate text-[15px]", ink)}>{email}</span>
              </span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copied ? "copied" : "copy"}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
                  className={cn("flex shrink-0 items-center gap-1.5 text-[13px] font-medium", copied ? "text-[#1c7c38] dark:text-[#30d158]" : "text-[color:var(--mk-x)]")}
                  aria-hidden="true"
                >
                  {copied ? (
                    <>
                      <Icon name="checkmark-alt" size={13} />
                      <span className="@max-sm:hidden">Copied</span>
                    </>
                  ) : (
                    <>
                      <Icon name="doc-on-doc" size={14} />
                      <span className="@max-sm:hidden">Copy</span>
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
            <span role="status" className="sr-only">
              {copied ? "Email address copied" : ""}
            </span>
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="flex min-h-16 items-center gap-3 px-4 py-3 no-underline outline-hidden transition-colors hover:bg-black/[.025] focus-visible:ring-2 focus-visible:ring-[color:var(--mk-x)] focus-visible:ring-inset dark:hover:bg-white/[.04]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] dark:bg-white/10 dark:text-[#f5f5f7]">
                <Icon name="phone" size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[12.5px]", soft)}>{plan && !isOpen ? "Phone, when we are open" : "Phone"}</span>
                <span className={cn("block text-[15px] tabular-nums", ink)}>{phone}</span>
              </span>
              <span className={cn("shrink-0", soft)}>
                <Icon name="arrow-up-right" size={13} />
              </span>
            </a>
          </div>
        </div>

        {/* the compose sheet */}
        <motion.div
          className="relative min-h-[500px] min-w-0"
          style={{ perspective: 1200 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!sent ? (
              <motion.form
                key="sheet"
                onSubmit={submit}
                noValidate
                animate={shake}
                exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { y: -90, scale: 0.86, rotateX: 14, opacity: 0, transition: { duration: 0.55, ease: [0.55, 0, 0.75, 0.2] } }}
                aria-label="Send a message"
                className={cn("relative overflow-hidden rounded-[24px]", SHEET)}
              >
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                  <p className={cn("m-0 text-[15px] font-semibold tracking-[-0.01em]", ink)}>New message</p>
                  <p className={cn("m-0 text-[12.5px] tabular-nums", soft)} aria-hidden="true">
                    {values.message.length}/{MAX_MESSAGE}
                  </p>
                </div>

                <div className={cn(ROW, "min-h-[54px] items-start py-2")}>
                  <span id={`${uid}-to`} className={cn(LABEL, "pt-[10px] [@media(pointer:coarse)]:pt-[14px]")}>
                    To
                  </span>
                  <LayoutGroup id={`${uid}-chips`}>
                    <div role="radiogroup" aria-labelledby={`${uid}-to`} className="flex min-w-0 flex-wrap gap-1 py-0.5">
                      {people.map((p, i) => {
                        const on = i === Math.min(pick, people.length - 1);
                        return (
                          <button
                            key={`${p.topic}-${i}`}
                            ref={(el) => {
                              radios.current[i] = el;
                            }}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            tabIndex={on ? 0 : -1}
                            onClick={() => setPick(i)}
                            onKeyDown={(e) => onRadioKey(e, i)}
                            className={cn(
                              "relative inline-flex h-9 items-center rounded-full px-3.5 text-[13.5px] font-medium outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--mk-x)] [@media(pointer:coarse)]:h-11",
                              on ? ink : cn(soft, "hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]"),
                            )}
                          >
                            {on && (
                              <motion.span
                                layoutId={`${uid}-pill`}
                                aria-hidden="true"
                                className="absolute inset-0 rounded-full"
                                style={{ background: "color-mix(in srgb, var(--mk-x) 13%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--mk-x) 38%, transparent)" }}
                                transition={spring}
                              />
                            )}
                            <span className="relative">{p.topic}</span>
                          </button>
                        );
                      })}
                    </div>
                  </LayoutGroup>
                </div>

                <div data-invalid={errors.name ? "" : undefined} className={ROW}>
                  <label htmlFor={`${uid}-name`} className={LABEL}>
                    Name
                  </label>
                  <input
                    ref={nameRef}
                    id={`${uid}-name`}
                    value={values.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                    className={INPUT}
                  />
                </div>
                <FieldError id={`${uid}-name-err`} text={errors.name} reduce={reduce} />

                <div data-invalid={errors.email ? "" : undefined} className={ROW}>
                  <label htmlFor={`${uid}-email`} className={LABEL}>
                    Email
                  </label>
                  <input
                    ref={emailRef}
                    id={`${uid}-email`}
                    type="email"
                    inputMode="email"
                    value={values.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? `${uid}-email-err` : undefined}
                    className={INPUT}
                  />
                </div>
                <FieldError id={`${uid}-email-err`} text={errors.email} reduce={reduce} />

                <div data-invalid={errors.message ? "" : undefined} className={cn(ROW, "block py-3.5")}>
                  <label htmlFor={`${uid}-message`} className="sr-only">
                    Message
                  </label>
                  <textarea
                    ref={messageRef}
                    id={`${uid}-message`}
                    value={values.message}
                    onChange={(e) => setField("message", e.target.value.slice(0, MAX_MESSAGE))}
                    maxLength={MAX_MESSAGE}
                    rows={7}
                    placeholder={`Hi ${who.name}, tell us what you need.`}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? `${uid}-message-err` : undefined}
                    className={cn("block w-full resize-none bg-transparent text-[15.5px] leading-[1.55] outline-hidden placeholder:text-[#767680] dark:placeholder:text-[#8e8e93]", ink)}
                  />
                </div>
                <FieldError id={`${uid}-message-err`} text={errors.message} reduce={reduce} />

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-black/[.06] px-5 py-4 dark:border-white/10">
                  <p className={cn("m-0 min-w-[9rem] flex-1 text-[12.5px] leading-[1.45]", soft)}>
                    {plan ? `${who.name} replies ${replyLine}.` : `${who.name} replies during open hours.`}
                  </p>
                  <motion.button
                    type="submit"
                    whileTap={reduce ? undefined : { scale: 0.96 }}
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[color:var(--mk-a)] px-5 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_8px_16px_-10px_var(--mk-a)] outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--mk-x)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1c1c1e]"
                  >
                    <Icon name="paperplane-fill" size={14} />
                    Send
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="sent"
                role={sent.demo ? undefined : "status"}
                initial={reduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 180, damping: 22, delay: 0.35 }}
                className={cn("flex min-h-[500px] flex-col items-center justify-center rounded-[24px] p-8 text-center", SHEET)}
              >
                <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                  <motion.path
                    d="M32 3 A29 29 0 1 1 31.99 3"
                    fill="none"
                    style={{ stroke: "var(--mk-x)" }}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 0.5, ease: [0.65, 0, 0.35, 1] }}
                  />
                  <motion.path
                    d="M20 33 L28.5 41 L44 24"
                    fill="none"
                    style={{ stroke: "var(--mk-x)" }}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 16, delay: 1.05 }}
                  />
                </svg>
                <p ref={sentHead} tabIndex={-1} className={cn("m-0 mt-6 text-[26px] font-semibold tracking-[-0.025em] outline-hidden", ink)}>
                  Sent to {sent.person.name}.
                </p>
                <p className={cn("m-0 mt-2 max-w-[320px] text-[15px] leading-[1.5] [overflow-wrap:anywhere]", soft)}>
                  Expect a reply at {sent.email} {sent.reply.label} {city} time. We marked it on the clock.
                </p>
                <button
                  type="button"
                  onClick={again}
                  className="mt-7 inline-flex h-11 items-center rounded-full px-5 text-[14px] font-medium text-[color:var(--mk-x)] outline-hidden hover:bg-black/[.04] focus-visible:ring-2 focus-visible:ring-[color:var(--mk-x)] dark:hover:bg-white/[.07]"
                >
                  Write another
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/** An inline message under a field. Renders nothing when there is no error. */
function FieldError({ id, text, reduce }: { id: string; text?: string; reduce: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {text && (
        <motion.div
          key="err"
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <p id={id} className={ERROR}>
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
