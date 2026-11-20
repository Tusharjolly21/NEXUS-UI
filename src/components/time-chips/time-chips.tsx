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
    requestAnimationFrame(() => list.current?.focus());
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
      if (e.key === "Escape") btn.current?.focus();
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
