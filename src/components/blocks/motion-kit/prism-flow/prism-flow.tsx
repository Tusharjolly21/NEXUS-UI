"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { motion, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type PrismFlowProps = {
  /** what sits on the light */
  children?: ReactNode;
  title?: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
  /** the light's character */
  tone?: "ember" | "glacier" | "solar";
  /** 0.5 to 2 */
  speed?: number;
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

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.2 -0.1'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPtr;
uniform float uLean;
uniform float uPulse;
uniform vec3 uTint;   // shifts the spectrum's balance
uniform float uWarm;  // how much the deep edge burns red

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){ return noise(p) * 0.55 + noise(p * 2.1 + 3.1) * 0.3 + noise(p * 4.3 + 7.7) * 0.15; }

// the colour of light at a wavelength, 0 = red end, 1 = violet end
vec3 spectrum(float x){
  vec3 c = vec3(
    smoothstep(0.55, 0.0, x) + smoothstep(0.82, 1.0, x) * 0.55,
    smoothstep(0.0, 0.38, x) * smoothstep(0.82, 0.42, x),
    smoothstep(0.38, 0.8, x)
  );
  return c * uTint;
}

// signed distance across the band at this point: the band is a long curve that bends and drifts,
// and leans toward the pointer
float across(vec2 q, float t){
  float bend = 0.55 * sin(q.x * 1.1 + t * 0.35) + 0.22 * sin(q.x * 2.3 - t * 0.27 + 1.3);
  float lean = uLean * exp(-pow(q.x - uPtr.x, 2.0) * 1.6) * (uPtr.y - 0.0);
  return q.y - (0.2 + bend * 0.38 + q.x * 0.42 + lean * 0.35) ;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 q = vec2((uv.x - 0.5) * asp, uv.y - 0.5) * 2.0;
  float t = uTime;
  // the warp: the band's edge is never a clean line
  vec2 w = vec2(fbm(q * 0.9 + vec2(t * 0.07, -t * 0.05)), fbm(q * 0.9 - vec2(t * 0.06, t * 0.08))) - 0.5;
  float d = across(q + w * 0.35, t);
  // width breathes along the band and swells with a press
  float width = (0.34 + 0.12 * sin(q.x * 0.8 - t * 0.4)) * (1.0 + uPulse * 0.35);
  // dispersion: each wavelength's band is displaced a little more than the last, so the edges split into colour
  vec3 col = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 12; i++) {
    float x = float(i) / 11.0;
    float off = (x - 0.5) * width * 1.15;
    float g = exp(-pow((d - off) / (width * 0.55), 2.0));
    col += spectrum(x) * g;
    total += g;
  }
  col /= 3.2;
  // the hot core burns white
  float core = exp(-pow(d / (width * 0.42), 2.0));
  col += vec3(1.0, 0.97, 0.93) * core * 1.05;
  // the side away from the light glows deep red, the far side violet: the long tails of the band
  col += vec3(0.65, 0.12, 0.08) * uWarm * exp(-pow((d + width * 1.2) / (width * 1.1), 2.0)) * 0.9;
  col += vec3(0.35, 0.2, 0.75) * exp(-pow((d - width * 1.4) / (width * 1.4), 2.0)) * 0.45;
  // a second, fainter band far below
  float d2 = across(q + w * 0.5 + vec2(0.0, 1.55), t * 0.8 + 3.0);
  col += spectrum(0.15) * exp(-pow(d2 / 0.18, 2.0)) * 0.22 + vec3(0.9) * exp(-pow(d2 / 0.06, 2.0)) * 0.1;
  // tone, vignette and fine grain
  col = 1.0 - exp(-col * 1.6);
  col *= 1.0 - 0.35 * length(uv - 0.5);
  col = max(col, vec3(0.012, 0.01, 0.014));
  gl_FragColor = vec4(col, 1.0);
}`;

const TONES: Record<string, { tint: [number, number, number]; warm: number }> = {
  ember: { tint: [1.0, 0.92, 0.95], warm: 1.0 },
  glacier: { tint: [0.55, 0.95, 1.35], warm: 0.08 },
  solar: { tint: [1.15, 1.0, 0.7], warm: 0.8 },
};

const pendingLose = new WeakMap<HTMLCanvasElement, ReturnType<typeof setTimeout>>();

/**
 * A dark hero crossed by one broad band of light that bends and drifts like light through a prism: a white-hot core,
 * edges splitting into the spectrum, deep red on one side and violet on the other, with film grain over it. The band
 * leans toward your pointer and swells when you press. Put anything on top; by default a title, a line and a button.
 */
export default function PrismFlow({
  children,
  title = "Colour grading that runs in your browser",
  body = "Match shots, build looks and export LUTs for Premiere, Resolve and Final Cut. Nothing to install.",
  cta = "Try it free",
  onCta,
  tone = "ember",
  speed = 1,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: PrismFlowProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({
    px: 0,
    py: 0,
    tx: 0,
    ty: 0,
    lean: 0,
    tlean: 0,
    pulse: 0,
  });
  const touched = useRef(false);
  const [noGL, setNoGL] = useState(false);

  useEffect(() => {
    const c = cv.current;
    const el = wrap.current;
    if (!c || !el) return;
    clearTimeout(pendingLose.get(c));
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = c.getContext("webgl", { antialias: false, alpha: false });
    } catch {
      gl = null;
    }
    if (!gl) {
      setNoGL(true);
      return;
    }
    const g = gl;
    const sh = (t: number, src: string) => {
      const s = g.createShader(t)!;
      g.shaderSource(s, src);
      g.compileShader(s);
      if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn(g.getShaderInfoLog(s));
      return s;
    };
    const prog = g.createProgram()!;
    g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
      console.warn(g.getProgramInfoLog(prog));
      setNoGL(true);
      return;
    }
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "p");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = (n: string) => g.getUniformLocation(prog, n);
    const uRes = U("uRes");
    const uTime = U("uTime");
    const uPtr = U("uPtr");
    const uLean = U("uLean");
    const uPulse = U("uPulse");
    const T = TONES[tone] ?? TONES.ember;
    g.uniform3fv(U("uTint"), T.tint);
    g.uniform1f(U("uWarm"), T.warm);
    let scale = 0.6;
    const resize = () => {
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      c.width = Math.max(2, Math.round(el.clientWidth * dpr * scale));
      c.height = Math.max(2, Math.round(el.clientHeight * dpr * scale));
      g.viewport(0, 0, c.width, c.height);
      g.uniform2f(uRes, c.width, c.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(el);
    let raf = 0;
    let last = performance.now();
    let time = 4;
    let slow = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!vis) return;
      if (dt > 0.034 && scale > 0.35) {
        if (++slow > 20) {
          scale -= 0.08;
          slow = 0;
          resize();
        }
      } else slow = Math.max(0, slow - 1);
      const s = st.current;
      if (autoplay && !touched.current && !reduce) {
        s.tx = Math.sin(time * 0.4) * 0.9;
        s.ty = Math.sin(time * 0.6) * 0.5;
        s.tlean = 0.9;
      }
      const k = Math.min(1, dt * 2.5);
      s.px += (s.tx - s.px) * k;
      s.py += (s.ty - s.py) * k;
      s.lean += (s.tlean - s.lean) * Math.min(1, dt * 1.8);
      s.pulse *= Math.pow(0.25, dt);
      if (!reduce) time += dt * speed;
      g.uniform1f(uTime, time);
      g.uniform2f(uPtr, s.px, s.py);
      g.uniform1f(uLean, s.lean);
      g.uniform1f(uPulse, s.pulse);
      g.drawArrays(g.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      pendingLose.set(
        c,
        setTimeout(() => g.getExtension("WEBGL_lose_context")?.loseContext(), 300),
      );
    };
  }, [tone, speed, autoplay, reduce]);

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") touched.current = true;
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    const asp = r.width / r.height;
    st.current.tx = ((e.clientX - r.left) / r.width - 0.5) * asp * 2;
    st.current.ty = (0.5 - (e.clientY - r.top) / r.height) * 2;
    st.current.tlean = 1;
  };
  const press = () => {
    touched.current = true;
    st.current.pulse = 1;
    sfx.whoosh(180, 1400, { dur: 0.8, gain: 0.05 });
    sfx.note(196, { dur: 1.6, gain: 0.04, bell: 0.4 });
  };

  return (
    <div
      ref={wrap}
      onPointerMove={onMove}
      onPointerLeave={() => (st.current.tlean = 0)}
      onPointerDown={press}
      className={`relative w-full overflow-hidden rounded-[24px] select-none ${className}`}
      style={{
        height: 540,
        background: noGL
          ? "radial-gradient(80% 60% at 70% 20%, #fff4e6 0%, #f2a65a 18%, #b4344d 34%, #3b1b4f 52%, #0b0a0e 75%)"
          : "#060508",
        touchAction: "pan-y",
      }}
    >
      <canvas
        ref={cv}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: noGL ? "none" : "block",
        }}
      />
      {/* film grain at full resolution, over the light */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN,
          backgroundSize: "180px 180px",
          opacity: 0.32,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          alignItems: "end",
          justifyItems: "start",
          padding: "clamp(22px, 5vw, 48px)",
          textAlign: "left",
          pointerEvents: "none",
        }}
      >
        {children ?? (
          <div style={{ maxWidth: 560 }}>
            <motion.h2
              initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
              style={{
                margin: 0,
                color: "#fff",
                fontSize: "clamp(34px, 6vw, 64px)",
                fontWeight: 600,
                letterSpacing: "-0.045em",
                lineHeight: 1.02,
                textWrap: "balance",
                textShadow: "0 2px 40px rgba(0,0,0,0.25)",
              }}
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: 0.25,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              style={{
                margin: "14px 0 24px",
                maxWidth: 420,
                color: "rgba(255,255,255,0.9)",
                fontSize: 15.5,
                lineHeight: 1.5,
                textShadow: "0 1px 14px rgba(0,0,0,0.45)",
              }}
            >
              {body}
            </motion.p>
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                press();
                onCta?.();
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              style={{
                pointerEvents: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 46,
                padding: "0 22px",
                borderRadius: 23,
                border: 0,
                background: "#fff",
                color: "#1d1d1f",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 10px 30px -10px rgba(255,255,255,0.45)",
              }}
            >
              {cta}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
