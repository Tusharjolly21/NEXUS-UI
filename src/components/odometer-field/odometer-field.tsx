"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  type MotionValue,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  useVelocity,
} from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type OdometerFieldProps = {
  label?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  /** the price of one, for the total underneath; leave out for no total */
  unitPrice?: number;
  currency?: string;
  /** what one of them is called, and many */
  noun?: [string, string];
  onChange?: (value: number) => void;
  /** A mechanical click as each number passes. They also follow the site-wide sound switch. */
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
  minus: "M228 128a12 12 0 0 1-12 12H40a12 12 0 0 1 0-24h176a12 12 0 0 1 12 12",
  plus: "M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);
const DH = 62; // a digit's height
const WH = 96; // a drum's visible height in the window: a digit, with the next ones curving away above and below
const TICK = 14; // the ruler: px per unit

/**
 * A number field that works like a mechanical counter.
 *
 * The number sits behind a recessed window on drums, one per digit, and rolls: when the ones go from 9 to 0 the tens
 * turn over with them, the way an odometer carries, blurring a little when they spin fast. Under it a ruler slides
 * with the value; drag the window or the ruler sideways to scrub, and let go to coast to a stop on a whole number.
 * The steppers press in, and held down they repeat faster and faster. At the ends it won't go further: it nudges and
 * thuds. Type a number, or use the arrow keys (Shift for ten). A total underneath counts along.
 *   <OdometerField label="Tickets" unitPrice={24} max={99} />
 */
export default function OdometerField({
  label = "Tickets",
  defaultValue = 2,
  min = 0,
  max = 99,
  unitPrice = 24,
  currency = "$",
  noun = ["ticket", "tickets"],
  onChange,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: OdometerFieldProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const clampV = (v: number) => Math.max(min, Math.min(max, v));
  const [value, setValue] = useState(clampV(defaultValue));
  const [text, setText] = useState(String(clampV(defaultValue)));
  const [editing, setEditing] = useState(false);
  // the latest value, for handlers that outlive a render (holding a stepper)
  const valueRef = useRef(value);
  valueRef.current = value;
  const vm = useMotionValue(clampV(defaultValue)); // the drums' position: a whole number at rest, in between while turning
  const vel = useVelocity(vm);
  const nudge = useMotionValue(0);
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;
  const places = Math.max(1, String(max).length);

  // a click as each whole number passes the window
  const lastInt = useRef(Math.round(vm.get()));
  useMotionValueEvent(vm, "change", (v) => {
    const r = Math.round(v);
    if (r !== lastInt.current) {
      lastInt.current = r;
      sfx.tick({ freq: 2400 + (r % 4) * 90, gain: 0.03 });
    }
  });

  const commit = (v: number, how: "spring" | "snap" = "spring", velocity = 0) => {
    const t = clampV(Math.round(v));
    anim.current?.stop();
    anim.current = animate(
      vm,
      t,
      reduce || how === "snap"
        ? { duration: 0 }
        : {
            type: "spring",
            stiffness: 220,
            damping: 26,
            velocity,
            restDelta: 0.001,
          },
    );
    if (t !== valueRef.current) {
      valueRef.current = t;
      setValue(t);
      cb.current?.(t);
    }
    if (!editing) setText(String(t));
    return t;
  };
  const bump = (dir: number) => {
    // at an end: a nudge and a thud
    sfx.note(110, { dur: 0.12, gain: 0.06, bell: 0, type: "triangle" });
    if (!reduce) animate(nudge, [0, dir * 6, -dir * 3, 0], { duration: 0.3 });
  };
  const step = (n: number) => {
    touched.current = true;
    unlockAudio();
    const cur = valueRef.current;
    if (cur + Math.sign(n) < min || cur + Math.sign(n) > max) return bump(Math.sign(n));
    commit(cur + n);
  };

  // hold a stepper to repeat, faster and faster
  const hold = useRef(0);
  const startHold = (n: number) => {
    step(n);
    let delay = 380;
    const go = () => {
      hold.current = window.setTimeout(() => {
        step(n);
        delay = Math.max(45, delay * 0.78);
        go();
      }, delay);
    };
    go();
  };
  const stopHold = () => window.clearTimeout(hold.current);
  useEffect(() => () => window.clearTimeout(hold.current), []);

  // scrubbing: drag sideways on the window or the ruler
  const drag = useRef<{
    x: number;
    v0: number;
    t: number;
    vx: number;
    moved: boolean;
  } | null>(null);
  const onDown = (e: RPointerEvent) => {
    touched.current = true;
    unlockAudio();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    anim.current?.stop();
    drag.current = {
      x: e.clientX,
      v0: vm.get(),
      t: performance.now(),
      vx: 0,
      moved: false,
    };
  };
  const onMove = (e: RPointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    if (Math.abs(dx) > 3) g.moved = true;
    // to the right counts up; past the ends it resists
    let v = g.v0 + dx / TICK;
    if (v < min) v = min - Math.pow(min - v, 0.55) * 0.5;
    if (v > max) v = max + Math.pow(v - max, 0.55) * 0.5;
    const now = performance.now();
    g.vx = g.vx * 0.6 + ((v - vm.get()) / Math.max(1, now - g.t)) * 1000 * 0.4;
    g.t = now;
    vm.set(v);
    const r = clampV(Math.round(v));
    if (r !== valueRef.current) {
      setValue(r);
      setText(String(r));
    }
  };
  const onUp = () => {
    const g = drag.current;
    drag.current = null;
    if (!g || !g.moved) return;
    // coast with the hand's speed, and come to rest on a whole number
    const target = clampV(Math.round(vm.get() + g.vx * 0.22));
    commit(target, "spring", g.vx);
    cb.current?.(target);
  };

  const onKey = (e: RKeyboardEvent) => {
    const n = {
      ArrowUp: 1,
      ArrowRight: 1,
      ArrowDown: -1,
      ArrowLeft: -1,
      PageUp: 10,
      PageDown: -10,
    }[e.key];
    if (n != null) {
      e.preventDefault();
      step(e.shiftKey ? n * 10 : n);
    } else if (e.key === "Home") {
      e.preventDefault();
      commit(min);
    } else if (e.key === "End") {
      e.preventDefault();
      commit(max);
    }
  };

  // autoplay: someone scrubs up, steps, scrubs back
  useEffect(() => {
    if (!autoplay || !inView) return;
    const plan = [12, 13, 14, 37, 36, 8, 2];
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      const t = plan[k++ % plan.length];
      anim.current?.stop();
      const far = Math.abs(t - vm.get()) > 3;
      anim.current = animate(
        vm,
        t,
        reduce
          ? { duration: 0 }
          : far
            ? { type: "spring", stiffness: 40, damping: 14 }
            : { type: "spring", stiffness: 220, damping: 26 },
      );
      setValue(t);
      setText(String(t));
    }, 1500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const blur = useTransform(vel, (v) => `blur(${Math.min(2.2, Math.abs(v) / 40)}px)`);
  const shake = useTransform(nudge, (x) => `translateX(${x}px)`);
  const total = value * unitPrice;
  return (
    <div
      ref={rootRef}
      onPointerDown={() => {
        touched.current = true;
        unlockAudio();
      }}
      className={`w-full max-w-[380px] select-none rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04),0_14px_30px_-14px_rgba(0,0,0,.18),0_40px_70px_-44px_rgba(0,0,0,.35)] ${className}`}
      style={{ fontFeatureSettings: '"tnum" 1' }}
    >
      <div className="flex items-baseline justify-between">
        <label htmlFor="odo-input" className="text-[17px] font-semibold tracking-[-0.01em]">
          {label}
        </label>
        <span className="text-[12.5px] text-[#86868b] tabular-nums">
          {unitPrice > 0 ? `${currency}${unitPrice} each` : `${min} to ${max}`}
        </span>
      </div>

      {/* the counter: one dark housing with the keys either side of the window */}
      <div
        className="relative mt-4 flex items-center gap-2.5 rounded-[24px] p-2.5"
        style={{
          background: "linear-gradient(180deg, #34343a 0%, #222226 48%, #18181b 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.14), inset 0 -1px 0 rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.55), 0 2px 3px rgba(0,0,0,.18), 0 18px 30px -16px rgba(0,0,0,.55)",
        }}
      >
        <Stepper
          d={I.minus}
          label={`One fewer ${noun[0]}`}
          disabled={value <= min}
          onDown={() => startHold(-1)}
          onUp={stopHold}
        />
        {/* the window onto the drums */}
        <motion.div
          className="relative flex-1 cursor-ew-resize touch-none overflow-hidden rounded-[15px]"
          style={{
            height: WH + 8,
            transform: shake,
            background: "#050506",
            boxShadow: "inset 0 3px 6px rgba(0,0,0,.9), inset 0 0 0 1px rgba(0,0,0,.9), 0 1px 0 rgba(255,255,255,.08)",
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center gap-[4px] px-3"
            style={{ filter: reduce ? undefined : blur }}
          >
            {Array.from({ length: places }, (_, i) => (
              <Drum
                key={i}
                vm={vm}
                place={places - 1 - i}
                hidden={places - 1 - i > 0 && value < Math.pow(10, places - 1 - i)}
              />
            ))}
          </motion.div>
          {/* the index marks at the reading line, as on a counter */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[4px] border-l-[6px] border-y-transparent border-l-[#ff9f0a]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-1 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[4px] border-r-[6px] border-y-transparent border-r-[#ff9f0a]"
          />
          {/* the glass over the window: a soft reflection across the top and a hairline where it meets the frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[15px]"
            style={{
              background:
                "linear-gradient(168deg, rgba(255,255,255,.13) 0%, rgba(255,255,255,.04) 34%, rgba(255,255,255,0) 35%), linear-gradient(180deg, rgba(0,0,0,0) 80%, rgba(255,255,255,.04) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)",
            }}
          />
          <input
            id="odo-input"
            inputMode="numeric"
            value={text}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            role="spinbutton"
            onFocus={() => setEditing(true)}
            onBlur={() => {
              setEditing(false);
              const n = parseInt(text, 10);
              commit(Number.isFinite(n) ? n : value);
            }}
            onChange={(e) => {
              touched.current = true;
              const s = e.target.value.replace(/\D/g, "").slice(0, places);
              setText(s);
              const n = parseInt(s, 10);
              if (Number.isFinite(n)) commit(n);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              else onKey(e);
            }}
            className="absolute inset-0 cursor-ew-resize bg-transparent text-center text-transparent caret-[#ff9f0a] outline-none focus-visible:shadow-[inset_0_0_0_2px_#ff9f0a]"
            style={{ borderRadius: 15 }}
          />
        </motion.div>
        <Stepper
          d={I.plus}
          label={`One more ${noun[0]}`}
          disabled={value >= max}
          onDown={() => startHold(1)}
          onUp={stopHold}
        />
      </div>

      {/* the ruler that slides with the value, read against a fixed pointer */}
      <div
        className="relative mt-4 h-10 cursor-ew-resize touch-none overflow-hidden"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-hidden="true"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 24%, #000 76%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 24%, #000 76%, transparent)",
        }}
      >
        <Ruler vm={vm} min={min} max={max} />
        <span className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent border-t-[#1d1d1f]" />
        <span className="absolute left-1/2 top-[5px] h-[16px] w-[1.5px] -translate-x-1/2 rounded-full bg-[#1d1d1f]" />
      </div>

      {unitPrice > 0 && (
        <div className="mt-3 flex items-end justify-between border-t border-black/[.06] pt-3.5">
          <span className="text-[13px] text-[#6e6e73]">
            <span className="block text-[11.5px] text-[#86868b]">Total</span>
            {value} {value === 1 ? noun[0] : noun[1]}
          </span>
          <span className="text-[26px] font-semibold leading-none tabular-nums tracking-[-0.03em]">
            {currency}
            <Count value={total} reduce={reduce} />
          </span>
        </div>
      )}
    </div>
  );
}

/** one digit's drum: 0 to 9 with a 9 above and a 0 and 1 below, so it rolls round; it turns over when the place below carries */
function Drum({ vm, place, hidden }: { vm: MotionValue<number>; place: number; hidden: boolean }) {
  const y = useTransform(vm, (v) => {
    const unit = Math.pow(10, place);
    const whole = Math.floor(Math.max(0, v) / unit);
    // carry: only during the last stretch of the place below (its 9 rolling to 0)
    const below = Math.max(0, v) % unit;
    const carry = place === 0 ? below - Math.floor(below) : Math.max(0, Math.min(1, below - (unit - 1)));
    const pos = place === 0 ? Math.max(0, v) % 10 : (whole % 10) + carry;
    return (WH - DH) / 2 - (pos + 1) * DH;
  });
  return (
    <div
      className="relative min-w-0 flex-1 overflow-hidden rounded-[9px]"
      style={{
        maxWidth: 70,
        height: WH,
        background: "linear-gradient(180deg, #0b0b0d 0%, #1a1a1e 30%, #232328 50%, #1a1a1e 70%, #0b0b0d 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04), 0 0 0 1px rgba(0,0,0,.8)",
      }}
    >
      <motion.div style={{ y, opacity: hidden ? 0.32 : 1, transition: "opacity .25s" }}>
        {[9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1].map((n, i) => (
          <div
            key={i}
            className="grid place-items-center text-[50px] font-semibold leading-none tracking-[-0.02em]"
            style={{
              height: DH,
              color: "#f3eee4",
              textShadow: "0 1px 0 rgba(0,0,0,.6)",
            }}
          >
            {n}
          </div>
        ))}
      </motion.div>
      {/* the drum's curve: the digits above and below fall away into the dark, a sheen runs across the middle */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,6,.97) 0%, rgba(5,5,6,.55) 17%, rgba(5,5,6,0) 34%, rgba(255,255,255,.05) 50%, rgba(5,5,6,0) 66%, rgba(5,5,6,.55) 83%, rgba(5,5,6,.97) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.035]" />
    </div>
  );
}

function Ruler({ vm, min, max }: { vm: MotionValue<number>; min: number; max: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(300);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // only the ticks near the value are drawn
  const [c, setC] = useState(Math.round(vm.get()));
  useMotionValueEvent(vm, "change", (v) => {
    const r = Math.round(v / 10) * 10;
    if (r !== c) setC(r);
  });
  const span = Math.ceil(w / TICK / 2) + 12;
  const x = useTransform(vm, (v) => w / 2 - v * TICK);
  const ticks: number[] = [];
  for (let i = Math.max(min, c - span); i <= Math.min(max, c + span); i++) ticks.push(i);
  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div className="absolute inset-y-0 left-0" style={{ x }}>
        {ticks.map((i) => (
          <div key={i} className="absolute top-0" style={{ left: i * TICK }}>
            <div
              className="-translate-x-1/2 rounded-full"
              style={{
                width: i % 10 === 0 ? 1.5 : 1,
                height: i % 10 === 0 ? 12 : i % 5 === 0 ? 9 : 6,
                marginTop: i % 10 === 0 ? 10 : i % 5 === 0 ? 13 : 16,
                background: i % 10 === 0 ? "#1d1d1f" : "rgba(0,0,0,.28)",
              }}
            />
            {i % 10 === 0 && (
              <div className="absolute top-[25px] -translate-x-1/2 text-[10px] font-semibold text-[#6e6e73] tabular-nums">
                {i}
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function Stepper({
  d,
  label,
  disabled,
  onDown,
  onUp,
}: {
  d: string;
  label: string;
  disabled: boolean;
  onDown: () => void;
  onUp: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        onDown();
      }}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!e.repeat) onDown();
        }
      }}
      onKeyUp={onUp}
      // a key pressed into the housing: it sinks and loses its shadow
      whileTap={
        disabled
          ? undefined
          : {
              y: 1.5,
              scale: 0.97,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(0,0,0,.7), 0 0 0 rgba(0,0,0,0)",
            }
      }
      transition={{ type: "spring", stiffness: 700, damping: 26 }}
      className="grid h-[52px] w-[46px] shrink-0 place-items-center rounded-[14px] text-[#f3eee4] outline-none focus-visible:ring-2 focus-visible:ring-[#ff9f0a] disabled:text-white/25"
      style={{
        background: "linear-gradient(180deg, #4a4a51 0%, #34343a 55%, #2b2b30 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 0 0 1px rgba(0,0,0,.7), 0 3px 4px -1px rgba(0,0,0,.55)",
      }}
    >
      <Ico d={d} size={17} />
    </motion.button>
  );
}

function Count({ value, reduce }: { value: number; reduce: boolean }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const a = animate(from.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setShown,
    });
    from.current = value;
    return () => a.stop();
  }, [value, reduce]);
  return <span>{Math.round(shown).toLocaleString("en-US")}</span>;
}
