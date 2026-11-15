"use client";

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SearchKind = "project" | "person" | "doc";
export type SearchItem = {
  id: string;
  kind: SearchKind;
  title: string;
  meta: string;
  /** a photo for a project, a picture of a person (a cut-out works best) */
  image?: string;
  /** the colour behind a person's picture */
  tint?: string;
};
export type SearchModalProps = {
  items?: SearchItem[];
  /** phrases that roll through the empty field */
  hints?: string[];
  onOpen?: (item: SearchItem) => void;
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
  search:
    "M232.49 215.51L185 168a92.12 92.12 0 1 0-17 17l47.53 47.54a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68a68.07 68.07 0 0 1-68-68",
  project:
    "M120 56v48a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16m80-16h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-96 96H56a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m96 0h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16",
  person:
    "M230.93 220a8 8 0 0 1-6.93 4H32a8 8 0 0 1-6.92-12c15.23-26.33 38.7-45.21 66.09-54.16a72 72 0 1 1 73.66 0c27.39 8.95 50.86 27.83 66.09 54.16a8 8 0 0 1 .01 8",
  doc: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 176H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m0-32H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m-8-56V44l44 44Z",
  clock:
    "M136 80v43.47l36.12 21.67a8 8 0 0 1-8.24 13.72l-40-24A8 8 0 0 1 120 128V80a8 8 0 0 1 16 0m-8-48a95.44 95.44 0 0 0-67.92 28.15C52.81 67.51 46.35 74.59 40 82V64a8 8 0 0 0-16 0v40a8 8 0 0 0 8 8h40a8 8 0 0 0 0-16H49c7.15-8.42 14.27-16.35 22.39-24.57a80 80 0 1 1 1.66 114.75a8 8 0 1 0-11 11.64A96 96 0 1 0 128 32",
  enter:
    "M204 32v144a12 12 0 0 1-12 12H77l27.52 27.51a12 12 0 0 1-17 17l-48-48a12 12 0 0 1 0-17l48-48a12 12 0 1 1 17 17L77 164h103V32a12 12 0 0 1 24 0",
  x: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

// Photos: Unsplash (Johny Goerend, Samuel Chenard, David Gavi, Sven). People: Fluent Emoji 3D by Microsoft (MIT).
const DEFAULT_ITEMS: SearchItem[] = [
  {
    id: "p1",
    kind: "project",
    title: "Lofoten field guide",
    meta: "Updated 2 h ago by Ines",
    image: "https://images.unsplash.com/photo-1593378026483-2a1fd46a35bd?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
  {
    id: "p2",
    kind: "project",
    title: "Patagonia trek booking",
    meta: "Updated yesterday",
    image: "https://images.unsplash.com/photo-1546569397-ab326af881f5?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
  {
    id: "p3",
    kind: "project",
    title: "Desert light film",
    meta: "In review",
    image: "https://images.unsplash.com/photo-1506147854445-5a3f534191f8?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
  {
    id: "p4",
    kind: "project",
    title: "Fjord lodge website",
    meta: "Draft, 14 pages",
    image: "https://images.unsplash.com/photo-1721463891748-fc2d7002ee30?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
  {
    id: "u1",
    kind: "person",
    title: "Ines Moreau",
    meta: "Design lead",
    image: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman/Medium/3D/woman_3d_medium.png",
    tint: "#ffe2c4",
  },
  {
    id: "u2",
    kind: "person",
    title: "Tomás Rivera",
    meta: "Photographer, 6 projects",
    image:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
    tint: "#d6e8ff",
  },
  {
    id: "u3",
    kind: "person",
    title: "Kenji Watanabe",
    meta: "Motion, freelance",
    image:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man/Medium-Dark/3D/man_3d_medium-dark.png",
    tint: "#e6dcff",
  },
  {
    id: "u4",
    kind: "person",
    title: "Ana Lindqvist",
    meta: "Producer",
    image:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20blonde%20hair/Light/3D/woman_blonde_hair_3d_light.png",
    tint: "#d7f5e3",
  },
  {
    id: "d1",
    kind: "doc",
    title: "Field guide style sheet",
    meta: "Doc, 32 pages",
  },
  {
    id: "d2",
    kind: "doc",
    title: "Patagonia brief v3",
    meta: "Doc, edited today",
  },
  {
    id: "d3",
    kind: "doc",
    title: "Photo licensing notes",
    meta: "Doc, shared with you",
  },
  { id: "d4", kind: "doc", title: "Trip pricing 2026", meta: "Sheet, 4 tabs" },
];
const SCOPES: { id: "all" | SearchKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "project", label: "Projects" },
  { id: "person", label: "People" },
  { id: "doc", label: "Docs" },
];
const KIND_LABEL: Record<SearchKind, string> = {
  project: "Projects",
  person: "People",
  doc: "Docs",
};

// a forgiving match: the letters in order, scored for runs and word starts
function match(q: string, text: string): { score: number; hits: number[] } | null {
  if (!q) return { score: 0, hits: [] };
  const t = text.toLowerCase();
  const s = q.toLowerCase();
  const direct = t.indexOf(s);
  if (direct >= 0)
    return {
      score: 100 - direct + (direct === 0 || t[direct - 1] === " " ? 40 : 0),
      hits: Array.from({ length: s.length }, (_, i) => direct + i),
    };
  const hits: number[] = [];
  let j = 0;
  let score = 0;
  for (let i = 0; i < t.length && j < s.length; i++) {
    if (t[i] === s[j]) {
      score += hits.length && hits[hits.length - 1] === i - 1 ? 6 : i === 0 || t[i - 1] === " " ? 4 : 1;
      hits.push(i);
      j++;
    }
  }
  return j === s.length ? { score, hits } : null;
}

function Marked({ text, hits }: { text: string; hits: number[] }) {
  const set = new Set(hits);
  return (
    <>
      {[...text].map((ch, i) =>
        set.has(i) ? (
          <mark
            key={i}
            style={{
              background: "linear-gradient(transparent 55%, rgba(10,132,255,0.22) 55%)",
              color: "inherit",
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            {ch}
          </mark>
        ) : (
          <Fragment key={i}>{ch}</Fragment>
        ),
      )}
    </>
  );
}

function Thumb({ it, size }: { it: SearchItem; size: number }) {
  if (it.kind === "person")
    return (
      <span
        style={{
          position: "relative",
          display: "block",
          width: size,
          height: size,
          borderRadius: size / 2,
          background: it.tint ?? "#e8e8ed",
          flexShrink: 0,
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {it.image && (
          <img
            src={it.image}
            alt=""
            decoding="async"
            style={{
              position: "absolute",
              left: "8%",
              bottom: "-6%",
              width: "84%",
              maxWidth: "none",
              height: "auto",
            }}
          />
        )}
      </span>
    );
  if (it.kind === "project" && it.image)
    return (
      <span
        style={{
          display: "block",
          width: size,
          height: size,
          borderRadius: size * 0.26,
          flexShrink: 0,
          overflow: "hidden",
          background: "#dfe3ea",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        <img
          src={it.image}
          alt=""
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </span>
    );
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        background: "#f2f2f5",
        display: "grid",
        placeItems: "center",
        color: "#6e6e73",
        flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      <Ico d={it.kind === "doc" ? I.doc : I.project} size={size * 0.46} />
    </span>
  );
}

/**
 * A search field that drops open into a results card. Focus it (or press Command or Control K anywhere) and the card
 * pours down with a sliding scope control whose counts update live, your recent things as soft cards and suggestions.
 * Type and the results reshuffle smoothly: a featured top result with a big thumbnail, then grouped rows with the
 * matching letters highlighted. Arrow keys move a gliding highlight; Enter opens. The empty field rolls through hints.
 */
export default function SearchModal({
  items = DEFAULT_ITEMS,
  hints = ["Lofoten", "Patagonia brief", "Ines", "pricing"],
  onOpen,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SearchModalProps) {
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
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"all" | SearchKind>("all");
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState<string | null>(null);
  const [hint, setHint] = useState(0);
  const [recent, setRecent] = useState<string[]>(["p1", "u1", "d2"]);
  const touched = useRef(false);

  useEffect(() => {
    if (q || reduce) return;
    const id = window.setInterval(() => setHint((h) => (h + 1) % hints.length), 2600);
    return () => window.clearInterval(id);
  }, [q, hints.length, reduce]);

  // Command or Control K from anywhere
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const scored = useMemo(() => {
    const out: { it: SearchItem; hits: number[]; score: number }[] = [];
    for (const it of items) {
      const m = match(q.trim(), it.title);
      if (m) out.push({ it, hits: m.hits, score: m.score });
    }
    return out.sort((a, b) => b.score - a.score);
  }, [q, items]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: scored.length,
      project: 0,
      person: 0,
      doc: 0,
    };
    scored.forEach((s) => c[s.it.kind]++);
    return c;
  }, [scored]);
  const shown = useMemo(() => (scope === "all" ? scored : scored.filter((s) => s.it.kind === scope)), [scored, scope]);
  const featured = q.trim() && shown.length ? shown[0] : null;
  const rest = featured ? shown.slice(1) : shown;
  const groups = useMemo(() => {
    const g: Record<string, typeof rest> = {};
    rest.forEach((s) => (g[s.it.kind] ||= []).push(s));
    return (Object.keys(g) as SearchKind[]).map((k) => ({ k, list: g[k] }));
  }, [rest]);
  const flat = useMemo(
    () => (featured ? [featured, ...groups.flatMap((g) => g.list)] : groups.flatMap((g) => g.list)),
    [featured, groups],
  );
  const recentItems = recent.map((id) => items.find((i) => i.id === id)).filter(Boolean) as SearchItem[];

  useEffect(() => setActive(0), [q, scope]);

  const choose = (it: SearchItem) => {
    setOpened(it.id);
    setRecent((r) => [it.id, ...r.filter((x) => x !== it.id)].slice(0, 3));
    sfx.note(660, { dur: 0.15, gain: 0.05 });
    sfx.note(990, { at: 0.08, dur: 0.35, gain: 0.05, bell: 0.6 });
    onOpen?.(it);
    window.setTimeout(() => {
      setOpened(null);
      setOpen(false);
      setQ("");
      input.current?.blur();
    }, 900);
  };

  const onKey = (e: RKeyboardEvent<HTMLInputElement>) => {
    touched.current = true;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
      sfx.tick({ freq: 2000, gain: 0.025 });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
      sfx.tick({ freq: 1800, gain: 0.025 });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = flat[active]?.it;
      if (it) choose(it);
    } else if (e.key === "Escape") {
      setOpen(false);
      input.current?.blur();
    } else if (e.key === "Tab" && open) {
      e.preventDefault();
      const i = SCOPES.findIndex((s) => s.id === scope);
      setScope(SCOPES[(i + (e.shiftKey ? SCOPES.length - 1 : 1)) % SCOPES.length].id);
    }
  };

  // autoplay: open, type a query a letter at a time, walk down the results, clear and try another
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      await wait(1000);
      // the first few letters of the hints, so it searches for things that exist
      const queries = hints.slice(0, 3).map((h) => h.slice(0, 4).toLowerCase());
      let k = 0;
      while (alive && !touched.current) {
        setOpen(true);
        await wait(900);
        const word = queries[k++ % queries.length];
        for (let i = 1; i <= word.length; i++) {
          if (!alive || touched.current) return;
          setQ(word.slice(0, i));
          sfx.tick({ freq: 2400, gain: 0.02 });
          await wait(170);
        }
        await wait(900);
        for (let i = 0; i < 2; i++) {
          if (!alive || touched.current) return;
          setActive((a) => a + 1);
          await wait(550);
        }
        if (k % 2 === 0) {
          setScope("person");
          await wait(900);
          setScope("all");
        }
        await wait(800);
        if (!alive || touched.current) return;
        setQ("");
        setOpen(false);
        await wait(1200);
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  let rowIndex = featured ? 1 : 0;
  const row = (s: { it: SearchItem; hits: number[] }, idx: number) => {
    const on = idx === active;
    return (
      <motion.button
        key={s.it.id}
        layout
        type="button"
        role="option"
        id={`${uid}-o-${idx}`}
        aria-selected={on}
        initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 40,
          filter: { duration: 0.2 },
        }}
        onPointerEnter={() => setActive(idx)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(s.it)}
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "8px 10px",
          borderRadius: 14,
          border: 0,
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {on && (
          <motion.span
            layoutId={`${uid}-hl`}
            transition={{ type: "spring", stiffness: 600, damping: 44 }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              background: "#f2f2f5",
            }}
          />
        )}
        <span style={{ position: "relative" }}>
          <Thumb it={s.it} size={32} />
        </span>
        <span style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontSize: 14,
              color: "#1d1d1f",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <Marked text={s.it.title} hits={s.hits} />
          </span>
          <span style={{ display: "block", fontSize: 12, color: "#86868b" }}>{s.it.meta}</span>
        </span>
        <AnimatePresence>
          {on && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              style={{ position: "relative", color: "#86868b" }}
            >
              {opened === s.it.id ? (
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0a84ff" }}>Opening</span>
              ) : (
                <Ico d={I.enter} size={14} />
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div
      className={`relative w-full rounded-[24px] ${className}`}
      style={{
        minHeight: 560,
        padding: "36px 16px",
        background: "radial-gradient(90% 60% at 50% 0%, #ffffff, #f2f2f4 70%)",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        justifyItems: "center",
        alignContent: "start",
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        style={{
          width: "min(100%, 520px)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(1.6)",
          WebkitBackdropFilter: "blur(20px) saturate(1.6)",
          borderRadius: open ? 26 : 22,
          boxShadow: open
            ? "0 0 0 1px rgba(0,0,0,0.06), 0 40px 80px -36px rgba(20,30,60,0.45)"
            : "0 0 0 1px rgba(0,0,0,0.06), 0 10px 26px -16px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* the field */}
        <motion.div
          layout="position"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 54,
            padding: "0 14px 0 16px",
          }}
        >
          <motion.span
            animate={{
              scale: q ? 0.92 : 1,
              color: open ? "#0a84ff" : "#86868b",
            }}
            style={{ display: "grid" }}
          >
            <Ico d={I.search} size={18} />
          </motion.span>
          <div style={{ position: "relative", flex: 1, height: "100%" }}>
            <input
              ref={input}
              value={q}
              onChange={(e) => {
                touched.current = true;
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                if (!open) sfx.whoosh(400, 1100, { dur: 0.3, gain: 0.03 });
                setOpen(true);
              }}
              onBlur={() => window.setTimeout(() => !input.current?.matches(":focus") && setOpen(false), 160)}
              onKeyDown={onKey}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${uid}-list`}
              aria-activedescendant={open && flat.length ? `${uid}-o-${active}` : undefined}
              aria-label="Search projects, people and docs"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                border: 0,
                outline: "none",
                background: "transparent",
                fontSize: 16,
                color: "#1d1d1f",
              }}
            />
            {!q && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  pointerEvents: "none",
                  fontSize: 16,
                  color: "#a1a1a6",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                Search for
                <span
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    height: 22,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={hint}
                      initial={{ y: 16, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -16, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                      style={{
                        display: "block",
                        color: "#6e6e73",
                        lineHeight: "22px",
                      }}
                    >
                      &ldquo;{hints[hint]}&rdquo;
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            )}
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {q ? (
              <motion.button
                key="clear"
                type="button"
                aria-label="Clear"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setQ("")}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  border: 0,
                  background: "#e8e8ed",
                  color: "#6e6e73",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <Ico d={I.x} size={10} />
              </motion.button>
            ) : (
              <motion.span
                key="kbd"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", gap: 4 }}
              >
                {["⌘", "K"].map((k) => (
                  <kbd
                    key={k}
                    style={{
                      minWidth: 22,
                      height: 22,
                      padding: "0 5px",
                      borderRadius: 6,
                      background: "#f2f2f5",
                      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.08)",
                      fontSize: 11.5,
                      fontFamily: "inherit",
                      color: "#6e6e73",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </motion.span>
            )}
          </AnimatePresence>
          {/* a sheen runs along the field as you type */}
          {!reduce && q && (
            <motion.span
              key={q.length}
              aria-hidden="true"
              initial={{ x: "-30%", opacity: 0.8 }}
              animate={{ x: "130%", opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: "40%",
                background: "linear-gradient(100deg, transparent, rgba(10,132,255,0.08), transparent)",
                pointerEvents: "none",
              }}
            />
          )}
        </motion.div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  padding: "10px 10px 12px",
                }}
              >
                {/* scopes */}
                <LayoutGroup id={`${uid}-scope`}>
                  <div
                    role="tablist"
                    aria-label="Search in"
                    style={{
                      display: "flex",
                      gap: 2,
                      padding: 3,
                      borderRadius: 14,
                      background: "#f2f2f5",
                      margin: "0 4px 10px",
                    }}
                  >
                    {SCOPES.map((s) => {
                      const on = scope === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={on}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            touched.current = true;
                            setScope(s.id);
                            sfx.tick({ freq: 1600, gain: 0.03 });
                          }}
                          style={{
                            position: "relative",
                            flex: 1,
                            height: 32,
                            border: 0,
                            background: "transparent",
                            borderRadius: 11,
                            fontSize: 13,
                            fontWeight: 600,
                            color: on ? "#1d1d1f" : "#6e6e73",
                            cursor: "pointer",
                          }}
                        >
                          {on && (
                            <motion.span
                              layoutId={`${uid}-sc`}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 36,
                              }}
                              style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 11,
                                background: "#fff",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 4px 10px -6px rgba(0,0,0,0.25)",
                              }}
                            />
                          )}
                          <span
                            style={{
                              position: "relative",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {s.label}
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span
                                key={counts[s.id]}
                                initial={{ y: 8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -8, opacity: 0 }}
                                style={{
                                  fontSize: 11,
                                  color: "#a1a1a6",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {counts[s.id]}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>
                <LayoutGroup id={`${uid}-res`}>
                  <div
                    id={`${uid}-list`}
                    role="listbox"
                    aria-label="Results"
                    style={{
                      maxHeight: 360,
                      overflowY: "auto",
                      scrollbarWidth: "none",
                    }}
                  >
                    {!q.trim() ? (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            color: "#86868b",
                            padding: "2px 8px 8px",
                          }}
                        >
                          <Ico d={I.clock} size={13} /> Recent
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 8,
                            padding: "0 4px 10px",
                          }}
                        >
                          {recentItems.map((it, i) => (
                            <motion.button
                              key={it.id}
                              layout
                              type="button"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.05 + i * 0.05 },
                              }}
                              whileHover={{ y: -2 }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => choose(it)}
                              style={{
                                border: 0,
                                borderRadius: 16,
                                padding: 10,
                                background: "#f7f7f9",
                                textAlign: "left",
                                cursor: "pointer",
                                display: "grid",
                                gap: 8,
                                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
                              }}
                            >
                              <Thumb it={it} size={30} />
                              <span
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: "#1d1d1f",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {it.title}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#86868b",
                            padding: "2px 8px 4px",
                          }}
                        >
                          Suggested
                        </div>
                        {flat.slice(0, 4).map((s, i) => row(s, i))}
                      </div>
                    ) : shown.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ padding: "26px 10px", textAlign: "center" }}
                      >
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#1d1d1f",
                          }}
                        >
                          Nothing called &ldquo;{q}&rdquo;
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#86868b",
                            marginTop: 4,
                          }}
                        >
                          Try fewer letters, or look in All.
                        </div>
                      </motion.div>
                    ) : (
                      <AnimatePresence mode="popLayout" initial={false}>
                        {featured && (
                          <motion.button
                            key={"f" + featured.it.id}
                            layout
                            type="button"
                            role="option"
                            id={`${uid}-o-0`}
                            aria-selected={active === 0}
                            initial={{
                              opacity: 0,
                              scale: 0.97,
                              filter: "blur(6px)",
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              filter: "blur(0px)",
                            }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 34,
                              filter: { duration: 0.25 },
                            }}
                            onPointerEnter={() => setActive(0)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => choose(featured.it)}
                            style={{
                              position: "relative",
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              padding: 10,
                              marginBottom: 6,
                              borderRadius: 18,
                              border: 0,
                              cursor: "pointer",
                              textAlign: "left",
                              background: active === 0 ? "#f2f2f5" : "#fafafb",
                              boxShadow:
                                active === 0
                                  ? "inset 0 0 0 1.5px rgba(10,132,255,0.35)"
                                  : "inset 0 0 0 1px rgba(0,0,0,0.04)",
                              transition: "background 0.2s, box-shadow 0.2s",
                            }}
                          >
                            <span
                              style={{
                                position: "relative",
                                width: 64,
                                height: 64,
                                borderRadius: featured.it.kind === "person" ? 32 : 16,
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              <Thumb it={featured.it} size={64} />
                              <span
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(160deg, rgba(255,255,255,0.35), transparent 50%)",
                                }}
                              />
                            </span>
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  color: "#0a84ff",
                                }}
                              >
                                Top result in {KIND_LABEL[featured.it.kind]}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 17,
                                  fontWeight: 600,
                                  letterSpacing: "-0.02em",
                                  color: "#1d1d1f",
                                  marginTop: 1,
                                }}
                              >
                                <Marked text={featured.it.title} hits={featured.hits} />
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 12.5,
                                  color: "#86868b",
                                }}
                              >
                                {featured.it.meta}
                              </span>
                            </span>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                height: 30,
                                padding: "0 12px",
                                borderRadius: 15,
                                background: "#1d1d1f",
                                color: "#fff",
                                fontSize: 12.5,
                                fontWeight: 600,
                              }}
                            >
                              {opened === featured.it.id ? "Opening" : "Open"}
                            </span>
                          </motion.button>
                        )}
                        {groups.map((g) => (
                          <motion.div
                            key={g.k}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                color: "#86868b",
                                padding: "8px 10px 4px",
                              }}
                            >
                              {KIND_LABEL[g.k]}
                            </div>
                            {g.list.map((s) => row(s, rowIndex++))}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </LayoutGroup>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "10px 10px 0",
                    borderTop: "1px solid rgba(0,0,0,0.05)",
                    marginTop: 6,
                    fontSize: 11.5,
                    color: "#a1a1a6",
                  }}
                >
                  <span>Arrows to move</span>
                  <span>Enter to open</span>
                  <span>Tab to change scope</span>
                  <span style={{ marginLeft: "auto" }}>Esc to close</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
