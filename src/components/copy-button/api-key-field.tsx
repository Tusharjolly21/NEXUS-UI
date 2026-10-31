"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface ApiKeyFieldProps {
  /** Called with the (fake) key after a real press of the copy button. The autoplay demo never calls it. */
  onCopy?: (key: string) => void;
  /** Called with the new (fake) key after the user confirms a rotation. */
  onRotate?: (key: string) => void;
  /** Reveals, copies and rotates by itself in a loop until someone presses or types in the card. Never touches the clipboard. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

const CHARS = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
/** Demo data only. The prefix makes every key obviously fake and nothing here is ever sent anywhere. */
const PREFIX_TEXT = "nx_demo_";
const PREFIX = PREFIX_TEXT.length;
const TAIL = 4;
const INITIAL_KEY = `${PREFIX_TEXT}Fk3pQ9xLm2WdTz7RaB4cYn8H`;
const BULLET = "•";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const ICON_BTN =
  "flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-[#6e6e73] outline-none hover:bg-black/5 dark:text-[#a1a1a6] dark:hover:bg-white/10";

/** Small seeded generator (mulberry32): the same seed always gives the same sequence. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const masked = (k: string) => [...k].map((c, i) => (i < PREFIX || i >= k.length - TAIL ? c : BULLET));

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* clipboard unavailable, nothing else to do */
    }
    ta.remove();
  }
}

/** True while an autoplay demo may run: enabled, on screen, tab visible, motion allowed. */
function useAutoplayGate(ref: RefObject<HTMLElement | null>, enabled: boolean, reduce: boolean) {
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, enabled]);
  return enabled && !reduce && inView && tabVisible;
}

/**
 * An API key row for a settings page. The key sits masked with only its last
 * four characters showing. Reveal and the dots decode into the key one
 * character at a time; hide and they fold back. Rotating asks once, inline,
 * then scrambles the whole key into a new one and resets the "created" time.
 * The key is demo data (it starts with nx_demo_), rotating makes another fake
 * one on the client, and nothing leaves the page except a press on Copy.
 */
export function ApiKeyField({ onCopy, onRotate, autoplay = false, enableSound = true, className }: ApiKeyFieldProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const [keyText, setKeyText] = useState(INITIAL_KEY);
  const [shown, setShown] = useState<string[]>(() => masked(INITIAL_KEY));
  const [revealed, setRevealed] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [created, setCreated] = useState("Created 3 months ago");
  const [status, setStatus] = useState("");
  const [touched, setTouched] = useState(false);

  const keyRef = useRef(INITIAL_KEY);
  const shownRef = useRef<string[]>(masked(INITIAL_KEY));
  const revealedRef = useRef(false);
  const raf = useRef(0);
  const copyTimer = useRef<number | undefined>(undefined);
  const rotations = useRef(0);
  const noise = useRef<() => number>(seeded(7));
  const rotateBtn = useRef<HTMLButtonElement>(null);
  const cancelBtn = useRef<HTMLButtonElement>(null);
  const focusRotate = useRef(false);
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  });

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(copyTimer.current);
    },
    [],
  );

  const gate = useAutoplayGate(cardRef, autoplay, reduce);
  const playing = gate && !touched;

  const paint = useCallback((next: string[]) => {
    shownRef.current = next;
    setShown(next);
  }, []);

  /** Morph every character from what it shows now to `target`, sweeping left to right. */
  const morph = useCallback(
    (target: string[], scramble = 1) => {
      cancelAnimationFrame(raf.current);
      if (reduce) {
        paint(target);
        return;
      }
      const from = shownRef.current;
      const t0 = performance.now();
      const step = 26;
      const hold = 160 * scramble;
      const tick = (now: number) => {
        const t = now - t0;
        let busy = false;
        const frame = target.map((c, i) => {
          if (i < PREFIX) return c;
          const settle = hold + (i - PREFIX) * step;
          if (t >= settle) return c;
          busy = true;
          return t > settle - hold ? CHARS[Math.floor(noise.current() * CHARS.length)] : (from[i] ?? c);
        });
        paint(frame);
        if (busy) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    },
    [paint, reduce],
  );

  const setReveal = useCallback(
    (next: boolean) => {
      revealedRef.current = next;
      setRevealed(next);
      morph(next ? [...keyRef.current] : masked(keyRef.current));
    },
    [morph],
  );

  const flashCopied = useCallback(() => {
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }, []);

  /** Makes another fake key from the seeded generator. Each rotation uses its own seed. */
  const doRotate = useCallback(
    (real: boolean) => {
      rotations.current += 1;
      const rnd = seeded(1000 + rotations.current * 7919);
      const next = PREFIX_TEXT + Array.from({ length: 24 }, () => CHARS[Math.floor(rnd() * CHARS.length)]).join("");
      keyRef.current = next;
      setKeyText(next);
      setConfirm(false);
      setCreated("Created just now");
      morph(revealedRef.current ? [...next] : masked(next), 2);
      if (real) {
        setStatus("Key rotated. A new demo key was created.");
        onRotate?.(next);
      }
    },
    [morph, onRotate],
  );

  // Press handlers. Any of them ends the autoplay demo for good.
  const act = (fn: () => void) => {
    setTouched(true);
    fn();
  };
  const toggle = () => {
    const next = !revealedRef.current;
    setReveal(next);
    play(next ? "on" : "off");
    setStatus(next ? "Key revealed." : "Key hidden.");
  };
  const copy = () => {
    void writeClipboard(keyRef.current);
    flashCopied();
    play("success", 0.6);
    setStatus("Key copied to clipboard.");
    onCopy?.(keyRef.current);
  };
  const openConfirm = () => {
    setConfirm(true);
    // Move focus into the prompt so keyboard users land on a safe choice.
    window.setTimeout(() => cancelBtn.current?.focus(), 0);
  };
  const closeConfirm = () => {
    focusRotate.current = true;
    setConfirm(false);
  };
  const confirmRotate = () => {
    focusRotate.current = true;
    play("whoosh", 0.6);
    doRotate(true);
  };

  // Demo loop: reveal, copy, ask, rotate, hide, repeat. Never touches the clipboard.
  useEffect(() => {
    if (!playing) return;
    const ids: number[] = [];
    const at = (fn: () => void, t: number) => ids.push(window.setTimeout(fn, t));
    const loop = () => {
      at(() => {
        setConfirm(false);
        setReveal(true);
        playRef.current.auto("on");
      }, 900);
      at(() => {
        flashCopied();
        playRef.current.auto("success", 0.6);
      }, 2600);
      at(() => setConfirm(true), 4000);
      at(() => {
        playRef.current.auto("whoosh", 0.6);
        doRotate(false);
      }, 5600);
      at(() => {
        setReveal(false);
        playRef.current.auto("off");
      }, 7600);
      at(loop, 9400);
    };
    loop();
    return () => ids.forEach(clearTimeout);
  }, [playing, setReveal, flashCopied, doRotate]);

  const tail = keyText.slice(-TAIL);
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 34 };
  return (
    <div
      ref={cardRef}
      onPointerDown={() => setTouched(true)}
      onKeyDown={() => setTouched(true)}
      className={cn(
        "w-[460px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">Secret key</h3>
          <div className="relative mt-0.5 h-[18px] overflow-hidden text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={created}
                className="block truncate leading-[18px]"
                initial={{ y: reduce ? 0 : 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reduce ? 0 : -14, opacity: 0 }}
                transition={reduce ? { duration: 0 } : undefined}
              >
                {created} · Last used 2 min ago
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <span className="flex flex-none items-center gap-1.5 rounded-full bg-[#e9f9ee] px-2.5 py-1 text-[12px] font-semibold text-[#1a7f37] dark:bg-[#30d158]/15 dark:text-[#30d158]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34c759] dark:bg-[#30d158]" aria-hidden="true" />
          Live
        </span>
      </div>

      <div
        className={cn(
          "mt-4 flex h-12 items-center gap-1 rounded-[14px] bg-[#f5f5f7] pl-4 pr-1.5 transition-shadow duration-200 dark:bg-[#2c2c2e]",
          copied ? "shadow-[inset_0_0_0_1.5px_#0071e3] dark:shadow-[inset_0_0_0_1.5px_#0a84ff]" : "shadow-[inset_0_0_0_0_transparent]",
        )}
      >
        <code
          className="min-w-0 flex-1 truncate text-[13.5px] tracking-[0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]"
          style={{ fontFamily: MONO }}
        >
          <span className="sr-only">{revealed ? keyText : `Secret key ending in ${tail}`}</span>
          <span aria-hidden="true">
            {shown.map((c, i) => (
              <span
                key={i}
                className={c === BULLET ? "text-[#a1a1a6] dark:text-[#636366]" : i < PREFIX ? "text-[#6e6e73] dark:text-[#a1a1a6]" : ""}
              >
                {c}
              </span>
            ))}
          </span>
        </code>
        <button
          type="button"
          onClick={() => act(toggle)}
          aria-label={revealed ? "Hide key" : "Reveal key"}
          aria-pressed={revealed}
          className={cn(ICON_BTN, FOCUS)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            <motion.path d="M4 4l16 16" initial={false} animate={{ pathLength: revealed ? 0 : 1 }} transition={reduce ? { duration: 0 } : undefined} />
          </svg>
        </button>
        <button type="button" onClick={() => act(copy)} aria-label="Copy key" className={cn("relative", ICON_BTN, FOCUS)}>
          {/* Each icon sits in its own absolutely centred box. A bare <motion.svg> is never taken out of the
              layout by AnimatePresence, so the old and new icon would share the row and push the tick off centre. */}
          <AnimatePresence initial={false}>
            {copied ? (
              <motion.span key="ok" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={reduce ? { duration: 0 } : undefined}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" className="stroke-[#0071e3] dark:stroke-[#0a84ff]" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={reduce ? { duration: 0 } : undefined} />
                </svg>
              </motion.span>
            ) : (
              <motion.span key="cp" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={reduce ? { duration: 0 } : undefined}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="8" y="8" width="12" height="12" rx="3" />
                  <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {copied && (
              <motion.span
                className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
                initial={{ opacity: 0, y: reduce ? 0 : 6, scale: reduce ? 1 : 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: reduce ? 0 : 4 }}
                transition={reduce ? { duration: 0 } : undefined}
                aria-hidden="true"
              >
                Copied
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {confirm ? (
          <motion.div
            key="confirm"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
          >
            <div
              role="group"
              aria-label="Confirm key rotation"
              className="mt-3 flex flex-col gap-3 rounded-[14px] bg-[#fff4f2] p-3 sm:flex-row sm:items-center dark:bg-[#ff453a]/12"
            >
              <span className="min-w-0 flex-1 text-[13px] leading-[1.4] text-[#b42318] dark:text-[#ff6961]">
                The current key stops working immediately. Anything using it will fail.
              </span>
              <div className="flex justify-end gap-2">
                <button
                  ref={cancelBtn}
                  type="button"
                  onClick={() => act(closeConfirm)}
                  className={cn(
                    "h-8 rounded-full bg-white px-3 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]",
                    FOCUS,
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => act(confirmRotate)}
                  className="h-8 rounded-full bg-[#ff3b30] px-3 text-[13px] font-semibold text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff3b30] dark:bg-[#ff453a] dark:focus-visible:outline-[#ff453a]"
                >
                  Rotate key
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            className="mt-3 flex items-center justify-between gap-3 text-[13px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : undefined}
            onAnimationComplete={() => {
              if (focusRotate.current) {
                focusRotate.current = false;
                rotateBtn.current?.focus();
              }
            }}
          >
            <span className="min-w-0 text-[#6e6e73] dark:text-[#a1a1a6]">Keep it on the server. Never ship it to a browser.</span>
            <button
              ref={rotateBtn}
              type="button"
              onClick={() => act(openConfirm)}
              className={cn("flex-none rounded-sm font-medium text-[#0071e3] outline-none hover:underline dark:text-[#0a84ff]", FOCUS)}
            >
              Rotate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
