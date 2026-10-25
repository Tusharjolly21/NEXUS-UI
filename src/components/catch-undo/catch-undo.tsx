"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

/* ------------------------------------------------------------------------------------------------
 * CatchUndo
 * An Undo that catches. Delete a file and the row comes loose, drops out of the list and time slows
 * as it falls into the dark. Hit Undo and a web shoots from the button: a twisted rope of silk fibres
 * that frays open into a hand as it flies, wraps the row, and stretches to slow it down gently before
 * reeling it back into its slot. Miss it and the row is simply gone.
 * ---------------------------------------------------------------------------------------------- */

export type CatchCue = "delete" | "slowmo" | "shoot" | "catch" | "reel" | "restored" | "missed";

export interface CatchUndoProps {
  height?: number;
  /** Start with the slow hand on: the web takes about two and a half times longer to open its hand. */
  slowHand?: boolean;
  /** Ghost cursor demo: catches one, misses the next. Stops when a real pointer moves in. */
  autoplay?: boolean;
  className?: string;
  /** Optional hook for a sound layer. */
  onCue?: (cue: CatchCue) => void;
}

type FileItem = { id: string; name: string; ext: string; tint: string; meta: string };
type V = { x: number; y: number };
type Phase = "idle" | "falling" | "flying" | "caught" | "reeling" | "settle" | "missed";

const FILES: FileItem[] = [
  { id: "deck", name: "Q4 pitch deck.key", ext: "KEY", tint: "#1f4ea8", meta: "18.2 MB · Edited 2h ago" },
  { id: "inv", name: "invoice-0423.pdf", ext: "PDF", tint: "#e23636", meta: "284 KB · Edited yesterday" },
  { id: "tower", name: "clocktower-final.blend", ext: "BLEND", tint: "#b3121f", meta: "46.9 MB · Edited 3 days ago" },
  { id: "img", name: "IMG_4021.HEIC", ext: "HEIC", tint: "#2f6fe0", meta: "3.1 MB · Edited last week" },
];

const TAU = Math.PI * 2;
const G = 900;
const TS_MIN = 0.09;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const clamp01 = (v: number) => clamp(v, 0, 1);
const smooth = (a: number, b: number, v: number) => {
  const u = clamp01((v - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const easeOutCubic = (u: number) => 1 - Math.pow(1 - u, 3);
const wrapA = (a: number) => a - TAU * Math.floor((a + Math.PI) / TAU);
const smoothE = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const rnd = (() => {
  let s = 1337;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
})();

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia?.(REDUCED_QUERY);
  mq?.addEventListener?.("change", cb);
  return () => mq?.removeEventListener?.("change", cb);
}
const getReduced = () => !!window.matchMedia?.(REDUCED_QUERY)?.matches;
const subscribeNone = () => () => {};
const getMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function CatchUndo({ height = 560, slowHand = false, autoplay = false, className, onCue }: CatchUndoProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const clockArcRef = useRef<SVGCircleElement>(null);
  const clockHandRef = useRef<SVGLineElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [slow, setSlow] = useState(slowHand);
  const slowRef = useRef(slow);
  useLayoutEffect(() => { slowRef.current = slow; });
  const slowBtnRef = useRef<HTMLButtonElement>(null);
  const cueRef = useRef(onCue);
  useLayoutEffect(() => { cueRef.current = onCue; });

  const [files, setFiles] = useState<FileItem[]>(FILES);
  const [fallingId, setFallingId] = useState<string | null>(null);
  const [landedId, setLandedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [toast, setToast] = useState<{ show: boolean; kind: "deleted" | "restoring" | "restored" | "gone"; name: string }>({
    show: false,
    kind: "deleted",
    name: "",
  });
  const [ghostHover, setGhostHover] = useState<string | null>(null);
  const [slot, setSlot] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
  const mac = useSyncExternalStore(subscribeNone, getMac, () => true);

  const engine = useRef<{ del: (id: string) => void; undo: () => void; restore: () => void } | null>(null);
  const filesRef = useRef(files);
  useLayoutEffect(() => { filesRef.current = files; });

  /* ------------------------------------------------------------------ engine ------------------ */
  useEffect(() => {
    const stage = stageRef.current;
    const bg = bgRef.current;
    const fx = fxRef.current;
    const card = cardRef.current;
    const rowsEl = rowsRef.current;
    if (!stage || !bg || !fx || !card || !rowsEl) return;
    const bctx = bg.getContext("2d");
    if (!bctx) return;
    const cue = (c: CatchCue) => cueRef.current?.(c);

    let W = 0;
    let H = 0;
    let dpr = 1;
    const fit = () => {
      W = stage.offsetWidth;
      H = stage.offsetHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const c of [bg, fx]) {
        const w = Math.max(1, Math.round(W * dpr));
        const h = Math.max(1, Math.round(H * dpr));
        if (c.width !== w) c.width = w;
        if (c.height !== h) c.height = h;
      }
    };
    const rel = (el: Element) => {
      const sr = stage.getBoundingClientRect();
      const k = sr.width / (stage.offsetWidth || 1) || 1;
      const r = el.getBoundingClientRect();
      return { x: (r.left - sr.left) / k, y: (r.top - sr.top) / k, w: r.width / k, h: r.height / k };
    };

    /* ---- sprites ---- */
    const glint = document.createElement("canvas");
    glint.width = glint.height = 64;
    {
      const g = glint.getContext("2d")!;
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.12, "rgba(235,245,255,0.9)");
      gr.addColorStop(0.35, "rgba(170,205,255,0.28)");
      gr.addColorStop(1, "rgba(120,170,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
    }
    const bokehSprite = document.createElement("canvas");
    bokehSprite.width = bokehSprite.height = 64;
    {
      const g = bokehSprite.getContext("2d")!;
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,170,90,0.9)");
      gr.addColorStop(0.55, "rgba(255,140,60,0.45)");
      gr.addColorStop(0.8, "rgba(255,120,40,0.12)");
      gr.addColorStop(1, "rgba(255,110,30,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
    }
    const gearSprite = (R: number, teeth: number, blur: number) => {
      const pad = blur * 3 + 6;
      const S = Math.ceil(2 * (R + pad));
      const c = document.createElement("canvas");
      c.width = c.height = S;
      const g = c.getContext("2d")!;
      const path = new Path2D();
      const r0 = R * 0.86;
      for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * TAU;
        const a1 = a0 + (TAU / teeth) * 0.22;
        const a2 = a0 + (TAU / teeth) * 0.5;
        const a3 = a0 + (TAU / teeth) * 0.72;
        const pt = (r: number, a: number) => [S / 2 + Math.cos(a) * r - 8000, S / 2 + Math.sin(a) * r] as const;
        const p0 = pt(r0, a0);
        if (i === 0) path.moveTo(p0[0], p0[1]);
        else path.lineTo(p0[0], p0[1]);
        path.lineTo(...pt(R, a1));
        path.lineTo(...pt(R, a2));
        path.lineTo(...pt(r0, a3));
      }
      path.closePath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        path.moveTo(S / 2 - 8000 + Math.cos(a) * R * 0.62 + R * 0.12, S / 2 + Math.sin(a) * R * 0.62);
        path.arc(S / 2 - 8000 + Math.cos(a) * R * 0.62, S / 2 + Math.sin(a) * R * 0.62, R * 0.12, 0, TAU);
      }
      path.moveTo(S / 2 - 8000 + R * 0.22, S / 2);
      path.arc(S / 2 - 8000, S / 2, R * 0.22, 0, TAU);
      g.shadowColor = "rgba(34,36,44,1)";
      g.shadowBlur = blur;
      g.shadowOffsetX = 8000;
      g.fillStyle = "#000";
      g.fill(path, "evenodd");
      return c;
    };
    const gears = [
      { spr: gearSprite(120, 28, 10), fx: 0.13, fy: 0.95, rot: 0.12, sc: 1 },
      { spr: gearSprite(80, 20, 6), fx: 0.88, fy: 0.8, rot: -0.18, sc: 1 },
      { spr: gearSprite(160, 34, 16), fx: 0.62, fy: 1.18, rot: 0.08, sc: 1 },
    ];
    const bokeh = Array.from({ length: 18 }, () => ({ x: rnd(), y: 0.3 + rnd() * 0.75, r: 5 + rnd() * 18, a: 0.25 + rnd() * 0.6, sp: 0.4 + rnd(), ph: rnd() * TAU }));
    const dust = Array.from({ length: 60 }, () => ({ x: rnd(), y: rnd(), r: 0.5 + rnd() * 1.1, sp: 0.3 + rnd() * 1.2, ph: rnd() * TAU }));

    /* ---- web: silk ribbons, hairs, glints ---- */
    const RIB = Array.from({ length: 30 }, (_, i) => ({
      r: 0.25 + rnd() * 0.75,
      ph: (i / 30) * TAU + rnd() * 0.5,
      tw: 0.16 + rnd() * 0.08,
      ps0: rnd() * TAU,
      ps: 0.07 + rnd() * 0.09,
      w: 0.55 + rnd() * 0.6,
      br: 0.55 + rnd() * 0.45,
      finger: i % 5,
      fo: rnd() - 0.5,
      seed: rnd(),
    }));
    const HAIRS = Array.from({ length: 130 }, () => ({
      s: 1 - Math.pow(rnd(), 2.6) * 0.97,
      side: rnd() < 0.5 ? -1 : 1,
      ang: 0.35 + rnd() * 0.95,
      back: rnd() < 0.72 ? -1 : 1,
      len: 1.4 + rnd() * 3.8,
      curl: (rnd() - 0.5) * 0.9,
      li: 0.25 + rnd() * 0.75,
      seed: rnd(),
    }));
    const GLINTS = Array.from({ length: 84 }, () => ({ s: 1 - Math.pow(rnd(), 1.35) * 0.98, side: rnd() * 2 - 1, ph: rnd() * TAU, f: 1.1 + rnd() * 2.8, sz: 1.6 + rnd() * 3.4 }));
    const FLEN = [19, 27, 31, 29, 22];
    const FDELAY = [0.16, 0.06, 0, 0.08, 0.17];
    /* the hand opens over a 2.1 s timeline that is squeezed into the web's flight */
    const FLY = 1.75;
    /* joint angles (radians) for knuckle, middle joint, fingertip: folded into a fist, and open */
    const CLOSED = [
      [0.95, 0.85, 0.5],
      [1.35, 1.55, 1.05],
      [1.4, 1.6, 1.1],
      [1.4, 1.55, 1.05],
      [1.3, 1.45, 1.0],
    ];
    const OPEN = [
      [0.12, 0.1, 0.08],
      [0.06, 0.07, 0.06],
      [0.04, 0.06, 0.05],
      [0.06, 0.07, 0.06],
      [0.1, 0.09, 0.08],
    ];
    const PHAL = [0.46, 0.31, 0.23];
    /* how far each finger fans out, and the little extra spread at the very end */
    const SPREAD = [-0.72, -0.26, 0, 0.24, 0.48];
    const SPREAD_LATE = [-0.12, -0.06, 0, 0.06, 0.11];
    const fanK = [0, 0, 0, 0, 0];
    /* where each fingertip is glued to the row, in the row's own coordinates */
    const tipLocal: V[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }));
    const edgeLocal: V[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }));
    const gripSet = [false, false, false, false, false];
    const tips: V[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }));

    /* ---- state ---- */
    let ph: Phase = "idle";
    const go = (p: Phase) => {
      ph = p;
      setPhase(p);
    };
    let ts = 1;
    let simT = 0;
    let fallId: string | null = null;
    const body = { x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, w: 0, h: 0, sc: 1, depth: 0 };
    const slotP = { x: 0, y: 0 };
    let cardBottom = 0;
    let fallT0 = 0;
    let missT = 0;
    let settleT = 0;
    let hideToastAt = 0;
    const web = {
      on: false,
      A: { x: 0, y: 0 } as V,
      Hd: { x: 0, y: 0 } as V,
      o: 0,
      t0: 0,
      contactT: 0,
      rate: 1,
      contactSim: 0,
      tsAtContact: 1,
      local: { x: 0, y: 0 } as V,
      L0: 0,
      retractT: -1,
      retractFrom: { x: 0, y: 0 } as V,
      fade: 1,
      spin: 0,
      flex: 0,
    };
    let glDirty = true;

    const measureCard = () => {
      const r = rel(card);
      cardBottom = r.y + r.h;
    };
    const anchor = (): V => {
      const u = undoRef.current;
      if (!u) return { x: W / 2, y: 40 };
      const r = rel(u);
      return { x: r.x + r.w / 2, y: r.y + r.h - 4 };
    };
    const toWorld = (lx: number, ly: number): V => {
      const c = Math.cos(body.a);
      const s = Math.sin(body.a);
      return { x: body.x + (c * lx - s * ly) * body.sc, y: body.y + (s * lx + c * ly) * body.sc };
    };

    /* ---- actions ---- */
    const del = (id: string) => {
      if (ph !== "idle") return;
      const rowEl = rowsEl.querySelector(`[data-row="${id}"]`);
      const f = filesRef.current.find((q) => q.id === id);
      if (!rowEl || !f) return;
      measureCard();
      const r = rel(rowEl);
      body.w = r.w;
      body.h = r.h;
      body.x = slotP.x = r.x + r.w / 2;
      body.y = slotP.y = r.y + r.h / 2;
      body.vx = (rnd() - 0.5) * 40;
      body.vy = -70;
      body.a = 0;
      body.va = (rnd() < 0.5 ? -1 : 1) * (0.35 + rnd() * 0.4);
      body.sc = 1;
      body.depth = 0;
      fallId = id;
      fallT0 = now;
      ts = 1;
      simT = 0;
      setSlot({ x: r.x, y: r.y, w: r.w, h: r.h });
      setFallingId(id);
      setToast({ show: true, kind: "deleted", name: f.name });
      hideToastAt = 0;
      go("falling");
      cue("delete");
    };
    const undo = () => {
      if (ph !== "falling") return;
      if (reducedNow) {
        settle();
        return;
      }
      web.on = true;
      web.A = anchor();
      web.Hd = { ...web.A };
      web.t0 = now;
      web.contactT = 0;
      web.retractT = -1;
      web.fade = 1;
      web.spin = 0.7;
      web.rate = slowRef.current ? 0.42 : 1;
      gripSet.fill(false);
      setToast((t) => ({ ...t, kind: "restoring" }));
      go("flying");
      cue("shoot");
    };
    const settle = () => {
      go("settle");
      settleT = now;
      setFallingId(null);
      setLandedId(fallId);
      setToast((t) => ({ ...t, kind: "restored" }));
      hideToastAt = now + 1.6;
      if (web.on) {
        web.retractT = now;
        web.retractFrom = { ...web.Hd };
      }
      cue("restored");
    };
    const miss = () => {
      go("missed");
      missT = now;
      const id = fallId;
      setFallingId(null);
      setFiles((fs) => fs.filter((q) => q.id !== id));
      setToast((t) => ({ ...t, kind: "gone" }));
      hideToastAt = now + 1.8;
      cue("missed");
    };
    const restore = () => {
      setFiles((fs) => FILES.map((f) => fs.find((q) => q.id === f.id) || f));
    };
    engine.current = { del, undo, restore };

    /* ---- ghost cursor ---- */
    type Step =
      | { k: "move"; to: () => V; dur: number }
      | { k: "wait"; dur: number }
      | { k: "until"; c: () => boolean }
      | { k: "do"; f: () => void };
    let ghostOn = autoplay;
    let ghostQ: Step[] = [];
    let ghostStep: Step | null = null;
    let ghostT0 = 0;
    let ghostFrom: V = { x: 0, y: 0 };
    const ghostPos: V = { x: 0, y: 0 };
    let ghostPress = 0;
    let lastReal = -1e9;
    let cycle = 0;
    const trashOf = (id: string) => (): V => {
      const b = rowsEl.querySelector(`[data-trash="${id}"]`);
      if (!b) return { ...ghostPos };
      const r = rel(b);
      return { x: r.x + r.w / 2 + 2, y: r.y + r.h / 2 + 3 };
    };
    const undoPt = (dx = 0, dy = 0) => (): V => {
      const u = undoRef.current;
      if (!u) return { ...ghostPos };
      const r = rel(u);
      return { x: r.x + r.w / 2 + 4 + dx, y: r.y + r.h / 2 + 4 + dy };
    };
    const rest = (): V => ({ x: W * 0.8, y: H * 0.86 });
    const click = (f: () => void): Step => ({
      k: "do",
      f: () => {
        ghostPress = now;
        f();
      },
    });
    const slowPt = (): V => {
      const b = slowBtnRef.current;
      if (!b) return { ...ghostPos };
      const r = rel(b);
      return { x: r.x + r.w / 2 + 3, y: r.y + r.h / 2 + 3 };
    };
    const planCycle = () => {
      /* catch it, miss one, then catch one with the slow hand so the hand can be watched opening */
      const kind = cycle % 3;
      cycle++;
      const catchIt = kind !== 1;
      const slowIt = kind === 2;
      const target = kind === 0 ? "tower" : kind === 1 ? "inv" : "deck";
      ghostQ = [
        { k: "do", f: () => (filesRef.current.length < FILES.length ? restore() : undefined) },
        { k: "wait", dur: 0.7 },
      ];
      if (slowIt) ghostQ.push({ k: "move", to: slowPt, dur: 1.1 }, { k: "wait", dur: 0.2 }, click(() => setSlow(true)), { k: "wait", dur: 0.5 });
      ghostQ.push(
        { k: "move", to: trashOf(target), dur: 1.15 },
        { k: "do", f: () => setGhostHover(target) },
        { k: "wait", dur: 0.35 },
        click(() => del(target)),
        { k: "do", f: () => setGhostHover(null) },
        { k: "wait", dur: catchIt ? 0.75 : 0.55 },
      );
      if (catchIt) {
        ghostQ.push({ k: "move", to: undoPt(), dur: 0.75 }, { k: "wait", dur: 0.12 }, click(() => undo()), { k: "until", c: () => ph === "idle" }, { k: "wait", dur: 1.1 });
        if (slowIt) ghostQ.push({ k: "move", to: slowPt, dur: 1.0 }, { k: "wait", dur: 0.15 }, click(() => setSlow(false)), { k: "wait", dur: 0.4 });
      } else {
        ghostQ.push(
          { k: "move", to: undoPt(-70, 46), dur: 1.5 },
          { k: "move", to: undoPt(-46, 26), dur: 1.4 },
          { k: "until", c: () => ph === "idle" },
          { k: "wait", dur: 1.0 },
          { k: "do", f: () => restore() },
          { k: "wait", dur: 0.6 },
        );
      }
      ghostQ.push({ k: "move", to: rest, dur: 1.0 });
    };
    const runGhost = () => {
      const g = ghostRef.current;
      if (!ghostOn || reducedNow) {
        if (g) g.style.opacity = "0";
        return;
      }
      if (!ghostStep) {
        if (!ghostQ.length) planCycle();
        ghostStep = ghostQ.shift() || null;
        ghostT0 = now;
        ghostFrom = { ...ghostPos };
        if (ghostStep?.k === "do") {
          ghostStep.f();
          ghostStep = null;
          return runGhost();
        }
      }
      const s = ghostStep;
      if (s) {
        const e = now - ghostT0;
        if (s.k === "move") {
          const to = s.to();
          const u = easeInOut(clamp01(e / s.dur));
          const arc = Math.sin(u * Math.PI) * 18;
          ghostPos.x = ghostFrom.x + (to.x - ghostFrom.x) * u;
          ghostPos.y = ghostFrom.y + (to.y - ghostFrom.y) * u - arc;
          if (e >= s.dur) ghostStep = null;
        } else if (s.k === "wait") {
          if (e >= s.dur) ghostStep = null;
        } else if (s.k === "until") {
          if (s.c()) ghostStep = null;
        }
      }
      if (g) {
        const p = now - ghostPress;
        const press = p < 0.18 ? 1 - Math.sin((p / 0.18) * Math.PI) * 0.16 : 1;
        g.style.opacity = "1";
        g.style.transform = `translate(${ghostPos.x}px, ${ghostPos.y}px) scale(${press})`;
        const ring = g.firstElementChild as HTMLElement | null;
        if (ring) {
          const q = clamp01(p / 0.45);
          ring.style.opacity = p < 0.45 ? String(1 - q) : "0";
          ring.style.transform = `translate(-50%,-50%) scale(${0.4 + q * 1.4})`;
        }
      }
    };

    /* ---- web renderer (WebGL): every strand is a shaded ribbon, so it stays smooth on the GPU ---- */
    const gl = fx.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true }) as WebGLRenderingContext | null;
    const RVS = `attribute vec2 aPos;attribute vec4 aV;attribute float aSeed;uniform vec2 uRes;uniform vec2 uOff;varying vec4 vV;varying float vSeed;
void main(){vV=aV;vSeed=aSeed;vec2 p=(aPos+uOff)/uRes*2.0-1.0;gl_Position=vec4(p.x,-p.y,0.0,1.0);}`;
    /* Same silk as the Web Sling Button: flat ribbons with a crumpled, broken highlight, laid over the
       scene (not added to it), so the web keeps its body on light rows too. The seed also picks a kind:
       below 0 a soft halo, 10 and up a contact shadow, 20 and up wet glue. */
    const RFS = `precision mediump float;varying vec4 vV;varying float vSeed;uniform float uMode;
float h(float n){return fract(sin(n)*43758.5453);}
float nz(float x){float i=floor(x);float f=fract(x);f=f*f*(3.0-2.0*f);return mix(h(i),h(i+1.0),f);}
void main(){
  float ax=abs(vV.x);float light=vV.y;float along=vV.w;
  if(vSeed<0.0){
    float a=vV.z*(1.0-smoothstep(0.0,1.0,ax));
    vec3 c=vec3(0.75,0.83,0.98)*a;
    gl_FragColor=vec4(c,a*0.5);return;
  }
  if(vSeed>=20.0){
    float e=1.0-smoothstep(0.2,1.0,ax);
    float a=vV.z*e;
    float spec=pow(light,6.0)*0.9;
    vec3 c=mix(vec3(0.70,0.74,0.82),vec3(0.98,0.99,1.0),light)+spec;
    gl_FragColor=vec4(min(c,vec3(1.0))*a,a);return;
  }
  if(vSeed>=10.0){
    float a=vV.z*(1.0-smoothstep(0.0,1.0,ax));
    gl_FragColor=vec4(0.0,0.0,0.0,a);return;
  }
  float e=1.0-smoothstep(0.15,1.0,ax);
  float cr=nz(along*0.5+vSeed*37.0)*0.6+nz(along*2.1+vSeed*11.0)*0.4;
  float spec=pow(light,3.0)*(0.15+1.6*cr*cr);
  vec3 base=mix(vec3(0.74,0.79,0.88),vec3(0.97,0.98,1.0),light);
  vec3 c=base*(0.8+0.2*light)+vec3(1.0,0.99,0.96)*spec;
  float a=vV.z*e;
  gl_FragColor=vec4(min(c,vec3(1.0))*a,a);
}`;
    const PVS = `attribute vec2 aPos;attribute vec2 aSA;uniform vec2 uRes;uniform float uDpr;varying float vA;
void main(){vA=aSA.y;vec2 p=aPos/uRes*2.0-1.0;gl_Position=vec4(p.x,-p.y,0.0,1.0);gl_PointSize=aSA.x*uDpr;}`;
    const PFS = `precision mediump float;varying float vA;
void main(){vec2 p=gl_PointCoord-0.5;float d=length(p)*2.0;float core=exp(-d*d*16.0);float halo=exp(-d*d*3.2)*0.2;
vec3 c=(vec3(1.0,0.98,0.95)*core+vec3(0.55,0.72,1.0)*halo)*vA;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`;
    type Prog = { p: WebGLProgram; loc: Record<string, number>; uni: Record<string, WebGLUniformLocation | null> };
    const mkProg = (vs: string, fs: string, attrs: string[], unis: string[]): Prog | null => {
      if (!gl) return null;
      const sh = (t: number, src: string) => {
        const s = gl.createShader(t)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const p = gl.createProgram()!;
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.warn("CatchUndo: web shader failed", gl.getProgramInfoLog(p));
        return null;
      }
      const loc: Record<string, number> = {};
      for (const a of attrs) loc[a] = gl.getAttribLocation(p, a);
      const uni: Record<string, WebGLUniformLocation | null> = {};
      for (const u of unis) uni[u] = gl.getUniformLocation(p, u);
      return { p, loc, uni };
    };
    let rProg: Prog | null = null;
    let pProg: Prog | null = null;
    let rBuf: WebGLBuffer | null = null;
    let pBuf: WebGLBuffer | null = null;
    const initGL = () => {
      if (!gl) return;
      rProg = mkProg(RVS, RFS, ["aPos", "aV", "aSeed"], ["uRes", "uOff", "uMode"]);
      pProg = mkProg(PVS, PFS, ["aPos", "aSA"], ["uRes", "uDpr"]);
      rBuf = gl.createBuffer();
      pBuf = gl.createBuffer();
    };
    initGL();
    /* pages with many WebGL demos can run out of contexts; get ours back when the browser restores it */
    const onLost = (e: Event) => {
      e.preventDefault();
      rProg = pProg = null;
    };
    const onRestored = () => {
      initGL();
      glDirty = true;
    };
    fx.addEventListener("webglcontextlost", onLost);
    fx.addEventListener("webglcontextrestored", onRestored);
    const ctx2 = gl ? null : fx.getContext("2d");
    const VMAX = 60000;
    const VB = new Float32Array(VMAX * 7);
    let vn = 0;
    const PMAX = 2000;
    const PB = new Float32Array(PMAX * 4);
    let pn = 0;
    const point = (x: number, y: number, size: number, a: number) => {
      if (pn >= PMAX || a < 0.01) return;
      const o = pn * 4;
      PB[o] = x;
      PB[o + 1] = y;
      PB[o + 2] = size;
      PB[o + 3] = clamp01(a);
      pn++;
    };
    const vtx = (x: number, y: number, ac: number, li: number, al: number, lo: number, sd: number) => {
      const o = vn * 7;
      VB[o] = x;
      VB[o + 1] = y;
      VB[o + 2] = ac;
      VB[o + 3] = li;
      VB[o + 4] = al;
      VB[o + 5] = lo;
      VB[o + 6] = sd;
      vn++;
    };
    /* scratch arrays for one ribbon */
    const RN = 200;
    const rx = new Float32Array(RN);
    const ry = new Float32Array(RN);
    const rw = new Float32Array(RN);
    const rl = new Float32Array(RN);
    const ra = new Float32Array(RN);
    const rg = new Float32Array(RN);
    const ribbon = (n: number, seed: number) => {
      if (n < 2 || vn + (n - 1) * 6 >= VMAX) return;
      const minW = 1.35 / dpr;
      let pnx = 0;
      let pny = 0;
      for (let i = 0; i < n; i++) {
        const i0 = Math.max(0, i - 1);
        const i1 = Math.min(n - 1, i + 1);
        let tx = rx[i1] - rx[i0];
        let ty = ry[i1] - ry[i0];
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        const nx = -ty;
        const ny = tx;
        let w = rw[i];
        let a = ra[i];
        if (w < minW) {
          a *= w / minW;
          w = minW;
        }
        const hw = w / 2;
        if (i > 0) {
          const j = i - 1;
          let wj = rw[j];
          let aj = ra[j];
          if (wj < minW) {
            aj *= wj / minW;
            wj = minW;
          }
          const hj = wj / 2;
          const aLx = rx[j] + pnx * hj;
          const aLy = ry[j] + pny * hj;
          const aRx = rx[j] - pnx * hj;
          const aRy = ry[j] - pny * hj;
          const bLx = rx[i] + nx * hw;
          const bLy = ry[i] + ny * hw;
          const bRx = rx[i] - nx * hw;
          const bRy = ry[i] - ny * hw;
          vtx(aLx, aLy, -1, rl[j], aj, rg[j], seed);
          vtx(aRx, aRy, 1, rl[j], aj, rg[j], seed);
          vtx(bLx, bLy, -1, rl[i], a, rg[i], seed);
          vtx(aRx, aRy, 1, rl[j], aj, rg[j], seed);
          vtx(bRx, bRy, 1, rl[i], a, rg[i], seed);
          vtx(bLx, bLy, -1, rl[i], a, rg[i], seed);
        }
        pnx = nx;
        pny = ny;
      }
    };

    /* a filled blob of glue: centre fan with a soft, irregular rim (same as the Web Sling Button) */
    const blob = (x: number, y: number, r: number, seed: number, alpha: number, squash = 1, ang = 0) => {
      if (r < 0.3 || vn + 28 * 3 >= VMAX || alpha < 0.01) return;
      const K = 28;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const Pt = (k: number) => {
        const a = (k / K) * TAU;
        const rr = r * (1 + 0.24 * Math.sin(a * 2 + seed) + 0.15 * Math.sin(a * 5 - seed * 1.7) + 0.08 * Math.sin(a * 9 + seed * 3));
        const lx = Math.cos(a) * rr;
        const ly = Math.sin(a) * rr * squash;
        return [x + lx * c - ly * s, y + lx * s + ly * c, 0.5 - 0.5 * Math.sin(a + 0.8)] as const;
      };
      for (let k = 0; k < K; k++) {
        const p0 = Pt(k);
        const p1 = Pt(k + 1);
        vtx(x, y, 0, 0.85, alpha, 0, 20);
        vtx(p0[0], p0[1], 1, p0[2], alpha, 0, 20);
        vtx(p1[0], p1[1], 1, p1[2], alpha, 0, 20);
      }
    };

    const M_MAX = 120;
    const P: V[] = Array.from({ length: M_MAX }, () => ({ x: 0, y: 0 }));
    const N: V[] = Array.from({ length: M_MAX }, () => ({ x: 0, y: 0 }));
    const Ls: number[] = new Array(M_MAX).fill(0);
    const FS_N = 11;
    const fOpen: V[][] = Array.from({ length: 5 }, () => Array.from({ length: FS_N }, () => ({ x: 0, y: 0 })));
    const fPts: V[][] = Array.from({ length: 5 }, () => Array.from({ length: FS_N }, () => ({ x: 0, y: 0 })));
    const fBase: V[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0 }));

    const renderWeb = (sag: number, wave: number, stretch: number) => {
      const useGL = !!(gl && rProg && pProg && !gl.isContextLost());
      if (useGL && gl) {
        gl.viewport(0, 0, fx.width, fx.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      } else if (ctx2) {
        ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2.clearRect(0, 0, W, H);
      } else return;
      if (!web.on) return;
      vn = 0;
      pn = 0;

      /* how far the hand has grown: knob, then curled fingers, then uncurl and spread, then the net */
      /* hand time: runs slower when the slow hand is on */
      const tauH = (now - web.t0) * web.rate * (2.1 / FLY);
      const rel = web.retractT >= 0 ? clamp01((now - web.retractT) / 0.55) : 0;
      const open = 1 - rel;
      /* letting go: the fingers close back into a fist quickly, before the line is pulled in */
      const openF = 1 - smooth(0.12, 0.5, rel);
      const knob = smooth(0.04, 0.32, tauH) * (1 - 0.75 * smooth(0.45, 1.1, tauH));
      const palm = easeOutCubic(clamp01((tauH - 0.22) / 1.1)) * open;
      const fa = smooth(0.0, 0.7, tauH);
      /* on release the fingers hold for a beat while the glue peels, then let go and curl back into a fist */
      const g = web.contactT > 0 ? easeInOut(clamp01(((now - web.contactT) * Math.max(0.55, web.rate)) / 0.34)) * (1 - smooth(0.12, 0.5, rel)) : 0;
      const fade = web.fade;

      const A = web.A;
      const Hd = web.Hd;
      const dx = Hd.x - A.x;
      const dy = Hd.y - A.y;
      const L = Math.hypot(dx, dy);
      if (L < 2) return;
      const ux = dx / L;
      const uy = dy / L;
      const nx = -uy;
      const ny = ux;
      const C = { x: A.x + dx / 2 + nx * sag, y: A.y + dy / 2 + ny * sag };
      const M = clamp(Math.round(L / 4.5), 16, M_MAX);
      let acc = 0;
      for (let i = 0; i < M; i++) {
        const s = i / (M - 1);
        const m = 1 - s;
        const wv = wave * Math.sin(s * 3.2 - now * 2.4) * s * m * 4;
        P[i].x = m * m * A.x + 2 * m * s * C.x + s * s * Hd.x + nx * wv;
        P[i].y = m * m * A.y + 2 * m * s * C.y + s * s * Hd.y + ny * wv;
        if (i > 0) acc += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
        Ls[i] = acc;
      }
      for (let i = 0; i < M; i++) {
        const a = P[Math.max(0, i - 1)];
        const b = P[Math.min(M - 1, i + 1)];
        const tx = b.x - a.x;
        const ty = b.y - a.y;
        const tl = Math.hypot(tx, ty) || 1;
        N[i].x = -ty / tl;
        N[i].y = tx / tl;
      }
      const total = acc || 1;
      const thin = clamp(1 / Math.sqrt(1 + stretch / 40), 0.55, 1);
      const tH = { x: P[M - 1].x - P[M - 3].x, y: P[M - 1].y - P[M - 3].y };
      const tHl = Math.hypot(tH.x, tH.y) || 1;
      tH.x /= tHl;
      tH.y /= tHl;
      const nH = { x: -tH.y, y: tH.x };
      const curlDir = nH.y > 0 ? 1 : -1;
      const headLen = 12 + 26 * palm;
      const radius = (l: number) => {
        let r = 2.3 * thin * (1 + 0.22 * Math.sin(l * 0.29 + 1.3) * Math.sin(l * 0.09 + 0.4));
        r *= 0.5 + 0.5 * smooth(0, 16, l);
        r += 3.6 * fa * smooth(total - 95, total - 14, l);
        const uh = (l - (total - headLen)) / headLen;
        if (uh > 0) r += (1.5 + 11 * palm) * Math.pow(uh, 1.25);
        r += 4.2 * knob * smooth(total - 11, total, l);
        return r;
      };
      const dof = (l: number) => 1 - smooth(0, total * 0.6, l);
      const lat = (k: number) => (k - 2) * (1.4 + 5.4 * palm);

      /* soft halo along the strand */
      {
        let n = 0;
        for (let i = 0; i < M; i += 2) {
          const R = radius(Ls[i]);
          rx[n] = P[i].x;
          ry[n] = P[i].y;
          rw[n] = R * 5 + 3;
          rl[n] = 0.1;
          ra[n] = 0.05 * fade;
          rg[n] = Ls[i];
          n++;
        }
        ribbon(n, -1);
        /* and a faint shadow of the line falling on the scene behind it */
        n = 0;
        for (let i = 0; i < M; i += 2) {
          rx[n] = P[i].x + 4;
          ry[n] = P[i].y + 9;
          rw[n] = radius(Ls[i]) * 2.2 + 2;
          rl[n] = 0;
          ra[n] = 0.09 * fade;
          rg[n] = 0;
          n++;
        }
        ribbon(n, 10);
      }

      /* finger poses first: the rope's own fibres run on into them.
         Like a real hand opening from a fist: every finger starts folded tight into the palm, then the
         knuckle opens first, the middle joint after it and the fingertip last, a slow wave from palm to
         tip. As the knuckles open the fingers fan apart, and at the very end spread a touch further. */
      const tAng = Math.atan2(tH.y, tH.x);
      const S = FS_N;
      const fe: number[] = [0, 0, 0, 0, 0];
      const fb0: V[] = fBase;
      const SEGS = [5, 3, 3];
      const late = smooth(1.45, 2.05, tauH) * open;
      for (let k = 0; k < 5; k++) {
        const e = easeOutCubic(clamp01((tauH - 0.26 - FDELAY[k] * 0.6) / 0.42)) * openF;
        fe[k] = Math.max(e, 0.02 * open);
        const t0 = 0.6 + FDELAY[k];
        const len = FLEN[k] * (0.55 + 0.45 * e);
        const bx = Hd.x + nH.x * lat(k) - tH.x * Math.abs(k - 2) * 1.6 * palm;
        const by = Hd.y + nH.y * lat(k) - tH.y * Math.abs(k - 2) * 1.6 * palm;
        fb0[k].x = bx;
        fb0[k].y = by;
        /* fan: follows the knuckle as it opens */
        const fanU = smoothE(clamp01((tauH - t0 - 0.12) / 0.85)) * openF;
        let a = tAng + (SPREAD[k] * fanU + SPREAD_LATE[k] * late) + Math.sin(now * 1.3 + k * 1.3) * 0.03 * fanU;
        let x = bx;
        let y = by;
        const op = fOpen[k];
        let j = 0;
        for (let ph = 0; ph < 3; ph++) {
          /* each joint opens on its own, slightly after the one before it, with a soft settle */
          const u = clamp01((tauH - t0 - ph * 0.13) / 0.78);
          const eu = smoothE(u) + 0.05 * Math.sin(Math.PI * smooth(0.55, 1, u)) * (ph === 0 ? 1 : 0.6);
          const th = CLOSED[k][ph] + (OPEN[k][ph] - CLOSED[k][ph]) * eu * openF;
          /* the bend is shared out along the finger, so a curled finger is a smooth coil, not a box */
          a += curlDir * th * 0.28;
          const n = SEGS[ph];
          const sl = (len * PHAL[ph]) / n;
          for (let q = 0; q < n; q++) {
            a += (curlDir * th * 0.72) / n;
            x += Math.cos(a) * sl;
            y += Math.sin(a) * sl;
            op[j].x = x;
            op[j].y = y;
            j++;
          }
        }
        const fp = fPts[k];
        if (g > 0.001) {
          /* the hand closes on the row where it actually is: on contact each open fingertip is projected onto
             the row's face (pressed down onto it), so the fingers keep their natural spread and order and
             simply fold over the edge and lie flat. Frozen at contact, so the grip does not slide about. */
          const toLocal = (wx2: number, wy2: number) => {
            const c0 = Math.cos(-body.a), s0 = Math.sin(-body.a);
            const lx = (wx2 - body.x) / body.sc, ly = (wy2 - body.y) / body.sc;
            return { x: c0 * lx - s0 * ly, y: s0 * lx + c0 * ly };
          };
          if (!gripSet[k]) {
            gripSet[k] = true;
            const ot = toLocal(op[S - 1].x, op[S - 1].y);
            const ob = toLocal(bx, by);
            const top = -body.h / 2;
            /* a web hand is glue, not muscle: it slaps flat onto the row's face and sticks there like a hand
               print. Each open fingertip is pressed straight down onto the face, keeping the hand's natural
               spread; a finger that would hang off an edge is folded back onto the row. */
            const bot = body.h / 2;
            let tx = web.local.x + (ot.x - web.local.x) * 0.9;
            let ty = web.local.y + (ot.y - web.local.y) * 0.9;
            if (ty < top + 5) ty = top + 5 + (top + 5 - ty) * 0.35;
            if (ty > bot - 5) ty = bot - 5 - (ty - (bot - 5)) * 0.35;
            tx = clamp(tx, -body.w / 2 + 8, body.w / 2 - 8);
            ty = clamp(ty, top + 5, bot - 5);
            tipLocal[k].x = tx;
            tipLocal[k].y = ty;
            edgeLocal[k].x = ob.x + (tx - ob.x) * 0.62;
            edgeLocal[k].y = ob.y + (ty - ob.y) * 0.62;
          }
          const edge = toWorld(edgeLocal[k].x, edgeLocal[k].y);
          const tip = toWorld(tipLocal[k].x, tipLocal[k].y);
          const p1x = bx + tH.x * 5;
          const p1y = by + tH.y * 5;
          for (let q = 0; q < S; q++) {
            const v = (q + 1) / S;
            const m = 1 - v;
            const gx = m * m * m * bx + 3 * m * m * v * p1x + 3 * m * v * v * edge.x + v * v * v * tip.x;
            const gy = m * m * m * by + 3 * m * m * v * p1y + 3 * m * v * v * edge.y + v * v * v * tip.y;
            fp[q].x = op[q].x + (gx - op[q].x) * g;
            fp[q].y = op[q].y + (gy - op[q].y) * g;
          }
        } else
          for (let q = 0; q < S; q++) {
            fp[q].x = op[q].x;
            fp[q].y = op[q].y;
          }
        tips[k].x = fp[S - 1].x;
        tips[k].y = fp[S - 1].y;
        fanK[k] = fanU;
      }

      /* the rope: flat silk ribbons wound round each other, each twisting along its own length.
         Near the end they fan out into a palm and carry straight on into the fingers. */
      const spin = web.spin * now;
      for (const rb of RIB) {
        const k = rb.finger;
        const fbx = lat(k) + rb.fo * 2.2;
        let n = 0;
        for (let i = 0; i < M; i++) {
          const l = Ls[i];
          const R = radius(l);
          const th = rb.ph + rb.tw * l + spin;
          let off = R * rb.r * Math.cos(th);
          const face = 0.5 + 0.5 * Math.sin(th);
          const psi = rb.ps0 + rb.ps * l + spin * 0.6;
          const wf = 0.65 + 0.35 * Math.abs(Math.cos(psi));
          const sheen = Math.abs(Math.cos(psi - 0.7));
          const uh = clamp01((l - (total - headLen)) / headLen);
          if (uh > 0) off = off * (1 - smooth(0, 1, uh) * palm * 0.85) + fbx * smooth(0.15, 1, uh) * palm;
          const d = dof(l);
          rx[n] = P[i].x + N[i].x * off;
          ry[n] = P[i].y + N[i].y * off;
          rw[n] = rb.w * wf * (1 + 1.1 * d) * (0.7 + 0.3 * thin) * (1 + 0.45 * uh * palm);
          rl[n] = clamp01(0.1 + 0.9 * face * sheen);
          ra[n] = rb.br * fade * (1 - 0.45 * d) * (0.55 + 0.45 * thin);
          rg[n] = l;
          n++;
        }
        const e = fe[k];
        if (e > 0.02) {
          const fp = fPts[k];
          const lastX = rx[n - 1];
          const lastY = ry[n - 1];
          for (let j = 0; j < S; j++) {
            const v = (j + 1) / S;
            const a0 = j === 0 ? fBase[k] : fp[j - 1];
            const b0 = fp[Math.min(S - 1, j + 1)];
            let tx = b0.x - a0.x;
            let ty = b0.y - a0.y;
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            /* fibres in a finger cross over each other as they run to the tip */
            /* once the hand grips, the fibres settle into the finger instead of crossing loosely */
            const w0 = (rb.fo * 3.0 * (1 - v * 0.85) + 0.55 * Math.sin(v * 7 + rb.seed * 20 + now * 1.2) * (1 - v * 0.6)) * (1 - 0.65 * g);
            const px = fp[j].x - ty * w0;
            const py = fp[j].y + tx * w0;
            const blend = j === 0 ? 0.5 : 1;
            rx[n] = j === 0 ? lastX + (px - lastX) * blend : px;
            ry[n] = j === 0 ? lastY + (py - lastY) * blend : py;
            const psi = rb.ps0 + v * 9 + spin;
            rw[n] = rb.w * (0.95 - 0.5 * v) * (0.7 + 0.3 * Math.abs(Math.cos(psi)));
            rl[n] = clamp01(0.25 + 0.75 * Math.abs(Math.cos(psi - 0.7)));
            ra[n] = rb.br * fade * Math.min(1, e * 1.6);
            rg[n] = total + v * 34;
            n++;
          }
        }
        ribbon(n, rb.seed);
      }

      /* where the fingers lie on the row they cast a soft shadow on it, so the silk reads on a white surface */
      if (g > 0.02) {
        for (let k = 0; k < 5; k++) {
          const fp = fPts[k];
          let n = 0;
          for (let j = 3; j < S; j++) {
            rx[n] = fp[j].x + 0.7;
            ry[n] = fp[j].y + 1.4;
            rw[n] = 3.2 - (j - 3) * 0.18;
            rl[n] = 0;
            ra[n] = 0.16 * g * fade * smooth(3, 6, j);
            rg[n] = 0;
            n++;
          }
          ribbon(n, 10);
        }
      }

      /* each finger also has a fine core thread, small knots along it and a wet bead at the tip */
      for (let k = 0; k < 5; k++) {
        const e = fe[k];
        if (e < 0.02) continue;
        const fp = fPts[k];
        let n = 0;
        rx[n] = fBase[k].x;
        ry[n] = fBase[k].y;
        rw[n] = 0.9;
        rl[n] = 0.6;
        ra[n] = 0.7 * fade * Math.min(1, e * 2);
        rg[n] = total;
        n++;
        for (let j = 0; j < S; j++) {
          const v = (j + 1) / S;
          rx[n] = fp[j].x;
          ry[n] = fp[j].y;
          rw[n] = 0.9 * (1 - v * 0.55);
          rl[n] = clamp01(0.4 + 0.6 * Math.abs(Math.sin(v * 9 + k * 2.1 + now * 0.9)));
          ra[n] = 0.7 * fade * Math.min(1, e * 2);
          rg[n] = total + v * 30 + 11;
          n++;
        }
        ribbon(n, 0.13 * k + 0.05);
        point(fp[2].x, fp[2].y, 2.4, 0.5 * e * fade);
        point(fp[5].x, fp[5].y, 2.2, 0.55 * e * fade);
        point(fp[8].x, fp[8].y, 2.0, 0.5 * e * fade);
        point(fp[S - 1].x, fp[S - 1].y, 3.4 + Math.sin(now * 2.3 + k) * 0.6, 0.8 * e * fade);
      }

      /* frost on the palm: a dusting of tiny sparkles */
      if (palm > 0.05) {
        for (let q = 0; q < 26; q++) {
          const u = (q * 0.618) % 1;
          const side = ((q * 7) % 11) / 5.5 - 1;
          const back = u * headLen * 1.6;
          const i = Math.max(0, M - 1 - Math.round(back / Math.max(1, total / (M - 1))));
          const R = radius(Ls[i]);
          const tw = Math.pow(Math.max(0, Math.sin(now * (1.5 + (q % 5) * 0.6) + q)), 4);
          point(P[i].x + N[i].x * R * side, P[i].y + N[i].y * R * side, 1.4 + tw * 2.2, (0.25 + 0.75 * tw) * palm * fade);
        }
      }

      /* the webbing between the fingers: it is pulled out of the palm as the fingers fan apart, dense
         and sheet-like near the knuckles, a few loose threads further out, sagging less as it tightens */
      for (let k = 0; k < 4; k++) {
        const gap = Math.min(fanK[k], fanK[k + 1]);
        const show = smooth(0.12, 0.55, gap) * fade * open * (1 - 0.3 * g);
        if (show < 0.02) continue;
        const rowsJ = [0, 1, 2, 3, 4, 5, 7, 9];
        for (let r = 0; r < rowsJ.length; r++) {
          const jA = rowsJ[r];
          const jB = Math.min(S - 1, jA + (r % 3 === 2 ? 1 : 0));
          const p0 = fPts[k][jA];
          const p1 = fPts[k + 1][jB];
          /* threads only grow across once the fingers have opened past them */
          const reach = smooth(0.15 + r * 0.06, 0.45 + r * 0.07, gap);
          if (reach < 0.02) continue;
          const taut = smooth(0.4, 1, gap);
          const sagD = (2.2 + r * 0.45) * (1.3 - 0.7 * taut);
          const mx = (p0.x + p1.x) / 2 - tH.x * sagD + Math.sin(now * 2.1 + k + r) * 0.4;
          const my = (p0.y + p1.y) / 2 - tH.y * sagD + Math.cos(now * 1.7 + k * 2 + r) * 0.4;
          let n = 0;
          const steps = 7;
          for (let q = 0; q <= Math.round(steps * reach); q++) {
            const s = q / steps;
            const m = 1 - s;
            rx[n] = m * m * p0.x + 2 * m * s * mx + s * s * p1.x;
            ry[n] = m * m * p0.y + 2 * m * s * my + s * s * p1.y;
            rw[n] = r < 4 ? 0.75 : 0.55;
            rl[n] = 0.45 + 0.4 * Math.sin(s * 4 + r + k);
            ra[n] = (r < 5 ? 0.5 : 0.36) * show;
            rg[n] = r * 5 + s * 9;
            n++;
          }
          ribbon(n, 0.71 + k * 0.1 + r * 0.013);
        }
        /* a loose thread strung tip to tip, hanging slack */
        if (gap > 0.6 && g < 0.5) {
          const t0 = fPts[k][S - 2], t1 = fPts[k + 1][S - 2];
          const mx = (t0.x + t1.x) / 2 - tH.x * 5 + Math.sin(now * 1.4 + k) * 1.2;
          const my = (t0.y + t1.y) / 2 - tH.y * 5;
          let n = 0;
          for (let q = 0; q <= 8; q++) {
            const s = q / 8, m = 1 - s;
            rx[n] = m * m * t0.x + 2 * m * s * mx + s * s * t1.x;
            ry[n] = m * m * t0.y + 2 * m * s * my + s * s * t1.y;
            rw[n] = 0.45; rl[n] = 0.6; ra[n] = 0.28 * show * smooth(0.6, 0.9, gap); rg[n] = s * 9; n++;
          }
          ribbon(n, 0.93 + k * 0.02);
        }
      }

      /* tiny loose strands: wisps off the sides of each finger and a couple trailing from each tip */
      for (let k = 0; k < 5; k++) {
        const e = fe[k];
        if (e < 0.1) continue;
        const fp = fPts[k];
        for (let q = 0; q < 6; q++) {
          const j = q < 4 ? 1 + q * 2 : S - 1;
          const p0 = fp[Math.min(S - 1, j)];
          const pp = fp[Math.max(0, Math.min(S - 1, j) - 1)];
          let tx = p0.x - pp.x, ty = p0.y - pp.y;
          const tl = Math.hypot(tx, ty) || 1;
          tx /= tl; ty /= tl;
          const side = q < 4 ? (q % 2 ? 1 : -1) : q === 4 ? -0.35 : 0.35;
          const len = (q < 4 ? 2.6 + ((k * 5 + q * 3) % 4) : 4.5 + ((k + q) % 3) * 1.6) * (0.4 + 0.6 * fanK[k]);
          let ang = Math.atan2(ty, tx) + side * (q < 4 ? 1.05 : 0.5);
          let x = p0.x, y = p0.y;
          let n = 0;
          for (let s = 0; s <= 4; s++) {
            rx[n] = x; ry[n] = y; rw[n] = 0.42 * (1 - s * 0.15); rl[n] = 0.55; ra[n] = 0.45 * e * fade * (1 - 0.8 * g); rg[n] = s * 2 + q; n++;
            ang += Math.sin(now * 2.6 + k * 1.7 + q * 2.3) * 0.12 - side * 0.12;
            x += (Math.cos(ang) * len) / 4;
            y += (Math.sin(ang) * len) / 4;
          }
          ribbon(n, 0.83 + q * 0.01);
        }
      }

      /* where the hand sticks: each fingertip presses into the row and its silk flattens out into a small,
         smooth pad of glue, a soft wet smear along the finger, with a few fine fibres combed out ahead of it.
         It spreads in one easy motion, then is drawn toward the finger while the web pulls. When the hand
         lets go, the pads hold on and pull out glue strings that thin and snap. */
      if (web.contactT > 0) {
        const stick = fade * (rel > 0 ? 1 - smooth(0.55, 1, rel) : 1);
        const ca = Math.cos(body.a), sa0 = Math.sin(body.a);
        const sc = body.sc;
        const RW = (lx: number, ly: number) => ({ x: body.x + (ca * lx - sa0 * ly) * sc, y: body.y + (sa0 * lx + ca * ly) * sc });
        const tG = (now - web.contactT) * Math.max(0.55, web.rate);
        const pullT = ph === "caught" ? clamp01(web.flex / 30) : ph === "reeling" ? 0.35 : 0;
        for (let k = 0; k < 5; k++) {
          const since = tG - 0.2 - Math.abs(k - 2) * 0.035;
          if (since <= 0) continue;
          const grow = easeOutCubic(clamp01(since / 0.3));
          const T = tipLocal[k];
          /* the finger's direction where it meets the row, in the row's own coordinates */
          const fp = fPts[k];
          const wx = fp[S - 1].x - fp[S - 4].x, wy = fp[S - 1].y - fp[S - 4].y;
          const lx0 = ca * wx + sa0 * wy, ly0 = -sa0 * wx + ca * wy;
          const fl = Math.hypot(lx0, ly0) || 1;
          const fdx = lx0 / fl, fdy = ly0 / fl;
          const fAng = Math.atan2(fdy, fdx);
          /* drawn back toward the finger under tension */
          const pb = 1.6 * pullT;
          const cx0 = T.x - fdx * pb, cy0 = T.y - fdy * pb;
          const c = RW(cx0, cy0);
          const ang = body.a + fAng;
          /* soft contact shadow under the pad */
          {
            const a0 = RW(cx0 - fdx * 4, cy0 - fdy * 4), a1 = RW(cx0 + fdx * 3, cy0 + fdy * 3);
            rx[0] = a0.x + 0.5; ry[0] = a0.y + 1.1; rx[1] = c.x + 0.5; ry[1] = c.y + 1.1; rx[2] = a1.x + 0.5; ry[2] = a1.y + 1.1;
            rw[0] = 3 * grow; rw[1] = 5 * grow; rw[2] = 3 * grow;
            rl[0] = rl[1] = rl[2] = 0; ra[0] = ra[1] = ra[2] = 0.2 * stick; rg[0] = 0; rg[1] = 1; rg[2] = 2;
            ribbon(3, 10);
          }
          /* a few fine fibres combed out ahead of the fingertip, lying flat on the row */
          for (let q = 0; q < 5; q++) {
            const hq = Math.sin(q * 12.9898 + k * 78.233) * 43758.5453;
            const r1 = hq - Math.floor(hq);
            const fa0 = fAng + (q - 2) * 0.32 + (r1 - 0.5) * 0.2;
            const L = (4 + 4.5 * r1) * grow * (1 - 0.25 * pullT);
            const bend = (r1 - 0.5) * 0.5;
            let n = 0;
            for (let j = 0; j <= 4; j++) {
              const v = j / 4;
              const a = fa0 + bend * v;
              const w = RW(cx0 + Math.cos(a) * L * v, cy0 + Math.sin(a) * L * v);
              rx[n] = w.x; ry[n] = w.y;
              rw[n] = 0.7 * (1 - v * 0.7);
              rl[n] = 0.55 + 0.35 * Math.sin(v * 4 + q);
              ra[n] = 0.6 * stick * (1 - v * 0.5);
              rg[n] = v * 6 + q * 2;
              n++;
            }
            ribbon(n, 0.31 + q * 0.07 + k * 0.01);
          }
          /* the glue pad: a soft translucent smear along the finger and a glossy core */
          const sq = 0.5 / (1 + 0.6 * pullT);
          blob(c.x + Math.cos(ang) * 0.8, c.y + Math.sin(ang) * 0.8, 4.6 * grow, k * 3.1 + 5, 0.3 * stick, sq, ang);
          blob(c.x, c.y, 2.5 * grow, k * 1.7, 0.7 * stick, 0.62, ang);
          point(c.x - 0.5, c.y - 0.6, 2.4, 0.55 * stick * grow);
          /* letting go: the pad holds on and draws out a glue string to the lifting finger */
          if (rel > 0 && rel < 0.7) {
            const life = 1 - rel / 0.7;
            const t = tips[k];
            const mx = (c.x + t.x) / 2 + Math.sin(now * 9 + k) * 0.6;
            const my = (c.y + t.y) / 2 + 2.5 * life;
            let n = 0;
            for (let j = 0; j <= 6; j++) {
              const v = j / 6;
              const m = 1 - v;
              rx[n] = m * m * c.x + 2 * m * v * mx + v * v * t.x;
              ry[n] = m * m * c.y + 2 * m * v * my + v * v * t.y;
              rw[n] = (0.4 + 1.1 * Math.abs(v - 0.5) * 2) * (0.35 + 0.65 * life);
              rl[n] = 0.8;
              ra[n] = 0.85 * life * fade;
              rg[n] = v * 8;
              n++;
            }
            ribbon(n, 0.99);
          }
        }
      }

      /* hairs: short loose silk, frosty and spiky toward the hand */
      for (const h of HAIRS) {
        const i = Math.min(M - 2, Math.max(1, Math.round(h.s * (M - 1))));
        const l = Ls[i];
        if (l > total - 4) continue;
        const R = radius(l);
        const near = smooth(total - 100, total - 12, l);
        const tx = -N[i].y;
        const ty = N[i].x;
        let ang = Math.atan2(ty * h.back, tx * h.back);
        const base = Math.atan2(N[i].y * h.side, N[i].x * h.side);
        ang = ang + wrapA(base - ang) * (h.ang / 1.6);
        const len = h.len * (0.45 + 2.0 * near * fa) * thin;
        let x = P[i].x + N[i].x * R * 0.8 * h.side;
        let y = P[i].y + N[i].y * R * 0.8 * h.side;
        let n = 0;
        for (let j = 0; j <= 3; j++) {
          rx[n] = x;
          ry[n] = y;
          rw[n] = 0.7 * (1 - j * 0.2);
          rl[n] = h.li;
          ra[n] = 0.55 * fade * (1 - 0.5 * dof(l)) * (0.6 + 0.4 * near) * (1 - 0.6 * g * near);
          rg[n] = l + j;
          n++;
          ang += h.curl * 0.3;
          x += (Math.cos(ang) * len) / 3;
          y += (Math.sin(ang) * len) / 3;
        }
        ribbon(n, h.seed);
      }

      /* glints: wet points of light that flicker as the silk turns */
      for (const gl0 of GLINTS) {
        const i = Math.min(M - 1, Math.max(0, Math.round(gl0.s * (M - 1))));
        const l = Ls[i];
        const R = radius(l);
        const tw = Math.pow(Math.max(0, Math.sin(now * gl0.f + gl0.ph)), 5);
        const near = smooth(total - 100, total - 10, l);
        const al = (0.12 + 0.88 * tw) * fade * (0.5 + 0.5 * near) * (1 - 0.5 * dof(l));
        point(P[i].x + N[i].x * R * gl0.side, P[i].y + N[i].y * R * gl0.side, gl0.sz * (0.6 + 0.6 * tw) * (1 + 0.4 * near), al);
      }

      /* draw */
      if (!useGL || !gl || !rProg || !pProg) {
        /* no WebGL: a plain glowing strand and fingers, so the catch still reads */
        if (!ctx2) return;
        ctx2.globalCompositeOperation = "lighter";
        ctx2.lineCap = "round";
        ctx2.strokeStyle = `rgba(210,228,250,${(0.85 * fade).toFixed(3)})`;
        ctx2.lineWidth = 2.2;
        ctx2.beginPath();
        ctx2.moveTo(P[0].x, P[0].y);
        for (let i = 1; i < M; i++) ctx2.lineTo(P[i].x, P[i].y);
        ctx2.stroke();
        ctx2.lineWidth = 1.2;
        for (let k = 0; k < 5; k++) {
          ctx2.beginPath();
          ctx2.moveTo(Hd.x, Hd.y);
          for (const q of fPts[k]) ctx2.lineTo(q.x, q.y);
          ctx2.stroke();
        }
        ctx2.globalCompositeOperation = "source-over";
        return;
      }
      gl.enable(gl.BLEND);
      gl.useProgram(rProg.p);
      gl.uniform2f(rProg.uni.uRes, W, H);
      gl.bindBuffer(gl.ARRAY_BUFFER, rBuf);
      gl.bufferData(gl.ARRAY_BUFFER, VB.subarray(0, vn * 7), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(rProg.loc.aPos);
      gl.vertexAttribPointer(rProg.loc.aPos, 2, gl.FLOAT, false, 28, 0);
      gl.enableVertexAttribArray(rProg.loc.aV);
      gl.vertexAttribPointer(rProg.loc.aV, 4, gl.FLOAT, false, 28, 8);
      gl.enableVertexAttribArray(rProg.loc.aSeed);
      gl.vertexAttribPointer(rProg.loc.aSeed, 1, gl.FLOAT, false, 28, 24);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(rProg.uni.uMode, 1);
      gl.uniform2f(rProg.uni.uOff, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, vn);
      gl.disableVertexAttribArray(rProg.loc.aV);
      gl.disableVertexAttribArray(rProg.loc.aSeed);
      if (pn) {
        gl.useProgram(pProg.p);
        gl.uniform2f(pProg.uni.uRes, W, H);
        gl.uniform1f(pProg.uni.uDpr, dpr);
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuf);
        gl.bufferData(gl.ARRAY_BUFFER, PB.subarray(0, pn * 4), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(pProg.loc.aPos);
        gl.vertexAttribPointer(pProg.loc.aPos, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(pProg.loc.aSA);
        gl.vertexAttribPointer(pProg.loc.aSA, 2, gl.FLOAT, false, 16, 8);
        gl.drawArrays(gl.POINTS, 0, pn);
        gl.disableVertexAttribArray(pProg.loc.aSA);
      }
    };

    let shaftDirty = true;
    const drawShaft = (m: number) => {
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (m < 0.003) {
        if (shaftDirty) bctx.clearRect(0, 0, W, H);
        shaftDirty = false;
        return;
      }
      shaftDirty = true;
      bctx.clearRect(0, 0, W, H);
      /* the light page drops into darkness while time is slowed */
      const dk = bctx.createLinearGradient(0, 0, 0, H);
      dk.addColorStop(0, `rgba(12,13,17,${(0.9 * m).toFixed(3)})`);
      dk.addColorStop(1, `rgba(5,6,8,${(0.97 * m).toFixed(3)})`);
      bctx.fillStyle = dk;
      bctx.fillRect(0, 0, W, H);
      const g = bctx.createRadialGradient(W / 2, H * 0.95, 10, W / 2, H * 0.95, Math.max(W, H) * 0.75);
      g.addColorStop(0, `rgba(36,30,28,${(0.85 * m).toFixed(3)})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      bctx.fillStyle = g;
      bctx.fillRect(0, 0, W, H);
      const drift = simT * 38;
      for (const gr of gears) {
        const S = gr.spr.width;
        const sc = (Math.min(W, 900) / 900) * 1.1 + 0.25;
        bctx.save();
        bctx.globalAlpha = 0.9 * m;
        bctx.translate(gr.fx * W, gr.fy * H - drift * 0.35);
        bctx.rotate(simT * gr.rot * 2 + gr.fx * 3);
        bctx.drawImage(gr.spr, (-S / 2) * sc, (-S / 2) * sc, S * sc, S * sc);
        bctx.restore();
      }
      bctx.globalCompositeOperation = "lighter";
      for (const b of bokeh) {
        const y = ((b.y * H - drift * b.sp - now * 3 * b.sp) % (H * 1.1) + H * 1.1) % (H * 1.1);
        const tw = 0.75 + 0.25 * Math.sin(now * 0.9 + b.ph);
        bctx.globalAlpha = m * b.a * 0.55 * tw;
        const r = b.r * 2;
        bctx.drawImage(bokehSprite, b.x * W - r, y - r, r * 2, r * 2);
      }
      for (const d of dust) {
        const y = ((d.y * H - drift * d.sp * 1.6 - now * 6 * d.sp) % H + H) % H;
        bctx.globalAlpha = m * 0.35 * (0.6 + 0.4 * Math.sin(now * 2 + d.ph));
        bctx.fillStyle = "#e9e4dc";
        bctx.fillRect(d.x * W + Math.sin(now * 0.7 + d.ph) * 4 - d.r / 2, y - d.r / 2, d.r, d.r);
      }
      bctx.globalAlpha = 1;
      bctx.globalCompositeOperation = "source-over";
    };

    /* ---- loop ---- */
    let now = performance.now() / 1000;
    let raf = 0;
    let visible = true;
    let reducedNow = reduced;
    let wasM = 0;
    const frame = () => {
      raf = 0;
      const t = performance.now() / 1000;
      const dt = clamp(t - now, 0.0001, 0.05);
      now = t;
      reducedNow = reduced;

      /* time scale */
      let tsTarget = 1;
      if (ph === "falling" || ph === "flying") {
        const top = body.y - (body.h / 2) * body.sc;
        tsTarget = reducedNow ? 1 : 1 + ((ph === "flying" ? TS_MIN * Math.max(0.45, web.rate) : TS_MIN) - 1) * smooth(cardBottom - 92, cardBottom - 6, top);
        ts += (tsTarget - ts) * (1 - Math.exp(-dt / 0.07));
      } else if (ph === "caught") {
        const u = clamp01((now - web.contactT) / 0.45);
        ts = web.tsAtContact + (0.5 - web.tsAtContact) * easeOutCubic(u);
      } else {
        ts += (1 - ts) * (1 - Math.exp(-dt / 0.18));
      }
      const sdt = dt * ts;
      simT += sdt;
      const m = clamp01((1 - ts) / (1 - TS_MIN));
      if (m > 0.6 && wasM <= 0.6) cue("slowmo");
      wasM = m;

      /* body */
      if (ph === "falling" || ph === "flying") {
        if (reducedNow) {
          if (now - fallT0 > 5) miss();
        } else {
          /* air drag gives a terminal speed, so the slow motion reads as a steady, floating fall */
          body.vy += (G - 0.0056 * body.vy * Math.abs(body.vy)) * sdt;
          body.vx *= Math.exp(-0.4 * sdt);
          body.x += body.vx * sdt;
          body.y += body.vy * sdt;
          body.a += body.va * sdt;
          const deep = clamp01((body.y - slotP.y) / 260);
          body.depth = deep;
          body.sc = 1 - 0.1 * deep;
          if (body.y - (body.h / 2) * body.sc > H + 6) miss();
        }
      } else if (ph === "caught") {
        const r = toWorld(web.local.x, web.local.y);
        const rx = r.x - body.x;
        const ry = r.y - body.y;
        const dxA = web.A.x - r.x;
        const dyA = web.A.y - r.y;
        const L = Math.hypot(dxA, dyA) || 1;
        const ux = dxA / L;
        const uy = dyA / L;
        const vpx = body.vx - body.va * ry;
        const vpy = body.vy + body.va * rx;
        const away = -(vpx * ux + vpy * uy);
        const stretch = L - web.L0;
        const ramp = clamp01((simT - web.contactSim) / 0.06);
        let F = 0;
        if (stretch > 0) F = Math.max(0, (150 * stretch + 11 * away) * ramp);
        const fx2 = ux * F;
        const fy2 = uy * F;
        const I = (body.w * body.w + body.h * body.h) / 12;
        body.vx += fx2 * sdt;
        body.vy += (fy2 + G) * sdt;
        body.vx *= Math.exp(-0.8 * sdt);
        body.va += ((rx * fy2 - ry * fx2) / I) * sdt;
        body.va *= Math.exp(-2.6 * sdt);
        body.x += body.vx * sdt;
        body.y += body.vy * sdt;
        body.a += body.va * sdt;
        body.depth += (0 - body.depth) * (1 - Math.exp(-dt / 0.3));
        body.sc = 1 - 0.1 * body.depth;
        web.flex = Math.max(0, stretch);
        const since = now - web.contactT;
        if (since > 0.8 && (Math.hypot(body.vx, body.vy) < 70 || since > 1.6)) {
          go("reeling");
          cue("reel");
          const ov = overlayRef.current;
          if (ov) ov.style.zIndex = "30";
        }
      } else if (ph === "reeling") {
        const k = 58;
        const c = 12.5;
        body.vx += (k * (slotP.x - body.x) - c * body.vx) * dt;
        body.vy += (k * (slotP.y - body.y) - c * body.vy) * dt;
        body.va += (k * 1.3 * (0 - body.a) - c * body.va) * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.a += body.va * dt;
        body.depth += (0 - body.depth) * (1 - Math.exp(-dt / 0.15));
        body.sc = 1 - 0.1 * body.depth;
        web.flex = 0;
        if (Math.hypot(slotP.x - body.x, slotP.y - body.y) < 0.7 && Math.hypot(body.vx, body.vy) < 10 && Math.abs(body.a) < 0.004) settle();
      }

      /* web */
      if (web.on) {
        if (ph === "flying") {
          const u = clamp01((now - web.t0) / (FLY / web.rate));
          web.A = anchor();
          /* the palm lands flat on the row's face, a little below its top edge */
          const tgt = toWorld(clamp((web.A.x - body.x) * 0.35, -body.w / 2 + 60, body.w / 2 - 60), -body.h / 2 + 15);
          const e = 1 - Math.pow(1 - u, 2.2);
          web.Hd = { x: web.A.x + (tgt.x - web.A.x) * e, y: web.A.y + (tgt.y - web.A.y) * e };
          if (u >= 1) {
            const c = Math.cos(-body.a);
            const s = Math.sin(-body.a);
            const lx = (tgt.x - body.x) / body.sc;
            const ly = (tgt.y - body.y) / body.sc;
            web.local = { x: c * lx - s * ly, y: s * lx + c * ly };
            web.L0 = Math.hypot(web.A.x - tgt.x, web.A.y - tgt.y);
            web.contactT = now;
            web.contactSim = simT;
            web.tsAtContact = ts;
            web.spin = 0.2;
            go("caught");
            cue("catch");
          }
        } else if (ph === "caught" || ph === "reeling") {
          web.Hd = toWorld(web.local.x, web.local.y);
          web.spin = ph === "reeling" ? -2.6 : 0.2;
        } else if (web.retractT >= 0) {
          const u = clamp01((now - web.retractT) / 0.75);
          /* the hand peels off first, then the line is pulled back in */
          const e = smooth(0.35, 1, u);
          web.Hd = { x: web.retractFrom.x + (web.A.x - web.retractFrom.x) * e, y: web.retractFrom.y + (web.A.y - web.retractFrom.y) * e };
          web.fade = 1 - smooth(0.6, 1, u);
          web.spin = -4;
          if (u >= 1) {
            web.on = false;
            web.retractT = -1;
          }
        }
      }

      /* toast clock */
      if (ph === "falling" || ph === "flying") {
        const exitY = H + body.h / 2 + 6;
        const prog = clamp01((body.y - slotP.y) / Math.max(1, exitY - slotP.y));
        const arc = clockArcRef.current;
        if (arc) arc.style.strokeDashoffset = String(56.55 * prog);
        const hand = clockHandRef.current;
        if (hand) {
          const tick = Math.floor(prog * 60) / 60;
          hand.style.transform = `rotate(${tick * 360}deg)`;
        }
      }
      if (hideToastAt && now > hideToastAt) {
        hideToastAt = 0;
        setToast((t) => ({ ...t, show: false }));
      }
      if (ph === "settle" && now - settleT > 0.4 && !web.on) {
        go("idle");
        window.setTimeout(() => setLandedId(null), 500);
      }
      if (ph === "missed" && now - missT > 0.5) go("idle");

      /* overlay row */
      const ov = overlayRef.current;
      if (ov && (ph === "falling" || ph === "flying" || ph === "caught" || ph === "reeling")) {
        const tilt = body.depth * 22;
        ov.style.transform = `translate(${(body.x - slotP.x).toFixed(2)}px, ${(body.y - slotP.y).toFixed(2)}px) rotate(${body.a.toFixed(4)}rad) perspective(900px) rotateX(${tilt.toFixed(2)}deg) scale(${body.sc.toFixed(4)})`;
        const shade = ov.lastElementChild as HTMLElement | null;
        if (shade) shade.style.opacity = (ph === "reeling" ? 0 : body.depth * 0.45).toFixed(3);
      }

      /* list mood */
      const dim = dimRef.current;
      if (dim) dim.style.opacity = (m * 0.62).toFixed(3);
      const hint = hintRef.current;
      if (hint) hint.style.opacity = (1 - m).toFixed(3);

      /* draw */
      drawShaft(m);
      if (web.on || glDirty) {
        let sag = 0;
        let wave = 0;
        if (ph === "flying") {
          const u = clamp01((now - web.t0) / (FLY / web.rate));
          const L = Math.hypot(web.Hd.x - web.A.x, web.Hd.y - web.A.y);
          sag = 0.035 * L * Math.pow(1 - u, 1.5);
          wave = 1.4 * (1 - u);
        } else if (ph === "caught") {
          const s = now - web.contactT;
          sag = 5 * Math.exp(-s / 0.35) * Math.sin(s * 30);
        }
        renderWeb(sag, wave, web.flex);
        glDirty = web.on;
      }

      runGhost();
      if (visible) raf = requestAnimationFrame(frame);
    };

    /* ---- input ---- */
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.movementX === 0 && e.movementY === 0 && e.type === "pointermove") return;
      lastReal = now;
      if (ghostOn) {
        ghostOn = false;
        ghostQ = [];
        ghostStep = null;
        setGhostHover(null);
      }
    };
    const resumeCheck = window.setInterval(() => {
      if (autoplay && !ghostOn && now - lastReal > 5 && ph === "idle") {
        ghostOn = true;
        cycle = 0;
        ghostPos.x = W * 0.8;
        ghostPos.y = H * 0.86;
        ghostQ = [];
        ghostStep = null;
      }
    }, 500);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z")) {
        if (ph === "falling") {
          e.preventDefault();
          undo();
        }
      }
    };

    fit();
    measureCard();
    ghostPos.x = W * 0.8;
    ghostPos.y = H * 0.86;
    const ro = new ResizeObserver(() => {
      fit();
      measureCard();
    });
    ro.observe(stage);
    const io = new IntersectionObserver(
      (es) => {
        visible = es.some((e) => e.isIntersecting);
        if (visible && !raf) {
          now = performance.now() / 1000;
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(stage);
    stage.addEventListener("pointermove", onPointer);
    stage.addEventListener("pointerdown", onPointer);
    stage.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(frame);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.clearInterval(resumeCheck);
      stage.removeEventListener("pointermove", onPointer);
      stage.removeEventListener("pointerdown", onPointer);
      stage.removeEventListener("keydown", onKey);
      fx.removeEventListener("webglcontextlost", onLost);
      fx.removeEventListener("webglcontextrestored", onRestored);
      engine.current = null;
    };
  }, [autoplay, reduced]);

  /* keep the overlay pinned to its slot on first paint */
  useLayoutEffect(() => {
    const ov = overlayRef.current;
    if (ov && fallingId) {
      ov.style.transform = "none";
      ov.style.zIndex = "5";
    }
  }, [fallingId]);

  const onDelete = useCallback((id: string) => engine.current?.del(id), []);
  const onUndo = useCallback(() => engine.current?.undo(), []);
  const fallingFile = files.find((f) => f.id === fallingId) || null;
  const busy = phase !== "idle";
  const spring = { type: "spring" as const, stiffness: 420, damping: 34 };

  return (
    <div
      ref={stageRef}
      className={cx("relative w-full select-none overflow-hidden rounded-[24px]", className)}
      style={{
        height,
        background: "radial-gradient(120% 80% at 50% 0%, #ffffff 0%, #f5f5f7 55%, #ececf0 100%)",
        color: "#1d1d1f",
        fontFamily: "inherit",
      }}
    >
      <style>{`
        .cu-row{transition:background-color .2s ease}
        .cu-row:hover,.cu-row[data-ghost="1"]{background:#f5f5f7}
        .cu-trash{color:#86868b;transition:background-color .2s ease,color .2s ease}
        .cu-row:hover .cu-trash,.cu-row[data-ghost="1"] .cu-trash{color:#e23636;background:rgba(226,54,54,.09)}
        .cu-trash:focus-visible,.cu-undo:focus-visible,.cu-link:focus-visible{outline:2px solid #1f4ea8;outline-offset:2px}
      `}</style>
      <canvas ref={bgRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />

      {/* falling row (behind the list card while it drops, in front while it is reeled back) */}
      {fallingFile && slot && !reduced && (
        <div
          ref={overlayRef}
          aria-hidden
          className="pointer-events-none absolute"
          style={{ left: slot.x, top: slot.y, width: slot.w, height: slot.h, zIndex: 5, willChange: "transform" }}
        >
          <div
            className="flex h-full items-center gap-3 rounded-[14px] px-3"
            style={{
              background: "#ffffff",
              boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 24px 44px -18px rgba(0,0,0,.55), inset 0 -2px 0 rgba(226,54,54,.0)",
            }}
          >
            <RowBody f={fallingFile} />
          </div>
          <div className="absolute inset-0 rounded-[14px]" style={{ background: "#07080b", opacity: 0 }} />
        </div>
      )}

      {/* list card */}
      <div
        ref={cardRef}
        className="absolute left-1/2 overflow-hidden rounded-[22px] bg-white"
        style={{
          top: 84,
          width: "min(460px, calc(100% - 32px))",
          transform: "translateX(-50%)",
          zIndex: 10,
          boxShadow: "0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)",
        }}
      >
        {/* Spider-Man red and blue, as a thin rule and a web in the corner */}
        <div aria-hidden className="h-[3px] w-full" style={{ background: "linear-gradient(90deg,#e23636 0%,#e23636 48%,#1f4ea8 52%,#1f4ea8 100%)" }} />
        <svg aria-hidden className="pointer-events-none absolute right-0 top-[3px]" width="120" height="96" viewBox="0 0 120 96" style={{ opacity: 0.09 }}>
          <g fill="none" stroke="#1d1d1f" strokeWidth="0.9">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = Math.PI / 2 + (i / 5) * (Math.PI / 2);
              return <line key={i} x1={120} y1={0} x2={(120 + Math.cos(a) * 140).toFixed(2)} y2={(Math.sin(a) * 140).toFixed(2)} />;
            })}
            {[22, 42, 64, 88].map((r, i) => (
              <path
                key={i}
                d={[0, 1, 2, 3, 4]
                  .map((j) => {
                    const a0 = Math.PI / 2 + (j / 5) * (Math.PI / 2);
                    const a1 = Math.PI / 2 + ((j + 1) / 5) * (Math.PI / 2);
                    const am = (a0 + a1) / 2;
                    const p0 = [120 + Math.cos(a0) * r, Math.sin(a0) * r];
                    const p1 = [120 + Math.cos(a1) * r, Math.sin(a1) * r];
                    const c = [120 + Math.cos(am) * r * 0.86, Math.sin(am) * r * 0.86];
                    const q = (n: number) => n.toFixed(2); // trig results differ in the last digits between Node and the browser
                    return `${j === 0 ? `M${q(p0[0])},${q(p0[1])}` : ""} Q${q(c[0])},${q(c[1])} ${q(p1[0])},${q(p1[1])}`;
                  })
                  .join(" ")}
              />
            ))}
          </g>
        </svg>
        <div className="relative flex items-center justify-between px-4 pb-2 pt-3">
          <div className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: "#1d1d1f" }}>
            Recent files
          </div>
          <motion.div
            layout
            className="rounded-full px-2 py-0.5 text-[12px] font-medium tabular-nums"
            style={{ background: "#f5f5f7", color: "#6e6e73" }}
          >
            {files.length} items
          </motion.div>
        </div>
        <div
          ref={dimRef}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "#07080b", opacity: 0, zIndex: 2 }}
        />
        <div ref={rowsRef} className="relative px-1.5 pb-1.5" role="list">
          <AnimatePresence initial={false}>
            {files.map((f) => {
              const isFalling = f.id === fallingId;
              return (
                <motion.div
                  key={f.id}
                  data-row={f.id}
                  role="listitem"
                  data-ghost={ghostHover === f.id ? "1" : undefined}
                  className="cu-row relative overflow-hidden rounded-[14px]"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 58, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={spring}
                >
                  {isFalling ? (
                    <motion.div
                      className="absolute inset-[4px] rounded-[12px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ border: "1.5px dashed rgba(29,29,31,.14)", background: "rgba(226,54,54,.03)" }}
                    />
                  ) : (
                    <motion.div
                      className="flex h-full items-center gap-3 px-3"
                      initial={false}
                      animate={landedId === f.id ? { scale: [1.035, 0.985, 1], y: [-3, 1, 0] } : { scale: 1, y: 0 }}
                      transition={{ duration: 0.55, ease: [0.2, 0.9, 0.25, 1] }}
                    >
                      <RowBody f={f} />
                      <motion.button
                        type="button"
                        data-trash={f.id}
                        aria-label={`Delete ${f.name}`}
                        disabled={busy}
                        onClick={() => onDelete(f.id)}
                        whileHover={busy ? undefined : { scale: 1.08 }}
                        whileTap={busy ? undefined : { scale: 0.88 }}
                        transition={spring}
                        className="cu-trash ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border-0 bg-transparent p-0"
                        style={{ cursor: busy ? "default" : "pointer" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {files.length < FILES.length && !autoplay && phase === "idle" && (
            <button
              type="button"
              onClick={() => engine.current?.restore()}
              className="cu-link mx-2 my-1.5 border-0 bg-transparent p-0 text-[12px] font-medium"
              style={{ color: "#1f4ea8", cursor: "pointer" }}
            >
              Restore demo files
            </button>
          )}
        </div>
      </div>

      {/* hint and the slow-hand switch */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between gap-3 px-4" style={{ zIndex: 45 }}>
        <div ref={hintRef} className="pointer-events-none min-w-0 text-[12px] leading-tight" style={{ color: "#86868b" }}>
          Delete a file, then catch it with Undo before it falls.
        </div>
        <motion.button
          ref={slowBtnRef}
          type="button"
          role="switch"
          aria-checked={slow}
          onClick={() => setSlow((v) => !v)}
          whileTap={{ scale: 0.94 }}
          className="cu-link flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-0 py-1.5 pl-2 pr-3 text-[12px] font-medium"
          style={{
            background: slow ? "#1f4ea8" : "rgba(255,255,255,.9)",
            color: slow ? "#ffffff" : "#1d1d1f",
            boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 6px 16px -10px rgba(0,0,0,.5)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span
            aria-hidden
            className="relative inline-block h-[14px] w-[24px] rounded-full"
            style={{ background: slow ? "rgba(255,255,255,.35)" : "#d2d2d7", transition: "background .2s" }}
          >
            <motion.span
              className="absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white"
              animate={{ left: slow ? 12 : 2 }}
              transition={spring}
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,.3)" }}
            />
          </span>
          Slow hand
        </motion.button>
      </div>

      {/* web */}
      <canvas ref={fxRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 40 }} />

      {/* toast */}
      <motion.div
        role="status"
        aria-live="polite"
        className="absolute flex items-center gap-3 rounded-[16px] bg-white py-2 pl-2.5 pr-2"
        initial={false}
        animate={{ y: toast.show ? 0 : -18, opacity: toast.show ? 1 : 0, scale: toast.show ? 1 : 0.94 }}
        transition={{ type: "spring", stiffness: 520, damping: 30 }}
        style={{
          left: "50%",
          x: "-50%",
          top: 18,
          zIndex: 50,
          maxWidth: "calc(100% - 24px)",
          pointerEvents: toast.show ? "auto" : "none",
          boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 18px 36px -18px rgba(0,0,0,.45)",
        }}
      >
        {toast.kind === "restored" ? (
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
            <circle cx="11" cy="11" r="9" fill="rgba(48,209,88,.12)" stroke="#30d158" strokeWidth="1.4" />
            <path d="M7 11.3l2.6 2.5L15 8.4" fill="none" stroke="#1f9d45" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden style={{ opacity: toast.kind === "gone" ? 0.45 : 1 }}>
            <circle cx="11" cy="11" r="9" fill="none" stroke="#ececf0" strokeWidth="2" />
            <circle
              ref={clockArcRef}
              cx="11"
              cy="11"
              r="9"
              fill="none"
              stroke="#e23636"
              strokeWidth="2"
              strokeDasharray="56.55"
              strokeDashoffset="0"
              transform="rotate(-90 11 11)"
              strokeLinecap="round"
            />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * TAU;
              return <line key={i} x1={11 + Math.cos(a) * 5.6} y1={11 + Math.sin(a) * 5.6} x2={11 + Math.cos(a) * 6.6} y2={11 + Math.sin(a) * 6.6} stroke="#c7c7cc" strokeWidth={i % 3 === 0 ? 1 : 0.6} />;
            })}
            <line ref={clockHandRef} x1="11" y1="11" x2="11" y2="5.6" stroke="#1d1d1f" strokeWidth="1.2" strokeLinecap="round" style={{ transformOrigin: "11px 11px", transition: "transform .12s cubic-bezier(.3,1.8,.5,1)" }} />
            <circle cx="11" cy="11" r="1.2" fill="#1d1d1f" />
          </svg>
        )}
        <div className="min-w-0 text-[13px] leading-tight">
          <div className="truncate font-semibold tracking-[-0.01em]" style={{ color: "#1d1d1f", maxWidth: 230 }}>
            {toast.kind === "restored" ? "Restored" : toast.kind === "gone" ? "Deleted" : toast.kind === "restoring" ? "Catching…" : "Moved to Trash"}
          </div>
          <div className="truncate" style={{ color: "#6e6e73", maxWidth: 230 }}>
            {toast.name}
          </div>
        </div>
        {(toast.kind === "deleted" || toast.kind === "restoring") && (
          <motion.button
            ref={undoRef}
            type="button"
            onClick={onUndo}
            disabled={toast.kind !== "deleted"}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            transition={spring}
            className="cu-undo flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] border-0 px-3 py-1.5 text-[13px] font-semibold text-white"
            style={{
              background: "linear-gradient(180deg,#ef4444,#d62828)",
              boxShadow: "0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -6px rgba(214,40,40,.7)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Undo
            <span className="whitespace-nowrap rounded-[5px] px-1 text-[10.5px] font-medium" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>
              {mac ? "⌘Z" : "Ctrl Z"}
            </span>
          </motion.button>
        )}
      </motion.div>

      {/* ghost cursor */}
      {autoplay && (
        <div ref={ghostRef} aria-hidden className="pointer-events-none absolute left-0 top-0" style={{ zIndex: 60, opacity: 0, willChange: "transform" }}>
          <div className="absolute left-0 top-0 h-7 w-7 rounded-full" style={{ border: "1.5px solid rgba(31,78,168,.7)", opacity: 0 }} />
          <svg width="20" height="22" viewBox="0 0 20 22" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))" }}>
            <path d="M2 1.5v16.2l4.3-4.1 2.9 6.6 2.7-1.2-2.9-6.5H15L2 1.5z" fill="#111" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

function RowBody({ f }: { f: FileItem }) {
  return (
    <>
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-[9px] font-bold tracking-[0.04em]"
        style={{ background: `color-mix(in srgb, ${f.tint} 11%, #ffffff)`, color: f.tint, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${f.tint} 22%, transparent)` }}
      >
        {f.ext}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[14px] font-medium tracking-[-0.01em]" style={{ color: "#1d1d1f" }}>
          {f.name}
        </div>
        <div className="truncate text-[12px] tabular-nums" style={{ color: "#6e6e73" }}>
          {f.meta}
        </div>
      </div>
    </>
  );
}
