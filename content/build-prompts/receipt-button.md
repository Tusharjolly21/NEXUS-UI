# Receipt Button

Add the "Receipt Button" component from Nexus UI to my project.

A pay button that prints its own receipt. Press it: it thinks for a moment, then sinks into a slot and a thermal receipt feeds out underneath with the stutter of a real printer, and the blade cuts it with a small shake. Pull it down and it tears off along its teeth and falls away.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ReceiptButton } from "@/components/receipt-button";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/receipt-button/index.ts ---

```ts
export { default as ReceiptButton } from "./receipt-button";
export type { ReceiptButtonProps } from "./receipt-button";
```

--- components/receipt-button/receipt-button.tsx ---

```tsx
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
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
