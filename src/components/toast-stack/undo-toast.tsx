"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface UndoToastMail {
  id: number;
  from: string;
  subject: string;
  time: string;
  /** Avatar colour. */
  hue: string;
}

export interface UndoToastProps {
  /** The rows in the list. Defaults to a small demo inbox of four messages. */
  mails?: UndoToastMail[];
  /** How long the toast waits for an Undo, in ms. Hovering or focusing the toast pauses the countdown. */
  holdMs?: number;
  /** Called when a row is archived. */
  onArchive?: (mail: UndoToastMail) => void;
  /** Called with the archived rows when Undo is pressed. */
  onUndo?: (mails: UndoToastMail[]) => void;
  /** Archives a row and undoes it on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

const INBOX: UndoToastMail[] = [
  { id: 1, from: "Maya Chen", subject: "Q3 roadmap, final draft", time: "9:41", hue: "#ff9f0a" },
  { id: 2, from: "Stripe", subject: "Your payout is on the way", time: "9:12", hue: "#5e5ce6" },
  { id: 3, from: "Leo Park", subject: "Pricing page feedback", time: "Yesterday", hue: "#0a84ff" },
  { id: 4, from: "Linear", subject: "3 issues assigned to you", time: "Yesterday", hue: "#30d158" },
];
const HOLD = 5000;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Ghost = { mail: UndoToastMail; x: number; y: number; w: number; h: number; tx: number; ty: number; tw: number };

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
 * Archive with a real undo. The row you archive lifts out of the list and
 * shrinks down into the toast, so you can see where it went. A ring around
 * Undo counts down; press it and the row drops back into its old place with
 * a brief highlight. Archive several in a row and the toast counts them up.
 */
export function UndoToast({ mails = INBOX, holdMs = HOLD, onArchive, onUndo, autoplay = false, className = "" }: UndoToastProps) {
  const reduce = useReducedMotion() ?? false;
  const [list, setList] = useState(mails);
  const [batch, setBatch] = useState<UndoToastMail[]>([]);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const [restored, setRestored] = useState<number[]>([]);
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const rows = useRef(new Map<number, HTMLLIElement>());
  const timer = useRef<number | undefined>(undefined);
  const restoreTimer = useRef<number | undefined>(undefined);
  const touched = useRef(false);
  const paused = hover || focusIn;
  const active = useDemoActive(box, autoplay && !reduce);

  const archive = (m: UndoToastMail) => {
    const el = rows.current.get(m.id);
    const b = box.current;
    if (el && b && !reduce) {
      const r = el.getBoundingClientRect();
      const c = b.getBoundingClientRect();
      const tw = Math.min(300, c.width - 24);
      setGhost({ mail: m, x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height, tx: c.width / 2 - tw / 2, ty: c.height - 72, tw });
    }
    setBatch((bt) => [...bt, m]);
    setList((l) => l.filter((x) => x.id !== m.id));
    setToastKey((k) => k + 1);
    onArchive?.(m);
  };
  const undo = () => {
    if (!batch.length) return;
    // Put them back in the order they were archived, at their old positions.
    const back = new Set(batch.map((m) => m.id));
    setList((l) => mails.filter((x) => back.has(x.id) || l.some((y) => y.id === x.id)));
    setRestored(batch.map((m) => m.id));
    onUndo?.(batch);
    setBatch([]);
    window.clearTimeout(restoreTimer.current);
    restoreTimer.current = window.setTimeout(() => setRestored([]), 900);
  };

  useEffect(() => () => window.clearTimeout(restoreTimer.current), []);

  // The toast times out unless you hover or focus it.
  useEffect(() => {
    if (!batch.length || paused) return;
    timer.current = window.setTimeout(() => setBatch([]), holdMs);
    return () => window.clearTimeout(timer.current);
  }, [batch.length, toastKey, paused, holdMs]);

  // The demo reads the latest list and handlers through a ref.
  const latest = useRef({ archive, undo, list });
  useEffect(() => {
    latest.current = { archive, undo, list };
  });

  // Demo: archive a row, then undo it.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    const run = () => {
      if (!alive || touched.current) return;
      ids.push(
        window.setTimeout(() => {
          if (touched.current) return;
          const m = latest.current.list[1];
          if (m) latest.current.archive(m);
        }, 1400),
      );
      ids.push(
        window.setTimeout(() => {
          if (!touched.current) latest.current.undo();
        }, 3600),
      );
      ids.push(window.setTimeout(run, 6200));
    };
    run();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [autoplay, reduce, active]);

  const count = batch.length;
  const last = batch[batch.length - 1];
  const summary = count === 0 ? "" : count > 1 ? `${count} conversations archived` : `Archived ${last?.subject ?? ""}`;
  const pop = reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 420, damping: 30, delay: ghost ? 0.3 : 0 };

  return (
    <div
      ref={box}
      className={`relative w-[400px] max-w-full overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Inbox</h3>
        <button
          type="button"
          onClick={() => {
            touched.current = true;
            setList(mails);
            setBatch([]);
          }}
          className={`rounded text-[13px] font-medium text-[#0071e3] hover:underline dark:text-[#0a84ff] ${FOCUS}`}
        >
          Reset
        </button>
      </div>
      <ul className="m-0 min-h-[300px] list-none px-2 pb-24 pt-1">
        <AnimatePresence initial={false}>
          {list.map((m) => (
            <motion.li
              key={m.id}
              ref={(el) => {
                if (el) rows.current.set(m.id, el);
                else rows.current.delete(m.id);
              }}
              layout={!reduce}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, transition: { duration: reduce ? 0.12 : 0.25, ease: [0.4, 0, 0.2, 1] } }}
              transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 380, damping: 34 }}
              className="group relative overflow-hidden rounded-[14px]"
            >
              {/* the highlight a restored row flashes */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[#0071e3]/[.08] dark:bg-[#0a84ff]/[.16]"
                initial={false}
                animate={{ opacity: restored.includes(m.id) ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              />
              <div className="relative flex items-center gap-3 px-3 py-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: m.hue }}>
                  {m.from[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2 text-[14px]">
                    <span className="truncate font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{m.from}</span>
                    <span className="flex-none text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{m.time}</span>
                  </span>
                  <span className="block truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{m.subject}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    touched.current = true;
                    archive(m);
                  }}
                  aria-label={`Archive ${m.subject}`}
                  className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-[#6e6e73] opacity-60 transition hover:bg-[#f5f5f7] hover:text-[#1d1d1f] focus-visible:opacity-100 group-hover:opacity-100 dark:text-[#a1a1a6] dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7] ${FOCUS}`}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="5" rx="1.5" />
                    <path d="M5 9v9a2 2 0 002 2h10a2 2 0 002-2V9M10 13h4" />
                  </svg>
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {!list.length && <li className="py-16 text-center text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">All caught up</li>}
      </ul>

      {/* the archived row, flying down into the toast */}
      <AnimatePresence>
        {ghost && (
          <motion.div
            key={`${ghost.mail.id}-${toastKey}`}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 flex items-center gap-3 overflow-hidden bg-white px-3 shadow-[0_12px_30px_-10px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[0_12px_30px_-10px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.08)]"
            initial={{ x: ghost.x, y: ghost.y, width: ghost.w, height: ghost.h, borderRadius: 14, opacity: 1 }}
            animate={{ x: ghost.tx, y: ghost.ty, width: ghost.tw, height: 52, borderRadius: 26, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.3, 0, 0.2, 1], opacity: { duration: 0.2, delay: 0.32 } }}
            onAnimationComplete={() => setGhost(null)}
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: ghost.mail.hue }}>
              {ghost.mail.from[0]}
            </span>
            <span className="truncate text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{ghost.mail.from}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only" role="status" aria-live="polite">
        {summary}
      </span>

      {/* the toast */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-3">
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              key="toast"
              layout={!reduce}
              role="group"
              aria-label="Archive undo"
              className="pointer-events-auto flex h-[52px] max-w-full items-center gap-3 rounded-full bg-[#1d1d1f] pl-5 pr-1.5 text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,.6)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_18px_40px_-14px_rgba(0,0,0,.9)]"
              initial={reduce ? { opacity: 0 } : { y: 30, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { y: 30, opacity: 0, scale: 0.95, transition: { duration: 0.22 } }}
              transition={pop}
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
              onFocus={() => setFocusIn(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusIn(false);
              }}
            >
              <motion.span layout={!reduce} aria-hidden="true" className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[14px]">
                <span className="relative inline-flex h-[1.3em] overflow-hidden tabular-nums">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={count} initial={reduce ? false : { y: "100%" }} animate={{ y: 0 }} exit={reduce ? { opacity: 0 } : { y: "-100%" }} transition={{ type: "spring", stiffness: 500, damping: 34 }}>
                      {count > 1 ? count : ""}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {count > 1 ? (
                  "conversations archived"
                ) : (
                  <>
                    Archived <span className="max-w-[84px] truncate text-white/60 min-[420px]:max-w-[120px]">{last?.subject}</span>
                  </>
                )}
              </motion.span>
              <motion.button
                layout={!reduce}
                type="button"
                onClick={() => {
                  touched.current = true;
                  undo();
                }}
                className="relative flex h-10 flex-none items-center gap-2 rounded-full bg-white/10 pl-2 pr-4 text-[14px] font-semibold hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2" />
                  <motion.circle
                    key={`${toastKey}${paused ? "h" : ""}`}
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 1 }}
                    animate={{ pathLength: paused ? 1 : 0 }}
                    transition={{ duration: paused ? 0.2 : holdMs / 1000, ease: "linear" }}
                  />
                </svg>
                Undo
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
