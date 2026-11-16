"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { type PointerEvent as RPointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ReceiptItem = { name: string; qty?: number; price: number };
export type ReceiptButtonProps = {
  items?: ReceiptItem[];
  merchant?: string;
  /** tax as a fraction, e.g. 0.08 */
  tax?: number;
  currency?: string;
  /** called when the payment completes */
  onPaid?: (total: number) => void;
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
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  lock: "M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Z",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const DEFAULT_ITEMS: ReceiptItem[] = [
  { name: "Flat white", qty: 2, price: 4.6 },
  { name: "Almond croissant", price: 4.25 },
  { name: "Sourdough loaf", price: 7.5 },
  { name: "Seasonal jam", price: 6.8 },
  { name: "Cold brew 1L", price: 11.0 },
];

const PAPER_GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' seed='11'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0.16 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
const FIBRE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.012' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.48  0 0 0 0 0.44  0 0 0 0.12 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const PAPER_W = 252;
// the zigzag left by the printer's blade
const teeth = (n: number, depth: number, top: boolean) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    const y = i % 2 === 0 ? 0 : depth;
    pts.push(top ? `${x}% ${y}px` : `${x}% calc(100% - ${y}px)`);
  }
  return pts;
};

type Phase = "idle" | "paying" | "printing" | "done" | "torn";

/**
 * A pay button that prints its own receipt. Press it: it thinks for a moment, then sinks into a slot and a thermal
 * receipt feeds out underneath, line by line, with the stutter and whirr of a real printer; the blade cuts it with a
 * small shake. Pull the receipt down (or press Tear off) and it rips away along the teeth and falls. The receipt is
 * warm white paper with grain and fibre, the print a slightly soft thermal black, and it sways as it moves.
 */
export default function ReceiptButton({
  items = DEFAULT_ITEMS,
  merchant = "Hearth Bakery",
  tax = 0.08,
  currency = "$",
  onPaid,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: ReceiptButtonProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const touched = useRef(false);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const [order, setOrder] = useState(1042);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const sub = items.reduce((a, it) => a + it.price * (it.qty ?? 1), 0);
  const tx = Math.round(sub * tax * 100) / 100;
  const total = Math.round((sub + tx) * 100) / 100;
  const money = (v: number) => `${currency}${v.toFixed(2)}`;

  // the receipt's lines, drawn top to bottom as it prints
  const lines = useMemo(() => {
    const L: { k: string; el: ReactNode; h: number }[] = [];
    L.push({
      k: "m",
      h: 34,
      el: (
        <div
          style={{
            textAlign: "center",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          {merchant.toUpperCase()}
        </div>
      ),
    });
    L.push({
      k: "a",
      h: 16,
      el: <div style={{ textAlign: "center", opacity: 0.8 }}>14 Mill Lane, Bristol</div>,
    });
    L.push({
      k: "d",
      h: 26,
      el: <div style={{ textAlign: "center", opacity: 0.8 }}>{`Order #${order}   12 Nov  09:41`}</div>,
    });
    L.push({
      k: "r1",
      h: 14,
      el: (
        <div
          style={{
            borderTop: "1.5px dashed rgba(40,38,34,0.55)",
            marginTop: 6,
          }}
        />
      ),
    });
    items.forEach((it, i) =>
      L.push({
        k: "i" + i,
        h: 20,
        el: (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span>
              {it.qty && it.qty > 1 ? `${it.qty} x ` : ""}
              {it.name}
            </span>
            <span>{money(it.price * (it.qty ?? 1))}</span>
          </div>
        ),
      }),
    );
    L.push({
      k: "r2",
      h: 14,
      el: (
        <div
          style={{
            borderTop: "1.5px dashed rgba(40,38,34,0.55)",
            marginTop: 6,
          }}
        />
      ),
    });
    L.push({
      k: "s",
      h: 18,
      el: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            opacity: 0.8,
          }}
        >
          <span>Subtotal</span>
          <span>{money(sub)}</span>
        </div>
      ),
    });
    L.push({
      k: "t",
      h: 20,
      el: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            opacity: 0.8,
          }}
        >
          <span>Tax {Math.round(tax * 100)}%</span>
          <span>{money(tx)}</span>
        </div>
      ),
    });
    L.push({
      k: "T",
      h: 30,
      el: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 15,
            fontWeight: 700,
            paddingTop: 4,
          }}
        >
          <span>TOTAL</span>
          <span>{money(total)}</span>
        </div>
      ),
    });
    L.push({
      k: "c",
      h: 18,
      el: <div style={{ textAlign: "center", opacity: 0.8 }}>CARD **** 7764 APPROVED</div>,
    });
    L.push({
      k: "b",
      h: 46,
      el: (
        <svg
          width="100%"
          height="34"
          viewBox="0 0 200 34"
          preserveAspectRatio="none"
          style={{ display: "block", marginTop: 8 }}
          aria-hidden="true"
        >
          {Array.from({ length: 58 }, (_, i) => {
            const w = [1, 2, 1, 3, 1, 2, 2, 1][(i * 7 + order) % 8];
            return <rect key={i} x={i * 3.4 + 1} y="0" width={w * 0.9} height="34" fill="#26241f" />;
          })}
        </svg>
      ),
    });
    L.push({
      k: "y",
      h: 30,
      el: <div style={{ textAlign: "center", paddingTop: 6 }}>Thank you, see you soon</div>,
    });
    return L;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, merchant, order, sub, tx, total]);
  const fullH = lines.reduce((a, l) => a + l.h, 0) + 40; // padding top and bottom

  // how much paper is out of the slot
  const fed = useMotionValue(0);
  const fedTop = useTransform(fed, (v) => v - fullH);
  // pulling and swaying
  const pullY = useMotionValue(0);
  const pullX = useMotionValue(0);
  const sway = useSpring(
    useTransform(pullX, (v) => v * 0.05),
    { stiffness: 120, damping: 7 },
  );
  const stretch = useTransform(pullY, (v) => 1 + Math.max(0, v) / 900);
  const shade = useTransform(fed, (v) => Math.min(1, v / 60));
  const curl = useMotionTemplate`perspective(700px) rotateX(${useTransform(fed, (v) => -Math.min(9, v / 34))}deg)`;

  const print = async () => {
    setPhase("printing");
    sfx.whoosh(200, 900, { dur: 0.25, gain: 0.03 });
    // the leading edge comes out first, so the lines pass the print head from the bottom of the receipt up
    let y = 26;
    if (reduce) fed.set(y);
    else await animate(fed, y, { duration: 0.18, ease: "linear" });
    for (let i = lines.length - 1; i >= 0; i--) {
      if (phaseRef.current !== "printing") return;
      const h = lines[i].h;
      // the motor pulls the paper in short steps
      const steps = Math.max(2, Math.round(h / 7));
      for (let s = 0; s < steps; s++) {
        y += h / steps;
        sfx.tick({ freq: 1400 + Math.random() * 500, gain: 0.03 });
        if (reduce) fed.set(y);
        else await animate(fed, y, { duration: 0.035, ease: "linear" });
        await new Promise((r) => setTimeout(r, 12));
      }
      await new Promise((r) => setTimeout(r, 30));
    }
    // feed the margin and cut
    await animate(fed, fullH, { duration: reduce ? 0 : 0.28, ease: "easeOut" });
    sfx.tick({ freq: 900, gain: 0.08 });
    sfx.whoosh(2400, 600, { dur: 0.12, gain: 0.05 });
    if (!reduce) animate(pullX, [0, 26, -18, 10, 0], { duration: 0.7 });
    setPhase("done");
    onPaid?.(total);
  };

  const pay = () => {
    if (phaseRef.current !== "idle") return;
    setPhase("paying");
    sfx.note(520, { dur: 0.14, gain: 0.06 });
    later(
      () => {
        sfx.note(784, { dur: 0.3, gain: 0.07, bell: 0.4 });
        void print();
      },
      reduce ? 100 : 1100,
    );
  };

  const [fall, setFall] = useState<{ x: number; r: number } | null>(null);
  const tear = (vx = 0) => {
    if (phaseRef.current !== "done") return;
    setPhase("torn");
    sfx.whoosh(3200, 500, { dur: 0.28, gain: 0.09 });
    setFall({
      x: vx * 0.15 + (Math.random() - 0.5) * 60,
      r: (Math.random() - 0.5) * 30 + vx * 0.02,
    });
    later(
      () => {
        fed.set(0);
        pullY.set(0);
        pullX.set(0);
        setFall(null);
        setOrder((o) => o + 1);
        setPhase("idle");
      },
      reduce ? 300 : 1400,
    );
  };

  // dragging the paper
  const drag = useRef<{
    x: number;
    y: number;
    t: number;
    vx: number;
    vy: number;
  } | null>(null);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "done") return;
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      vx: 0,
      vy: 0,
    };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    const dy = e.clientY - d.y;
    const dx = e.clientX - d.x;
    d.vx = ((dx - pullX.get()) / dt) * 1000;
    d.t = now;
    // paper resists: it gives a little before it rips
    pullY.set(dy > 0 ? dy * 0.55 : dy * 0.1);
    pullX.set(dx * 0.6);
    if (dy > 90) {
      drag.current = null;
      tear(d.vx);
    }
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    animate(pullY, 0, { type: "spring", stiffness: 400, damping: 18 });
    animate(pullX, 0, { type: "spring", stiffness: 200, damping: 10 });
  };

  // autoplay: pay, let it print, tear it off, again
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 900));
      while (alive && !touched.current) {
        if (phaseRef.current === "idle") pay();
        await new Promise((r) => setTimeout(r, 400));
        if (phaseRef.current === "done") {
          await new Promise((r) => setTimeout(r, 1800));
          if (!alive || touched.current) return;
          await animate(pullY, 60, { duration: 0.45, ease: "easeIn" });
          tear(120);
          await new Promise((r) => setTimeout(r, 2200));
        }
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const busy = phase === "paying";
  const sunk = phase === "printing" || phase === "done" || phase === "torn";
  const label = phase === "idle" ? `Pay ${money(total)}` : phase === "paying" ? "Processing" : "Paid";

  const paper = (torn: boolean) => (
    <div
      style={{
        position: "relative",
        width: PAPER_W,
        height: fullH,
        background: "linear-gradient(90deg,#efece4 0%,#fbfaf6 7%,#fdfcf9 50%,#f9f7f1 93%,#ebe7de 100%)",
        clipPath: `polygon(${[...(torn ? teeth(36, 5, true) : ["0% 0%", "100% 0%"]), ...teeth(36, 6, false).reverse()].join(",")})`,
        color: "#26241f",
        fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
        fontSize: 12,
        lineHeight: 1.35,
        fontVariantNumeric: "tabular-nums",
        padding: "20px 18px",
        textShadow: "0 0 0.4px rgba(38,36,31,0.7)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `${PAPER_GRAIN}, ${FIBRE}`,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
      {lines.map((l) => (
        <div key={l.k} style={{ height: l.h }}>
          {l.el}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f5f5f7] select-none ${className}`}
      style={{
        minHeight: 520,
        padding: "48px 16px 24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: 300 }}>
        {/* the paper, under the slot */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: (300 - PAPER_W) / 2 - 20,
            width: PAPER_W + 40,
            height: fullH + 120,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <AnimatePresence>
            {phase !== "idle" && phase !== "paying" && !fall && (
              <motion.div
                key={"p" + order}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                style={{
                  position: "absolute",
                  left: 20,
                  top: fedTop,
                  y: pullY,
                  x: pullX,
                  rotate: sway,
                  scaleY: stretch,
                  transformOrigin: "50% 0%",
                  pointerEvents: phase === "done" ? "auto" : "none",
                  cursor: phase === "done" ? "grab" : "default",
                  touchAction: "none",
                  filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.12)) drop-shadow(0 1px 1px rgba(0,0,0,0.08))",
                }}
              >
                <motion.div style={{ transform: curl, transformOrigin: "50% 0%" }}>{paper(false)}</motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 20,
              width: PAPER_W,
              top: 0,
              height: 22,
              background: "linear-gradient(180deg, rgba(0,0,0,0.28), transparent)",
              opacity: fall ? 0 : shade,
              pointerEvents: "none",
            }}
          />
        </div>
        {/* the torn receipt falling away */}
        <AnimatePresence>
          {fall && (
            <motion.div
              key={"f" + order}
              initial={{
                y: pullY.get() + 40,
                x: pullX.get() + 24,
                rotate: 0,
                opacity: 1,
              }}
              animate={{ y: 520, x: fall.x + 24, rotate: fall.r, opacity: 0 }}
              transition={{ duration: 1.25, ease: [0.45, 0, 0.9, 0.6] }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "none",
                filter: "drop-shadow(0 18px 18px rgba(0,0,0,0.14))",
              }}
            >
              {paper(true)}
            </motion.div>
          )}
        </AnimatePresence>
        {/* the button, which becomes the printer's lip */}
        <motion.button
          type="button"
          onClick={() => {
            touched.current = true;
            if (phaseRef.current === "done") tear(0);
            else pay();
          }}
          disabled={busy || phase === "printing"}
          aria-label={phase === "done" ? "Tear off receipt" : label}
          animate={{
            height: sunk ? 44 : 56,
            borderRadius: sunk ? 16 : 28,
            y: sunk ? -6 : 0,
          }}
          whileTap={phase === "idle" ? { scale: 0.97 } : undefined}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7]"
          style={{
            position: "relative",
            zIndex: 2,
            width: 300,
            border: 0,
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            background: "linear-gradient(180deg,#2c2c2e,#1d1d1f 55%,#141416)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.5), 0 14px 30px -14px rgba(0,0,0,0.55)",
            cursor: busy || phase === "printing" ? "default" : "pointer",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={phase === "done" ? "tear" : label}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {phase === "idle" && <Ico d={I.lock} size={15} />}
              {busy && (
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                  }}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.25)",
                    borderTopColor: "#fff",
                    display: "block",
                  }}
                />
              )}
              {(phase === "printing" || phase === "torn") && <Ico d={I.check} size={15} />}
              {phase === "done" ? "Tear off receipt" : label}
            </motion.span>
          </AnimatePresence>
          {/* the slot the paper feeds from */}
          <motion.span
            aria-hidden="true"
            animate={{ opacity: sunk ? 1 : 0 }}
            style={{
              position: "absolute",
              left: (300 - PAPER_W) / 2 - 4,
              right: (300 - PAPER_W) / 2 - 4,
              bottom: 5,
              height: 5,
              borderRadius: 3,
              background: "#050505",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.12)",
            }}
          />
        </motion.button>
      </div>
      <p className="sr-only" aria-live="polite">
        {phase === "printing"
          ? "Payment approved, printing receipt"
          : phase === "done"
            ? `Receipt printed, total ${money(total)}`
            : ""}
      </p>
    </div>
  );
}
