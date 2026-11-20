"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type PathNode = {
  name: string;
  size?: number;
  tint?: [string, string];
  children?: PathNode[];
};
export type FolderPathProps = {
  root?: PathNode;
  /** names to open on first show, below the root */
  startPath?: string[];
  onOpenFile?: (path: string[]) => void;
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
  folder:
    "M232 88v112.89A15.13 15.13 0 0 1 216.89 216H40a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h53.33a16.12 16.12 0 0 1 9.6 3.2L130.67 72H216a16 16 0 0 1 16 16",
  caret:
    "m181.66 133.66l-80 80a8 8 0 0 1-11.32-11.32L164.69 128L90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32",
  dots: "M144 128a16 16 0 1 1-16-16a16 16 0 0 1 16 16m-84-16a16 16 0 1 0 16 16a16 16 0 0 0-16-16m136 0a16 16 0 1 0 16 16a16 16 0 0 0-16-16",
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

const jpg = (name: string, size: number, tint: [string, string]): PathNode => ({
  name,
  size,
  tint,
});
const DEFAULT_ROOT: PathNode = {
  name: "Fieldwork",
  children: [
    {
      name: "Clients",
      children: [
        {
          name: "Maison Olive",
          children: [
            {
              name: "Campaigns",
              children: [
                {
                  name: "Holiday 2026",
                  children: [
                    {
                      name: "Final selects",
                      children: [
                        jpg("OLV_H26_0142.jpg", 24.1e6, ["#8f9466", "#c2c39a"]),
                        jpg("OLV_H26_0157.jpg", 22.8e6, ["#d79a6a", "#f0c39a"]),
                        jpg("OLV_H26_0203.jpg", 26.3e6, ["#aeb6a0", "#dfe2d3"]),
                      ],
                    },
                    {
                      name: "Raw",
                      children: [
                        jpg("OLV_H26_RAW_01.cr3", 2.1e9, ["#5e5a52", "#8f897c"]),
                        jpg("OLV_H26_RAW_02.cr3", 2.3e9, ["#6c6356", "#a09281"]),
                      ],
                    },
                  ],
                },
                {
                  name: "Spring launch",
                  children: [
                    jpg("Lookbook.pdf", 48e6, ["#c9b39a", "#efe3d3"]),
                    jpg("Teaser.mp4", 2.6e9, ["#33302b", "#6d655b"]),
                  ],
                },
              ],
            },
            {
              name: "Brand",
              children: [
                jpg("Logo kit.zip", 1.2e9, ["#2e3b2e", "#5f7a5c"]),
                jpg("Palette.ase", 0.7e9, ["#d9c6a5", "#f3eadb"]),
              ],
            },
            {
              name: "Contracts",
              children: [
                jpg("2026 retainer.pdf", 2.6e6, ["#d9d4cc", "#f2efe9"]),
                jpg("Usage rights.pdf", 2e6, ["#cfd6dc", "#eef2f5"]),
              ],
            },
          ],
        },
        {
          name: "Halden Coffee",
          children: [
            {
              name: "Packaging",
              children: [jpg("Bag dieline.ai", 9.1e9, ["#6b4a35", "#a7795a"])],
            },
            {
              name: "Photos",
              children: [jpg("Cafe interior.jpg", 5.2e9, ["#b98b5f", "#e5c79f"])],
            },
          ],
        },
        {
          name: "Northpoint",
          children: [
            {
              name: "Site",
              children: [jpg("Home.fig", 4.1e9, ["#40546b", "#7d97b3"])],
            },
            {
              name: "Deck",
              children: [jpg("Pitch.key", 2.7e9, ["#2c3442", "#5a6880"])],
            },
          ],
        },
      ],
    },
    {
      name: "Internal",
      children: [
        {
          name: "Templates",
          children: [jpg("Invoice.numbers", 1.1e6, ["#dfe6dc", "#f3f6f1"])],
        },
      ],
    },
  ],
};

const sizeOf = (n: PathNode): number => n.size ?? (n.children ?? []).reduce((a, c) => a + sizeOf(c), 0);
const fmt = (b: number) =>
  b >= 1e9
    ? `${(b / 1e9).toFixed(1)} GB`
    : b >= 1e6
      ? `${(b / 1e6).toFixed(1)} MB`
      : `${Math.max(1, Math.round(b / 1e3))} KB`;

/**
 * A folder browser that moves like a stack of pages. Open a folder and its list slides in from the right while the
 * old one slips away to the left and the path grows a new step; go back through the path and everything slides the
 * other way. When the path gets long, the middle folds into a button that opens the steps it hides. Works with the
 * arrow keys, Enter and Backspace.
 */
export default function FolderPath({
  root = DEFAULT_ROOT,
  startPath = ["Clients"],
  onOpenFile,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FolderPathProps) {
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
  const [path, setPath] = useState<string[]>(startPath);
  const pathRef = useRef(path);
  pathRef.current = path;
  const [dir, setDir] = useState(1);
  const [hi, setHi] = useState<number>(-1);
  const [more, setMore] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);

  const nodeAt = (p: string[]) => p.reduce<PathNode>((n, name) => n.children?.find((c) => c.name === name) ?? n, root);
  const node = nodeAt(path);
  const items = node.children ?? [];
  const folders = items.filter((c) => c.children).length;
  const total = sizeOf(node);

  const open = (name: string) => {
    // from the latest path, so autoplay can walk several levels in a row
    const here = pathRef.current;
    const c = (nodeAt(here).children ?? []).find((x) => x.name === name);
    if (!c) return;
    if (!c.children) {
      setPicked(name);
      onOpenFile?.([...here, name]);
      sfx.tick({ freq: 1600, gain: 0.04 });
      window.setTimeout(() => setPicked(null), 900);
      return;
    }
    setDir(1);
    pathRef.current = [...here, name];
    setPath(pathRef.current);
    setHi(-1);
    setMore(false);
    sfx.whoosh(700, 1900, { dur: 0.3, gain: 0.025 });
    sfx.tick({ freq: 1300, gain: 0.035 });
  };
  const back = (depth: number) => {
    if (depth >= pathRef.current.length) return;
    setDir(-1);
    setPath((p) => p.slice(0, depth));
    setHi(-1);
    setMore(false);
    sfx.whoosh(1900, 700, { dur: 0.3, gain: 0.025 });
  };

  // the path, with its middle folded once it gets long
  const crumbs = [root.name, ...path];
  const fold = crumbs.length > 3;
  const shown = fold ? [-1, crumbs.length - 2, crumbs.length - 1] : crumbs.map((_, i) => i);
  const hidden = fold ? crumbs.slice(0, crumbs.length - 2).map((n, i) => ({ n, depth: i })) : [];

  // autoplay: dig down to the photos, back up through the folded path
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 550) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return false;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      setGhost(true);
      await Promise.all([
        animate(gx, r.left - cb.left + Math.min(60, r.width / 2), {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
        animate(gy, r.top - cb.top + r.height / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
      return true;
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(110);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1100);
      while (ok()) {
        for (const n of ["Maison Olive", "Campaigns", "Holiday 2026", "Final selects"]) {
          if (!ok()) return;
          await go(`[data-row="${n}"]`);
          await wait(250);
          await tap();
          open(n);
          await wait(1100);
        }
        if (!ok()) return;
        await go("[data-more]");
        await tap();
        setMore(true);
        await wait(1100);
        await go('[data-hidden="2"]', 400);
        await tap();
        back(2);
        await wait(1400);
        setGhost(false);
        await wait(1500);
        if (!ok()) return;
        setDir(-1);
        setPath(startPath);
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

  const key = path.join("/");
  const listVariants = useMemo(
    () => ({
      enter: (d: number) => (reduce ? { opacity: 1 } : { x: d * 44, opacity: 0, filter: "blur(3px)" }),
      center: { x: 0, opacity: 1, filter: "blur(0px)" },
      exit: (d: number) => (reduce ? { opacity: 0 } : { x: d * -44, opacity: 0, filter: "blur(3px)" }),
    }),
    [reduce],
  );

  return (
    <div
      className={`relative w-full max-w-[400px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1c1917",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(28,25,23,0.06), 0 24px 48px -32px rgba(28,25,23,0.35)",
          padding: "16px 12px 12px",
        }}
      >
        {/* the path */}
        <nav
          aria-label="Folder path"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "0 6px 12px",
            minHeight: 32,
          }}
        >
          <button
            type="button"
            aria-label={`Back to ${root.name}`}
            onClick={() => {
              touched.current = true;
              back(0);
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: 0,
              background: "#1c1917",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              marginRight: 6,
              flex: "none",
              cursor: "pointer",
            }}
          >
            {root.name[0]}
          </button>
          <LayoutGroup id={uid}>
            <AnimatePresence initial={false} mode="popLayout">
              {shown.map((ci, k) => {
                const last = ci === crumbs.length - 1;
                const isMore = ci === -1;
                return (
                  <motion.span
                    key={isMore ? "more" : `${ci}-${crumbs[ci]}`}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 2,
                      minWidth: 0,
                      flex: last ? "0 1 auto" : "none",
                    }}
                  >
                    {(k > 0 || fold) && (
                      <span style={{ color: "#c4c0bb" }}>
                        <Ico d={I.caret} size={12} />
                      </span>
                    )}
                    {isMore ? (
                      <button
                        type="button"
                        data-more
                        aria-label="Show hidden folders"
                        aria-expanded={more}
                        onClick={() => {
                          touched.current = true;
                          setMore((m) => !m);
                        }}
                        className="outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                        style={{
                          height: 26,
                          width: 30,
                          borderRadius: 8,
                          border: 0,
                          background: more ? "#efedea" : "transparent",
                          color: "#78716c",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Ico d={I.dots} size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={last}
                        aria-current={last ? "page" : undefined}
                        onClick={() => {
                          touched.current = true;
                          back(ci);
                        }}
                        className="outline-none focus-visible:ring-2 focus-visible:ring-stone-400 enabled:hover:bg-stone-100"
                        style={{
                          height: 26,
                          padding: "0 6px",
                          borderRadius: 8,
                          border: 0,
                          background: "transparent",
                          color: last ? "#1c1917" : "#a8a29e",
                          fontSize: 14.5,
                          fontWeight: last ? 550 : 450,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 150,
                          cursor: last ? "default" : "pointer",
                          transition: "color 0.2s",
                        }}
                      >
                        {crumbs[ci]}
                      </button>
                    )}
                  </motion.span>
                );
              })}
            </AnimatePresence>
          </LayoutGroup>
          <AnimatePresence>
            {more && fold && (
              <motion.div
                key="pop"
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
                style={{
                  position: "absolute",
                  top: 34,
                  left: 56,
                  zIndex: 5,
                  minWidth: 160,
                  padding: 4,
                  borderRadius: 12,
                  background: "#fff",
                  boxShadow: "0 0 0 1px rgba(28,25,23,0.08), 0 14px 30px -12px rgba(28,25,23,0.3)",
                  transformOrigin: "20% 0%",
                }}
              >
                {hidden.map((h, i) => (
                  <button
                    key={h.n}
                    type="button"
                    data-hidden={i}
                    onClick={() => {
                      touched.current = true;
                      back(h.depth);
                    }}
                    className="outline-none hover:bg-stone-100 focus-visible:bg-stone-100"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      height: 32,
                      padding: "0 8px",
                      paddingLeft: 8 + i * 10,
                      borderRadius: 8,
                      border: 0,
                      background: "transparent",
                      fontSize: 13,
                      color: "#44403c",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ color: "#a8a29e" }}>
                      <Ico d={I.folder} size={13} />
                    </span>
                    {h.n}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* the list */}
        <motion.div
          layout={!reduce}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          style={{ position: "relative", overflow: "hidden" }}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={dir}>
            <motion.div
              key={key}
              custom={dir}
              variants={listVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 380, damping: 36 },
                opacity: { duration: 0.2 },
                filter: { duration: 0.2 },
              }}
              role="listbox"
              aria-label={node.name}
              tabIndex={0}
              onKeyDown={(e) => {
                touched.current = true;
                if (e.key === "ArrowDown") setHi((h) => Math.min(items.length - 1, h + 1));
                else if (e.key === "ArrowUp") setHi((h) => Math.max(0, h - 1));
                else if (e.key === "Enter" && hi >= 0) open(items[hi].name);
                else if (e.key === "Backspace" || e.key === "ArrowLeft") back(path.length - 1);
                else return;
                e.preventDefault();
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-stone-300 rounded-2xl"
            >
              {items.map((c, i) => {
                const isFolder = !!c.children;
                return (
                  <motion.button
                    key={c.name}
                    type="button"
                    role="option"
                    aria-selected={hi === i}
                    data-row={c.name}
                    onPointerEnter={() => setHi(i)}
                    onPointerLeave={() => setHi(-1)}
                    onClick={() => {
                      touched.current = true;
                      open(c.name);
                    }}
                    whileTap={{ scale: 0.985 }}
                    animate={{
                      backgroundColor: hi === i || picked === c.name ? "#f5f5f4" : "rgba(245,245,244,0)",
                    }}
                    transition={{ duration: 0.15 }}
                    tabIndex={-1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      width: "100%",
                      height: 58,
                      padding: "0 12px",
                      borderRadius: 16,
                      border: 0,
                      textAlign: "left",
                      cursor: "pointer",
                      color: "inherit",
                    }}
                  >
                    {isFolder ? (
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "#f5f5f4",
                          boxShadow: "inset 0 0 0 1px rgba(28,25,23,0.05)",
                          color: "#d6d3d1",
                          display: "grid",
                          placeItems: "center",
                          flex: "none",
                        }}
                      >
                        <Ico d={I.folder} size={18} />
                      </span>
                    ) : (
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `linear-gradient(145deg, ${c.tint?.[0] ?? "#ccc"}, ${c.tint?.[1] ?? "#eee"})`,
                          boxShadow: "inset 0 0 0 1px rgba(28,25,23,0.06)",
                          flex: "none",
                        }}
                      />
                    )}
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 15,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.name}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: "#a8a29e",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmt(sizeOf(c))}
                    </span>
                    <motion.span
                      animate={{
                        x: hi === i && isFolder ? 2 : 0,
                        opacity: isFolder ? 1 : 0,
                      }}
                      style={{ color: "#c4c0bb", width: 12 }}
                    >
                      <Ico d={I.caret} size={12} />
                    </motion.span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          layout={!reduce}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 12px 4px",
            fontSize: 13,
            color: "#a8a29e",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>
            {folders
              ? `${folders} folder${folders > 1 ? "s" : ""}`
              : `${items.length} file${items.length === 1 ? "" : "s"}`}
            {folders && items.length > folders ? `, ${items.length - folders} files` : ""}
          </span>
          <span>{fmt(total)}</span>
        </motion.div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -12,
              top: -12,
              x: gx,
              y: gy,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "rgba(28,25,23,0.16)",
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
