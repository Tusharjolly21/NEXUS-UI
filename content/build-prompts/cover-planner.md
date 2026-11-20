# Cover Planner

Add the "Cover Planner" component from Nexus UI to my project.

Approving time off without leaving the team short. Each day is a column of dots, one per person on shift, with the minimum marked. Point at a request and its days light up; approve it and those dots slide out of the shift as the columns re-stack. If a day would fall below the minimum it turns red and shakes, and Suggest dates moves the request to the nearest days that keep everyone covered.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { CoverPlanner } from "@/components/cover-planner";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/cover-planner/cover-planner.tsx ---

```tsx
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
```

--- components/cover-planner/index.ts ---

```ts
export { default as CoverPlanner } from "./cover-planner";
export type { CoverPlannerProps } from "./cover-planner";
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
