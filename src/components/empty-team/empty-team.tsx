"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface EmptyTeamProps {
  /** Total seats, including yours. */
  seats?: number;
  /** Teammates offered as one-tap chips under the field. Defaults to three people on `domain`. */
  suggestions?: string[];
  /** The domain shown in "From <domain>", also used for the default suggestions. */
  domain?: string;
  /** Placeholder of the email field. */
  placeholder?: string;
  /** Called with the email when an avatar lands in a seat. Not called by the autoplay demo. */
  onAdd?: (email: string) => void;
  /** Called with every pending email when "Send invites" is pressed. Not called by the autoplay demo. */
  onSend?: (emails: string[]) => void;
  /** Types an email, adds three people, sends the invites and starts over on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

/** The three demo teammates, as names before the @ sign. */
export const EMPTY_TEAM_PEOPLE = ["leo.park", "ana.lima", "kai"];

type Person = { email: string; hue: string };
type Fly = { p: Person; from: readonly [number, number]; to: readonly [number, number]; auto: boolean };

// Deeper shades of the system colours so white initials stay readable.
const HUES = ["#0071e3", "#8944ab", "#c93400", "#248a3d", "#d70015", "#5e5ce6"];
const hue = (s: string) => HUES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];
const initials = (e: string) => {
  const n = e.split("@")[0].split(/[._-]/).filter(Boolean);
  return ((n[0]?.[0] ?? "") + (n[1]?.[0] ?? "")).toUpperCase() || "?";
};
const EMAIL = /^\S+@\S+\.\S+$/;
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * An empty team page that gets you to invite people. Seats wait as dotted
 * circles next to yours; type an email (or tap a suggested teammate from your
 * domain) and their avatar lifts out of the field and drops into the next
 * free seat, marked pending. The headline and button keep count, and a bad
 * or duplicate email shakes the field.
 */
export function EmptyTeam({
  seats = 6,
  suggestions: suggested,
  domain = "orbitly.com",
  placeholder = "name@company.com",
  onAdd,
  onSend,
  autoplay = false,
  enableSound = true,
  className,
}: EmptyTeamProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const suggestions = suggested ?? EMPTY_TEAM_PEOPLE.map((name) => `${name}@${domain}`);
  const [people, setPeople] = useState<Person[]>([]);
  const [value, setValue] = useState("");
  const [fly, setFly] = useState<Fly | null>(null);
  const [sent, setSent] = useState(false);
  const [bad, setBad] = useState(false);
  const [note, setNote] = useState("");
  const card = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const seatEls = useRef<(HTMLDivElement | null)[]>([]);
  const touched = useRef(false);
  const badTimer = useRef<number | undefined>(undefined);
  const active = useDemoActive(card, autoplay && !reduce);

  useEffect(() => () => window.clearTimeout(badTimer.current), []);

  const land = (p: Person, auto: boolean) => {
    (auto ? play.auto : play)("drop", 0.55);
    setPeople((ps) => (ps.some((x) => x.email === p.email) ? ps : [...ps, p]));
    setFly(null);
    if (!auto) onAdd?.(p.email);
  };

  const add = (email: string, auto = false) => {
    if (fly) return;
    const e = email.trim().toLowerCase();
    const problem = !EMAIL.test(e) ? "Enter a valid email address" : people.some((p) => p.email === e) ? `${e} is already added` : people.length >= seats - 1 ? "All seats are taken" : "";
    if (problem) {
      (auto ? play.auto : play)("error", 0.3);
      setNote(problem);
      setBad(true);
      window.clearTimeout(badTimer.current);
      badTimer.current = window.setTimeout(() => setBad(false), 450);
      return;
    }
    const person: Person = { email: e, hue: hue(e) };
    setValue("");
    setSent(false);
    setNote("");
    const c = card.current?.getBoundingClientRect();
    const f = field.current?.getBoundingClientRect();
    const s = seatEls.current[people.length + 1]?.getBoundingClientRect();
    if (reduce || !c || !f || !s) {
      land(person, auto);
      return;
    }
    setFly({
      p: person,
      from: [f.left - c.left + 20, f.top - c.top + f.height / 2],
      to: [s.left - c.left + s.width / 2, s.top - c.top + s.height / 2],
      auto,
    });
  };
  const send = (auto = false) => {
    (auto ? play.auto : play)("tap", 0.5);
    setSent(true);
    if (!auto) onSend?.(people.map((p) => p.email));
  };
  const reset = () => {
    setPeople([]);
    setSent(false);
    setValue("");
    setFly(null);
    setNote("");
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ add, send, reset });
  useEffect(() => {
    latest.current = { add, send, reset };
  });

  // Demo: type an email, add it and two suggestions, send, start over.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => ids.push(window.setTimeout(() => !touched.current && fn(), ms));
    const typed = `maya.chen@${domain}`;
    const loop = () => {
      if (touched.current) return;
      at(() => latest.current.reset(), 0);
      [...typed].forEach((_, i) => at(() => setValue(typed.slice(0, i + 1)), 900 + i * 55));
      at(() => latest.current.add(typed, true), 2300);
      if (suggestions[0]) at(() => latest.current.add(suggestions[0], true), 3400);
      if (suggestions[1]) at(() => latest.current.add(suggestions[1], true), 4300);
      at(() => latest.current.send(true), 5600);
      at(() => latest.current.reset(), 8200);
      ids.push(window.setTimeout(loop, 8600));
    };
    loop();
    return () => ids.forEach((id) => window.clearTimeout(id));
    // `suggestions` and `domain` only pick the demo's emails; the loop does not need to restart when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, active]);

  const n = people.length + (fly ? 1 : 0);
  const chips = suggestions.filter((s) => !people.some((p) => p.email === s) && fly?.p.email !== s);
  const heading = n === 0 ? "It's just you for now" : sent ? "Invites are on their way" : "Looking good";

  return (
    <div
      ref={card}
      className={cn(
        "relative w-[480px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div role="list" aria-label="Team seats" className="flex justify-center gap-1.5 pt-2 sm:gap-3">
        {Array.from({ length: seats }, (_, i) => {
          const p = i === 0 ? { email: "you", hue: "" } : people[i - 1];
          return (
            <div
              key={i}
              role="listitem"
              aria-label={i === 0 ? "Seat 1: you" : p ? `Seat ${i + 1}: ${p.email}, ${sent ? "invite sent" : "pending"}` : `Seat ${i + 1}: empty`}
              ref={(el) => {
                seatEls.current[i] = el;
              }}
              className="relative flex h-10 w-10 items-center justify-center sm:h-14 sm:w-14"
            >
              <span className="absolute inset-0 rounded-full border-2 border-dashed border-[#d2d2d7] dark:border-[#48484a]" />
              <AnimatePresence>
                {p && (
                  <motion.span
                    key={p.email}
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 flex items-center justify-center rounded-full text-[12px] font-semibold text-white ring-[3px] ring-white sm:text-[14px] dark:ring-[#1c1c1e]",
                      i === 0 && "bg-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
                    )}
                    style={i === 0 ? undefined : { background: p.hue }}
                    initial={i === 0 || reduce ? false : { scale: 0.6 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: reduce ? 1 : 0, opacity: 0 }}
                    transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 500, damping: 16 }}
                  >
                    {i === 0 ? "You" : initials(p.email)}
                  </motion.span>
                )}
              </AnimatePresence>
              {p && i > 0 && (
                <motion.span
                  aria-hidden="true"
                  className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1 py-[1px] text-[8.5px] font-semibold ring-2 ring-white sm:px-1.5 sm:text-[9.5px] dark:ring-[#1c1c1e]",
                    sent ? "bg-[#e9f9ee] text-[#1a7f37] dark:bg-[#12301b] dark:text-[#4ade80]" : "bg-[#fff4e5] text-[#b25e00] dark:bg-[#3a2a10] dark:text-[#ffb340]",
                  )}
                  initial={{ opacity: 0, y: reduce ? 0 : -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.15 }}
                >
                  {sent ? "Sent" : "Pending"}
                </motion.span>
              )}
              {!p && (
                <span className="text-[18px] text-[#c7c7cc] dark:text-[#58585a]" aria-hidden="true">
                  +
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h3
            key={heading}
            className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]"
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6 }}
          >
            {heading}
          </motion.h3>
        </AnimatePresence>
        <p className="m-0 mt-1 text-[13.5px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
          {n === 0 ? "Teams that invite in the first week stick around." : `${n + 1} of ${seats} seats filled`}
        </p>
      </div>

      <motion.div
        ref={field}
        className="mt-5 flex h-12 items-center gap-2 rounded-[14px] bg-[#f5f5f7] pl-4 pr-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0071e3] dark:bg-[#2c2c2e] dark:focus-within:outline-[#0a84ff]"
        animate={{ x: bad && !reduce ? [0, -8, 7, -4, 0] : 0 }}
        transition={{ duration: 0.35 }}
      >
        <input
          value={value}
          onChange={(e) => {
            touched.current = true;
            setValue(e.target.value);
          }}
          onFocus={() => {
            touched.current = true;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              touched.current = true;
              add(value);
            }
          }}
          type="email"
          placeholder={placeholder}
          aria-label="Teammate's email"
          aria-invalid={bad || undefined}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#6e6e73] dark:text-[#f5f5f7] dark:placeholder:text-[#a1a1a6]"
        />
        <button
          type="button"
          onClick={() => {
            touched.current = true;
            add(value);
          }}
          className={cn("h-9 rounded-[10px] bg-white px-3.5 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:shadow-none", FOCUS)}
        >
          Add
        </button>
      </motion.div>
      <span className="sr-only" role="status" aria-live="polite">
        {note}
      </span>
      <div className="mt-3 flex min-h-[30px] flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">From {domain}</span>
        <AnimatePresence initial={false}>
          {chips.map((s) => (
            <motion.button
              key={s}
              layout={!reduce}
              type="button"
              onClick={() => {
                touched.current = true;
                add(s);
              }}
              className={cn("flex h-[30px] items-center gap-1.5 rounded-full bg-white pl-1 pr-2.5 text-[12.5px] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] hover:bg-[#fafafa] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:hover:bg-[#3a3a3c]", FOCUS)}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
              aria-label={`Add ${s}`}
            >
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[9.5px] font-semibold text-white" style={{ background: hue(s) }} aria-hidden="true">
                {initials(s)}
              </span>
              {s.split("@")[0].split(".")[0].replace(/^./, (c) => c.toUpperCase())}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        disabled={n === 0 || sent}
        onClick={() => {
          touched.current = true;
          send();
        }}
        className={cn("mt-4 h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-medium text-white transition-opacity disabled:opacity-40", FOCUS)}
      >
        {sent ? "Invites sent" : n === 0 ? "Send invites" : `Send ${n} invite${n > 1 ? "s" : ""}`}
      </button>

      {/* the avatar in flight from the field to its seat */}
      {fly && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(0,0,0,.4)]"
          style={{ background: fly.p.hue }}
          initial={{ x: fly.from[0] - 24, y: fly.from[1] - 24, scale: 0.5 }}
          animate={{
            x: [fly.from[0] - 24, (fly.from[0] + fly.to[0]) / 2 - 24, fly.to[0] - 24],
            y: [fly.from[1] - 24, Math.min(fly.from[1], fly.to[1]) - 60, fly.to[1] - 24],
            scale: [0.5, 1.1, 1],
          }}
          transition={{ duration: 0.6, ease: [0.3, 0, 0.2, 1] }}
          onAnimationComplete={() => land(fly.p, fly.auto)}
        >
          {initials(fly.p.email)}
        </motion.span>
      )}
    </div>
  );
}
