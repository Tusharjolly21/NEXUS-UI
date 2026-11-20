"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DustDeleteProps = {
  /** the picture on the card */
  src?: string;
  title?: string;
  onDelete?: () => void;
  onUndo?: () => void;
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
  undo: "M228 128a100 100 0 0 1-98.66 100H128a99.4 99.4 0 0 1-68.62-27.29a12 12 0 0 1 16.48-17.45a76 76 0 1 0-1.57-109c-.13.13-.25.25-.39.37L54.89 92H72a12 12 0 0 1 0 24H24a12 12 0 0 1-12-12V56a12 12 0 0 1 24 0v20.72l21.48-19.66A100 100 0 0 1 228 128",
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

const SW = 360;
const SH = 440;
const CW = 250;
const CH = 330;
const CY = 40;
const GX = 150;
const GY = 198;

// shared: where a point of the card dissolves, a ragged line that follows the handle
const COMMON = `
float h12(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), f.x), f.y); }
float edgeOf(vec2 uv){ return uv.x + (n2(uv * vec2(6.0, 9.0)) - 0.5) * 0.16 + (n2(uv * 30.0) - 0.5) * 0.05; }
`;
// the card that is still whole: its picture, cut away to the right of the line, glowing along the cut
const VQ =
  "attribute vec2 a; varying vec2 vUv; uniform vec4 uRect; uniform vec2 uRes; void main(){ vec2 p = uRect.xy + a * uRect.zw; vUv = a; gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0); }";
const FQ = `precision highp float; varying vec2 vUv; uniform sampler2D uTex; uniform float uCut; uniform vec2 uCover; uniform vec2 uSize;
${COMMON}
float rbox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  vec2 px = (vUv - 0.5) * uSize;
  float m = clamp(0.5 - rbox(px, uSize * 0.5, 20.0), 0.0, 1.0);
  float e = edgeOf(vUv);
  float k = uCut - e;
  if (k < 0.0 || m <= 0.0) discard;
  vec3 c = texture2D(uTex, (vUv - 0.5) * uCover + 0.5).rgb;
  // a hot rim right at the cut
  float rim = 1.0 - smoothstep(0.0, 0.035, k);
  c = mix(c, vec3(1.0, 0.92, 0.8), rim * 0.55);
  float a = m * smoothstep(0.0, 0.006, k);
  gl_FragColor = vec4(c * a, a);
}`;
// the dust: one point per little patch of the picture, set loose once the line passes it
const VP = `attribute vec2 a; uniform vec4 uRect; uniform vec2 uRes; uniform float uCut; uniform float uDpr; uniform float uTime; uniform vec2 uCover;
uniform sampler2D uTex; varying vec4 vC;
${COMMON}
void main(){
  float e = edgeOf(a);
  float t = clamp((e - uCut) * 1.05, 0.0, 1.0);
  vec2 home = uRect.xy + a * uRect.zw;
  float r1 = h12(a * 91.7); float r2 = h12(a * 37.3 + 4.1);
  // blown off to the right and up, curling as it goes
  vec2 dir = normalize(vec2(1.0 + r1 * 0.8, -0.35 - r2 * 0.9));
  float far = t * t * (120.0 + 220.0 * r1);
  vec2 curl = vec2(sin(t * 9.0 + r2 * 6.0), cos(t * 7.0 + r1 * 6.0)) * 14.0 * t;
  vec2 p = home + dir * far + curl;
  vec3 c = texture2D(uTex, (a - 0.5) * uCover + 0.5).rgb;
  float alive = step(0.0005, t);
  vC = vec4(mix(c, vec3(1.0, 0.9, 0.78), smoothstep(0.0, 0.2, t) * 0.3) , alive * (1.0 - smoothstep(0.55, 1.0, t)) * (0.6 + 0.4 * r2));
  gl_PointSize = (1.4 + r2 * 1.6) * uDpr * (1.0 - t * 0.5);
  gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
}`;
const FP =
  "precision mediump float; varying vec4 vC; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.2, length(d)) * vC.a; gl_FragColor = vec4(vC.rgb * a, a); }";

/**
 * Deleting a photo by turning it to dust. Drag the handle on the card's edge across and the picture comes apart behind
 * it into fine grains of its own colours that blow away and fade, the cut glowing as it goes; let go early and the
 * grains fly back. Past halfway it finishes by itself, the card's place fills with a slow aurora while it tidies up,
 * and Undo brings every grain home.
 */
export default function DustDelete({
  src = "/images/motion-kit/photos/antelope-canyon.jpg",
  title = "Antelope Canyon",
  onDelete,
  onUndo,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: DustDeleteProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const cv = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cut = useMotionValue(1.2);
  const [phase, setPhase] = useState<"card" | "dust" | "done">("card");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [pct, setPct] = useState(0);
  const [noGL, setNoGL] = useState(false);
  const touched = useRef(false);
  const imgAspect = useRef(1);

  // the picture and the dust, every frame
  useEffect(() => {
    const c = cv.current;
    const el = stage.current;
    if (!c || !el) return;
    const gl = c.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    if (!gl) {
      setNoGL(true);
      return;
    }
    const mk = (t: number, s: string) => {
      const sh = gl.createShader(t)!;
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = (v: string, f: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, mk(gl.VERTEX_SHADER, v));
      gl.attachShader(p, mk(gl.FRAGMENT_SHADER, f));
      gl.linkProgram(p);
      return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
    };
    const pq = prog(VQ, FQ);
    const pp = prog(VP, FP);
    if (!pq || !pp) {
      setNoGL(true);
      return;
    }
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const pts = new Float32Array(GX * GY * 2);
    for (let y = 0; y < GY; y++)
      for (let x = 0; x < GX; x++) pts.set([(x + 0.5) / GX, (y + 0.5) / GY], (y * GX + x) * 2);
    const pbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
    gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([40, 30, 30, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      imgAspect.current = im.naturalWidth / im.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      } catch {
        /* the picture's host refused; keep the plain card */
      }
    };
    im.src = src;
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      gl.viewport(0, 0, c.width, c.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const x0 = (W - CW) / 2;
      // cover the card with the picture, cropping the long side
      const ca = CW / CH;
      const ia = imgAspect.current;
      const cover = ia > ca ? [ca / ia, 1] : [1, ia / ca];
      const u = cut.get();
      const set = (p: WebGLProgram) => {
        gl.useProgram(p);
        gl.uniform4f(gl.getUniformLocation(p, "uRect"), x0, CY, CW, CH);
        gl.uniform2f(gl.getUniformLocation(p, "uRes"), W, H);
        gl.uniform1f(gl.getUniformLocation(p, "uCut"), u);
        gl.uniform2f(gl.getUniformLocation(p, "uCover"), cover[0], cover[1]);
        gl.uniform1i(gl.getUniformLocation(p, "uTex"), 0);
      };
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      set(pq);
      gl.uniform2f(gl.getUniformLocation(pq, "uSize"), CW, CH);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      const la = gl.getAttribLocation(pq, "a");
      gl.enableVertexAttribArray(la);
      gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (u < 1.15) {
        set(pp);
        gl.uniform1f(gl.getUniformLocation(pp, "uDpr"), dpr);
        gl.uniform1f(gl.getUniformLocation(pp, "uTime"), (now - t0) / 1000);
        gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
        const lb = gl.getAttribLocation(pp, "a");
        gl.enableVertexAttribArray(lb);
        gl.vertexAttribPointer(lb, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, GX * GY);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      const ext = gl.getExtension("WEBGL_lose_context");
      window.setTimeout(() => ext?.loseContext(), 300);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // the handle sits on the cut
  const hx = useMotionValue(CW);
  useEffect(() => cut.on("change", (v) => hx.set(Math.max(0, Math.min(CW, v * CW)))), [cut, hx]);
  const clip = useClip(hx);

  const finish = () => {
    setPhase("dust");
    sfx.whoosh(2400, 300, { dur: 1.2, gain: 0.04 });
    animate(cut, -1.4, reduce ? { duration: 0 } : { duration: 2.6, ease: [0.25, 0.1, 0.5, 1] });
    window.setTimeout(
      () => {
        setPhase("done");
        setPct(0);
        onDelete?.();
      },
      reduce ? 0 : 1500,
    );
  };
  const restore = () => {
    setPhase("card");
    onUndo?.();
    sfx.whoosh(300, 2000, { dur: 1, gain: 0.035 });
    animate(cut, 1.2, reduce ? { duration: 0 } : { duration: 1.4, ease: [0.4, 0, 0.2, 1] });
  };
  useEffect(() => {
    if (phase !== "done") return;
    if (reduce) {
      setPct(100);
      return;
    }
    const c = animate(0, 100, {
      duration: 1.8,
      ease: "easeInOut",
      onUpdate: (v) => setPct(Math.round(v)),
    });
    return () => c.stop();
  }, [phase, reduce]);

  // dragging the handle
  const drag = useRef<{ x: number; c0: number } | null>(null);
  const lastTick = useRef(0);
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "card") return;
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    cut.stop();
    drag.current = { x: e.clientX, c0: Math.min(1, cut.get()) };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const v = Math.max(-0.05, Math.min(1.2, d.c0 + (e.clientX - d.x) / CW));
    cut.set(v);
    const now = performance.now();
    if (now - lastTick.current > 70) {
      lastTick.current = now;
      sfx.tick({ freq: 3000 + Math.random() * 2000, gain: 0.008 });
    }
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    if (cut.get() < 0.5) finish();
    else animate(cut, 1.2, reduce ? { duration: 0 } : { duration: 0.9, ease: [0.3, 0, 0.2, 1] });
  };

  // autoplay: a nervous half drag, then all the way
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const run = async () => {
      await wait(1400);
      while (ok()) {
        const W = stage.current?.clientWidth ?? SW;
        const x0 = (W - CW) / 2;
        setGhost(true);
        await Promise.all([animate(gx, x0 + CW, { duration: 0.6 }), animate(gy, CY + CH / 2, { duration: 0.6 })]);
        await animate(1, 0.66, {
          duration: 0.9,
          ease: "easeInOut",
          onUpdate: (v) => {
            cut.set(v);
            gx.set(x0 + v * CW);
          },
        });
        await wait(250);
        await Promise.all([
          animate(cut, 1.2, { duration: 0.9, ease: [0.3, 0, 0.2, 1] }),
          animate(gx, x0 + CW, { duration: 0.9 }),
        ]);
        await wait(700);
        if (!ok()) return;
        await animate(1, 0.3, {
          duration: 1.1,
          ease: "easeIn",
          onUpdate: (v) => {
            cut.set(v);
            gx.set(x0 + v * CW);
          },
        });
        setGhost(false);
        finish();
        await wait(3800);
        if (!ok()) return;
        restore();
        await wait(2400);
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

  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        x: (i * 53) % 100,
        y: (i * 37 + (i % 7) * 11) % 100,
        s: 1 + (i % 3) * 0.6,
        d: (i % 9) * 0.3,
      })),
    [],
  );
  const R = 23;
  const circ = 2 * Math.PI * R;

  return (
    <div
      className={`relative w-full max-w-[360px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#f5f5f7",
      }}
    >
      <div
        ref={stage}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          height: SH,
          borderRadius: 30,
          overflow: "hidden",
          background: "#0d0d0f",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {/* what is left in the card's place */}
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              key="after"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              transition={{ duration: 0.8 }}
              style={{
                position: "absolute",
                left: "50%",
                top: CY,
                width: CW,
                height: CH,
                marginLeft: -CW / 2,
                borderRadius: 20,
                overflow: "hidden",
                background: "#111118",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: "-20%",
                  background:
                    "radial-gradient(60% 40% at 30% 100%, rgba(84,222,255,0.55), transparent 70%), radial-gradient(50% 35% at 80% 90%, rgba(170,110,255,0.6), transparent 70%), radial-gradient(40% 30% at 90% 70%, rgba(255,170,90,0.45), transparent 70%)",
                  filter: "blur(16px)",
                  animation: reduce ? undefined : "dd-aur 6s ease-in-out infinite alternate",
                }}
              />
              {stars.map((s, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: s.s,
                    height: s.s,
                    borderRadius: 1,
                    background: "#fff",
                    opacity: 0.6,
                    animation: reduce ? undefined : `dd-tw 2.4s ease-in-out ${s.d}s infinite alternate`,
                  }}
                />
              ))}
              <div
                aria-live="polite"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <div style={{ position: "relative", width: 64, height: 64 }}>
                  <svg viewBox="0 0 56 56" width="64" height="64" aria-hidden="true">
                    <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                    <circle
                      cx="28"
                      cy="28"
                      r={R}
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - pct / 100)}
                      transform="rotate(-90 28 28)"
                    />
                  </svg>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                  {pct < 100 ? "Clearing it away" : "Deleted"}
                </div>
                <motion.button
                  type="button"
                  animate={{
                    opacity: pct >= 100 ? 1 : 0,
                    y: pct >= 100 ? 0 : 6,
                  }}
                  onClick={() => {
                    touched.current = true;
                    restore();
                  }}
                  disabled={pct < 100}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    height: 30,
                    padding: "0 13px",
                    borderRadius: 15,
                    border: 0,
                    background: "rgba(255,255,255,0.14)",
                    backdropFilter: "blur(10px)",
                    color: "#fff",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Ico d={I.undo} size={12} />
                  Undo
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <style>{`@keyframes dd-aur { to { transform: translate(-6%, -8%) scale(1.15) } } @keyframes dd-tw { to { opacity: 0.15 } }`}</style>

        <canvas
          ref={cv}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            display: noGL ? "none" : "block",
          }}
        />
        {noGL && phase === "card" && (
          <motion.div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              top: CY,
              width: CW,
              height: CH,
              marginLeft: -CW / 2,
              borderRadius: 20,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              clipPath: clip,
            }}
          />
        )}
        <span
          role="img"
          aria-label={phase === "card" ? `Photo: ${title}` : `${title} deleted`}
          style={{
            position: "absolute",
            left: "50%",
            top: CY,
            width: CW,
            height: CH,
            marginLeft: -CW / 2,
            pointerEvents: "none",
          }}
        />

        {/* the handle */}
        <AnimatePresence>
          {phase === "card" && (
            <motion.div
              key="handle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: `calc(50% - ${CW / 2}px)`,
                top: CY + CH / 2 - 46,
                x: hx,
                marginLeft: -13,
                zIndex: 3,
              }}
            >
              <div
                role="slider"
                tabIndex={0}
                aria-label={`Slide to delete ${title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onKeyDown={(e) => {
                  if (e.key === "Delete" || e.key === "Enter" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    touched.current = true;
                    finish();
                  }
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                style={{
                  width: 26,
                  height: 92,
                  borderRadius: 13,
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(14px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(14px) saturate(1.4)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.45), 0 8px 20px -6px rgba(0,0,0,0.5)",
                  cursor: "ew-resize",
                  touchAction: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 8,
                      height: 1.5,
                      borderRadius: 1,
                      background: "rgba(255,255,255,0.8)",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 26,
            textAlign: "center",
            fontSize: 12.5,
            color: "rgba(235,235,245,0.45)",
          }}
        >
          {phase === "card" ? "Drag the handle across to delete" : " "}
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -12,
              top: -12,
              x: gx,
              y: gy,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.75), 0 6px 14px -4px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}

// without WebGL, the card is simply clipped at the handle
function useClip(hx: ReturnType<typeof useMotionValue<number>>) {
  const [c, setC] = useState(`inset(0 0 0 0 round 20px)`);
  useEffect(() => hx.on("change", (v) => setC(`inset(0 ${Math.max(0, CW - v)}px 0 0 round 20px)`)), [hx]);
  return c;
}
