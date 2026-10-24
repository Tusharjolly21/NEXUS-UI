Add the "Real-Time Cursors" component from Nexus UI to my project.

A shared design board with teammates' cursors moving over it live: arrows glide between spots and lean with their speed, name tags trail behind and swing when they stop, stops land as clicks and now and then someone drops a comment. Your own pointer gets a You tag when it comes over the board.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { RealTimeCursors } from "@/components/real-time-cursors";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/real-time-cursors/index.ts ---

```ts
export { RealTimeCursors } from "./real-time-cursors";
export type { LiveCursor, RealTimeCursorsProps } from "./real-time-cursors";
```

--- components/real-time-cursors/real-time-cursors.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type LiveCursor = {
  /** Name on the label and the avatar. */
  name: string;
  /** Cursor and label colour. */
  color: string;
  /** Label text colour. Defaults to white. */
  textColor?: string;
  /** Points the cursor visits in a loop, in % of the board (x 0–100 left to right, y 0–100 top to bottom). */
  path: Array<{ x: number; y: number }>;
  /** Seconds per hop between points. Defaults to 1.1. */
  duration?: number;
  /** Seconds before this cursor starts moving. */
  delay?: number;
  /** A comment this person drops now and then, shown in a bubble by the label. */
  note?: string;
};

export type RealTimeCursorsProps = {
  /** Teammates on the board. */
  cursors?: LiveCursor[];
  /** Board name in the header. */
  title?: string;
  /** Shows a "You" label that follows the visitor's pointer over the board. */
  showYou?: boolean;
  /** Colour of the visitor's label. */
  youColor?: string;
  /** Moves a demo "You" cursor round the board until the visitor's pointer comes over it. */
  autoplay?: boolean;
  /** @deprecated The board is always drawn now. Kept so older code compiles. */
  showCodePanel?: boolean;
  className?: string;
};

const DEFAULT_CURSORS: LiveCursor[] = [
  { name: "Ava", color: "#0071e3", note: "Bigger headline?", path: [{ x: 18, y: 30 }, { x: 40, y: 22 }, { x: 34, y: 52 }, { x: 14, y: 62 }], duration: 1.2 },
  { name: "Noah", color: "#bf5af2", note: "Ship it", path: [{ x: 78, y: 70 }, { x: 62, y: 44 }, { x: 86, y: 30 }, { x: 70, y: 82 }], duration: 1.05, delay: 0.6 },
  { name: "Mira", color: "#ff9f0a", textColor: "#1d1d1f", path: [{ x: 52, y: 78 }, { x: 64, y: 22 }, { x: 44, y: 66 }, { x: 88, y: 56 }], duration: 1.35, delay: 1.2 },
];

const YOU_DEMO = [
  { x: 30, y: 74 },
  { x: 56, y: 34 },
  { x: 74, y: 58 },
  { x: 46, y: 50 },
];

const r3 = (n: number) => Math.round(n * 1000) / 1000;

function Arrow({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="drop-shadow-[0_2px_4px_rgba(0,0,0,.25)]">
      <path d="M3 2.2v14.1c0 .5.6.7.9.4l3.6-3.8c.2-.2.4-.3.6-.3h5.6c.5 0 .8-.6.4-1L4.1 1.8C3.7 1.4 3 1.7 3 2.2z" fill={color} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * One cursor. The arrow leans with its speed, the name tag trails a beat
 * behind on a looser spring and swings when the arrow stops (the follow-through
 * move), and each stop is a little click.
 */
function Pointer({
  x,
  y,
  name,
  color,
  textColor = "#ffffff",
  click,
  note,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  name: string;
  color: string;
  textColor?: string;
  click: number;
  note?: string | null;
}) {
  const vx = useVelocity(x);
  const tilt = useSpring(useTransform(vx, [-60, 0, 60], [-16, 0, 16]), { stiffness: 260, damping: 18 });
  const lx = useSpring(x, { stiffness: 170, damping: 15 });
  const ly = useSpring(y, { stiffness: 170, damping: 15 });
  const left = useMotionTemplate`${x}%`;
  const top = useMotionTemplate`${y}%`;
  const tagLeft = useMotionTemplate`${lx}%`;
  const tagTop = useMotionTemplate`${ly}%`;
  const swing = useSpring(useTransform(vx, [-60, 0, 60], [10, 0, -10]), { stiffness: 120, damping: 8 });
  return (
    <>
      <motion.div className="pointer-events-none absolute z-30" style={{ left, top }}>
        <motion.div key={click} initial={click ? { scale: 0.78 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 14 }} style={{ rotate: tilt, originX: 0.15, originY: 0.1 }}>
          <Arrow color={color} />
        </motion.div>
        <AnimatePresence>
          {click > 0 && (
            <motion.span
              key={click}
              className="absolute -left-3 -top-3 h-7 w-7 rounded-full border-2"
              style={{ borderColor: color }}
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div className="pointer-events-none absolute z-30" style={{ left: tagLeft, top: tagTop }}>
        <motion.div className="ml-4 mt-5 flex flex-col items-start gap-1" style={{ rotate: swing, originX: 0, originY: 0 }}>
          <span className="whitespace-nowrap rounded-full px-2 py-[3px] text-[11px] font-semibold leading-none shadow-[0_4px_10px_-4px_rgba(0,0,0,.35)]" style={{ background: color, color: textColor }}>
            {name}
          </span>
          <AnimatePresence>
            {note && (
              <motion.span
                key={note}
                className="max-w-[150px] rounded-[12px] rounded-tl-[4px] bg-white px-2.5 py-1.5 text-[12px] leading-snug text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_20px_-10px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_20px_-10px_rgba(0,0,0,.9)]"
                style={{ originX: 0, originY: 0 }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {note}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}

/** Loops the motion values through the points with a spring per hop, calling `onStop` at each point. */
function useTour(points: Array<{ x: number; y: number }>, hop: number, delay: number, run: boolean, onStop?: (i: number) => void) {
  const first = points[0] ?? { x: 50, y: 50 };
  const x = useMotionValue(first.x);
  const y = useMotionValue(first.y);
  const stopRef = useRef(onStop);
  useEffect(() => {
    stopRef.current = onStop;
  });
  const key = points.map((p) => `${p.x},${p.y}`).join(";");
  useEffect(() => {
    const pts = key ? key.split(";").map((s) => s.split(",").map(Number)) : [];
    if (!run || pts.length < 2) return;
    let alive = true;
    let timer = 0;
    let ctl: Array<{ stop: () => void }> = [];
    let i = 1;
    const next = () => {
      if (!alive) return;
      const [px, py] = pts[i % pts.length];
      const t = { type: "spring" as const, visualDuration: hop, bounce: 0.18 };
      const a = animate(x, px, t);
      const b = animate(y, py, t);
      ctl = [a, b];
      Promise.all([a, b]).then(() => {
        if (!alive) return;
        stopRef.current?.(i);
        i++;
        timer = window.setTimeout(next, 420);
      });
    };
    timer = window.setTimeout(next, delay * 1000 + 300);
    return () => {
      alive = false;
      window.clearTimeout(timer);
      ctl.forEach((c) => c.stop());
    };
  }, [key, hop, delay, run, x, y]);
  return { x, y };
}

function Teammate({ cursor, still }: { cursor: LiveCursor; still: boolean }) {
  const [click, setClick] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const noteTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(noteTimer.current), []);
  const { x, y } = useTour(cursor.path, cursor.duration ?? 1.1, cursor.delay ?? 0, !still, (i) => {
    setClick((c) => c + 1);
    if (cursor.note && i % 3 === 2) {
      setNote(cursor.note);
      window.clearTimeout(noteTimer.current);
      noteTimer.current = window.setTimeout(() => setNote(null), 1900);
    }
  });
  return <Pointer x={x} y={y} name={cursor.name} color={cursor.color} textColor={cursor.textColor} click={click} note={note} />;
}

/** The visitor's own label: a demo tour until their pointer arrives, then it follows them. */
function You({ color, demo, live, px, py }: { color: string; demo: boolean; live: boolean; px: MotionValue<number>; py: MotionValue<number> }) {
  const [click, setClick] = useState(0);
  const tour = useTour(YOU_DEMO, 1.25, 1.8, demo, () => setClick((c) => c + 1));
  if (live) return <Pointer x={px} y={py} name="You" color={color} click={0} />;
  if (!demo) return null;
  return <Pointer x={tour.x} y={tour.y} name="You" color={color} click={click} />;
}

/**
 * A shared design board with teammates' cursors moving over it in real
 * time: arrows glide between spots, name tags trail behind and swing, stops
 * land as clicks and now and then someone drops a comment. Your own pointer
 * gets a "You" tag too.
 */
export function RealTimeCursors({
  cursors = DEFAULT_CURSORS,
  title = "Launch board",
  showYou = true,
  youColor = "#30d158",
  autoplay = false,
  className = "",
}: RealTimeCursorsProps) {
  const still = useReducedMotion() === true;
  const board = useRef<HTMLDivElement>(null);
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const [live, setLive] = useState(false);
  const [touched, setTouched] = useState(false);

  const move = (e: RPointerEvent) => {
    const r = board.current?.getBoundingClientRect();
    if (!r || e.pointerType === "touch") return;
    px.set(r3(((e.clientX - r.left) / r.width) * 100));
    py.set(r3(((e.clientY - r.top) / r.height) * 100));
    if (!live) setLive(true);
    if (!touched) setTouched(true);
  };

  const people = cursors.length + (showYou ? 1 : 0);

  return (
    <div
      className={cn(`w-full max-w-[620px] overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]`, className)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.08]">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">{title}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <span className="relative flex h-1.5 w-1.5">
              {!still && <motion.span className="absolute inset-0 rounded-full bg-[#30d158]" animate={{ scale: [1, 2.4], opacity: [0.7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />}
              <span className="relative h-1.5 w-1.5 rounded-full bg-[#30d158]" />
            </span>
            <span className="tabular-nums">{people}</span> here now
          </p>
        </div>
        <div className="flex -space-x-2" role="list" aria-label="People on this board">
          {cursors.map((c, i) => (
            <motion.span
              key={c.name}
              role="listitem"
              aria-label={c.name}
              title={c.name}
              initial={still ? false : { scale: 0, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.15 + i * 0.08 }}
              className="grid h-8 w-8 place-items-center rounded-full text-[12px] font-semibold ring-2 ring-white dark:ring-[#1c1c1e]"
              style={{ background: c.color, color: c.textColor ?? "#fff" }}
            >
              {c.name.slice(0, 1)}
            </motion.span>
          ))}
        </div>
      </div>

      <div
        ref={board}
        onPointerMove={move}
        onPointerLeave={() => setLive(false)}
        className="relative h-[260px] overflow-hidden bg-[#f5f5f7] [background-image:radial-gradient(#d2d2d7_1px,transparent_1px)] [background-size:18px_18px] dark:bg-[#141416] dark:[background-image:radial-gradient(#3a3a3c_1px,transparent_1px)]"
        aria-label="Shared board. Teammates' cursors move across it."
        role="img"
      >
        {/* The board itself: a hero frame and some sticky notes. */}
        <div className="absolute left-[7%] top-[12%] w-[46%] rounded-[16px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_28px_-20px_rgba(0,0,0,.4)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.06),0_14px_28px_-20px_rgba(0,0,0,.9)]">
          <span className="mb-2 block text-[10px] font-medium text-[#86868b] dark:text-[#98989d]">Hero / Desktop</span>
          <div className="h-[72px] rounded-[10px] bg-[linear-gradient(135deg,#5ac8fa,#0071e3_55%,#bf5af2)]" />
          <div className="mt-2.5 h-2.5 w-[70%] rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" />
          <div className="mt-1.5 h-2 w-[52%] rounded-full bg-[#d2d2d7] dark:bg-[#48484a]" />
          <div className="mt-3 h-6 w-[38%] rounded-full bg-[#0071e3] dark:bg-[#0a84ff]" />
        </div>
        <div className="absolute left-[60%] top-[14%] w-[30%] rotate-[3deg] rounded-[6px] bg-[#fff1a8] p-3 text-[12px] font-medium leading-snug text-[#5c4a00] shadow-[0_10px_18px_-12px_rgba(0,0,0,.4)]">
          Ship on Friday?
          <span className="mt-1 block text-[10px] font-normal opacity-70">Ava</span>
        </div>
        <div className="absolute left-[58%] top-[56%] w-[26%] -rotate-[4deg] rounded-[6px] bg-[#c8f5d2] p-3 text-[12px] font-medium leading-snug text-[#0d4a1f] shadow-[0_10px_18px_-12px_rgba(0,0,0,.4)]">
          Pricing looks right
          <span className="mt-1 block text-[10px] font-normal opacity-70">Noah</span>
        </div>
        <div className="absolute bottom-[10%] left-[12%] flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">
          <span className="h-2 w-2 rounded-full bg-[#ff9f0a]" />3 comments
        </div>

        {cursors.map((c) => (
          <Teammate key={c.name} cursor={c} still={still} />
        ))}
        {showYou && <You color={youColor} demo={autoplay && !touched && !still} live={live} px={px} py={py} />}
      </div>
      <p className="px-4 py-2.5 text-center text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Move your pointer over the board to join in.</p>
    </div>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
