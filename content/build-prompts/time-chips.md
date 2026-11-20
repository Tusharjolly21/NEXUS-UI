# Time Chips

Add the "Time Chips" component from Nexus UI to my project.

A chat that reads times in your zone. Every time someone writes is underlined; pick a zone and each one turns over in place to that zone, the words easing to the new width with a small +1 when it lands on another day. Point at a converted time to see how it was written. Auto detect uses your own zone.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { TimeChips } from "@/components/time-chips";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/time-chips/index.ts ---

```ts
export { default as TimeChips } from "./time-chips";
export type { TimeChipsProps } from "./time-chips";
```

--- components/time-chips/time-chips.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type KeyboardEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

/** a part of a message: plain text, or a time written in the sender's zone (minutes after midnight) */
export type ChatPart = string | { at: number; zone?: boolean };
export type ChatMessage = { mine?: boolean; parts: ChatPart[]; sent: string };
export type TimeZoneOption = {
  id: string;
  name: string;
  abbr: string;
  offset: number;
};
export type TimeChipsProps = {
  contact?: string;
  avatar?: string;
  /** the zone the messages were written in */
  from?: { abbr: string; offset: number };
  messages?: ChatMessage[];
  zones?: TimeZoneOption[];
  /** the zone id to start converted to, or "off" */
  defaultZone?: string;
  onZoneChange?: (id: string) => void;
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

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    parts: ["How about ", { at: 600, zone: true }, " tomorrow? Should only need half an hour."],
    sent: "2:55 PM",
  },
  {
    mine: true,
    parts: [{ at: 690, zone: true }, " works for me. I'll bring the updated prototype."],
    sent: "3:02 PM",
  },
  {
    parts: ["Perfect, invite sent. The rest of the team can catch up at ", { at: 840, zone: true }, " on Thursday."],
    sent: "3:10 PM",
  },
  {
    parts: ["Change of plans: would ", { at: 480 }, " or ", { at: 570, zone: true }, " work for you?"],
    sent: "9:42 AM",
  },
];

const DEFAULT_ZONES: TimeZoneOption[] = [
  { id: "ams", name: "Amsterdam", abbr: "CET", offset: 1 },
  { id: "lon", name: "London", abbr: "GMT", offset: 0 },
  { id: "nyc", name: "New York", abbr: "ET", offset: -5 },
  { id: "bom", name: "Mumbai", abbr: "IST", offset: 5.5 },
  { id: "tyo", name: "Tokyo", abbr: "JST", offset: 9 },
];

const fmt = (mins: number) => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
};

/** a time token that changes zone in place: the old words lift away, the new ones rise, and the width eases between */
function TimeToken({
  text,
  original,
  day,
  mine,
  converted,
  reduce,
  onHover,
}: {
  text: string;
  original: string;
  day: string;
  mine: boolean;
  converted: boolean;
  reduce: boolean;
  onHover: (v: boolean) => void;
}) {
  const meas = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (meas.current) setW(meas.current.offsetWidth);
  }, [text, day]);
  const [tip, setTip] = useState(false);
  const show = (v: boolean) => {
    setTip(v);
    onHover(v);
  };
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        verticalAlign: "bottom",
      }}
    >
      <span
        ref={meas}
        aria-hidden="true"
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
          padding: "0 5px",
        }}
      >
        {text}
        {day && <span style={{ fontSize: "0.78em", marginLeft: 3 }}>{day}</span>}
      </span>
      <motion.button
        type="button"
        onPointerEnter={() => show(true)}
        onPointerLeave={() => show(false)}
        onFocus={() => show(true)}
        onBlur={() => show(false)}
        aria-label={converted ? `${text}${day ? `, ${day}` : ""}. Written as ${original}` : original}
        initial={false}
        animate={{
          width: w ?? "auto",
          backgroundColor: converted ? (mine ? "rgba(255,255,255,0.2)" : "rgba(0,113,227,0.1)") : "rgba(0,0,0,0)",
        }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
        className="outline-none focus-visible:ring-2 focus-visible:ring-current"
        style={{
          position: "relative",
          display: "inline-flex",
          justifyContent: "center",
          overflow: "hidden",
          height: "1.38em",
          verticalAlign: "bottom",
          margin: "0 -5px",
          padding: 0,
          border: 0,
          borderRadius: 6,
          fontFamily: "inherit",
          color: "inherit",
          cursor: "default",
          whiteSpace: "nowrap",
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={text + day}
            initial={reduce ? { opacity: 0 } : { y: "70%", opacity: 0, filter: "blur(3px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { y: "-70%", opacity: 0, filter: "blur(3px)" }}
            transition={{
              type: "tween",
              duration: 0.32,
              ease: [0.25, 0.8, 0.3, 1],
            }}
            style={{
              display: "inline-block",
              padding: "0 5px",
              textDecoration: converted ? "none" : "underline",
              textDecorationStyle: "dotted",
              textUnderlineOffset: 3,
              textDecorationColor: mine ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)",
              fontWeight: converted ? 600 : 400,
            }}
          >
            {text}
            {day && (
              <span
                style={{
                  fontSize: "0.78em",
                  marginLeft: 3,
                  opacity: 0.7,
                  fontWeight: 500,
                }}
              >
                {day}
              </span>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <AnimatePresence>
        {tip && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            style={{
              position: "absolute",
              left: "50%",
              bottom: "calc(100% + 6px)",
              x: "-50%",
              zIndex: 5,
              padding: "5px 9px",
              borderRadius: 9,
              background: "#1d1d1f",
              color: "#fff",
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              fontVariantNumeric: "tabular-nums",
              boxShadow: "0 8px 20px -8px rgba(0,0,0,0.4)",
            }}
          >
            {converted ? `Written as ${original}` : "Pick a zone to convert"}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * A chat that reads times in your zone. Every time someone writes ("10 AM PT", "2 PM on Thursday") is underlined;
 * choose a zone from the picker and each one turns over in place to that zone, the bubble easing to the new width and
 * a small "+1" or "-1" when it falls on a different day. Point at a converted time to see how it was written. Auto
 * detect uses the zone this browser is in.
 */
export default function TimeChips({
  contact = "Maya Chen",
  avatar = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman/Medium/3D/woman_3d_medium.png",
  from = { abbr: "PT", offset: -8 },
  messages = DEFAULT_MESSAGES,
  zones = DEFAULT_ZONES,
  defaultZone = "off",
  onZoneChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: TimeChipsProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [zone, setZone] = useState(defaultZone);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  // the browser's own zone, for Auto detect
  const auto = useMemo<TimeZoneOption>(() => {
    if (typeof window === "undefined") return { id: "auto", name: "Auto detect", abbr: "UTC", offset: 0 };
    const offset = -new Date().getTimezoneOffset() / 60;
    let abbr = "";
    try {
      abbr =
        new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
          .formatToParts(new Date())
          .find((p) => p.type === "timeZoneName")?.value ?? "";
    } catch {
      abbr = "";
    }
    return {
      id: "auto",
      name: "Auto detect",
      abbr: abbr || `UTC${offset >= 0 ? "+" : ""}${offset}`,
      offset,
    };
  }, []);
  const options = useMemo(
    () => [{ id: "off", name: "As written", abbr: from.abbr, offset: from.offset }, auto, ...zones],
    [auto, zones, from],
  );
  const current = options.find((o) => o.id === zone) ?? options[0];
  const converted = zone !== "off";

  const choose = (id: string) => {
    setOpen(false);
    if (id === zone) return;
    setZone(id);
    onZoneChange?.(id);
    sfx.whoosh(1400, 3000, { dur: 0.22, gain: 0.03 });
    messages.forEach((_, i) => sfx.tick({ at: 0.04 + i * 0.05, freq: 1900 + i * 140, gain: 0.012 }));
  };

  const show = (p: { at: number; zone?: boolean }) => {
    if (!converted) return { text: `${fmt(p.at)}${p.zone ? ` ${from.abbr}` : ""}`, day: "" };
    const mins = p.at + (current.offset - from.offset) * 60;
    const d = Math.floor(mins / 1440);
    return {
      text: `${fmt(mins)} ${current.abbr}`,
      day: d > 0 ? `+${d}` : d < 0 ? `${d}` : "",
    };
  };

  useEffect(() => {
    if (!open) return;
    const i = Math.max(
      0,
      options.findIndex((o) => o.id === zone),
    );
    setActive(i);
    requestAnimationFrame(() => list.current?.focus({ preventScroll: true }));
    const off = (e: PointerEvent) =>
      !root.current?.querySelector("[data-picker]")?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", off);
    return () => window.removeEventListener("pointerdown", off);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") setActive((a) => Math.min(options.length - 1, a + 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(options.length - 1);
    else if (e.key === "Enter" || e.key === " ") choose(options[active].id);
    else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Escape") btn.current?.focus({ preventScroll: true });
      return;
    } else return;
    e.preventDefault();
  };

  // autoplay: a ghost pointer opens the picker, picks a zone, points at a time, then tries another
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 600) => {
      const c = root.current;
      const el = c?.querySelector(sel);
      if (!c || !el) return;
      const r = el.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      setGhost(true);
      await Promise.all([
        animate(gx, r.left - cb.left + r.width / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
        animate(gy, r.top - cb.top + r.height / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        for (const id of ["ams", "tyo", "off"]) {
          await go("[data-picker] > button");
          if (!ok()) return;
          setOpen(true);
          await wait(500);
          await go(`[data-zone="${id}"]`, 450);
          if (!ok()) return;
          await wait(250);
          choose(id);
          await wait(1800);
          if (!ok()) return;
        }
        setGhost(false);
        await wait(1600);
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  return (
    <div
      ref={root}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
      className={`relative w-full max-w-[440px] ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 16px 14px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <img
            src={avatar}
            alt=""
            width={34}
            height={34}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              background: "#f2f2f7",
              objectFit: "cover",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {contact}
            </div>
            <div style={{ fontSize: 12, color: "#86868b", whiteSpace: "nowrap" }}>Writes in {from.abbr}</div>
          </div>
          <div data-picker style={{ position: "relative" }}>
            <button
              ref={btn}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => {
                setOpen((o) => !o);
                sfx.tick({ freq: 2200, gain: 0.015 });
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 32,
                padding: "0 10px 0 12px",
                borderRadius: 16,
                border: 0,
                background: "#f2f2f7",
                color: "#1d1d1f",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span className="max-[420px]:hidden" style={{ color: "#86868b", fontSize: 13 }}>
                Show in
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {converted ? `${current.id === "auto" ? "my time" : current.name} ${current.abbr}` : "as written"}
              </span>
              <motion.svg
                animate={{ rotate: open ? 180 : 0 }}
                width="12"
                height="12"
                viewBox="0 0 256 256"
                aria-hidden="true"
                style={{ color: "#86868b" }}
              >
                <path
                  d="m216.49 104.49l-80 80a12 12 0 0 1-17 0l-80-80a12 12 0 0 1 17-17L128 159l71.51-71.52a12 12 0 0 1 17 17Z"
                  fill="currentColor"
                />
              </motion.svg>
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  ref={list}
                  role="listbox"
                  tabIndex={-1}
                  aria-label="Show times in"
                  aria-activedescendant={`tz-${options[active]?.id}`}
                  onKeyDown={onListKey}
                  initial={{ opacity: 0, scale: 0.94, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.97,
                    y: -2,
                    transition: { duration: 0.12 },
                  }}
                  transition={{ type: "spring", stiffness: 520, damping: 36 }}
                  className="outline-none"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    zIndex: 10,
                    width: 210,
                    padding: 5,
                    borderRadius: 14,
                    background: "#fff",
                    transformOrigin: "top right",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 18px 40px -14px rgba(0,0,0,0.3)",
                  }}
                >
                  {options.map((o, i) => {
                    const sel = o.id === zone;
                    return (
                      <div
                        key={o.id}
                        id={`tz-${o.id}`}
                        data-zone={o.id}
                        role="option"
                        aria-selected={sel}
                        onPointerEnter={() => setActive(i)}
                        onClick={() => choose(o.id)}
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          height: 34,
                          padding: "0 10px",
                          borderRadius: 9,
                          fontSize: 13.5,
                          cursor: "pointer",
                        }}
                      >
                        {active === i && (
                          <motion.span
                            layoutId="tz-hi"
                            transition={{
                              type: "spring",
                              stiffness: 600,
                              damping: 40,
                            }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              borderRadius: 9,
                              background: "#f2f2f7",
                            }}
                          />
                        )}
                        <span
                          style={{
                            position: "relative",
                            width: 14,
                            color: "#0071e3",
                          }}
                        >
                          {sel && (
                            <svg width="13" height="13" viewBox="0 0 256 256" aria-hidden="true">
                              <path
                                d="m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z"
                                fill="currentColor"
                              />
                            </svg>
                          )}
                        </span>
                        <span style={{ position: "relative", flex: 1 }}>{o.name}</span>
                        <span
                          style={{
                            position: "relative",
                            fontSize: 12,
                            color: "#86868b",
                          }}
                        >
                          {o.abbr}
                        </span>
                        {i === 1 && (
                          <span
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              left: 8,
                              right: 8,
                              bottom: -3,
                              height: 1,
                              background: "rgba(0,0,0,0.06)",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* the thread */}
        <div
          role="log"
          aria-label={`Messages with ${contact}`}
          style={{
            padding: "16px 16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.mine ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "84%",
                  padding: "9px 13px",
                  borderRadius: 18,
                  borderBottomRightRadius: m.mine ? 6 : 18,
                  borderBottomLeftRadius: m.mine ? 18 : 6,
                  background: m.mine ? "#0071e3" : "#f2f2f7",
                  color: m.mine ? "#fff" : "#1d1d1f",
                  fontSize: 14.5,
                  lineHeight: 1.38,
                  letterSpacing: "-0.005em",
                }}
              >
                {m.parts.map((p, j) => {
                  if (typeof p === "string") return <span key={j}>{p}</span>;
                  const s = show(p);
                  return (
                    <TimeToken
                      key={j}
                      text={s.text}
                      day={s.day}
                      original={`${fmt(p.at)} ${from.abbr}`}
                      mine={!!m.mine}
                      converted={converted}
                      reduce={reduce}
                      onHover={(v) => v && sfx.tick({ freq: 2600, gain: 0.008 })}
                    />
                  );
                })}
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "#aeaeb2",
                  marginTop: 3,
                  padding: "0 6px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {m.sent}
              </span>
            </div>
          ))}
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -11,
              top: -11,
              x: gx,
              y: gy,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: "rgba(0,0,0,0.08)",
              boxShadow: "0 0 0 1.5px rgba(0,0,0,0.35), 0 4px 10px -3px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        )}
      </div>
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
