# Message Composer

Add the "Message Composer" component from Nexus UI to my project.

A message box with formatting, @mentions that drop in as chips, photo attachments with an upload ring and a voice-note recorder. Send and the paper plane flies off, or schedule it for the morning.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { MessageComposer } from "@/components/message-composer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/message-composer/index.ts ---

```ts
export { default as MessageComposer } from "./message-composer";
export type { MessageComposerProps } from "./message-composer";
```

--- components/message-composer/message-composer.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/purity, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Person = {
  id: string;
  name: string;
  /** a picture of them; a cut-out on a transparent background sits best on the tint */
  avatar?: string;
  /** the colour behind the picture (or behind their initials, without one) */
  tint: string;
};
export type MessageComposerProps = {
  people?: Person[];
  /** the conversation so far */
  thread?: { from: string; text: string }[];
  /** whoever you are talking to */
  to?: string;
  /** the picture used for sample attachments */
  photos?: { src: string; title: string }[];
  onSend?: (html: string, when: "now" | "later") => void;
  maxHeight?: number;
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
  bold: "M185.08 114.46A48 48 0 0 0 148 36H80a12 12 0 0 0-12 12v152a12 12 0 0 0 12 12h80a52 52 0 0 0 25.08-97.54M92 60h56a24 24 0 0 1 0 48H92Zm68 128H92v-56h68a28 28 0 0 1 0 56",
  italic:
    "M204 56a12 12 0 0 1-12 12h-31.35l-40 120H144a12 12 0 0 1 0 24H64a12 12 0 0 1 0-24h31.35l40-120H112a12 12 0 0 1 0-24h80a12 12 0 0 1 12 12",
  under:
    "M204 224a12 12 0 0 1-12 12H64a12 12 0 0 1 0-24h128a12 12 0 0 1 12 12m-76-28a68.07 68.07 0 0 0 68-68V56a12 12 0 0 0-24 0v72a44 44 0 0 1-88 0V56a12 12 0 0 0-24 0v72a68.07 68.07 0 0 0 68 68",
  list: "M76 64a12 12 0 0 1 12-12h128a12 12 0 0 1 0 24H88a12 12 0 0 1-12-12m140 52H88a12 12 0 0 0 0 24h128a12 12 0 0 0 0-24m0 64H88a12 12 0 0 0 0 24h128a12 12 0 0 0 0-24M44 112a16 16 0 1 0 16 16a16 16 0 0 0-16-16m0-64a16 16 0 1 0 16 16a16 16 0 0 0-16-16m0 128a16 16 0 1 0 16 16a16 16 0 0 0-16-16",
  code: "M71.68 97.22L34.74 128l36.94 30.78a12 12 0 1 1-15.36 18.44l-48-40a12 12 0 0 1 0-18.44l48-40a12 12 0 0 1 15.36 18.44m176 21.56l-48-40a12 12 0 1 0-15.36 18.44L221.26 128l-36.94 30.78a12 12 0 1 0 15.36 18.44l48-40a12 12 0 0 0 0-18.44M164.1 28.72a12 12 0 0 0-15.38 7.18l-64 176a12 12 0 0 0 7.18 15.37a11.8 11.8 0 0 0 4.1.73a12 12 0 0 0 11.28-7.9l64-176a12 12 0 0 0-7.18-15.38",
  aa: "M90.86 50.89a12 12 0 0 0-21.72 0l-64 136a12 12 0 0 0 21.71 10.22L42.44 164h75.12l15.58 33.11a12 12 0 0 0 21.72-10.22ZM53.74 140L80 84.18L106.27 140ZM200 84c-13.85 0-24.77 3.86-32.45 11.48a12 12 0 1 0 16.9 17c3-3 8.26-4.52 15.55-4.52c11 0 20 7.18 20 16v4.39a47.3 47.3 0 0 0-20-4.35c-24.26 0-44 17.94-44 40s19.74 40 44 40a47.2 47.2 0 0 0 22-5.38a12 12 0 0 0 22-6.62v-68c0-22.06-19.74-40-44-40m0 96c-11 0-20-7.18-20-16s9-16 20-16s20 7.18 20 16s-9 16-20 16",
  plus: "M228 128a12 12 0 0 1-12 12h-76v76a12 12 0 0 1-24 0v-76H40a12 12 0 0 1 0-24h76V40a12 12 0 0 1 24 0v76h76a12 12 0 0 1 12 12",
  mic: "M80 128V64a48 48 0 0 1 96 0v64a48 48 0 0 1-96 0m128 0a8 8 0 0 0-16 0a64 64 0 0 1-128 0a8 8 0 0 0-16 0a80.11 80.11 0 0 0 72 79.6V240a8 8 0 0 0 16 0v-32.4a80.11 80.11 0 0 0 72-79.6",
  stop: "M216 56v144a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16",
  send: "M231.4 44.34v.15l-58.2 191.94a15.88 15.88 0 0 1-14 11.51q-.69.06-1.38.06a15.86 15.86 0 0 1-14.42-9.15l-36.4-74.7a4 4 0 0 1 .77-4.58l57.92-57.92a8 8 0 0 0-11.31-11.31l-57.95 57.92a4 4 0 0 1-4.58.77l-74.77-36.39a16 16 0 0 1 2.49-29.8l191.94-58.2h.15a16 16 0 0 1 19.74 19.7",
  caret: "m216.49 104.49l-80 80a12 12 0 0 1-17 0l-80-80a12 12 0 0 1 17-17L128 159l71.51-71.52a12 12 0 0 1 17 17Z",
  clock:
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m64-88a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8V72a8 8 0 0 1 16 0v48h48a8 8 0 0 1 8 8",
  bell: "M53.92 34.62a8 8 0 1 0-11.84 10.76L58.82 63.8A79.6 79.6 0 0 0 48 104c0 35.34-8.26 62.38-13.81 71.94A16 16 0 0 0 48 200h40.8a40 40 0 0 0 78.4 0h15.44l19.44 21.38a8 8 0 1 0 11.84-10.76ZM128 216a24 24 0 0 1-22.62-16h45.24A24 24 0 0 1 128 216m-80-32c7.7-13.24 16-43.92 16-80a63.65 63.65 0 0 1 6.26-27.62L168.09 184Zm166-4.73a8.1 8.1 0 0 1-2.93.55a8 8 0 0 1-7.44-5.08C196.35 156.19 192 129.75 192 104a64 64 0 0 0-95.57-55.69a8 8 0 0 1-7.9-13.91A80 80 0 0 1 208 104c0 35.35 8.05 58.59 10.52 64.88a8 8 0 0 1-4.52 10.37Z",
  x: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
  play: "M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

// pictures: Fluent Emoji 3D by Microsoft (MIT)
const DEFAULT_PEOPLE: Person[] = [
  {
    id: "maya",
    name: "Zara Ahmed",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman/Medium/3D/woman_3d_medium.png",
    tint: "#ffe2c4",
  },
  {
    id: "kenji",
    name: "Kenji Watanabe",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man/Medium-Dark/3D/man_3d_medium-dark.png",
    tint: "#e6dcff",
  },
  {
    id: "ana",
    name: "Ana Lindqvist",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20blonde%20hair/Light/3D/woman_blonde_hair_3d_light.png",
    tint: "#d7f5e3",
  },
  {
    id: "sam",
    name: "Sam Okafor",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20curly%20hair/Dark/3D/man_curly_hair_3d_dark.png",
    tint: "#d6e8ff",
  },
];
const DEFAULT_THREAD = [
  { from: "Zara Ahmed", text: "Did the shots from Saturday come out?" },
  { from: "Zara Ahmed", text: "Need two for the launch post by Friday." },
];

type Att = {
  id: number;
  kind: "photo" | "voice";
  src?: string;
  title: string;
  p: number;
  secs?: number;
  bars?: number[];
};
type Msg = {
  id: number;
  html: string;
  atts: Att[];
  mine: boolean;
  later?: boolean;
};

const initials = (n: string) =>
  n
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

function Face({ p, name, size }: { p?: Person; name: string; size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        width: size,
        height: size,
        borderRadius: size / 2,
        background: p?.tint ?? "#e8e8ed",
        overflow: "hidden",
        flexShrink: 0,
        color: "#1d1d1f",
        fontSize: size * 0.38,
        fontWeight: 700,
      }}
    >
      {p?.avatar ? (
        <img
          src={p.avatar}
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
      ) : (
        initials(name)
      )}
    </span>
  );
}

/**
 * A rich message composer. Aa pours a formatting bar open whose buttons light up for the style under the caret;
 * typing @ opens a list of people to mention, chosen with the arrows and Enter, and they land as chips; photos
 * attach as thumbnails that upload with a ring; the mic records a voice note with a live waveform; the writing area
 * grows with a spring as you write. Send flies the paper plane off and the message rises into the thread; the arrow
 * beside Send schedules it for later instead.
 */
export default function MessageComposer({
  people = DEFAULT_PEOPLE,
  thread = DEFAULT_THREAD,
  to = "Zara Ahmed",
  photos: samplePhotos,
  onSend,
  maxHeight = 200,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: MessageComposerProps) {
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
  const ed = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [msgs, setMsgs] = useState<Msg[]>(() =>
    thread.map((t, i) => ({
      id: i,
      html: t.text,
      atts: [],
      mine: t.from !== to ? true : false,
    })),
  );
  const [fmtOpen, setFmtOpen] = useState(true);
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [empty, setEmpty] = useState(true);
  const [h, setH] = useState(44);
  const [mention, setMention] = useState<{ q: string; i: number } | null>(null);
  const [atts, setAtts] = useState<Att[]>([]);
  const [rec, setRec] = useState<{ t0: number; bars: number[] } | null>(null);
  const [menu, setMenu] = useState(false);
  const [fly, setFly] = useState(0);
  const touched = useRef(false);
  const thr = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    const el = ed.current;
    if (!el) return;
    const text = el.innerText.replace(/​/g, "").trim();
    setEmpty(!text && !el.querySelector("[data-mention]"));
    setH(Math.min(maxHeight, Math.max(44, el.scrollHeight)));
    try {
      setMarks({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        list: document.queryCommandState("insertUnorderedList"),
      });
    } catch {
      /* not supported */
    }
    // a mention in progress: @ followed by letters right before the caret
    const sel = window.getSelection();
    if (sel && sel.anchorNode && sel.anchorNode.nodeType === 3 && el.contains(sel.anchorNode)) {
      const before = (sel.anchorNode.textContent ?? "").slice(0, sel.anchorOffset);
      const m = before.match(/@([\w]*)$/);
      setMention((cur) => (m ? { q: m[1], i: cur && cur.q === m[1] ? cur.i : 0 } : null));
    } else setMention(null);
  }, [maxHeight]);

  useEffect(() => {
    const f = () => {
      if (ed.current && document.activeElement === ed.current) refresh();
    };
    document.addEventListener("selectionchange", f);
    return () => document.removeEventListener("selectionchange", f);
  }, [refresh]);

  useLayoutEffect(() => {
    const t = thr.current;
    if (t) t.scrollTop = t.scrollHeight;
  }, [msgs]);

  const exec = (cmd: string) => {
    touched.current = true;
    ed.current?.focus();
    if (cmd === "code") {
      const sel = window.getSelection();
      const text = sel?.toString() || "code";
      document.execCommand(
        "insertHTML",
        false,
        `<code style="font-family:ui-monospace,Menlo,monospace;font-size:0.9em;background:#f2f2f5;padding:1px 5px;border-radius:5px">${text.replace(/</g, "&lt;")}</code>&#8203;`,
      );
    } else document.execCommand(cmd);
    sfx.tick({ freq: 1800, gain: 0.03 });
    refresh();
  };

  const matches = mention
    ? people.filter((p) => p.name.toLowerCase().includes(mention.q.toLowerCase())).slice(0, 4)
    : [];
  const insertMention = (p: Person) => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !mention) return;
    const node = sel.anchorNode;
    const off = sel.anchorOffset;
    const r = document.createRange();
    r.setStart(node, off - mention.q.length - 1);
    r.setEnd(node, off);
    sel.removeAllRanges();
    sel.addRange(r);
    document.execCommand(
      "insertHTML",
      false,
      `<span data-mention="${p.id}" contenteditable="false" style="display:inline-block;padding:0 7px;margin:0 1px;border-radius:7px;background:rgba(10,132,255,0.1);color:#0a64d6;font-weight:600">@${p.name}</span>&nbsp;`,
    );
    setMention(null);
    sfx.note(880, { dur: 0.12, gain: 0.04 });
    refresh();
  };

  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if (mention && matches.length) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setMention({
          ...mention,
          i: (mention.i + (e.key === "ArrowDown" ? 1 : matches.length - 1)) % matches.length,
        });
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(matches[mention.i]);
        return;
      }
      if (e.key === "Escape") {
        setMention(null);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send("now");
    }
    if ((e.metaKey || e.ctrlKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) window.setTimeout(refresh, 0);
  };

  const addPhoto = () => {
    touched.current = true;
    const list = samplePhotos && samplePhotos.length ? samplePhotos : null;
    const id = Date.now() + Math.random();
    const n = atts.filter((a) => a.kind === "photo").length;
    const src = list ? list[n % list.length].src : undefined;
    setAtts((a) => [
      ...a,
      {
        id,
        kind: "photo",
        src,
        title: list ? list[n % list.length].title : `Photo ${n + 1}`,
        p: 0,
      },
    ]);
    sfx.whoosh(500, 1500, { dur: 0.3, gain: 0.04 });
    let p = 0;
    const step = () => {
      p = Math.min(1, p + 0.06 + Math.random() * 0.08);
      setAtts((a) => a.map((x) => (x.id === id ? { ...x, p } : x)));
      if (p < 1) window.setTimeout(step, 90);
      else sfx.tick({ freq: 2400, gain: 0.04 });
    };
    window.setTimeout(step, 200);
  };

  // recording: a live waveform from a gently random voice (no microphone is opened)
  useEffect(() => {
    if (!rec) return;
    const id = window.setInterval(() => {
      setRec((r) => {
        if (!r) return r;
        const t = (Date.now() - r.t0) / 1000;
        const v = 0.25 + Math.abs(Math.sin(t * 5.3) * 0.45 + Math.sin(t * 13.1) * 0.25) + Math.random() * 0.25;
        return { ...r, bars: [...r.bars.slice(-39), Math.min(1, v)] };
      });
    }, 80);
    return () => window.clearInterval(id);
  }, [rec?.t0]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleRec = () => {
    touched.current = true;
    if (!rec) {
      setRec({ t0: Date.now(), bars: [] });
      sfx.note(880, { dur: 0.12, gain: 0.05 });
      return;
    }
    const secs = Math.max(1, Math.round((Date.now() - rec.t0) / 1000));
    setAtts((a) => [
      ...a,
      {
        id: Date.now(),
        kind: "voice",
        title: "Voice note",
        p: 1,
        secs,
        bars: rec.bars.slice(-28),
      },
    ]);
    setRec(null);
    sfx.note(660, { dur: 0.12, gain: 0.05 });
  };

  const send = (when: "now" | "later") => {
    const el = ed.current;
    if (!el) return;
    if (empty && atts.length === 0) return;
    const html = el.innerHTML;
    setMsgs((m) => [...m, { id: Date.now(), html, atts, mine: true, later: when === "later" }]);
    onSend?.(html, when);
    el.innerHTML = "";
    setAtts([]);
    setMenu(false);
    setFly((f) => f + 1);
    refresh();
    sfx.whoosh(600, 2600, { dur: 0.45, gain: 0.06 });
    sfx.note(1046, { at: 0.12, dur: 0.3, gain: 0.04, bell: 0.6 });
    // a reply comes a moment later
    if (when === "now")
      window.setTimeout(() => {
        setMsgs((m) => [
          ...m,
          {
            id: Date.now() + 1,
            html: ["Perfect, thank you!", "Love the second one.", "On it."][m.length % 3],
            atts: [],
            mine: false,
          },
        ]);
        sfx.note(784, { dur: 0.2, gain: 0.04, bell: 0.5 });
      }, 1700);
  };

  // autoplay: type a message with a mention, attach a photo, send
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const type = async (s: string) => {
      for (const ch of s) {
        if (!alive || touched.current) return false;
        ed.current?.focus();
        document.execCommand("insertText", false, ch);
        refresh();
        await wait(55 + Math.random() * 60);
      }
      return true;
    };
    const run = async () => {
      await wait(1200);
      while (alive && !touched.current) {
        if (!(await type("Here are the shots for "))) return;
        if (!(await type("@ma"))) return;
        await wait(500);
        const p = people.find((x) => x.name.toLowerCase().includes("ma"));
        if (p && !touched.current) insertMention(p);
        if (!(await type("two picks for the post."))) return;
        await wait(400);
        addPhoto();
        await wait(700);
        addPhoto();
        await wait(1800);
        if (!alive || touched.current) return;
        send("now");
        await wait(3800);
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const ready = !empty || atts.length > 0;
  const fmtBtns: { k: string; d: string; label: string; cmd: string }[] = [
    { k: "bold", d: I.bold, label: "Bold", cmd: "bold" },
    { k: "italic", d: I.italic, label: "Italic", cmd: "italic" },
    { k: "underline", d: I.under, label: "Underline", cmd: "underline" },
    {
      k: "list",
      d: I.list,
      label: "Bulleted list",
      cmd: "insertUnorderedList",
    },
    { k: "code", d: I.code, label: "Code", cmd: "code" },
  ];

  const tool = (label: string, d: string, onClick: () => void, on = false) => (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={on}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
      style={{
        position: "relative",
        width: 32,
        height: 32,
        borderRadius: 10,
        border: 0,
        background: "transparent",
        color: on ? "#0a84ff" : "#6e6e73",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
      }}
    >
      {on && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            background: "rgba(10,132,255,0.1)",
          }}
        />
      )}
      <span style={{ position: "relative" }}>
        <Ico d={d} size={16} />
      </span>
    </motion.button>
  );

  return (
    <div
      className={`relative w-full rounded-[24px] ${className}`}
      style={{
        background: "#f2f2f4",
        padding: "24px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        justifyItems: "center",
      }}
    >
      <div style={{ width: "min(100%, 520px)" }}>
        <style>{`.mc-mine-${uid} [data-mention]{background:rgba(255,255,255,0.22)!important;color:#fff!important}.mc-mine-${uid} code{background:rgba(255,255,255,0.2)!important}`}</style>
        {/* the thread */}
        <div
          ref={thr}
          aria-live="polite"
          style={{
            height: 210,
            overflowY: "auto",
            scrollbarWidth: "none",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "6px 2px 14px",
            WebkitMaskImage: "linear-gradient(transparent, #000 28px)",
            maskImage: "linear-gradient(transparent, #000 28px)",
          }}
        >
          <div style={{ flex: 1 }} />
          {msgs.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={
                m.id > 10
                  ? {
                      opacity: 0,
                      y: m.mine ? 60 : 16,
                      scale: m.mine ? 0.9 : 0.96,
                      filter: "blur(4px)",
                    }
                  : false
              }
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
                filter: { duration: 0.3 },
              }}
              style={{
                alignSelf: m.mine ? "flex-end" : "flex-start",
                maxWidth: "78%",
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
                transformOrigin: m.mine ? "100% 100%" : "0% 100%",
              }}
            >
              {!m.mine && <Face p={people.find((x) => x.name === to) ?? people[0]} name={to} size={28} />}
              <div
                style={{
                  display: "grid",
                  gap: 4,
                  justifyItems: m.mine ? "end" : "start",
                }}
              >
                {m.atts.length > 0 && (
                  <div style={{ display: "flex", gap: 4 }}>
                    {m.atts.map((a) =>
                      a.kind === "photo" ? (
                        <span
                          key={a.id}
                          style={{
                            width: 74,
                            height: 74,
                            borderRadius: 14,
                            overflow: "hidden",
                            background: "linear-gradient(135deg,#a1c4fd,#5b8def)",
                          }}
                        >
                          {a.src && (
                            <img
                              src={a.src}
                              alt={a.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </span>
                      ) : (
                        <span
                          key={a.id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            height: 36,
                            padding: "0 12px",
                            borderRadius: 18,
                            background: "#0a84ff",
                            color: "#fff",
                            fontSize: 12,
                          }}
                        >
                          <Ico d={I.play} size={12} />
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              height: 18,
                            }}
                          >
                            {(a.bars ?? []).map((b, i) => (
                              <span
                                key={i}
                                style={{
                                  width: 2,
                                  height: `${Math.max(15, b * 100)}%`,
                                  borderRadius: 1,
                                  background: "rgba(255,255,255,0.85)",
                                }}
                              />
                            ))}
                          </span>
                          0:{String(a.secs).padStart(2, "0")}
                        </span>
                      ),
                    )}
                  </div>
                )}
                {m.html && (
                  <div
                    style={{
                      padding: "8px 13px",
                      borderRadius: 18,
                      borderBottomRightRadius: m.mine ? 6 : 18,
                      borderBottomLeftRadius: m.mine ? 18 : 6,
                      background: m.mine ? "linear-gradient(180deg,#2b95ff,#0a7cff)" : "#fff",
                      color: m.mine ? "#fff" : "#1d1d1f",
                      fontSize: 14,
                      lineHeight: 1.4,
                      boxShadow: m.mine
                        ? "0 6px 14px -8px rgba(10,124,255,0.7)"
                        : "0 0 0 1px rgba(0,0,0,0.04), 0 4px 10px -8px rgba(0,0,0,0.3)",
                    }}
                    // the composer's own markup, written by the person using it
                    className={m.mine ? `mc-mine-${uid}` : undefined}
                    dangerouslySetInnerHTML={{ __html: m.html }}
                  />
                )}
                {m.later && <span style={{ fontSize: 11, color: "#86868b" }}>Scheduled for tomorrow, 9:00</span>}
              </div>
            </motion.div>
          ))}
        </div>
        {/* the composer */}
        <motion.div
          ref={box}
          layout
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 24px 50px -30px rgba(0,0,0,0.4)",
          }}
        >
          <AnimatePresence initial={false}>
            {fmtOpen && (
              <motion.div
                key="fmt"
                role="toolbar"
                aria-label="Formatting"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 44, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
                style={{
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  padding: "0 8px",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {fmtBtns.map((b, i) => (
                  <motion.span
                    key={b.k}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.04 * i },
                    }}
                  >
                    {tool(b.label, b.d, () => exec(b.cmd), !!marks[b.k])}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {/* attachments */}
          <AnimatePresence initial={false}>
            {atts.length > 0 && (
              <motion.div
                key="atts"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "12px 12px 0",
                    flexWrap: "wrap",
                  }}
                >
                  <AnimatePresence>
                    {atts.map((a) => (
                      <motion.div
                        key={a.id}
                        layout
                        initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 26,
                        }}
                        style={{
                          position: "relative",
                          height: 62,
                          minWidth: a.kind === "photo" ? 62 : 150,
                          borderRadius: 14,
                          overflow: "hidden",
                          background: a.kind === "photo" ? "linear-gradient(135deg,#a1c4fd,#5b8def)" : "#f2f2f5",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: a.kind === "voice" ? "0 10px" : 0,
                        }}
                      >
                        {a.kind === "photo" ? (
                          <>
                            {a.src && (
                              <img
                                src={a.src}
                                alt={a.title}
                                style={{
                                  width: 62,
                                  height: 62,
                                  objectFit: "cover",
                                  filter: a.p < 1 ? "saturate(0.4) brightness(0.8)" : "none",
                                  transition: "filter 0.4s",
                                }}
                              />
                            )}
                            {a.p < 1 && (
                              <svg
                                width="26"
                                height="26"
                                viewBox="0 0 26 26"
                                style={{
                                  position: "absolute",
                                  left: 18,
                                  top: 18,
                                }}
                                aria-label={`Uploading ${Math.round(a.p * 100)} percent`}
                              >
                                <circle
                                  cx="13"
                                  cy="13"
                                  r="10"
                                  fill="rgba(0,0,0,0.35)"
                                  stroke="rgba(255,255,255,0.3)"
                                  strokeWidth="2.5"
                                />
                                <circle
                                  cx="13"
                                  cy="13"
                                  r="10"
                                  fill="none"
                                  stroke="#fff"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeDasharray={`${a.p * 62.8} 62.8`}
                                  transform="rotate(-90 13 13)"
                                />
                              </svg>
                            )}
                          </>
                        ) : (
                          <>
                            <span style={{ color: "#0a84ff" }}>
                              <Ico d={I.play} size={14} />
                            </span>
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                height: 22,
                                flex: 1,
                              }}
                            >
                              {(a.bars ?? []).map((b, i) => (
                                <span
                                  key={i}
                                  style={{
                                    width: 2,
                                    height: `${Math.max(12, b * 100)}%`,
                                    borderRadius: 1,
                                    background: "#0a84ff",
                                  }}
                                />
                              ))}
                            </span>
                            <span
                              style={{
                                fontSize: 11.5,
                                color: "#6e6e73",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              0:{String(a.secs).padStart(2, "0")}
                            </span>
                          </>
                        )}
                        <button
                          type="button"
                          aria-label={`Remove ${a.title}`}
                          onClick={() => setAtts((x) => x.filter((y) => y.id !== a.id))}
                          style={{
                            position: "absolute",
                            right: 3,
                            top: 3,
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            border: 0,
                            background: "rgba(0,0,0,0.55)",
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Ico d={I.x} size={8} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* the writing area, or the recorder */}
          <div style={{ position: "relative", padding: "10px 14px 4px" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              {rec ? (
                <motion.div
                  key="rec"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <motion.span
                    animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      background: "#ff3b30",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: "#1d1d1f",
                      fontVariantNumeric: "tabular-nums",
                      width: 34,
                    }}
                  >
                    0:
                    {String(Math.floor((Date.now() - rec.t0) / 1000)).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      overflow: "hidden",
                      justifyContent: "flex-end",
                    }}
                  >
                    {rec.bars.map((b, i) => (
                      <motion.span
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        style={{
                          width: 3,
                          height: `${b * 100}%`,
                          borderRadius: 2,
                          background: "#ff3b30",
                          opacity: 0.4 + (i / 40) * 0.6,
                        }}
                      />
                    ))}
                  </span>
                </motion.div>
              ) : (
                <motion.div key="ed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    animate={{ height: h }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      ref={ed}
                      contentEditable
                      suppressContentEditableWarning
                      role="textbox"
                      aria-multiline="true"
                      aria-label={`Message ${to}`}
                      onInput={() => {
                        touched.current = true;
                        refresh();
                      }}
                      onKeyDown={onKey}
                      onPaste={(e) => {
                        // plain text only, so nothing foreign ends up in the message
                        e.preventDefault();
                        document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
                      }}
                      onKeyUp={refresh}
                      onMouseUp={refresh}
                      style={{
                        minHeight: 44,
                        maxHeight,
                        overflowY: "auto",
                        outline: "none",
                        fontSize: 15,
                        lineHeight: 1.5,
                        color: "#1d1d1f",
                        padding: "10px 0",
                        wordBreak: "break-word",
                      }}
                    />
                  </motion.div>
                  {empty && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 14,
                        top: 20,
                        fontSize: 15,
                        color: "#a1a1a6",
                        pointerEvents: "none",
                      }}
                    >
                      Message {to.split(" ")[0]}, type @ to mention
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            {/* mentions */}
            <AnimatePresence>
              {mention && matches.length > 0 && (
                <motion.div
                  key="mention"
                  role="listbox"
                  aria-label="Mention someone"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  style={{
                    position: "absolute",
                    left: 10,
                    bottom: "100%",
                    marginBottom: 6,
                    width: 240,
                    background: "#fff",
                    borderRadius: 16,
                    padding: 6,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 20px 40px -18px rgba(0,0,0,0.4)",
                    zIndex: 5,
                    transformOrigin: "20% 100%",
                  }}
                >
                  {matches.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={i === mention.i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertMention(p)}
                      style={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        height: 38,
                        padding: "0 8px",
                        border: 0,
                        borderRadius: 11,
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {i === mention.i && (
                        <motion.span
                          layoutId={`${uid}-m`}
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 11,
                            background: "#f2f2f5",
                          }}
                        />
                      )}
                      <span style={{ position: "relative" }}>
                        <Face p={p} name={p.name} size={26} />
                      </span>
                      <span
                        style={{
                          position: "relative",
                          fontSize: 13.5,
                          color: "#1d1d1f",
                        }}
                      >
                        {p.name}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* the bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "4px 8px 8px",
            }}
          >
            {tool("Formatting", I.aa, () => setFmtOpen(!fmtOpen), fmtOpen)}
            {tool("Attach a photo", I.plus, addPhoto)}
            {tool(rec ? "Stop recording" : "Record a voice note", rec ? I.stop : I.mic, toggleRec, !!rec)}
            <span style={{ flex: 1 }} />
            {/* split send */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                height: 38,
                borderRadius: 19,
                overflow: "visible",
                background: ready ? "linear-gradient(180deg,#2b95ff,#0a7cff)" : "#e8e8ed",
                boxShadow: ready ? "0 8px 18px -10px #0a7cff" : "none",
                transition: "background 0.3s, box-shadow 0.3s",
              }}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  touched.current = true;
                  send("now");
                }}
                disabled={!ready}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  height: 38,
                  padding: "0 12px 0 15px",
                  border: 0,
                  background: "transparent",
                  color: ready ? "#fff" : "#a1a1a6",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: ready ? "pointer" : "default",
                  borderRadius: "19px 0 0 19px",
                }}
              >
                Send
                <span style={{ position: "relative", width: 15, height: 15 }}>
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={fly}
                      initial={fly ? { x: -14, y: 14, opacity: 0, scale: 0.4 } : false}
                      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      exit={
                        reduce
                          ? { opacity: 0 }
                          : {
                              x: 70,
                              y: -70,
                              opacity: 0,
                              rotate: 10,
                              scale: 1.2,
                            }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                      }}
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <Ico d={I.send} size={15} />
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>
              <span
                style={{
                  width: 1,
                  height: 18,
                  background: ready ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.1)",
                }}
              />
              <button
                type="button"
                aria-label="More send options"
                aria-expanded={menu}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setMenu(!menu)}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                style={{
                  width: 32,
                  height: 38,
                  border: 0,
                  background: "transparent",
                  color: ready ? "#fff" : "#a1a1a6",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  borderRadius: "0 19px 19px 0",
                }}
              >
                <motion.span animate={{ rotate: menu ? 180 : 0 }}>
                  <Ico d={I.caret} size={12} />
                </motion.span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.94 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: "115%",
                      width: 220,
                      background: "#fff",
                      borderRadius: 16,
                      padding: 6,
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 20px 40px -18px rgba(0,0,0,0.4)",
                      zIndex: 5,
                      transformOrigin: "90% 100%",
                    }}
                  >
                    {[
                      {
                        l: "Send tomorrow, 9:00",
                        d: I.clock,
                        f: () => send("later"),
                      },
                      {
                        l: "Send without sound",
                        d: I.bell,
                        f: () => send("now"),
                      },
                    ].map((o) => (
                      <button
                        key={o.l}
                        type="button"
                        disabled={!ready}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={o.f}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          height: 38,
                          padding: "0 10px",
                          border: 0,
                          borderRadius: 11,
                          background: "transparent",
                          cursor: ready ? "pointer" : "default",
                          fontSize: 13.5,
                          color: ready ? "#1d1d1f" : "#a1a1a6",
                          textAlign: "left",
                        }}
                        onPointerEnter={(e) => (e.currentTarget.style.background = "#f2f2f5")}
                        onPointerLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Ico d={o.d} size={15} />
                        {o.l}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
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
