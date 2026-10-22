"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

/** When the text ends with the pattern, offer the string as a suggestion. */
export type GhostRule = [after: RegExp, suggestion: string];

export interface GhostAutocompleteProps {
  /** Which endings of the text get which suggestion. Use anchored patterns (ending in `$`) without the `g` flag. */
  rules?: GhostRule[];
  /** What the box starts with. */
  defaultValue?: string;
  /** The recipient line above the box. */
  to?: string;
  /** Called with the suggestion text when Tab accepts it. */
  onAccept?: (suggestion: string) => void;
  /** Types a short script into the box on a loop (accepting, following and dropping suggestions) until someone touches it. The script is written for the default rules and text. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sound once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const GHOST_AUTOCOMPLETE_RULES: GhostRule[] = [
  [/As discussed, $/i, "I'll send the revised proposal by Friday."],
  [/Let me know if $/i, "anything looks off before then."],
  [/\n\nBest,\n?$/i, "\nMaya"],
  [/Thanks for $/i, "the call today."],
];
export const GHOST_AUTOCOMPLETE_START = "Hi Leo,\n\nThanks for ";

const FOCUS_WITHIN =
  "focus-within:outline-2 focus-within:outline-[#0071e3] dark:focus-within:outline-[#0a84ff]";
const TEXT = "whitespace-pre-wrap break-words px-4 py-3.5 text-[16px] leading-[1.6]";
const IDLE_MS = 650;

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
 * Inline AI autocomplete for any text box. Pause and a suggestion fades in
 * as grey ghost text after your cursor; press Tab and it inks in from left to
 * right as if typed; keep typing the same words and it shrinks to follow
 * you; type something else and the ghost letters drop away. Escape dismisses
 * a suggestion (Tab only takes it while one is showing, so focus is never
 * trapped), and a screen reader hears each suggestion as it appears.
 */
export function GhostAutocomplete({
  rules = GHOST_AUTOCOMPLETE_RULES,
  defaultValue = GHOST_AUTOCOMPLETE_START,
  to = "leo@fieldnotes.example",
  onAccept,
  autoplay = false,
  enableSound = true,
  className = "",
}: GhostAutocompleteProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [v, setV] = useState(defaultValue);
  const [ghost, setGhost] = useState("");
  const [dismissed, setDismissed] = useState<string | null>(null); // the text a suggestion was dismissed at
  const [caretEnd, setCaretEnd] = useState(true);
  const [inked, setInked] = useState<{ from: number; to: number; id: number } | null>(null);
  const [drop, setDrop] = useState<{ s: string; id: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const idle = useRef<number | undefined>(undefined);
  const dropTimer = useRef<number | undefined>(undefined);
  const uid = useRef(0);
  const touched = useRef(false);
  const active = useDemoActive(box, autoplay && !reduce);

  const suggest = (text: string) => rules.find(([r]) => r.test(text))?.[1] ?? "";

  // Offer a suggestion after a short pause.
  useEffect(() => {
    if (ghost || !caretEnd || dismissed === v) return;
    idle.current = window.setTimeout(() => setGhost(suggest(v)), IDLE_MS);
    return () => window.clearTimeout(idle.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `suggest` only reads `rules`
  }, [v, ghost, caretEnd, dismissed, rules]);

  useEffect(
    () => () => {
      window.clearTimeout(idle.current);
      window.clearTimeout(dropTimer.current);
    },
    [],
  );

  const accept = (by: "user" | "auto") => {
    if (!ghost) return false;
    setInked({ from: v.length, to: v.length + ghost.length, id: ++uid.current });
    setV(v + ghost);
    setCaretEnd(true);
    onAccept?.(ghost);
    setGhost("");
    if (by === "user") play("tick", 0.4);
    else play.auto("tick", 0.4);
    return true;
  };
  const change = (next: string) => {
    if (ghost && next.length === v.length + 1 && next.startsWith(v)) {
      const c = next[next.length - 1];
      if (ghost[0] === c) {
        setV(next);
        setGhost(ghost.slice(1));
        return;
      }
    }
    if (ghost) {
      if (!reduce) {
        setDrop({ s: ghost, id: ++uid.current });
        window.clearTimeout(dropTimer.current);
        dropTimer.current = window.setTimeout(() => setDrop(null), 450);
      }
      setGhost("");
    }
    setInked(null);
    setV(next);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Tab" && !e.shiftKey && ghost) {
      e.preventDefault();
      accept("user");
    }
    if (e.key === "Escape" && ghost) {
      e.preventDefault();
      setDismissed(v);
      setGhost("");
    }
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ change, accept, v });
  useEffect(() => {
    latest.current = { change, accept, v };
  });

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
    const type = (s: string, at: number) => [...s].forEach((c, i) => go(() => latest.current.change(latest.current.v + c), at + i * 60));
    const loop = () => {
      if (!alive || touched.current) return;
      go(() => latest.current.accept("auto"), 1400);
      type(" As discussed, ", 2300);
      go(() => latest.current.accept("auto"), 4300);
      type(" Let me know if ", 5000);
      go(() => latest.current.change(latest.current.v + "a"), 6900); // matches: the ghost follows
      type("ny", 7300);
      type("way", 8300); // doesn't match: the ghost drops away
      go(() => {
        setV(defaultValue);
        setGhost("");
        setInked(null);
      }, 10600);
      ids.push(window.setTimeout(loop, 10800));
    };
    loop();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [autoplay, reduce, active, defaultValue]);

  const before = inked ? v.slice(0, inked.from) : v;
  const ink = inked ? v.slice(inked.from, inked.to) : "";
  const after = inked ? v.slice(inked.to) : "";
  const shown = ghost.trim();

  return (
    <div
      ref={box}
      className={`w-[480px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="min-w-0 truncate font-medium text-[#6e6e73] dark:text-[#a1a1a6]">To: {to}</span>
        <span className="flex flex-none items-center gap-1.5 text-[#6e6e73] dark:text-[#a1a1a6]">
          <kbd className="rounded-[5px] bg-[#f5f5f7] px-1.5 py-[1px] font-sans text-[11px] font-semibold text-[#1d1d1f] shadow-[0_1px_0_rgba(0,0,0,.1)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_1px_0_rgba(255,255,255,.1)]">Tab</kbd> to accept
        </span>
      </div>
      <div className={`relative mt-3 min-h-[190px] rounded-[16px] bg-[#f5f5f7] dark:bg-[#2c2c2e] ${FOCUS_WITHIN}`}>
        {/* what you see: your text, the inked-in acceptance, and the ghost. It sizes the box, so long text grows it. */}
        <div className={`pointer-events-none min-h-[190px] ${TEXT} text-[#1d1d1f] dark:text-[#f5f5f7]`} aria-hidden="true">
          {before}
          {[...ink].map((c, i) => (
            <motion.span
              key={`${inked?.id}-${i}`}
              initial={reduce ? false : { opacity: 0.42 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.012, duration: 0.25 }}
            >
              {c}
            </motion.span>
          ))}
          {after}
          <AnimatePresence>
            {ghost && (
              <motion.span
                key="g"
                className="text-[#86868b] dark:text-[#8e8e93]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: reduce ? 0.1 : 0.35 }}
              >
                {ghost}
                <span className="ml-1.5 inline-block translate-y-[-1px] rounded-[5px] bg-white px-1.5 align-middle text-[10.5px] font-semibold leading-[18px] text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#3a3a3c] dark:text-[#a1a1a6] dark:shadow-none">
                  Tab
                </span>
              </motion.span>
            )}
          </AnimatePresence>
          {drop &&
            [...drop.s].map((c, i) => (
              <motion.span
                key={`${drop.id}-${i}`}
                className="inline-block whitespace-pre text-[#86868b] dark:text-[#8e8e93]"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: 10, rotate: (i % 2 ? 1 : -1) * 10 }}
                transition={{ duration: 0.35, delay: i * 0.008 }}
              >
                {c}
              </motion.span>
            ))}
          {"​"}
        </div>
        {/* what you type into: same text, invisible, with a real caret */}
        <textarea
          value={v}
          onChange={(e) => {
            touched.current = true;
            setDismissed(null);
            setCaretEnd(e.target.selectionStart === e.target.value.length);
            change(e.target.value);
          }}
          onKeyDown={(e) => {
            touched.current = true;
            onKey(e);
          }}
          onSelect={(e) => {
            // a suggestion belongs at the end of the text, so it only shows while the caret is there
            const t = e.currentTarget;
            const end = t.selectionStart === t.value.length && t.selectionEnd === t.value.length;
            setCaretEnd(end);
            if (!end) setGhost("");
          }}
          onFocus={() => {
            touched.current = true;
          }}
          spellCheck={false}
          aria-label="Email body"
          aria-describedby="ghost-autocomplete-hint"
          className={`absolute inset-0 block h-full w-full resize-none overflow-hidden bg-transparent text-transparent caret-[#0071e3] outline-none dark:caret-[#0a84ff] ${TEXT}`}
        />
      </div>
      <p id="ghost-autocomplete-hint" className="m-0 mt-3 min-h-5 text-[12.5px] text-[#6e6e73] dark:text-[#a1a1a6]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={ghost ? "g" : "n"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {ghost ? (
              <>
                Suggestion: <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">&ldquo;{shown}&rdquo;</span>
              </>
            ) : (
              "Pause typing for a suggestion"
            )}
          </motion.span>
        </AnimatePresence>
      </p>
      <span className="sr-only" role="status" aria-live="polite">
        {ghost ? `Suggestion: ${shown}. Press Tab to accept or Escape to dismiss.` : ""}
      </span>
    </div>
  );
}
