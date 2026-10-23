"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const N = 22; // points per strand
const MAX = 7; // strands at once

type Strand = {
  x: Float32Array; y: Float32Array; px: Float32Array; py: Float32Array;
  /** Anchor on the button, relative to its centre, before the button turns. */
  ax: number; ay: number;
  /** Resting length of each link. */
  rest: number;
  state: "flying" | "held" | "dangling" | "falling";
  t: number;
  age: number;
  seed: number;
  /** Where the fibres of the splat grip the button, relative to the anchor. */
  fibers: [number, number][];
  /** Spokes of the splat: angle and length. */
  spokes: [number, number][];
  /** The fibres the line is spun from: lateral offset, waviness, phase, width, opacity, loose. */
  fib: { off: number; freq: number; phase: number; w: number; a: number; loose: boolean; speed: number }[];
  /** A messy splat: fibres flung out from the hit, with a curve and maybe a branch. */
  splat: { ang: number; len: number; curve: number; w: number; a: number; branch: number }[];
  /** Threads strung between neighbouring splat fibres: fibre, fraction, fibre, fraction. */
  cross: [number, number, number, number][];
  /** Where along the line the fibres are glued together into knots (0 to 1). */
  knots: number[];
  /** How much the free end has frayed (after a snap). */
  fray: number;
  sx: number; sy: number; // where it was fired from
  stretch: number;
  alpha: number;
};

/**
 * Web Sling Button: your cursor is a web-shooter. Click anywhere around the button and a line of
 * silk fires out and splats onto it in a messy burst of flung fibres and a smear of glue. Hold and
 * pull: the bundle of fibres closes up as it goes taut, glue knots are drawn out along it, fibres
 * peel out of the splat, and the button is dragged and tilted on the line. Let go and the strand
 * recoils and dangles from the button, swinging; brush a loose end and it sticks to your cursor
 * again. Pull too far and it snaps and curls back. Old strands dry out and peel away.
 *
 * A line is drawn as a loose bundle of fine fibres that drift apart, pinch together at sticky knots
 * and fray when broken, with a few loose strands sagging away from the rest. The
 * button is a real button; clicks on it still work. With `autoplay` a ghost shoots, pulls and
 * snaps strands until the pointer arrives. Pauses off screen. Under reduced motion the stage stays
 * still: the button and its hint are shown and no webs are fired, though the button still works.
 */
export type WebSlingButtonProps = {
  /** Text on the button. */
  label?: string;
  /** Called when the button itself is clicked. */
  onClick?: () => void;
  /** Height of the stage, in px. */
  height?: number;
  /** How far a strand can be stretched (times its length) before it snaps. */
  snapAt?: number;
  /** A ghost shoots, pulls and snaps strands in a loop until a real pointer arrives. */
  autoplay?: boolean;
  className?: string;
};

export function WebSlingButton({
  label = "Get started",
  onClick,
  height = 460,
  snapAt = 2.3,
  autoplay = false,
  className,
}: WebSlingButtonProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current!, btn = btnRef.current!, canvas = canvasRef.current!;
    const g = canvas.getContext("2d")!;
    const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    // the button's resting box, measured without its transform
    const B = { cx: 0, cy: 0, w: 0, h: 0 };
    const fit = () => {
      // layout size, not the on-screen size, so a CSS-scaled parent does not change the canvas
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = stage.offsetWidth; h = stage.offsetHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      B.w = btn.offsetWidth; B.h = btn.offsetHeight;
      B.cx = btn.offsetLeft + B.w / 2; B.cy = btn.offsetTop + B.h / 2;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    ro.observe(btn);
    fit();

    // button pose: offset and turn, on springs
    const pose = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, hit: 0 };
    const toWorld = (lx: number, ly: number) => {
      const c = Math.cos(pose.rot), s = Math.sin(pose.rot);
      return { x: B.cx + pose.x + lx * c - ly * s, y: B.cy + pose.y + lx * s + ly * c };
    };
    // nearest point on the (resting) stadium outline to a world point, in button-local coords
    const nearestLocal = (qx: number, qy: number) => {
      const c = Math.cos(-pose.rot), s = Math.sin(-pose.rot);
      const dx = qx - (B.cx + pose.x), dy = qy - (B.cy + pose.y);
      const lx = dx * c - dy * s, ly = dx * s + dy * c;
      const r = B.h / 2, a = Math.max(0, B.w / 2 - r);
      const cx = Math.max(-a, Math.min(a, lx));
      const vx = lx - cx, vy = ly;
      const d = Math.hypot(vx, vy) || 1;
      // a touch inside the edge, so the glue sits on the surface
      return { x: cx + (vx / d) * (r - 2), y: (vy / d) * (r - 2), nx: vx / d, ny: vy / d };
    };

    let strands: Strand[] = [];
    let splash: { x: number; y: number; vx: number; vy: number; r: number; age: number; seed: number }[] = [];
    let held: Strand | null = null;
    const ptr = { x: -999, y: -999, inside: false, down: false, last: 0 };
    let touched = false;
    let seedN = 1;

    const fire = (x: number, y: number) => {
      if (reduced) return;
      const a = nearestLocal(x, y);
      const end = toWorld(a.x, a.y);
      const dist = Math.hypot(end.x - x, end.y - y);
      const s: Strand = {
        x: new Float32Array(N).fill(x), y: new Float32Array(N).fill(y),
        px: new Float32Array(N).fill(x), py: new Float32Array(N).fill(y),
        ax: a.x, ay: a.y,
        rest: (dist * 1.02) / (N - 1),
        state: "flying", t: 0, age: 0, seed: seedN++,
        fibers: Array.from({ length: 5 }, (_, k) => {
          // grip points spread along the surface either side of the anchor
          const tang = [-a.ny, a.nx];
          const off = (k - 2) * 6 + (Math.random() - 0.5) * 3;
          return [tang[0] * off - a.nx * Math.random() * 4, tang[1] * off - a.ny * Math.random() * 4] as [number, number];
        }),
        spokes: Array.from({ length: 9 }, (_, k) => [(k / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.4, 8 + Math.random() * 12] as [number, number]),
        sx: x, sy: y, stretch: 1, alpha: 1,
        fib: Array.from({ length: 9 }, (_, k) => ({
          off: (k / 8) * 2 - 1 + (Math.random() - 0.5) * 0.3,
          freq: 6 + Math.random() * 10,
          phase: Math.random() * Math.PI * 2,
          w: 0.35 + Math.random() * 0.55,
          a: 0.4 + Math.random() * 0.45,
          loose: Math.random() < 0.22,
          speed: 0.5 + Math.random(),
        })),
        splat: Array.from({ length: 13 }, () => ({
          ang: Math.random() * Math.PI * 2,
          len: 6 + Math.pow(Math.random(), 1.6) * 26,
          curve: (Math.random() - 0.5) * 0.7,
          w: 0.4 + Math.random() * 0.6,
          a: 0.45 + Math.random() * 0.45,
          branch: Math.random() < 0.35 ? (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.5) : 0,
        })).sort((p, q) => p.ang - q.ang),
        cross: [],
        knots: Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => 0.12 + Math.random() * 0.76),
        fray: 0,
      };
      // a few threads strung across the splat between neighbouring fibres
      for (let k = 0; k < 7; k++) {
        const i = Math.floor(Math.random() * s.splat.length);
        s.cross.push([i, (i + 1) % s.splat.length, 0.3 + Math.random() * 0.6, 0.3 + Math.random() * 0.6]);
      }
      strands.push(s);
      // too many: the oldest loose one dries out and peels away
      if (strands.length > MAX) {
        const old = strands.find((t) => t !== s && t.state === "dangling") ?? strands.find((t) => t !== s && t.state !== "falling");
        if (old) old.state = "falling";
      }
      return s;
    };
    const release = () => {
      // a line still in flight keeps going and lands as a dangling one (see the flying branch)
      if (held && held.state === "held") {
        held.state = "dangling";
        held.rest *= 0.82; // a little recoil as it lets go
        held.t = 0;
      }
      held = null;
    };
    const press = (x: number, y: number) => {
      release(); // a line caught by brushing the cursor is let go before a new one is fired
      held = fire(x, y) ?? null;
    };

    // pointer position in the stage's own (layout) space, undoing any CSS scale on a parent
    const local = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const k = stage.offsetWidth ? r.width / stage.offsetWidth : 1;
      return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      touched = true;
      const p = local(e);
      ptr.x = p.x; ptr.y = p.y; ptr.down = true; ptr.last = performance.now();
      try { stage.setPointerCapture(e.pointerId); } catch { /* the pointer may already be gone */ }
      press(p.x, p.y);
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      ptr.x = p.x; ptr.y = p.y;
      ptr.inside = p.x >= 0 && p.y >= 0 && p.x <= w && p.y <= h;
      if (ptr.inside) { touched = true; ptr.last = performance.now(); }
    };
    const onUp = () => { ptr.down = false; release(); };
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // ---- ghost: [time, x, y, pressed] in fractions of the stage ----
    const KEYS: [number, number, number, number][] = [
      [0, 0.16, 0.86, 0], [0.7, 0.18, 0.82, 0], [0.75, 0.18, 0.82, 1], [1.6, 0.24, 0.62, 1], [2.4, 0.12, 0.42, 1], [3.0, 0.2, 0.72, 1],
      [3.05, 0.2, 0.72, 0], [3.9, 0.82, 0.24, 0], [3.95, 0.82, 0.24, 1], [4.8, 0.92, 0.14, 1], [5.6, 0.99, 0.04, 1], [5.65, 0.99, 0.04, 0],
      [6.6, 0.66, 0.86, 0], [6.65, 0.66, 0.86, 1], [7.6, 0.8, 0.9, 1], [8.3, 0.58, 0.95, 1], [8.35, 0.58, 0.95, 0], [9.6, 0.5, 0.95, 0],
    ];
    const GHOST_LEN = 10;
    let gt = 0, gDown = false;
    const ghostAt = (t: number) => {
      let i = 0;
      while (i < KEYS.length - 2 && KEYS[i + 1][0] <= t) i++;
      const a = KEYS[i], b = KEYS[i + 1];
      const f = Math.max(0, Math.min(1, (t - a[0]) / Math.max(0.001, b[0] - a[0])));
      const e = f * f * (3 - 2 * f);
      return { x: (a[1] + (b[1] - a[1]) * e) * w, y: (a[2] + (b[2] - a[2]) * e) * h, down: a[3] === 1 };
    };

    // ---- drawing helpers ----
    const SILK = "236,238,245";
    const line = (pts: { x: number; y: number }[], width: number, alpha: number, rgb = SILK) => {
      if (pts.length < 2) return;
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) g.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
      g.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      g.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
      g.lineWidth = width;
      g.stroke();
    };
    // a small, soft knot of glue, drawn out along the line when it is under tension
    const knot = (x: number, y: number, r: number, ang: number, el: number, alpha: number) => {
      g.save();
      g.translate(x, y);
      g.rotate(ang);
      g.scale(el, 1 / Math.sqrt(el));
      const gr = g.createRadialGradient(-r * 0.25, -r * 0.3, 0, 0, 0, r);
      gr.addColorStop(0, `rgba(250,251,255,${(0.85 * alpha).toFixed(3)})`);
      gr.addColorStop(1, `rgba(${SILK},${(0.15 * alpha).toFixed(3)})`);
      g.fillStyle = gr;
      g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.restore();
    };
    // a soft, irregular patch of glue: translucent, thicker in the middle, no hard edge
    const patch = (x: number, y: number, r: number, seed: number, alpha: number) => {
      g.beginPath();
      for (let k = 0; k <= 30; k++) {
        const a = (k / 30) * Math.PI * 2;
        const rr = r * (1 + 0.28 * Math.sin(a * 2 + seed) + 0.18 * Math.sin(a * 5 - seed * 1.7) + 0.1 * Math.sin(a * 9 + seed * 3));
        if (k === 0) g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      g.closePath();
      const gr = g.createRadialGradient(x - r * 0.2, y - r * 0.25, 0, x, y, r * 1.3);
      gr.addColorStop(0, `rgba(248,249,253,${(0.8 * alpha).toFixed(3)})`);
      gr.addColorStop(0.5, `rgba(${SILK},${(0.45 * alpha).toFixed(3)})`);
      gr.addColorStop(1, `rgba(${SILK},${(0.08 * alpha).toFixed(3)})`);
      g.fillStyle = gr;
      g.fill();
    };
    /*
     * A web line is a loose bundle of fine fibres, not one thread. They drift apart along the span,
     * pinch together where they are glued into knots, converge where they are stuck, and a few
     * loose ones sag away from the rest. Pulled taut, the bundle closes up into a thin line; after
     * a snap the free end frays like a broken brush.
     */
    const bundle = (s: Strand, alpha: number, time: number) => {
      const st = s.stretch;
      const tight = Math.min(1, (st - 1) * 2.2);
      const flying = s.state === "flying";
      const freeEnd = s.state === "dangling" || s.state === "falling";
      const spread = (flying ? 1.4 : 2.2 + 3.2 * (1 - tight)) / Math.sqrt(st);
      // tangents and normals along the path
      const nx = new Float32Array(N), ny = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
        const dx = s.x[b] - s.x[a], dy = s.y[b] - s.y[a], dl = Math.hypot(dx, dy) || 1;
        nx[i] = -dy / dl; ny[i] = dx / dl;
      }
      const env = (u: number) => {
        // stuck at the button (u = 0); stuck to the shooter too unless the end is loose
        let e = Math.pow(Math.sin(Math.PI * Math.min(u, freeEnd || flying ? 0.5 : u)), 0.7);
        if (freeEnd) e *= 1 + s.fray * Math.pow(u, 4) * 2.5;
        for (const k of s.knots) e *= 1 - 0.75 * Math.exp(-Math.pow((u - k) / 0.035, 2));
        return e;
      };
      // a faint core so the bundle reads as one line from a distance
      const core: { x: number; y: number }[] = [];
      for (let i = 0; i < N; i++) core.push({ x: s.x[i], y: s.y[i] });
      line(core, 1.8 / Math.sqrt(st), 0.22 * alpha);
      for (const f of s.fib) {
        const pts: { x: number; y: number }[] = [];
        const sag = f.loose ? (6 + 10 * (1 - tight)) : 0;
        for (let i = 0; i < N; i++) {
          const u = i / (N - 1);
          const e = env(u);
          const o = e * spread * ((f.loose ? 1.7 : 1) * f.off + 0.45 * Math.sin(u * f.freq + f.phase + time * 0.7 * f.speed));
          pts.push({ x: s.x[i] + nx[i] * o, y: s.y[i] + ny[i] * o + e * sag * Math.sin(Math.PI * u) });
        }
        line(pts, Math.max(0.3, f.w / Math.sqrt(st)), f.a * alpha);
      }
      // glue knots where the fibres meet
      if (!flying) {
        for (const k of s.knots) {
          const fi = k * (N - 1), i = Math.floor(fi), t = fi - i;
          const x = s.x[i] + (s.x[i + 1] - s.x[i]) * t, y = s.y[i] + (s.y[i + 1] - s.y[i]) * t;
          const ang = Math.atan2(s.y[i + 1] - s.y[i], s.x[i + 1] - s.x[i]);
          knot(x, y, (1.3 + 0.6 * Math.sin(k * 40 + s.seed)) / Math.pow(st, 0.35), ang, Math.min(2.4, Math.sqrt(st)), alpha);
        }
      }
    };
    // where the line hit: a messy splat of flung fibres, a few threads between them and a smear of glue
    const splat = (s: Strand, A: { x: number; y: number }, alpha: number) => {
      const grow = Math.min(1, s.age / 0.1);
      const tips: { x: number; y: number; dx: number; dy: number; len: number }[] = [];
      for (const f of s.splat) {
        const a = f.ang + pose.rot;
        const L = f.len * grow;
        const dx = Math.cos(a), dy = Math.sin(a);
        const ex = A.x + dx * L, ey = A.y + dy * L;
        const cx = A.x + dx * L * 0.5 - dy * L * f.curve, cy = A.y + dy * L * 0.5 + dx * L * f.curve;
        tips.push({ x: ex, y: ey, dx, dy, len: L });
        // a whisper of shadow so it reads on a light surface too, then the fibre
        for (const pass of [0, 1]) {
          const o = pass === 0 ? 0.8 : 0;
          g.beginPath();
          g.moveTo(A.x + o, A.y + o);
          g.quadraticCurveTo(cx + o, cy + o, ex + o, ey + o);
          g.strokeStyle = pass === 0 ? `rgba(10,14,40,${(0.16 * alpha).toFixed(3)})` : `rgba(${SILK},${(f.a * alpha).toFixed(3)})`;
          g.lineWidth = pass === 0 ? f.w + 0.8 : f.w;
          g.stroke();
        }
        if (f.branch) {
          const bx = A.x + dx * L * 0.55 - dy * L * f.curve * 0.5, by = A.y + dy * L * 0.55 + dx * L * f.curve * 0.5;
          const ba = a + f.branch;
          g.beginPath();
          g.moveTo(bx, by);
          g.lineTo(bx + Math.cos(ba) * L * 0.4, by + Math.sin(ba) * L * 0.4);
          g.strokeStyle = `rgba(${SILK},${(f.a * 0.8 * alpha).toFixed(3)})`;
          g.lineWidth = f.w * 0.7;
          g.stroke();
        }
      }
      g.lineWidth = 0.4;
      g.strokeStyle = `rgba(${SILK},${(0.45 * alpha).toFixed(3)})`;
      for (const [i, j, ti, tj] of s.cross) {
        const p = tips[i], q = tips[j];
        const x1 = A.x + (p.x - A.x) * ti, y1 = A.y + (p.y - A.y) * ti;
        const x2 = A.x + (q.x - A.x) * tj, y2 = A.y + (q.y - A.y) * tj;
        g.beginPath();
        g.moveTo(x1, y1);
        g.quadraticCurveTo((x1 + x2) / 2 + (A.x - (x1 + x2) / 2) * 0.1, (y1 + y2) / 2 + 1.2, x2, y2);
        g.stroke();
      }
      // a smear of glue dragged along the line's direction, then the denser patch where it struck
      const lx = s.x[3] - A.x, ly = s.y[3] - A.y, ll = Math.hypot(lx, ly) || 1;
      patch(A.x + (lx / ll) * 3, A.y + (ly / ll) * 3, 5.5 * grow, s.seed + 2, alpha * 0.55);
      patch(A.x, A.y, (7 + 1.5 * Math.sin(s.seed)) * grow * (1 + 0.2 * pose.hit), s.seed, alpha);
    };

    let raf = 0;
    let visible = true;
    let prev = performance.now();
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!visible) return;
      const dt = Math.max(1 / 240, Math.min(0.033, (now - prev) / 1000));
      prev = now;
      if (!w || !h) return;

      // ---- ghost ----
      const auto = autoplay && !reduced && (!touched || (!ptr.inside && !ptr.down && now - ptr.last > 4000));
      let hx = ptr.x, hy = ptr.y;
      let show = ptr.inside;
      if (auto) {
        gt = (gt + dt) % GHOST_LEN;
        const gp = ghostAt(gt);
        hx = gp.x; hy = gp.y; show = true;
        if (gp.down && !gDown) press(hx, hy);
        if (!gp.down && gDown) release();
        gDown = gp.down;
      } else if (gDown) { release(); gDown = false; }
      stage.style.cursor = show && !auto ? "none" : "";

      // ---- strands ----
      let pullX = 0, pullY = 0, torque = 0;
      for (const s of strands) {
        s.t += dt;
        s.age += dt;
        const A = toWorld(s.ax, s.ay);
        let pinEnd = false;
        let ex = 0, ey = 0;
        if (s.state === "flying") {
          // the line races out from the shooter to the button with a slight whip in it
          const f = Math.min(1, s.t / 0.13);
          const sx = held === s ? hx : s.sx, sy = held === s ? hy : s.sy;
          // the head flies from the shooter to the button; the line trails back to the shooter
          const headX = sx + (A.x - sx) * f, headY = sy + (A.y - sy) * f;
          const nx = -(A.y - sy), ny = A.x - sx, nl = Math.hypot(nx, ny) || 1;
          for (let i = 0; i < N; i++) {
            const u = i / (N - 1); // 0 at the head, 1 at the shooter
            const wob = Math.sin(u * Math.PI) * Math.sin(s.t * 60 + u * 9) * 6 * (1 - f);
            s.x[i] = s.px[i] = headX + (sx - headX) * u + (nx / nl) * wob;
            s.y[i] = s.py[i] = headY + (sy - headY) * u + (ny / nl) * wob;
          }
          if (f >= 1) {
            s.state = held === s ? "held" : "dangling";
            s.t = 0;
            pose.hit = 1;
            // the impact knocks the button back a touch
            const dx = A.x - sx, dy = A.y - sy, dl = Math.hypot(dx, dy) || 1;
            pose.vx += (dx / dl) * 140; pose.vy += (dy / dl) * 140;
            // a splash of glue flies off the impact
            for (let k = 0; k < 9; k++) {
              const a = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 2.4, sp = 80 + Math.random() * 220;
              splash.push({ x: A.x, y: A.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1 + Math.random() * 2.2, age: 0, seed: Math.random() * 10 });
            }
            const restLen = Math.hypot(A.x - sx, A.y - sy);
            s.rest = (restLen * 1.02) / (N - 1);
            for (let i = 0; i < N; i++) {
              const u = i / (N - 1);
              s.x[i] = s.px[i] = A.x + (sx - A.x) * u;
              s.y[i] = s.py[i] = A.y + (sy - A.y) * u;
            }
          }
          continue;
        }
        // a loose end brushed by the cursor sticks to it
        if (s.state === "dangling" && !held && show && s.t > 0.4) {
          if (Math.hypot(s.x[N - 1] - hx, s.y[N - 1] - hy) < 12) {
            held = s; s.state = "held"; s.t = 0;
            s.rest = Math.max(s.rest, Math.hypot(hx - A.x, hy - A.y) / (N - 1));
          }
        }
        if (s.state === "held") {
          pinEnd = true; ex = hx; ey = hy;
          const dist = Math.hypot(ex - A.x, ey - A.y);
          s.stretch = Math.max(1, dist / (s.rest * (N - 1)));
          if (s.stretch > snapAt) {
            // snap: the line lets go of the shooter and whips back
            s.state = "dangling"; s.t = 0;
            s.rest *= 0.42;
            s.fray = 1;
            if (held === s) held = null;
            pinEnd = false;
          } else {
            // the stretched line tugs the button toward the pointer
            const k = Math.min(70, (s.stretch - 1) * 60);
            const dx = (ex - A.x) / (dist || 1), dy = (ey - A.y) / (dist || 1);
            pullX += dx * k; pullY += dy * k;
            torque += (s.ax * dy - s.ay * dx) * k * 0.00035;
          }
        } else s.stretch += (1 - s.stretch) * Math.min(1, dt * 6);
        if (s.state === "falling") s.alpha -= dt * 0.9;
        else if (s.state === "dangling" && s.age > 9) s.state = "falling";

        // verlet
        const grav = s.state === "held" ? 160 : 700;
        const damp = s.state === "held" ? 0.96 : 0.985;
        for (let i = 0; i < N; i++) {
          const vx = (s.x[i] - s.px[i]) * damp, vy = (s.y[i] - s.py[i]) * damp;
          s.px[i] = s.x[i]; s.py[i] = s.y[i];
          s.x[i] += vx; s.y[i] += vy + grav * dt * dt;
        }
        const pinStart = s.state !== "falling";
        if (pinStart) { s.x[0] = s.px[0] = A.x; s.y[0] = s.py[0] = A.y; }
        if (pinEnd) { s.x[N - 1] = ex; s.y[N - 1] = ey; }
        // links stretch when pulled taut, otherwise keep their resting length
        const link = pinEnd ? Math.max(s.rest, Math.hypot(ex - A.x, ey - A.y) / (N - 1) * 0.995) : s.rest;
        for (let it = 0; it < 14; it++) {
          for (let i = 0; i < N - 1; i++) {
            const dx = s.x[i + 1] - s.x[i], dy = s.y[i + 1] - s.y[i];
            const d = Math.hypot(dx, dy) || 0.0001;
            const diff = (d - link) / d;
            const a = i === 0 && pinStart ? 0 : 0.5;
            const b = i + 1 === N - 1 && pinEnd ? 0 : 0.5;
            const m = a + b || 1;
            s.x[i] += dx * diff * (a / m); s.y[i] += dy * diff * (a / m);
            s.x[i + 1] -= dx * diff * (b / m); s.y[i + 1] -= dy * diff * (b / m);
          }
        }
        if (!Number.isFinite(s.x[N - 1])) { s.x.fill(A.x); s.y.fill(A.y); s.px.fill(A.x); s.py.fill(A.y); }
      }
      strands = strands.filter((s) => s.alpha > 0 && s.y[0] < h + 200);

      // ---- button pose ----
      const pl = Math.hypot(pullX, pullY);
      if (pl > 80) { pullX *= 80 / pl; pullY *= 80 / pl; }
      pose.vx += ((pullX - pose.x) * 130 - pose.vx * 11) * dt;
      pose.vy += ((pullY - pose.y) * 130 - pose.vy * 11) * dt;
      pose.x += pose.vx * dt; pose.y += pose.vy * dt;
      const rt = Math.max(-0.3, Math.min(0.3, torque + pose.x * 0.0025));
      pose.vr += ((rt - pose.rot) * 110 - pose.vr * 10) * dt;
      pose.rot += pose.vr * dt;
      pose.hit = Math.max(0, pose.hit - dt * 5);
      btn.style.transform = `translate(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px) rotate(${pose.rot.toFixed(4)}rad) scale(${(1 - pose.hit * 0.04).toFixed(4)})`;

      // ---- draw ----
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.lineCap = "round";
      g.lineJoin = "round";
      const time = now / 1000;
      for (const s of strands) {
        const alpha = Math.max(0, Math.min(1, s.alpha));
        const A = toWorld(s.ax, s.ay);
        const st = s.stretch;
        if (s.fray > 0) s.fray = Math.max(0.35, s.fray - dt * 0.4);
        // a faint shadow on the wall behind
        const sh: { x: number; y: number }[] = [];
        for (let i = 0; i < N; i++) sh.push({ x: s.x[i] + 4, y: s.y[i] + 10 });
        line(sh, 3, 0.07 * alpha, "0,0,0");
        if (s.state !== "flying" && s.state !== "falling") {
          splat(s, A, alpha);
          // under tension, fibres peel out of the splat and stream into the line
          if (st > 1.04) {
            const j = Math.min(N - 1, 2 + Math.round(st * 1.5));
            const c = Math.cos(pose.rot), sn = Math.sin(pose.rot);
            const peel = Math.min(1, (st - 1) * 3);
            for (const [fx, fy] of s.fibers) {
              const gx = A.x + fx * c - fy * sn, gy = A.y + fx * sn + fy * c;
              line([{ x: gx, y: gy }, { x: (gx + s.x[j]) / 2, y: (gy + s.y[j]) / 2 + 1.5 }, { x: s.x[j], y: s.y[j] }], 0.45, 0.6 * peel * alpha);
              knot(gx, gy, 1.2, 0, 1, peel * alpha);
            }
          }
        }
        bundle(s, alpha, time);
      }
      // flecks of silk thrown off a hit
      for (const d of splash) {
        d.age += dt;
        d.vy += 700 * dt;
        d.vx *= Math.exp(-dt * 2.5);
        d.x += d.vx * dt; d.y += d.vy * dt;
        const a = Math.max(0, 1 - d.age / 0.7);
        if (a <= 0) continue;
        const ang = d.seed + d.age * 6;
        const L = 3 + d.r * 2.5;
        g.beginPath();
        g.moveTo(d.x - Math.cos(ang) * L / 2, d.y - Math.sin(ang) * L / 2);
        g.quadraticCurveTo(d.x + Math.sin(ang) * 1.5, d.y - Math.cos(ang) * 1.5, d.x + Math.cos(ang) * L / 2, d.y + Math.sin(ang) * L / 2);
        g.strokeStyle = `rgba(${SILK},${(0.75 * a).toFixed(3)})`;
        g.lineWidth = 0.6;
        g.stroke();
      }
      splash = splash.filter((d) => d.age < 0.7);
      // the shooter's reticle
      if (show) {
        g.strokeStyle = held ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)";
        g.lineWidth = 1.5;
        const R = held ? 7 : 10;
        g.beginPath(); g.arc(hx, hy, R, 0, Math.PI * 2); g.stroke();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + Math.PI / 4;
          g.beginPath();
          g.moveTo(hx + Math.cos(a) * (R + 3), hy + Math.sin(a) * (R + 3));
          g.lineTo(hx + Math.cos(a) * (R + 8), hy + Math.sin(a) * (R + 8));
          g.stroke();
        }
        g.fillStyle = "#fff";
        g.beginPath(); g.arc(hx, hy, 1.6, 0, Math.PI * 2); g.fill();
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
      raf = 0;
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      btn.style.transform = "";
      stage.style.cursor = "";
    };
  }, [autoplay, snapAt]);

  return (
    <div
      ref={stageRef}
      className={cn("relative flex w-full touch-none select-none items-center justify-center overflow-hidden rounded-[24px]", className)}
      style={{
        height,
        background: "radial-gradient(90% 80% at 50% 35%,#272c3d 0%,#141722 55%,#0a0b11 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, system-ui, sans-serif",
      }}
    >
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        className="relative z-0 h-[64px] rounded-full border-0 px-10 text-[19px] font-semibold tracking-[-0.015em] text-white outline-none focus-visible:ring-4 focus-visible:ring-white/40"
        style={{
          background: "linear-gradient(180deg,#5b66ff 0%,#3b43e0 55%,#2c31c2 100%)",
          boxShadow: "0 1px 0 rgba(255,255,255,.35) inset, 0 -2px 0 rgba(0,0,0,.2) inset, 0 0 0 1px rgba(20,24,90,.6), 0 24px 44px -16px rgba(40,50,220,.55), 0 6px 14px -6px rgba(0,0,0,.6)",
          willChange: "transform",
        }}
      >
        {label}
      </button>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true" />
      <p className="pointer-events-none absolute inset-x-0 bottom-5 m-0 text-center text-[13px] text-white/45">
        Click anywhere to shoot a web. Hold and pull. Pull too hard and it snaps.
      </p>
    </div>
  );
}
