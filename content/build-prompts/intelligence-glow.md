# Intelligence Glow

Add the "Intelligence Glow" component from Nexus UI to my project.

Press and hold the screen to call the assistant. Light ripples out from your finger and flows around the edge of a phone, a Writing Tools panel rises, and the draft shimmers and rewrites itself word by word. Built from layered conic gradients on a canvas, with hold-to-call by pointer or keyboard.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` and `@/lib/ui-sounds-pro` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
5. Use it like this: `import { IntelligenceGlow } from "@/components/intelligence-glow";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/intelligence-glow/index.ts ---

```ts
export { IntelligenceGlow } from "./intelligence-glow";
export type { IntelligenceGlowProps } from "./intelligence-glow";
```

--- components/intelligence-glow/intelligence-glow.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useProSound, type ProSoundName } from "@/lib/ui-sounds-pro";

type Opt = "proofread" | "rewrite" | "friendly" | "concise";
type Mode = "idle" | "thinking" | "writing";

const ORIGINAL = "Hi Maya, just wanted to check if your still free on friday for dinner. I was thinking we could try the new thai place near the office, they have a outdoor terrace. Let me no what time works for you.";
const PRESETS: Record<Opt, string> = {
  proofread: "Hi Maya, just wanted to check if you're still free on Friday for dinner. I was thinking we could try the new Thai place near the office; they have an outdoor terrace. Let me know what time works for you.",
  rewrite: "Hi Maya, are you still free for dinner on Friday? I'd love to try the new Thai restaurant near the office, which has an outdoor terrace. Let me know what time suits you best.",
  friendly: "Hey Maya! Are you still up for dinner this Friday? I've been dying to try that new Thai place by the office, and they have a lovely outdoor terrace. Just let me know what time works for you!",
  concise: "Hi Maya, are you free for dinner on Friday? I'd like to try the new Thai place near the office. What time works?",
};
const OPTS: { id: Opt; label: string }[] = [
  { id: "proofread", label: "Proofread" },
  { id: "rewrite", label: "Rewrite" },
  { id: "friendly", label: "Friendly" },
  { id: "concise", label: "Concise" },
];
const LOOP: Opt[] = ["friendly", "concise", "rewrite", "proofread"];
const HUES = ["#3d7bff", "#8b5cff", "#d35cf2", "#ff4f9a", "#ff8a3d", "#ffb347", "#ff4f9a", "#8b5cff", "#3d7bff"];
const SOFT = ["#8d9fff", "#bc82f3", "#f5b9ea", "#ff6778", "#ffba71", "#c686ff", "#8d9fff"];
// iPhone 16 (6.1-inch) at true proportions, in points: a 393 x 852 display with 55 pt corners
// inside a 71.6 x 147.6 mm body (434 x 893 pt at the display's 460 ppi / 3x scale).
const SCREEN_R = 55, BODY_W = 434, BODY_H = 893, BAND = 6, BEZEL = 14.5;

function Sparkle({ size = 16, id }: { size?: number; id: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d7bff" /><stop offset=".45" stopColor="#b25cff" /><stop offset=".75" stopColor="#ff4f9a" /><stop offset="1" stopColor="#ff9a3d" />
        </linearGradient>
      </defs>
      <path d="M10 2.5c.5 3.9 2.7 6.3 6.8 7.2-4.1.9-6.3 3.3-6.8 7.3-.5-4-2.7-6.4-6.8-7.3 4.1-.9 6.3-3.3 6.8-7.2Z" fill={`url(#${id})`} />
      <path d="M18.5 13.5c.25 1.9 1.3 3 3.2 3.4-1.9.4-2.95 1.5-3.2 3.4-.25-1.9-1.3-3-3.2-3.4 1.9-.4 2.95-1.5 3.2-3.4Z" fill={`url(#${id})`} />
    </svg>
  );
}

function OptIcon({ id }: { id: Opt }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true">
      {id === "proofread" && (<><circle cx="10.5" cy="10.5" r="6.5" {...p} /><path d="M15.3 15.3 20 20M7.8 10.6l1.9 1.9 3.6-3.8" {...p} /></>)}
      {id === "rewrite" && (<><path d="M19.5 9.5A7.8 7.8 0 0 0 5.2 7.4M4.5 14.5a7.8 7.8 0 0 0 14.3 2.1" {...p} /><path d="M5 3.8v3.9h3.9M19 20.2v-3.9h-3.9" {...p} /></>)}
      {id === "friendly" && (<><circle cx="12" cy="12" r="8.5" {...p} /><path d="M8.4 13.8c.9 1.4 2.1 2.1 3.6 2.1s2.7-.7 3.6-2.1" {...p} /><circle cx="9.2" cy="9.8" r=".6" fill="currentColor" stroke="currentColor" strokeWidth="1.2" /><circle cx="14.8" cy="9.8" r=".6" fill="currentColor" stroke="currentColor" strokeWidth="1.2" /></>)}
      {id === "concise" && (<path d="M4 6.5h16M4 11h11M4 15.5h7M4 20h4" {...p} />)}
    </svg>
  );
}

function StatusIcons() {
  return (
    <span className="flex items-center gap-[5px]" aria-hidden="true">
      <svg width="17" height="11" viewBox="0 0 17 11">{[0, 1, 2, 3].map((k) => <rect key={k} x={k * 4.4} y={8 - k * 2.4} width="3" height={3 + k * 2.4} rx=".8" fill="#1d1d1f" />)}</svg>
      <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 10.2 5.4 8a3 3 0 0 1 4.2 0Z" fill="#1d1d1f" /><path d="M3.3 5.9a6 6 0 0 1 8.4 0l-1.2 1.2a4.3 4.3 0 0 0-6 0ZM1.1 3.7a9.1 9.1 0 0 1 12.8 0l-1.1 1.2a7.5 7.5 0 0 0-10.6 0Z" fill="#1d1d1f" /></svg>
      <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.4" fill="none" stroke="rgba(29,29,31,.4)" /><rect x="2" y="2" width="16" height="8" rx="2" fill="#1d1d1f" /><path d="M23 4v4c.8-.3 1.3-1.1 1.3-2S23.8 4.3 23 4Z" fill="rgba(29,29,31,.45)" /></svg>
    </span>
  );
}

/**
 * Invoking an on-device writing assistant. Press and hold anywhere on the
 * screen (or press Ask, or Cmd/Ctrl+K) and a flowing band of light ripples out
 * from your finger and runs around the edge of the display, while Writing Tools
 * springs up. Slide onto an option and let go, or tap one: the draft shimmers and
 * is rewritten word by word. Releasing or Escape lets the glow ebb away.
 */
export interface IntelligenceGlowProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Plays interface sounds that follow what happens on screen. They follow the visitor's sound switch (off until switched on on this site). */
  enableSound?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function IntelligenceGlow({ autoplay = false, enableSound = true, className = "" }: IntelligenceGlowProps) {
  const uid = useId().replace(/:/g, "");
  const [text, setText] = useState(ORIGINAL);
  const [version, setVersion] = useState(0);
  const [panel, setPanel] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [hot, setHot] = useState<Opt | null>(null);
  const [busyOpt, setBusyOpt] = useState<Opt | null>(null);
  const [live, setLive] = useState("");
  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const askRef = useRef<HTMLButtonElement>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);
  // sounds: the visitor's own actions use play, the ghost finger uses play.auto
  const play = useProSound(enableSound);
  const playRef = useRef(play);
  useLayoutEffect(() => { playRef.current = play; });
  const lastHotSfx = useRef(0);
  const sfx = useCallback((name: ProSoundName, volume?: number) => {
    if (typeof document !== "undefined" && document.hidden) return;
    const p = playRef.current;
    if (touched.current) p(name, volume); else p.auto(name, volume);
  }, []);
  const timers = useRef<number[]>([]);
  const st = useRef({ holding: false, sticky: false, thinking: false, panel: false, mode: "idle" as Mode, hot: null as Opt | null, holdTimer: 0, downAt: 0, pointer: -1 });
  // glow engine state (read by the rAF loop)
  const glow = useRef({ int: 0, target: 0, ang: 0, rip: [] as { x: number; y: number; t: number }[], rev: null as null | { x: number; y: number; t: number }, bloom: null as null | { x: number; y: number }, bloomA: 0, W: 393, H: 852 });
  const shimmer = useMotionValue(130);
  const shimmerPos = useTransform(shimmer, (v) => `${v}% 0`);
  const fx = useMotionValue(0), fy = useMotionValue(0), fo = useMotionValue(0), fs = useMotionValue(1);

  const later = (fn: () => void, ms: number) => { const id = window.setTimeout(fn, ms); timers.current.push(id); return id; };
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  const syncGlow = useCallback(() => {
    const s = st.current, g = glow.current;
    g.target = s.thinking ? 1.2 : s.holding || s.sticky ? 1 : 0;
  }, []);

  const openPanel = useCallback((focusFirst: boolean) => {
    if (!st.current.panel) sfx("glass-open", 0.6);
    st.current.panel = true;
    setPanel(true);
    setLive("Writing Tools open");
    if (focusFirst) later(() => optRefs.current[0]?.focus(), 60);
  }, [sfx]);
  const closePanel = useCallback(() => {
    st.current.panel = false; st.current.hot = null;
    setPanel(false); setHot(null);
  }, []);

  const invoke = useCallback((x: number, y: number) => {
    const g = glow.current;
    g.rip.push({ x, y, t: 0 });
    if (g.rip.length > 3) g.rip.shift();
    if (g.int < 0.35) g.rev = { x, y, t: 0 };
  }, []);

  const choose = useCallback((opt: Opt) => {
    const s = st.current;
    if (s.mode !== "idle") return;
    s.mode = "thinking"; s.thinking = true; s.hot = null; s.holding = false;
    setMode("thinking"); setBusyOpt(opt); setHot(null);
    setLive(`${OPTS.find((o) => o.id === opt)!.label}: rewriting your draft`);
    syncGlow();
    sfx("scan-sweep", 0.55); // the shimmer starts sweeping across the draft
    shimmer.set(130);
    animate(shimmer, -30, { duration: 1.15, ease: [0.45, 0, 0.3, 1] });
    later(() => {
      const words = PRESETS[opt].split(" ").length;
      s.mode = "writing"; s.thinking = false; s.sticky = true;
      setMode("writing"); setText(PRESETS[opt]); setVersion((v) => v + 1); setBusyOpt(null);
      closePanel();
      syncGlow();
      sfx("sparkle", 0.45); // the new words start to appear
      later(() => {
        s.mode = "idle"; s.sticky = false;
        sfx("glass-chime", 0.5); // the rewrite has landed
        setMode("idle");
        setLive(`Draft rewritten: ${OPTS.find((o) => o.id === opt)!.label}`);
        syncGlow();
      }, words * 32 + 380);
    }, 1200);
  }, [closePanel, shimmer, sfx, syncGlow]);

  const dismiss = useCallback(() => {
    const s = st.current;
    if (s.mode !== "idle") return;
    s.sticky = false; s.holding = false;
    clearTimeout(s.holdTimer);
    if (s.panel) { sfx("glass-close", 0.5); closePanel(); setLive("Writing Tools closed"); }
    syncGlow();
  }, [closePanel, sfx, syncGlow]);

  const askToggle = useCallback((viaKeyboard: boolean) => {
    const s = st.current, el = askRef.current, sc = screenRef.current;
    if (s.mode !== "idle") return;
    if (s.panel) { dismiss(); return; }
    if (el && sc) { const k = sc.getBoundingClientRect().width / sc.offsetWidth || 1; const a = el.getBoundingClientRect(), r = sc.getBoundingClientRect(); invoke((a.left + a.width / 2 - r.left) / k, (a.top + a.height / 2 - r.top) / k); }
    s.sticky = true; syncGlow();
    sfx("glass-tap", 0.5);
    openPanel(viaKeyboard);
  }, [dismiss, invoke, openPanel, sfx, syncGlow]);

  // which option is under a screen point (for slide-to-select while holding)
  const optAt = (cx: number, cy: number): Opt | null => {
    if (!st.current.panel) return null;
    for (let i = 0; i < OPTS.length; i++) {
      const el = optRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return OPTS[i].id;
    }
    return null;
  };
  const setHotRef = (o: Opt | null) => {
    if (st.current.hot === o) return;
    st.current.hot = o; setHot(o);
    // a small detent as the finger slides onto an option, at most about 12 a second
    if (o) { const t = performance.now(); if (t - lastHotSfx.current > 80) { lastHotSfx.current = t; sfx("relay-click", 0.25); } }
  };

  // ---- press and hold (shared by real pointer and the autoplay finger) ----
  const pressAt = useCallback((x: number, y: number) => {
    const s = st.current;
    if (s.mode !== "idle") return;
    s.holding = true; s.downAt = performance.now();
    sfx("glass-tap", 0.5); // finger down, light ripples out
    invoke(x, y);
    glow.current.bloom = { x, y };
    syncGlow();
    clearTimeout(s.holdTimer);
    if (!s.panel) s.holdTimer = window.setTimeout(() => { if (st.current.holding) openPanel(false); }, 300);
  }, [invoke, openPanel, sfx, syncGlow]);
  const releaseAt = useCallback((clientX: number, clientY: number) => {
    const s = st.current;
    clearTimeout(s.holdTimer);
    if (!s.holding) return;
    s.holding = false;
    glow.current.bloom = null;
    const o = optAt(clientX, clientY);
    if (o) { choose(o); return; }
    const quick = performance.now() - s.downAt < 260;
    if (quick && s.panel) { s.sticky = false; sfx("glass-close", 0.5); closePanel(); setLive("Writing Tools closed"); }
    syncGlow();
  }, [choose, closePanel, sfx, syncGlow]);

  const local = (e: { clientX: number; clientY: number }) => {
    const sc = screenRef.current!, r = sc.getBoundingClientRect(), k = r.width / sc.offsetWidth || 1;
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    st.current.pointer = e.pointerId;
    const p = local(e);
    pressAt(p.x, p.y);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (st.current.pointer !== e.pointerId || !st.current.holding) return;
    const p = local(e);
    const g = glow.current;
    if (g.bloom) { g.bloom.x = p.x; g.bloom.y = p.y; }
    setHotRef(optAt(e.clientX, e.clientY));
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    if (st.current.pointer !== e.pointerId) return;
    st.current.pointer = -1;
    releaseAt(e.clientX, e.clientY);
  };

  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); askToggle(true); return; }
    if (e.key === "Escape") { e.preventDefault(); const back = st.current.panel; dismiss(); if (back) later(() => askRef.current?.focus(), 40); return; }
    if (st.current.panel && ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) {
      const i = optRefs.current.findIndex((el) => el === document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "ArrowDown" ? i + 2 : i - 2;
      optRefs.current[(n + 4) % 4]?.focus();
      sfx("relay-click", 0.25);
    }
  };

  // ---- the glow renderer: one rAF loop, canvas at CSS resolution (the light is soft, so no need for more) ----
  useEffect(() => {
    const sc = screenRef.current!, cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const mk = () => document.createElement("canvas");
    const layer = mk(), maskWide = mk(), maskNarrow = mk(), maskCore = mk(), mask = mk(), ring = mk(), wash = mk();
    const lctx = layer.getContext("2d")!, kctx = mask.getContext("2d")!, rctx = ring.getContext("2d")!, wctx = wash.getContext("2d")!;
    const g = glow.current;
    const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
    };
    // inner-edge falloff masks, baked once per size: an inset shadow of the screen outline
    const bake = (cnv: HTMLCanvasElement, blur: number, inset: number, a: number) => {
      const c = cnv.getContext("2d")!;
      c.clearRect(0, 0, g.W, g.H);
      c.save();
      rr(c, 0, 0, g.W, g.H, SCREEN_R); c.clip();
      c.shadowColor = `rgba(0,0,0,${a})`; c.shadowBlur = blur;
      c.beginPath();
      c.rect(-400, -400, g.W + 800, g.H + 800);
      // inner hole (counter-clockwise via evenodd)
      c.moveTo(inset + SCREEN_R, inset); c.arcTo(g.W - inset, inset, g.W - inset, g.H - inset, SCREEN_R - inset); c.arcTo(g.W - inset, g.H - inset, inset, g.H - inset, SCREEN_R - inset); c.arcTo(inset, g.H - inset, inset, inset, SCREEN_R - inset); c.arcTo(inset, inset, g.W - inset, inset, SCREEN_R - inset); c.closePath();
      c.fillStyle = "#000";
      c.fill("evenodd");
      c.restore();
    };
    const size = () => {
      if (sc.offsetWidth < 2 || sc.offsetHeight < 2) return;
      g.W = sc.offsetWidth; g.H = sc.offsetHeight;
      for (const c of [cv, layer, maskWide, maskNarrow, maskCore, mask]) { c.width = g.W; c.height = g.H; }
      // the colour fields are smooth, so they are painted at low resolution and scaled up for free
      wash.width = Math.ceil(g.W / 3); wash.height = Math.ceil(g.H / 3); wctx.setTransform(1 / 3, 0, 0, 1 / 3, 0, 0);
      ring.width = Math.ceil(g.W / 2); ring.height = Math.ceil(g.H / 2); rctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
      cv.style.width = `${g.W}px`; cv.style.height = `${g.H}px`;
      bake(maskWide, 54, 1, 1);
      bake(maskNarrow, 15, 1, 1);
      bake(maskCore, 4, 1, 1);
      // fold the narrow band (twice, for a saturated core) into the core mask so each frame needs one draw
      const cc = maskCore.getContext("2d")!;
      cc.drawImage(maskNarrow, 0, 0); cc.drawImage(maskNarrow, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(sc);

    let raf = 0, prev = performance.now(), blank = false;
    const conic = (c: CanvasRenderingContext2D, a: number, cx: number, cy: number, cols: string[]) => {
      const gr = c.createConicGradient(a, cx, cy);
      cols.forEach((col, i) => gr.addColorStop(i / (cols.length - 1), col));
      return gr;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.033, (now - prev) / 1000);
      prev = now;
      const W = g.W, H = g.H, diag = Math.hypot(W, H);
      // intensity: rise quickly, ebb slowly
      const k = g.target > g.int ? 7 : 1.7;
      g.int += (g.target - g.int) * (1 - Math.exp(-dt * k));
      if (g.target === 0 && g.int < 0.003) g.int = 0;
      g.ang += dt * (0.7 + Math.max(0, g.int - 1) * 6);
      for (const r of g.rip) r.t += dt;
      g.rip = g.rip.filter((r) => r.t < 1.1);
      if (g.rev) { g.rev.t += dt; if (g.rev.t > 1.2) g.rev = null; }
      g.bloomA += ((g.bloom ? 1 : 0) - g.bloomA) * (1 - Math.exp(-dt * (g.bloom ? 10 : 4)));

      if (g.int === 0 && g.rip.length === 0 && g.bloomA < 0.01) {
        if (!blank) { ctx.clearRect(0, 0, W, H); blank = true; }
        return;
      }
      blank = false;
      const breathe = 0.82 + 0.18 * Math.sin(now / 520);
      const I = Math.min(1.2, g.int);

      // 1) edge band: two counter-rotating conic washes, cut to the inner edge
      kctx.globalCompositeOperation = "source-over";
      kctx.clearRect(0, 0, W, H);
      kctx.globalAlpha = 1; kctx.drawImage(maskCore, 0, 0);
      // the wide part of the band ebbs first, so the light retreats into the edge
      kctx.globalAlpha = Math.min(1, Math.max(0, (I - 0.15) / 0.85)) * breathe; kctx.drawImage(maskWide, 0, 0);
      kctx.globalAlpha = 1;
      if (g.rev) {
        const e = 1 - Math.pow(1 - Math.min(1, g.rev.t / 1.0), 3);
        const R = 40 + e * diag;
        const gr = kctx.createRadialGradient(g.rev.x, g.rev.y, 0, g.rev.x, g.rev.y, R);
        gr.addColorStop(0, "#000"); gr.addColorStop(Math.max(0, 1 - 120 / R), "#000"); gr.addColorStop(1, "rgba(0,0,0,0)");
        kctx.globalCompositeOperation = "destination-in";
        kctx.fillStyle = gr; kctx.fillRect(0, 0, W, H);
        kctx.globalCompositeOperation = "source-over";
      }
      wctx.globalAlpha = 1;
      wctx.fillStyle = conic(wctx, g.ang, W / 2, H / 2, HUES); wctx.fillRect(0, 0, W, H);
      wctx.globalAlpha = 0.6;
      wctx.fillStyle = conic(wctx, -g.ang * 1.37 + 2, W * 0.5, H * 0.58, SOFT); wctx.fillRect(0, 0, W, H);
      lctx.globalCompositeOperation = "source-over";
      lctx.clearRect(0, 0, W, H);
      lctx.drawImage(wash, 0, 0, W, H);
      lctx.globalCompositeOperation = "destination-in";
      lctx.drawImage(mask, 0, 0);

      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = Math.min(1, I);
      ctx.drawImage(layer, 0, 0);

      // 2) ripple wave(s) from the finger, plus a soft bloom under it while held
      if (g.rip.length || g.bloomA > 0.01) {
        rctx.globalCompositeOperation = "source-over";
        rctx.clearRect(0, 0, W, H);
        for (const r of g.rip) {
          const p = Math.min(1, r.t / 1.05), e = 1 - Math.pow(1 - p, 2.4);
          const R = 10 + e * diag * 0.95, w = 18 + e * 70;
          const a = Math.pow(1 - p, 1.3) * 0.9;
          const gr = rctx.createRadialGradient(r.x, r.y, Math.max(0, R - w), r.x, r.y, R + w * 0.5);
          gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.62, `rgba(0,0,0,${a})`); gr.addColorStop(0.72, `rgba(0,0,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)");
          rctx.fillStyle = gr; rctx.fillRect(0, 0, W, H);
        }
        if (g.bloom || g.bloomA > 0.01) {
          const b = g.bloom ?? g.rip[g.rip.length - 1] ?? { x: W / 2, y: H / 2 };
          const R = 70 + 8 * Math.sin(now / 300);
          const gr = rctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, R);
          gr.addColorStop(0, `rgba(0,0,0,${0.5 * g.bloomA})`); gr.addColorStop(1, "rgba(0,0,0,0)");
          rctx.fillStyle = gr; rctx.fillRect(b.x - R, b.y - R, R * 2, R * 2);
        }
        rctx.globalCompositeOperation = "source-in";
        rctx.fillStyle = conic(rctx, -g.ang * 2 + 1, W / 2, H * 0.45, HUES);
        rctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.drawImage(ring, 0, 0, W, H);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  // ---- autoplay: a virtual finger presses, slides to an option, lets go; loops through the options ----
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    const ids: number[] = [];
    const wait = (ms: number) => new Promise<void>((res) => { ids.push(window.setTimeout(res, ms)); });
    const ok = () => alive && !touched.current;
    const run = async () => {
      let k = 0;
      await wait(900);
      while (ok()) {
        const sc = screenRef.current;
        if (!sc) return;
        const opt = LOOP[k % LOOP.length];
        const W = sc.offsetWidth, H = sc.offsetHeight;
        const px = W * 0.52, py = H * 0.47;
        fx.set(px); fy.set(py); fs.set(1.35);
        animate(fo, 1, { duration: 0.25 });
        animate(fs, 1, { type: "spring", stiffness: 500, damping: 26 });
        await wait(260);
        if (!ok()) break;
        pressAt(px, py);
        await wait(1000);
        if (!ok()) break;
        const i = OPTS.findIndex((o) => o.id === opt);
        const el = optRefs.current[i];
        if (!el) break;
        const r = el.getBoundingClientRect(), sr = sc.getBoundingClientRect(), z = sr.width / sc.offsetWidth || 1;
        const tx = (r.left + r.width / 2 - sr.left) / z, ty = (r.top + r.height / 2 - sr.top) / z;
        animate(fx, tx, { type: "spring", stiffness: 120, damping: 20 });
        animate(fy, ty, { type: "spring", stiffness: 120, damping: 20 });
        const g = glow.current;
        const unsub = fy.on("change", () => { if (g.bloom) { g.bloom.x = fx.get(); g.bloom.y = fy.get(); } const rr = sc.getBoundingClientRect(); setHotRef(optAt(rr.left + fx.get() * z, rr.top + fy.get() * z)); });
        await wait(800);
        unsub();
        if (!ok()) break;
        const rr = sc.getBoundingClientRect();
        releaseAt(rr.left + fx.get() * z, rr.top + fy.get() * z);
        animate(fo, 0, { duration: 0.35 });
        animate(fs, 1.25, { duration: 0.35 });
        await wait(4600);
        if (!ok()) break;
        k++;
        // put the original draft back before the next pass
        sfx("paper-flip", 0.35); // the draft is put back
        setText(ORIGINAL); setVersion((v) => v + 1);
        await wait(1500);
      }
      fo.set(0);
    };
    run();
    return () => { alive = false; ids.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  useEffect(() => {
    const s = st.current;
    return () => clearTimeout(s.holdTimer);
  }, []);

  // the phone is laid out at its real size in points and scaled to fit the column
  const fitRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = fitRef.current, ph = phoneRef.current;
    if (!host || !ph) return;
    const fit = () => {
      const k = host.clientWidth / BODY_W;
      ph.style.transform = `scale(${k})`;
      host.style.height = `${BODY_H * k}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const words = text.split(" ");
  const fingerT = useTransform([fx, fy, fs] as never, ([x, y, s]: number[]) => `translate(${x - 28}px, ${y - 28}px) scale(${s})`);

  return (
    <div className={`flex w-full max-w-[300px] flex-col items-center ${className}`} onKeyDown={onKey} onPointerDownCapture={() => (touched.current = true)}>
      <div ref={fitRef} className="relative w-full" style={{ height: BODY_H * (300 / BODY_W) }}>
      <div ref={phoneRef} className="absolute left-0 top-0" style={{ width: BODY_W, height: BODY_H, transformOrigin: "0 0" }}>
      {/* side buttons: action button and volume on the left, side button and Camera Control on the right */}
      {[[176, 34], [246, 62], [324, 62]].map(([y, h]) => (
        <span key={y} aria-hidden="true" className="absolute left-[-3.5px] w-[5px] rounded-l-[2.5px]" style={{ top: y, height: h, background: "linear-gradient(90deg,#8e8e94,#d4d4d8 55%,#a2a2a8)" }} />
      ))}
      <span aria-hidden="true" className="absolute right-[-3.5px] w-[5px] rounded-r-[2.5px]" style={{ top: 262, height: 100, background: "linear-gradient(270deg,#8e8e94,#d4d4d8 55%,#a2a2a8)" }} />
      <span aria-hidden="true" className="absolute right-[-1px] w-[2.5px] rounded-r-[1.5px]" style={{ top: 556, height: 74, background: "linear-gradient(270deg,#5a5a60,#9a9aa0)" }} />
      {/* titanium band, then black bezel, then the display */}
      <div className="absolute inset-0 shadow-[0_40px_80px_-40px_rgba(0,0,0,.55),0_14px_28px_-16px_rgba(0,0,0,.28)]" style={{ borderRadius: SCREEN_R + BEZEL + BAND, padding: BAND, background: "linear-gradient(145deg,#ececef 0%,#a7a7ad 22%,#dadade 45%,#8e8e94 70%,#dcdce0 100%)" }}>
        <div className="h-full w-full bg-[#0b0b0c] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.08)]" style={{ borderRadius: SCREEN_R + BEZEL, padding: BEZEL }}>
          <div
            ref={screenRef}
            tabIndex={0}
            role="group"
            aria-label="Email draft. Press and hold the screen, or press Command K, to open Writing Tools."
            className="relative h-full w-full touch-none select-none overflow-hidden bg-[#f2f2f7] outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[4px] focus-visible:outline-[#0071e3]"
            style={{ borderRadius: SCREEN_R, WebkitTapHighlightColor: "transparent" }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* status bar + Dynamic Island (126 x 37 pt, 11 pt from the top) */}
            <div className="relative flex h-[54px] items-center justify-between pl-[50px] pr-[34px] pt-[6px]">
              <span className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] tabular-nums">9:41</span>
              <span style={{ transform: "scale(1.18)", transformOrigin: "100% 50%" }}><StatusIcons /></span>
              <div className="absolute left-1/2 top-[11px] h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true">
                <span className="absolute right-[13px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 rounded-full bg-[#1a1c2a] shadow-[inset_0_0_0_2px_#23263a]" />
              </div>
            </div>
            {/* compose sheet */}
            <div className="absolute inset-x-0 bottom-0 top-[62px] rounded-t-[12px] bg-white shadow-[0_-1px_0_rgba(0,0,0,.04)]">
              <div className="flex items-center justify-between px-5 pt-4">
                <span className="text-[17px] text-[#0071e3]">Cancel</span>
                <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#0071e3]" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /></svg>
                </span>
              </div>
              <h3 className="px-5 pb-3 pt-2 text-[30px] font-bold leading-tight tracking-[-0.022em] text-[#1d1d1f]">Dinner on Friday</h3>
              <div className="mx-5 flex items-center gap-1.5 border-b border-black/[.08] py-[11px] text-[17px]"><span className="text-[#6e6e73]">To:</span><span className="text-[#0071e3]">Maya Chen</span></div>
              <div className="mx-5 border-b border-black/[.08] py-[11px] text-[17px] text-[#6e6e73]">Cc/Bcc, From: me@icloud.com</div>
              <div className="mx-5 flex gap-1.5 border-b border-black/[.08] py-[11px] text-[17px]"><span className="text-[#6e6e73]">Subject:</span><span className="text-[#1d1d1f]">Dinner on Friday</span></div>
              {/* body: shimmer while thinking, then the new text fades in word by word */}
              <div className="grid px-5 pt-4 text-[17px] leading-[1.45] tracking-[-0.005em]" aria-live="off">
                <AnimatePresence initial={false}>
                  <motion.p
                    key={version}
                    className="col-start-1 row-start-1"
                    exit={{ opacity: 0, transition: { duration: 0.22 } }}
                    style={
                      mode === "thinking"
                        ? { backgroundImage: "linear-gradient(100deg,#1d1d1f 0%,#1d1d1f 38%,#3d7bff 44%,#b25cff 48%,#ff4f9a 52%,#ff9a3d 56%,#1d1d1f 62%,#1d1d1f 100%)", backgroundSize: "300% 100%", backgroundPosition: shimmerPos, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
                        : { color: "#1d1d1f" }
                    }
                  >
                    {version === 0 || mode === "thinking"
                      ? text
                      : words.map((w, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 5, color: "#9b6bff" }}
                            animate={{ opacity: 1, y: 0, color: "#1d1d1f" }}
                            transition={{ delay: 0.12 + i * 0.032, opacity: { duration: 0.35, delay: 0.12 + i * 0.032 }, color: { duration: 0.7, delay: 0.12 + i * 0.032 }, y: { type: "spring", stiffness: 420, damping: 26, delay: 0.12 + i * 0.032 } }}
                            className="inline-block whitespace-pre"
                          >
                            {w + (i < words.length - 1 ? " " : "")}
                          </motion.span>
                        ))}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="px-5 pt-4 text-[17px] text-[#6e6e73]">Sent from my iPhone</p>
            </div>

            {/* the light */}
            <canvas ref={canvasRef} className="pointer-events-none absolute left-0 top-0 z-20" aria-hidden="true" />

            {/* Ask button */}
            <motion.button
              ref={askRef}
              type="button"
              aria-label="Ask: open Writing Tools"
              aria-expanded={panel}
              onClick={(e) => { touched.current = true; askToggle(e.detail === 0); }}
              className="absolute bottom-[34px] left-1/2 z-30 flex h-[48px] items-center gap-2 rounded-full bg-white/90 pl-4 pr-5 text-[17px] font-semibold text-[#1d1d1f] shadow-[0_0_0_.5px_rgba(0,0,0,.12),0_8px_24px_-8px_rgba(60,40,140,.35)] outline-none backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
              style={{ x: "-50%" }}
              animate={{ opacity: panel ? 0 : 1, scale: panel ? 0.85 : 1, y: panel ? 10 : 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              tabIndex={panel ? -1 : 0}
            >
              <Sparkle id={`${uid}ask`} size={20} />
              Ask
            </motion.button>

            {/* Writing Tools panel */}
            <AnimatePresence>
              {panel && (
                <motion.div
                  key="tools"
                  role="menu"
                  aria-label="Writing Tools"
                  className="absolute inset-x-[12px] bottom-[24px] z-30 rounded-[30px] bg-white/[.97] p-3 shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_24px_48px_-16px_rgba(40,30,110,.45),0_4px_10px_-4px_rgba(0,0,0,.12)]"
                  initial={{ opacity: 0, y: 60, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.94, transition: { type: "spring", stiffness: 380, damping: 34 } }}
                  transition={{ type: "spring", stiffness: 340, damping: 24, mass: 0.9 }}
                  style={{ originY: 1 }}
                >
                  <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
                    <Sparkle id={`${uid}hd`} size={18} />
                    <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">Writing Tools</span>
                    <span className="ml-auto text-[13px] text-[#6e6e73]">{busyOpt ? "Working" : "Esc to close"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {OPTS.map((o, i) => {
                      const on = hot === o.id || busyOpt === o.id;
                      return (
                        <motion.button
                          key={o.id}
                          ref={(el) => { optRefs.current[i] = el; }}
                          type="button"
                          role="menuitem"
                          onClick={() => { touched.current = true; choose(o.id); }}
                          disabled={mode !== "idle" && busyOpt !== o.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, scale: on ? 1.03 : 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 28, delay: 0.04 + i * 0.035 }}
                          className={`relative flex h-[56px] items-center gap-2.5 overflow-hidden rounded-[18px] px-4 text-left text-[16px] font-semibold tracking-[-0.01em] outline-none transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] ${on ? "bg-[#ece6ff] text-[#3b1f99]" : "bg-[#f2f2f7] text-[#1d1d1f] hover:bg-[#e9e9ef]"}`}
                        >
                          <OptIcon id={o.id} />
                          {o.label}
                          {busyOpt === o.id && (
                            <motion.span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-y-0 w-1/2"
                              style={{ background: "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.75),rgba(255,255,255,0))" }}
                              initial={{ x: "-100%" }}
                              animate={{ x: "260%" }}
                              transition={{ duration: 0.9, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* autoplay finger */}
            <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-40 h-[56px] w-[56px] rounded-full bg-[rgba(40,40,50,.16)] shadow-[0_0_0_1.5px_rgba(255,255,255,.7),0_4px_14px_rgba(0,0,0,.18)]" style={{ transform: fingerT, opacity: fo }} />

            {/* home indicator */}
            <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-30 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-[#1d1d1f]/80" aria-hidden="true" />
          </div>
        </div>
      </div>
      </div>
      </div>
      <p className="mt-4 text-center text-[12px] text-[#6e6e73]">Press and hold the screen, tap Ask, or press Cmd K.</p>
      <div className="sr-only" aria-live="polite">{live}</div>
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

--- lib/ui-sounds-pro.ts ---

```ts
/**
 * The Nexus UI Pro sound pack: 39 more interface sounds in six sets (Glass, Paper and wood,
 * Arcade, Studio, Devices, Gallery), made the same way as the free ones, from oscillators and filtered noise with the
 * Web Audio API. No audio files. It builds on `@/lib/ui-sounds`, which installs with it, and follows
 * the same on/off switch.
 *
 *   import { playProSound } from "@/lib/ui-sounds-pro";
 *   <button onClick={() => playProSound("glass-chime")}>Done</button>
 *
 * In a component with an `enableSound` option:
 *
 *   const play = useProSound(enableSound);
 *   play("coin");
 */

import * as React from "react";
import { audioAwake, hiss, playDef, tone, useAutoplaySoundAllowed, type SoundDef } from "@/lib/ui-sounds";

export type ProSoundCategory = "Glass" | "Paper and wood" | "Arcade" | "Studio" | "Devices" | "Gallery";
type ProDef = SoundDef & { category: ProSoundCategory };

export const PRO_SOUNDS = {
  // Glass: small, bright, with a ring that fades.
  "glass-tap": { category: "Glass", label: "Glass tap", play: (c, o) => { tone(c, o, { freq: 2400, to: 2200, decay: 0.06, gain: 0.2 }); tone(c, o, { freq: 3600, decay: 0.04, gain: 0.08 }); hiss(c, o, { freq: 6500, decay: 0.012, gain: 0.08, filter: "highpass" }); } },
  "glass-chime": { category: "Glass", label: "Glass chime", play: (c, o) => [1, 2.32, 4.25].forEach((m, i) => tone(c, o, { freq: 1320 * m, decay: 1.0 / (i + 1), gain: 0.16 / (i + 1) })) },
  "glass-ping": { category: "Glass", label: "Glass ping", play: (c, o) => { tone(c, o, { freq: 2093, decay: 1.1, gain: 0.14 }); tone(c, o, { freq: 3136, decay: 0.6, gain: 0.06 }); } },
  "glass-open": { category: "Glass", label: "Glass open", play: (c, o) => { tone(c, o, { freq: 1568, decay: 0.16, gain: 0.14 }); tone(c, o, { at: 0.07, freq: 2093, decay: 0.2, gain: 0.14 }); tone(c, o, { at: 0.14, freq: 2637, decay: 0.45, gain: 0.12 }); hiss(c, o, { at: 0.05, attack: 0.06, decay: 0.16, freq: 5000, to: 9000, gain: 0.04, filter: "highpass" }); } },
  "glass-close": { category: "Glass", label: "Glass close", play: (c, o) => { tone(c, o, { freq: 2637, decay: 0.14, gain: 0.12 }); tone(c, o, { at: 0.07, freq: 2093, decay: 0.16, gain: 0.12 }); tone(c, o, { at: 0.14, freq: 1568, decay: 0.4, gain: 0.12 }); } },
  "glass-clink": { category: "Glass", label: "Clink", play: (c, o) => { tone(c, o, { freq: 3136, decay: 0.28, gain: 0.12 }); tone(c, o, { at: 0.018, freq: 3520, decay: 0.22, gain: 0.1 }); hiss(c, o, { freq: 7000, decay: 0.01, gain: 0.1, filter: "highpass" }); } },

  // Paper and wood: dry, close and physical.
  "paper-flip": { category: "Paper and wood", label: "Page flip", play: (c, o) => { hiss(c, o, { attack: 0.012, decay: 0.09, freq: 3600, to: 1500, gain: 0.16, q: 0.9 }); hiss(c, o, { at: 0.075, attack: 0.008, decay: 0.05, freq: 2600, to: 1800, gain: 0.08, q: 0.9 }); } },
  "paper-crumple": { category: "Paper and wood", label: "Crumple", play: (c, o) => [[0, 3200], [0.028, 4400], [0.05, 2600], [0.085, 5000], [0.115, 3000], [0.15, 4200], [0.19, 2800]].forEach(([at, f], i) => hiss(c, o, { at, attack: 0.002, decay: 0.03 + (i % 3) * 0.01, freq: f, gain: 0.22, q: 2.4 })) },
  "paper-tear": { category: "Paper and wood", label: "Tear", play: (c, o) => { hiss(c, o, { attack: 0.02, decay: 0.24, freq: 1800, to: 5200, gain: 0.13, filter: "highpass", q: 0.7 }); [0.02, 0.06, 0.1, 0.15, 0.2].forEach((at) => hiss(c, o, { at, attack: 0.002, decay: 0.02, freq: 4200, gain: 0.08, q: 3 })); } },
  "wood-tap": { category: "Paper and wood", label: "Wood tap", play: (c, o) => { tone(c, o, { freq: 520, to: 300, decay: 0.07, gain: 0.32, type: "triangle" }); hiss(c, o, { freq: 1200, decay: 0.02, gain: 0.14, q: 3 }); } },
  "wood-block": { category: "Paper and wood", label: "Wood block", play: (c, o) => { tone(c, o, { freq: 880, decay: 0.12, gain: 0.28, type: "triangle" }); tone(c, o, { freq: 1320, decay: 0.06, gain: 0.1 }); hiss(c, o, { freq: 2400, decay: 0.012, gain: 0.1, q: 2 }); } },
  "wood-drop": { category: "Paper and wood", label: "Wood drop", play: (c, o) => { tone(c, o, { freq: 220, to: 120, decay: 0.14, gain: 0.42 }); hiss(c, o, { freq: 700, decay: 0.06, gain: 0.16, filter: "lowpass" }); tone(c, o, { at: 0.15, freq: 240, to: 150, decay: 0.08, gain: 0.2 }); } },

  // Arcade: square waves and quick arpeggios.
  coin: { category: "Arcade", label: "Coin", play: (c, o) => { tone(c, o, { freq: 988, decay: 0.07, gain: 0.12, type: "square" }); tone(c, o, { at: 0.07, freq: 1319, decay: 0.3, gain: 0.12, type: "square" }); } },
  "power-up": { category: "Arcade", label: "Power up", play: (c, o) => [392, 523, 659, 784, 1047].forEach((f, i) => tone(c, o, { at: i * 0.05, freq: f, decay: 0.12, gain: 0.1, type: "square" })) },
  blip: { category: "Arcade", label: "Blip", play: (c, o) => tone(c, o, { freq: 660, decay: 0.05, gain: 0.12, type: "square" }) },
  laser: { category: "Arcade", label: "Laser", play: (c, o) => tone(c, o, { freq: 1800, to: 200, glide: 0.18, decay: 0.18, gain: 0.1, type: "square" }) },
  "level-up": { category: "Arcade", label: "Level up", play: (c, o) => { [523, 659, 784, 1047].forEach((f, i) => tone(c, o, { at: i * 0.09, freq: f, decay: 0.12, gain: 0.1, type: "triangle" })); tone(c, o, { at: 0.36, freq: 1319, decay: 0.5, gain: 0.1, type: "triangle" }); } },
  "game-over": { category: "Arcade", label: "Game over", play: (c, o) => { [392, 370, 349, 330].forEach((f, i) => tone(c, o, { at: i * 0.17, freq: f, decay: 0.16, gain: 0.1, type: "square" })); tone(c, o, { at: 0.7, freq: 165, decay: 0.55, gain: 0.12, type: "square" }); } },

  // Studio: bigger moments with a tail.
  riser: { category: "Studio", label: "Riser", play: (c, o) => { hiss(c, o, { attack: 0.5, decay: 0.12, freq: 300, to: 6000, gain: 0.14, q: 0.8 }); tone(c, o, { freq: 110, to: 440, glide: 0.6, attack: 0.5, decay: 0.15, gain: 0.07, type: "sawtooth" }); } },
  impact: { category: "Studio", label: "Impact", play: (c, o) => { tone(c, o, { freq: 70, to: 35, glide: 0.35, decay: 0.45, gain: 0.55 }); hiss(c, o, { freq: 500, decay: 0.25, gain: 0.25, filter: "lowpass" }); } },
  sparkle: { category: "Studio", label: "Sparkle", play: (c, o) => [[0, 4000], [0.04, 5200], [0.075, 6200], [0.12, 4800], [0.16, 6800]].forEach(([at, f]) => tone(c, o, { at, freq: f, decay: 0.16, gain: 0.08 })) },
  "confetti-pop": { category: "Studio", label: "Confetti pop", play: (c, o) => { hiss(c, o, { freq: 1200, decay: 0.09, gain: 0.26, filter: "highpass" }); tone(c, o, { freq: 220, to: 90, decay: 0.08, gain: 0.3 }); [0.06, 0.1, 0.15].forEach((at, i) => tone(c, o, { at, freq: 3600 + i * 700, decay: 0.12, gain: 0.04 })); } },
  fanfare: { category: "Studio", label: "Fanfare", play: (c, o) => [[0, [523, 659, 784]], [0.12, [587, 740, 880]], [0.24, [659, 784, 1047]]].forEach(([at, notes]) => (notes as number[]).forEach((f) => tone(c, o, { at: at as number, freq: f, decay: 0.5, gain: 0.07, type: "triangle" }))) },
  swell: { category: "Studio", label: "Swell", play: (c, o) => [196, 247, 294, 392].forEach((f) => tone(c, o, { freq: f, attack: 0.5, decay: 1.2, gain: 0.05 })) },

  // Devices: scanners, readers, relays and machines. Short, dry and a little electronic.
  "scan-sweep": { category: "Devices", label: "Scan sweep", play: (c, o) => { hiss(c, o, { attack: 0.06, decay: 0.3, freq: 600, to: 3800, gain: 0.1, q: 1.6 }); tone(c, o, { freq: 420, to: 1250, glide: 0.38, attack: 0.05, decay: 0.12, gain: 0.05, type: "triangle" }); } },
  "card-insert": { category: "Devices", label: "Card insert", play: (c, o) => { hiss(c, o, { attack: 0.02, decay: 0.13, freq: 1800, to: 500, gain: 0.14, q: 1.2 }); tone(c, o, { at: 0.12, freq: 150, to: 90, decay: 0.07, gain: 0.3 }); hiss(c, o, { at: 0.12, freq: 3200, decay: 0.012, gain: 0.16, filter: "highpass" }); } },
  "access-granted": { category: "Devices", label: "Access granted", play: (c, o) => { tone(c, o, { freq: 988, decay: 0.09, gain: 0.14, type: "triangle" }); tone(c, o, { at: 0.1, freq: 1480, decay: 0.26, gain: 0.14, type: "triangle" }); } },
  "access-denied": { category: "Devices", label: "Access denied", play: (c, o) => { tone(c, o, { freq: 196, decay: 0.13, gain: 0.15, type: "square" }); tone(c, o, { at: 0.16, freq: 165, decay: 0.24, gain: 0.15, type: "square" }); } },
  "relay-click": { category: "Devices", label: "Relay click", play: (c, o) => { hiss(c, o, { freq: 2800, decay: 0.008, gain: 0.3, filter: "highpass" }); tone(c, o, { freq: 1800, to: 700, decay: 0.02, gain: 0.12 }); tone(c, o, { at: 0.015, freq: 120, decay: 0.05, gain: 0.24 }); } },
  bloop: { category: "Devices", label: "Bloop", play: (c, o) => { tone(c, o, { freq: 300, to: 720, glide: 0.09, decay: 0.12, gain: 0.3 }); tone(c, o, { at: 0.05, freq: 640, to: 1200, glide: 0.05, decay: 0.06, gain: 0.1 }); } },
  crumble: { category: "Devices", label: "Crumble", play: (c, o) => { [[0, 2400], [0.03, 1900], [0.07, 2600], [0.1, 1500], [0.15, 2100], [0.19, 1200], [0.26, 1700], [0.31, 900]].forEach(([at, f]) => hiss(c, o, { at, attack: 0.002, decay: 0.035, freq: f, gain: 0.12, q: 2 })); tone(c, o, { freq: 95, to: 60, decay: 0.22, gain: 0.12 }); } },
  pour: { category: "Devices", label: "Pour", play: (c, o) => { hiss(c, o, { attack: 0.04, decay: 0.5, freq: 3000, to: 1600, gain: 0.09, q: 1.2 }); hiss(c, o, { at: 0.08, attack: 0.05, decay: 0.4, freq: 5200, gain: 0.05, filter: "highpass" }); } },

  // Gallery: a ring of photo cards. Light, papery and airy, with a soft glass edge. They are written to follow the
  // motion of the Ring Gallery: a tick for each card that passes, a thud when the ring settles, a whoosh that swells
  // and fades with the speed of the spin-in. None plays on hover.
  "ring-tick": { category: "Gallery", label: "Ring tick", play: (c, o) => { const j = 0.94 + Math.random() * 0.12; hiss(c, o, { freq: 3800 * j, decay: 0.013, gain: 0.36, q: 3.2 }); tone(c, o, { freq: 1300 * j, to: 920 * j, decay: 0.03, gain: 0.17, type: "triangle" }); } },
  "ring-settle": { category: "Gallery", label: "Ring settle", play: (c, o) => { tone(c, o, { freq: 150, to: 92, glide: 0.1, decay: 0.16, gain: 0.28 }); hiss(c, o, { freq: 700, decay: 0.06, gain: 0.1, filter: "lowpass" }); tone(c, o, { at: 0.01, freq: 2093, decay: 0.5, gain: 0.035 }); } },
  "ring-spool": { category: "Gallery", label: "Ring spool", length: 2.2, play: (c, o) => {
    // Two seconds shaped like the spin it goes with: slow, fastest in the middle, slow again. A band of air opens as
    // the ring picks up speed and closes as it slows, with a low whine that rises and falls the same way.
    const t0 = c.currentTime, T = 2, K = 64;
    const bell = (k: number) => Math.pow(Math.sin((Math.PI * k) / (K - 1)), 1.6);
    const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const air = c.createBufferSource();
    air.buffer = buf;
    air.loop = true;
    const band = c.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 260 * Math.pow(10, bell(k))), t0, T);
    const ag = c.createGain();
    ag.gain.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 0.0001 + 0.15 * bell(k)), t0, T);
    air.connect(band).connect(ag).connect(o);
    air.start(t0);
    air.stop(t0 + T + 0.05);
    const whine = c.createOscillator();
    whine.type = "triangle";
    whine.frequency.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 90 * Math.pow(3.8, bell(k))), t0, T);
    const wg = c.createGain();
    wg.gain.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 0.0001 + 0.06 * bell(k) * bell(k)), t0, T);
    whine.connect(wg).connect(o);
    whine.start(t0);
    whine.stop(t0 + T + 0.05);
  } },
  "ring-open": { category: "Gallery", label: "Entry open", play: (c, o) => { hiss(c, o, { attack: 0.12, decay: 0.22, freq: 500, to: 3200, gain: 0.1, q: 0.9 }); tone(c, o, { freq: 196, to: 130, glide: 0.14, attack: 0.01, decay: 0.28, gain: 0.2 }); tone(c, o, { at: 0.2, freq: 1568, decay: 0.5, gain: 0.07 }); tone(c, o, { at: 0.24, freq: 2349, decay: 0.55, gain: 0.05 }); } },
  "ring-close": { category: "Gallery", label: "Entry close", play: (c, o) => { tone(c, o, { freq: 2349, decay: 0.25, gain: 0.05 }); tone(c, o, { at: 0.06, freq: 1568, decay: 0.3, gain: 0.07 }); hiss(c, o, { at: 0.02, attack: 0.06, decay: 0.22, freq: 3200, to: 500, gain: 0.09, q: 0.9 }); tone(c, o, { at: 0.22, freq: 170, to: 110, glide: 0.1, decay: 0.22, gain: 0.18 }); } },
  "ring-next": { category: "Gallery", label: "Next entry", play: (c, o) => { hiss(c, o, { attack: 0.01, decay: 0.08, freq: 2200, to: 4200, gain: 0.18, q: 0.9 }); tone(c, o, { freq: 740, to: 988, glide: 0.07, decay: 0.09, gain: 0.13, type: "triangle" }); } },
  "ring-prev": { category: "Gallery", label: "Previous entry", play: (c, o) => { hiss(c, o, { attack: 0.01, decay: 0.08, freq: 4200, to: 2200, gain: 0.18, q: 0.9 }); tone(c, o, { freq: 988, to: 740, glide: 0.07, decay: 0.09, gain: 0.13, type: "triangle" }); } },
} satisfies Record<string, ProDef>;

export type ProSoundName = keyof typeof PRO_SOUNDS;

/** Play a Pro sound by name. volume is 0..1 on top of the master level. Silent while sounds are off unless `force`. */
export function playProSound(name: ProSoundName, volume = 1, force = false) {
  if (!(name in PRO_SOUNDS)) return;
  playDef(name, PRO_SOUNDS[name], volume, force);
}

/**
 * Like useSound in `@/lib/ui-sounds`, for the Pro sounds: silent when `enabled` is false.
 * `play.auto(...)` is for a component that plays itself (autoplay).
 */
export type ProSoundPlayer = {
  (name: ProSoundName, volume?: number): void;
  auto: (name: ProSoundName, volume?: number) => void;
};

export function useProSound(enabled = true): ProSoundPlayer {
  const auto = useAutoplaySoundAllowed();
  return React.useMemo(
    () =>
      Object.assign(
        (name: ProSoundName, volume = 1) => {
          if (enabled) playProSound(name, volume);
        },
        {
          auto: (name: ProSoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playProSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}
```
