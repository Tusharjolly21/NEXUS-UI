"use client";
/**
 * Synapse hero: a live node canvas. Drag the nodes (the wires follow through
 * motion values, no re-renders), drag from the dangling port to connect the
 * missing step, then press Run to send a pulse down the whole flow. As the
 * pulse passes each step, that step's real output appears under it. Left
 * alone, the canvas draws the missing wire itself and runs.
 */
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";

const INK = "#111318";
const MONO = "'Fragment Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const NW = 208;
const NH = 72;
const PORT = 14;

type Kind = "Trigger" | "Model" | "Knowledge" | "Branch";
/** Each kind of step has its own colour on the canvas, and in the legend above it. */
export const KIND_TONE: Record<Kind, string> = { Trigger: "#3b4a5c", Model: "#3355e0", Knowledge: "#b86e00", Branch: "#0d7a55" };
const NODES: { id: string; kind: Kind; title: string; sub: string; out: string }[] = [
  { id: "in", kind: "Trigger", title: "New support email", sub: "inbox: help@", out: "\u201cCharged twice for March\u201d" },
  { id: "cls", kind: "Model", title: "Classify the intent", sub: "billing, bug, how-to", out: "billing, 0.93" },
  { id: "kb", kind: "Knowledge", title: "Search help center", sub: "412 articles", out: "3 articles: Refunds, Duplicate charges, Billing dates" },
  { id: "draft", kind: "Model", title: "Draft a reply", sub: "tone: friendly, brief", out: "\u201cHi Dana, you were charged twice on 3 March. I\u2019ve refunded \u00a324\u2026\u201d" },
  { id: "route", kind: "Branch", title: "Send or hand over", sub: "if confidence < 0.8", out: "0.93 is over 0.8: sent" },
];

const ICON: Record<Kind, ReactNode> = {
  Trigger: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  Model: <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" />,
  Knowledge: <path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4" />,
  Branch: <path d="M6 4v16M6 12h6a6 6 0 0 0 6-6M12 12a6 6 0 0 1 6 6" />,
};

interface Layout { pts: { x: number; y: number }[]; h: number; vertical: boolean }

function layoutFor(w: number): Layout {
  if (w < 720) {
    const cx = (w - NW) / 2;
    const off = Math.min(46, (w - NW) / 2 - 4);
    return { pts: NODES.map((_, i) => ({ x: cx + (i % 2 ? off : -off), y: 18 + i * 140 })), h: 18 + 4 * 140 + NH + 60, vertical: true };
  }
  const span = w - NW;
  const ys = [20, 190, 20, 190, 105];
  return { pts: NODES.map((_, i) => ({ x: (span * i) / 4, y: ys[i] })), h: 336, vertical: false };
}

/** Output port (right or bottom) and input port (left or top) of a node in stage coordinates. */
const outPort = (x: number, y: number, v: boolean) => (v ? { x: x + NW / 2, y: y + NH } : { x: x + NW, y: y + NH / 2 });
const inPort = (x: number, y: number, v: boolean) => (v ? { x: x + NW / 2, y } : { x, y: y + NH / 2 });
function curve(a: { x: number; y: number }, b: { x: number; y: number }, v: boolean) {
  if (v) {
    const d = Math.max(30, Math.abs(b.y - a.y) * 0.5);
    return `M${a.x},${a.y} C${a.x},${a.y + d} ${b.x},${b.y - d} ${b.x},${b.y}`;
  }
  const d = Math.max(40, Math.abs(b.x - a.x) * 0.5);
  return `M${a.x},${a.y} C${a.x + d},${a.y} ${b.x - d},${b.y} ${b.x},${b.y}`;
}

function Wire({ ax, ay, bx, by, vertical, index, progress, live }: { ax: MotionValue<number>; ay: MotionValue<number>; bx: MotionValue<number>; by: MotionValue<number>; vertical: boolean; index: number; progress: MotionValue<number>; live: boolean }) {
  const tone = KIND_TONE[NODES[index + 1].kind];
  const d = useTransform([ax, ay, bx, by], ([x1, y1, x2, y2]: number[]) => curve(outPort(x1, y1, vertical), inPort(x2, y2, vertical), vertical));
  const path = useRef<SVGPathElement>(null);
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const op = useMotionValue(0);
  const glow = useTransform(op, (o) => o * 0.2);
  useMotionValueEvent(progress, "change", (p) => {
    const t = p - index;
    const el = path.current;
    if (!el || t < 0 || t > 1) { op.set(0); return; }
    const pt = el.getPointAtLength(el.getTotalLength() * t);
    cx.set(pt.x);
    cy.set(pt.y);
    op.set(1);
  });
  return (
    <g>
      <motion.path ref={path} d={d} fill="none" stroke="#c9ccd3" strokeWidth={2} />
      <motion.path d={d} fill="none" stroke={tone} strokeWidth={2} strokeDasharray="5 9" strokeLinecap="round" initial={false} animate={live ? { strokeDashoffset: [0, -28] } : { strokeDashoffset: 0 }} transition={live ? { duration: 1.1, repeat: Infinity, ease: "linear" } : { duration: 0 }} style={{ opacity: 0.6 }} />
      <motion.circle r={6} cx={cx} cy={cy} fill={tone} style={{ opacity: op }} />
      <motion.circle r={14} cx={cx} cy={cy} fill={tone} style={{ opacity: glow }} />
    </g>
  );
}

function Node({ i, x, y, stage, active, done, vertical, onDragged }: { i: number; x: MotionValue<number>; y: MotionValue<number>; stage: RefObject<HTMLDivElement | null>; active: boolean; done: boolean; vertical: boolean; onDragged: () => void }) {
  const n = NODES[i];
  const tone = KIND_TONE[n.kind];
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.12}
      dragConstraints={stage}
      onDragStart={onDragged}
      whileDrag={{ scale: 1.04, boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 30px 50px -20px rgba(0,0,0,.4)" }}
      role="group"
      aria-label={`${n.kind} step: ${n.title}`}
      className="absolute left-0 top-0 z-10 flex cursor-grab touch-none select-none items-center gap-3 rounded-[16px] bg-white px-3.5 active:cursor-grabbing"
      style={{ x, y, width: NW, height: NH, boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 14px 30px -18px rgba(0,0,0,.35)" }}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[16px]"
        initial={false}
        animate={{ boxShadow: active ? `0 0 0 2px ${tone}, 0 0 0 7px ${tone}29` : `0 0 0 0px ${tone}00` }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
      />
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px]" style={{ background: tone, color: "#fff" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICON[n.kind]}</svg>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[12px] font-semibold" style={{ color: tone }}>{n.kind}</span>
        <span className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{n.title}</span>
        <span className="truncate text-[12px] text-[#6e6e73]">{n.sub}</span>
      </span>
      {i > 0 && <span aria-hidden="true" className="absolute rounded-full border-2 border-white bg-[#c7c7cc]" style={{ width: PORT - 2, height: PORT - 2, ...(vertical ? { left: NW / 2 - 6, top: -6 } : { left: -6, top: NH / 2 - 6 }) }} />}
      {i < NODES.length - 1 && <span aria-hidden="true" className="absolute rounded-full border-2 border-white" style={{ background: tone, width: PORT - 2, height: PORT - 2, ...(vertical ? { left: NW / 2 - 6, bottom: -6 } : { right: -6, top: NH / 2 - 6 }) }} />}
      {/* what this step produced on the last run */}
      <AnimatePresence>
        {done ? (
          <motion.span
            key="out"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="pointer-events-none absolute left-0 top-[calc(100%+10px)] w-full rounded-[10px] px-2.5 py-1.5 text-[11.5px] leading-[1.35]"
            style={{ background: `${tone}14`, color: tone, boxShadow: `inset 0 0 0 1px ${tone}33`, fontFamily: MONO }}
          >
            {n.out}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function NodeCanvas() {
  const stage = useRef<HTMLDivElement>(null);
  const [lay, setLay] = useState<Layout | null>(null);
  const x0 = useMotionValue(0), y0 = useMotionValue(0);
  const x1 = useMotionValue(0), y1 = useMotionValue(0);
  const x2 = useMotionValue(0), y2 = useMotionValue(0);
  const x3 = useMotionValue(0), y3 = useMotionValue(0);
  const x4 = useMotionValue(0), y4 = useMotionValue(0);
  const X = [x0, x1, x2, x3, x4];
  const Y = [y0, y1, y2, y3, y4];
  const [connected, setConnected] = useState(false);
  const [linking, setLinking] = useState(false);
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const progress = useMotionValue(-1);
  const [activeNode, setActiveNode] = useState(-1);
  const [runs, setRuns] = useState(0);
  const [running, setRunning] = useState(false);
  const [moved, setMoved] = useState(false);
  const [reached, setReached] = useState(-1); // the furthest step this run has passed
  const touched = useRef(false);
  const linkStart = useRef({ x: 0, y: 0 });
  const vertical = lay?.vertical ?? false;

  // Lay the nodes out for the stage width, and again whenever it changes.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    let first = true;
    const place = () => {
      const l = layoutFor(el.clientWidth);
      setLay(l);
      l.pts.forEach((p, i) => {
        if (first) { X[i].set(p.x); Y[i].set(p.y); }
        else { animate(X[i], p.x, { type: "spring", stiffness: 160, damping: 22 }); animate(Y[i], p.y, { type: "spring", stiffness: 160, damping: 22 }); }
      });
      first = false;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(progress, "change", (p) => {
    const n = p < 0 ? -1 : Math.min(NODES.length - 1, Math.floor(p + 0.15));
    setActiveNode((a) => (a === n ? a : n));
    if (n >= 0) setReached((r) => (n > r ? n : r));
  });

  // The temporary wire while linking, from the dangling port to the pointer.
  const tempD = useTransform([x2, y2, lx, ly], ([sx, sy, px, py]: number[]) => curve(outPort(sx, sy, vertical), { x: px, y: py }, vertical));
  const handleX = useTransform([x2, y2], ([sx, sy]: number[]) => outPort(sx, sy, vertical).x - 18);
  const handleY = useTransform([x2, y2], ([sx, sy]: number[]) => outPort(sx, sy, vertical).y - 18);
  const targetX = useTransform([x3, y3], ([tx, ty]: number[]) => inPort(tx, ty, vertical).x - 18);
  const targetY = useTransform([x3, y3], ([tx, ty]: number[]) => inPort(tx, ty, vertical).y - 18);

  const local = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const target = () => inPort(x3.get(), y3.get(), vertical);
  const source = () => outPort(x2.get(), y2.get(), vertical);

  const snapConnect = () => {
    const t = target();
    setLinking(true);
    animate(lx, t.x, { type: "spring", stiffness: 260, damping: 22 });
    animate(ly, t.y, { type: "spring", stiffness: 260, damping: 22, onComplete: () => { setConnected(true); setLinking(false); } });
  };

  const startLink = (e: RPointerEvent<HTMLButtonElement>) => {
    if (connected) return;
    touched.current = true;
    e.preventDefault();
    stage.current?.setPointerCapture(e.pointerId);
    const s = source();
    lx.set(s.x);
    ly.set(s.y);
    const p = local(e);
    linkStart.current = p;
    setLinking(true);
  };
  const moveLink = (e: RPointerEvent) => {
    if (!linking || connected) return;
    const p = local(e);
    lx.set(p.x);
    ly.set(p.y);
  };
  const endLink = (e: RPointerEvent) => {
    if (!linking || connected) return;
    const p = local(e);
    const t = target();
    const travelled = Math.hypot(p.x - linkStart.current.x, p.y - linkStart.current.y);
    if (travelled < 6 || Math.hypot(p.x - t.x, p.y - t.y) < 56) {
      snapConnect();
    } else {
      const s = source();
      animate(lx, s.x, { type: "spring", stiffness: 380, damping: 18 });
      animate(ly, s.y, { type: "spring", stiffness: 380, damping: 18, onComplete: () => setLinking(false) });
    }
  };

  const run = () => {
    if (!connected || running) return;
    setRunning(true);
    setReached(-1);
    progress.set(0);
    animate(progress, NODES.length - 0.999, {
      duration: 3.2,
      ease: [0.45, 0, 0.55, 1],
      onComplete: () => {
        setRuns((r) => r + 1);
        setRunning(false);
        window.setTimeout(() => progress.set(-1), 900);
      },
    });
  };

  const reset = () => { touched.current = true; setConnected(false); setRuns(0); setReached(-1); progress.set(-1); };

  // Left alone, the canvas draws the missing wire itself after a moment, then runs again every so often.
  useEffect(() => {
    const a = window.setTimeout(() => { if (!touched.current && !connected) { const s = source(); lx.set(s.x); ly.set(s.y); snapConnect(); } }, 2600);
    return () => clearTimeout(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!connected) return;
    const t = window.setInterval(() => { if (!touched.current) run(); }, 9000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, running]);

  useEffect(() => {
    if (!connected) return;
    const t = window.setTimeout(run, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const h = lay?.h ?? 300;

  return (
    <div className="relative w-full">
      <div ref={stage} className="relative w-full" style={{ height: h }} onPointerMove={moveLink} onPointerUp={endLink} onPointerCancel={endLink}>
        {lay && (
          <>
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              <Wire ax={x0} ay={y0} bx={x1} by={y1} vertical={vertical} index={0} progress={progress} live />
              <Wire ax={x1} ay={y1} bx={x2} by={y2} vertical={vertical} index={1} progress={progress} live />
              {connected && <Wire ax={x2} ay={y2} bx={x3} by={y3} vertical={vertical} index={2} progress={progress} live />}
              <Wire ax={x3} ay={y3} bx={x4} by={y4} vertical={vertical} index={3} progress={progress} live />
              {linking && !connected && <motion.path d={tempD} fill="none" stroke={KIND_TONE.Model} strokeWidth={2} strokeLinecap="round" />}
            </svg>
            {NODES.map((n, i) => (
              <Node key={n.id} i={i} x={X[i]} y={Y[i]} stage={stage} active={activeNode === i} done={i <= reached} vertical={vertical} onDragged={() => { touched.current = true; setMoved(true); }} />
            ))}
            {!connected && (
              <>
                <motion.span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20 h-9 w-9 rounded-full" style={{ x: targetX, y: targetY, border: `2px dashed ${KIND_TONE.Model}` }} animate={{ scale: [1, 1.15, 1], opacity: [0.9, 0.5, 0.9] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
                <motion.button
                  type="button"
                  aria-label="Connect Search help center to Draft a reply"
                  onPointerDown={startLink}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const s = source(); lx.set(s.x); ly.set(s.y); snapConnect(); } }}
                  className="absolute left-0 top-0 z-30 flex h-9 w-9 cursor-crosshair touch-none items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ x: handleX, y: handleY, ["--tw-ring-color" as string]: INK }}
                >
                  <motion.span className="absolute inset-0 rounded-full" style={{ background: KIND_TONE.Knowledge, opacity: 0.2 }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
                  <span className="relative h-4 w-4 rounded-full border-[3px] border-white shadow-[0_2px_6px_rgba(0,0,0,.3)]" style={{ background: KIND_TONE.Knowledge }} />
                </motion.button>
<motion.span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30" style={{ x: handleX, y: handleY }}>
                  <motion.span
                    className="absolute whitespace-nowrap rounded-full bg-[#111318] px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)]"
                    style={vertical ? { left: 46, top: 4 } : { left: -24, top: 46 }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: linking ? 0 : 1, y: linking ? 6 : [0, -4, 0] }}
                    transition={linking ? { type: "spring", stiffness: 300, damping: 24 } : { opacity: { duration: 0.3 }, y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
                  >
                    Drag to connect
                  </motion.span>
                </motion.span>
              </>
            )}
          </>
        )}
      </div>

      <div className="relative z-20 mt-2 flex flex-col items-center gap-3">
        <AnimatePresence mode="popLayout">
          {runs > 0 && !running && (
            <motion.div key={runs} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-[16px] bg-white px-4 py-2.5 text-[13px] text-[#424245] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-18px_rgba(0,0,0,.35)]" role="status">
              <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: KIND_TONE.Branch }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
              <span className="font-semibold text-[#1d1d1f]">Test run {runs} passed</span>
              <span className="tabular-nums">2.4 s, 3 articles cited, confidence 0.93, reply sent</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-1.5 rounded-full bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-18px_rgba(0,0,0,.35)]">
          <span className="px-3 text-[13px] font-medium text-[#424245]">support-triage <span className="text-[#6e6e73]">(draft)</span></span>
          <motion.button
            type="button"
            onClick={() => { touched.current = true; run(); }}
            disabled={!connected || running}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            animate={{ backgroundColor: connected ? INK : "#e8e8ed", color: connected ? "#ffffff" : "#6e6e73" }}
            style={{ ["--tw-ring-color" as string]: INK }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
            {running ? "Running…" : connected ? "Run test" : "Connect to run"}
          </motion.button>
          {connected && (
            <button type="button" onClick={reset} className="h-9 rounded-full px-3 text-[13px] font-medium text-[#424245] outline-none hover:bg-black/5 focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: INK }}>Reset</button>
          )}
        </div>
        <span className="text-[13px] text-[#6e6e73]">{moved ? "Wires follow wherever you put a step." : connected ? "Drag any step around. Reset to draw the wire yourself." : "Every step drags. Draw the missing wire from the amber port."}</span>
      </div>
    </div>
  );
}
