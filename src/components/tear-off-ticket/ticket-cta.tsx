"use client";
import { useEffect, useEffectEvent, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

/** What is printed on the ticket and its stub. */
export interface TicketCtaEvent {
  /** Event name, set large on the ticket. */
  title: string;
  /** Who is putting it on, under the title. */
  host: string;
  /** Day, as printed. Keep it short: "Sat 14 Nov". */
  date: string;
  /** Start time, as printed: "19:00 UTC". */
  time: string;
  /** Start in iCalendar UTC form (20261114T190000Z). Used by the Add to calendar file. */
  start: string;
  /** End in iCalendar UTC form (20261114T203000Z). */
  end: string;
  /** Row letter on the stub. */
  row: string;
  /** Seat number on the stub. */
  seat: string;
  /** Serial number printed in the corner of the ticket. */
  serial: string;
  /** People already coming. Counts up by one when the stub is torn off. Leave out to hide the line. */
  going?: number;
}

export interface TicketCtaProps {
  /** Event details. Any field you leave out keeps its default. */
  event?: Partial<TicketCtaEvent>;
  /** Label of the primary button, which tears the stub for people who cannot or would rather not drag. */
  ctaLabel?: string;
  /** Where the follow-up link goes once the stub has come away (a sign-up or checkout page, say). Without it the follow-up is Add to calendar. */
  href?: string;
  /** Label of the follow-up link that `href` produces. */
  doneLabel?: string;
  /** Called once when the stub comes away, by pull, key or button. Not called by autoplay. */
  onClaim?: () => void;
  /** Accent for the stamp, the print and the follow-up button in light mode. */
  accent?: string;
  /** The same, in dark mode. */
  accentDark?: string;
  /** Tugs at the stub now and then, tears it, resets and repeats, until the visitor touches the ticket. Off under reduced motion, and paused while the ticket is off screen. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
}

const EVENT: TicketCtaEvent = {
  title: "Open Studio Night",
  host: "With Pinegate Studio",
  date: "Sat 14 Nov",
  time: "19:00 UTC",
  start: "20261114T190000Z",
  end: "20261114T203000Z",
  row: "C",
  seat: "12",
  serial: "No. 004817",
  going: 1284,
};

// Framework7 Icons (MIT), via Iconify
const ICON_TICKET =
  "M49 12a4 4 0 0 1 4 4v4.45a3.2 3.2 0 0 1-1.767 2.86l-.183.085a5.001 5.001 0 0 0-.154 9.142l.2.088A3.08 3.08 0 0 1 53 35.469V40a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4.263c0-1.302.725-2.489 1.869-3.087l.184-.09a5.001 5.001 0 0 0 .19-9.03l-.2-.095A3.46 3.46 0 0 1 3 20.28V16a4 4 0 0 1 4-4zm-.038 3.45H7.038a1 1 0 0 0-1 1v3.117A9.41 9.41 0 0 1 11.267 28a9.41 9.41 0 0 1-5.23 8.433v3.117a1 1 0 0 0 1 1h41.925a1 1 0 0 0 1-1v-3.117A9.41 9.41 0 0 1 44.733 28a9.41 9.41 0 0 1 5.23-8.433V16.45a1 1 0 0 0-1-1M39 33a3 3 0 1 1 0 6a3 3 0 0 1 0-6m0-8a3 3 0 1 1 0 6a3 3 0 0 1 0-6m0-8a3 3 0 1 1 0 6a3 3 0 0 1 0-6";
const ICON_ARROW_UP_RIGHT =
  "M44.02 36.215V14.207c0-1.336-.844-2.227-2.227-2.227l-22.008.047c-1.289 0-2.156.961-2.156 2.063c0 1.101.984 2.039 2.062 2.039h6.985l11.156-.422l-4.266 3.75l-20.93 20.977c-.421.422-.655.937-.655 1.43c0 1.1.984 2.156 2.132 2.156c.54 0 1.032-.211 1.453-.633L36.543 22.41l3.75-4.242l-.422 10.664v7.477c0 1.078.938 2.062 2.063 2.062c1.101 0 2.086-.914 2.086-2.156";

function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d={d} />
    </svg>
  );
}

const H = 204; // ticket height in px; the tear geometry below is worked out in this space
const OVER = 5; // the stub's box overlaps the main part by this much, so their torn edges can interlock

// a seeded random, so the torn edge is the same on every render and both halves fit
const rng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const r1 = rng(11);
const EDGE = (() => {
  let o = 2.4;
  return Array.from({ length: 49 }, (_, i) => {
    o = Math.min(4.6, Math.max(0.4, o + (r1() - 0.5) * 2.6));
    return { y: (i / 48) * 100, o };
  });
})();
// the main part loses `o` from its right edge; the stub's left edge sits on the same line, so they mesh until pulled apart
const MAIN_CLIP = `polygon(0 0, ${EDGE.map((p) => `calc(100% - ${p.o.toFixed(2)}px) ${p.y}%`).join(", ")}, 0 100%)`;
const STUB_CLIP = `polygon(${EDGE.map((p) => `${(OVER - p.o).toFixed(2)}px ${p.y}%`).join(", ")}, 100% 100%, 100% 0)`;
// paper fibres that bridge the tear: how far up from the hinge each sits, and how far it stretches before it snaps
const r2 = rng(5);
const FIBRES = Array.from({ length: 30 }, () => ({ d: 8 + r2() * (H - 22), s: 2.5 + r2() * r2() * 16, k: (r2() - 0.5) * 4 }));
const HOLES = Array.from({ length: Math.floor((H - 34) / 8) }, (_, i) => 17 + i * 8 + 4);

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
// card stock: a fine grain, plus long faint fibres laid in one direction. Warm brown on the cream stock, warm white on the dark one.
const grain = (rgb: string, a: string) =>
  svg(`<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='a'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 0 0 0 0 ${rgb} 0 0 0 ${a}'/></filter><rect width='100%' height='100%' filter='url(#a)'/></svg>`);
const fibre = (r: string, g: string, b: string) =>
  svg(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='220'><filter id='b'><feTurbulence type='fractalNoise' baseFrequency='.03 .11' numOctaves='3' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 .7 -.36'/></filter><rect width='100%' height='100%' filter='url(#b)'/></svg>`);
const GRAIN = grain("0", ".5 -.24");
const GRAIN_D = grain("1", ".5 -.24");
const FIBRE = fibre(".45", ".4", ".34");
const FIBRE_D = fibre(".92", ".88", ".8");
// rubber-stamp ink never lands evenly
const INK = svg(`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='64'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' seed='9'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -5 3.5'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`);
// security print: interfering waves, the way real tickets are printed so they can't be copied cleanly. Used as a mask, so the accent colour (and the theme) can fill it.
const GUILLOCHE = (() => {
  let p = "";
  for (let k = 0; k < 16; k++) {
    let d = "";
    for (let x = 0; x <= 360; x += 3) {
      const y = 80 + Math.sin(x / 34 + k * 0.42) * (22 + k * 1.6) * Math.cos(x / 96 - k * 0.18);
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }
    p += `<path d='${d}'/>`;
  }
  return svg(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='160' fill='none' stroke='#000' stroke-width='.5'>${p}</svg>`);
})();

// a small code-like square, the same on every render
const QR = Array.from({ length: 81 }, (_, i) => {
  const x = i % 9;
  const y = Math.floor(i / 9);
  const finder = (fx: number, fy: number) => x >= fx && x < fx + 3 && y >= fy && y < fy + 3;
  if (finder(0, 0) || finder(6, 0) || finder(0, 6)) return !(x % 6 === 1 && y % 6 === 1);
  return (x * 7 + y * 13 + x * y) % 5 < 2;
});

// where a point `d` px up the stub's left edge has got to, once the stub has swung `a` degrees about the hinge
const swing = (d: number, a: number) => {
  const r = (a * Math.PI) / 180;
  return { x: d * Math.sin(r), y: H - d * Math.cos(r) };
};

/**
 * Every colour that has to change with the theme lives in these variables, on the root: the panel behind the ticket
 * (the holes show it), the card stock, the shadow tint and strength, the rim light and the paper fibres.
 */
const TOKENS = cn(
  "[--tc-bg:#f5f5f7] dark:[--tc-bg:#000]",
  "[--tc-paper:#fcfbf8] dark:[--tc-paper:#262522]",
  "[--tc-sh:30,25,20] dark:[--tc-sh:0,0,0]",
  "[--tc-sm:1] dark:[--tc-sm:2.6]",
  "[--tc-hl:.9] dark:[--tc-hl:.1]",
  "[--tc-shade:rgba(120,100,80,.06)] dark:[--tc-shade:rgba(0,0,0,.28)]",
  "[--tc-fo:rgba(60,50,40,.18)] dark:[--tc-fo:rgba(0,0,0,.55)]",
  "[--tc-fc:#fffdf9] dark:[--tc-fc:#bdb7ac]",
  "[--tc-press:0_1px_0_rgba(255,255,255,.85)] dark:[--tc-press:0_-1px_0_rgba(0,0,0,.6)]",
);
const PRESS = "[text-shadow:var(--tc-press)]";
const sh = (a: number) => `rgba(var(--tc-sh), calc(${a} * var(--tc-sm)))`;
const MAIN_SHADOW = `drop-shadow(0 .5px .5px ${sh(0.16)}) drop-shadow(0 10px 12px ${sh(0.07)}) drop-shadow(0 26px 30px ${sh(0.09)})`;

const LABEL = "text-[10px] font-semibold uppercase leading-none tracking-[0.12em] text-[#6e6e73] dark:text-[#a1a1a6]";

function Fibre({ d, s, k, angle }: { d: number; s: number; k: number; angle: MotionValue<number> }) {
  const path = useTransform(angle, (a) => {
    const p = swing(d, a);
    const y1 = H - d;
    const len = Math.hypot(p.x, p.y - y1);
    if (len < 0.7 || len > s) return "M0 0";
    return `M0 ${y1.toFixed(2)} Q${(p.x / 2 + k * (1 - len / s)).toFixed(2)} ${((y1 + p.y) / 2 + 0.8).toFixed(2)} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  });
  return (
    <>
      <motion.path d={path} style={{ stroke: "var(--tc-fo)" }} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <motion.path d={path} style={{ stroke: "var(--tc-fc)" }} strokeWidth={0.75} fill="none" strokeLinecap="round" />
    </>
  );
}

function Hole({ d, angle }: { d: number; angle: MotionValue<number> }) {
  // a perforation hole stays a hole until the tear reaches it
  const opacity = useTransform(angle, (a) => (2 * (H - d) * Math.sin((a * Math.PI) / 360) > 1.8 ? 0 : 1));
  return (
    <motion.span
      aria-hidden="true"
      className="absolute left-0 h-[3px] w-[3px] rounded-full bg-(--tc-bg) shadow-[inset_0_.5px_1px_rgba(0,0,0,.35)]"
      style={{ top: d - 1.5, x: "-50%", opacity }}
    />
  );
}

/** Paper layers shared by both halves: grain, fibres, a raking light and the pointer's sheen. */
function Stock({ sheen }: { sheen: MotionValue<string> }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply [background-image:var(--tc-fibre),var(--tc-grain)] dark:opacity-[.06] dark:mix-blend-normal dark:[background-image:var(--tc-fibre-d),var(--tc-grain-d)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,var(--tc-hl)) 0, rgba(255,255,255,0) 2px), linear-gradient(0deg, var(--tc-shade), transparent 30%)" }}
      />
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-soft-light dark:opacity-45" style={{ backgroundImage: sheen }} />
    </>
  );
}

const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

/**
 * An event call to action printed as a ticket on card stock. Grab the stub and tear it away along the perforation: it
 * swings about the bottom of the line, the holes split one by one from the top and the paper fibres stretch across the
 * gap and snap. Let go early and it springs back with a wobble. Pull past the point of no return and it leaves with
 * the speed you gave it, fluttering as it falls, and the ticket is stamped. The primary button and the Enter or Space
 * key on the stub do the same without dragging.
 */
export function TicketCta({
  event,
  ctaLabel = "Claim my seat",
  href,
  doneLabel = "Continue",
  onClaim,
  accent = "#0071e3",
  accentDark = "#2997ff",
  autoplay = false,
  enableSound = true,
  className,
}: TicketCtaProps) {
  const ev: TicketCtaEvent = { ...EVENT, ...event };
  const play = useSound(enableSound);
  const reduce = useReducedMotion();
  const angle = useMotionValue(0);
  const fall = { x: useMotionValue(0), y: useMotionValue(0), r: useMotionValue(0), flip: useMotionValue(0), o: useMotionValue(1) };
  const rot = useTransform([angle, fall.r] as MotionValue<number>[], ([a, r]: number[]) => a + r);
  const kick = useMotionValue(0);
  const jolt = useMotionValue(0);
  // the whole ticket tilts toward the pointer, a light sliding across its surface
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 170, damping: 22 });
  const ry = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 170, damping: 22 });
  const sp = useSpring(px, { stiffness: 120, damping: 24 });
  const sheen = useTransform(sp, (p) => `linear-gradient(112deg, transparent ${p * 120 - 45}%, rgba(255,255,255,.95) ${p * 120 - 18}%, transparent ${p * 120 + 8}%)`);
  const foilPos = useTransform([sp, py] as MotionValue<number>[], ([a, b]: number[]) => `0 0, ${a * 100}% ${b * 100}%`);
  const crease = useTransform(angle, [0, 22], [0, 1]);
  const lift = useTransform([angle, fall.y] as MotionValue<number>[], ([a, y]: number[]) => {
    const l = Math.min(26, a * 0.7 + Math.max(0, -y) * 0.2 + (y > 0 ? 14 : 0));
    return `drop-shadow(0 .5px .5px ${sh(0.16)}) drop-shadow(0 ${(4 + l * 0.8).toFixed(1)}px ${(6 + l * 1.4).toFixed(1)}px ${sh(+(0.1 + l * 0.003).toFixed(3))})`;
  });

  const [claimed, setClaimed] = useState(false);
  const [byUser, setByUser] = useState(false);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLDivElement>(null);
  const drag = useRef<{ hx: number; hy: number; th0: number; r0: number; s: { t: number; a: number; x: number; y: number }[] } | null>(null);
  const busy = useRef(false);
  const touched = useRef(false);
  const dead = useRef(false);
  const demoOwns = useRef(false);
  const wantFocus = useRef(false);
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const inView = useInView(root, { amount: 0.3 });
  const going = ev.going === undefined ? undefined : ev.going + (claimed && byUser ? 1 : 0);

  useEffect(() => {
    dead.current = false;
    return () => {
      dead.current = true;
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // it leaves with whatever speed it was given, then gravity, air and a flutter take over
  const launch = (v: { vx: number; vy: number; vr: number }, by: "user" | "auto") => {
    if (dead.current) return;
    setClaimed(true);
    setByUser(by === "user");
    const sound = by === "user" ? play : play.auto;
    sound("swipe");
    later(() => sound("success"), 430);
    if (by === "user") onClaim?.();
    if (reduce) {
      // still state only: the stub fades out, no flight
      animate(fall.o, 0, { duration: 0.25 }).then(() => {
        if (!dead.current) setGone(true);
      });
      return;
    }
    animate(kick, 0, { type: "spring", stiffness: 420, damping: 11, velocity: -34 });
    later(() => animate(jolt, 0, { type: "spring", stiffness: 700, damping: 15, velocity: 110 }), 430);
    let x = 0;
    let y = 0;
    let r = 0;
    let t = 0;
    let last = performance.now();
    let { vx, vy, vr } = v;
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      t += dt;
      vy += 2500 * dt;
      vy *= 1 - 0.35 * dt;
      vx *= 1 - 0.9 * dt;
      vr *= 1 - 0.6 * dt;
      x += vx * dt;
      y += vy * dt;
      r += vr * dt;
      fall.x.set(x);
      fall.y.set(y);
      fall.r.set(r);
      fall.flip.set(Math.sin(t * 8) * 38 * Math.min(1, t * 2.4));
      const o = y > 200 ? Math.max(0, 1 - (y - 200) / 160) : 1;
      fall.o.set(o);
      if (o <= 0 || t > 2.6) {
        setGone(true);
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const claim = () => {
    if (busy.current || claimed) return;
    busy.current = true;
    touched.current = true;
    if (reduce) {
      launch({ vx: 0, vy: 0, vr: 0 }, "user");
      return;
    }
    animate(angle, 21, { duration: 0.34, ease: [0.5, 0, 0.3, 1] }).then(() => launch({ vx: 360, vy: -520, vr: 280 }, "user"));
  };

  const reset = () => {
    cancelAnimationFrame(raf.current);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    busy.current = false;
    demoOwns.current = false;
    setClaimed(false);
    setByUser(false);
    setGone(false);
    angle.set(0);
    fall.x.set(0);
    fall.r.set(0);
    fall.flip.set(0);
    if (reduce) {
      fall.y.set(0);
      fall.o.set(1);
      return;
    }
    fall.y.set(-40);
    fall.o.set(0);
    animate(fall.o, 1, { duration: 0.25 });
    animate(fall.y, 0, { type: "spring", stiffness: 340, damping: 20 });
  };

  // the demo: a couple of tugs so it is clear the stub comes away, then the tear, a beat, and the ticket back again
  const demoTug = useEffectEvent(() => {
    if (!busy.current) animate(angle, [0, 5.5, 0], { duration: 1.1, times: [0, 0.35, 1], ease: ["easeOut", [0.3, 1.6, 0.5, 1]] });
  });
  const demoTear = useEffectEvent(() => {
    if (!busy.current) animate(angle, 14, { duration: 0.55, ease: [0.5, 0, 0.3, 1] });
  });
  const demoLaunch = useEffectEvent(() => {
    if (busy.current) return;
    busy.current = true;
    demoOwns.current = true;
    launch({ vx: 420, vy: -520, vr: 300 }, "auto");
  });
  const demoReset = useEffectEvent(() => reset());
  const demoRestore = useEffectEvent(() => {
    // the ticket was left off screen mid-demo: put it back before the next round
    if (demoOwns.current) reset();
    else if (!busy.current) angle.set(0);
  });

  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => {
      ids.push(window.setTimeout(() => {
        if (!touched.current) fn();
      }, ms));
    };
    const round = () => {
      at(demoTug, 1400);
      at(demoTug, 3400);
      at(demoTear, 5400);
      at(demoLaunch, 5950);
      at(demoReset, 10400);
      at(round, 11800);
    };
    at(demoRestore, 0);
    round();
    return () => ids.forEach(clearTimeout);
  }, [autoplay, reduce, inView]);

  const tilt = (e: RPointerEvent<HTMLDivElement>) => {
    if (reduce || drag.current || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (claimed || busy.current || !row.current || !main.current) return;
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    // measured from the page, not from the layout, so a scaled preview frame does not skew the hinge
    const hx = main.current.getBoundingClientRect().right;
    const hy = row.current.getBoundingClientRect().bottom;
    angle.stop();
    px.set(0.5);
    py.set(0.5);
    drag.current = { hx, hy, th0: Math.atan2(e.clientY - hy, e.clientX - hx), r0: Math.hypot(e.clientX - hx, e.clientY - hy), s: [] };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g || claimed) return;
    let d = ((Math.atan2(e.clientY - g.hy, e.clientX - g.hx) - g.th0) * 180) / Math.PI;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    // swinging it open is what tears; pulling it straight away strains the paper a little too
    const raw = Math.max(0, d) + Math.max(0, Math.hypot(e.clientX - g.hx, e.clientY - g.hy) - g.r0) * 0.05;
    const a = raw < 7 ? raw : 7 + (raw - 7) * 0.4; // the deeper the tear, the harder it resists
    angle.set(a);
    g.s.push({ t: performance.now(), a, x: e.clientX, y: e.clientY });
    if (g.s.length > 6) g.s.shift();
    if (raw > 32) {
      drag.current = null;
      busy.current = true;
      const f = g.s[0];
      const l = g.s[g.s.length - 1];
      const dt = Math.max(0.016, (l.t - f.t) / 1000);
      const c = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      launch(
        { vx: c(((l.x - f.x) / dt) * 0.6 + 140, -300, 1300), vy: c(((l.y - f.y) / dt) * 0.6 - 300, -1100, 500), vr: c(((l.a - f.a) / dt) * 1.4 + 120, -100, 900) },
        "user",
      );
    }
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    if (!claimed) animate(angle, 0, { type: "spring", stiffness: 560, damping: 14 }); // paper snaps back with a little wobble
  };

  const ics = () => {
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ticket CTA//EN",
      "BEGIN:VEVENT",
      `UID:${ev.start}-${ev.serial.replace(/[^a-z0-9]/gi, "")}@ticket-cta`,
      `DTSTAMP:${ev.start}`,
      `DTSTART:${ev.start}`,
      `DTEND:${ev.end}`,
      `SUMMARY:${esc(ev.title)}`,
      `DESCRIPTION:${esc(`${ev.host}. Row ${ev.row}, seat ${ev.seat}.`)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    a.download = "ticket.ics";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // a keyboard or switch user's focus follows the button they pressed to the one that replaces it
  const focusRef = (el: HTMLElement | null) => {
    if (el && wantFocus.current) {
      wantFocus.current = false;
      el.focus({ preventScroll: true });
    }
  };

  const notchMain = "radial-gradient(circle 9px at 100% 0, #0000 96%, #000 100%), radial-gradient(circle 9px at 100% 100%, #0000 96%, #000 100%)";
  const notchStub = `radial-gradient(circle 9px at ${OVER}px 0, #0000 96%, #000 100%), radial-gradient(circle 9px at ${OVER}px 100%, #0000 96%, #000 100%)`;
  const masked = (m: string): CSSProperties => ({ WebkitMaskImage: m, maskImage: m, WebkitMaskComposite: "source-in", maskComposite: "intersect" }) as CSSProperties;
  const vars = {
    "--tc-a": accent,
    "--tc-ad": accentDark,
    "--tc-grain": GRAIN,
    "--tc-grain-d": GRAIN_D,
    "--tc-fibre": FIBRE,
    "--tc-fibre-d": FIBRE_D,
  } as CSSProperties;

  const ring = "outline-hidden focus-visible:ring-2 focus-visible:ring-(--tc-a) focus-visible:ring-offset-2 focus-visible:ring-offset-(--tc-bg) dark:focus-visible:ring-(--tc-ad)";
  const pill = "inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-6 text-[15px] font-medium whitespace-nowrap transition-colors";

  return (
    <div
      ref={root}
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
      className={cn("@container relative w-full overflow-hidden rounded-[28px] bg-(--tc-bg) font-sans", TOKENS, className)}
      style={vars}
    >
      <div className="mx-auto flex w-full max-w-[540px] flex-col items-center gap-7 px-4 py-10 @md:px-8 @md:py-14">
        {/* the ticket */}
        <div
          className="group/ticket relative w-full max-w-[468px] select-none"
          style={{ perspective: 1100 }}
          onPointerMove={tilt}
          onPointerLeave={() => {
            px.set(0.5);
            py.set(0.5);
          }}
        >
          <motion.div ref={row} className="relative flex" style={{ height: H, rotateX: rx, rotateY: ry }}>
            {/* the main part */}
            <motion.div ref={main} className="relative min-w-0 flex-1" style={{ rotate: kick, y: jolt, transformOrigin: "0% 50%", filter: MAIN_SHADOW }}>
              <div
                className="relative flex h-full flex-col overflow-hidden rounded-l-[20px] bg-(--tc-paper) p-4 shadow-[inset_0_0_0_1px_rgba(60,50,40,.06)] @md:p-6 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                style={{ clipPath: MAIN_CLIP, ...masked(notchMain) }}
              >
                {/* security print, filled with the accent */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-8 -right-16 h-[170px] w-[380px]"
                  style={{ WebkitMaskImage: "radial-gradient(60% 70% at 70% 45%, #000, transparent)", maskImage: "radial-gradient(60% 70% at 70% 45%, #000, transparent)" }}
                >
                  <span
                    className="absolute inset-0 bg-(--tc-a) opacity-[.17] dark:bg-(--tc-ad) dark:opacity-[.2]"
                    style={{ WebkitMaskImage: GUILLOCHE, maskImage: GUILLOCHE, WebkitMaskSize: "360px 160px", maskSize: "360px 160px" }}
                  />
                </span>
                <Stock sheen={sheen} />

                <div className="relative">
                  <p className={cn("m-0 flex items-center justify-between gap-2", LABEL, PRESS)}>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Icon d={ICON_TICKET} size={14} />
                      Admit one
                    </span>
                    <span className="font-medium tracking-[0.06em] whitespace-nowrap tabular-nums normal-case">{ev.serial}</span>
                  </p>
                  <p className={cn("m-0 mt-3 line-clamp-2 text-[21px] leading-[1.12] font-semibold tracking-[-0.026em] text-balance text-[#1d1d1f] @md:text-[24px] dark:text-[#f5f5f7]", PRESS)}>{ev.title}</p>
                  <p className={cn("m-0 mt-1 truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]", PRESS)}>{ev.host}</p>
                </div>

                {/* the stamp has a place of its own, between the heading and the details, so it never lands on type */}
                <div className="relative min-h-0 flex-1">
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <AnimatePresence>
                      {claimed && (
                        <motion.span
                          key="stamp"
                          aria-hidden="true"
                          className="block rounded-[8px] border-[2.5px] border-(--tc-a) px-2 py-0.5 text-[13px] leading-tight font-bold tracking-[0.05em] whitespace-nowrap text-(--tc-a) uppercase mix-blend-multiply dark:border-(--tc-ad) dark:text-(--tc-ad) dark:mix-blend-normal"
                          initial={{ opacity: 0, scale: 1.9, rotate: -18 }}
                          animate={{ opacity: 0.9, scale: 1, rotate: -8 }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 650, damping: 24, delay: 0.38 }}
                          style={{ WebkitMaskImage: INK, maskImage: INK, WebkitMaskSize: "cover", maskSize: "cover" }}
                        >
                          {"You're in"}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <dl className="relative m-0 flex gap-x-4 border-t border-black/[.09] pt-3 @md:gap-x-6 dark:border-white/[.12]">
                  <div className="flex flex-col gap-1.5">
                    <dt className={LABEL}>Date</dt>
                    <dd className={cn("m-0 text-[13px] leading-none font-semibold whitespace-nowrap tabular-nums @md:text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]", PRESS)}>{ev.date}</dd>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <dt className={LABEL}>Time</dt>
                    <dd className={cn("m-0 text-[13px] leading-none font-semibold whitespace-nowrap tabular-nums @md:text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]", PRESS)}>{ev.time}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>

            {/* the perforation: holes along the line, and the fibres that hold on as it tears */}
            <div className="relative z-[3] w-0">
              {!claimed && HOLES.map((d) => <Hole key={d} d={d} angle={angle} />)}
              {!claimed && (
                <svg aria-hidden="true" className="pointer-events-none absolute top-0 left-0 overflow-visible" width={1} height={H}>
                  {FIBRES.map((f, i) => (
                    <Fibre key={i} {...f} angle={angle} />
                  ))}
                </svg>
              )}
            </div>

            {/* the stub: hinged at the bottom of the perforation */}
            <motion.div
              role="button"
              tabIndex={claimed ? -1 : 0}
              aria-label={ev.title ? `Tear off the stub for ${ev.title}. Drag it away, or press Enter.` : "Tear off the stub. Drag it away, or press Enter."}
              aria-disabled={claimed || undefined}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !claimed) {
                  e.preventDefault();
                  wantFocus.current = true;
                  claim();
                }
              }}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              className={cn("group/stub relative z-[2] w-[104px] shrink-0 touch-none outline-hidden @md:w-[128px]", claimed ? "cursor-default" : "cursor-grab active:cursor-grabbing", gone && "invisible")}
              style={{ marginLeft: -OVER, rotate: rot, x: fall.x, y: fall.y, rotateX: fall.flip, opacity: fall.o, transformPerspective: 700, transformOrigin: `${OVER}px 100%`, filter: lift }}
            >
              <div
                className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-r-[20px] bg-(--tc-paper) py-3 pr-[25px] pl-[17px] shadow-[inset_0_0_0_1px_rgba(60,50,40,.06)] @md:pr-[27px] @md:pl-[19px] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                style={{ clipPath: STUB_CLIP, ...masked(notchStub) }}
              >
                <Stock sheen={sheen} />
                {/* a strip of foil that shifts colour as the light moves */}
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-[10px] w-[7px]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0 1px, transparent 1px 3px), linear-gradient(160deg, #e9e9ee, #ffd9ec 18%, #cfe6ff 34%, #d6ffe9 50%, #fff3c8 66%, #e6d8ff 82%, #e9e9ee)",
                    backgroundSize: "100% 100%, 400% 400%",
                    backgroundPosition: foilPos,
                    boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.1)",
                  }}
                />
                {/* the paper creases at the hinge as it swings */}
                <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: crease, background: "linear-gradient(35deg, rgba(60,50,40,.16), transparent 38%)" }} />
                <span className="relative grid h-[48px] w-[48px] grid-cols-9 rounded-[6px] bg-[#f5f5f7] p-[4px] shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:bg-[#e8e8ed]" aria-hidden="true">
                  {QR.map((on, i) => (
                    <span key={i} className={on ? "bg-[#1d1d1f]" : undefined} />
                  ))}
                </span>
                <span className="relative grid w-full grid-cols-2 gap-x-1 text-center">
                  <span className={cn("flex flex-col gap-1.5", PRESS)}>
                    <span className={cn(LABEL, "text-[9.5px] tracking-[0.1em]")}>Row</span>
                    <span className="text-[19px] leading-none font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{ev.row}</span>
                  </span>
                  <span className={cn("flex flex-col gap-1.5", PRESS)}>
                    <span className={cn(LABEL, "text-[9.5px] tracking-[0.1em]")}>Seat</span>
                    <span className="text-[19px] leading-none font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{ev.seat}</span>
                  </span>
                </span>
                <span className={cn("relative text-center text-[11px] leading-tight font-medium text-[#6e6e73] transition-colors group-hover/ticket:text-[#1d1d1f] dark:text-[#a1a1a6] dark:group-hover/ticket:text-[#f5f5f7]", PRESS)}>Pull to tear</span>
              </div>
              {/* focus ring, drawn inside the stub because the torn edge clips anything outside it */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] rounded-r-[17px] border-2 border-(--tc-a) opacity-0 group-focus-visible/stub:opacity-100 dark:border-(--tc-ad)" />
            </motion.div>
          </motion.div>
        </div>

        <div className="relative flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {claimed ? (
              <motion.div
                key="after"
                className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.6, type: "spring", stiffness: 300, damping: 26 } }}
                exit={{ opacity: 0 }}
              >
                {href ? (
                  <>
                    <motion.a
                      ref={focusRef}
                      href={href}
                      whileTap={{ scale: 0.96 }}
                      className={cn(pill, "bg-(--tc-a) text-white hover:brightness-110 dark:bg-(--tc-ad) dark:text-black", ring)}
                    >
                      {doneLabel}
                      <Icon d={ICON_ARROW_UP_RIGHT} size={13} />
                    </motion.a>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        play("tap");
                        ics();
                      }}
                      className={cn(pill, "text-[#1d1d1f] ring-1 ring-black/15 ring-inset hover:bg-black/5 dark:text-[#f5f5f7] dark:ring-white/25 dark:hover:bg-white/10", ring)}
                    >
                      Add to calendar
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    ref={focusRef}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      play("tap");
                      ics();
                    }}
                    className={cn(pill, "bg-(--tc-a) text-white hover:brightness-110 dark:bg-(--tc-ad) dark:text-black", ring)}
                  >
                    Add to calendar
                    <Icon d={ICON_ARROW_UP_RIGHT} size={13} />
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => {
                    touched.current = true;
                    wantFocus.current = e.detail === 0;
                    play("tap");
                    reset();
                  }}
                  className={cn("inline-flex h-11 items-center rounded-full px-4 text-[14px] text-[#6e6e73] transition-colors hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]", ring)}
                >
                  Give it back
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="claim"
                ref={focusRef}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={(e) => {
                  wantFocus.current = e.detail === 0;
                  claim();
                }}
                exit={{ opacity: 0 }}
                className={cn(pill, "bg-[#1d1d1f] text-white hover:bg-black dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:hover:bg-white", ring)}
              >
                {ctaLabel}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {going !== undefined && (
          <p className="relative m-0 text-center text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.b
                key={going}
                className="inline-block font-semibold text-[#1d1d1f] tabular-nums dark:text-[#f5f5f7]"
                initial={{ y: reduce ? 0 : 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reduce ? 0 : -10, opacity: 0 }}
              >
                {going.toLocaleString("en-US")}
              </motion.b>
            </AnimatePresence>{" "}
            people are coming{claimed && byUser ? ", including you." : "."}
          </p>
        )}

        <p role="status" className="sr-only">
          {claimed && byUser ? "Stub torn off. Your seat is saved." : ""}
        </p>
      </div>
    </div>
  );
}
