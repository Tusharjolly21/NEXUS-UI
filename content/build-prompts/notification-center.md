# Notification Center

Add the "Notification Center" component from Nexus UI to my project.

A notification center: tabs with rolling unread counts and a sliding pill, notices grouped by day on a faint wash until read. Swipe one left and the archive button grows out from under it and clicks into place; the row folds away, with Undo at the foot. Mark all as read sends a wave down the list, a dot popping at a time, and new notices drop in at the top as the bell shakes.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { NotificationCenter } from "@/components/notification-center";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/notification-center/index.ts ---

```ts
export { default as NotificationCenter } from "./notification-center";
export type { NotificationCenterProps } from "./notification-center";
```

--- components/notification-center/notification-center.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/purity, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  type PanInfo,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type NoticeKind = "mention" | "comment" | "follow" | "like" | "invite" | "deploy" | "billing";
export type Notice = {
  id: string;
  kind: NoticeKind;
  /** who did it; leave out for the app itself */
  who?: string;
  /** their picture (a cut-out on a transparent background sits best); without one, their initials */
  avatar?: string;
  /** what they did, after their name */
  text: string;
  /** the thing it's about, shown in bold after the text */
  target?: string;
  /** a line of what they wrote */
  quote?: string;
  /** e.g. "2m" */
  time: string;
  group: "Today" | "Yesterday" | "Earlier";
  read?: boolean;
};

export type NotificationCenterProps = {
  title?: string;
  items?: Notice[];
  onOpen?: (n: Notice) => void;
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
  mention:
    "M128 20a108 108 0 0 0 0 216c22.27 0 45.69-6.73 62.64-18a12 12 0 1 0-13.29-20c-13 8.63-31.89 14-49.35 14a84 84 0 1 1 84-84c0 9.29-1.67 17.08-4.69 21.95c-2.64 4.24-6 6.05-11.31 6.05s-8.67-1.81-11.31-6.05c-3-4.87-4.69-12.66-4.69-21.95V88a12 12 0 0 0-23.49-3.46a52 52 0 1 0 8.86 79.57C172.3 174.3 182.81 180 196 180c24.67 0 40-19.92 40-52A108.12 108.12 0 0 0 128 20m0 136a28 28 0 1 1 28-28a28 28 0 0 1-28 28",
  comment: "M232 128a104 104 0 0 1-152.88 91.82l-34.05 11.35a16 16 0 0 1-20.24-20.24l11.35-34.05A104 104 0 1 1 232 128",
  follow:
    "M256 136a8 8 0 0 1-8 8h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1 0-16h16v-16a8 8 0 0 1 16 0v16h16a8 8 0 0 1 8 8m-112 21.68a68 68 0 1 0-71.9 0c-20.65 6.76-39.23 19.39-54.17 37.17A8 8 0 0 0 24 208h168a8 8 0 0 0 6.13-13.15c-14.95-17.78-33.53-30.41-54.13-37.17",
  like: "M240 102c0 70-103.79 126.66-108.21 129a8 8 0 0 1-7.58 0C119.79 228.66 16 172 16 102a62.07 62.07 0 0 1 62-62c20.65 0 38.73 8.88 50 23.89C139.27 48.88 157.35 40 178 40a62.07 62.07 0 0 1 62 62",
  invite:
    "M208 32h-24v-8a8 8 0 0 0-16 0v8H88v-8a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m-56 128h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1 0-16h16v-16a8 8 0 0 1 16 0v16h16a8 8 0 0 1 0 16M48 80V48h24v8a8 8 0 0 0 16 0v-8h80v8a8 8 0 0 0 16 0v-8h24v32Z",
  deploy:
    "M101.85 191.14C97.34 201 82.29 224 40 224a8 8 0 0 1-8-8c0-42.29 23-57.34 32.86-61.85a8 8 0 0 1 6.64 14.56c-6.43 2.93-20.62 12.36-23.12 38.91c26.55-2.5 36-16.69 38.91-23.12a8 8 0 1 1 14.56 6.64m122-144a16 16 0 0 0-15-15c-12.58-.75-44.73.4-71.4 27.07L88 108.7a8 8 0 0 1-11.33-11.31l26.56-26.57a4 4 0 0 0-2.82-6.82H74.35A15.9 15.9 0 0 0 63 68.68L28.7 103a16 16 0 0 0 9.07 27.16l38.47 5.37l44.21 44.21l5.37 38.49a15.94 15.94 0 0 0 10.78 12.92a16.1 16.1 0 0 0 5.1.83a15.9 15.9 0 0 0 11.3-4.68l34.32-34.3a16 16 0 0 0 4.68-11.35v-26.06a4 4 0 0 0-6.83-2.82l-26.57 26.56a8 8 0 0 1-11.71-.42a8.2 8.2 0 0 1 .6-11.1l49.27-49.27c26.69-26.68 27.84-58.83 27.09-71.42Z",
  billing:
    "M216 40H40a16 16 0 0 0-16 16v152a8 8 0 0 0 11.58 7.15L64 200.94l28.42 14.21a8 8 0 0 0 7.16 0L128 200.94l28.42 14.21a8 8 0 0 0 7.16 0L192 200.94l28.42 14.21A8 8 0 0 0 232 208V56a16 16 0 0 0-16-16m-40 104H80a8 8 0 0 1 0-16h96a8 8 0 0 1 0 16m0-32H80a8 8 0 0 1 0-16h96a8 8 0 0 1 0 16",
  archive:
    "M224 48H32a16 16 0 0 0-16 16v24a16 16 0 0 0 16 16v88a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-88a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m-72 96h-48a8 8 0 0 1 0-16h48a8 8 0 0 1 0 16m72-56H32V64h192z",
  checks:
    "m152.41 88.56l-89.6 88a12 12 0 0 1-16.82 0l-38.4-37.71a12 12 0 0 1 16.82-17.13l30 29.46l81.19-79.74a12 12 0 0 1 16.82 17.12Zm96.15-17a12 12 0 0 0-17-.15l-81.16 79.77l-7.88-7.74a12 12 0 0 0-16.82 17.12l16.29 16a12 12 0 0 0 16.82 0l89.6-88a12 12 0 0 0 .15-16.97Z",
  bell: "M168 224a8 8 0 0 1-8 8H96a8 8 0 1 1 0-16h64a8 8 0 0 1 8 8m53.81-48.06C216.25 166.38 208 139.33 208 104a80 80 0 1 0-160 0c0 35.34-8.26 62.38-13.81 71.94A16 16 0 0 0 48 200h160a16 16 0 0 0 13.8-24.06Z",
  tray: "M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176H48v-40h28.69L96 187.32a15.9 15.9 0 0 0 11.31 4.68h41.38a15.86 15.86 0 0 0 11.31-4.69L179.31 168H208z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const KIND: Record<NoticeKind, { color: string; tab: "mentions" | "updates" | "people" }> = {
  mention: { color: "#0071e3", tab: "mentions" },
  comment: { color: "#bf5af2", tab: "mentions" },
  follow: { color: "#30d158", tab: "people" },
  like: { color: "#ff375f", tab: "people" },
  invite: { color: "#ff9f0a", tab: "people" },
  deploy: { color: "#1d1d1f", tab: "updates" },
  billing: { color: "#5e5ce6", tab: "updates" },
};
const TABS = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "people", label: "People" },
  { id: "updates", label: "Updates" },
] as const;
type Tab = (typeof TABS)[number]["id"];

// faces: Fluent Emoji 3D by Microsoft (MIT)
const ITEMS: Notice[] = [
  {
    id: "n1",
    kind: "mention",
    who: "Hana Sato",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman/Medium/3D/woman_3d_medium.png",
    text: "mentioned you in",
    target: "Q4 launch plan",
    quote: "Can you take the pricing section before Friday?",
    time: "2m",
    group: "Today",
  },
  {
    id: "n2",
    kind: "deploy",
    text: "Production deploy finished:",
    target: "web@2.4.0 is live",
    time: "18m",
    group: "Today",
  },
  {
    id: "n3",
    kind: "follow",
    who: "Leo Park",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
    text: "started following you",
    time: "1h",
    group: "Today",
  },
  {
    id: "n4",
    kind: "invite",
    who: "Ava Singh",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20red%20hair/Light/3D/woman_red_hair_3d_light.png",
    text: "invited you to",
    target: "Design review",
    quote: "Thursday, 3:00 to 3:45 PM",
    time: "3h",
    group: "Today",
  },
  {
    id: "n5",
    kind: "comment",
    who: "Priya Nair",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png",
    text: "replied in",
    target: "Onboarding flow",
    quote: "The new empty states read so much better.",
    time: "Yesterday",
    group: "Yesterday",
    read: true,
  },
  {
    id: "n6",
    kind: "like",
    who: "Sam Rivera",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20curly%20hair/Dark/3D/man_curly_hair_3d_dark.png",
    text: "liked your comment on",
    target: "Motion guidelines",
    time: "Yesterday",
    group: "Yesterday",
    read: true,
  },
  {
    id: "n7",
    kind: "billing",
    text: "Your October invoice is ready.",
    time: "Nov 1",
    group: "Earlier",
    read: true,
  },
  {
    id: "n8",
    kind: "comment",
    who: "Jonas Weber",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20white%20hair/Medium-Light/3D/man_white_hair_3d_medium-light.png",
    text: "commented on",
    target: "Release notes",
    quote: "Shipping this Monday works for us.",
    time: "Oct 30",
    group: "Earlier",
    read: true,
  },
];
// what drops in while the demo runs
const INCOMING: Notice[] = [
  {
    id: "x1",
    kind: "mention",
    who: "Noah Kim",
    text: "mentioned you in",
    target: "Sprint 14",
    quote: "Pairing on the onboarding bug after lunch?",
    time: "now",
    group: "Today",
  },
  {
    id: "x2",
    kind: "like",
    who: "Hana Sato",
    text: "liked",
    target: "your pricing draft",
    time: "now",
    group: "Today",
  },
  {
    id: "x3",
    kind: "deploy",
    text: "Preview ready for",
    target: "feat/billing-page",
    time: "now",
    group: "Today",
  },
];

const AV: [string, string][] = [
  ["#ff9a8b", "#ff6a88"],
  ["#7f7fd5", "#91eae4"],
  ["#f7971e", "#ffd200"],
  ["#43cea2", "#185a9d"],
  ["#c471f5", "#fa71cd"],
  ["#4facfe", "#00c6fb"],
];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const initials = (s: string) =>
  s
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

/**
 * A notification center.
 *
 * Unread notices sit on a faint blue wash with a dot. Tabs filter them (All, Mentions, People, Updates), each with
 * its unread count rolling, and a pill slides between them while the list slides the way you went. Swipe a notice to
 * the left to archive it: the archive button grows out from under it and clicks into place past the point of no
 * return, the row folds away and the rows below close up, and an Undo appears at the foot. Mark all as read sends a
 * wave down the list, each dot popping in turn. New notices drop in at the top as they arrive, the bell giving a
 * little shake. Each row is a button: Enter opens it and marks it read, Delete archives it.
 *   <NotificationCenter items={notices} onOpen={(n) => router.push(n.href)} />
 */
export default function NotificationCenter({
  title = "Notifications",
  items = ITEMS,
  onOpen,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: NotificationCenterProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const touched = useRef(false);
  const [list, setList] = useState<Notice[]>(() => items.map((n) => ({ ...n, read: !!n.read })));
  const [tab, setTab] = useState<Tab>("all");
  const [dir, setDir] = useState(1);
  const [undo, setUndo] = useState<{
    n: Notice;
    at: number;
    key: number;
  } | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [ring, setRing] = useState(0);
  const [sweeping, setSweeping] = useState(false);
  const [ghost, setGhost] = useState<string | null>(null);
  const incoming = useRef(0);

  const shown = useMemo(() => list.filter((n) => tab === "all" || KIND[n.kind].tab === tab), [list, tab]);
  const unread = (t: Tab) => list.filter((n) => !n.read && (t === "all" || KIND[n.kind].tab === t)).length;
  const groups = (["Today", "Yesterday", "Earlier"] as const)
    .map((g) => ({ g, items: shown.filter((n) => n.group === g) }))
    .filter((x) => x.items.length);

  const touch = () => {
    touched.current = true;
  };
  const pickTab = (t: Tab) => {
    if (t === tab) return;
    setDir(TABS.findIndex((x) => x.id === t) > TABS.findIndex((x) => x.id === tab) ? 1 : -1);
    setTab(t);
    sfx.tick({ freq: 2600, gain: 0.04 });
  };
  const open = (n: Notice) => {
    if (!n.read) {
      setList((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      sfx.note(880, { dur: 0.16, gain: 0.05, bell: 0.3 });
    }
    onOpen?.(n);
  };
  const archive = (n: Notice) => {
    setList((l) => l.filter((x) => x.id !== n.id));
    setUndo({ n, at: list.findIndex((x) => x.id === n.id), key: Date.now() });
    sfx.whoosh(1800, 500, { dur: 0.28, gain: 0.05 });
    sfx.note(392, { dur: 0.2, gain: 0.05, at: 0.08, bell: 0.2 });
  };
  const restore = () => {
    if (!undo) return;
    const { n, at } = undo;
    setList((l) => {
      const c = l.slice();
      c.splice(Math.min(at, c.length), 0, n);
      return c;
    });
    setUndo(null);
    sfx.note(659, { dur: 0.22, gain: 0.05 });
  };
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 4200);
    return () => clearTimeout(t);
  }, [undo]);

  // mark all as read: a wave down the list, a dot at a time
  const markAll = () => {
    const ids = shown.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    setSweeping(true);
    ids.forEach((id, k) => {
      setTimeout(
        () => {
          setList((l) => l.map((x) => (x.id === id ? { ...x, read: true } : x)));
          sfx.note(1047 + k * 90, { dur: 0.14, gain: 0.04, bell: 0.4 });
        },
        reduce ? 0 : 70 + k * 85,
      );
    });
    setTimeout(() => setSweeping(false), reduce ? 0 : 70 + ids.length * 85 + 500);
  };
  const arrive = () => {
    const src = INCOMING[incoming.current % INCOMING.length];
    incoming.current++;
    const n = { ...src, id: `${src.id}-${incoming.current}`, read: false };
    setList((l) => [n, ...l]);
    setFresh(n.id);
    setRing((r) => r + 1);
    sfx.note(1319, { dur: 0.3, gain: 0.05, bell: 0.5 });
    sfx.note(1760, { dur: 0.4, gain: 0.04, at: 0.09, bell: 0.5 });
    setTimeout(() => setFresh((f) => (f === n.id ? null : f)), 1400);
  };

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ arrive, pickTab, markAll, setGhost, reset: () => {} });
  ap.current = {
    arrive,
    pickTab,
    markAll,
    setGhost,
    reset: () => {
      setList(items.map((n) => ({ ...n, read: !!n.read })));
      setTab("all");
      setUndo(null);
    },
  };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, f: () => void) => timers.push(setTimeout(() => alive && !touched.current && f(), ms));
    const loop = () => {
      at(1600, () => ap.current.arrive());
      at(3600, () => ap.current.setGhost("n3"));
      at(6400, () => ap.current.pickTab("mentions"));
      at(8200, () => ap.current.pickTab("all"));
      at(9400, () => ap.current.markAll());
      at(12200, () => ap.current.arrive());
      at(14400, () => ap.current.reset());
      at(15200, loop);
    };
    loop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [autoplay, inView, reduce]);

  const allRead = unread(tab) === 0;

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={touch}
      onKeyDownCapture={touch}
      className={`relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
      }}
    >
      <header className="px-4 pb-3 pt-5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <motion.span
              key={ring}
              className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f2f2f4] text-[#1d1d1f]"
              style={{ originY: 0.15 }}
              animate={ring && !reduce ? { rotate: [0, 16, -13, 9, -6, 3, 0] } : undefined}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Ico d={I.bell} size={16} />
              <AnimatePresence>
                {unread("all") > 0 && (
                  <motion.span
                    className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#ff3b30] px-1 text-[10.5px] font-semibold leading-none text-white shadow-[0_0_0_2px_#fff]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                  >
                    <Roll text={String(unread("all"))} reduce={reduce} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
            <h3 className="truncate text-[19px] font-semibold tracking-[-0.022em]">{title}</h3>
          </div>
          <button
            type="button"
            onClick={markAll}
            disabled={allRead}
            aria-label={allRead ? "All read" : "Mark all as read"}
            className="relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-2.5 py-1.5 text-[12.5px] font-medium text-[#0066cc] outline-none transition hover:bg-[#0071e3]/[0.07] disabled:text-[#86868b] disabled:hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={allRead ? "done" : "all"}
                className="flex items-center gap-1.5"
                initial={reduce ? false : { y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              >
                <Ico d={allRead ? I.check : I.checks} size={13} />
                {allRead ? (
                  "All read"
                ) : (
                  <>
                    <span className="sm:hidden">Read all</span>
                    <span className="hidden sm:inline">Mark all as read</span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Filter notifications"
          className="-mx-1 mt-4 flex gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] sm:gap-1"
        >
          {TABS.map((t) => {
            const on = t.id === tab;
            const u = unread(t.id);
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => {
                  touch();
                  pickTab(t.id);
                }}
                onKeyDown={(e) => {
                  const k = TABS.findIndex((x) => x.id === tab);
                  const j =
                    e.key === "ArrowRight"
                      ? (k + 1) % TABS.length
                      : e.key === "ArrowLeft"
                        ? (k + TABS.length - 1) % TABS.length
                        : -1;
                  if (j < 0) return;
                  e.preventDefault();
                  pickTab(TABS[j].id);
                  (e.currentTarget.parentElement?.children[j] as HTMLElement | undefined)?.focus();
                }}
                className={`relative z-0 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[12.5px] sm:gap-1.5 sm:px-3 sm:text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${on ? "text-white" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
              >
                {on && (
                  <motion.span
                    layoutId={`${uid}-tab`}
                    className="absolute inset-0 -z-10 rounded-full bg-[#1d1d1f] shadow-[0_4px_12px_-4px_rgba(0,0,0,.4)]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 36 }}
                  />
                )}
                {t.label}
                <AnimatePresence initial={false}>
                  {u > 0 && (
                    <motion.span
                      className={`grid h-[17px] min-w-[17px] place-items-center rounded-full px-1 text-[10.5px] font-semibold leading-none tabular-nums ${on ? "bg-white/20 text-white" : "bg-black/[0.06] text-[#1d1d1f]"}`}
                      initial={{ scale: 0, width: 0 }}
                      animate={{ scale: 1, width: "auto" }}
                      exit={{ scale: 0, width: 0, marginLeft: -6 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 32,
                      }}
                    >
                      <Roll text={String(u)} reduce={reduce} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </header>

      <div className="relative h-[440px] border-t border-black/[0.05]">
        <div
          className="h-full overflow-y-auto overscroll-contain [scrollbar-width:thin]"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, #000 10px, #000 calc(100% - 28px), transparent)",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={tab}
              custom={dir}
              role="tabpanel"
              aria-label={`${TABS.find((t) => t.id === tab)?.label} notifications`}
              initial={reduce ? false : { opacity: 0, x: 28 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -28 * dir }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="pb-16"
            >
              {groups.length === 0 ? (
                <div className="flex flex-col items-center px-8 pt-24 text-center">
                  <motion.span
                    className="grid h-14 w-14 place-items-center rounded-[18px] bg-[#f5f5f7] text-[#86868b]"
                    initial={reduce ? false : { scale: 0.7, rotate: -8, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  >
                    <Ico d={I.tray} size={26} />
                  </motion.span>
                  <p className="mt-4 text-[15px] font-semibold">You&rsquo;re all caught up</p>
                  <p className="mt-1 text-[13px] text-[#6e6e73]">
                    New {tab === "all" ? "notifications" : TABS.find((t) => t.id === tab)?.label.toLowerCase()} will
                    show up here.
                  </p>
                </div>
              ) : (
                groups.map(({ g, items: gi }) => (
                  <section key={g} aria-label={g}>
                    <motion.h4
                      layout="position"
                      className="sticky top-0 z-20 bg-white/85 px-5 pb-1.5 pt-3 text-[12px] font-semibold text-[#86868b] backdrop-blur-md"
                    >
                      {g}
                    </motion.h4>
                    <ul>
                      <AnimatePresence initial={false}>
                        {gi.map((n) => (
                          <Row
                            key={n.id}
                            n={n}
                            fresh={fresh === n.id}
                            ghost={ghost === n.id}
                            sweeping={sweeping}
                            reduce={reduce}
                            onOpen={() => {
                              touch();
                              open(n);
                            }}
                            onArchive={() => {
                              setGhost(null);
                              archive(n);
                            }}
                            onThreshold={() => sfx.tick({ freq: 1800, gain: 0.06 })}
                          />
                        ))}
                      </AnimatePresence>
                    </ul>
                  </section>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* undo */}
        <AnimatePresence>
          {undo && (
            <motion.div
              key={undo.key}
              role="status"
              className="absolute inset-x-4 bottom-4 z-30 flex items-center gap-3 rounded-[16px] bg-[#1d1d1f] py-2 pl-3.5 pr-2 text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,.55)]"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              <span className="text-white/70">
                <Ico d={I.archive} size={15} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px]">Archived</span>
              <button
                type="button"
                onClick={restore}
                className="rounded-full bg-white/[0.14] px-3 py-1 text-[12.5px] font-semibold outline-none transition hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({
  n,
  fresh,
  ghost,
  sweeping,
  reduce,
  onOpen,
  onArchive,
  onThreshold,
}: {
  n: Notice;
  fresh: boolean;
  ghost: boolean;
  sweeping: boolean;
  reduce: boolean;
  onOpen: () => void;
  onArchive: () => void;
  onThreshold: () => void;
}) {
  const x = useMotionValue(0);
  const ref = useRef<HTMLLIElement>(null);
  const past = useRef(false);
  const LIMIT = 96;
  // the archive button grows out from under the row as it slides, and settles in once past the point of no return
  const reveal = useTransform(x, [0, -LIMIT], [0, 1], { clamp: true });
  const btnScale = useTransform(x, [0, -40, -LIMIT, -LIMIT - 40], [0.4, 0.7, 1, 1.1]);
  const btnOpacity = useTransform(x, [0, -24, -60], [0, 0, 1]);
  const under = useTransform(reveal, [0, 1], ["rgba(255,159,10,0)", "rgba(255,159,10,.16)"]);
  const [armed, setArmed] = useState(false);
  const k = KIND[n.kind];

  useEffect(
    () =>
      x.on("change", (v) => {
        const p = v < -LIMIT;
        if (p !== past.current) {
          past.current = p;
          setArmed(p);
          if (p) onThreshold();
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [x],
  );

  const throwAway = (v = -900) => {
    const w = ref.current?.offsetWidth ?? 420;
    animate(x, -w - 40, {
      type: "spring",
      velocity: v,
      stiffness: 260,
      damping: 32,
      restDelta: 2,
    }).then(onArchive);
  };
  // the demo's pretend swipe: out a little way, a pause, past the line, gone
  useEffect(() => {
    if (!ghost) return;
    let live = true;
    (async () => {
      await animate(x, -54, { type: "spring", stiffness: 220, damping: 24 });
      await new Promise((r) => setTimeout(r, 380));
      if (!live) return;
      await animate(x, -LIMIT - 30, {
        type: "spring",
        stiffness: 220,
        damping: 26,
      });
      await new Promise((r) => setTimeout(r, 260));
      if (live) throwAway(-600);
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghost]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -LIMIT || info.velocity.x < -650) throwAway(Math.min(-400, info.velocity.x));
    else animate(x, 0, { type: "spring", stiffness: 500, damping: 36 });
  };
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      reduce ? onArchive() : throwAway();
    }
  };
  const av = AV[hash(n.who ?? n.kind) % AV.length];

  return (
    <motion.li
      ref={ref}
      layout={reduce ? false : "position"}
      className="relative overflow-hidden"
      initial={fresh && !reduce ? { opacity: 0, y: -26, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1, height: "auto" }}
      exit={
        reduce
          ? { opacity: 0 }
          : {
              opacity: 0,
              height: 0,
              transition: {
                height: { type: "spring", stiffness: 400, damping: 40 },
                opacity: { duration: 0.12 },
              },
            }
      }
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
    >
      {/* what's underneath: the archive action */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-5"
        style={{ backgroundColor: under }}
        aria-hidden="true"
      >
        <motion.span
          className="grid h-10 w-10 place-items-center rounded-full text-white shadow-[0_6px_16px_-6px_rgba(255,159,10,.8)]"
          style={{ scale: btnScale, opacity: btnOpacity }}
          animate={{ backgroundColor: armed ? "#ff9f0a" : "#ffc266" }}
          transition={{ duration: 0.15 }}
        >
          <Ico d={I.archive} size={17} />
        </motion.span>
      </motion.div>

      <motion.div
        drag={reduce ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.9, right: 0.06 }}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={{ x }}
        className="relative bg-white"
      >
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{
            backgroundColor: n.read ? "rgba(0,113,227,0)" : "rgba(0,113,227,.045)",
          }}
          transition={{ duration: sweeping ? 0.35 : 0.25 }}
        />
        {fresh && !reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            style={{
              background: "radial-gradient(120% 140% at 0% 50%, rgba(0,113,227,.16), rgba(0,113,227,0) 70%)",
            }}
          />
        )}
        <div className="group relative flex">
          <button
            type="button"
            onClick={onOpen}
            onKeyDown={onKey}
            aria-label={`${n.read ? "" : "Unread. "}${n.who ? n.who + " " : ""}${n.text}${n.target ? " " + n.target : ""}. ${n.time}. Press Delete to archive.`}
            className="flex min-w-0 flex-1 gap-3 py-3 pl-4 pr-9 text-left sm:pl-5 outline-none focus-visible:bg-[#0071e3]/[0.06] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3]/50"
          >
            <span className="relative mt-0.5 h-9 w-9 shrink-0">
              {n.who ? (
                n.avatar ? (
                  <span
                    className="relative block h-9 w-9 overflow-hidden rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${av[0]}55, ${av[1]}55)`,
                    }}
                  >
                    <img
                      src={n.avatar}
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
                  </span>
                ) : (
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full text-[12.5px] font-semibold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${av[0]}, ${av[1]})`,
                    }}
                  >
                    {initials(n.who)}
                  </span>
                )
              ) : (
                <span
                  className="grid h-9 w-9 place-items-center rounded-[11px] text-white"
                  style={{
                    background: `linear-gradient(160deg, ${k.color === "#1d1d1f" ? "#48484a" : k.color}, ${k.color})`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.25)",
                  }}
                >
                  <Ico d={I[n.kind]} size={17} />
                </span>
              )}
              {n.who && (
                <span
                  className="absolute -bottom-1 -right-1 grid h-[18px] w-[18px] place-items-center rounded-full text-white shadow-[0_0_0_2px_#fff]"
                  style={{ background: k.color }}
                >
                  <Ico d={I[n.kind]} size={10} />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] leading-[1.38] text-[#1d1d1f]">
                {n.who && <b className="font-semibold">{n.who} </b>}
                <span className={n.read ? "text-[#424245]" : ""}>{n.text}</span>
                {n.target && <b className="font-semibold"> {n.target}</b>}
              </span>
              {n.quote && (
                <span className="mt-1 block truncate rounded-[9px] bg-black/[0.035] px-2.5 py-1.5 text-[12.5px] text-[#424245]">
                  {n.quote}
                </span>
              )}
              <span className="mt-1 block text-[12px] text-[#86868b]">{n.time}</span>
            </span>
          </button>
          {/* the unread dot, which pops when it's read */}
          <span className="pointer-events-none absolute right-5 top-[22px]" aria-hidden="true">
            <AnimatePresence>
              {!n.read && (
                <motion.span
                  className="block h-2 w-2 rounded-full bg-[#0071e3] shadow-[0_0_0_3px_rgba(0,113,227,.15)]"
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : {
                          scale: [1, 1.8, 0],
                          opacity: [1, 1, 0],
                          transition: { duration: 0.32, ease: "easeOut" },
                        }
                  }
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                />
              )}
            </AnimatePresence>
          </span>
          {/* for a mouse: archive without swiping */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => (reduce ? onArchive() : throwAway())}
            className="absolute bottom-2.5 right-4 grid h-7 w-7 place-items-center rounded-full bg-white text-[#6e6e73] opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,.08),0_2px_6px_-2px_rgba(0,0,0,.15)] transition hover:text-[#b25000] group-hover:opacity-100"
          >
            <Ico d={I.archive} size={13} />
          </button>
        </div>
      </motion.div>
    </motion.li>
  );
}

/** a number whose digits roll on drums to their new values, places lined up from the right */
function Roll({ text, reduce }: { text: string; reduce: boolean }) {
  const chars = text.split("");
  const len = chars.length;
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 26 };
  return (
    <span
      className="inline-flex items-start align-top tabular-nums"
      style={{ height: "1.1em", lineHeight: "1.1em" }}
      aria-hidden="true"
    >
      {chars.map((c, i) => (
        <span
          key={`${len - i}`}
          className="relative inline-block overflow-hidden"
          style={{ height: "1.1em", lineHeight: "1.1em" }}
        >
          <span className="invisible">0</span>
          <motion.span
            className="absolute left-0 top-0 flex flex-col"
            initial={false}
            animate={{ y: `${-+c * 10}%` }}
            transition={spring}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
              <span key={k} style={{ height: "1.1em" }}>
                {k}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
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
