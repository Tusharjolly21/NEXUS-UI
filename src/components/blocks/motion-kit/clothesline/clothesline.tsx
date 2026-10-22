"use client";

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ClotheslineTestimonial {
  name: string;
  role: string;
  quote: string;
  /** Two CSS colours for the gradient photo block and the avatar in the opened card. */
  hue: [string, string];
  /**
   * Which rope point (1 to 28) the peg clips onto. The rope has 30 points over 560 units, so
   * neighbouring cards want at least 7 points between them. Left unset, cards are spread evenly.
   */
  at?: number;
}

export interface ClotheslineProps {
  /** Testimonials hung on the line. Four fit comfortably. Use a stable array. */
  people?: ClotheslineTestimonial[];
  /** Small line under the line. */
  hint?: string;
  /** Label of the button inside an opened testimonial. */
  closeLabel?: string;
  /**
   * Plucks the rope and sends a gust every 1.8 s until the visitor touches the section. Off, the
   * line still hangs and sways in its idle breeze. Never runs under reduced motion.
   */
  autoplay?: boolean;
  /** Called when a testimonial is opened or closed. Nothing navigates. */
  onAction?: (action: "open" | "close", person: ClotheslineTestimonial) => void;
  className?: string;
}

/* Invented people and quotes for the demo. Replace with real, attributed quotes before publishing. */
export const DEFAULT_CLOTHESLINE_PEOPLE: ClotheslineTestimonial[] = [
  { name: "Maya Chen", role: "Design lead, Loop", quote: "We replaced three libraries with this. Our product finally feels like one thing.", hue: ["#ff9f0a", "#ff375f"], at: 4 },
  { name: "Arjun Rao", role: "Founder, Tally", quote: "Shipped our pricing page in an afternoon and people keep asking how we built it.", hue: ["#30d158", "#0a84ff"], at: 11 },
  { name: "Lena Ortiz", role: "Engineer, Wayfare", quote: "The motion is the good kind. It explains things instead of showing off.", hue: ["#bf5af2", "#5e5ce6"], at: 18 },
  { name: "Tom Becker", role: "PM, Relay", quote: "Our onboarding completion went up the week we swapped in the new checklist.", hue: ["#64d2ff", "#30d158"], at: 25 },
];

/* Stage is drawn in a fixed 600 x 380 space and scaled to the element's width. */
const SW = 600;
const SH = 380;
const NP = 30; // rope points
const X0 = 20;
const X1 = SW - 20;
const Y0 = 70;
const CW = 112; // card size
const CH = 150;
const PEG = 18;
const STEP = 1 / 60; // fixed physics step, so the rope behaves the same at any refresh rate
const IDLE_FRAMES = 24;

type Pt = { x: number; y: number; px: number; py: number; pin: boolean };
type Grab = { i: number; x: number; y: number; sx: number; sy: number; moved: boolean; card: number };
type Swing = { a: number; v: number; lastVx: number };

const pegIndex = (person: ClotheslineTestimonial, i: number, n: number) => {
  const raw = person.at ?? Math.round(((i + 1) * (NP - 1)) / (n + 1));
  return Math.max(1, Math.min(NP - 2, Math.round(raw)));
};
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
const gradient = (hue: [string, string]) => `linear-gradient(140deg, ${hue[0]}, ${hue[1]})`;

/** Small seeded generator so the autoplay breeze is the same every run. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";

/**
 * Testimonials pegged to a washing line. The rope is a real rope: it sags under each card, you can
 * pluck it or tug a card down and everything bounces and swings on its pegs. A breeze keeps them
 * moving. Click a card (or focus it and press Enter) to read the whole thing.
 */
export function Clothesline({
  people = DEFAULT_CLOTHESLINE_PEOPLE,
  hint = "Pluck the line, tug a card, or click one to read it.",
  closeLabel = "Close",
  autoplay = false,
  onAction,
  className,
}: ClotheslineProps) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const rope = useRef<SVGPathElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const pegs = useRef<(SVGGElement | null)[]>([]);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const pts = useRef<Pt[]>([]);
  const swing = useRef<Swing[]>([]);
  const grab = useRef<Grab | null>(null);
  const gust = useRef(0);
  const touched = useRef(false);
  const live = useRef(true); // on screen and tab visible
  const reduced = useRef(false);
  const wake = useRef<(() => void) | null>(null);
  const opener = useRef<number | null>(null);
  const peopleRef = useRef(people);
  const onActionRef = useRef(onAction);
  const [k, setK] = useState(1);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    peopleRef.current = people;
    onActionRef.current = onAction;
  });

  // The rope: a verlet chain stepped at a fixed rate, with the cards swinging as pendulums.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth > 0) setK(el.offsetWidth / SW);
    });
    ro.observe(el);

    pts.current = Array.from({ length: NP }, (_, i) => {
      const x = X0 + ((X1 - X0) * i) / (NP - 1);
      return { x, y: Y0, px: x, py: Y0, pin: i === 0 || i === NP - 1 };
    });
    const seg = ((X1 - X0) / (NP - 1)) * 1.035; // a little slack so it sags

    let heavyFor: ClotheslineTestimonial[] | null = null;
    let heavy = new Set<number>();
    let t = 0;

    /** One physics step. Returns how much the system is still moving. */
    const step = () => {
      t += STEP;
      const list = peopleRef.current;
      if (heavyFor !== list) {
        heavyFor = list;
        heavy = new Set(list.map((p, i) => pegIndex(p, i, list.length)));
      }
      while (swing.current.length < list.length) swing.current.push({ a: 0, v: 0, lastVx: 0 });
      const p = pts.current;
      const breeze = reduced.current ? 0 : Math.sin(t * 0.9) * 0.05 + Math.sin(t * 2.3) * 0.03 + gust.current;
      gust.current *= 0.96;
      for (let i = 0; i < NP; i++) {
        const q = p[i];
        if (q.pin) continue;
        const vx = (q.x - q.px) * 0.985;
        const vy = (q.y - q.py) * 0.985;
        q.px = q.x;
        q.py = q.y;
        q.x += vx + breeze * 0.3;
        q.y += vy + (heavy.has(i) ? 0.55 : 0.22);
      }
      const g = grab.current;
      if (g && g.moved) {
        const q = p[g.i];
        q.x = g.x;
        q.y = g.y;
      }
      for (let it = 0; it < 8; it++) {
        for (let i = 0; i < NP - 1; i++) {
          const a = p[i];
          const b = p[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const diff = (d - seg) / d / 2;
          const aF = a.pin || (g && g.moved && g.i === i);
          const bF = b.pin || (g && g.moved && g.i === i + 1);
          if (!aF && !bF) {
            a.x += dx * diff;
            a.y += dy * diff;
            b.x -= dx * diff;
            b.y -= dy * diff;
          } else if (!aF) {
            a.x += dx * diff * 2;
            a.y += dy * diff * 2;
          } else if (!bF) {
            b.x -= dx * diff * 2;
            b.y -= dy * diff * 2;
          }
        }
      }
      let energy = 0;
      for (let i = 1; i < NP - 1; i++) energy += Math.abs(p[i].x - p[i].px) + Math.abs(p[i].y - p[i].py);
      // cards swing as pendulums from their pegs, pushed by the rope's motion and the breeze
      list.forEach((person, ci) => {
        const at = pegIndex(person, ci, list.length);
        const q = p[at];
        const s = swing.current[ci];
        const vx = q.x - q.px;
        const ax = vx - s.lastVx;
        s.lastVx = vx;
        s.v += -Math.sin(s.a) * 0.012 - s.v * 0.035 - ax * 0.05 + breeze * 0.006;
        s.a += s.v;
        energy += Math.abs(s.v) * 40 + Math.abs(s.a) * 2;
      });
      return energy;
    };

    /** Writes the current state to the DOM: the rope path, each card and each peg. */
    const draw = () => {
      const p = pts.current;
      const list = peopleRef.current;
      // rope as a smooth curve through the points
      let d = `M${p[0].x},${p[0].y}`;
      for (let i = 1; i < NP - 1; i++) {
        const mx = (p[i].x + p[i + 1].x) / 2;
        const my = (p[i].y + p[i + 1].y) / 2;
        d += ` Q${p[i].x.toFixed(1)},${p[i].y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
      }
      d += ` L${p[NP - 1].x},${p[NP - 1].y}`;
      rope.current?.setAttribute("d", d);
      list.forEach((person, ci) => {
        const at = pegIndex(person, ci, list.length);
        const q = p[at];
        const s = swing.current[ci];
        if (!s) return;
        const slope = Math.atan2(p[at + 1].y - p[at - 1].y, p[at + 1].x - p[at - 1].x);
        const card = cards.current[ci];
        if (card) card.style.transform = `translate(${q.x - CW / 2}px, ${q.y + PEG - 6}px) rotate(${s.a}rad)`;
        pegs.current[ci]?.setAttribute("transform", `translate(${q.x} ${q.y}) rotate(${(slope * 180) / Math.PI})`);
      });
    };

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    if (reduced.current) {
      // No intro sag: start already hanging at rest.
      for (let i = 0; i < 700; i++) step();
    } else {
      step();
    }
    draw();

    let raf = 0;
    let last = 0;
    let acc = 0;
    let calm = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      acc += Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      let n = 0;
      let energy = Infinity;
      while (acc >= STEP && n < 4) {
        energy = step();
        acc -= STEP;
        n++;
      }
      if (n === 4) acc = 0;
      if (n === 0) return;
      draw();
      // Under reduced motion nothing drives the rope on its own, so stop once it has settled.
      if (reduced.current && !grab.current && energy < 0.02) {
        if (++calm > IDLE_FRAMES) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else calm = 0;
    };
    const start = () => {
      if (raf || !live.current) return;
      last = performance.now();
      acc = STEP;
      calm = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    let onScreen = true;
    const sync = () => {
      live.current = onScreen && !document.hidden;
      if (live.current) start();
      else stop();
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    const onMq = () => {
      reduced.current = mq.matches;
      start();
    };
    mq.addEventListener("change", onMq);
    wake.current = start;
    sync();

    return () => {
      stop();
      wake.current = null;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // Demo: pluck the line and send a gust now and then until someone touches it.
  useEffect(() => {
    if (!autoplay) return;
    const rnd = seeded(0x1c0de);
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      if (reduced.current || !live.current) return;
      gust.current = (rnd() > 0.5 ? 1 : -1) * (0.25 + rnd() * 0.25);
      const q = pts.current[3 + Math.floor(rnd() * (NP - 6))];
      if (q) q.py -= 9; // pluck
    }, 1800);
    return () => window.clearInterval(id);
  }, [autoplay]);

  const person = open !== null ? people[open] : undefined;
  const openNote = (ci: number) => {
    opener.current = ci;
    setOpen(ci);
    const p = people[ci];
    if (p) onAction?.("open", p);
  };
  const closeNote = () => {
    const p = open !== null ? peopleRef.current[open] : undefined;
    setOpen(null);
    if (p) onActionRef.current?.("close", p);
  };

  // Escape closes; focus moves into the note and back to the card that opened it.
  useEffect(() => {
    if (open === null) {
      if (opener.current !== null) {
        cards.current[opener.current]?.focus({ preventScroll: true });
        opener.current = null;
      }
      return;
    }
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const p = peopleRef.current[open];
      setOpen(null);
      if (p) onActionRef.current?.("close", p);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const local = (e: ReactPointerEvent) => {
    const r = wrap.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SW, y: ((e.clientY - r.top) / r.height) * SH };
  };
  const startRope = (e: ReactPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const m = local(e);
    let best = -1;
    let bd = 26;
    pts.current.forEach((q, i) => {
      const dd = Math.hypot(q.x - m.x, q.y - m.y);
      if (!q.pin && dd < bd) {
        bd = dd;
        best = i;
      }
    });
    if (best < 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { i: best, ...m, sx: e.clientX, sy: e.clientY, moved: true, card: -1 };
    wake.current?.();
  };
  const startCard = (ci: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    touched.current = true;
    e.stopPropagation();
    e.preventDefault();
    wrap.current?.setPointerCapture(e.pointerId);
    const at = pegIndex(people[ci], ci, people.length);
    const q = pts.current[at];
    grab.current = { i: at, x: q.x, y: q.y, sx: e.clientX, sy: e.clientY, moved: false, card: ci };
    wake.current?.();
  };
  const move = (e: ReactPointerEvent) => {
    const g = grab.current;
    if (!g) return;
    if (g.card >= 0) {
      if (Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 5) g.moved = true;
      if (!g.moved) return;
      const m = local(e);
      g.x = Math.max(X0 + 20, Math.min(X1 - 20, m.x));
      g.y = Math.max(20, Math.min(SH - CH - 10, m.y - 30));
    } else {
      const m = local(e);
      g.x = m.x;
      g.y = Math.max(10, Math.min(SH - 20, m.y));
    }
    wake.current?.();
  };
  const up = () => {
    const g = grab.current;
    grab.current = null;
    if (g && g.card >= 0 && !g.moved) openNote(g.card);
    else wake.current?.();
  };

  const modalSpring = reduce
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 320, damping: 22 };

  return (
    <section
      aria-label="Customer testimonials"
      className={cn("@container flex w-full flex-col items-center gap-2 bg-white px-4 py-12 dark:bg-black", className)}
    >
      <div
        ref={wrap}
        className="relative mx-auto w-full max-w-[640px] touch-pan-y select-none overflow-hidden"
        style={{ aspectRatio: `${SW} / ${SH}` }}
        onPointerDown={startRope}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: SW, height: SH, transform: `scale(${k})` }}
          inert={open !== null}
        >
          <svg className="absolute inset-0" width={SW} height={SH} aria-hidden="true">
            {[X0, X1].map((x) => (
              <rect key={x} x={x - 5} y={Y0 - 14} width="10" height={SH} rx="4" className="fill-[#d2d2d7] dark:fill-[#3a3a3c]" />
            ))}
            <path ref={rope} fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-[#a1846a] dark:stroke-[#b99a7e]" />
          </svg>
          {people.map((p, ci) => (
            <button
              key={`${p.name}-${ci}`}
              ref={(el) => {
                cards.current[ci] = el;
              }}
              type="button"
              onPointerDown={startCard(ci)}
              onClick={(e) => {
                // Mouse and touch open on pointer release; Enter, Space and assistive clicks arrive with detail 0.
                if (e.detail === 0) openNote(ci);
              }}
              aria-haspopup="dialog"
              aria-label={`${p.name}, ${p.role}: ${p.quote}`}
              className={cn(
                "absolute left-0 top-0 flex origin-top cursor-grab touch-none flex-col rounded-[6px] bg-[#fdfcf9] p-2 pb-2.5 text-left shadow-[0_2px_3px_rgba(0,0,0,.08),0_14px_24px_-14px_rgba(0,0,0,.45)] active:cursor-grabbing dark:bg-[#2c2c2e] dark:shadow-[0_2px_3px_rgba(0,0,0,.4),0_14px_24px_-14px_rgba(0,0,0,.9)]",
                ring,
              )}
              style={{ width: CW, height: CH, transform: "translate(-300px,-300px)" }}
            >
              <span
                aria-hidden="true"
                className="flex h-[64px] w-full flex-none items-end rounded-[3px] p-2 text-[26px] font-semibold leading-none text-white"
                style={{ background: gradient(p.hue) }}
              >
                {initials(p.name)}
              </span>
              <span aria-hidden="true" className="mt-2 line-clamp-3 text-[10.5px] leading-[1.3] text-[#3a3a3c] dark:text-[#d1d1d6]">
                &ldquo;{p.quote}&rdquo;
              </span>
              <span aria-hidden="true" className="mt-auto text-[10px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {p.name}
              </span>
            </button>
          ))}
          <svg className="pointer-events-none absolute inset-0" width={SW} height={SH} aria-hidden="true">
            {people.map((p, ci) => (
              <g
                key={`${p.name}-${ci}`}
                ref={(el) => {
                  pegs.current[ci] = el;
                }}
                transform="translate(-50 -50)"
              >
                <g transform="rotate(90)">
                  <rect x="-6" y="-5" width={PEG + 8} height="10" rx="3" fill="#d9b48a" stroke="#b08a60" strokeWidth=".8" />
                  <rect x="2" y="-5" width="3" height="10" fill="#9a9aa0" />
                </g>
              </g>
            ))}
          </svg>
        </div>
        <AnimatePresence>
          {person && (
            <motion.div
              key="note"
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 p-6 backdrop-blur-sm dark:bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={closeNote}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${uid}-who`}
                className="w-[380px] max-w-full rounded-[20px] bg-white p-6 shadow-[0_30px_60px_-24px_rgba(0,0,0,.45),0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_30px_60px_-24px_rgba(0,0,0,.9),0_0_0_1px_#3a3a3c]"
                initial={reduce ? { opacity: 0 } : { y: -40, rotate: -4, scale: 0.9 }}
                animate={reduce ? { opacity: 1 } : { y: 0, rotate: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { y: 20, opacity: 0 }}
                transition={modalSpring}
                onClick={(e) => e.stopPropagation()}
              >
                <figure className="m-0">
                  <blockquote className="m-0 text-[19px] leading-[1.4] tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    &ldquo;{person.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <span aria-hidden="true" className="h-9 w-9 flex-none rounded-full" style={{ background: gradient(person.hue) }} />
                    <span className="flex min-w-0 flex-col">
                      <span id={`${uid}-who`} className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        {person.name}
                      </span>
                      <span className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{person.role}</span>
                    </span>
                    <button
                      ref={closeBtn}
                      type="button"
                      onClick={closeNote}
                      className={cn(
                        "ml-auto h-8 flex-none rounded-full bg-[#f0f0f3] px-3 text-[12px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]",
                        ring,
                      )}
                    >
                      {closeLabel}
                    </button>
                  </figcaption>
                </figure>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="m-0 text-center text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</p>
    </section>
  );
}
