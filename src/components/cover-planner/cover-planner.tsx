"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type CoverPerson = { id: string; name: string };
export type CoverRequest = {
  id: string;
  person: string;
  kind: string;
  days: number[];
  avatar?: string;
};
export type CoverPlannerProps = {
  team?: string;
  people?: CoverPerson[];
  /** the working days shown, as labels: [weekday letter, date] */
  days?: [string, string][];
  /** full names of the days, for messages */
  dayNames?: string[];
  /** time off already booked: person id to the indexes of the days they're off */
  booked?: Record<string, number[]>;
  requests?: CoverRequest[];
  /** the fewest people that must be on shift each day */
  min?: number;
  onDecide?: (request: CoverRequest, decision: "approved" | "declined" | "offered") => void;
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
  cal: "M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16M72 48v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24v32H48V48Zm136 160H48V96h160z",
  sun: "M240 152h-40.45a74 74 0 0 0 .45-8a72 72 0 0 0-144 0a74 74 0 0 0 .45 8H16a8 8 0 0 0 0 16h224a8 8 0 0 0 0-16m-168-8a56 56 0 1 1 111.41 8H72.59a56 56 0 0 1-.59-8m144 56a8 8 0 0 1-8 8H48a8 8 0 0 1 0-16h160a8 8 0 0 1 8 8M72.84 43.58a8 8 0 0 1 14.32-7.16l8 16a8 8 0 0 1-14.32 7.16Zm-56 48.84a8 8 0 0 1 10.74-3.57l16 8a8 8 0 0 1-7.16 14.31l-16-8a8 8 0 0 1-3.58-10.74m192 15.16a8 8 0 0 1 3.58-10.73l16-8a8 8 0 1 1 7.16 14.31l-16 8a8 8 0 0 1-10.74-3.58m-48-55.16l8-16a8 8 0 0 1 14.32 7.16l-8 16a8 8 0 1 1-14.32-7.16",
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

const FACE = {
  sara: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png",
  tom: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20white%20hair/Medium-Light/3D/man_white_hair_3d_medium-light.png",
  mateo:
    "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
  lena: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20red%20hair/Light/3D/woman_red_hair_3d_light.png",
  kofi: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man/Medium-Dark/3D/man_3d_medium-dark.png",
};
const DEFAULT_PEOPLE: CoverPerson[] = [
  { id: "sara", name: "Sara Iqbal" },
  { id: "tom", name: "Tom Reyes" },
  { id: "lena", name: "Lena Brandt" },
  { id: "kofi", name: "Kofi Mensah" },
  { id: "priya", name: "Priya Nair" },
  { id: "mateo", name: "Mateo Ruiz" },
  { id: "hana", name: "Hana Sato" },
  { id: "aisha", name: "Aisha Khan" },
];
const DEFAULT_DAYS: [string, string][] = [
  ["M", "16"],
  ["T", "17"],
  ["W", "18"],
  ["T", "19"],
  ["F", "20"],
  ["M", "23"],
  ["T", "24"],
  ["W", "25"],
  ["T", "26"],
  ["F", "27"],
];
const DEFAULT_DAY_NAMES = [
  "Mon 16",
  "Tue 17",
  "Wed 18",
  "Thu 19",
  "Fri 20",
  "Mon 23",
  "Tue 24",
  "Wed 25",
  "Thu 26",
  "Fri 27",
];
const DEFAULT_BOOKED: Record<string, number[]> = {
  lena: [7, 8],
  kofi: [8],
  priya: [2],
};
const DEFAULT_REQUESTS: CoverRequest[] = [
  {
    id: "r1",
    person: "sara",
    kind: "Holiday",
    days: [5, 6, 7],
    avatar: FACE.sara,
  },
  {
    id: "r2",
    person: "tom",
    kind: "Wedding",
    days: [7, 8, 9],
    avatar: FACE.tom,
  },
];

const DOT = 10;
const GAP = 3;
const INK = "#5856d6";
const RED = "#ff3b30";
const range = (names: string[], d: number[]) =>
  d.length === 1 ? names[d[0]] : `${names[d[0]]} to ${names[d[d.length - 1]]}`;
const first = (n: string) => n.split(" ")[0];

type State = "pending" | "approved" | "declined" | "breach" | "offered";

/**
 * Approving time off while keeping a team covered. Every working day is a column of dots, one per person on shift,
 * with a dashed line at the minimum the team needs. Point at a request and the days it asks for light up, the
 * requester's dots on them turning into rings. Approve it and those dots slide up out of the shift, the column
 * re-stacking itself on springs while the lowest cover rolls down. If approving would leave a day short, the day
 * turns red and shakes, the request explains which day breaks the rule, and Suggest dates slides the request to the
 * nearest days that keep everyone covered, offering them back. Point at a column to see who's off.
 */
export default function CoverPlanner({
  team = "Support, EU shift",
  people = DEFAULT_PEOPLE,
  days = DEFAULT_DAYS,
  dayNames = DEFAULT_DAY_NAMES,
  booked = DEFAULT_BOOKED,
  requests: requests0 = DEFAULT_REQUESTS,
  min = 6,
  onDecide,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: CoverPlannerProps) {
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
  const [reqs, setReqs] = useState(
    requests0.map((r) => ({
      ...r,
      state: "pending" as State,
      offered: null as number[] | null,
    })),
  );
  const reqsRef = useRef(reqs);
  reqsRef.current = reqs;
  const [hot, setHot] = useState<string | null>(null);
  const [col, setCol] = useState<number | null>(null);
  const [shake, setShake] = useState<{ k: number; days: number[] } | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const N = days.length;
  const total = people.length;

  // who is off on each day: booked time plus approved requests
  const offFor = (list: typeof reqs) => {
    const o: Set<string>[] = days.map(() => new Set());
    Object.entries(booked).forEach(([p, ds]) => ds.forEach((d) => o[d]?.add(p)));
    list.forEach((r) => r.state === "approved" && r.days.forEach((d) => o[d]?.add(r.person)));
    return o;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const off = useMemo(() => offFor(reqs), [reqs, booked, days]);
  const cover = off.map((s) => total - s.size);
  const lowest = Math.min(...cover);
  const hotReq = reqs.find(
    (r) => r.id === hot && (r.state === "pending" || r.state === "breach" || r.state === "offered"),
  );
  const hotDays = hotReq ? (hotReq.state === "offered" && hotReq.offered ? hotReq.offered : hotReq.days) : [];

  /** the days a request would leave short */
  const shortBy = (r: { person: string; days: number[] }, o = off) =>
    r.days.filter((d) => !o[d].has(r.person) && total - o[d].size - 1 < min);
  /** the nearest run of days of the same length that keeps cover */
  const suggest = (r: { person: string; days: number[] }, o = off) => {
    const n = r.days.length;
    const cover = o.map((x) => total - x.size);
    const start = r.days[0];
    const fits = (s: number) =>
      Array.from({ length: n }, (_, i) => s + i).every(
        (d) => d >= 0 && d < N && (o[d].has(r.person) || cover[d] - 1 >= min),
      );
    for (let k = 1; k < N; k++) {
      for (const s of [start - k, start + k])
        if (s >= 0 && s + n <= N && fits(s)) return Array.from({ length: n }, (_, i) => s + i);
    }
    return null;
  };

  const decide = (id: string, what: "approve" | "decline" | "suggest") => {
    const r = reqsRef.current.find((x) => x.id === id);
    if (!r) return;
    // always from the latest decisions, not the ones this function was made with
    const now = offFor(reqsRef.current);
    if (what === "decline") {
      setReqs((l) => l.map((x) => (x.id === id ? { ...x, state: "declined" } : x)));
      onDecide?.(r, "declined");
      sfx.note(392, { dur: 0.2, gain: 0.035 });
      setHot(null);
      return;
    }
    if (what === "suggest") {
      const s = suggest(r, now);
      if (!s) return;
      setReqs((l) => l.map((x) => (x.id === id ? { ...x, state: "offered", offered: s } : x)));
      onDecide?.({ ...r, days: s }, "offered");
      sfx.whoosh(900, 2600, { dur: 0.4, gain: 0.035 });
      sfx.note(784, { at: 0.2, dur: 0.25, gain: 0.035, bell: 0.5 });
      return;
    }
    const short = shortBy(r, now);
    if (short.length) {
      setReqs((l) => l.map((x) => (x.id === id ? { ...x, state: "breach" } : x)));
      setShake({ k: Date.now(), days: short });
      sfx.note(196, { dur: 0.3, gain: 0.05, type: "triangle" });
      sfx.note(185, { at: 0.12, dur: 0.3, gain: 0.04, type: "triangle" });
      return;
    }
    setReqs((l) => l.map((x) => (x.id === id ? { ...x, state: "approved" } : x)));
    onDecide?.(r, "approved");
    setHot(null);
    r.days.forEach((_, i) => sfx.tick({ at: 0.08 + i * 0.05, freq: 2400 + i * 200, gain: 0.025 }));
    sfx.note(659, { at: 0.12, dur: 0.2, gain: 0.04, bell: 0.4 });
    sfx.note(988, { at: 0.22, dur: 0.35, gain: 0.04, bell: 0.5 });
  };
  useEffect(() => {
    if (!shake) return;
    const t = window.setTimeout(() => setShake(null), 1400);
    return () => window.clearTimeout(t);
  }, [shake]);

  // autoplay: approve one, try another that breaks cover, suggest dates, start over
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 600) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return;
      const r = e.getBoundingClientRect();
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
    const tap = async () => {
      setGhostDown(true);
      await wait(110);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1200);
      while (ok()) {
        await go('[data-row="r1"]');
        setHot("r1");
        await wait(900);
        await go('[data-approve="r1"]', 400);
        await tap();
        decide("r1", "approve");
        await wait(1500);
        if (!ok()) return;
        await go('[data-row="r2"]');
        setHot("r2");
        await wait(900);
        await go('[data-approve="r2"]', 400);
        await tap();
        decide("r2", "approve");
        await wait(1800);
        if (!ok()) return;
        await go('[data-approve="r2"]', 300);
        await tap();
        decide("r2", "suggest");
        await wait(1800);
        if (!ok()) return;
        await go("[data-col='8']", 600);
        setCol(8);
        await wait(1400);
        setCol(null);
        setHot(null);
        setGhost(false);
        await wait(1600);
        setReqs(
          requests0.map((r) => ({
            ...r,
            state: "pending" as State,
            offered: null,
          })),
        );
        await wait(1200);
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

  const colH = total * DOT + (total - 1) * GAP;
  const minY = colH - (min * DOT + (min - 1) * GAP) - GAP / 2;
  const bandDays = hotDays.length ? hotDays : null;
  const colOff = col !== null ? people.filter((p) => off[col].has(p.id)) : [];

  return (
    <div
      className={`relative w-full max-w-[460px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 24px 48px -32px rgba(0,0,0,0.3)",
          padding: "16px 16px 12px",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "#f2f2f5",
              color: "#3a3a3c",
              display: "grid",
              placeItems: "center",
              flex: "none",
            }}
          >
            <Ico d={I.sun} size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              Time off
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "#8e8e93",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {team}, {total} people
            </div>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11.5,
              fontWeight: 500,
              color: "#3a3a3c",
              padding: "5px 9px",
              borderRadius: 8,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            <Ico d={I.cal} size={12} />
            {dayNames[0].split(" ")[1]} – {dayNames[N - 1].split(" ")[1]} Nov
          </span>
        </div>

        {/* lowest cover */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "6px 12px",
            margin: "18px 2px 12px",
          }}
        >
          <div>
            <div style={{ fontSize: 11.5, color: "#8e8e93", marginBottom: 2 }}>Lowest cover</div>
            <div aria-live="polite" style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  height: 34,
                  overflow: "hidden",
                  width: 20,
                }}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={lowest}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 360, damping: 26 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      fontSize: 30,
                      lineHeight: "34px",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      color: lowest < min ? RED : "#1d1d1f",
                    }}
                  >
                    {lowest}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span style={{ fontSize: 13, color: "#aeaeb2", fontWeight: 500 }}>of {total}</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 10px",
              fontSize: 10.5,
              color: "#8e8e93",
              paddingBottom: 4,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: INK,
                }}
              />
              On shift
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  border: `1px dashed ${INK}`,
                  boxSizing: "border-box",
                }}
              />
              Asking
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: "#ececf0",
                }}
              />
              Off
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  width: 12,
                  borderTop: "1px dashed rgba(60,60,67,0.45)",
                }}
              />
              Min {min}
            </span>
          </div>
        </div>

        {/* the dots */}
        <div style={{ position: "relative", padding: "6px 0 0" }} onPointerLeave={() => setCol(null)}>
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: `repeat(${N}, 1fr)`,
              height: colH + 6,
            }}
          >
            {/* the days the request you're looking at would take */}
            <AnimatePresence>
              {bandDays && (
                <motion.div
                  key="band"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    left: `${(bandDays[0] / N) * 100}%`,
                    width: `${(bandDays.length / N) * 100}%`,
                    backgroundColor: hotReq?.state === "breach" ? "rgba(255,59,48,0.07)" : "rgba(0,0,0,0.035)",
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  style={{
                    position: "absolute",
                    top: -6,
                    bottom: -4,
                    borderRadius: 8,
                  }}
                />
              )}
            </AnimatePresence>
            {/* the minimum */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 6 + minY,
                borderTop: "1px dashed rgba(60,60,67,0.3)",
                pointerEvents: "none",
              }}
            />
            {/* the weekend between the two weeks */}
            {N > 5 && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: `${(5 / N) * 100}%`,
                  top: 0,
                  bottom: -26,
                  borderLeft: "1px solid rgba(0,0,0,0.07)",
                  pointerEvents: "none",
                }}
              />
            )}
            <LayoutGroup id={uid}>
              {days.map((_, d) => {
                const short = cover[d] < min || (shake?.days.includes(d) ?? false);
                const order = [...people].sort((a, b) => Number(off[d].has(a.id)) - Number(off[d].has(b.id)));
                return (
                  <motion.div
                    key={d}
                    data-col={d}
                    onPointerEnter={() => setCol(d)}
                    animate={shake?.days.includes(d) && !reduce ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{
                      display: "flex",
                      flexDirection: "column-reverse",
                      alignItems: "center",
                      gap: GAP,
                      paddingTop: 6,
                      borderRadius: 6,
                      background: col === d ? "rgba(0,0,0,0.035)" : "transparent",
                      transition: "background 0.2s",
                    }}
                  >
                    {order.map((p) => {
                      const isOff = off[d].has(p.id);
                      const asking = !isOff && hotReq && hotReq.person === p.id && hotDays.includes(d);
                      const fill = isOff ? "#ececf0" : asking ? "rgba(255,255,255,0)" : short ? RED : INK;
                      return (
                        <motion.span
                          key={p.id}
                          layout={!reduce}
                          layoutId={`${d}-${p.id}`}
                          animate={{
                            backgroundColor: fill,
                            borderColor: asking ? (hotReq?.state === "breach" ? RED : INK) : "rgba(0,0,0,0)",
                            scale: asking && !reduce ? [1, 1.12, 1] : 1,
                          }}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 300,
                              damping: 22,
                              delay: (d % N) * 0.02,
                            },
                            backgroundColor: { duration: 0.3 },
                            scale: asking ? { duration: 1, repeat: Infinity } : { duration: 0.2 },
                          }}
                          style={{
                            width: DOT + 2,
                            height: DOT,
                            borderRadius: 3,
                            flex: "none",
                            border: "1px dashed transparent",
                            boxSizing: "border-box",
                          }}
                        />
                      );
                    })}
                  </motion.div>
                );
              })}
            </LayoutGroup>
            {/* what a column means */}
            <AnimatePresence>
              {col !== null && (
                <motion.div
                  key="tip"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    left: `${((col + 0.5) / N) * 100}%`,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  style={{
                    position: "absolute",
                    top: -48,
                    x: col > N - 3 ? "-88%" : col < 2 ? "-12%" : "-50%",
                    padding: "6px 9px",
                    borderRadius: 8,
                    background: "#1d1d1f",
                    color: "#fff",
                    fontSize: 11,
                    lineHeight: 1.35,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    zIndex: 4,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {dayNames[col]}: {cover[col]} of {total} on shift
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.65)" }}>
                    {colOff.length ? `${colOff.map((p) => first(p.name)).join(" and ")} off` : "Everyone's in"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${N}, 1fr)`,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {days.map(([w, n], d) => (
              <div
                key={d}
                style={{
                  fontSize: 10,
                  lineHeight: 1.35,
                  color: cover[d] < min ? RED : hotDays.includes(d) ? "#1d1d1f" : "#aeaeb2",
                  fontWeight: 500,
                  transition: "color 0.25s",
                }}
              >
                <div>{w}</div>
                <div
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    color: cover[d] < min ? RED : "#3a3a3c",
                  }}
                >
                  {n}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* requests */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#1d1d1f",
            margin: "14px 0 4px",
            paddingTop: 12,
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          Requests{" "}
          <span style={{ color: "#aeaeb2", fontWeight: 500, marginLeft: 4 }}>
            {reqs.filter((r) => r.state === "pending" || r.state === "breach").length || "all handled"}
          </span>
        </div>
        <div role="list">
          {reqs.map((r) => {
            const p = people.find((x) => x.id === r.person);
            const name = p?.name ?? r.person;
            const short = r.state === "breach" ? shortBy(r) : [];
            const active = r.state === "pending" || r.state === "breach";
            return (
              <motion.div
                key={r.id}
                role="listitem"
                data-row={r.id}
                layout={!reduce}
                onPointerEnter={() => setHot(r.id)}
                onPointerLeave={() => setHot((h) => (h === r.id ? null : h))}
                animate={{
                  backgroundColor:
                    r.state === "breach"
                      ? "rgba(255,59,48,0.06)"
                      : hot === r.id && active
                        ? "#f7f7f9"
                        : "rgba(247,247,249,0)",
                  opacity: r.state === "declined" ? 0.45 : 1,
                }}
                transition={{ duration: 0.25 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "6px 10px",
                  padding: "7px 8px",
                  margin: "0 -8px",
                  borderRadius: 12,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    background: "#f2f2f5",
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                  }}
                >
                  {r.avatar && (
                    <img
                      src={r.avatar}
                      alt=""
                      width={21}
                      height={21}
                      draggable={false}
                      style={{ width: 21, height: 21 }}
                    />
                  )}
                </span>
                <div style={{ flex: "1 1 150px", minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {name} <span style={{ color: "#aeaeb2", fontWeight: 400 }}>{r.kind}</span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      height: 16,
                      overflow: "hidden",
                    }}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.div
                        key={r.state}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        style={{
                          fontSize: 11.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: r.state === "breach" ? "#d70015" : "#8e8e93",
                        }}
                      >
                        {r.state === "breach" && short.length
                          ? `Leaves ${cover[short[0]] - 1} on ${short
                              .slice(0, 2)
                              .map((d) => dayNames[d])
                              .join(" and ")}. Minimum is ${min}`
                          : r.state === "offered" && r.offered
                            ? `Offered ${range(dayNames, r.offered)}, waiting for ${first(name)}`
                            : r.state === "approved"
                              ? `${range(dayNames, r.days)}, approved`
                              : r.state === "declined"
                                ? "Declined"
                                : `${range(dayNames, r.days)}, ${r.days.length} day${r.days.length > 1 ? "s" : ""}`}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence mode="popLayout" initial={false}>
                  {active ? (
                    <motion.div
                      key="act"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{
                        display: "flex",
                        gap: 6,
                        flex: "none",
                        marginLeft: "auto",
                      }}
                    >
                      {r.state === "pending" && (
                        <button
                          type="button"
                          onClick={() => {
                            touched.current = true;
                            decide(r.id, "decline");
                          }}
                          onFocus={() => setHot(r.id)}
                          className="outline-none focus-visible:ring-2 focus-visible:ring-[#5856d6]/60"
                          style={{
                            height: 26,
                            padding: "0 8px",
                            borderRadius: 13,
                            border: 0,
                            background: "transparent",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#6e6e73",
                            cursor: "pointer",
                          }}
                        >
                          Decline
                        </button>
                      )}
                      <motion.button
                        type="button"
                        data-approve={r.id}
                        whileTap={{ scale: 0.94 }}
                        onFocus={() => setHot(r.id)}
                        onClick={() => {
                          touched.current = true;
                          decide(r.id, r.state === "breach" ? "suggest" : "approve");
                        }}
                        className="outline-none focus-visible:ring-2 focus-visible:ring-[#5856d6]/60"
                        style={{
                          height: 26,
                          padding: "0 11px",
                          borderRadius: 13,
                          border: 0,
                          background: "#1d1d1f",
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.state === "breach" ? "Suggest dates" : "Approve"}
                      </motion.button>
                    </motion.div>
                  ) : r.state === "approved" ? (
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        height: 24,
                        padding: "0 9px",
                        borderRadius: 12,
                        background: "#eaf7ee",
                        color: "#248a3d",
                        fontSize: 11.5,
                        fontWeight: 600,
                        flex: "none",
                      }}
                    >
                      <Ico d={I.check} size={11} />
                      Approved
                    </motion.span>
                  ) : r.state === "offered" ? (
                    <motion.span
                      key="sent"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 24,
                        padding: "0 9px",
                        borderRadius: 12,
                        background: "#f0f0fb",
                        color: INK,
                        fontSize: 11.5,
                        fontWeight: 600,
                        flex: "none",
                      }}
                    >
                      Sent
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#aeaeb2" }}>
          At least {min} of {total} on shift every weekday
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
