# Lens Search

Add the "Lens Search" component from Nexus UI to my project.

A search box whose magnifying glass is a real lens. Type, and the magnifier lifts out of the field and grows into a glass lens over the list. It looks down the rows, magnifying each as it passes and dimming the ones that do not match, and parks on the first match with a chime, the matched letters in blue under the glass. Arrow keys glide it between matches, and Enter or a click opens one. When nothing matches it reaches the bottom, shakes its head and goes home. Clear the field or press Escape and it drops back in as the icon. The field is a combobox over a listbox, with the result count in a polite live region.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { LensSearch } from "@/components/lens-search";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/lens-search/index.ts ---

```ts
export { default as LensSearch } from "./lens-search";
export type { LensSearchProps } from "./lens-search";
```

--- components/lens-search/lens-search.tsx ---

```tsx
"use client";

import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type LensItem = {
  id: string;
  title: string;
  caption?: string;
  /** extra words it answers to, not shown */
  keywords?: string;
  /** the icon tile's colour */
  color?: string;
  /** an inline SVG body for a 256 by 256 view box (Iconify format), drawn in white */
  icon?: string;
};

export type LensSearchProps = {
  items?: LensItem[];
  placeholder?: string;
  onSelect?: (item: LensItem) => void;
  /** Soft synthesised sounds, scored to the motion. They also follow the site-wide sound switch. */
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
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
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

// Phosphor Icons (MIT), via Iconify
const ICON = {
  wifi: "<path fill=\"currentColor\" d=\"m244.35 92.8l-104 125.43A15.93 15.93 0 0 1 128 224a15.93 15.93 0 0 1-12.31-5.77L11.65 92.8a15.65 15.65 0 0 1-3.54-11.89a15.93 15.93 0 0 1 6.17-10.81A186.67 186.67 0 0 1 128 32a186.67 186.67 0 0 1 113.72 38.1a15.93 15.93 0 0 1 6.17 10.81a15.65 15.65 0 0 1-3.54 11.89\"/>",
  bell: "<path fill=\"currentColor\" d=\"M221.8 175.94c-5.55-9.56-13.8-36.61-13.8-71.94a80 80 0 1 0-160 0c0 35.34-8.26 62.38-13.81 71.94A16 16 0 0 0 48 200h40.81a40 40 0 0 0 78.38 0H208a16 16 0 0 0 13.8-24.06M128 216a24 24 0 0 1-22.62-16h45.24A24 24 0 0 1 128 216\"/>",
  moon: "<path fill=\"currentColor\" d=\"M235.54 150.21a104.84 104.84 0 0 1-37 52.91A104 104 0 0 1 32 120a103.1 103.1 0 0 1 20.88-62.52a104.84 104.84 0 0 1 52.91-37a8 8 0 0 1 10 10a88.08 88.08 0 0 0 109.8 109.8a8 8 0 0 1 10 10Z\"/>",
  half: "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24M40 128a88.1 88.1 0 0 1 88-88v176a88.1 88.1 0 0 1-88-88\"/>",
  hand: "<path fill=\"currentColor\" d=\"M216 64v90.93c0 46.2-36.85 84.55-83 85.06a83.7 83.7 0 0 1-60.4-24.59C50.79 192.33 26.15 136 26.15 136a16 16 0 0 1 6.53-22.23c7.66-4 17.1-.84 21.4 6.62l21 36.44a6.09 6.09 0 0 0 6 3.09h.12a8.19 8.19 0 0 0 6.8-8.18V48a16 16 0 0 1 16.77-16c8.61.4 15.23 7.82 15.23 16.43V112a8 8 0 0 0 8.53 8a8.17 8.17 0 0 0 7.47-8.25V32a16 16 0 0 1 16.77-16c8.61.4 15.23 7.82 15.23 16.43V120a8 8 0 0 0 8.53 8a8.17 8.17 0 0 0 7.47-8.25v-55.3c0-8.61 6.62-16 15.23-16.43A16 16 0 0 1 216 64\"/>",
  key: "<path fill=\"currentColor\" d=\"M216.57 39.43a80 80 0 0 0-132.66 81.35L28.69 176A15.86 15.86 0 0 0 24 187.31V216a16 16 0 0 0 16 16h32a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 5.66-2.34l9.56-9.57A79.7 79.7 0 0 0 160 176h.1a80 80 0 0 0 56.47-136.57M180 92a16 16 0 1 1 16-16a16 16 0 0 1-16 16\"/>",
  translate: "<path fill=\"currentColor\" d=\"M160 129.89L175.06 160h-30.12l6.36-12.7ZM224 48v160a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16m-16.84 140.42l-40-80a8 8 0 0 0-14.32 0l-13.18 26.38a62.3 62.3 0 0 1-23.61-10A79.6 79.6 0 0 0 135.6 80H152a8 8 0 0 0 0-16h-40v-8a8 8 0 0 0-16 0v8H56a8 8 0 0 0 0 16h63.48a63.73 63.73 0 0 1-15.3 34.05a66 66 0 0 1-9-13.61a8 8 0 0 0-14.32 7.12a81.8 81.8 0 0 0 11.4 17.15A63.6 63.6 0 0 1 56 136a8 8 0 0 0 0 16a79.56 79.56 0 0 0 48.11-16.13a78.3 78.3 0 0 0 28.18 13.66l-19.45 38.89a8 8 0 0 0 14.32 7.16l9.78-19.58h46.12l9.78 19.58a8 8 0 1 0 14.32-7.16\"/>",
  clear: "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m37.66 130.34a8 8 0 0 1-11.32 11.32L128 139.31l-26.34 26.35a8 8 0 0 1-11.32-11.32L116.69 128l-26.35-26.34a8 8 0 0 1 11.32-11.32L128 116.69l26.34-26.35a8 8 0 0 1 11.32 11.32L139.31 128Z\"/>",
};

const DEFAULT_ITEMS: LensItem[] = [
  { id: "wifi", title: "Wi-Fi", caption: "Networks, hotspots", keywords: "internet wireless connection", color: "#0a84ff", icon: ICON.wifi },
  { id: "notifications", title: "Notifications", caption: "Banners, sounds, badges", keywords: "alerts", color: "#ff3b30", icon: ICON.bell },
  { id: "focus", title: "Focus", caption: "Do not disturb, sleep", keywords: "quiet silence", color: "#5e5ce6", icon: ICON.moon },
  { id: "appearance", title: "Appearance", caption: "Light, dark, text size", keywords: "theme mode font", color: "#1d1d1f", icon: ICON.half },
  { id: "privacy", title: "Privacy", caption: "Location, tracking, camera", keywords: "permissions", color: "#32ade6", icon: ICON.hand },
  { id: "passwords", title: "Passwords", caption: "Saved logins, passkeys", keywords: "security keychain", color: "#8e8e93", icon: ICON.key },
  { id: "language", title: "Language", caption: "Region, keyboards", keywords: "translate", color: "#ff9500", icon: ICON.translate },
];

// ───────────── layout, in pixels from the card's top left ─────────────
const PAD = 20;
const FIELD_H = 44;
const LIST_TOP = PAD + FIELD_H + 10;
const ROW = 46;
const D = 88; // the lens
const R = D / 2;
const MAG = 1.75;
const HOME_X = PAD + 21;
const HOME_Y = PAD + FIELD_H / 2;
const HOME_S = 12 / D; // as small as the icon in the field
const PARK_X = PAD + 92; // over a row's icon and the start of its title
const rowY = (i: number) => LIST_TOP + i * ROW + ROW / 2;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function hit(it: LensItem, q: string) {
  return norm(`${it.title} ${it.caption ?? ""} ${it.keywords ?? ""}`).includes(q);
}
function Mark({ text, q }: { text: string; q: string }) {
  const i = q ? norm(text).indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span data-hit="" className="font-semibold text-[#0071e3]">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}

type Phase = "home" | "looking" | "found" | "none";

function Rows({
  items,
  q,
  checked,
  active,
  flash,
  ids,
  onPick,
}: {
  items: LensItem[];
  q: string;
  checked: number;
  active: number;
  flash: number;
  ids?: string;
  onPick?: (i: number) => void;
}) {
  return (
    <>
      {items.map((it, i) => {
        const match = !q || hit(it, q);
        const dim = !!q && i <= checked && !match;
        const Tag = (onPick ? "li" : "div") as "li";
        return (
          <Tag
            key={it.id}
            id={ids ? `${ids}-${i}` : undefined}
            role={onPick ? "option" : undefined}
            aria-selected={onPick ? active === i : undefined}
            onPointerDown={onPick ? (e) => e.preventDefault() : undefined}
            onClick={onPick ? () => onPick(i) : undefined}
            className={`flex h-[46px] items-center gap-3 rounded-[12px] px-1 transition-[opacity,background-color] duration-300 ${onPick ? "cursor-pointer" : ""} ${
              flash === i ? "bg-[#0071e3]/10" : "bg-transparent"
            }`}
            style={{ opacity: dim ? 0.3 : 1 }}
          >
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[8px] text-white" style={{ background: it.color ?? "#8e8e93" }}>
              {it.icon && <svg viewBox="0 0 256 256" width="17" height="17" aria-hidden="true" dangerouslySetInnerHTML={{ __html: it.icon }} />}
            </span>
            <span className="min-w-0 flex-1 border-b border-black/[.06] py-[7px]">
              <span className="block truncate text-[15px] leading-[18px] tracking-[-0.01em] text-[#1d1d1f]">
                <Mark text={it.title} q={q} />
              </span>
              {it.caption && (
                <span className="block truncate text-[12px] leading-[15px] text-[#6e6e73]">
                  <Mark text={it.caption} q={hit({ ...it, caption: "", keywords: "" }, q) ? "" : q} />
                </span>
              )}
            </span>
          </Tag>
        );
      })}
    </>
  );
}

/**
 * Search whose magnifying glass is a real lens.
 *
 * Type, and the magnifier lifts out of the field and grows into a glass lens over the list. It looks down the rows,
 * magnifying each as it passes and dimming the ones that don't match, and parks on the first match with a chime, the
 * matched letters in blue under the glass. Arrow keys glide it between matches, Enter or a click opens one. When nothing
 * matches, it reaches the bottom, shakes its head and goes home. Clear the field or press Escape and it drops back into
 * the field as the icon. The field is a combobox over a listbox, with the lensed row as the active option and the
 * result count in a polite live region.
 */
export default function LensSearch({
  items = DEFAULT_ITEMS,
  placeholder = "Search settings",
  onSelect,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: LensSearchProps) {
  const reduce = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [query, setQuery] = useState("");
  const q = norm(query.trim());
  const [phase, setPhase] = useState<Phase>("home");
  const [checked, setChecked] = useState(-1);
  const [active, setActive] = useState(-1);
  const [flash, setFlash] = useState(-1);
  const [opened, setOpened] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const [listW, setListW] = useState(300);
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setListW(el.offsetWidth));
    ro.observe(el);
    setListW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const hits = useMemo(() => items.map((it) => (q ? hit(it, q) : false)), [items, q]);
  const count = hits.filter(Boolean).length;

  // ── the lens ──
  const lx = useMotionValue(HOME_X), ly = useMotionValue(HOME_Y);
  const scale = useMotionValue(HOME_S);
  const glass = useMotionValue(0); // 0 an icon in the field, 1 a lens
  const shake = useMotionValue(0);
  const tone = useMotionValue(0); // 1 red
  const ring = useTransform(scale, (s) => Math.max(3.2, 2 / Math.max(s, 0.01)));
  const handleW = useTransform(scale, (s) => Math.max(10, 2.2 / Math.max(s, 0.01)));
  const handleL = useTransform(scale, (s) => Math.max(34, 6.5 / Math.max(s, 0.01)));
  const ringColor = useTransform(tone, [0, 1], ["#1d1d1f", "#ff3b30"]);
  const ringShadow = useMotionTemplate`inset 0 0 0 ${ring}px ${ringColor}`;
  const glassShadow = useTransform(glass, (g) => `0 18px 30px -14px rgba(0,0,0,${(0.5 * g).toFixed(3)}), inset 0 0 14px rgba(0,0,0,${(0.12 * g).toFixed(3)})`);
  const glassBg = useTransform(glass, (g) => `rgba(255,255,255,${g.toFixed(3)})`);
  const innerX = useTransform(lx, (x) => R - (x - PAD) * MAG);
  const innerY = useTransform(ly, (y) => R - (y - LIST_TOP) * MAG);
  const posX = useTransform([lx, shake] as MotionValue<number>[], ([x, s]) => (x as number) + (s as number));
  // the handle swings a little as the lens moves
  const vx = useVelocity(lx);
  const swing = useSpring(useTransform(vx, (v) => Math.max(-14, Math.min(14, -v / 70))), { stiffness: 300, damping: 24 });
  const handleRot = useTransform(swing, (s) => -45 + s);
  const handleX = useTransform(handleW, (w) => -w / 2);

  const lifted = useRef(false);
  const gen = useRef(0);
  const wait = (ms: number) => new Promise((r) => window.setTimeout(r, reduce ? 0 : ms));
  const glide = (mv: typeof lx, to: number, stiffness = 260, damping = 26) =>
    animate(mv, to, reduce ? { duration: 0 } : { type: "spring", stiffness, damping });

  const lift = async () => {
    lifted.current = true;
    sfx.whoosh(520, 1700, { dur: 0.42, gain: 0.05 });
    sfx.note(1568, { at: 0.12, dur: 0.3, gain: 0.05, bell: 0.6 });
    void glide(scale, 1, 240, 20);
    void animate(glass, 1, { duration: reduce ? 0 : 0.28, delay: reduce ? 0 : 0.06 });
    void glide(lx, PARK_X, 190, 22);
    void glide(ly, rowY(0), 190, 22);
    await wait(300);
  };
  const home = async () => {
    const my = ++gen.current;
    setChecked(-1);
    setActive(-1);
    if (!lifted.current) return;
    lifted.current = false;
    sfx.whoosh(1600, 480, { dur: 0.38, gain: 0.045 });
    void animate(tone, 0, { duration: 0.2 });
    void animate(glass, 0, { duration: reduce ? 0 : 0.22, delay: reduce ? 0 : 0.1 });
    void glide(lx, HOME_X, 230, 26);
    void glide(ly, HOME_Y, 230, 26);
    await glide(scale, HOME_S, 230, 26);
    if (gen.current === my) sfx.tick({ freq: 2100, gain: 0.07 });
  };

  const search = async (text: string) => {
    const my = ++gen.current;
    const live = () => gen.current === my;
    const qq = norm(text.trim());
    if (!qq) {
      setPhase("home");
      void home();
      return;
    }
    const found = items.map((it) => hit(it, qq));
    const first = found.indexOf(true);
    setOpened("");
    setActive(-1);
    setChecked(-1);
    setPhase("looking");
    void animate(tone, 0, { duration: 0.2 });
    if (!lifted.current) {
      await lift();
      if (!live()) return;
    }
    // look down the rows, zigzagging across each, until the first match (or the end)
    const last = first >= 0 ? first : items.length - 1;
    for (let i = 0; i <= last; i++) {
      void glide(lx, i === last && first >= 0 ? parkX(i) : i % 2 ? PAD + 196 : PAD + 92, 420, 32);
      void glide(ly, rowY(i), 420, 32);
      await wait(i === 0 ? 110 : 95);
      if (!live()) return;
      setChecked(i);
      if (i < last || first < 0) sfx.tick({ freq: 2500 + i * 140, gain: 0.04 });
    }
    setChecked(items.length);
    if (first < 0) {
      // nothing here: it shakes its head and goes home
      setPhase("none");
      void animate(tone, 1, { duration: 0.15 });
      sfx.note(330, { dur: 0.16, gain: 0.08, type: "triangle", bell: 0 });
      sfx.note(262, { at: 0.16, dur: 0.24, gain: 0.08, type: "triangle", bell: 0 });
      if (!reduce) await animate(shake, [0, -10, 10, -7, 5, -2, 0], { duration: 0.55 });
      await wait(350);
      if (!live()) return;
      await home();
      return;
    }
    setActive(first);
    setPhase("found");
    sfx.note(1319, { dur: 0.3, gain: 0.07, bell: 0.5 });
    sfx.note(1976, { at: 0.08, dur: 0.5, gain: 0.06, bell: 0.5 });
    if (!reduce) void animate(scale, [1, 1.07, 1], { duration: 0.4, ease: "easeOut" });
  };

  // search after a short pause in typing
  const debounce = useRef(0);
  const type = (text: string) => {
    setQuery(text);
    setOpened("");
    window.clearTimeout(debounce.current);
    if (!text.trim()) {
      ++gen.current;
      setPhase("home");
      void home();
      return;
    }
    debounce.current = window.setTimeout(() => void search(text), 260);
  };

  /** park over the matched letters when there are some to see, otherwise over the start of the row */
  const parkX = (i: number) => {
    const root = rootRef.current, el = root?.querySelector(`#row-${uid}-${i} [data-hit]`);
    if (!root || !el) return PARK_X;
    const a = root.getBoundingClientRect(), b = el.getBoundingClientRect();
    const x = b.left + b.width / 2 - a.left;
    return Math.max(PAD + R - 14, Math.min(PAD + listW - R + 14, x));
  };
  const moveTo = (i: number) => {
    setActive(i);
    void glide(lx, parkX(i), 300, 28);
    void glide(ly, rowY(i), 300, 28);
    sfx.tick({ freq: 2800, gain: 0.06 });
    sfx.note(1175, { glide: 1397, dur: 0.14, gain: 0.04, bell: 0.3 });
  };
  const step = (dir: 1 | -1) => {
    if (phase !== "found") return;
    const order = hits.map((h, i) => (h ? i : -1)).filter((i) => i >= 0);
    if (order.length < 2) return;
    const at = order.indexOf(active);
    moveTo(order[(at + dir + order.length) % order.length]!);
  };
  const pick = (i: number) => {
    touched.current = true;
    if (q && !hits[i]) return;
    if (lifted.current && i !== active) moveTo(i);
    else setActive(i);
    setFlash(i);
    window.setTimeout(() => setFlash(-1), 500);
    setOpened(items[i]!.title);
    sfx.tick({ freq: 3000, gain: 0.07 });
    sfx.note(1760, { at: 0.03, dur: 0.24, gain: 0.06, bell: 0.4 });
    if (lifted.current && !reduce) void animate(scale, [1, 0.94, 1], { duration: 0.3 });
    onSelect?.(items[i]!);
  };

  useEffect(() => () => window.clearTimeout(debounce.current), []);

  // autoplay: look for a few things, one of which isn't there, until someone touches it
  useEffect(() => {
    if (!autoplay || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    (async () => {
      await sleep(1100);
      while (ok()) {
        for (const word of ["dark", "pass", "bluetooth"]) {
          let s = "";
          for (const ch of word) {
            if (!ok()) return;
            s += ch;
            type(s);
            await sleep(reduce ? 20 : 110 + Math.random() * 60);
          }
          await sleep(word === "bluetooth" ? 3000 : 2600);
          if (!ok()) return;
          type("");
          await sleep(1300);
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const status: ReactNode =
    opened
      ? `Opened ${opened}`
      : phase === "looking"
        ? "Looking…"
        : phase === "found"
          ? count > 1
            ? `${count} matches. Arrow keys move the lens.`
            : "1 match. Press Enter to open it."
          : phase === "none" && q
            ? `Nothing matches "${query.trim()}"`
            : "Type to search. The lens finds it.";

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={() => {
  touched.current = true;
}}
      className={`relative w-[340px] max-w-full rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      <div className="relative h-[44px]">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={!!q}
          aria-controls={`list-${uid}`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `row-${uid}-${active}` : undefined}
          aria-label={placeholder}
          placeholder={placeholder}
          value={query}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            touched.current = true;
            type(e.target.value);
          }}
          onKeyDown={(e) => {
            touched.current = true;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              step(1);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              step(-1);
            } else if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              pick(active);
            } else if (e.key === "Escape" && query) {
              e.preventDefault();
              type("");
            }
          }}
          className="h-full w-full rounded-[14px] border-0 bg-[#f5f5f7] pl-[42px] pr-10 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus-visible:ring-2 focus-visible:ring-[#0071e3]/50"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              touched.current = true;
              type("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#aeaeb2] outline-none hover:text-[#8e8e93] focus-visible:ring-2 focus-visible:ring-[#0071e3]/50"
          >
            <svg viewBox="0 0 256 256" width="18" height="18" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.clear }} />
          </button>
        )}
      </div>

      <ul ref={listRef} id={`list-${uid}`} role="listbox" aria-label="Results" className="m-0 mt-[10px] list-none p-0">
        <Rows items={items} q={q} checked={checked} active={active} flash={flash} ids={`row-${uid}`} onPick={pick} />
      </ul>
      <p aria-live="polite" className="m-0 mt-2.5 h-[18px] truncate text-[13px] text-[#6e6e73]">
        {status}
      </p>

      {/* the lens: at rest it is the little magnifier in the field */}
      <motion.div className="pointer-events-none absolute left-0 top-0 z-10" style={{ x: posX, y: ly }} aria-hidden="true">
        <motion.div className="relative" style={{ scale }}>
          <motion.div className="absolute left-0 top-0" style={{ rotate: handleRot }}>
            <motion.div className="absolute rounded-full" style={{ width: handleW, height: handleL, left: 0, top: R - 3, x: handleX, background: ringColor }} />
          </motion.div>
          <motion.div className="absolute overflow-hidden rounded-full" style={{ width: D, height: D, left: -R, top: -R, background: glassBg, boxShadow: glassShadow }}>
            <motion.div className="absolute left-0 top-0" style={{ width: listW, x: innerX, y: innerY, scale: MAG, originX: 0, originY: 0, opacity: glass }}>
              <Rows items={items} q={q} checked={checked} active={active} flash={flash} />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ opacity: glass, background: "radial-gradient(circle at 30% 26%, rgba(255,255,255,.75), rgba(255,255,255,0) 38%), radial-gradient(circle at 70% 80%, rgba(10,132,255,.08), rgba(10,132,255,0) 50%)" }}
            />
          </motion.div>
          <motion.div className="absolute rounded-full" style={{ width: D, height: D, left: -R, top: -R, boxShadow: ringShadow }} />
        </motion.div>
      </motion.div>
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
