"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  type MotionValue,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type MutableRefObject,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DateWheelsProps = {
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** the first and last years on the year wheel */
  minYear?: number;
  maxYear?: number;
  /** A soft tick as each day, month or year passes the lens. They also follow the site-wide sound switch. */
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const H = 38; // a row
const STEP = 19; // degrees between rows on the drum
const R = H / 2 / Math.tan(((STEP / 2) * Math.PI) / 180); // the drum's radius, so rows sit edge to edge
const SPAN = 7; // rows rendered either side of the middle
const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/**
 * A date picker made of three drums: day, month and year.
 *
 * Each is a real cylinder in CSS 3D, its rows curving away and dimming toward the top and bottom. Drag one and let
 * go, and it carries on with your speed and settles on a row with a little spring; scroll it with a wheel or a
 * trackpad, or tap a row to bring it to the middle. A band of glass runs across the middle and the rows inside it are
 * drawn again, larger and dark, as if magnified; each row that passes it ticks softly, each drum at its own pitch.
 * Above, the date is spelt out large, its digits rolling as they change. The day drum shortens to fit the month,
 * and a day that no longer exists slides back to the last one. Up and down arrows, Page Up and Down, Home and End work
 * on each drum.
 *   <DateWheels defaultValue={new Date(1994, 5, 12)} onChange={setBirthday} />
 */
export default function DateWheels({
  defaultValue,
  onChange,
  minYear = 1900,
  maxYear = 2100,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: DateWheelsProps) {
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
  // on a narrow card the drums tighten, the type steps down, and months shorten if there's truly no room
  const [cardW, setCardW] = useState(380);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const compact = cardW < 350;
  const start = useMemo(() => defaultValue ?? new Date(), [defaultValue]);
  const [d, setD] = useState(start.getDate() - 1);
  const [m, setM] = useState(start.getMonth());
  const [y, setY] = useState(Math.min(maxYear, Math.max(minYear, start.getFullYear())));
  // what the drums show as they turn, for the date above (it follows the motion, not just where they stop)
  const [live, setLive] = useState({ d, m, y });
  const cb = useRef(onChange);
  cb.current = onChange;

  const dim = daysIn(y, m);
  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i)),
    [minYear, maxYear],
  );
  const dayLabels = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), []);

  const dayPos = useMotionValue(d),
    monthPos = useMotionValue(m),
    yearPos = useMotionValue(y - minYear);

  // a day past the end of the month slides back to its last day
  useEffect(() => {
    if (d > dim - 1) {
      setD(dim - 1);
      animate(dayPos, dim - 1, reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dim]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    cb.current?.(new Date(y, m, Math.min(d + 1, dim)));
  }, [d, m, y, dim]);

  const goTo = (date: Date) => {
    const ty = Math.min(maxYear, Math.max(minYear, date.getFullYear()));
    const sp = (target: number, mv: MotionValue<number>) =>
      animate(mv, target, reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 16, restDelta: 0.001 });
    sp(ty - minYear, yearPos);
    sp(date.getMonth(), monthPos);
    sp(date.getDate() - 1, dayPos);
    setY(ty);
    setM(date.getMonth());
    setD(date.getDate() - 1);
  };

  // autoplay: the drums turn to a few dates on their own
  useEffect(() => {
    if (!autoplay || !inView) return;
    const picks = [
      new Date(1994, 5, 12),
      new Date(2001, 11, 31),
      new Date(1988, 1, 29),
      new Date(2026, 9, 4),
      new Date(),
    ];
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      goTo(picks[k++ % picks.length]);
    }, 3200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const shown = new Date(live.y, live.m, Math.min(live.d + 1, daysIn(live.y, live.m)));
  const isToday = (() => {
    const t = new Date();
    return t.getFullYear() === y && t.getMonth() === m && t.getDate() === Math.min(d + 1, dim);
  })();

  return (
    <div
      ref={rootRef}
      onPointerDown={() => {
        touched.current = true;
        unlockAudio();
      }}
      className={`w-full max-w-[380px] select-none rounded-[28px] bg-white px-5 pb-5 pt-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_1px_2px_rgba(0,0,0,.04),0_14px_30px_-14px_rgba(0,0,0,.18),0_40px_70px_-44px_rgba(0,0,0,.35)] ${className}`}
      style={{ fontFeatureSettings: '"tnum" 1' }}
    >
      {/* the date, spelt out, its characters rolling as they change */}
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0" aria-live="polite">
          <Roll word text={DAYS[shown.getDay()]} className="text-[13px] font-medium text-[#86868b]" reduce={reduce} />
          <div
            className={`mt-1 flex items-baseline gap-2 font-semibold leading-none tracking-[-0.03em] ${compact ? "text-[23px]" : "text-[30px]"}`}
          >
            <Roll text={String(shown.getDate())} reduce={reduce} />
            <Roll word text={MONTHS[shown.getMonth()]} reduce={reduce} />
            <Roll text={String(shown.getFullYear())} className="font-light text-[#a1a1a6]" reduce={reduce} />
          </div>
        </div>
        <AnimatePresence initial={false}>
          {!isToday && (
            <motion.button
              key="today"
              type="button"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              onClick={() => {
                touched.current = true;
                goTo(new Date());
              }}
              className="mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[13px] font-medium text-[#0071e3] outline-none transition hover:bg-[#0071e3]/10 focus-visible:shadow-[0_0_0_2px_#0071e3]"
            >
              Today
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* the drums */}
      <div className="relative mt-5 flex gap-1" style={{ height: H * 7 }}>
        {/* the glass band across the middle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-[13px]"
          style={{
            height: H + 4,
            background: "linear-gradient(180deg, rgba(0,0,0,.035), rgba(0,0,0,.055))",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.05), inset 0 1px 0 rgba(255,255,255,.9)",
          }}
        />
        <Drum
          label="Day"
          items={dayLabels}
          count={dim}
          pos={dayPos}
          value={d}
          reduce={reduce}
          sfx={sfx}
          pitch={1900}
          width={compact ? "w-[46px]" : "w-[64px]"}
          align="center"
          touched={touched}
          compact={compact}
          onLive={(i) => setLive((l) => ({ ...l, d: i }))}
          onSettle={(i) => setD(i)}
          text={(i) => `${i + 1} ${MONTHS[m]}`}
        />
        <Drum
          label="Month"
          items={cardW < 300 ? MONTHS.map((x) => x.slice(0, 3)) : MONTHS}
          count={12}
          pos={monthPos}
          value={m}
          reduce={reduce}
          sfx={sfx}
          pitch={1500}
          width="flex-1"
          align="left"
          touched={touched}
          compact={compact}
          onLive={(i) => setLive((l) => ({ ...l, m: i }))}
          onSettle={(i) => setM(i)}
          text={(i) => MONTHS[i]}
        />
        <Drum
          label="Year"
          items={years}
          count={years.length}
          pos={yearPos}
          value={y - minYear}
          reduce={reduce}
          sfx={sfx}
          pitch={1150}
          width={compact ? "w-[62px]" : "w-[82px]"}
          align="center"
          touched={touched}
          compact={compact}
          onLive={(i) => setLive((l) => ({ ...l, y: minYear + i }))}
          onSettle={(i) => setY(minYear + i)}
          text={(i) => years[i]}
        />
      </div>
      <p className="mt-3 px-1 text-[12px] text-[#86868b]">Drag or scroll a drum, or tap a row.</p>
    </div>
  );
}

/**
 * text that rolls up or down as it changes, each on its own spring. Numbers roll digit by digit (their digits are
 * all one width, so they stay in their slots); a word rolls whole, because letters of different widths rolling in
 * their own slots would overlap mid-roll, "Wednesday" and "Sunday" spelling "Sundayday" for a moment.
 */
function Roll({ text, className = "", reduce, word = false }: { text: string; className?: string; reduce: boolean; word?: boolean }) {
  const prev = useRef(text);
  const dir = word ? 1 : text >= prev.current ? 1 : -1;
  useEffect(() => {
    prev.current = text;
  }, [text]);
  if (word) {
    return (
      <span className={`relative inline-grid ${className}`} style={{ lineHeight: 1.15, clipPath: "inset(0 -0.3em 0 -0.3em)" }}>
        <AnimatePresence initial={false}>
          <motion.span
            key={text}
            className="col-start-1 row-start-1 inline-block whitespace-pre"
            initial={reduce ? { opacity: 0 } : { y: `${dir * 70}%`, opacity: 0, filter: "blur(3px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { y: `${-dir * 70}%`, opacity: 0, filter: "blur(3px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 34, filter: { duration: 0.2 } }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }
  return (
    <span
      className={`relative inline-flex ${className}`}
      style={{ lineHeight: 1.15, clipPath: "inset(0 -0.3em 0 -0.3em)" }}
    >
      {text.split("").map((ch, i) => (
        <span key={i} className="relative inline-block">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch + i}
              className="inline-block whitespace-pre"
              initial={reduce ? { opacity: 0 } : { y: `${dir * 70}%`, opacity: 0, filter: "blur(3px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { y: `${-dir * 70}%`, opacity: 0, filter: "blur(3px)" }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 34,
                delay: i * 0.012,
                filter: { duration: 0.2 },
              }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

type DrumProps = {
  label: string;
  items: string[];
  /** how many rows can be chosen (the day drum shortens to the month) */
  count: number;
  pos: MotionValue<number>;
  value: number;
  reduce: boolean;
  sfx: Sound;
  pitch: number;
  width: string;
  align: "center" | "left";
  touched: MutableRefObject<boolean>;
  compact: boolean;
  onLive: (i: number) => void;
  onSettle: (i: number) => void;
  text: (i: number) => string;
};

/** one drum: a cylinder of rows that you drag, fling, scroll or tap, settling on the nearest row */
function Drum({
  label,
  items,
  count,
  pos,
  value,
  reduce,
  sfx,
  pitch,
  width,
  align,
  touched,
  compact,
  onLive,
  onSettle,
  text,
}: DrumProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mid, setMid] = useState(Math.round(pos.get()));
  const last = useRef(Math.round(pos.get()));
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const countRef = useRef(count);
  countRef.current = count;
  const clampI = (v: number) => Math.max(0, Math.min(countRef.current - 1, v));

  useMotionValueEvent(pos, "change", (v) => {
    const r = Math.round(v);
    if (r !== last.current) {
      last.current = r;
      setMid(r);
      if (r >= 0 && r < countRef.current) {
        onLive(r);
        sfx.tick({ freq: pitch, gain: 0.018 });
      }
    }
  });

  // where it's heading, so quick presses add up instead of measuring from mid-turn
  const aim = useRef(Math.round(pos.get()));
  // turned from outside (Today, a shorter month, autoplay): aim there too
  useEffect(() => {
    aim.current = value;
  }, [value]);
  const settle = (target: number, velocity = 0) => {
    anim.current?.stop();
    const t = clampI(Math.round(target));
    aim.current = t;
    anim.current = animate(
      pos,
      t,
      reduce
        ? { duration: 0 }
        : {
            type: "spring",
            stiffness: 300,
            damping: 30,
            velocity,
            restDelta: 0.001,
          },
    );
    onSettle(t);
  };
  const fling = (velocity: number) => {
    anim.current?.stop();
    if (reduce) return settle(pos.get());
    // where the hand's speed would carry it, decelerating, snapped to a row; then a spring takes it there starting at
    // exactly that speed, so the hand-off from the finger is seamless and it always comes to rest dead centre
    const target = clampI(Math.round(pos.get() + velocity * 0.26));
    aim.current = target;
    anim.current = animate(pos, target, {
      type: "spring",
      stiffness: 90,
      damping: 19,
      velocity,
      restDelta: 0.001,
    });
    onSettle(target);
  };

  // dragging: rows follow the finger exactly; a little resistance past the ends
  const drag = useRef<{
    y: number;
    p: number;
    t: number;
    v: number;
    moved: boolean;
  } | null>(null);
  const onDown = (e: RPointerEvent) => {
    touched.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    anim.current?.stop();
    drag.current = {
      y: e.clientY,
      p: pos.get(),
      t: performance.now(),
      v: 0,
      moved: false,
    };
    aim.current = Math.round(pos.get());
  };
  const onMove = (e: RPointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const dy = e.clientY - g.y;
    if (Math.abs(dy) > 3) g.moved = true;
    let p = g.p - dy / H;
    const max = countRef.current - 1;
    if (p < 0) p = -Math.pow(-p, 0.6) * 0.6;
    if (p > max) p = max + Math.pow(p - max, 0.6) * 0.6;
    const now = performance.now();
    const dt = Math.max(1, now - g.t);
    g.v = g.v * 0.6 + ((pos.get() - p) / dt) * -1000 * 0.4;
    g.t = now;
    pos.set(p);
  };
  const onUp = (e: RPointerEvent) => {
    const g = drag.current;
    drag.current = null;
    if (!g) return;
    if (!g.moved) {
      // a tap: bring that row to the middle
      const box = ref.current!.getBoundingClientRect();
      const off = (e.clientY - (box.top + box.height / 2)) / H;
      settle(pos.get() + Math.round(off));
      return;
    }
    fling(g.v);
  };
  // a wheel or trackpad turns it a row at a time, and settles when it stops
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let acc = 0,
      timer = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      touched.current = true;
      anim.current?.stop();
      acc += e.deltaY;
      const rows = acc / 40;
      if (Math.abs(rows) >= 1) {
        const n = Math.trunc(rows);
        acc -= n * 40;
        settle(aim.current + n);
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (acc = 0), 160);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onKey = (e: RKeyboardEvent) => {
    const step = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 }[e.key];
    touched.current = true;
    if (step != null) {
      e.preventDefault();
      settle(aim.current + step);
    } else if (e.key === "Home") {
      e.preventDefault();
      settle(0);
    } else if (e.key === "End") {
      e.preventDefault();
      settle(countRef.current - 1);
    }
  };

  const rows: number[] = [];
  for (let i = Math.max(0, mid - SPAN); i <= Math.min(items.length - 1, mid + SPAN); i++) rows.push(i);
  // the drum fades toward its rims, and leaves a window in the middle where the magnified rows show instead
  const band = H / 2 + 2;
  const mask = `linear-gradient(180deg, transparent 0%, #000 26%, #000 calc(50% - ${band}px), transparent calc(50% - ${band}px), transparent calc(50% + ${band}px), #000 calc(50% + ${band}px), #000 74%, transparent 100%)`;
  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={value + 1}
      aria-valuetext={text(value)}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
      className={`relative h-full cursor-grab touch-none rounded-[13px] outline-none focus-visible:shadow-[0_0_0_2px_#0071e3] active:cursor-grabbing ${width}`}
      style={{ perspective: 520 }}
    >
      {/* the drum, dimmed toward its rims */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {rows.map((i) => (
          <Row key={i} i={i} pos={pos} label={items[i]} off={i >= count} align={align} compact={compact} />
        ))}
      </div>
      {/* the same rows again, magnified and dark, seen only through the glass in the middle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          clipPath: `inset(calc(50% - ${H / 2 + 2}px) 0 calc(50% - ${H / 2 + 2}px) 0)`,
        }}
      >
        {rows.map((i) => (
          <Row key={i} i={i} pos={pos} label={items[i]} off={i >= count} align={align} compact={compact} lens />
        ))}
      </div>
    </div>
  );
}

function Row({
  i,
  pos,
  label,
  off,
  align,
  compact,
  lens,
}: {
  i: number;
  pos: MotionValue<number>;
  label: string;
  off: boolean;
  align: "center" | "left";
  compact: boolean;
  lens?: boolean;
}) {
  const transform = useTransform(pos, (p) => {
    const a = (i - p) * STEP;
    // on a cylinder whose axis sits R behind the glass: pushed back, turned, brought out to the surface
    return `translateZ(${-R}px) rotateX(${-a}deg) translateZ(${R}px) scale(${lens ? 1.1 : 1})`;
  });
  const opacity = useTransform(pos, (p) => {
    const a = Math.abs((i - p) * STEP);
    if (a > 92) return 0;
    return lens ? 1 : 0.3 + 0.7 * Math.cos((a * Math.PI) / 180) * 0.6;
  });
  return (
    <motion.div
      className={`absolute inset-x-0 flex items-center ${align === "center" ? "justify-center" : compact ? "justify-start pl-2" : "justify-start pl-3"} whitespace-nowrap`}
      style={{
        top: "50%",
        height: H,
        marginTop: -H / 2,
        transform,
        opacity: off ? 0 : opacity,
        backfaceVisibility: "hidden",
        fontSize: compact ? (lens ? 18 : 16.5) : lens ? 21 : 19,
        fontWeight: lens ? 600 : 500,
        letterSpacing: "-0.01em",
        color: lens ? "#1d1d1f" : "#6e6e73",
      }}
    >
      {label}
    </motion.div>
  );
}
