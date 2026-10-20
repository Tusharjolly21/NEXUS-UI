"use client";
import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent as RPointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

type Kind = "pill" | "icon" | "caret" | "card";

export interface MorphCursorIcon {
  /** Passed to `onAction` when the icon is pressed. */
  id: string;
  /** Accessible name of the icon button. */
  label: string;
  /** SVG path data drawn in a 24×24 viewBox with a 2px round stroke. */
  path: string;
}

export interface MorphCursorCard {
  /** Passed to `onAction` when the card is pressed. */
  id: string;
  label: string;
  /** CSS background for the card's square thumbnail. */
  gradient: string;
}

export const DEFAULT_MORPH_ICONS: MorphCursorIcon[] = [
  { id: "home", label: "Home", path: "M3 11l9-7 9 7v9H3z" },
  { id: "search", label: "Search", path: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" },
  { id: "like", label: "Favourite", path: "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" },
  { id: "record", label: "Record", path: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
];

export const DEFAULT_MORPH_CARDS: MorphCursorCard[] = [
  { id: "wireframes", label: "Wireframes", gradient: "linear-gradient(135deg,#5ac8fa,#0a4fd6)" },
  { id: "brand-kit", label: "Brand kit", gradient: "linear-gradient(135deg,#ffb38a,#ff375f)" },
];

export interface MorphCursorProps {
  /** The row of icon buttons at the top. */
  icons?: MorphCursorIcon[];
  /** Label of the pill button. */
  buttonLabel?: string;
  /** Accessible name of the text field. */
  inputLabel?: string;
  /** Starting text in the field (uncontrolled). */
  defaultInputValue?: string;
  /** The tiles under the field; two fit side by side. */
  cards?: MorphCursorCard[];
  /** Colour of the caret the pointer becomes over the field, and of the focus rings. */
  accent?: string;
  /** Called with an icon id, `"button"` for the pill, or a card id when one is pressed. */
  onAction?: (id: string) => void;
  /** Small caption at the bottom of the panel. Pass an empty string to hide it. */
  hint?: string;
  /** Glides the pointer over every target, 0.8s per stop, until someone moves over the panel. */
  autoplay?: boolean;
  /** Extra classes for the panel. */
  className?: string;
}

const SPRING = { stiffness: 420, damping: 32 };
const DOT = 14;

/**
 * A pointer with manners, like the one on an iPad. It's a soft dot until it
 * meets something you can press; then it melts into that element's shape and
 * sits behind it as a highlight, while the element leans a few pixels toward
 * your hand. Over text it becomes a caret. The system cursor is hidden only
 * inside this panel.
 */
export function MorphCursor({
  icons = DEFAULT_MORPH_ICONS,
  buttonLabel = "Start a project",
  inputLabel = "Project name",
  defaultInputValue = "Spring launch, website and email",
  cards = DEFAULT_MORPH_CARDS,
  accent = "#0071e3",
  onAction,
  hint = "Move the pointer around.",
  autoplay = false,
  className = "",
}: MorphCursorProps) {
  const stage = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState<{ k: string; kind: Kind } | null>(null);
  const [inside, setInside] = useState(autoplay);
  const bx = useSpring(160, SPRING);
  const by = useSpring(150, SPRING);
  const bw = useSpring(DOT, SPRING);
  const bh = useSpring(DOT, SPRING);
  const br = useSpring(DOT / 2, SPRING);
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const leanX = useSpring(lx, { stiffness: 300, damping: 20 });
  const leanY = useSpring(ly, { stiffness: 300, damping: 20 });
  const left = useTransform([bx, bw] as MotionValue<number>[], ([x, w]: number[]) => x - w / 2);
  const top = useTransform([by, bh] as MotionValue<number>[], ([y, h]: number[]) => y - h / 2);
  const touched = useRef(false);

  /** Move the pointer to (x, y) in panel coordinates and morph it to whatever is under it. */
  const update = useCallback(
    (x: number, y: number) => {
      const s = stage.current;
      if (!s) return;
      const sr = s.getBoundingClientRect();
      const els = Array.from(s.querySelectorAll<HTMLElement>("[data-cursor]"));
      const hit = els.find((el) => {
        const r = el.getBoundingClientRect();
        return x >= r.left - sr.left - 4 && x <= r.right - sr.left + 4 && y >= r.top - sr.top - 4 && y <= r.bottom - sr.top + 4;
      });
      if (hit) {
        const r = hit.getBoundingClientRect();
        const kind = hit.dataset.cursor as Kind;
        const k = hit.dataset.k ?? "";
        const cx = r.left - sr.left + r.width / 2;
        const cy = r.top - sr.top + r.height / 2;
        if (kind === "caret") {
          bx.set(x);
          by.set(cy);
          bw.set(2.5);
          bh.set(22);
          br.set(2);
          lx.set(0);
          ly.set(0);
        } else {
          const pad = kind === "card" ? 6 : 4;
          const dx = (x - cx) / r.width;
          const dy = (y - cy) / r.height;
          bx.set(cx + dx * 6);
          by.set(cy + dy * 6);
          bw.set(r.width + pad * 2);
          bh.set(r.height + pad * 2);
          br.set(kind === "icon" ? 14 : kind === "card" ? 22 : (r.height + pad * 2) / 2);
          lx.set(dx * 6);
          ly.set(dy * 6);
        }
        setOn((o) => (o?.k === k ? o : { k, kind }));
      } else {
        bx.set(x);
        by.set(y);
        bw.set(DOT);
        bh.set(DOT);
        br.set(DOT / 2);
        lx.set(0);
        ly.set(0);
        setOn(null);
      }
    },
    [bx, by, bw, bh, br, lx, ly],
  );

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const s = stage.current;
      if (!s) return;
      const sr = s.getBoundingClientRect();
      // Stops: each icon just right of centre, the pill just below centre, a point in the field, then the cards right to left.
      const stops: [number, number][] = [];
      const rect = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
      };
      s.querySelectorAll('[data-cursor="icon"]').forEach((el) => {
        const r = rect(el);
        stops.push([r.x + r.w / 2 + 14, r.y + r.h / 2]);
      });
      s.querySelectorAll('[data-cursor="pill"]').forEach((el) => {
        const r = rect(el);
        stops.push([r.x + r.w / 2, r.y + r.h / 2 + 10]);
      });
      s.querySelectorAll('[data-cursor="caret"]').forEach((el) => {
        const r = rect(el);
        stops.push([r.x + 96, r.y + r.h / 2 + 16]);
      });
      Array.from(s.querySelectorAll('[data-cursor="card"]'))
        .reverse()
        .forEach((el) => {
          const r = rect(el);
          stops.push([r.x + r.w * 0.3, r.y + r.h / 2 + 6]);
        });
      if (!stops.length) return;
      const [x, y] = stops[k++ % stops.length];
      update(x, y);
    }, 800);
    return () => clearInterval(t);
  }, [autoplay, update]);

  const move = (e: RPointerEvent) => {
    touched.current = true;
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    update(e.clientX - r.left, e.clientY - r.top);
  };

  // Keyboard users get the same highlight: it jumps to whatever takes focus from the keyboard.
  const focus = (e: FocusEvent<HTMLDivElement>) => {
    const el = e.target.closest<HTMLElement>("[data-cursor]");
    const s = stage.current;
    if (!el || !s || !e.target.matches(":focus-visible")) return;
    touched.current = true;
    const sr = s.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = el.dataset.cursor === "caret" ? r.right - sr.left - 12 : r.left - sr.left + r.width / 2;
    setInside(true);
    update(x, r.top - sr.top + r.height / 2);
  };

  const leanStyle = (k: string) => (on?.k === k ? { x: leanX, y: leanY } : undefined);
  const hl = on?.kind === "caret" ? "var(--mc-accent)" : on ? "var(--mc-hl)" : "var(--mc-dot)";
  const press = (id: string) => () => onAction?.(id);
  const ring = "outline-none focus-visible:ring-2 focus-visible:ring-[var(--mc-accent)]";

  return (
    <div
      ref={stage}
      className={`relative h-[330px] w-[320px] max-w-full cursor-none overflow-hidden rounded-[26px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] [--mc-dot:rgba(29,29,31,.85)] [--mc-hl:rgba(0,0,0,.07)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:[--mc-dot:rgba(245,245,247,.85)] dark:[--mc-hl:rgba(255,255,255,.1)] ${className}`}
      style={{ ["--mc-accent" as string]: accent }}
      onPointerMove={move}
      onPointerEnter={() => setInside(true)}
      onPointerLeave={() => {
        if (touched.current) setInside(false);
      }}
      onFocus={focus}
    >
      <motion.div
        className="pointer-events-none absolute z-0"
        style={{ left, top, width: bw, height: bh, borderRadius: br, background: hl, opacity: inside ? 1 : 0, transition: "background .2s, opacity .2s" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-center gap-2 px-6 pt-8">
        {icons.map((ic) => (
          <motion.button
            key={ic.id}
            data-cursor="icon"
            data-k={`icon-${ic.id}`}
            type="button"
            aria-label={ic.label}
            onClick={press(ic.id)}
            className={`flex h-11 w-11 flex-none cursor-none items-center justify-center rounded-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] ${ring}`}
            style={leanStyle(`icon-${ic.id}`)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={ic.path} />
            </svg>
          </motion.button>
        ))}
      </div>
      <div className="relative z-10 mt-5 flex justify-center">
        <motion.button
          data-cursor="pill"
          data-k="pill"
          type="button"
          onClick={press("button")}
          className={`h-11 cursor-none rounded-full px-6 text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] ${ring}`}
          style={leanStyle("pill")}
        >
          {buttonLabel}
        </motion.button>
      </div>
      <div className="relative z-10 mx-6 mt-5">
        <input
          data-cursor="caret"
          data-k="caret"
          aria-label={inputLabel}
          defaultValue={defaultInputValue}
          autoComplete="off"
          className="h-10 w-full cursor-none bg-transparent text-[15px] text-[#1d1d1f] outline-none dark:text-[#f5f5f7]"
          style={{ caretColor: accent }}
        />
      </div>
      <div className="relative z-10 mx-6 mt-3 flex gap-3">
        {cards.map((c) => (
          <motion.button
            key={c.id}
            data-cursor="card"
            data-k={`card-${c.id}`}
            type="button"
            onClick={press(c.id)}
            className={`flex h-[64px] min-w-0 flex-1 cursor-none items-center gap-3 rounded-[16px] px-3 text-left ${ring}`}
            style={leanStyle(`card-${c.id}`)}
          >
            <span className="h-9 w-9 flex-none rounded-[10px]" style={{ background: c.gradient }} />
            <span className="truncate text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{c.label}</span>
          </motion.button>
        ))}
      </div>
      {hint ? (
        <span className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[12px] text-[#86868b] dark:text-[#98989d]">{hint}</span>
      ) : null}
    </div>
  );
}
