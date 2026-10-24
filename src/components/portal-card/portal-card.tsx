"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const CAP = 5000; // flung sparks alive at once
const OCAP = 8000; // sparks racing round the rim

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
  const ghostRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ open: () => void; close: () => void }>({ open: () => {}, close: () => {} });
  const [phase, setPhase] = useState<"idle" | "open" | "through">("idle");
  const autoplayRef = useRef(autoplay);

  // The long effect below reads this every frame, so toggling autoplay never rebuilds the scene.
  useEffect(() => {
    autoplayRef.current = autoplay;
  }, [autoplay]);

  useEffect(() => {
    const stage = stageRef.current!, canvas = canvasRef.current!, side = sideRef.current!;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let reduced = !!mq?.matches;
    const onMq = () => { reduced = !!mq?.matches; };
    mq?.addEventListener?.("change", onMq);
    side.style.clipPath = "circle(0px at 50% 50%)";
    let w = 0, h = 0, dpr = 1;
    const fit = () => {
      const r = stage.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      // layout size, not on-screen size, so a scaled stage still draws at the right size
      w = stage.offsetWidth || r.width; h = stage.offsetHeight || r.height;
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

    /* ---------------- WebGL: the ring is a shader, every spark is a soft streak on the GPU ---------------- */
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false }) as WebGLRenderingContext | null;
    const mk = (vs: string, fs: string) => {
      if (!gl) return null;
      const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
      const p = gl.createProgram()!;
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn("PortalCard shader", gl.getProgramInfoLog(p)); return null; }
      return p;
    };
    /* the ring: molten sparks streaming round the rim, flung outward in spiral streaks */
    const RING_VS = `attribute vec2 aP;uniform vec2 uRes;varying vec2 vP;void main(){vP=aP;vec2 c=aP/uRes*2.0-1.0;gl_Position=vec4(c.x,-c.y,0.0,1.0);}`;
    const RING_FS = `precision highp float;varying vec2 vP;
uniform vec2 uC;uniform float uR;uniform float uT;uniform float uDir;uniform float uI;uniform float uDark;uniform float uFlick;
float h3(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec3 heat(float h){h=clamp(h,0.0,1.6);
vec3 c=mix(vec3(0.0),vec3(0.55,0.06,0.0),smoothstep(0.0,0.2,h));
c=mix(c,vec3(1.0,0.36,0.05),smoothstep(0.15,0.45,h));
c=mix(c,vec3(1.0,0.72,0.25),smoothstep(0.4,0.75,h));
c=mix(c,vec3(1.0,0.96,0.82),smoothstep(0.72,1.15,h));return c;}
void main(){
  vec2 d=vP-uC;float rr=length(d);float a=atan(d.y,d.x);
  float R=max(uR,1.0);
  float x=rr-R;
  /* streaks: noise stretched along the circle and swept round it with the spin */
  float sw=a+uDir*uT*3.1+uDir*x*0.010;
  float k=clamp(R/110.0,0.6,2.2)*3.2;
  vec3 q=vec3(cos(sw)*k,sin(sw)*k,rr*0.34);
  float n=n3(q)*0.6+n3(q*vec3(2.0,2.0,2.3)+7.1)*0.3+n3(q*vec3(4.0,4.0,4.6)+3.7)*0.1;
  float fine=n3(vec3(cos(sw)*k*2.6,sin(sw)*k*2.6,rr*0.9+uT*2.0));
  float grain=n3(vec3(cos(sw)*k*9.0,sin(sw)*k*9.0,rr*0.18-uT*1.5));
  float w=4.2+3.0*n;
  float core=exp(-x*x/(w*w));
  float sprayL=24.0+40.0*n3(vec3(cos(sw)*k*0.7,sin(sw)*k*0.7,uT*0.6));
  float spray=x>0.0?exp(-x/sprayL)*smoothstep(0.5,0.95,n*0.55+fine*0.25+grain*0.45)*1.25:0.0;
  float inner=x<0.0?exp(x/7.0)*0.55*(0.5+0.5*fine):0.0;
  float hval=(core*(0.62+0.5*fine+0.35*grain)+spray*0.95+inner)*uI*uFlick;
  vec3 col=heat(hval*1.15)*min(1.0,hval*1.6);
  /* firelight thrown on the surroundings */
  float amb=exp(-max(0.0,x)/ (R*0.9))*0.16*uI*smoothstep(0.0,R*0.15,x+R*0.15);
  col+=vec3(1.0,0.42,0.1)*amb*uFlick;
  float ca=max(col.r,max(col.g,col.b));
  /* depth: the far side darkens toward the rim */
  float dark=x<0.0?uDark*0.62*smoothstep(-R*0.3,0.0,x):0.0;
  float A=clamp(ca+dark*(1.0-ca),0.0,1.0);
  gl_FragColor=vec4(min(col,vec3(1.0)),A);
}`;
    /* streaks: one quad per spark, hot head and a tail that fades */
    const ST_VS = `attribute vec2 aP;attribute vec4 aC;attribute vec2 aU;uniform vec2 uRes;varying vec4 vC;varying vec2 vU;
void main(){vC=aC;vU=aU;vec2 c=aP/uRes*2.0-1.0;gl_Position=vec4(c.x,-c.y,0.0,1.0);}`;
    const ST_FS = `precision mediump float;varying vec4 vC;varying vec2 vU;
void main(){float e=1.0-smoothstep(0.15,1.0,abs(vU.x));float t=0.18+0.82*pow(vU.y,1.6);float a=vC.a*e*t;vec3 c=vC.rgb*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`;
    const ringProg = mk(RING_VS, RING_FS);
    const stProg = mk(ST_VS, ST_FS);
    const ringBuf = gl?.createBuffer() || null;
    const stBuf = gl?.createBuffer() || null;
    const uRing = (n: string) => (gl && ringProg ? gl.getUniformLocation(ringProg, n) : null);
    const UR = { res: uRing("uRes"), c: uRing("uC"), r: uRing("uR"), t: uRing("uT"), dir: uRing("uDir"), i: uRing("uI"), dark: uRing("uDark"), flick: uRing("uFlick") };
    const uStRes = gl && stProg ? gl.getUniformLocation(stProg, "uRes") : null;
    const SV = new Float32Array(16000 * 6 * 8);
    let sv = 0;
    const COLS: [number, number, number][] = [
      [1.0, 0.97, 0.86],
      [1.0, 0.82, 0.42],
      [1.0, 0.56, 0.16],
      [1.0, 0.33, 0.07],
      [0.72, 0.14, 0.03],
    ];
    const heatCol = (t: number) => {
      const f = (1 - Math.max(0, Math.min(1, t))) * (COLS.length - 1);
      const i = Math.min(COLS.length - 2, Math.floor(f));
      const u = f - i;
      const a = COLS[i], b = COLS[i + 1];
      return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u] as const;
    };
    /* one streak from tail (x0,y0) to head (x1,y1) */
    const streak = (x0: number, y0: number, x1: number, y1: number, wd: number, r: number, gg: number, b: number, a: number) => {
      if (sv + 6 > 16000 * 6 || a < 0.01) return;
      let dx = x1 - x0, dy = y1 - y0;
      const L = Math.hypot(dx, dy);
      if (L < 0.3) { dx = 0.3; dy = 0; } 
      const ll = Math.hypot(dx, dy) || 1;
      const nx = (-dy / ll) * wd * 0.5, ny = (dx / ll) * wd * 0.5;
      const V = (x: number, y: number, ux: number, uy: number) => {
        const o = sv * 8;
        SV[o] = x; SV[o + 1] = y; SV[o + 2] = r; SV[o + 3] = gg; SV[o + 4] = b; SV[o + 5] = a; SV[o + 6] = ux; SV[o + 7] = uy;
        sv++;
      };
      V(x0 + nx, y0 + ny, -1, 0); V(x0 - nx, y0 - ny, 1, 0); V(x1 + nx, y1 + ny, -1, 1);
      V(x0 - nx, y0 - ny, 1, 0); V(x1 - nx, y1 - ny, 1, 1); V(x1 + nx, y1 + ny, -1, 1);
    };
    const flushStreaks = () => {
      if (!gl || !stProg || !sv) return;
      gl.useProgram(stProg);
      gl.uniform2f(uStRes, w, h);
      gl.bindBuffer(gl.ARRAY_BUFFER, stBuf);
      gl.bufferData(gl.ARRAY_BUFFER, SV.subarray(0, sv * 8), gl.DYNAMIC_DRAW);
      const lp = gl.getAttribLocation(stProg, "aP"), lc = gl.getAttribLocation(stProg, "aC"), lu = gl.getAttribLocation(stProg, "aU");
      gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 32, 0);
      gl.enableVertexAttribArray(lc); gl.vertexAttribPointer(lc, 4, gl.FLOAT, false, 32, 8);
      gl.enableVertexAttribArray(lu); gl.vertexAttribPointer(lu, 2, gl.FLOAT, false, 32, 24);
      gl.drawArrays(gl.TRIANGLES, 0, sv);
      gl.disableVertexAttribArray(lc); gl.disableVertexAttribArray(lu);
      sv = 0;
    };
    const drawRing = (cx: number, cy: number, r: number, inten: number, dark: number, time: number, flick: number) => {
      if (!gl || !ringProg) return;
      const E = r * 2.4 + 90;
      const x0 = Math.max(0, cx - E), x1 = Math.min(w, cx + E), y0 = Math.max(0, cy - E), y1 = Math.min(h, cy + E);
      if (x1 <= x0 || y1 <= y0) return;
      gl.useProgram(ringProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, ringBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x0, y0, x1, y0, x0, y1, x1, y0, x1, y1, x0, y1]), gl.DYNAMIC_DRAW);
      const lp = gl.getAttribLocation(ringProg, "aP");
      gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 8, 0);
      gl.uniform2f(UR.res, w, h); gl.uniform2f(UR.c, cx, cy); gl.uniform1f(UR.r, r); gl.uniform1f(UR.t, time);
      gl.uniform1f(UR.dir, P.dir); gl.uniform1f(UR.i, inten); gl.uniform1f(UR.dark, dark); gl.uniform1f(UR.flick, flick);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
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
        try { stage.setPointerCapture(e.pointerId); } catch { /* the pointer may already be gone */ }
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
    let ringI = 0;
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
        const orate = Math.min(6500, 5.2 * Math.PI * 2 * r) * (mode === "closing" ? 0.6 : 1);
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
          const hv = Math.random() < (Math.sin(a) > 0.3 ? 0.26 : 0.03) ? 1 : 0;
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
      if (!gl) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const flick = 0.9 + 0.07 * Math.sin(time * 31) + 0.05 * Math.sin(time * 53 + 1);
      ringI += ((showRing ? 1 : 0) - ringI) * Math.min(1, dt * (showRing ? 9 : 14));
      if (ringI > 0.01 && r > 1) {
        drawRing(P.x, P.y, r, ringI * (mode === "opening" ? Math.min(1, 0.35 + P.t * 2.2) : 1), mode === "through" || mode === "stepping" ? 0 : 1, time, flick);
      }
      // the floor catches the light: two soft streaks meeting under the portal
      if (ringI > 0.01 && r > 1) {
        const fw = r * 1.5;
        const fa = 0.32 * ringI * flick * Math.max(0, Math.min(1, 1 - (floor - (P.y + r)) / (r * 1.4)));
        streak(P.x - fw, floor + 4, P.x, floor + 4, 16, 1, 0.42, 0.12, fa);
        streak(P.x + fw, floor + 4, P.x, floor + 4, 16, 1, 0.42, 0.12, fa);
      }
      // the gesture: a white-hot line with an orange bloom, newest end brightest
      if (mode === "drawing" && pts.length > 1) {
        const n = pts.length;
        for (let i = 1; i < n; i++) {
          const age = (n - i) / Math.max(30, n);
          const a = Math.max(0, 1 - age);
          /* each segment drawn both ways, so the line is even along its length */
          for (const [ax, ay, bx, by] of [[pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y], [pts[i].x, pts[i].y, pts[i - 1].x, pts[i - 1].y]]) {
            streak(ax, ay, bx, by, 16, 1, 0.36, 0.06, 0.18 * a);
            streak(ax, ay, bx, by, 5, 1, 0.62, 0.2, 0.42 * a);
            streak(ax, ay, bx, by, 2.0, 1, 0.97, 0.85, 0.62 * a);
          }
        }
      }
      // sparks racing round the rim: short arcs drawn as streaks along the circle
      for (let i = 0; i < OCAP; i++) {
        if (ol[i] <= 0) continue;
        const t = ol[i] / om[i];
        const tail = ow[i] * 0.045;
        const a1 = oa[i], a0 = a1 - tail;
        const c = heatCol(t);
        streak(P.x + Math.cos(a0) * orr[i], P.y + Math.sin(a0) * orr[i], P.x + Math.cos(a1) * orr[i], P.y + Math.sin(a1) * orr[i], 1.5 + t * 0.6, c[0], c[1], c[2], 0.85 * Math.min(1, t * 3));
      }
      // flung sparks: hot streaks along their velocity, cooling as they fly
      for (let i = 0; i < CAP; i++) {
        if (life[i] <= 0) continue;
        const t = life[i] / maxl[i];
        const k = heavy[i] ? 0.022 : 0.034;
        const c = heatCol(t);
        streak(sx[i] - svx[i] * k, sy[i] - svy[i] * k, sx[i], sy[i], heavy[i] ? 2.0 : 1.3, c[0], c[1], c[2], Math.min(1, t * 2.5) * (heavy[i] ? 1 : 0.85));
      }
      flushStreaks();
      const gd = ghostRef.current;
      if (gd) {
        gd.style.opacity = ghost.on ? "1" : "0";
        if (ghost.on) gd.style.transform = `translate(${ghost.x.toFixed(1)}px, ${ghost.y.toFixed(1)}px)`;
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
      <div ref={ghostRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ opacity: 0 }}>
        <div className="absolute h-[10px] w-[10px] rounded-full bg-white/90" style={{ left: -5, top: -5, boxShadow: "0 0 12px rgba(255,160,80,.8)" }} />
        <div className="absolute h-[22px] w-[22px] rounded-full border border-white/35" style={{ left: -11, top: -11 }} />
      </div>
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
