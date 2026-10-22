"use client";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ChatHeadProps {
  /** Bounces the head, peeks new messages and drifts it between the edges until someone touches the stage. */
  autoplay?: boolean;
  /** Name shown on the head, in the peek and in the panel header. */
  name?: string;
  /** Called with the text of a quick reply when the visitor taps one. */
  onReply?: (text: string) => void;
  /** Called when the head is dropped on the target or dismissed with the Delete key. */
  onDismiss?: () => void;
  /** Extra classes for the stage. It is 360px wide at most and 540px tall. */
  className?: string;
}

const MAXW = 360;
const H = 540;
const HEAD = 60;
const M = 14;
const INCOMING = ["Lunch at 1?", "Sent you the deck", "Did the build go out?", "Look at this animation", "Free for a quick call?"];
const QUICK = ["On it", "Give me 5", "Yes!"];
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const INSTANT = { duration: 0 } as const;

/** A ref that reads true while the element is on screen and the tab is visible. Read it inside timers. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      on.current = inView && !document.hidden;
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

/**
 * A chat that lives in a floating head, like the bubbles on a phone. Drag it
 * anywhere and it flings to the nearest edge; drop it on the target at the
 * bottom to dismiss it. New messages make it bounce and peek a preview beside
 * it. Tap it and the whole conversation springs out of the bubble. It floats
 * over a stand-in page inside its own bounded stage, so it works in any
 * container. Keyboard: Enter or Space opens and closes, Escape closes, arrow
 * keys move the head, Delete dismisses it.
 */
export function ChatHead({ autoplay = false, name = "Maya", onReply, onDismiss, className }: ChatHeadProps) {
  const still = useReducedMotion() === true;
  const uid = useId();
  const stage = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const wRef = useRef(MAXW);
  const x = useMotionValue(MAXW - HEAD - M);
  const y = useMotionValue(120);
  const bounce = useMotionValue(1);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [overBin, setOverBin] = useState(false);
  const [gone, setGone] = useState(false);
  const [unread, setUnread] = useState(1);
  const [peek, setPeek] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([{ me: false, t: "Hey! Got a sec?" }]);
  const [side, setSide] = useState<"l" | "r">("r");
  const [live, setLive] = useState(false);
  const openRef = useRef(false);
  const goneRef = useRef(false);
  const touched = useRef(false);
  const moved = useRef(false);
  const refocus = useRef(false);
  const timers = useRef<number[]>([]);
  const peekTimer = useRef<number | undefined>(undefined);
  const onScreen = useOnScreen(stage);

  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    goneRef.current = gone;
  }, [gone]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    const t = timers;
    return () => {
      t.current.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(peekTimer.current);
    };
  }, []);

  // The stage can shrink on small screens; keep the head docked to its real edge.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      wRef.current = w;
      if (x.get() > w / 2) x.set(w - HEAD - M);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [x]);

  const spring = useCallback(<T extends object>(cfg: T): T | typeof INSTANT => (still ? INSTANT : cfg), [still]);

  const snap = (vx = 0) => {
    const w = wRef.current;
    const cx = x.get() + HEAD / 2 + vx * 0.15;
    const toL = cx < w / 2;
    setSide(toL ? "l" : "r");
    animate(x, toL ? M : w - HEAD - M, spring({ type: "spring", stiffness: 380, damping: 26, velocity: vx }));
    animate(y, Math.max(M + 40, Math.min(H - HEAD - 110, y.get())), spring({ type: "spring", stiffness: 380, damping: 30 }));
  };
  const nearBin = () => Math.hypot(x.get() + HEAD / 2 - wRef.current / 2, y.get() + HEAD / 2 - (H - 70)) < 60;

  const arrive = useCallback(
    (t: string) => {
      setMsgs((m) => [...m, { me: false, t }]);
      if (openRef.current) return;
      setUnread((u) => u + 1);
      if (goneRef.current) return;
      if (!still) animate(bounce, [1, 1.22, 0.92, 1.05, 1], { duration: 0.6 });
      setPeek(t);
      window.clearTimeout(peekTimer.current);
      peekTimer.current = window.setTimeout(() => setPeek(null), 2400);
    },
    [bounce, still],
  );

  // Autoplay: a new message every few ticks and a drift to the other edge, while the stage is on screen.
  useEffect(() => {
    if (!autoplay || still) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (!onScreen.current) return;
      k++;
      if (k % 3 === 1) arrive(INCOMING[k % INCOMING.length]);
      if (k % 3 === 2) {
        animate(x, k % 2 ? M : wRef.current - HEAD - M, { type: "spring", stiffness: 160, damping: 18 });
        setSide(k % 2 ? "l" : "r");
        animate(y, 90 + ((k * 70) % 220), { type: "spring", stiffness: 160, damping: 20 });
      }
    }, 1900);
    return () => window.clearInterval(id);
  }, [autoplay, still, arrive, onScreen, x, y]);

  useEffect(() => {
    if (gone) backRef.current?.focus();
    else if (refocus.current) {
      refocus.current = false;
      headRef.current?.focus();
    }
  }, [gone]);

  const touch = () => {
    touched.current = true;
    setLive(true);
  };

  const toggle = () => {
    // A click that ends a drag is not a tap.
    if (moved.current) return;
    const willOpen = !open;
    setOpen(willOpen);
    setUnread(0);
    setPeek(null);
    if (willOpen) {
      animate(x, wRef.current - HEAD - M, spring({ type: "spring", stiffness: 300, damping: 26 }));
      animate(y, 14, spring({ type: "spring", stiffness: 300, damping: 26 }));
      setSide("r");
    }
  };

  const dismiss = () => {
    onDismiss?.();
    animate(x, wRef.current / 2 - HEAD / 2, { duration: still ? 0 : 0.2 });
    animate(y, H - 70 - HEAD / 2, { duration: still ? 0 : 0.2 });
    later(() => {
      setGone(true);
      setOpen(false);
    }, still ? 0 : 200);
  };

  const dock = (toL: boolean, ny?: number) => {
    setSide(toL ? "l" : "r");
    animate(x, toL ? M : wRef.current - HEAD - M, spring({ type: "spring", stiffness: 380, damping: 26 }));
    if (ny !== undefined) animate(y, Math.max(M, Math.min(H - HEAD - M, ny)), spring({ type: "spring", stiffness: 380, damping: 30 }));
  };

  const headKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      dock(true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      dock(false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      dock(side === "l", y.get() - 48);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      dock(side === "l", y.get() + 48);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      dismiss();
    }
  };

  const stageKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpen(false);
      headRef.current?.focus();
    }
  };

  const binScale = useTransform(y, [H - 260, H - 120], [0.6, 1]);
  const peekXr = useTransform(x, (n) => n - 212);
  const peekXl = useTransform(x, (n) => n + HEAD + 10);
  const originX = useTransform(x, (n) => n + HEAD / 2);
  const originY = useTransform(y, (n) => n + HEAD / 2);
  const panelOrigin = useMotionTemplate`${originX}px ${originY}px`;
  const panelId = `${uid}-panel`;
  const hintId = `${uid}-hint`;

  return (
    <div
      ref={stage}
      className={cn(
        "relative h-[540px] w-[360px] max-w-full overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_50px_-30px_rgba(0,0,0,.35)] dark:bg-black dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={touch}
      onFocusCapture={touch}
      onKeyDown={stageKey}
    >
      {/* a quiet page underneath so the head reads as floating over your site */}
      <div className="absolute inset-x-6 top-6 flex flex-col gap-3" aria-hidden="true">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-3 w-16 rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]" />
          <div className="flex gap-2">
            {[0, 1, 2].map((k) => (
              <div key={k} className="h-2 w-8 rounded-full bg-[#f0f0f3] dark:bg-[#2c2c2e]" />
            ))}
          </div>
        </div>
        <div className="h-5 w-[70%] rounded-full bg-[#ececf0] dark:bg-[#2c2c2e]" />
        <div className="h-5 w-[48%] rounded-full bg-[#ececf0] dark:bg-[#2c2c2e]" />
        <div className="mb-3 h-2.5 w-[80%] rounded-full bg-[#f3f3f5] dark:bg-[#232325]" />
        {[0, 1].map((k) => (
          <div key={k} className="h-24 rounded-[18px] bg-[#f5f5f7] dark:bg-[#1c1c1e]" />
        ))}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((k) => (
            <div key={k} className="h-20 rounded-[18px] bg-[#f5f5f7] dark:bg-[#1c1c1e]" />
          ))}
        </div>
      </div>

      <span id={hintId} className="sr-only">
        Drag to move. Arrow keys move the head. Delete dismisses it.
      </span>
      <span className="sr-only" aria-live={live ? "polite" : "off"}>
        {peek && !open ? `${name}: ${peek}` : ""}
      </span>

      {/* the head */}
      <AnimatePresence>
        {!gone && (
          <motion.button
            ref={headRef}
            key="head"
            type="button"
            aria-label={open ? `Close chat with ${name}` : `Open chat with ${name}${unread ? `, ${unread} unread` : ""}`}
            aria-expanded={open}
            aria-controls={panelId}
            aria-describedby={hintId}
            className={cn("absolute left-0 top-0 z-30 touch-none rounded-full", FOCUS)}
            style={{ x, y, width: HEAD, height: HEAD, scale: bounce }}
            drag
            dragMomentum={false}
            dragElastic={0}
            onPointerDown={() => {
              moved.current = false;
            }}
            onDragStart={() => {
              moved.current = true;
              setDragging(true);
              setPeek(null);
            }}
            onDrag={() => setOverBin(nearBin())}
            onDragEnd={(_, info) => {
              setDragging(false);
              setOverBin(false);
              // The click that follows a drag arrives right after pointer up; clear the flag once it has passed.
              later(() => {
                moved.current = false;
              }, 60);
              if (nearBin()) {
                dismiss();
                return;
              }
              snap(info.velocity.x);
            }}
            onClick={toggle}
            onKeyDown={headKey}
            exit={still ? { opacity: 0, transition: INSTANT } : { scale: 0, opacity: 0, transition: { duration: 0.25 } }}
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff9f0a] to-[#ff375f] shadow-[0_10px_24px_-8px_rgba(255,55,95,.7),inset_0_-3px_6px_rgba(0,0,0,.15)]" />
            <span className="absolute inset-0 flex items-center justify-center text-[22px] font-semibold text-white" aria-hidden="true">
              {name.charAt(0)}
            </span>
            <AnimatePresence>
              {unread > 0 && !open && (
                <motion.span
                  key={unread}
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff3b30] px-1.5 text-[12px] font-bold text-white ring-2 ring-white dark:bg-[#ff453a] dark:ring-black"
                  initial={still ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={spring({ type: "spring", stiffness: 600, damping: 18 })}
                >
                  {unread}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* conversation panel springs out of the head */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-label={`Conversation with ${name}`}
            className="absolute inset-x-3 bottom-3 top-[84px] z-10 flex flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_20px_50px_-20px_rgba(0,0,0,.9)]"
            style={{ transformOrigin: panelOrigin }}
            initial={still ? { opacity: 0 } : { scale: 0.1, opacity: 0, borderRadius: 60 }}
            animate={still ? { opacity: 1 } : { scale: 1, opacity: 1, borderRadius: 26 }}
            exit={still ? { opacity: 0 } : { scale: 0.1, opacity: 0, borderRadius: 60 }}
            transition={spring({ type: "spring", stiffness: 320, damping: 28 })}
          >
            <div className="flex items-center gap-2.5 border-b border-black/5 px-4 py-3 dark:border-white/10">
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ff9f0a] to-[#ff375f]" aria-hidden="true" />
              <span className="text-[15px] font-semibold">{name}</span>
            </div>
            <div role="log" aria-live="polite" className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "max-w-[78%] rounded-[18px] px-3.5 py-2 text-[14px]",
                    m.me ? "self-end bg-[#0071e3] text-white dark:bg-[#0a84ff]" : "self-start bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]",
                  )}
                  initial={still ? false : { opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={spring({ delay: 0.15 + i * 0.05, type: "spring", stiffness: 420, damping: 28 })}
                >
                  {m.t}
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-black/5 p-3 dark:border-white/10">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setMsgs((m) => [...m, { me: true, t: q }]);
                    onReply?.(q);
                  }}
                  className={cn("h-8 rounded-full bg-[#f0f0f3] px-3 text-[12px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]", FOCUS)}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* dismiss target */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            key="bin"
            aria-hidden="true"
            className="absolute bottom-10 left-1/2 z-0 -ml-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-black/55 dark:bg-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{ scale: binScale }}
          >
            <motion.span className="absolute inset-0 bg-[#ff3b30] dark:bg-[#ff453a]" initial={false} animate={{ opacity: overBin ? 1 : 0 }} transition={{ duration: 0.15 }} />
            <svg className="relative" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* preview that peeks out beside the head */}
      <AnimatePresence>
        {peek && !open && !gone && (
          <motion.div
            key={peek}
            aria-hidden="true"
            className={cn("pointer-events-none absolute z-20 flex w-[200px]", side === "r" ? "justify-end" : "justify-start")}
            style={{ top: y, left: 0, x: side === "r" ? peekXr : peekXl }}
            initial={still ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={spring({ type: "spring", stiffness: 400, damping: 26 })}
          >
            <span className="max-w-full rounded-[16px] bg-white px-3.5 py-2 text-[13px] text-[#1d1d1f] shadow-[0_10px_30px_-12px_rgba(0,0,0,.4)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_30px_-12px_rgba(0,0,0,.9)]">
              <span className="block text-[11px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">{name}</span>
              {peek}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {gone && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button
            ref={backRef}
            type="button"
            onClick={() => {
              refocus.current = true;
              x.set(wRef.current - HEAD - M);
              y.set(120);
              setSide("r");
              setGone(false);
            }}
            className={cn("h-10 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
          >
            Bring {name} back
          </button>
        </div>
      )}
    </div>
  );
}
