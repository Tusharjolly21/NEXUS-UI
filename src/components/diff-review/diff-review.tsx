"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

/** `same` text stays, `del` is struck out when the edit lands, `ins` is typed in. */
export type DiffKind = "same" | "del" | "ins";
/** One run of the paragraph. A `del` followed by an `ins` is one change (a replacement). */
export type DiffPart = [kind: DiffKind, text: string];

export interface DiffReviewProps {
  /** The paragraph as runs of unchanged, removed and added text. Defaults to a short hero-copy rewrite with four changes. */
  parts?: DiffPart[];
  /** Small label above the text box. */
  title?: string;
  /** Plays Improve writing, then Accept all, then Back to draft on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const DIFF_REVIEW_PARTS: DiffPart[] = [
  ["same", "Our app helps teams "],
  ["del", "to "],
  ["same", "manage "],
  ["del", "there"],
  ["ins", "their"],
  ["same", " projects"],
  ["del", " more better"],
  ["ins", " faster"],
  ["same", ". "],
  ["del", "It is very easy to use for everyone."],
  ["ins", "Anyone can pick it up in minutes."],
  ["same", " Try it free for 14 days."],
];

type Seg = { id: string; k: DiffKind; s: string; run: number };
type Phase = "draft" | "thinking" | "diff" | "accepted" | "rejected";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
// inside the clipped words the ring has to sit inside the box
const FOCUS_INSET = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

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
 * Review AI edits the way you review a teammate's. Ask it to improve the
 * paragraph and a shimmer passes over the text, then the suggestion appears
 * inline: removals struck through in red, additions typed in green. Accept all
 * and the removed words fold away while the new ones settle into normal text;
 * Reject and the additions fold away instead. Click a single change to take
 * just that one.
 */
export function DiffReview({ parts = DIFF_REVIEW_PARTS, title = "Homepage · Hero copy", autoplay = false, enableSound = true, className = "" }: DiffReviewProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<Phase>("draft");
  const [taken, setTaken] = useState<Set<number>>(() => new Set()); // changes accepted one at a time, by run
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const thinkTimer = useRef<number | undefined>(undefined);
  const active = useDemoActive(box, autoplay && !reduce);

  // split changed runs into words so each piece can fold away on its own
  const segs = useMemo<Seg[]>(
    () =>
      parts.flatMap(([k, s], ri): Seg[] =>
        k === "same" ? [{ id: `s${ri}`, k, s, run: ri }] : (s.match(/\s*\S+\s*/g) ?? []).map((w, wi) => ({ id: `${k}${ri}-${wi}`, k, s: w, run: ri })),
      ),
    [parts],
  );
  const pairRun = (run: number) => (parts[run]?.[0] === "ins" ? run - 1 : run);
  const total = useMemo(() => new Set(parts.flatMap(([k], ri) => (k === "same" ? [] : [parts[ri][0] === "ins" ? ri - 1 : ri]))).size, [parts]);
  const left = total - taken.size;

  const improve = () => {
    setTaken(new Set());
    setPhase("thinking");
    window.clearTimeout(thinkTimer.current);
    thinkTimer.current = window.setTimeout(() => setPhase((p) => (p === "thinking" ? "diff" : p)), reduce ? 350 : 1100);
  };
  useEffect(() => () => window.clearTimeout(thinkTimer.current), []);

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ improve, play });
  useEffect(() => {
    latest.current = { improve, play };
  });

  // Demo: improve, accept everything, go back to the draft.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    const go = (fn: () => void, t: number) =>
      ids.push(
        window.setTimeout(() => {
          if (alive && !touched.current) fn();
        }, t),
      );
    const loop = () => {
      if (!alive || touched.current) return;
      go(() => latest.current.improve(), 900);
      go(() => {
        latest.current.play.auto("success", 0.5);
        setPhase("accepted");
      }, 4600);
      go(() => setPhase("draft"), 7800);
      ids.push(window.setTimeout(loop, 8200));
    };
    loop();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [autoplay, reduce, active]);

  const visible = (k: DiffKind, run: number) => {
    if (k === "same") return true;
    if (phase === "draft" || phase === "thinking") return k === "del";
    if (phase === "accepted") return k === "ins";
    if (phase === "rejected") return k === "del";
    // reviewing: a change you've taken shows as final; others show both sides
    if (taken.has(pairRun(run))) return k === "ins";
    return true;
  };
  const marked = phase === "diff";

  // order of the changed words on screen, so they fold and type in a ripple
  const order = new Map<string, number>();
  for (const s of segs) if (s.k !== "same" && visible(s.k, s.run)) order.set(s.id, order.size);

  const label =
    phase === "diff"
      ? left > 0
        ? `${left} suggestion${left === 1 ? "" : "s"}`
        : "All changes taken"
      : phase === "accepted"
        ? "Edits applied"
        : phase === "rejected"
          ? "Kept original"
          : phase === "thinking"
            ? "Rewriting…"
            : "Draft";
  const dur = (n: number) => (reduce ? 0.12 : n);
  const btn = "h-9 rounded-full px-4 text-[13px] font-medium";

  return (
    <div
      ref={box}
      className={`w-[520px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
      onFocusCapture={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{title}</span>
        <span role="status" aria-live="polite" className="text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={label} className="inline-block" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}>
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <div className="relative mt-3 min-h-[120px] overflow-hidden rounded-[16px] bg-[#fafafa] p-4 dark:bg-[#2c2c2e]">
        <LayoutGroup>
          <p className="m-0 text-[17px] leading-[1.75] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <AnimatePresence initial={false}>
              {segs.map((s) => {
                if (!visible(s.k, s.run)) return null;
                if (s.k === "same")
                  return (
                    <motion.span layout={reduce ? false : "position"} key={s.id}>
                      {s.s}
                    </motion.span>
                  );
                const del = s.k === "del";
                const show = marked && !taken.has(pairRun(s.run));
                const n = order.get(s.id) ?? 0;
                return (
                  <motion.span
                    key={s.id}
                    layout={reduce ? false : "position"}
                    className="relative inline-block overflow-hidden whitespace-pre align-bottom"
                    initial={del || reduce ? false : { width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0, transition: { duration: dur(0.32), delay: reduce ? 0 : n * 0.02, ease: [0.4, 0, 0.2, 1] } }}
                    transition={{ width: { duration: dur(0.3), delay: del || reduce ? 0 : n * 0.04 }, opacity: { duration: dur(0.2), delay: del || reduce ? 0 : n * 0.04 } }}
                  >
                    <button
                      type="button"
                      tabIndex={show ? 0 : -1}
                      onClick={() => {
                        if (!show) return;
                        touched.current = true;
                        play("tap", 0.4);
                        setTaken((t) => new Set(t).add(pairRun(s.run)));
                      }}
                      aria-label={show ? `Accept change: ${del ? "remove" : "add"} "${s.s.trim()}"` : undefined}
                      className={`rounded-[4px] transition-colors duration-300 ${FOCUS_INSET} ${show ? "cursor-pointer" : "cursor-text"} ${
                        show
                          ? del
                            ? "bg-[rgba(255,59,48,.12)] text-[#c4271b] dark:bg-[rgba(255,69,58,.2)] dark:text-[#ff8a80]"
                            : "bg-[rgba(52,199,89,.16)] text-[#16702f] dark:bg-[rgba(48,209,88,.18)] dark:text-[#6be28a]"
                          : "bg-transparent text-[#1d1d1f] dark:text-[#f5f5f7]"
                      }`}
                    >
                      {s.s}
                    </button>
                    {del && (
                      <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 right-0 top-1/2 h-[1.5px] origin-left bg-[#c4271b] dark:bg-[#ff8a80]"
                        initial={false}
                        animate={{ scaleX: show ? 1 : 0 }}
                        transition={{ duration: dur(0.3), delay: show && !reduce ? n * 0.03 : 0 }}
                      />
                    )}
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </p>
        </LayoutGroup>
        <AnimatePresence>
          {phase === "thinking" && !reduce && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#0071e3]/10 to-transparent dark:via-[#0a84ff]/20"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex min-h-9 items-center gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "diff" ? (
            <motion.div key="review" className="flex w-full flex-wrap items-center gap-2" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="mr-auto text-[12.5px] text-[#6e6e73] dark:text-[#a1a1a6]">Click a change to take just that one</span>
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  play("off", 0.5);
                  setPhase("rejected");
                }}
                className={`${btn} bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  play("success", 0.5);
                  setPhase("accepted");
                }}
                className={`${btn} bg-[#1d1d1f] text-white hover:bg-black dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:hover:bg-white ${FOCUS}`}
              >
                Accept all
              </button>
            </motion.div>
          ) : (
            <motion.div key="idle" className="flex w-full items-center gap-2" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button
                type="button"
                disabled={phase === "thinking"}
                onClick={() => {
                  touched.current = true;
                  if (phase === "accepted" || phase === "rejected") setPhase("draft");
                  else improve();
                }}
                className={`${btn} flex items-center gap-1.5 bg-[#1d1d1f] text-white hover:bg-black disabled:opacity-50 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:hover:bg-white ${FOCUS}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" />
                </svg>
                {phase === "accepted" || phase === "rejected" ? "Back to draft" : "Improve writing"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
