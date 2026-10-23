"use client";

import { useEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, type RefObject } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}


type Take = { id: string; label: string; bg: string; bg2: string; ink: string; swatch: string };

const TAKES: Take[] = [
  { id: "rose", label: "Rose", bg: "#ff3b6b", bg2: "#b0002f", ink: "#1a0009", swatch: "#ff2d55" },
  { id: "tide", label: "Tide", bg: "#2ec4ff", bg2: "#0047b3", ink: "#00122e", swatch: "#0a84ff" },
  { id: "neon", label: "Neon", bg: "#d24dff", bg2: "#4a0b9e", ink: "#12002a", swatch: "#bf5af2" },
  { id: "paper", label: "Paper", bg: "#ffffff", bg2: "#d4d4dc", ink: "#1d1d1f", swatch: "#d2d2d7" },
];

const NOTES = [
  { id: "low", label: "Low", k: 34, hz: 110 },
  { id: "mid", label: "Mid", k: 58, hz: 220 },
  { id: "high", label: "High", k: 92, hz: 440 },
];

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision highp float;
uniform sampler2D uMark;uniform vec2 uRes;uniform float uTime,uAmp,uK;uniform vec2 uSrc;
uniform vec3 uBg,uBg2,uInk;uniform vec4 uDrops[8];
float hgt(vec2 p){
  vec2 d=p-uSrc;float r=length(d);
  float h=uAmp*sin(uK*r-uTime*7.)*exp(-r*1.3)*smoothstep(0.,.05,r);
  h+=uAmp*.22*sin(uK*.45*p.x+uTime*2.7)*sin(uK*.38*p.y-uTime*2.1);
  for(int i=0;i<8;i++){
    vec4 q=uDrops[i];
    if(q.w>0.){
      float t=uTime-q.z;
      if(t>0.){
        float rr=length(p-q.xy);float f=t*.5;
        h+=q.w*exp(-pow((rr-f)*6.,2.))*exp(-t*.9)*sin((rr-f)*70.);
      }
    }
  }
  return h;
}
void main(){
  vec2 fc=gl_FragCoord.xy;vec2 p=fc/uRes.y;float e=1.5/uRes.y;
  float hx=hgt(p+vec2(e,0.))-hgt(p-vec2(e,0.));
  float hy=hgt(p+vec2(0.,e))-hgt(p-vec2(0.,e));
  vec2 g=vec2(hx,hy)/(2.*e);
  vec2 uv=fc/uRes+g*vec2(uRes.y/uRes.x,1.)*.00042;
  float m=texture2D(uMark,uv).a;
  vec2 c=fc/uRes-.5;
  vec3 bg=mix(uBg,uBg2,clamp(length(c*vec2(1.,1.4))*1.5,0.,1.));
  vec3 col=mix(bg,uInk,m);
  vec3 n=normalize(vec3(-g*.012,1.));
  vec3 L=normalize(vec3(-.4,.55,.75));
  float spec=pow(max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.),48.);
  float caus=clamp(dot(g,vec2(.5,.7))*.0025,-.18,.25);
  col=col*(1.+caus)+spec*.55;
  float rd=length((p-uSrc));
  float rod=1.-smoothstep(.016,.019,rd);
  vec3 metal=mix(vec3(.55,.56,.6),vec3(1.),smoothstep(.016,0.,length(p-uSrc-vec2(-.005,.006))));
  col=mix(col,metal,rod);
  float halo=(1.-smoothstep(.019,.03,rd))*(1.-rod)*.25;
  col=col*(1.-halo);
  gl_FragColor=vec4(col,1.);
}`;

function hex(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Sound Mark: a brand mark sitting under a tray of water, with a vibrating rod in it.
 * The rod drives a standing ripple that bends the mark like light through water.
 * Press and hold the stage to turn the note up (the surface surges past and settles),
 * tap anywhere to drop a ripple, drag the rod to move the source, and pick a pitch
 * to tighten or loosen the rings. Keyboard: hold Space, arrow keys move the rod.
 */
export interface SoundMarkProps {
  /** The word set beside the mark. It is drawn into the water, so keep it short. */
  word?: string;
  /** Swells, drops ripples and cycles the colours and pitch by itself until someone touches it. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

export function SoundMark({ word = "sound", autoplay = false, className }: SoundMarkProps) {
  const reduce = useReducedMotion() ?? false;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touched = useRef(false);
  const [take, setTake] = useState(0);
  const [note, setNote] = useState(1);
  const [soundOn, setSoundOn] = useState(false);
  const [noGL, setNoGL] = useState(false);

  const ampTarget = useMotionValue(0.35);
  const amp = useSpring(ampTarget, { stiffness: 90, damping: 9 });
  const kTarget = useMotionValue(NOTES[1].k);
  const k = useSpring(kTarget, { stiffness: 120, damping: 20 });
  const sxT = useMotionValue(0.5);
  const syT = useMotionValue(0.5);
  const sx = useSpring(sxT, { stiffness: 260, damping: 22 });
  const sy = useSpring(syT, { stiffness: 260, damping: 22 });
  const mix = useMotionValue(1);

  const drops = useRef<number[]>(new Array(32).fill(0));
  const dropIdx = useRef(0);
  const clock = useRef(0);
  const fromTake = useRef(TAKES[0]);
  const toTake = useRef(TAKES[0]);
  const aspect = useRef(16 / 9);
  const dragging = useRef(false);
  const soundRef = useRef(false);
  const noteRef = useRef(1);
  const onScreen = useDemoActive(wrapRef, true);
  const onScreenRef = useRef(false);
  const activeAuto = useDemoActive(wrapRef, autoplay && !reduce);
  const audio = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => {
    soundRef.current = soundOn;
    noteRef.current = note;
    onScreenRef.current = onScreen;
  });

  const drop = (x: number, y: number, s = 1) => {
    const i = dropIdx.current % 8;
    drops.current.splice(i * 4, 4, x, y, clock.current, s);
    dropIdx.current++;
  };

  const touch = () => {
    touched.current = true;
  };

  const pickTake = (i: number) => {
    fromTake.current = currentColors();
    toTake.current = TAKES[i];
    mix.set(0);
    animate(mix, 1, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    setTake(i);
  };

  const currentColors = (): Take => {
    const t = mix.get();
    const lerp = (a: string, b: string) => {
      const A = hex(a), B = hex(b);
      const c = A.map((v, j) => Math.round((v + (B[j] - v) * t) * 255));
      return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
    };
    const f = fromTake.current, to = toTake.current;
    return { ...to, bg: lerp(f.bg, to.bg), bg2: lerp(f.bg2, to.bg2), ink: lerp(f.ink, to.ink) };
  };

  const pickNote = (i: number) => {
    setNote(i);
    kTarget.set(NOTES[i].k);
    if (audio.current) audio.current.osc.frequency.setTargetAtTime(NOTES[i].hz, audio.current.ctx.currentTime, 0.05);
    drop(sx.get() * aspect.current, sy.get(), 0.6);
  };

  const toggleSound = () => {
    touch();
    if (!audio.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = NOTES[noteRef.current].hz;
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      audio.current = { ctx, osc, gain };
    }
    if (audio.current.ctx.state === "suspended") audio.current.ctx.resume();
    setSoundOn((v) => !v);
  };

  useEffect(() => () => {
    audio.current?.osc.stop();
    audio.current?.ctx.close();
  }, []);

  // WebGL setup + render loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      setNoGL(true);
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setNoGL(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = {
      res: U("uRes"), time: U("uTime"), amp: U("uAmp"), k: U("uK"), src: U("uSrc"),
      bg: U("uBg"), bg2: U("uBg2"), ink: U("uInk"), drops: U("uDrops"), mark: U("uMark"),
    };
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.uniform1i(u.mark, 0);

    const off = document.createElement("canvas");
    const drawMark = (w: number, h: number) => {
      off.width = w;
      off.height = h;
      const g = off.getContext("2d")!;
      g.clearRect(0, 0, w, h);
      g.fillStyle = "#fff";
      g.strokeStyle = "#fff";
      const size = h * 0.2;
      g.font = `700 ${size}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;
      g.textBaseline = "middle";
      const tw = g.measureText(word).width;
      const glyph = size * 0.92;
      const gap = size * 0.28;
      const total = glyph + gap + tw;
      let x = (w - total) / 2;
      const cy = h / 2;
      // glyph: a rounded tile with three bars
      const r = glyph * 0.26;
      const y0 = cy - glyph / 2;
      g.beginPath();
      g.moveTo(x + r, y0);
      g.arcTo(x + glyph, y0, x + glyph, y0 + glyph, r);
      g.arcTo(x + glyph, y0 + glyph, x, y0 + glyph, r);
      g.arcTo(x, y0 + glyph, x, y0, r);
      g.arcTo(x, y0, x + glyph, y0, r);
      g.closePath();
      g.fill();
      g.globalCompositeOperation = "destination-out";
      const bars = [0.38, 0.62, 0.3];
      const bw = glyph * 0.12;
      bars.forEach((b, i) => {
        const bx = x + glyph * (0.27 + i * 0.23) - bw / 2;
        const bh = glyph * b;
        g.beginPath();
        if (g.roundRect) g.roundRect(bx, cy - bh / 2, bw, bh, bw / 2);
        else g.rect(bx, cy - bh / 2, bw, bh);
        g.fill();
      });
      g.globalCompositeOperation = "source-over";
      x += glyph + gap;
      g.fillText(word, x, cy + size * 0.04);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
    };

    let w = 0, h = 0;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const nw = Math.max(2, Math.round(r.width * dpr));
      const nh = Math.max(2, Math.round(r.height * dpr));
      if (nw !== w || nh !== h) {
        w = canvas.width = nw;
        h = canvas.height = nh;
        aspect.current = w / h;
        gl.viewport(0, 0, w, h);
        drawMark(w, h);
      }
    };
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    fit();

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!onScreenRef.current) {
        // off screen or tab hidden: keep the clock, skip the GPU work, and let the tone fall silent
        if (audio.current) audio.current.gain.gain.setTargetAtTime(0, audio.current.ctx.currentTime, 0.04);
        raf = requestAnimationFrame(frame);
        return;
      }
      clock.current += dt;
      const c = currentColors();
      const a = Math.max(0, amp.get());
      gl.uniform2f(u.res, w, h);
      gl.uniform1f(u.time, clock.current);
      gl.uniform1f(u.amp, a);
      gl.uniform1f(u.k, k.get());
      gl.uniform2f(u.src, sx.get() * aspect.current, 1 - sy.get());
      gl.uniform3fv(u.bg, hex(c.bg));
      gl.uniform3fv(u.bg2, hex(c.bg2));
      gl.uniform3fv(u.ink, hex(c.ink));
      gl.uniform4fv(u.drops, drops.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (audio.current) {
        const target = soundRef.current ? Math.min(0.12, a * 0.09) : 0;
        audio.current.gain.gain.setTargetAtTime(target, audio.current.ctx.currentTime, 0.04);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  // Autoplay: swell, drop ripples, cycle the takes until first touch
  useEffect(() => {
    if (!autoplay || reduce || !activeAuto) return;
    let step = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      step++;
      ampTarget.set(step % 4 === 1 ? 1 : 0.35);
      if (step % 2 === 0) drop(0.25 + Math.random() * aspect.current * 0.7, 0.2 + Math.random() * 0.6, 0.8);
      if (step % 5 === 0) pickTake((TAKES.findIndex((t) => t.id === toTake.current.id) + 1) % TAKES.length);
      if (step % 7 === 0) pickNote((noteRef.current + 1) % NOTES.length);
    }, 1300);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, activeAuto]);

  const toLocal = (e: RPointerEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    touch();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toLocal(e);
    const dx = (p.x - sx.get()) * aspect.current;
    const dy = p.y - sy.get();
    dragging.current = Math.hypot(dx, dy) < 0.07;
    if (!dragging.current) drop(p.x * aspect.current, 1 - p.y, 1);
    ampTarget.set(1);
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const p = toLocal(e);
    sxT.set(Math.min(0.95, Math.max(0.05, p.x)));
    syT.set(Math.min(0.92, Math.max(0.08, p.y)));
  };
  const onUp = () => {
    dragging.current = false;
    ampTarget.set(0.3);
  };
  const onKeyDown = (e: RKeyboardEvent<HTMLButtonElement>) => {
    const step = 0.04;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      touch();
      if (!e.repeat) drop(sx.get() * aspect.current, 1 - sy.get(), 0.9);
      ampTarget.set(1);
    } else if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      touch();
      if (e.key === "ArrowLeft") sxT.set(Math.max(0.05, sxT.get() - step));
      if (e.key === "ArrowRight") sxT.set(Math.min(0.95, sxT.get() + step));
      if (e.key === "ArrowUp") syT.set(Math.max(0.08, syT.get() - step));
      if (e.key === "ArrowDown") syT.set(Math.min(0.92, syT.get() + step));
    }
  };
  const onKeyUp = (e: RKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") ampTarget.set(0.3);
  };

  const t = TAKES[take];

  return (
    <div className={cn("flex w-full max-w-[880px] flex-col items-center gap-4", className)} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-[24px] bg-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
        style={{ aspectRatio: "16 / 9" }}
      >
        <button
          type="button"
          aria-label={`Water stage showing the ${word} mark. Press and hold to play the note, tap to drop a ripple, drag the rod or use the arrow keys to move it.`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onBlur={onUp}
          className="absolute inset-0 block h-full w-full cursor-crosshair touch-none select-none border-0 bg-transparent p-0 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/80"
        >
          <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
        </button>
        {noGL && (
          <div className="absolute inset-0 flex items-center justify-center text-[clamp(32px,8vw,72px)] font-bold tracking-[-0.04em]" style={{ background: t.bg, color: t.ink }}>
            {word}
          </div>
        )}
        <span className="pointer-events-none absolute bottom-3 left-4 rounded-full bg-black/45 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-md">
          made by sound
        </span>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Colour take" className="flex items-center gap-1 rounded-full bg-white p-1 dark:bg-[#2c2c2e] shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
          {TAKES.map((tk, i) => (
            <button
              key={tk.id}
              type="button"
              role="radio"
              aria-checked={take === i}
              onClick={() => {
                touch();
                pickTake(i);
              }}
              className="relative flex h-9 items-center gap-2 rounded-full px-3 text-[13px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7]"
            >
              {take === i && (
                <motion.span layoutId="soundmark-take" className="absolute inset-0 rounded-full bg-[#f5f5f7] dark:bg-[#3a3a3c]" transition={{ type: "spring", stiffness: 500, damping: 34 }} />
              )}
              <span className="relative h-3.5 w-3.5 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" style={{ background: tk.swatch }} aria-hidden="true" />
              <span className="relative">{tk.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div role="radiogroup" aria-label="Pitch" className="flex items-center gap-1 rounded-full bg-white p-1 dark:bg-[#2c2c2e] shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
            {NOTES.map((n, i) => (
              <button
                key={n.id}
                type="button"
                role="radio"
                aria-checked={note === i}
                onClick={() => {
                  touch();
                  pickNote(i);
                }}
                className="relative h-9 rounded-full px-3 text-[13px] font-medium tabular-nums text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7]"
              >
                {note === i && (
                  <motion.span layoutId="soundmark-note" className="absolute inset-0 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" transition={{ type: "spring", stiffness: 500, damping: 34 }} />
                )}
                <span className={`relative ${note === i ? "text-white dark:text-[#1d1d1f]" : ""}`}>{n.label}</span>
              </button>
            ))}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            aria-pressed={soundOn}
            onClick={toggleSound}
            className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
              <motion.path d="M15.5 9a4.2 4.2 0 0 1 0 6" initial={false} animate={{ pathLength: soundOn ? 1 : 0, opacity: soundOn ? 1 : 0 }} />
              <motion.path d="M18.5 6a8.5 8.5 0 0 1 0 12" initial={false} animate={{ pathLength: soundOn ? 1 : 0, opacity: soundOn ? 1 : 0 }} transition={{ delay: soundOn ? 0.08 : 0 }} />
            </svg>
            Tone {soundOn ? "on" : "off"}
          </motion.button>
        </div>
      </div>
      <p className="m-0 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Hold the water to turn the note up, tap to drop a ripple, drag the rod to move it.</p>
    </div>
  );
}
