"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface TeamClockMember {
  /** Full name. Also the key, so keep it unique. The initials fill the avatar. */
  name: string;
  /** Job title, shown before the city. */
  role: string;
  /** City, shown after the role. */
  city: string;
  /** Hours from UTC, for example -7 for San Francisco or 5.5 for Bengaluru. */
  offset: number;
  /** The group the filter chips are built from. The chips follow the order the groups first appear. */
  team: string;
  /** Avatar colour. */
  hue: string;
}

export interface TeamClockProps {
  /** Small caps line above the heading. */
  eyebrow?: string;
  /** Section heading. */
  heading?: string;
  /** Label of the chip that shows everyone. */
  everyoneLabel?: string;
  /** The people on the board. Use a stable array. */
  members?: TeamClockMember[];
  /** First hour of the working day, local time. */
  workStart?: number;
  /** Hour the working day ends, local time. */
  workEnd?: number;
  /**
   * Steps through the team chips every 3 s and moves the bar to a good meeting hour, until the visitor
   * touches it. Pauses off screen and in a hidden tab. Never runs under reduced motion.
   */
  autoplay?: boolean;
  /** Taps when a filter chip is pressed. Follows the site-wide sound switch. */
  enableSound?: boolean;
  className?: string;
}

/* Invented people for the demo. */
export const DEFAULT_TEAM_CLOCK_MEMBERS: TeamClockMember[] = [
  { name: "Maya Chen", role: "Design lead", city: "San Francisco", offset: -7, team: "Design", hue: "#ff9f0a" },
  { name: "Leo Park", role: "Engineer", city: "New York", offset: -4, team: "Engineering", hue: "#0a84ff" },
  { name: "Ana Lima", role: "Brand", city: "Lisbon", offset: 1, team: "Design", hue: "#bf5af2" },
  { name: "Noor Haddad", role: "Accessibility", city: "Berlin", offset: 2, team: "Engineering", hue: "#30d158" },
  { name: "Dev Patel", role: "Founder", city: "Bengaluru", offset: 5.5, team: "Leadership", hue: "#ff375f" },
  { name: "Kai Ito", role: "Engineer", city: "Tokyo", offset: 9, team: "Engineering", hue: "#5e5ce6" },
];

/** Hours (UTC) the bar visits in the autoplay demo. */
const DEMO_HOURS = [13, 9, 15.5, 4];
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

const wrap24 = (h: number) => ((h % 24) + 24) % 24;
const fmt = (h: number) => {
  const hh = Math.floor(wrap24(h));
  const mm = Math.round((h - Math.floor(h)) * 60) % 60;
  return `${hh % 12 === 0 ? 12 : hh % 12}:${String(mm).padStart(2, "0")} ${hh < 12 ? "am" : "pm"}`;
};
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("");

/** True while the element is on screen and the tab is visible, so timers can stand down otherwise. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return inView && visible;
}

const utcNow = () => {
  const d = new Date();
  return d.getUTCHours() + d.getUTCMinutes() / 60;
};

/**
 * A team section that also answers "when can we all meet?". Every card shows that person's local time and
 * whether they are working. Drag the bar (or use the arrow keys) to any hour in UTC and every clock moves
 * with it, people outside working hours fade back, and the bar shades the hours when most of the team
 * overlaps. The chips filter by team. Times start as placeholders and fill in after mount, then tick once
 * a minute until you take over. Under reduced motion cards and the marker move instantly.
 */
export function TeamClock({
  eyebrow = "The team",
  heading = "Six people, five time zones.",
  everyoneLabel = "Everyone",
  members = DEFAULT_TEAM_CLOCK_MEMBERS,
  workStart = 9,
  workEnd = 18,
  autoplay = false,
  enableSound = true,
  className,
}: TeamClockProps) {
  const reduce = useReducedMotion();
  const play = useSound(enableSound);
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root);
  const bar = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const step = useRef(0);

  // null until mounted: the server and the first paint never see a real clock.
  const [utc, setUtc] = useState<number | null>(null);
  const [picked, setPicked] = useState(everyoneLabel);
  const [touched, setTouched] = useState(false);

  const filters = useMemo(() => [everyoneLabel, ...Array.from(new Set(members.map((m) => m.team)))], [everyoneLabel, members]);
  const team = filters.includes(picked) ? picked : everyoneLabel;
  const people = useMemo(() => members.filter((m) => team === everyoneLabel || m.team === team), [members, team, everyoneLabel]);
  const ready = utc !== null;
  const u = utc ?? 12;
  const working = (h: number) => h >= workStart && h < workEnd;
  const demo = autoplay && !reduce && !touched;
  const running = demo && onScreen;

  // Fill in the real time right after mount, then tick once a minute until the visitor (or the demo) takes over.
  useEffect(() => {
    const first = window.setTimeout(() => setUtc((c) => c ?? utcNow()), 0);
    return () => window.clearTimeout(first);
  }, []);
  useEffect(() => {
    if (touched || demo) return;
    const id = window.setInterval(() => setUtc(utcNow()), 60000);
    return () => window.clearInterval(id);
  }, [touched, demo]);

  // Autoplay: next team chip and a new meeting hour every 3 s.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      step.current += 1;
      setPicked(filters[step.current % filters.length]);
      setUtc(DEMO_HOURS[step.current % DEMO_HOURS.length]);
      play.auto("tap", 0.4);
    }, 3000);
    return () => window.clearInterval(id);
  }, [running, filters, play]);

  // How many people are working at each half hour, for the shading on the bar.
  const overlap = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const n = people.filter((p) => {
          const h = wrap24(i / 2 + p.offset);
          return h >= workStart && h < workEnd;
        }).length;
        return n / Math.max(1, people.length);
      }),
    [people, workStart, workEnd],
  );

  const here = people.filter((p) => working(wrap24(u + p.offset))).length;

  const setFromX = (clientX: number) => {
    const el = bar.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTouched(true);
    setUtc(Math.max(0, Math.min(23.99, ((clientX - r.left) / Math.max(1, r.width)) * 24)));
  };
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromX(e.clientX);
  };
  const endDrag = () => {
    dragging.current = false;
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta: Record<string, number> = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5, PageUp: 3, PageDown: -3 };
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setTouched(true);
      setUtc(e.key === "Home" ? 0 : 23.5);
    } else if (e.key in delta) {
      e.preventDefault();
      setTouched(true);
      setUtc(Math.max(0, Math.min(23.5, (utc ?? 12) + delta[e.key])));
    }
  };

  const choose = (t: string) => {
    setTouched(true);
    setPicked(t);
    play("tap", 0.5);
  };

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 30, opacity: { duration: 0.3 } };
  const liStyle = reduce
    ? { initial: { opacity: 0 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, scale: 0.92 }, exit: { opacity: 0, scale: 0.92 } };

  return (
    <section ref={root} aria-label="Team and time zones" className={cn("w-full bg-[#f5f5f7] px-4 py-12 dark:bg-black", className)}>
      <div className="mx-auto w-full max-w-[1080px] rounded-[28px] bg-white px-5 py-8 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.3)] sm:px-8 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73] dark:text-[#a1a1a6]">{eyebrow}</p>
            <h2 className="m-0 mt-1 text-[clamp(26px,4vw,36px)] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h2>
          </div>
          <LayoutGroup id={`${uid}-teams`}>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#f5f5f7] p-1 dark:bg-[#2c2c2e]" role="group" aria-label="Filter by team">
              {filters.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={team === t}
                  onClick={() => choose(t)}
                  className={cn("relative h-8 flex-none rounded-full px-3.5 text-[13px] font-medium", FOCUS)}
                >
                  {team === t && (
                    <motion.span
                      layoutId={`${uid}-thumb`}
                      className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#48484a] dark:shadow-none"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className={cn("relative", team === t ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>{t}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>

        {/* time scrubber across the UTC day */}
        <div className="mt-6">
          <div className="mb-2 flex flex-wrap justify-between gap-x-4 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <span>Drag to plan a meeting</span>
            <span className="tabular-nums">
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{ready ? `${here} of ${people.length}` : `– of ${people.length}`}</span>
              {" working at "}
              {ready ? fmt(u) : "–:–– –"} UTC
            </span>
          </div>
          <div
            ref={bar}
            className={cn("relative h-10 cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[12px] bg-[#f5f5f7] dark:bg-[#2c2c2e]", FOCUS)}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKey}
            role="slider"
            tabIndex={0}
            aria-label="Time of day in UTC"
            aria-valuemin={0}
            aria-valuemax={24}
            aria-valuenow={Math.round(u * 10) / 10}
            aria-valuetext={ready ? `${fmt(u)} UTC, ${here} of ${people.length} working` : "Loading the current time"}
          >
            <div className="absolute inset-0 flex" aria-hidden="true">
              {overlap.map((o, i) => (
                <motion.span key={i} className="h-full flex-1" animate={{ backgroundColor: `rgba(52,199,89,${o * 0.55})` }} transition={{ duration: reduce ? 0 : 0.4 }} />
              ))}
            </div>
            {[0, 6, 12, 18].map((h) => (
              <span key={h} aria-hidden="true" className="absolute bottom-1 text-[10px] text-[#6e6e73] dark:text-[#a1a1a6]" style={{ left: `calc(${(h / 24) * 100}% + 4px)` }}>
                {h}:00
              </span>
            ))}
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 w-[3px] -translate-x-1/2 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
              initial={false}
              animate={{ left: `${(u / 24) * 100}%` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
            />
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {`Showing ${people.length} ${people.length === 1 ? "person" : "people"}${team === everyoneLabel ? "" : ` in ${team}`}`}
        </p>

        <motion.ul layout={!reduce} className="m-0 mt-6 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {people.map((p) => {
              const local = wrap24(u + p.offset);
              const on = !ready || working(local);
              return (
                <motion.li
                  key={p.name}
                  layout={!reduce}
                  initial={liStyle.initial}
                  animate={{ opacity: on ? 1 : 0.55, scale: 1 }}
                  exit={liStyle.exit}
                  transition={spring}
                  className="flex items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-3.5 dark:bg-[#2c2c2e]"
                >
                  <span className="relative flex h-12 w-12 flex-none items-center justify-center rounded-full text-[15px] font-semibold text-white" style={{ background: p.hue }} aria-hidden="true">
                    {initials(p.name)}
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-[3px] ring-[#f5f5f7] transition-colors duration-300 dark:ring-[#2c2c2e]",
                        ready && on ? "bg-[#34c759]" : "bg-[#c7c7cc] dark:bg-[#636366]",
                      )}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{p.name}</span>
                    <span className="block truncate text-[12.5px] text-[#6e6e73] dark:text-[#a1a1a6]">
                      {p.role} · {p.city}
                    </span>
                  </span>
                  <span className="flex-none text-right">
                    <span className="block text-[14px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{ready ? fmt(local) : "–:–– –"}</span>
                    <span className={cn("block text-[11.5px]", ready && on ? "text-[#1a7f37] dark:text-[#30d158]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>
                      {!ready ? " " : on ? "Working" : local < 7 || local >= 22 ? "Asleep" : "Off"}
                    </span>
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
