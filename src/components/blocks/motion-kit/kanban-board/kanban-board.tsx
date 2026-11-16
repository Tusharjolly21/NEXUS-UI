"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useMotionTemplate,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type KanbanCard = {
  id: string;
  title: string;
  tag: string;
  priority: "low" | "medium" | "high" | "urgent";
  people: string[];
  due?: string;
};
export type KanbanColumn = {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
};
export type KanbanBoardProps = {
  title?: string;
  columns?: KanbanColumn[];
  onMove?: (cardId: string, toColumn: string, index: number) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  plus: "M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  clock:
    "M128 20a108 108 0 1 0 108 108A108.12 108.12 0 0 0 128 20m0 192a84 84 0 1 1 84-84a84.09 84.09 0 0 1-84 84m68-84a12 12 0 0 1-12 12h-56a12 12 0 0 1-12-12V72a12 12 0 0 1 24 0v44h44a12 12 0 0 1 12 12",
  dots: "M108 60a16 16 0 1 1-16-16a16 16 0 0 1 16 16m56 16a16 16 0 1 0-16-16a16 16 0 0 0 16 16m-72 36a16 16 0 1 0 16 16a16 16 0 0 0-16-16m72 0a16 16 0 1 0 16 16a16 16 0 0 0-16-16m-72 68a16 16 0 1 0 16 16a16 16 0 0 0-16-16m72 0a16 16 0 1 0 16 16a16 16 0 0 0-16-16",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")";
const PRIORITY: Record<KanbanCard["priority"], { label: string; fg: string; bg: string }> = {
  low: { label: "Low", fg: "#1f6fd1", bg: "rgba(0,113,227,.09)" },
  medium: { label: "Medium", fg: "#a35200", bg: "rgba(255,159,10,.14)" },
  high: { label: "High", fg: "#c4161c", bg: "rgba(255,59,48,.1)" },
  urgent: { label: "Urgent", fg: "#fff", bg: "#ff3b30" },
};
const PEOPLE: Record<string, [string, string]> = {
  MC: ["#ff9a8b", "#ff6a88"],
  LP: ["#43cea2", "#185a9d"],
  AS: ["#f7971e", "#ffd200"],
  PN: ["#c471f5", "#fa71cd"],
  SR: ["#4facfe", "#00c6fb"],
  JW: ["#7f7fd5", "#91eae4"],
};
const DEMO: KanbanColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "#8e8e93",
    cards: [
      {
        id: "LB-21",
        title: "Saved views for the projects page",
        tag: "Web app",
        priority: "low",
        people: ["MC"],
        due: "Nov 28",
      },
      {
        id: "LB-24",
        title: "Audit trail for agent actions",
        tag: "Platform",
        priority: "medium",
        people: ["LP", "AS"],
      },
      {
        id: "LB-27",
        title: "Keyboard map for the board",
        tag: "Design",
        priority: "low",
        people: ["PN"],
      },
    ],
  },
  {
    id: "todo",
    title: "To do",
    color: "#0071e3",
    cards: [
      {
        id: "LB-18",
        title: "Semantic tokens for raised surfaces",
        tag: "Design system",
        priority: "high",
        people: ["PN", "SR"],
        due: "Nov 19",
      },
      {
        id: "LB-19",
        title: "Model picker in the composer",
        tag: "AI",
        priority: "medium",
        people: ["JW"],
      },
    ],
  },
  {
    id: "doing",
    title: "In progress",
    color: "#ff9f0a",
    cards: [
      {
        id: "LB-14",
        title: "Animate the grouped task lists",
        tag: "Web app",
        priority: "urgent",
        people: ["MC", "LP"],
        due: "Today",
      },
      {
        id: "LB-15",
        title: "Chart contrast on dark cards",
        tag: "Design",
        priority: "medium",
        people: ["AS"],
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    color: "#bf5af2",
    cards: [
      {
        id: "LB-11",
        title: "Polish the plan transition",
        tag: "Web app",
        priority: "low",
        people: ["SR"],
        due: "Nov 15",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "#30d158",
    cards: [
      {
        id: "LB-07",
        title: "Ship the empty states",
        tag: "Design",
        priority: "low",
        people: ["PN", "JW"],
      },
    ],
  },
];

type Drag = {
  id: string;
  w: number;
  h: number;
  ox: number;
  oy: number;
  kb?: boolean;
};

/**
 * A kanban board you move work across.
 *
 * Pick a card up and it lifts off the board: it grows a little, casts a deeper shadow and tilts with the speed you
 * move it, like a card held between two fingers. The cards it passes slide apart to make room, and a soft slot shows
 * where it will land. Let go and it flies into the slot and settles with a small squash; the counts in the column
 * headers roll. A card dropped in Done gets its tick. With a keyboard: focus a card, Space to pick it up, arrows to
 * move it between columns and places, Space to put it down, Escape to put it back. Add a card from a column's plus.
 *   <KanbanBoard columns={columns} onMove={(id, column, index) => save(id, column, index)} />
 */
export default function KanbanBoard({
  title = "Launch board",
  columns = DEMO,
  onMove,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: KanbanBoardProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const [cols, setCols] = useState(columns);
  const colsRef = useRef(cols);
  colsRef.current = cols;
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;
  const [landing, setLanding] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [say, setSay] = useState("");
  const [w, setW] = useState(1000);
  const startCol = useRef<{ col: string; idx: number } | null>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = w < 720;
  const tiny = w < 520;
  const stripRef = useRef<HTMLDivElement>(null);
  const narrowRef = useRef(narrow);
  narrowRef.current = narrow;
  const lastPt = useRef({ x: 0, y: 0 });

  // the lifted card: where it is, and a tilt from how fast it's moving
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const vx = useVelocity(gx);
  const vy = useVelocity(gy);
  // held between two fingers, a card swings in three dimensions: it leans into the way you move and trails behind
  const spr = { stiffness: 230, damping: 20, mass: 0.7 };
  const tilt = useSpring(useTransform(vx, [-1800, 0, 1800], [-7, 0, 7], { clamp: true }), spr);
  const rotY = useSpring(useTransform(vx, [-1800, 0, 1800], [-20, 0, 20], { clamp: true }), spr);
  const rotX = useSpring(useTransform(vy, [-1800, 0, 1800], [16, 0, -16], { clamp: true }), spr);
  const lift = useMotionValue(0);
  const scale = useTransform(lift, [0, 1], [1, 1.05]);
  // the shadow it casts on the board: the higher it is, the further it falls from the card and the softer it gets
  const shX = useTransform([lift, rotY] as never, ([l, r]: number[]) => 3 + 16 * l + r * 0.5);
  const shY = useTransform(lift, (l) => 4 + 30 * l);
  const shBlur = useTransform(lift, (l) => `blur(${5 + 16 * l}px)`);
  const shOp = useTransform(lift, [0, 1], [0.2, 0.42]);
  const shScale = useTransform(lift, [0, 1], [0.97, 0.93]);
  // light sliding across the card's face as it turns
  const sheenX = useTransform(rotY, [-20, 20], [-10, 110]);
  const sheenA = useTransform([rotY, rotX] as never, ([a, b]: number[]) =>
    Math.min(0.5, 0.12 + (Math.abs(a) + Math.abs(b)) / 50),
  );
  const sheen = useMotionTemplate`linear-gradient(105deg, rgba(255,255,255,0) ${useTransform(sheenX, (v) => v - 28)}%, rgba(255,255,255,${sheenA}) ${sheenX}%, rgba(255,255,255,0) ${useTransform(sheenX, (v) => v + 28)}%)`;

  const where = (id: string) => {
    const c = colsRef.current;
    for (const col of c) {
      const i = col.cards.findIndex((k) => k.id === id);
      if (i >= 0) return { col: col.id, idx: i };
    }
    return null;
  };
  const moveCard = (id: string, toCol: string, toIdx: number) => {
    const at = where(id);
    if (!at) return;
    if (at.col === toCol && at.idx === toIdx) return;
    setCols((c) => {
      let card: KanbanCard | undefined;
      const without = c.map((col) => {
        const i = col.cards.findIndex((k) => k.id === id);
        if (i < 0) return col;
        card = col.cards[i];
        return { ...col, cards: col.cards.filter((k) => k.id !== id) };
      });
      if (!card) return c;
      return without.map((col) =>
        col.id === toCol
          ? {
              ...col,
              cards: [...col.cards.slice(0, toIdx), card!, ...col.cards.slice(toIdx)],
            }
          : col,
      );
    });
    sfx.tick({ freq: 2200 + toIdx * 200, gain: 0.035 });
  };

  // ------------------------------------------------------------ pointer dragging
  const press = useRef<{
    id: string;
    x: number;
    y: number;
    el: HTMLElement;
    pid: number;
  } | null>(null);
  const boardRect = () => rootRef.current?.getBoundingClientRect() ?? new DOMRect();
  const begin = (id: string, el: HTMLElement, x: number, y: number) => {
    const r = el.getBoundingClientRect();
    const b = boardRect();
    startCol.current = where(id);
    const d = { id, w: r.width, h: r.height, ox: x - r.left, oy: y - r.top };
    setDrag(d);
    dragRef.current = d;
    gx.set(r.left - b.left);
    gy.set(r.top - b.top);
    animate(lift, 1, reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 26 });
    sfx.whoosh(500, 1400, { dur: 0.2, gain: 0.03 });
    sfx.tick({ freq: 1600, gain: 0.05 });
  };
  // where the pointer is decides the column, and among that column's cards, the place
  const follow = (x: number, y: number) => {
    const d = dragRef.current;
    if (!d) return;
    lastPt.current = { x, y };
    const b = boardRect();
    gx.set(x - d.ox - b.left);
    gy.set(y - d.oy - b.top);
    slotAt(x, y);
  };
  const slotAt = (x: number, y: number) => {
    const d = dragRef.current;
    if (!d) return;
    const root = rootRef.current;
    if (!root) return;
    const lists = [...root.querySelectorAll<HTMLElement>("[data-col]")];
    let best: HTMLElement | null = null;
    let bestD = Infinity;
    for (const l of lists) {
      const r = l.getBoundingClientRect();
      const dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
      if (dx < bestD) {
        bestD = dx;
        best = l;
      }
    }
    if (!best) return;
    const colId = best.dataset.col!;
    const cards = [...best.querySelectorAll<HTMLElement>("[data-card]")].filter((c) => c.dataset.card !== d.id);
    let idx = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        idx = i;
        break;
      }
    }
    moveCard(d.id, colId, idx);
  };
  const drop = (cancel = false) => {
    const d = dragRef.current;
    if (!d) return;
    if (cancel && startCol.current) moveCard(d.id, startCol.current.col, startCol.current.idx);
    // fly into the slot, then let the real card take over
    requestAnimationFrame(() => {
      const slot = rootRef.current?.querySelector<HTMLElement>(`[data-card="${d.id}"]`);
      const b = boardRect();
      const finish = () => {
        // a card carried by keyboard keeps the focus once it's down
        if (d.kb)
          setTimeout(
            () =>
              rootRef.current?.querySelector<HTMLElement>(`[data-handle="${d.id}"]`)?.focus({ preventScroll: true }),
            30,
          );
        setDrag(null);
        dragRef.current = null;
        setLanding(d.id);
        setTimeout(() => setLanding((l) => (l === d.id ? null : l)), 420);
        const at = where(d.id);
        if (at) {
          onMove?.(d.id, at.col, at.idx);
          const col = colsRef.current.find((c) => c.id === at.col);
          setSay(`${d.id} moved to ${col?.title}, position ${at.idx + 1}.`);
          if (at.col === "done" && startCol.current?.col !== "done") {
            sfx.note(784, { dur: 0.25, gain: 0.05, bell: 0.5 });
            sfx.note(1175, { dur: 0.35, gain: 0.05, at: 0.08, bell: 0.5 });
          } else sfx.note(392, { dur: 0.18, gain: 0.05, bell: 0.2 });
        }
      };
      if (!slot || reduce) {
        lift.set(0);
        finish();
        return;
      }
      const r = slot.getBoundingClientRect();
      animate(lift, 0, { type: "spring", stiffness: 380, damping: 30 });
      animate(gx, r.left - b.left, {
        type: "spring",
        stiffness: 520,
        damping: 40,
      });
      animate(gy, r.top - b.top, {
        type: "spring",
        stiffness: 520,
        damping: 40,
      }).then(finish);
    });
  };
  const onCardDown = (e: RPointerEvent<HTMLElement>, id: string) => {
    if (e.button !== 0 || dragRef.current) return;
    touched.current = true;
    press.current = {
      id,
      x: e.clientX,
      y: e.clientY,
      el: e.currentTarget,
      pid: e.pointerId,
    };
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const p = press.current;
      if (p && !dragRef.current && p.pid === e.pointerId && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 5)
        begin(p.id, p.el, p.x, p.y);
      if (dragRef.current && !dragRef.current.kb) follow(e.clientX, e.clientY);
    };
    const up = () => {
      press.current = null;
      if (dragRef.current && !dragRef.current.kb) drop();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // near the strip's edges, a carried card scrolls the columns along
  useEffect(() => {
    if (!drag || drag.kb) return;
    let raf = 0;
    const tick = () => {
      const st = stripRef.current;
      if (st) {
        const r = st.getBoundingClientRect();
        const { x, y } = lastPt.current;
        const edge = 56;
        const v = x < r.left + edge ? -(1 - (x - r.left) / edge) : x > r.right - edge ? 1 - (r.right - x) / edge : 0;
        if (v !== 0 && st.scrollWidth > st.clientWidth) {
          st.scrollLeft += Math.max(-1, Math.min(1, v)) * 14;
          slotAt(x, y);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag]);

  // ------------------------------------------------------------ keyboard
  const onCardKey = (e: RKeyboardEvent<HTMLElement>, id: string) => {
    const d = dragRef.current;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      touched.current = true;
      if (!d) {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        begin(id, el, r.left + r.width / 2, r.top + r.height / 2);
        setDrag((x) => (x ? { ...x, kb: true } : x));
        setSay(`Picked up ${id}. Use the arrow keys to move it, Space to drop, Escape to cancel.`);
      } else drop();
      return;
    }
    if (!d || !d.kb) return;
    const at = where(id);
    if (!at) return;
    const ci = colsRef.current.findIndex((c) => c.id === at.col);
    if (e.key === "Escape") {
      e.preventDefault();
      drop(true);
      return;
    }
    let toC = ci;
    let toI = at.idx;
    if (e.key === "ArrowLeft") toC = Math.max(0, ci - 1);
    else if (e.key === "ArrowRight") toC = Math.min(colsRef.current.length - 1, ci + 1);
    else if (e.key === "ArrowUp") toI = Math.max(0, at.idx - 1);
    else if (e.key === "ArrowDown") toI = Math.min(colsRef.current[ci].cards.length - 1, at.idx + 1);
    else return;
    e.preventDefault();
    if (toC !== ci) toI = Math.min(at.idx, colsRef.current[toC].cards.length);
    moveCard(id, colsRef.current[toC].id, toI);
    // the lifted card follows its slot
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const slot = rootRef.current?.querySelector<HTMLElement>(`[data-card="${id}"]`);
        const b = boardRect();
        if (!slot) return;
        const r = slot.getBoundingClientRect();
        animate(gx, r.left - b.left, {
          type: "spring",
          stiffness: 420,
          damping: 34,
        });
        animate(gy, r.top - b.top - 6, {
          type: "spring",
          stiffness: 420,
          damping: 34,
        });
        rootRef.current?.querySelector<HTMLElement>(`[data-handle="${id}"]`)?.focus({ preventScroll: true });
      }),
    );
    setSay(`${colsRef.current[toC].title}, position ${toI + 1}.`);
  };

  const add = (colId: string) => {
    const t = draft.trim();
    if (!t) {
      setAdding(null);
      return;
    }
    const n = 30 + cols.reduce((a, c) => a + c.cards.length, 0);
    setCols((c) =>
      c.map((col) =>
        col.id === colId
          ? {
              ...col,
              cards: [
                {
                  id: `LB-${n}`,
                  title: t,
                  tag: "New",
                  priority: "low",
                  people: ["MC"],
                },
                ...col.cards,
              ],
            }
          : col,
      ),
    );
    setDraft("");
    setAdding(null);
    sfx.note(880, { dur: 0.2, gain: 0.05, bell: 0.4 });
  };

  // ------------------------------------------------------------ autoplay: two pretend drags
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current && !press.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const pretend = async (id: string, toCol: string, slot: number) => {
      const root = rootRef.current;
      const el = root?.querySelector<HTMLElement>(`[data-handle="${id}"]`);
      const list = root?.querySelector<HTMLElement>(`[data-col="${toCol}"]`);
      if (!el || !list) return;
      const r = el.getBoundingClientRect();
      const sx = r.left + r.width * 0.5;
      const sy = r.top + r.height * 0.4;
      begin(id, el, sx, sy);
      await sleep(160);
      const lr = list.getBoundingClientRect();
      const cards = [...list.querySelectorAll<HTMLElement>("[data-card]")];
      const target = cards[slot]?.getBoundingClientRect();
      const tx = lr.left + lr.width * 0.5;
      const ty = target ? target.top + 6 : lr.top + 60;
      const t0 = { v: 0 };
      await animate(
        t0,
        { v: 1 },
        {
          duration: 1.3,
          ease: [0.45, 0, 0.2, 1],
          onUpdate: () => {
            if (!ok()) return;
            const k = t0.v;
            // a slight arc, as a hand would carry it
            follow(sx + (tx - sx) * k, sy + (ty - sy) * k - Math.sin(k * Math.PI) * 40);
          },
        },
      );
      await sleep(180);
      drop();
    };
    (async () => {
      while (ok()) {
        await sleep(1200);
        if (!ok()) break;
        if (narrowRef.current) {
          // on a narrow card only one column shows: reorder within it
          await pretend("LB-27", "backlog", 0);
          await sleep(1500);
          if (!ok()) break;
          await pretend("LB-21", "backlog", 2);
        } else {
          await pretend("LB-21", "doing", 1);
          await sleep(1500);
          if (!ok()) break;
          await pretend("LB-11", "done", 0);
          await sleep(1700);
          if (!ok()) break;
          await pretend("LB-18", "review", 0);
        }
        await sleep(2200);
        if (!ok()) break;
        setCols(columns);
        await sleep(900);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const dragCard = useMemo(
    () => (drag ? (cols.flatMap((c) => c.cards).find((k) => k.id === drag.id) ?? null) : null),
    [drag, cols],
  );
  const dragInDone = drag ? where(drag.id)?.col === "done" : false;

  return (
    <div
      ref={rootRef}
      className={`relative w-full max-w-[1100px] select-none overflow-hidden rounded-[28px] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
        background: "radial-gradient(120% 80% at 10% -10%, #ffffff 0%, #f4f5f8 45%, #eceef3 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />
      <header className={`flex items-center justify-between gap-3 ${narrow ? "px-4 pt-4" : "px-6 pt-5"}`}>
        <div className="min-w-0">
          <h3 className="truncate text-[19px] font-semibold tracking-[-0.022em]">{title}</h3>
          <p className="text-[12.5px] text-[#6e6e73]">
            <Count n={cols.reduce((a, c) => a + c.cards.length, 0)} reduce={reduce} /> cards,{" "}
            <Count n={cols.find((c) => c.id === "done")?.cards.length ?? 0} reduce={reduce} /> done
          </p>
        </div>
        <div className="flex -space-x-1.5" aria-hidden="true">
          {Object.entries(PEOPLE)
            .slice(0, narrow ? 3 : 6)
            .map(([k, [a, b]]) => (
              <span
                key={k}
                className="grid h-7 w-7 place-items-center rounded-full text-[10.5px] font-semibold text-white ring-2 ring-white"
                style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
              >
                {k}
              </span>
            ))}
        </div>
      </header>

      <div
        ref={stripRef}
        className={`mt-4 flex gap-3 overflow-x-auto pb-5 [scrollbar-width:thin] ${narrow ? "px-4" : "px-6"} ${tiny && !drag ? "snap-x snap-mandatory" : ""}`}
        role="list"
        aria-label="Columns"
      >
        {cols.map((col) => (
          <section
            key={col.id}
            role="listitem"
            aria-label={`${col.title}, ${col.cards.length} cards`}
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,.62), rgba(255,255,255,.38))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(255,255,255,.5), 0 0 0 .5px rgba(0,0,0,.06), 0 10px 24px -18px rgba(16,24,40,.25)",
            }}
            className={`relative flex shrink-0 snap-start flex-col rounded-[20px] p-2 backdrop-blur-xl ${tiny ? "w-[82%]" : narrow ? "w-[210px]" : "w-[230px] flex-1"}`}
          >
            <div className="flex items-center gap-2 px-2 pb-2 pt-1.5">
              <span
                className="relative h-2 w-2 rounded-full"
                style={{
                  background: col.color,
                  boxShadow: `0 0 0 3px ${col.color}22, 0 0 8px ${col.color}88`,
                }}
              />
              <span className="text-[13px] font-semibold">{col.title}</span>
              <span className="text-[12.5px] tabular-nums text-[#86868b]">
                <Count n={col.cards.length} reduce={reduce} />
              </span>
              <button
                type="button"
                aria-label={`Add a card to ${col.title}`}
                onClick={() => {
                  touched.current = true;
                  setAdding(col.id);
                  setDraft("");
                }}
                className="ml-auto grid h-6 w-6 place-items-center rounded-full text-[#6e6e73] outline-none transition hover:bg-black/[0.06] hover:text-[#1d1d1f] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              >
                <Ico d={I.plus} size={12} />
              </button>
            </div>
            <div
              data-col={col.id}
              className="flex min-h-[64px] flex-1 flex-col gap-2"
              role="list"
              aria-label={col.title}
            >
              <AnimatePresence initial={false}>
                {adding === col.id && (
                  <motion.form
                    key="add"
                    onSubmit={(e) => {
                      e.preventDefault();
                      add(col.id);
                    }}
                    className="rounded-[14px] bg-white p-2.5 shadow-[0_0_0_1.5px_#0071e3,0_4px_14px_-6px_rgba(0,113,227,.4)]"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => add(col.id)}
                      onKeyDown={(e) => e.key === "Escape" && setAdding(null)}
                      placeholder="What needs doing?"
                      aria-label={`New card in ${col.title}`}
                      className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-[#86868b]"
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              {col.cards.map((card) => {
                const lifted = drag?.id === card.id;
                return (
                  <motion.div
                    key={card.id}
                    data-card={card.id}
                    layout={reduce ? false : "position"}
                    transition={{ type: "spring", stiffness: 520, damping: 40 }}
                    role="listitem"
                    className="relative"
                  >
                    {lifted ? (
                      // the slot where it will land
                      <motion.div
                        className="relative overflow-hidden rounded-[14px]"
                        style={{
                          height: drag!.h,
                          background: `linear-gradient(180deg, rgba(0,0,0,.055), rgba(0,0,0,.02))`,
                          boxShadow: `inset 0 2px 5px rgba(16,24,40,.12), inset 0 0 0 1px rgba(0,0,0,.035), 0 1px 0 rgba(255,255,255,.9)`,
                        }}
                        initial={reduce ? false : { scaleY: 0.6, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 32,
                        }}
                      >
                        <motion.span
                          className="absolute inset-0 rounded-[14px]"
                          style={{
                            boxShadow: `inset 0 0 0 1.5px ${col.color}`,
                            background: `radial-gradient(80% 90% at 50% 50%, ${col.color}1f, transparent 70%)`,
                          }}
                          animate={reduce ? { opacity: 0.6 } : { opacity: [0.35, 0.85, 0.35] }}
                          transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={
                          landing === card.id && !reduce
                            ? {
                                scaleY: [1, 0.94, 1.02, 1],
                                scaleX: [1, 1.03, 0.99, 1],
                              }
                            : undefined
                        }
                        transition={{ duration: 0.42, ease: "easeOut" }}
                      >
                        <CardFace
                          card={card}
                          done={col.id === "done"}
                          handle
                          onDown={(e) => onCardDown(e, card.id)}
                          onKey={(e) => onCardKey(e, card.id)}
                        />
                        {landing === card.id && !reduce && <Landing color={col.color} burst={col.id === "done"} />}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* the card in your hand, and the shadow it throws on the board */}
      {drag && dragCard && (
        <motion.div className="pointer-events-none absolute left-0 top-0 z-30" style={{ x: gx, y: gy, width: drag.w }}>
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-[16px] bg-[#101828]"
            style={{
              x: shX,
              y: shY,
              filter: shBlur,
              opacity: shOp,
              scale: shScale,
            }}
          />
          <motion.div
            className="relative rounded-[14px]"
            style={{
              rotate: tilt,
              rotateX: rotX,
              rotateY: rotY,
              scale,
              transformPerspective: 700,
              transformOrigin: `${drag.ox}px ${drag.oy}px`,
            }}
          >
            <CardFace
              card={dragCard}
              done={dragInDone}
              lifted
              handleFocus={drag.kb ? dragCard.id : undefined}
              onKey={(e) => onCardKey(e, dragCard.id)}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[14px]"
              style={{ background: sheen }}
            />
          </motion.div>
        </motion.div>
      )}
      <span className="sr-only" aria-live="assertive">
        {say}
      </span>
      <span className="sr-only" id={`${uid}-help`}>
        Press Space to pick up a card, the arrow keys to move it, Space to drop it.
      </span>
    </div>
  );
}

function CardFace({
  card,
  done,
  handle,
  handleFocus,
  lifted,
  onDown,
  onKey,
}: {
  card: KanbanCard;
  done: boolean;
  lifted?: boolean;
  handle?: boolean;
  handleFocus?: string;
  onDown?: (e: RPointerEvent<HTMLElement>) => void;
  onKey?: (e: RKeyboardEvent<HTMLElement>) => void;
}) {
  const p = PRIORITY[card.priority];
  const ref = useRef<HTMLDivElement>(null);
  // while a card is carried with the keyboard, its copy in your hand keeps the focus
  useEffect(() => {
    if (handleFocus) ref.current?.focus({ preventScroll: true });
  }, [handleFocus]);
  // resting on the board, a card leans a little toward the pointer, and a glare follows it
  const reduce = !!useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hov = useMotionValue(0);
  const hs = { stiffness: 300, damping: 24 };
  const rx = useSpring(
    useTransform([py, hov] as never, ([y, h]: number[]) => (0.5 - y) * 7 * h),
    hs,
  );
  const ry = useSpring(
    useTransform([px, hov] as never, ([x, h]: number[]) => (x - 0.5) * 9 * h),
    hs,
  );
  const glare = useMotionTemplate`radial-gradient(180px circle at ${useTransform(px, (v) => v * 100)}% ${useTransform(py, (v) => v * 100)}%, rgba(255,255,255,${useSpring(useTransform(hov, [0, 1], [0, 1]), hs)}), rgba(255,255,255,0) 70%)`;
  const tracking = handle && !reduce;
  return (
    <motion.div
      style={tracking ? { rotateX: rx, rotateY: ry, transformPerspective: 600 } : undefined}
      onPointerMove={(e) => {
        if (!tracking || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
        hov.set(1);
      }}
      onPointerLeave={() => hov.set(0)}
      className="rounded-[14px]"
    >
      <div
        ref={ref}
        data-handle={handle || handleFocus ? card.id : undefined}
        tabIndex={handle || handleFocus ? 0 : -1}
        role="button"
        aria-roledescription="draggable card"
        aria-label={`${card.id}: ${card.title}. ${p.label} priority.${done ? " Done." : ""}`}
        onPointerDown={onDown}
        onKeyDown={onKey}
        className={`group relative cursor-grab touch-none overflow-hidden rounded-[14px] p-3 [&>div]:relative [&>p]:relative outline-none ring-[#0071e3]/60 transition-shadow duration-300 focus-visible:ring-2 active:cursor-grabbing ${lifted ? "" : "hover:shadow-[0_0_0_.5px_rgba(0,0,0,.1),inset_0_1px_0_#fff,0_2px_4px_-1px_rgba(16,24,40,.08),0_12px_24px_-12px_rgba(16,24,40,.3)]"}`}
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #fdfdfe 60%, #f9f9fb 100%)",
          boxShadow: lifted
            ? "0 0 0 .5px rgba(0,0,0,.1), inset 0 1px 0 #fff"
            : "0 0 0 .5px rgba(0,0,0,.09), inset 0 1px 0 #fff, 0 1px 1px rgba(16,24,40,.04), 0 3px 6px -3px rgba(16,24,40,.08)",
        }}
      >
        {/* a fine paper tooth, and a rail in the priority's colour */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
          style={{ backgroundImage: GRAIN }}
        />
        {(card.priority === "urgent" || card.priority === "high") && (
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full"
            style={{
              background:
                card.priority === "urgent"
                  ? "linear-gradient(180deg,#ff6b5e,#ff3b30)"
                  : "linear-gradient(180deg,#ff9f0a,#ff6b2c)",
            }}
          />
        )}
        {tracking && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: glare }}
          />
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[11.5px] font-medium tabular-nums text-[#86868b]">{card.id}</span>
          <span className="text-[11.5px] text-[#86868b]">{card.tag}</span>
          <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-60" aria-hidden="true">
            <Ico d={I.dots} size={13} />
          </span>
        </div>
        <p
          className={`mt-1.5 text-[13.5px] font-medium leading-[1.35] ${done ? "text-[#86868b] line-through decoration-[#86868b]/50" : "text-[#1d1d1f]"}`}
        >
          {card.title}
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {done ? (
              <motion.span
                key="done"
                className="flex items-center gap-1 rounded-full bg-[#30d158]/15 px-2 py-[2px] text-[11px] font-semibold text-[#1f7a35]"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
              >
                <Ico d={I.check} size={10} /> Done
              </motion.span>
            ) : (
              <motion.span
                key="p"
                className="rounded-full px-2 py-[2px] text-[11px] font-semibold"
                style={{ color: p.fg, background: p.bg }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {p.label}
              </motion.span>
            )}
          </AnimatePresence>
          {card.due && !done && (
            <span
              className={`flex items-center gap-1 text-[11.5px] ${card.due === "Today" ? "font-medium text-[#c4161c]" : "text-[#86868b]"}`}
            >
              <Ico d={I.clock} size={11} />
              {card.due}
            </span>
          )}
          <span className="ml-auto flex -space-x-1">
            {card.people.map((k) => {
              const [a, b] = PEOPLE[k] ?? ["#ccc", "#999"];
              return (
                <span
                  key={k}
                  className="grid h-[22px] w-[22px] place-items-center rounded-full text-[9px] font-semibold text-white ring-2 ring-white"
                  style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
                >
                  {k}
                </span>
              );
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Count({ n, reduce }: { n: number; reduce: boolean }) {
  const [shown, setShown] = useState(n);
  const from = useRef(n);
  useEffect(() => {
    if (reduce) {
      setShown(n);
      from.current = n;
      return;
    }
    const a = animate(from.current, n, {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    from.current = n;
    return () => a.stop();
  }, [n, reduce]);
  return (
    <motion.span
      key={shown}
      className="inline-block tabular-nums"
      initial={reduce ? false : { y: -4, opacity: 0.4 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      {shown}
    </motion.span>
  );
}

/** where a card lands: a ring of its column's colour spreading out, and in Done, a burst of light */
function Landing({ color, burst }: { color: string; burst: boolean }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <motion.span
        className="absolute inset-0 rounded-[14px]"
        style={{ boxShadow: `0 0 0 2px ${color}` }}
        initial={{ opacity: 0.9, scale: 1 }}
        animate={{ opacity: 0, scale: 1.08 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        className="absolute inset-0 rounded-[14px]"
        style={{
          background: `radial-gradient(70% 90% at 50% 50%, ${color}33, transparent 70%)`,
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
      />
      {burst &&
        Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const d = 46 + (i % 3) * 16;
          const c = ["#30d158", "#ffd60a", "#64d2ff", "#ffffff"][i % 4];
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full"
              style={{ background: c, boxShadow: `0 0 6px ${c}` }}
              initial={{ x: -2.5, y: -2.5, scale: 1, opacity: 1 }}
              animate={{
                x: Math.cos(a) * d * 1.6 - 2.5,
                y: Math.sin(a) * d * 0.8 - 2.5 + 10,
                scale: 0,
                opacity: 0,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
    </span>
  );
}
