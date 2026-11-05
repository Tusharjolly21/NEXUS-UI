# Highlight Popover

Add the "Highlight Popover" component from Nexus UI to my project.

Highlight Popover: select text in an article and a toolbar rises out of the selection like a drop of ink. The dark pill and a bead of liquid start at the selection; the pill lifts and widens while the bead stretches a neck behind it and snaps away. Point at a colour to see it on the words, then pick it and a marker nib draws the highlight line by line: a chisel-tip band with uneven edges and ink pooled where the tip stopped, multiplied onto the page so the words stay crisp. Tap a highlight to change its colour, add a note (the pill widens into a field and a marker appears in the margin), copy it, or remove it, which wipes the ink back off. Keyboard: select with Shift and the arrows, then press Enter to reach the toolbar. Highlights are buttons; Escape closes.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { HighlightPopover } from "@/components/highlight-popover";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/highlight-popover/highlight-popover.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  text_bubble: "<path fill=\"currentColor\" d=\"M16.586 52.246c1.172 0 1.969-.61 3.375-1.875l8.11-7.195h15.023c6.984 0 10.734-3.867 10.734-10.735V14.488c0-6.867-3.75-10.734-10.734-10.734H12.906c-6.96 0-10.734 3.844-10.734 10.734v17.953c0 6.891 3.773 10.735 10.734 10.735h1.125v6.093c0 1.805.938 2.977 2.555 2.977m.96-4.289V41.16c0-1.265-.468-1.758-1.757-1.758h-2.86c-4.757 0-6.984-2.414-6.984-6.984v-17.93c0-4.57 2.227-6.96 6.985-6.96h30.164c4.734 0 6.96 2.39 6.96 6.96v17.93c0 4.57-2.226 6.984-6.96 6.984H27.906c-1.289 0-1.968.188-2.86 1.102ZM16.07 17.512h23.86c.75 0 1.36-.586 1.36-1.36c0-.75-.61-1.336-1.36-1.336H16.07a1.32 1.32 0 0 0-1.336 1.336c0 .774.586 1.36 1.336 1.36m0 7.617h23.86c.75 0 1.36-.586 1.36-1.36c0-.726-.61-1.359-1.36-1.359H16.07c-.75 0-1.336.633-1.336 1.36c0 .773.586 1.359 1.336 1.359m0 7.64h15.516c.75 0 1.36-.585 1.36-1.335c0-.774-.61-1.383-1.36-1.383H16.07c-.75 0-1.336.61-1.336 1.383c0 .75.586 1.335 1.336 1.335\"/>",
  doc_on_doc: "<path fill=\"currentColor\" d=\"M11.505 56h21.4c4.561 0 6.721-2.314 6.721-6.92v-4.077h4.298c4.54 0 6.81-2.314 6.81-6.92V19.636c0-2.71-.53-4.43-2.182-6.126L37.422 2.182C35.836.573 34.006 0 31.648 0h-9.013c-4.54 0-6.833 2.314-6.833 6.92v4.077h-4.297c-4.54 0-6.832 2.314-6.832 6.92V49.08c0 4.628 2.292 6.92 6.832 6.92m28.121-24.683c0-2.821-.33-4.055-2.093-5.863L25.389 13.092c-1.675-1.72-3.063-2.094-5.553-2.094h-.485V6.964c0-2.16 1.19-3.416 3.46-3.416h9.3v11.526c0 2.535 1.256 3.769 3.769 3.769h11.306v19.196c0 2.181-1.169 3.416-3.46 3.416h-4.1Zm-3.217-15.67c-.794 0-1.102-.33-1.102-1.101V4.253l11.195 11.394ZM11.68 52.452c-2.27 0-3.46-1.234-3.46-3.438V17.96c0-2.16 1.19-3.415 3.482-3.415h7.648v12.782c0 2.777 1.41 4.143 4.143 4.143h12.584v17.543c0 2.204-1.19 3.438-3.482 3.438Zm12.232-24.309c-.882 0-1.234-.352-1.234-1.212V15.23l12.716 12.914Z\"/>",
  checkmark_alt: "<path fill=\"currentColor\" d=\"m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0\"/>",
  trash: "<path fill=\"currentColor\" d=\"m44.524 48.66l1.617-34.265h2.343c.961 0 1.735-.797 1.735-1.758s-.774-1.782-1.735-1.782H38.242V7.34c0-3.352-2.273-5.531-5.882-5.531h-8.766c-3.61 0-5.86 2.18-5.86 5.53v3.516H7.54c-.937 0-1.758.82-1.758 1.782c0 .96.82 1.758 1.758 1.758h2.344L11.5 48.684c.164 3.375 2.39 5.507 5.766 5.507h21.492c3.351 0 5.601-2.156 5.765-5.53M21.484 7.574c0-1.336.985-2.273 2.391-2.273h8.227c1.43 0 2.414.937 2.414 2.273v3.281H21.484Zm-3.867 43.102c-1.36 0-2.367-1.032-2.437-2.39l-1.64-33.891h28.85l-1.546 33.89c-.07 1.383-1.055 2.39-2.438 2.39Zm17.344-4.125c.773 0 1.36-.633 1.383-1.524l.703-24.75c.023-.89-.586-1.547-1.383-1.547c-.726 0-1.336.68-1.36 1.524l-.702 24.773c-.024.844.562 1.524 1.359 1.524m-13.898 0c.797 0 1.382-.68 1.359-1.524l-.703-24.773c-.024-.844-.656-1.524-1.383-1.524c-.797 0-1.383.657-1.36 1.547l.727 24.75c.024.891.586 1.524 1.36 1.524m8.367-1.524V20.254c0-.844-.633-1.524-1.407-1.524c-.773 0-1.43.68-1.43 1.524v24.773c0 .844.657 1.524 1.43 1.524c.75 0 1.407-.68 1.407-1.524\"/>",
  arrow_up: "<path fill=\"currentColor\" d=\"M27.988 50.137c1.22 0 2.11-.844 2.11-2.063V17.207l-.188-4.992l7.008 7.687l5.344 5.25c.375.375.937.563 1.476.563c1.172 0 2.04-.89 2.04-2.04c0-.562-.212-1.054-.657-1.523L29.56 6.566c-.446-.468-.985-.703-1.57-.703c-.563 0-1.102.235-1.548.703L10.88 22.152c-.445.47-.656.961-.656 1.524c0 1.148.867 2.039 2.015 2.039c.563 0 1.125-.188 1.5-.563l5.32-5.25l7.032-7.71l-.188 5.015v30.867c0 1.219.867 2.063 2.086 2.063\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";

export type Highlight = {
  id: string;
  /** pieces of one highlight that spans paragraphs share a group */
  group: string;
  /** paragraph index */
  p: number;
  start: number;
  end: number;
  color: HighlightColor;
};

export type HighlightPopoverProps = {
  title?: string;
  byline?: string;
  paragraphs?: string[];
  highlights?: Highlight[];
  /** notes by highlight group */
  notes?: Record<string, string>;
  onChange?: (highlights: Highlight[], notes: Record<string, string>) => void;
  /** Demo it on its own until someone touches it. Off by default. */
  autoplay?: boolean;
  className?: string;
};

const DEMO_TEXT = [
  "Most interface motion is timed. A panel slides for three hundred milliseconds and stops, whether you flicked it or barely touched it. Springs work differently: they have no duration, only stiffness, damping and the velocity you hand them.",
  "That last part matters most. When an animation starts from the speed of your finger, the screen stops feeling like a recording and starts feeling like a material. Throw a sheet and it travels further. Nudge it and it barely moves.",
  "Good spring motion is mostly invisible. People rarely notice the overshoot or the settle; they just say the app feels fast, calm or expensive. The craft is in choosing one or two moments to let the physics show.",
];
const DEMO_HIGHLIGHTS: Highlight[] = [{ id: "h0", group: "g0", p: 2, start: 0, end: 39, color: "purple" }];

const COLORS: Record<HighlightColor, { mark: string; dot: string; label: string }> = {
  yellow: { mark: "rgba(255,214,10,.42)", dot: "#ffd60a", label: "Yellow" },
  green: { mark: "rgba(52,199,89,.28)", dot: "#34c759", label: "Green" },
  blue: { mark: "rgba(90,200,250,.36)", dot: "#5ac8fa", label: "Blue" },
  pink: { mark: "rgba(255,55,95,.22)", dot: "#ff375f", label: "Pink" },
  purple: { mark: "rgba(175,82,222,.22)", dot: "#af52de", label: "Purple" },
};
const ORDER: HighlightColor[] = ["yellow", "green", "blue", "pink", "purple"];
const PILL_H = 42;
const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;

type Span = { p: number; start: number; end: number };
type Tool = { mode: "select" | "edit" | "note"; spans: Span[]; group?: string; anchor: { x: number; top: number; bottom: number } };

let seq = 0;
const uid = (k: string) => `${k}${Date.now().toString(36)}${(seq++).toString(36)}`;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** character offset of a DOM position inside a paragraph */
function offsetIn(par: Element, node: Node, offset: number) {
  const r = document.createRange();
  r.selectNodeContents(par);
  r.setEnd(node, offset);
  return r.toString().length;
}
/** a DOM range for a character span inside a paragraph */
function rangeFor(par: Element, start: number, end: number) {
  const r = document.createRange();
  const walk = document.createTreeWalker(par, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let setStart = false;
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const len = n.textContent?.length ?? 0;
    if (!setStart && start <= pos + len) {
      r.setStart(n, start - pos);
      setStart = true;
    }
    if (setStart && end <= pos + len) {
      r.setEnd(n, end - pos);
      return r;
    }
    pos += len;
  }
  return r;
}

/** paint a highlight over a span, merging with whatever it overlaps */
function paint(list: Highlight[], spans: Span[], color: HighlightColor, group: string) {
  let next = [...list];
  for (const s of spans) {
    let { start, end } = s;
    const touching = next.filter((h) => h.p === s.p && h.start <= end && h.end >= start);
    touching.forEach((h) => {
      start = Math.min(start, h.start);
      end = Math.max(end, h.end);
    });
    next = next.filter((h) => !touching.includes(h));
    next.push({ id: uid("h"), group, p: s.p, start, end, color });
  }
  return next;
}

// ─── The ink ───────────────────────────────────────────────────────────────────
// Highlights are drawn like a real chisel-tip marker: a band per line with slightly uneven edges and slanted
// ends, ink pooling where the tip stopped, a faint streak along the stroke, all multiplied onto the page so the
// words stay crisp. New ones are drawn by a nib that sweeps along each line in turn; removed ones are wiped back.

const INK: Record<HighlightColor, { fill: string; pool: string; nib: string }> = {
  yellow: { fill: "#ffe55c", pool: "#ffcf1f", nib: "#e0b100" },
  green: { fill: "#b2efb6", pool: "#6cd884", nib: "#2a9f4a" },
  blue: { fill: "#b2e0ff", pool: "#72c4f6", nib: "#2a93d8" },
  pink: { fill: "#ffbfd0", pool: "#ff86a5", nib: "#e0426a" },
  purple: { fill: "#e6cdfc", pool: "#c79af2", nib: "#9455cf" },
};
type Line = { x: number; y: number; w: number; h: number };
type Stroke = { group: string; color: HighlightColor; lines: Line[] };

const hashOf = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function rng(seed: number) {
  let x = seed || 1;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
}
/** rects on the same line that touch become one */
function mergeLines(rs: Line[]) {
  const out: Line[] = [];
  [...rs].sort((a, b) => a.y - b.y || a.x - b.x).forEach((r) => {
    const last = out[out.length - 1];
    if (last && Math.abs(last.y - r.y) < 3 && r.x <= last.x + last.w + 6) {
      const right = Math.max(last.x + last.w, r.x + r.w);
      last.w = right - last.x;
      last.h = Math.max(last.h, r.h);
    } else out.push({ ...r });
  });
  return out;
}
/** one line of marker: a chisel-tipped band with slightly uneven edges */
function band(l: Line, seed: number) {
  const r = rng(seed);
  const top = l.y + l.h * 0.12 + (r() - 0.5) * 1.2;
  const bot = l.y + l.h * 0.92 + (r() - 0.5) * 1.2;
  const tilt = (r() - 0.5) * 1.8;
  const x0 = l.x - 2;
  const x1 = l.x + l.w + 2;
  const sl = 3.5;
  const n = Math.max(2, Math.round((x1 - x0) / 24));
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(x0 + sl)} ${f(top)}`;
  for (let k = 1; k <= n; k++) d += `L${f(x0 + sl + ((x1 - x0 - sl) * k) / n)} ${f(top + (tilt * k) / n + (r() - 0.5) * 1.1)}`;
  d += `Q${f(x1 + 1.5)} ${f((top + bot) / 2 + tilt)} ${f(x1 - sl)} ${f(bot + tilt)}`;
  for (let k = n - 1; k >= 0; k--) d += `L${f(x0 + ((x1 - x0 - sl) * k) / n)} ${f(bot + (tilt * k) / n + (r() - 0.5) * 1.1)}`;
  d += `Q${f(x0 - 1.5)} ${f((top + bot) / 2)} ${f(x0 + sl)} ${f(top)}Z`;
  return { d, top, bot, x0, x1, tilt };
}

function Band({ l, seed, start, total, prog, color, clip }: { l: Line; seed: number; start: number; total: number; prog: MotionValue<number>; color: HighlightColor; clip: string }) {
  const b = useMemo(() => band(l, seed), [l, seed]);
  const width = useTransform(prog, (p) => clamp((p * total - start) / (l.w + 4), 0, 1) * (b.x1 - b.x0 + 10));
  const c = INK[color];
  const mid = (b.top + b.bot) / 2;
  return (
    <>
      <clipPath id={clip}>
        <motion.rect x={b.x0 - 5} y={b.top - 6} height={b.bot - b.top + 12} width={width} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <motion.path d={b.d} initial={false} animate={{ fill: c.fill }} transition={{ duration: 0.3 }} />
        <motion.ellipse cx={b.x0 + 4.5} cy={mid} rx={4} ry={(b.bot - b.top) / 2 - 1.5} initial={false} animate={{ fill: c.pool }} fillOpacity={0.4} />
        <motion.ellipse cx={b.x1 - 4.5} cy={mid + b.tilt} rx={4} ry={(b.bot - b.top) / 2 - 1.5} initial={false} animate={{ fill: c.pool }} fillOpacity={0.4} />
        <motion.path
          d={`M${b.x0 + 6} ${b.top + (b.bot - b.top) * 0.3}L${b.x1 - 6} ${b.top + (b.bot - b.top) * 0.3 + b.tilt}`}
          initial={false}
          animate={{ stroke: c.pool }}
          strokeOpacity={0.22}
          strokeWidth={1.3}
          fill="none"
        />
      </g>
    </>
  );
}

/** the marker's tip, riding the leading edge of the stroke */
function Nib({ lines, starts, total, prog, color }: { lines: Line[]; starts: number[]; total: number; prog: MotionValue<number>; color: HighlightColor }) {
  const at = (p: number) => {
    const s = p * total;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (s <= starts[i] + l.w) return { x: l.x + clamp(s - starts[i], 0, l.w), y: l.y + l.h * 0.52, h: l.h * 0.8 };
    }
    const l = lines[lines.length - 1];
    return { x: l.x + l.w, y: l.y + l.h * 0.52, h: l.h * 0.8 };
  };
  const x = useTransform(prog, (p) => at(p).x);
  const y = useTransform(prog, (p) => at(p).y);
  const opacity = useTransform(prog, (p) => (p > 0.002 && p < 0.995 ? 1 : 0));
  const h = lines[0]?.h * 0.8 || 18;
  const c = INK[color];
  return (
    <motion.g style={{ x, y, opacity }}>
      <rect x={-2.5} y={-h / 2} width={6} height={h} rx={2.5} transform="skewX(-16)" fill={c.nib} />
      <rect x={-1} y={-h / 2 + 2} width={1.6} height={h - 4} rx={0.8} transform="skewX(-16)" fill="#fff" fillOpacity={0.55} />
    </motion.g>
  );
}

function InkGroup({ stroke, sweep, wipe, tint, faint, reduced, onWiped, uid }: { stroke: Stroke; sweep: boolean; wipe: boolean; tint?: HighlightColor; faint?: boolean; reduced: boolean; onWiped?: () => void; uid: string }) {
  const lines = stroke.lines;
  const starts = useMemo(() => {
    let a = 0;
    return lines.map((l) => {
      const s = a;
      a += l.w + 36; // the hop down to the next line takes a moment too
      return s;
    });
  }, [lines]);
  const total = Math.max(1, starts.length ? starts[starts.length - 1] + lines[lines.length - 1].w : 1);
  const prog = useMotionValue(sweep && !reduced ? 0 : 1);
  useEffect(() => {
    if (sweep && !reduced) animate(prog, 1, { duration: 0.28 + total / 950, ease: [0.3, 0.05, 0.35, 1] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!wipe) return;
    if (reduced) return onWiped?.();
    const c = animate(prog, 0, { duration: 0.22 + total / 1500, ease: [0.5, 0, 0.7, 1] });
    c.then(() => onWiped?.());
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wipe]);
  const color = tint ?? stroke.color;
  return (
    <motion.g initial={faint ? { opacity: 0 } : false} animate={{ opacity: faint ? 0.6 : 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
      {lines.map((l, i) => (
        <Band key={i} l={l} seed={hashOf(stroke.group) + i * 7} start={starts[i]} total={total} prog={prog} color={color} clip={`${uid}${stroke.group}${i}`} />
      ))}
      {!reduced && (sweep || wipe) && <Nib lines={lines} starts={starts} total={total} prog={prog} color={color} />}
    </motion.g>
  );
}

// ─── Autoplay helpers ──────────────────────────────────────────────────────────
const STOP = Symbol("stop");

/**
 * Highlight Popover: select text in an article and a toolbar rises out of the selection like a drop of ink.
 * The dark pill and a bead of liquid start at the selection; the pill lifts and widens while the bead stretches
 * a neck behind it and snaps away. Point at a colour to see it on the words, then pick it and a marker nib draws
 * the highlight line by line: a chisel-tip band with uneven edges and ink pooled where the tip stopped, multiplied
 * onto the page so the words stay crisp. Tap a highlight to change its colour, add a note (the pill widens into a
 * field and a marker appears in the margin), copy it, or remove it, which wipes the ink back off.
 * Keyboard: select with Shift and the arrows, then press Enter to reach the toolbar. Highlights are buttons; Escape closes.
 */
export function HighlightPopover({
  title = "The quiet power of springs",
  byline = "Notes on interface motion, 6 min read",
  paragraphs = DEMO_TEXT,
  highlights: initial = DEMO_HIGHLIGHTS,
  notes: initialNotes = {},
  onChange,
  autoplay = false,
  className = "",
}: HighlightPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hl, setHl] = useState(initial);
  const [notes, setNotes] = useState(initialNotes);
  const [tool, setTool] = useState<Tool | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [pins, setPins] = useState<{ group: string; top: number }[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [preview, setPreview] = useState<HighlightColor | null>(null);
  const [previewLines, setPreviewLines] = useState<Line[]>([]);
  const [wiping, setWiping] = useState<string[]>([]);
  const inkId = `ink${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const gooId = `goo${useId().replace(/:/g, "")}`;
  const hlRef = useRef(hl);
  hlRef.current = hl;
  const toolRef = useRef(tool);
  toolRef.current = tool;

  useEffect(() => onChange?.(hl, notes), [hl, notes]); // eslint-disable-line react-hooks/exhaustive-deps

  // the pill, the bead of ink, and the toolbar contents
  const pcx = useMotionValue(0);
  const ptop = useMotionValue(0);
  const pw = useMotionValue(PILL_H);
  const pleft = useMotionValue(0);
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const dr = useMotionValue(0);
  const dLeft = useMotionValue(0);
  const dTop = useMotionValue(0);
  const dSize = useMotionValue(0);
  const shown = useMotionValue(0);
  const anims = useRef<AnimationPlaybackControls[]>([]);
  useEffect(() => {
    const sync = () => pleft.set(pcx.get() - pw.get() / 2);
    const syncD = () => {
      dLeft.set(dx.get() - dr.get());
      dTop.set(dy.get() - dr.get());
      dSize.set(dr.get() * 2);
    };
    const offs = [pcx.on("change", sync), pw.on("change", sync), dx.on("change", syncD), dy.on("change", syncD), dr.on("change", syncD)];
    return () => offs.forEach((o) => o());
  }, [pcx, pw, pleft, dx, dy, dr, dLeft, dTop, dSize]);

  const rel = (r: DOMRect) => {
    const b = bodyRef.current!.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, top: r.top - b.top, bottom: r.bottom - b.top };
  };

  // ─── where the toolbar goes ───
  const placed = useRef(false);
  useLayoutEffect(() => {
    if (!tool) return;
    const body = bodyRef.current;
    const content = contentRef.current;
    if (!body || !content) return;
    const w = Math.max(PILL_H, content.offsetWidth);
    const W = body.clientWidth;
    const above = tool.anchor.top - PILL_H - 12 > -54; // the article header gives some room above the first line
    const top = above ? tool.anchor.top - PILL_H - 12 : tool.anchor.bottom + 12;
    const cx = clamp(tool.anchor.x, w / 2 - 14, W - w / 2 + 14);
    const ay = above ? tool.anchor.top + 2 : tool.anchor.bottom - 2;
    anims.current.forEach((a) => a.stop());
    if (!placed.current) {
      // emerge: the pill starts as a bead on the words, then lifts and widens while a second bead holds on and lets go
      // jump, not set: a set() records a huge velocity that the springs below would inherit
      placed.current = true;
      pcx.jump(tool.anchor.x);
      ptop.jump(ay - PILL_H / 2);
      pw.jump(PILL_H * 0.5);
      dx.jump(tool.anchor.x);
      dy.jump(ay);
      dr.jump(9);
      shown.jump(1);
      anims.current = [
        animate(ptop, top, { type: "spring", stiffness: 260, damping: 20 }),
        animate(pcx, cx, { type: "spring", stiffness: 260, damping: 26 }),
        animate(pw, w, { type: "spring", stiffness: 320, damping: 24, delay: 0.07 }),
        animate(dr, [9, 12, 0], { duration: 0.5, times: [0, 0.35, 1], ease: "easeInOut" }),
      ];
    } else {
      dr.jump(0);
      anims.current = [animate(ptop, top, SPRING), animate(pcx, cx, SPRING), animate(pw, w, { type: "spring", stiffness: 480, damping: 34 })];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, copied]);

  const close = useCallback(() => {
    if (!toolRef.current) return;
    anims.current.forEach((a) => a.stop());
    anims.current = [animate(pw, PILL_H * 0.6, { duration: 0.16 }), animate(shown, 0, { duration: 0.16 })];
    placed.current = false;
    setTool(null);
    setDraft("");
    setPreview(null);
  }, [pw, shown]);

  // ─── selection → toolbar ───
  const pointerDown = useRef(false);
  const readSelection = useCallback((): Tool | null => {
    const sel = window.getSelection();
    const body = bodyRef.current;
    if (!sel || sel.isCollapsed || !sel.rangeCount || !body) return null;
    const range = sel.getRangeAt(0);
    if (!body.contains(range.commonAncestorContainer)) return null;
    const pars = [...body.querySelectorAll<HTMLElement>("[data-p]")];
    const spans: Span[] = [];
    pars.forEach((par) => {
      if (!range.intersectsNode(par)) return;
      const p = Number(par.dataset.p);
      const len = par.textContent?.length ?? 0;
      const start = par.contains(range.startContainer) ? offsetIn(par, range.startContainer, range.startOffset) : 0;
      const end = par.contains(range.endContainer) ? offsetIn(par, range.endContainer, range.endOffset) : len;
      if (end > start) spans.push({ p, start, end });
    });
    if (!spans.length) return null;
    const rects = [...range.getClientRects()].filter((r) => r.width > 1);
    const first = rects[0] ?? range.getBoundingClientRect();
    const box = range.getBoundingClientRect();
    const a = rel(first);
    return { mode: "select", spans, anchor: { x: rects.length > 1 ? rel(box).x : a.x, top: rel(box).top, bottom: rel(box).bottom } };
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onSel = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (pointerDown.current) return; // wait for the finger to lift
        const next = readSelection();
        const cur = toolRef.current;
        if (next) {
          if (cur?.mode === "select" && JSON.stringify(cur.spans) === JSON.stringify(next.spans)) return; // already showing this one
          placed.current = cur?.mode === "select" ? placed.current : false;
          setCopied(false);
          setTool(next);
        } else if (cur?.mode === "select") close();
      }, 260); // keyboard selections settle before the toolbar comes up
    };
    document.addEventListener("selectionchange", onSel);
    return () => {
      document.removeEventListener("selectionchange", onSel);
      clearTimeout(t);
    };
  }, [readSelection, close]);

  const onBodyDown = () => {
    pointerDown.current = true;
    if (toolRef.current?.mode !== "select") close();
  };
  // the toolbar rises when the finger lifts, not while the selection is still being dragged out
  const lift = useCallback(() => {
    if (!pointerDown.current) return;
    pointerDown.current = false;
    setTimeout(() => {
      const next = readSelection();
      if (next) {
        placed.current = false;
        setCopied(false);
        setTool(next);
      }
    }, 10);
  }, [readSelection]);
  useEffect(() => {
    window.addEventListener("pointerup", lift);
    return () => window.removeEventListener("pointerup", lift);
  }, [lift]);

  // clicking outside closes
  useEffect(() => {
    if (!tool) return;
    const down = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [tool, close]);

  // ─── actions ───
  const groupRect = (group: string) => {
    const els = [...(bodyRef.current?.querySelectorAll<HTMLElement>(`[data-group="${group}"]`) ?? [])];
    const rs = els.flatMap((e) => [...e.getClientRects()]);
    if (!rs.length) return null;
    const l = Math.min(...rs.map((r) => r.left));
    const r = Math.max(...rs.map((r) => r.right));
    const t = Math.min(...rs.map((r) => r.top));
    const b = Math.max(...rs.map((r) => r.bottom));
    const firstLine = rs.filter((x) => Math.abs(x.top - t) < 2);
    const fl = Math.min(...firstLine.map((x) => x.left));
    const fr = Math.max(...firstLine.map((x) => x.right));
    const body = bodyRef.current!.getBoundingClientRect();
    return { x: (rs.length > 1 && firstLine.length === rs.length ? (l + r) / 2 : (fl + fr) / 2) - body.left, top: t - body.top, bottom: b - body.top };
  };

  const openGroup = useCallback((group: string, mode: "edit" | "note" = "edit") => {
    requestAnimationFrame(() => {
      const anchor = groupRect(group);
      if (!anchor) return;
      setCopied(false);
      setDraft(notesRef.current[group] ?? "");
      setTool((t) => {
        if (!t) placed.current = false;
        return { mode, spans: [], group, anchor };
      });
    });
  }, []);
  const notesRef = useRef(notes);
  notesRef.current = notes;

  const colorOf = (group?: string) => (group ? hlRef.current.find((h) => h.group === group)?.color : undefined);

  const pick = (color: HighlightColor) => {
    const t = toolRef.current;
    if (!t) return;
    setPreview(null);
    if (t.mode === "select") {
      const group = uid("g");
      setHl((l) => paint(l, t.spans, color, group));
      setFresh(group);
      window.getSelection()?.removeAllRanges();
      openGroup(group);
    } else if (t.group) {
      const g = t.group;
      setHl((l) => l.map((h) => (h.group === g ? { ...h, color } : h)));
    }
  };
  const remove = () => {
    const g = toolRef.current?.group;
    if (!g) return;
    setWiping((w) => [...w, g]); // the ink is wiped back first; the highlight goes when it's gone
    close();
  };
  const wiped = useCallback((g: string) => {
    setHl((l) => l.filter((h) => h.group !== g));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setNotes(({ [g]: _gone, ...rest }) => rest);
    setWiping((w) => w.filter((x) => x !== g));
  }, []);
  const textOf = () => {
    const t = toolRef.current;
    if (!t) return "";
    if (t.mode === "select") return window.getSelection()?.toString() ?? "";
    return hlRef.current
      .filter((h) => h.group === t.group)
      .sort((a, b) => a.p - b.p || a.start - b.start)
      .map((h) => paragraphs[h.p].slice(h.start, h.end))
      .join("\n");
  };
  const copy = async () => {
    const text = textOf();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* the clipboard can be blocked in frames; the confirmation still shows */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };
  const toNote = () => {
    const t = toolRef.current;
    if (!t) return;
    if (t.mode === "select") {
      // a note needs a highlight to hang on: make a yellow one first
      const group = uid("g");
      setHl((l) => paint(l, t.spans, "yellow", group));
      setFresh(group);
      window.getSelection()?.removeAllRanges();
      openGroup(group, "note");
    } else setTool({ ...t, mode: "note" });
  };
  const saveNote = () => {
    const t = toolRef.current;
    if (!t?.group) return;
    const g = t.group;
    const v = draft.trim();
    setNotes((n) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [g]: _old, ...rest } = n;
      return v ? { ...rest, [g]: v } : rest;
    });
    setTool({ ...t, mode: "edit" });
    // the field goes away; keep focus in the toolbar so Escape and the arrows still work
    requestAnimationFrame(() => contentRef.current?.querySelector<HTMLButtonElement>('[aria-label="Add a note"]')?.focus({ preventScroll: true }));
  };

  // margin pins for notes
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const b = body.getBoundingClientRect();
    setPins(
      Object.keys(notes)
        .map((g) => {
          const el = body.querySelector<HTMLElement>(`[data-group="${g}"]`);
          const r = el?.getClientRects()[0];
          return r ? { group: g, top: r.top - b.top + r.height / 2 } : null;
        })
        .filter((x): x is { group: string; top: number } => !!x),
    );
  }, [notes, hl]);

  // where the ink goes: one band per line of every highlight, measured from the words themselves
  const measureInk = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    const b = body.getBoundingClientRect();
    const toLine = (r: DOMRect): Line => ({ x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height });
    const byGroup = new Map<string, Stroke>();
    body.querySelectorAll<HTMLElement>("mark[data-group]").forEach((el) => {
      const g = el.dataset.group!;
      const s = byGroup.get(g) ?? { group: g, color: (el.dataset.color as HighlightColor) ?? "yellow", lines: [] };
      s.lines.push(...[...el.getClientRects()].filter((r) => r.width > 1).map(toLine));
      byGroup.set(g, s);
    });
    setStrokes([...byGroup.values()].map((s) => ({ ...s, lines: mergeLines(s.lines) })));
  }, []);
  useLayoutEffect(() => {
    measureInk();
  }, [hl, paragraphs, measureInk]);
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const ro = new ResizeObserver(() => measureInk());
    ro.observe(body);
    document.fonts?.ready.then(measureInk).catch(() => undefined);
    return () => ro.disconnect();
  }, [measureInk]);
  // a preview of the colour you point at, over the selection
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || !preview || tool?.mode !== "select") return setPreviewLines([]);
    const b = body.getBoundingClientRect();
    const rs: Line[] = [];
    tool.spans.forEach((sp) => {
      const par = body.querySelector(`[data-p="${sp.p}"]`);
      if (!par) return;
      [...rangeFor(par, sp.start, sp.end).getClientRects()].filter((r) => r.width > 1).forEach((r) => rs.push({ x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }));
    });
    setPreviewLines(mergeLines(rs));
  }, [preview, tool]);

  useEffect(() => {
    if (!fresh) return;
    const t = setTimeout(() => setFresh(null), 900);
    return () => clearTimeout(t);
  }, [fresh]);

  // keyboard: Enter takes you from a keyboard selection into the toolbar; Escape leaves it
  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && toolRef.current) {
      e.preventDefault();
      const g = toolRef.current.group;
      close();
      if (g) bodyRef.current?.querySelector<HTMLElement>(`[data-group="${g}"]`)?.focus();
      return;
    }
    if (e.key === "Enter" && toolRef.current && !contentRef.current?.contains(document.activeElement) && !(e.target as HTMLElement).closest("mark")) {
      e.preventDefault();
      contentRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  };
  const onToolKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const bs = [...(contentRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    const i = bs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    bs[(i + (e.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length].focus();
  };

  // ─── Autoplay ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { amount: 0.4 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
      animate(gs, 1, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let last = performance.now();
        const tick = () => {
          if (!alive) return rej(STOP);
          const now = performance.now();
          if (inViewRef.current) left -= now - last;
          last = now;
          if (left <= 0) res();
          else setTimeout(tick, Math.min(60, Math.max(16, left)));
        };
        tick();
      });
    const run = (mv: MotionValue<number>, target: number, duration: number, ease: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - target) < 0.01) return res();
        const c = animate(mv, target, { duration, ease, onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    const local = (x: number, y: number) => {
      const b = root.getBoundingClientRect();
      return { x: x - b.left, y: y - b.top };
    };
    const moveTo = async (x: number, y: number) => {
      if (go.get() < 0.5) {
        gx.set(x + 24);
        gy.set(y + 30);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, 0.55), run(gy, y, 0.55)]);
    };
    const tap = async (el: Element | null | undefined) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = local(r.left + r.width / 2, r.top + r.height / 2);
      await moveTo(p.x, p.y);
      await run(gs, 0.78, 0.1);
      (el as HTMLElement).click();
      await run(gs, 1, 0.16);
    };
    /** drag a selection across a phrase, extending it as the finger moves */
    const select = async (phrase: string) => {
      const i = paragraphs.findIndex((p) => p.includes(phrase));
      const par = bodyRef.current?.querySelector(`[data-p="${i}"]`);
      if (i < 0 || !par) return;
      const s = paragraphs[i].indexOf(phrase);
      const e = s + phrase.length;
      const startRect = rangeFor(par, s, s + 1).getBoundingClientRect();
      const p0 = local(startRect.left, startRect.top + startRect.height / 2);
      await moveTo(p0.x, p0.y);
      await run(gs, 0.8, 0.12);
      pointerDown.current = true;
      const sel = window.getSelection();
      const steps = 22;
      for (let k = 1; k <= steps; k++) {
        await wait(26);
        const end = Math.round(s + ((e - s) * k) / steps);
        const r = rangeFor(par, s, end);
        sel?.removeAllRanges();
        sel?.addRange(r);
        const rr = rangeFor(par, end - 1, end).getBoundingClientRect();
        const p = local(rr.right, rr.top + rr.height / 2);
        gx.set(p.x);
        gy.set(p.y);
      }
      await run(gs, 1, 0.16);
      lift(); // the toolbar rises once the finger lifts
      await wait(260);
    };
    const button = (label: string) => contentRef.current?.querySelector(`[aria-label="${label}"]`);

    (async () => {
      while (alive) {
        await wait(900);
        await select("they have no duration, only stiffness, damping and the velocity you hand them");
        await wait(700);
        // try a couple of colours on before choosing
        for (const c of ["Pink", "Blue"]) {
          const b = button(c);
          if (!b) continue;
          const r = b.getBoundingClientRect();
          const p = local(r.left + r.width / 2, r.top + r.height / 2);
          await moveTo(p.x, p.y);
          setPreview(c.toLowerCase() as HighlightColor);
          await wait(650);
        }
        setPreview(null);
        await tap(button("Yellow"));
        await wait(1200);
        await select("the screen stops feeling like a recording and starts feeling like a material");
        await wait(800);
        await tap(button("Green"));
        await wait(700);
        await tap(button("Add a note"));
        await wait(400);
        const note = "Open the talk with this line";
        for (let k = 1; k <= note.length; k++) {
          await wait(42);
          setDraft(note.slice(0, k));
        }
        await wait(400);
        await tap(button("Save note"));
        await wait(1000);
        await run(go, 0, 0.25);
        close();
        await wait(1200);
        // change a colour on an existing highlight
        await tap(bodyRef.current?.querySelector('[data-group="g0"]'));
        await wait(900);
        await tap(button("Blue"));
        await wait(1200);
        await tap(button("Remove highlight"));
        await wait(900);
        await run(go, 0, 0.3);
        close();
        await wait(2600);
        setHl(initial);
        setNotes(initialNotes);
        await wait(1200);
      }
    })().catch((e) => e !== STOP && console.error(e));

    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  // ─── render ───
  const byPar = useMemo(() => {
    const m = new Map<number, Highlight[]>();
    hl.forEach((h) => m.set(h.p, [...(m.get(h.p) ?? []), h]));
    m.forEach((v) => v.sort((a, b) => a.start - b.start));
    return m;
  }, [hl]);

  const renderPar = (text: string, i: number) => {
    const marks = byPar.get(i) ?? [];
    const out: ReactNode[] = [];
    let at = 0;
    marks.forEach((h) => {
      if (h.start > at) out.push(text.slice(at, h.start));
      out.push(
        <mark
          key={h.id}
          data-group={h.group}
          tabIndex={0}
          role="button"
          aria-label={`Highlight: ${text.slice(h.start, h.end)}${notes[h.group] ? `. Note: ${notes[h.group]}` : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (window.getSelection()?.isCollapsed !== false) openGroup(h.group);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openGroup(h.group);
              requestAnimationFrame(() => requestAnimationFrame(() => contentRef.current?.querySelector<HTMLButtonElement>("button")?.focus()));
            }
          }}
          data-color={h.color}
          className="cursor-pointer rounded-[3px] bg-transparent px-[1px] text-inherit outline-none [box-decoration-break:clone] [-webkit-box-decoration-break:clone] focus-visible:shadow-[0_0_0_2px_rgba(0,113,227,.6)]"
        >
          {text.slice(h.start, h.end)}
        </mark>,
      );
      at = h.end;
    });
    if (at < text.length) out.push(text.slice(at));
    return out;
  };

  const activeColor = tool?.mode !== "select" ? colorOf(tool?.group) : undefined;

  return (
    <div
      ref={rootRef}
      onKeyDown={onRootKey}
      className={`relative w-full max-w-[560px] rounded-[24px] bg-white px-6 pb-8 pt-7 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] sm:px-11 ${className}`}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={gooId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
      </svg>
      <p className="m-0 text-[13px] text-[#6e6e73]">{byline}</p>
      <h3 className="m-0 mt-1 font-serif text-[26px] font-semibold leading-[1.15] tracking-[-0.02em]">{title}</h3>

      <div ref={bodyRef} onPointerDown={onBodyDown} className="relative mt-4">
        {paragraphs.map((t, i) => (
          <p key={i} data-p={i} className={`m-0 mb-4 font-serif text-[17px] leading-[1.62] text-[#1d1d1f] last:mb-0 ${previewLines.length ? "selection:bg-transparent" : "selection:bg-[#0071e3]/25"}`}>
            {renderPar(t, i)}
          </p>
        ))}

        {/* the ink, multiplied onto the page so the words stay crisp */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible mix-blend-multiply">
          <AnimatePresence>
            {strokes.map((st) => (
              <InkGroup
                key={st.group}
                uid={inkId}
                stroke={st}
                sweep={fresh === st.group}
                wipe={wiping.includes(st.group)}
                tint={tool?.mode !== "select" && tool?.group === st.group && preview ? preview : undefined}
                reduced={!!reduced}
                onWiped={() => wiped(st.group)}
              />
            ))}
            {preview && previewLines.length > 0 && (
              <InkGroup key="preview" uid={inkId} stroke={{ group: "preview", color: preview, lines: previewLines }} sweep={false} wipe={false} faint reduced={!!reduced} />
            )}
          </AnimatePresence>
        </svg>

        {/* note pins in the margin */}
        <AnimatePresence>
          {pins.map((pin) => (
            <motion.button
              key={pin.group}
              type="button"
              aria-label={`Note: ${notes[pin.group]}`}
              title={notes[pin.group]}
              onClick={() => openGroup(pin.group, "note")}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, top: pin.top }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 18 }}
              className="absolute -left-[23px] -mt-[10px] grid h-5 w-5 place-items-center rounded-full text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 sm:-left-[34px]"
              style={{ background: COLORS[colorOf(pin.group) ?? "yellow"].dot }}
            >
              <Icon name="text_bubble" size={10} />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* the ink: pill + bead, merged by the goo filter */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute -inset-10 z-20" style={{ opacity: shown, filter: `url(#${gooId}) drop-shadow(0 10px 14px rgba(0,0,0,.22))` }}>
          <div className="absolute inset-10">
            <motion.span className="absolute rounded-full bg-[#1d1d1f]" style={{ left: pleft, top: ptop, width: pw, height: PILL_H }} />
            <motion.span className="absolute rounded-full bg-[#1d1d1f]" style={{ left: dLeft, top: dTop, width: dSize, height: dSize }} />
          </div>
        </motion.div>

        {/* the toolbar contents ride on the pill */}
        <AnimatePresence>
          {tool && (
            <motion.div
              key="tool"
              className="absolute z-30"
              style={{ left: pcx, top: ptop }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.18 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              <div
                ref={contentRef}
                role="toolbar"
                aria-label="Highlight"
                onKeyDown={onToolKey}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-[42px] -translate-x-1/2 items-center gap-0.5 whitespace-nowrap px-1.5 text-white"
              >
                {tool.mode === "note" ? (
                  <form
                    className="flex items-center gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveNote();
                    }}
                  >
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Add a note"
                      aria-label="Note"
                      className="h-8 w-[200px] bg-transparent pl-3 text-[14px] text-white outline-none placeholder:text-white/60 sm:w-[230px]"
                    />
                    <button
                      type="submit"
                      aria-label="Save note"
                      className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]"
                    >
                      <Icon name="arrow_up" size={14} />
                    </button>
                  </form>
                ) : (
                  <>
                    {ORDER.map((c, k) => (
                      <motion.button
                        key={c}
                        type="button"
                        aria-label={COLORS[c].label}
                        aria-pressed={activeColor === c}
                        onClick={() => pick(c)}
                        onPointerEnter={() => setPreview(c)}
                        onPointerLeave={() => setPreview(null)}
                        onFocus={() => setPreview(c)}
                        onBlur={() => setPreview(null)}
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 600, damping: 22, delay: 0.18 + k * 0.03 }}
                        whileTap={{ scale: 0.82 }}
                        className="grid h-8 w-8 place-items-center rounded-full outline-none focus-visible:bg-white/15"
                      >
                        <span
                          className="block h-[18px] w-[18px] rounded-full transition-shadow duration-200"
                          style={{ background: COLORS[c].dot, boxShadow: activeColor === c ? "0 0 0 2px #1d1d1f, 0 0 0 3.5px #fff" : "none" }}
                        />
                      </motion.button>
                    ))}
                    <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/20" />
                    <button
                      type="button"
                      aria-label="Add a note"
                      onClick={toNote}
                      className="grid h-8 w-8 place-items-center rounded-full outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/15"
                    >
                      <Icon name="text_bubble" size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={copied ? "Copied" : "Copy"}
                      onClick={copy}
                      className="relative grid h-8 w-8 place-items-center rounded-full outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/15"
                    >
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={copied ? "y" : "n"}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 600, damping: 26 }}
                          className={`grid ${copied ? "text-[#30d158]" : ""}`}
                        >
                          <Icon name={copied ? "checkmark_alt" : "doc_on_doc"} size={15} />
                        </motion.span>
                      </AnimatePresence>
                    </button>
                    {tool.mode === "edit" && (
                      <button
                        type="button"
                        aria-label="Remove highlight"
                        onClick={remove}
                        className="grid h-8 w-8 place-items-center rounded-full outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/15"
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ghost finger for the self-demo */}
      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-50 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
```

--- components/highlight-popover/index.ts ---

```ts
export { HighlightPopover } from "./highlight-popover";
export type { HighlightColor, Highlight, HighlightPopoverProps } from "./highlight-popover";
```
