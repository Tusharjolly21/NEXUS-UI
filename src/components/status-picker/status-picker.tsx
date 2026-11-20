"use client";

/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent as RKeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type PresenceStatus = {
  id: string;
  label: string;
  note: string;
  color: string;
  icon: string;
};
export type StatusPickerProps = {
  name?: string;
  face?: string;
  statuses?: PresenceStatus[];
  value?: string;
  onChange?: (id: string) => void;
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
  chat: "M232 128a104 104 0 0 1-152.88 91.82l-34.05 11.35a16 16 0 0 1-20.24-20.24l11.35-34.05A104 104 0 1 1 232 128",
  target:
    "M229.26 90.4a108 108 0 0 1-177.63 114A108 108 0 0 1 195.41 43.63l20.1-20.11a12 12 0 0 1 17 17l-96 96a12 12 0 1 1-17-17l24-24a36 36 0 1 0 19.76 39.65a12 12 0 0 1 23.53 4.74a60 60 0 1 1-25.73-62l17.23-17.17a84 84 0 1 0 28.46 38a12 12 0 1 1 22.5-8.35Z",
  bell: "M221.84 192a1.85 1.85 0 0 1-3 .28L83.27 43.19a4 4 0 0 1 .8-6A79.55 79.55 0 0 1 129.17 24c43.83.66 78.63 37.1 78.83 80.92c.14 34.88 8.31 61.54 13.82 71a15.89 15.89 0 0 1 .02 16.08m-7.92 18.62a8 8 0 0 1-11.85 10.76L182.62 200h-15.46a40 40 0 0 1-78.41 0H47.91a15.78 15.78 0 0 1-13.59-7.59a16.42 16.42 0 0 1-.09-16.68c5.55-9.73 13.7-36.64 13.7-71.73a79.4 79.4 0 0 1 10.86-40.15L42 45.38a8 8 0 1 1 11.84-10.76ZM150.59 200h-45.27a24 24 0 0 0 45.27 0",
  clock:
    "M128 20a108 108 0 1 0 108 108A108.12 108.12 0 0 0 128 20m0 192a84 84 0 1 1 84-84a84.09 84.09 0 0 1-84 84m68-84a12 12 0 0 1-12 12h-56a12 12 0 0 1-12-12V72a12 12 0 0 1 24 0v44h44a12 12 0 0 1 12 12",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

const STATUSES: PresenceStatus[] = [
  {
    id: "available",
    label: "Available",
    note: "Replies quickly",
    color: "#30c85e",
    icon: I.chat,
  },
  {
    id: "focus",
    label: "Focus",
    note: "Notifications held until 3 pm",
    color: "#ffc400",
    icon: I.target,
  },
  {
    id: "away",
    label: "Away",
    note: "Back in about an hour",
    color: "#8e8e93",
    icon: I.clock,
  },
  {
    id: "dnd",
    label: "Do not disturb",
    note: "Only calls from favourites",
    color: "#ff7a1a",
    icon: I.bell,
  },
];
const FACE =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png";
const SPRING = { type: "spring", stiffness: 500, damping: 34 } as const;
const BTN = 40;
const GAP = 8;

/** letters that sharpen in one after another */
const Blur = ({ text }: { text: string }) => (
  <span aria-hidden style={{ display: "inline-flex", whiteSpace: "pre" }}>
    {[...text].map((ch, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ type: "tween", duration: 0.22, delay: i * 0.018 }}
      >
        {ch}
      </motion.span>
    ))}
  </span>
);

/**
 * A presence dot that opens into its own picker. Press the dot on the avatar and it stretches into a row of
 * statuses; point at one and its name writes itself in above. Pick one and the row folds back into the dot in the
 * new colour, with the line under the name changing to match. Arrow keys move through the statuses and Escape
 * closes without changing anything.
 */
export default function StatusPicker({
  name = "Maya Okafor",
  face = FACE,
  statuses = STATUSES,
  value: valueProp = "available",
  onChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: StatusPickerProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const [value, setValue] = useState(valueProp);
  const [open, setOpen] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const touched = useRef(false);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const dot = useRef<HTMLButtonElement>(null);
  useEffect(() => setValue(valueProp), [valueProp]);
  const cur = useMemo(() => statuses.find((s) => s.id === value) ?? statuses[0], [statuses, value]);
  const hotS = statuses.find((s) => s.id === hot) ?? null;

  const show = (v: boolean) => {
    setOpen(v);
    setHot(null);
    if (v) sfx.whoosh(600, 1500, { dur: 0.18, gain: 0.025 });
  };
  const pick = (id: string) => {
    setValue(id);
    onChange?.(id);
    show(false);
    sfx.note(1175, { dur: 0.12, gain: 0.035 });
    requestAnimationFrame(() => dot.current?.focus());
  };

  useEffect(() => {
    if (open) {
      const i = Math.max(
        0,
        statuses.findIndex((s) => s.id === value),
      );
      requestAnimationFrame(() => btns.current[i]?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onKey = (e: RKeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      show(false);
      dot.current?.focus();
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const n = statuses.length;
    const i = btns.current.findIndex((b) => b === document.activeElement);
    const next = e.key === "ArrowRight" ? (i + 1) % n : (i - 1 + n) % n;
    btns.current[next]?.focus();
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      let k = 1;
      while (ok()) {
        await wait(1500);
        if (!ok()) break;
        show(true);
        await wait(500);
        const target = statuses[k % statuses.length];
        for (let j = 0; j <= statuses.indexOf(target); j++) {
          if (!ok()) break;
          setHot(statuses[j].id);
          sfx.tick({ freq: 2400, gain: 0.012 });
          await wait(520);
        }
        if (!ok()) break;
        await wait(350);
        pick(target.id);
        k++;
      }
    })().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  const trayW = statuses.length * BTN + (statuses.length - 1) * GAP + 12;

  return (
    <div
      className={`w-full ${className}`}
      style={{ maxWidth: 400, fontFamily: font }}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={onKey}
    >
      <div
        style={{
          position: "relative",
          height: 320,
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#1d1d1f",
        }}
      >
        {open && (
          <div aria-hidden onClick={() => show(false)} style={{ position: "absolute", inset: 0, borderRadius: 28 }} />
        )}
        <LayoutGroup id={uid}>
          <div style={{ position: "relative", width: 112, height: 112 }}>
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: 999,
                background: "radial-gradient(circle at 50% 35%, #f4f1ff, #e7ecf7)",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                boxShadow: "0 18px 30px -18px rgba(0,0,0,0.4)",
              }}
            >
              <img src={face} alt={name} width={84} height={84} draggable={false} style={{ marginTop: 10 }} />
            </div>

            {/* the closed dot */}
            {!open && (
              <motion.button
                ref={dot}
                layoutId="tray"
                type="button"
                aria-haspopup="true"
                aria-expanded={false}
                aria-label={`Status: ${cur.label}. Change status`}
                onClick={() => {
                  touched.current = true;
                  show(true);
                }}
                transition={SPRING}
                whileHover={{ scale: 1.08 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                style={{
                  position: "absolute",
                  right: 2,
                  top: 4,
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: "#fff",
                  border: 0,
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px -2px rgba(0,0,0,0.25)",
                  zIndex: 2,
                }}
              >
                <motion.span
                  layoutId={`fill-${cur.id}`}
                  transition={SPRING}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: cur.color,
                    display: "block",
                  }}
                />
              </motion.button>
            )}

            {/* the open tray */}
            {open && (
              <motion.div
                layoutId="tray"
                role="radiogroup"
                aria-label="Status"
                transition={SPRING}
                style={{
                  position: "absolute",
                  left: 95 - trayW / 2,
                  top: 19 - (BTN + 12) / 2,
                  width: trayW,
                  height: BTN + 12,
                  borderRadius: 999,
                  background: "#fff",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 14px 30px -12px rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: GAP,
                  padding: 6,
                  zIndex: 3,
                }}
              >
                {statuses.map((s, i) => {
                  const sel = s.id === value;
                  return (
                    <motion.button
                      key={s.id}
                      ref={(el) => {
                        btns.current[i] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={sel}
                      aria-label={s.label}
                      onClick={() => {
                        touched.current = true;
                        pick(s.id);
                      }}
                      onPointerEnter={() => setHot(s.id)}
                      onPointerLeave={() => setHot(null)}
                      onFocus={() => setHot(s.id)}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: hot === s.id ? 1.1 : 1, opacity: 1 }}
                      transition={{ ...SPRING, delay: hot ? 0 : 0.03 * i }}
                      className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                      style={{
                        position: "relative",
                        width: BTN,
                        height: BTN,
                        borderRadius: 999,
                        border: 0,
                        padding: 0,
                        cursor: "pointer",
                        background: "transparent",
                        display: "grid",
                        placeItems: "center",
                        flex: "none",
                      }}
                    >
                      <motion.span
                        layoutId={`fill-${s.id}`}
                        transition={SPRING}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 999,
                          background: s.color,
                          boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.12), inset 0 4px 8px rgba(255,255,255,0.35)",
                        }}
                      />
                      <span
                        style={{
                          position: "relative",
                          color: "#fff",
                          display: "grid",
                        }}
                      >
                        <Ico d={s.icon} size={18} />
                      </span>
                      {sel && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            inset: -3,
                            borderRadius: 999,
                            boxShadow: `0 0 0 2px #fff, 0 0 0 3.5px ${s.color}`,
                          }}
                        />
                      )}
                    </motion.button>
                  );
                })}
                <AnimatePresence>
                  {hotS && (
                    <motion.span
                      key="tip"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: 4,
                        transition: { duration: 0.12 },
                      }}
                      transition={SPRING}
                      style={{
                        position: "absolute",
                        bottom: BTN + 22,
                        left: 6 + statuses.indexOf(hotS) * (BTN + GAP) + BTN / 2,
                        x: "-50%",
                        height: 32,
                        borderRadius: 999,
                        background: "#fff",
                        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 10px 20px -12px rgba(0,0,0,0.35)",
                        padding: "0 14px",
                        display: "flex",
                        alignItems: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        color: "#1d1d1f",
                      }}
                    >
                      <Blur key={hotS.id} text={hotS.label} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </LayoutGroup>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            position: "relative",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em" }}>{name}</div>
          <div
            aria-live="polite"
            style={{
              height: 20,
              marginTop: 3,
              position: "relative",
              width: 260,
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={cur.id}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ type: "tween", duration: 0.25 }}
                style={{
                  fontSize: 14,
                  color: "#6e6e73",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 9,
                    background: cur.color,
                  }}
                />
                {cur.label}, {cur.note.charAt(0).toLowerCase() + cur.note.slice(1)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
