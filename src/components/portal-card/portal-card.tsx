"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const CAP = 5000; // flung sparks alive at once
const OCAP = 7000; // sparks racing round the rim
const BUCKETS: [string, number][] = [
  ["#fff7d6", 1.7],
  ["#ffd56e", 1.5],
  ["#ff9b2f", 1.3],
  ["#ff5b16", 1.05],
  ["#b8290c", 0.85],
];

/* Least-squares circle through the drawn points (Kasa's method), so an unfinished or wobbly loop
   still opens where the hand meant it to. */
function fitCircle(pts: { x: number; y: number }[]) {
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.x, 0) / n, my = pts.reduce((a, p) => a + p.y, 0) / n;
  let suu = 0, svv = 0, suv = 0, suuu = 0, svvv = 0, suvv = 0, svuu = 0;
  for (const p of pts) {
    const u = p.x - mx, v = p.y - my;
    suu += u * u; svv += v * v; suv += u * v;
    suuu += u * u * u; svvv += v * v * v; suvv += u * v * v; svuu += v * u * u;
  }
  const det = suu * svv - suv * suv;
  if (Math.abs(det) < 1e-6) {
    const R = pts.reduce((a, p) => a + Math.hypot(p.x - mx, p.y - my), 0) / n;
    return { cx: mx, cy: my, R };
  }
  const b1 = 0.5 * (suuu + suvv), b2 = 0.5 * (svvv + svuu);
  const uc = (b1 * svv - b2 * suv) / det, vc = (b2 * suu - b1 * suv) / det;
  const R = Math.sqrt(uc * uc + vc * vc + (suu + svv) / n);
  return { cx: mx + uc, cy: my + vc, R };
}

/* The default world on the other side: a dusk valley with layered hills that shift as you look
   through the portal. Pass children to put your own content there instead. */
function OtherSide() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    x: (i * 37.7) % 100,
    y: ((i * 53.3) % 45) + 2,
    s: 1 + ((i * 7) % 3) * 0.6,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#21173f 0%,#5d3586 32%,#d5627c 60%,#ffab66 80%,#ffd99c 100%)" }}>
      {stars.map((st, i) => (
        <span key={i} className="absolute rounded-full bg-white" style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, opacity: 0.5 + ((i * 13) % 5) / 10 }} />
      ))}
      <div
        className="absolute left-[58%] top-[56%] h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle,#fff6d2 0%,#ffd27a 38%,rgba(255,170,90,0.35) 58%,rgba(255,150,90,0) 70%)", transform: "translate(calc(-50% + var(--px,0) * -4px), calc(-50% + var(--py,0) * -3px))" }}
      />
      {[
        { c: "#7a3f86", d: "M0 260 L90 190 L170 230 L260 160 L360 220 L470 150 L560 210 L660 170 L760 230 L860 180 L1000 240 L1000 400 L0 400Z", k: 6, y: 0 },
        { c: "#4a2563", d: "M0 290 L120 220 L220 270 L330 200 L420 260 L540 210 L650 270 L760 220 L880 280 L1000 230 L1000 400 L0 400Z", k: 13, y: 20 },
        { c: "#26123d", d: "M0 330 L140 270 L250 320 L380 260 L500 320 L620 280 L740 330 L860 290 L1000 330 L1000 400 L0 400Z", k: 24, y: 40 },
      ].map((m, i) => (
        <svg key={i} viewBox="0 0 1000 400" preserveAspectRatio="none" className="absolute bottom-0 left-[-4%] h-[62%] w-[108%]" style={{ transform: `translate(calc(var(--px,0) * ${-m.k}px), calc(var(--py,0) * ${-m.k * 0.4}px))` }} aria-hidden="true">
          <path d={m.d} fill={m.c} />
        </svg>
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ transform: "translate(calc(var(--px,0) * -3px), calc(var(--py,0) * -2px))" }}>
        <p className="m-0 text-[clamp(30px,5vw,48px)] font-semibold leading-[1.02] tracking-[-0.04em] text-white" style={{ textShadow: "0 2px 24px rgba(60,10,60,.45)" }}>
          The other side.
        </p>
        <p className="m-0 mt-2 max-w-[360px] text-[15px] leading-[1.4] text-white/85">A page, a product, a video. Anything can wait behind a portal.</p>
      </div>
    </div>
  );
}

/**
 * Portal Card: hold the pointer down and draw a circle, and a ring of molten sparks tears open where
 * you drew it. Through it you see another world, which shifts with the pointer like a view through a
 * window. Sparks race round the rim, peel off, fall and bounce on the floor. Click inside to step
 * through (the portal swallows the whole card), and close it to come back; click outside, or press
 * Escape, to let it collapse in a shower of embers. The other side is real DOM, clipped to the
 * circle, so pass any children you like. Keyboard users get an "Open portal" button. With
 * `autoplay` a ghost hand draws, opens, steps through and returns until the pointer arrives.
 * Pauses off screen. Under reduced motion the portal still opens and closes on demand, but it
 * snaps instead of tearing, and there are no sparks, flicker or parallax.
 */
export type PortalCardProps = {
  /** What waits on the other side. Defaults to a dusk valley. */
  children?: ReactNode;
  /** Height of the card, in px. It is always as wide as its parent. */
  height?: number;
  /** A ghost hand draws a circle, opens the portal, steps through and returns, until a real pointer arrives. */
  autoplay?: boolean;
  className?: string;
};

export function PortalCard({ children, height = 460, autoplay = false, className }: PortalCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ open: () => void; close: () => void }>({ open: () => {}, close: () => {} });
  const autoplayRef = useRef(autoplay);
  const [phase, setPhase] = useState<"idle" | "open" | "through">("idle");

  // The long effect below reads this every frame, so toggling autoplay never rebuilds the scene.
  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    const stage = stageRef.current!, canvas = canvasRef.current!, side = sideRef.current!;
    const g = canvas.getContext("2d");
    if (!g) return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let reduced = !!mq?.matches;
    const onMq = () => { reduced = !!mq?.matches; };
    mq?.addEventListener?.("change", onMq);
    side.style.clipPath = "circle(0px at 50% 50%)";
    let w = 0, h = 0, dpr = 1;
    const fit = () => {
      // Layout size, not the on-screen box, so a CSS-scaled preview shell does not shrink the canvas.
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = stage.offsetWidth; h = stage.offsetHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    fit();

    // sparks that race round the rim: angle, radius, angular speed, outward drift, life
    const oa = new Float32Array(OCAP), orr = new Float32Array(OCAP), ow = new Float32Array(OCAP), odr = new Float32Array(OCAP);
    const ol = new Float32Array(OCAP), om = new Float32Array(OCAP);
    let ohead = 0;
    // the rim burns unevenly: its radius flickers round the circle and over time
    const edge = (a: number, t: number) => 1 + 0.028 * Math.sin(5 * a + t * 7) + 0.018 * Math.sin(11 * a - t * 13) + 0.01 * Math.sin(23 * a + t * 29);
    // spark pool
    const sx = new Float32Array(CAP), sy = new Float32Array(CAP), svx = new Float32Array(CAP), svy = new Float32Array(CAP);
    const life = new Float32Array(CAP), maxl = new Float32Array(CAP), heavy = new Uint8Array(CAP);
    let head = 0;
    const emit = (x: number, y: number, vx: number, vy: number, l: number, hv = 0) => {
      const i = head;
      head = (head + 1) % CAP;
      sx[i] = x; sy[i] = y; svx[i] = vx; svy[i] = vy; life[i] = l; maxl[i] = l; heavy[i] = hv;
    };

    // portal
    type Mode = "idle" | "drawing" | "opening" | "open" | "stepping" | "through" | "closing";
    let mode: Mode = "idle";
    const P = { x: 0, y: 0, R: 0, r: 0, v: 0, dir: 1, spin: 0, t: 0, from: 0 };
    const setMode = (m: Mode) => {
      mode = m;
      P.t = 0;
      setPhase(m === "through" || m === "stepping" ? "through" : m === "open" || m === "opening" ? "open" : "idle");
    };
    const openAt = (x: number, y: number, R: number, dir: number) => {
      P.x = x; P.y = y; P.R = R; P.r = 4; P.v = 0; P.dir = dir;
      // a burst where it tears open
      for (let k = 0; !reduced && k < 260; k++) {
        const a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 520;
        emit(x + Math.cos(a) * 6, y + Math.sin(a) * 6, Math.cos(a) * s, Math.sin(a) * s, 0.25 + Math.random() * 0.45, Math.random() < 0.2 ? 1 : 0);
      }
      setMode("opening");
    };
    const close = () => {
      if (mode === "idle" || mode === "drawing" || mode === "closing") return;
      P.from = P.r;
      setMode("closing");
    };
    apiRef.current = {
      // the keyboard route: open it, press again to step through, press again to come back
      open: () => {
        if (mode === "idle") openAt(w / 2, h / 2, Math.min(w, h) * 0.32, 1);
        else if (mode === "open") setMode("stepping");
        else if (mode === "through") close();
      },
      close,
    };

    // drawing the gesture
    let pts: { x: number; y: number }[] = [];
    let turn = 0, plen = 0;
    const ptr = { x: -999, y: -999, down: false, inside: false, last: 0 };
    let touched = false;
    const addPoint = (x: number, y: number) => {
      const n = pts.length;
      if (n && Math.hypot(x - pts[n - 1].x, y - pts[n - 1].y) < 6) return;
      if (n >= 2) {
        const a1 = Math.atan2(pts[n - 1].y - pts[n - 2].y, pts[n - 1].x - pts[n - 2].x);
        const a2 = Math.atan2(y - pts[n - 1].y, x - pts[n - 1].x);
        let d = a2 - a1;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        turn += d;
      }
      if (n) plen += Math.hypot(x - pts[n - 1].x, y - pts[n - 1].y);
      pts.push({ x, y });
      // closed a loop: fit a circle to the last lap and open it
      if (Math.abs(turn) > Math.PI * 2 * 0.8 && plen > 220) {
        const { cx, cy, R } = fitCircle(pts);
        const RR = Math.max(70, Math.min(Math.min(w, h) * 0.44, R));
        pts = [];
        openAt(cx, cy, RR, Math.sign(turn) || 1);
      }
    };
    const local = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      // Undo any CSS scale on a parent so pointer space matches layout space.
      const k = stage.offsetWidth ? r.width / stage.offsetWidth : 1;
      return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      touched = true;
      const p = local(e);
      ptr.x = p.x; ptr.y = p.y; ptr.down = true; ptr.last = performance.now();
      if (mode === "open") {
        // inside steps through, outside lets it collapse
        if (Math.hypot(p.x - P.x, p.y - P.y) < P.r) setMode("stepping");
        else close();
        return;
      }
      if (mode === "idle") {
        stage.setPointerCapture(e.pointerId);
        mode = "drawing";
        pts = []; turn = 0; plen = 0;
        addPoint(p.x, p.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      ptr.x = p.x; ptr.y = p.y;
      ptr.inside = p.x >= 0 && p.y >= 0 && p.x <= w && p.y <= h;
      if (ptr.inside) { touched = true; ptr.last = performance.now(); }
      if (mode === "drawing" && ptr.down) addPoint(p.x, p.y);
    };
    const onUp = (e: PointerEvent) => {
      ptr.down = false;
      // a finger that lifts has left the card, so the ghost may take over again
      if (e.pointerType !== "mouse") ptr.inside = false;
      if (mode === "drawing") { mode = "idle"; pts = []; }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);

    // ghost for autoplay: draw a circle, open, step through, come back
    let ghostT = 0;
    let ghostDrawn = false, ghostStepped = false;
    const ghost = { x: 0, y: 0, on: false };

    let raf = 0;
    let visible = true;
    let prev = performance.now();
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!visible) return;
      const dt = Math.max(1 / 240, Math.min(0.033, (now - prev) / 1000));
      prev = now;
      if (!w || !h) return;

      // ---- autoplay ----
      // never hijack a portal the visitor opened themselves
      const auto = autoplayRef.current && !reduced && (mode === "idle" || ghostDrawn)
        && (!touched || (!ptr.inside && !ptr.down && now - ptr.last > 4000));
      ghost.on = false;
      if (auto) {
        ghostT += dt;
        const cx = w * 0.5, cy = h * 0.47, R = Math.min(w, h) * 0.3;
        if (ghostT < 0.5) { ghost.on = true; ghost.x = cx + R; ghost.y = cy; }
        else if (ghostT < 1.9) {
          // the hand draws the circle
          if (mode === "idle" && !ghostDrawn) { mode = "drawing"; pts = []; turn = 0; plen = 0; }
          const a = ((ghostT - 0.5) / 1.3) * Math.PI * 2.05;
          ghost.on = true;
          ghost.x = cx + Math.cos(a) * R + Math.sin(a * 3) * 4;
          ghost.y = cy + Math.sin(a) * R * 0.96;
          if (mode === "drawing") addPoint(ghost.x, ghost.y);
          ghostDrawn = true;
        } else if (ghostDrawn && (mode === "open" || mode === "opening") && ghostT > 3.6 && !ghostStepped) {
          ghostStepped = true;
          setMode("stepping");
        } else if (mode === "through" && P.t > 1.6) {
          close();
        } else if (mode === "idle" && ghostT > 3) {
          ghostT = 0; ghostStepped = false; ghostDrawn = false;
        }
        if (ghostT > 1.9 && ghostT < 3.6) { ghost.on = true; ghost.x += (P.x - ghost.x) * dt * 2; ghost.y += (P.y - ghost.y) * dt * 2; }
      } else {
        if (mode === "drawing" && !ptr.down) mode = "idle";
        // start the demo from the top next time it takes over
        if (mode === "idle") { ghostT = 0; ghostDrawn = false; ghostStepped = false; }
      }

      // ---- portal radius ----
      P.t += dt;
      if (!reduced) P.spin += dt * P.dir * 2.2;
      const cover = Math.max(Math.hypot(P.x, P.y), Math.hypot(w - P.x, P.y), Math.hypot(P.x, h - P.y), Math.hypot(w - P.x, h - P.y)) + 60;
      if (mode === "opening" || mode === "open") {
        if (reduced) {
          P.r = P.R; P.v = 0;
          if (mode === "opening") setMode("open");
        } else {
          // a springy tear that overshoots and settles
          P.v += ((P.R - P.r) * 70 - P.v * 7.5) * dt;
          P.r += P.v * dt;
          if (mode === "opening" && P.t > 0.9) setMode("open");
        }
      } else if (mode === "stepping") {
        const e = reduced ? 1 : Math.min(1, P.t / 0.75);
        P.r = P.R + (cover - P.R) * (e * e * (3 - 2 * e));
        if (e >= 1) setMode("through");
      } else if (mode === "through") {
        P.r = cover;
      } else if (mode === "closing") {
        const e = reduced ? 1 : Math.min(1, P.t / (P.from > P.R * 1.5 ? 0.85 : 0.5));
        P.r = P.from * (1 - e * e * (3 - 2 * e));
        if (e >= 1) {
          for (let k = 0; !reduced && k < 180; k++) {
            const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 300;
            emit(P.x, P.y, Math.cos(a) * s, Math.sin(a) * s, 0.3 + Math.random() * 0.5, 1);
          }
          P.r = 0;
          setMode("idle");
        }
      }
      const r = Math.max(0, P.r);
      // a frozen clock under reduced motion keeps the rim and the glow steady
      const time = reduced ? 0 : now / 1000;
      if (r <= 0.5) side.style.clipPath = "circle(0px at 50% 50%)";
      else if (mode === "through") side.style.clipPath = `circle(${r.toFixed(1)}px at ${P.x.toFixed(1)}px ${P.y.toFixed(1)}px)`;
      else {
        // a ragged, flickering opening rather than a clean circle
        const pts2: string[] = [];
        for (let k = 0; k < 72; k++) {
          const a = (k / 72) * Math.PI * 2;
          const rr = r * edge(a, time);
          pts2.push(`${(P.x + Math.cos(a) * rr).toFixed(1)}px ${(P.y + Math.sin(a) * rr).toFixed(1)}px`);
        }
        side.style.clipPath = `polygon(${pts2.join(",")})`;
      }
      // looking through a window: the far side shifts against the pointer
      const lx = ghost.on ? ghost.x : ptr.x, ly = ghost.on ? ghost.y : ptr.y;
      const par = reduced ? 0 : 1;
      side.style.setProperty("--px", (par * (Math.max(-1, Math.min(1, (lx - P.x) / (w * 0.5))) || 0)).toFixed(3));
      side.style.setProperty("--py", (par * (Math.max(-1, Math.min(1, (ly - P.y) / (h * 0.5))) || 0)).toFixed(3));

      // ---- emit ----
      const showRing = r > 2 && (mode === "opening" || mode === "open" || mode === "closing" || (mode === "stepping" && P.t < 0.55));
      if (showRing && !reduced) {
        // the spinning ring itself: sparks swept round the rim in curved streaks
        const orate = Math.min(5200, 4.2 * Math.PI * 2 * r) * (mode === "closing" ? 0.6 : 1);
        const on = Math.round(orate * dt);
        for (let k = 0; k < on; k++) {
          const i = ohead;
          ohead = (ohead + 1) % OCAP;
          const a = Math.random() * Math.PI * 2;
          const rr = r * edge(a, time) * (0.965 + Math.random() * 0.06);
          oa[i] = a;
          orr[i] = rr;
          ow[i] = (P.dir * (520 + Math.random() * 620)) / Math.max(rr, 24);
          odr[i] = 8 + Math.random() * 50;
          ol[i] = om[i] = 0.12 + Math.random() * 0.3;
        }
        const rate = Math.min(1400, 1.2 * Math.PI * 2 * r) * (mode === "closing" ? 0.5 : 1);
        const n = Math.round(rate * dt);
        for (let k = 0; k < n; k++) {
          const a = Math.random() * Math.PI * 2;
          const rr = r * edge(a, time) * (0.985 + Math.random() * 0.03);
          const x = P.x + Math.cos(a) * rr, y = P.y + Math.sin(a) * rr;
          // tangential, with the spin, and a little outward fling
          const tx = -Math.sin(a) * P.dir, ty = Math.cos(a) * P.dir;
          const sp = 160 + Math.random() * 420;
          const out = 20 + Math.random() * 90;
          // molten drips fall mostly from the lower rim
          const hv = Math.random() < (Math.sin(a) > 0.3 ? 0.16 : 0.03) ? 1 : 0;
          emit(x, y, tx * sp + Math.cos(a) * out, ty * sp + Math.sin(a) * out, hv ? 0.6 + Math.random() * 0.8 : 0.16 + Math.random() * 0.34, hv);
        }
      }
      if (mode === "drawing" && !reduced) {
        const hx = ghost.on ? ghost.x : ptr.x, hy = ghost.on ? ghost.y : ptr.y;
        for (let k = 0; k < 14; k++) {
          const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 200;
          emit(hx, hy, Math.cos(a) * s, Math.sin(a) * s - 40, 0.2 + Math.random() * 0.35, Math.random() < 0.15 ? 1 : 0);
        }
      }

      for (let i = 0; i < OCAP; i++) {
        if (ol[i] <= 0) continue;
        ol[i] -= dt;
        oa[i] += ow[i] * dt;
        orr[i] += odr[i] * dt;
      }
      // ---- simulate sparks ----
      const floor = h - 22;
      for (let i = 0; i < CAP; i++) {
        if (life[i] <= 0) continue;
        life[i] -= dt;
        if (heavy[i]) {
          svy[i] += 900 * dt;
          svx[i] *= Math.exp(-dt * 0.6);
        } else {
          svx[i] *= Math.exp(-dt * 3.2);
          svy[i] = svy[i] * Math.exp(-dt * 3.2) + 120 * dt;
        }
        sx[i] += svx[i] * dt;
        sy[i] += svy[i] * dt;
        if (heavy[i] && sy[i] > floor && svy[i] > 0) {
          sy[i] = floor;
          svy[i] *= -0.32;
          svx[i] *= 0.7;
        }
      }

      // ---- draw ----
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      if (r > 1 && mode !== "through") {
        // depth: the far world darkens toward the rim
        g.globalCompositeOperation = "source-over";
        const rim = g.createRadialGradient(P.x, P.y, Math.max(0, r * 0.72), P.x, P.y, r);
        rim.addColorStop(0, "rgba(20,6,0,0)");
        rim.addColorStop(1, "rgba(20,6,0,0.6)");
        g.fillStyle = rim;
        g.beginPath(); g.arc(P.x, P.y, r, 0, Math.PI * 2); g.fill();
      }
      g.globalCompositeOperation = "lighter";
      const flick = 0.85 + 0.1 * Math.sin(time * 31) + 0.06 * Math.sin(time * 53 + 1);
      if (showRing) {
        // firelight thrown on everything around the portal
        const amb = g.createRadialGradient(P.x, P.y, r * 0.85, P.x, P.y, r * 2.6);
        amb.addColorStop(0, `rgba(255,110,30,${(0.16 * flick).toFixed(3)})`);
        amb.addColorStop(1, "rgba(255,110,30,0)");
        g.fillStyle = amb;
        g.beginPath(); g.arc(P.x, P.y, r * 2.6, 0, Math.PI * 2); g.fill();
        // the floor catches the glow
        // a soft oval of light on the floor, squashed so it lies flat
        g.save();
        g.translate(P.x, floor);
        g.scale(1, 0.18);
        const fl = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.4);
        fl.addColorStop(0, "rgba(255,120,30,0.3)");
        fl.addColorStop(1, "rgba(255,120,30,0)");
        g.fillStyle = fl;
        g.beginPath(); g.arc(0, 0, r * 1.4, 0, Math.PI * 2); g.fill();
        g.restore();
        g.save();
        g.shadowColor = "#ff7a1a";
        g.shadowBlur = 28;
        g.strokeStyle = `rgba(255,120,30,${(0.38 * flick).toFixed(3)})`;
        g.lineWidth = 10;
        g.beginPath(); g.arc(P.x, P.y, r, 0, Math.PI * 2); g.stroke();
        g.restore();
        g.strokeStyle = "rgba(255,226,160,0.55)";
        g.lineWidth = 1.6;
        g.beginPath(); g.arc(P.x, P.y, r, 0, Math.PI * 2); g.stroke();
        // runes of light chasing round the rim
        g.strokeStyle = "rgba(255,200,120,0.5)";
        g.lineWidth = 1;
        for (let k = 0; k < 3; k++) {
          const a0 = P.spin * (1 + k * 0.3) + k * 2.1;
          g.beginPath(); g.arc(P.x, P.y, r * (0.9 - k * 0.04), a0, a0 + 0.9 + k * 0.3); g.stroke();
        }
      }
      if (mode === "drawing" && pts.length > 1) {
        g.strokeStyle = "rgba(255,170,80,0.55)";
        g.lineWidth = 2;
        g.shadowColor = "#ff8a2a"; g.shadowBlur = 12;
        g.beginPath();
        g.moveTo(pts[0].x, pts[0].y);
        for (const p of pts) g.lineTo(p.x, p.y);
        g.stroke();
        g.shadowBlur = 0;
      }
      // the spinning ring: curved streaks, batched by colour
      for (let b = 0; b < BUCKETS.length; b++) {
        g.strokeStyle = BUCKETS[b][0];
        g.lineWidth = BUCKETS[b][1] * 1.05;
        g.beginPath();
        for (let i = 0; i < OCAP; i++) {
          if (ol[i] <= 0) continue;
          const t = ol[i] / om[i];
          const bi = t > 0.78 ? 0 : t > 0.55 ? 1 : t > 0.33 ? 2 : t > 0.14 ? 3 : 4;
          if (bi !== b) continue;
          const tail = ow[i] * 0.05;
          const a1 = oa[i], a0 = a1 - tail;
          g.moveTo(P.x + Math.cos(a0) * orr[i], P.y + Math.sin(a0) * orr[i]);
          g.arc(P.x, P.y, orr[i], a0, a1, tail < 0);
        }
        g.stroke();
      }
      // flung sparks, batched by colour
      for (let b = 0; b < BUCKETS.length; b++) {
        g.strokeStyle = BUCKETS[b][0];
        g.lineWidth = BUCKETS[b][1];
        g.beginPath();
        for (let i = 0; i < CAP; i++) {
          if (life[i] <= 0) continue;
          const t = life[i] / maxl[i];
          const bi = t > 0.78 ? 0 : t > 0.55 ? 1 : t > 0.33 ? 2 : t > 0.14 ? 3 : 4;
          if (bi !== b) continue;
          const k = heavy[i] ? 0.02 : 0.03;
          g.moveTo(sx[i] - svx[i] * k, sy[i] - svy[i] * k);
          g.lineTo(sx[i], sy[i]);
        }
        g.stroke();
      }
      g.globalCompositeOperation = "source-over";
      if (ghost.on) {
        g.fillStyle = "rgba(255,255,255,0.9)";
        g.beginPath(); g.arc(ghost.x, ghost.y, 5, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "rgba(255,255,255,0.35)";
        g.lineWidth = 1.5;
        g.beginPath(); g.arc(ghost.x, ghost.y, 11, 0, Math.PI * 2); g.stroke();
      }
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(stage);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mq?.removeEventListener?.("change", onMq);
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      apiRef.current = { open: () => {}, close: () => {} };
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={cn("relative w-full touch-none select-none overflow-hidden rounded-[24px]", className)}
      style={{
        height,
        background: "radial-gradient(120% 90% at 50% 40%,#1a1420 0%,#0b090e 60%,#050407 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, system-ui, sans-serif",
        cursor: phase === "open" ? "pointer" : "crosshair",
      }}
    >
      {/* the floor */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22px] border-t border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent" />
      <div ref={sideRef} className="absolute inset-0" style={{ clipPath: "circle(0px at 50% 50%)" }} aria-hidden={phase === "idle"} inert={phase === "idle"}>
        {children ?? <OtherSide />}
        {phase === "through" ? (
          <button
            type="button"
            onClick={() => apiRef.current.close()}
            className="absolute right-4 top-4 z-10 rounded-full border-0 bg-black/35 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md outline-none hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white"
          >
            Close portal
          </button>
        ) : null}
      </div>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-9 flex justify-center transition-opacity duration-500 motion-reduce:transition-none"
        style={{ opacity: phase === "idle" ? 1 : 0 }}
      >
        <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] text-white/75 backdrop-blur-md">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 4v5h-5" />
          </svg>
          Hold and draw a circle
        </span>
      </div>
      <button
        type="button"
        onClick={() => apiRef.current.open()}
        tabIndex={phase === "through" ? -1 : 0}
        className="absolute left-4 top-4 z-20 rounded-full border-0 bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-white/80 opacity-0 outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white"
      >
        {phase === "idle" ? "Open portal" : phase === "open" ? "Step through" : "Close portal"}
      </button>
    </div>
  );
}
