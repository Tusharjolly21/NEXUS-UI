Add the "Shader Flow" component from Nexus UI to my project.

A real WebGL fragment shader of domain-warped noise that drifts like ink in water, with a static gradient fallback where WebGL is missing. Move the pointer and the flow swirls behind it on a lagging spring; stop and the swirl swings into a small counter-twist before it calms.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { ShaderFlow } from "@/components/shader-flow";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/shader-flow/index.ts ---

```ts
export { ShaderFlow } from "./shader-flow";
export type { ShaderFlowProps } from "./shader-flow";
```

--- components/shader-flow/shader-flow.tsx ---

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ShaderFlowProps {
  /** Content over the flow. Replaces the default title card. */
  children?: ReactNode;
  className?: string;
  /** Show the default title card when no children are passed. */
  showContent?: boolean;
  /** The pointer stirs the flow; it swirls behind the pointer and twists back. */
  cursorReactive?: boolean;
  /** How strong the colour and warping are. */
  intensity?: "low" | "medium" | "high";
  /** Four hex colours: base, body, accent, highlight. */
  colors?: [string, string, string, string];
  /** Speed multiplier for the drift. */
  speed?: number;
  /** Stirs the flow with a pretend pointer until someone moves over it. */
  autoplay?: boolean;
}

const DEFAULT_COLORS: [string, string, string, string] = ["#05060d", "#1d39d6", "#bf5af2", "#ff9f6a"];
const AMOUNT = { low: 0.65, medium: 1, high: 1.35 } as const;

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uStir;uniform float uAmt;
uniform vec3 uC0;uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
void main(){
vec2 uv=gl_FragCoord.xy/uRes;
vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);
vec2 d=p-m;float r=length(d);float sw=uStir*exp(-r*r*5.);
float s=sin(sw),c=cos(sw);p=m+mat2(c,-s,s,c)*d;
float t=uTime*.07;
vec2 q=vec2(fbm(p*1.3+t),fbm(p*1.3+vec2(5.2,1.3)-t));
vec2 w=vec2(fbm(p*1.5+3.*q*uAmt+vec2(1.7,9.2)+t*1.3),fbm(p*1.5+3.*q*uAmt+vec2(8.3,2.8)-t));
float f=fbm(p*1.2+2.4*w*uAmt);
vec3 col=mix(uC0,uC1,smoothstep(.12,.62,f));
col=mix(col,uC2,smoothstep(.45,.9,length(q))*.8);
col=mix(col,uC3,smoothstep(.5,.78,w.x)*.75*min(uAmt,1.));
col=mix(uC0,col,clamp(.55+.45*uAmt,0.,1.));
col*=.85+.8*f;
col+=uC3*pow(f,4.)*.5;
col*=smoothstep(1.45,.3,length(uv-.5)*1.3);
col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.03;
gl_FragColor=vec4(col,1.);}`;

function hex(c: string): [number, number, number] {
  const h = c.replace("#", "");
  const f = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  const n = parseInt(f, 16);
  if (f.length !== 6 || Number.isNaN(n)) return [0.5, 0.5, 0.5];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * A real fragment shader: domain-warped noise that drifts like ink in water.
 * Move the pointer and the flow swirls behind it, lagging on a spring; stop
 * and the swirl springs past zero into a small counter-twist before it calms.
 * Falls back to a static gradient where WebGL is unavailable.
 */
export function ShaderFlow({
  children,
  className,
  showContent = true,
  cursorReactive = true,
  intensity = "medium",
  colors = DEFAULT_COLORS,
  speed = 1,
  autoplay = false,
}: ShaderFlowProps) {
  const still = useReducedMotion() === true;
  const canvas = useRef<HTMLCanvasElement>(null);
  const touched = useRef(false);
  const lastMove = useRef({ x: 0.5, y: 0.5, t: 0 });
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 60, damping: 14 });
  const sy = useSpring(my, { stiffness: 60, damping: 14 });
  const stirRaw = useMotionValue(0);
  // Underdamped: the swirl swings past zero into a counter-twist.
  const stir = useSpring(stirRaw, { stiffness: 38, damping: 5 });
  const palette = colors.join("|");
  const amt = AMOUNT[intensity] ?? 1;

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) return;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes");
    const uTime = u("uTime");
    const uMouse = u("uMouse");
    const uStir = u("uStir");
    const uAmt = u("uAmt");
    palette.split("|").slice(0, 4).forEach((c, i) => gl.uniform3fv(u(`uC${i}`), hex(c)));
    gl.uniform1f(uAmt, amt);
    cv.dataset.ready = "true";

    // Rendered at reduced resolution; the flow is soft, so the browser's upscale hides it.
    const SCALE = 0.5;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(cv.clientWidth * dpr * SCALE));
      cv.height = Math.max(1, Math.round(cv.clientHeight * dpr * SCALE));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uRes, cv.width, cv.height);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) frame(12);
    });
    ro.observe(cv);

    function frame(time: number) {
      gl!.uniform1f(uTime, time);
      gl!.uniform2f(uMouse, sx.get(), 1 - sy.get());
      gl!.uniform1f(uStir, stir.get());
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    });
    io.observe(cv);
    if (still) frame(12);
    else {
      let time = 8;
      let demo = 0;
      let last = performance.now();
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!visible) return;
        time += dt * speed;
        // Let the stir drain away; the spring carries it past zero on its own.
        stirRaw.set(stirRaw.get() * Math.pow(0.08, dt));
        if (autoplay && cursorReactive && !touched.current) {
          demo += dt;
          const x = 0.5 + Math.sin(demo * 0.9) * 0.3;
          const y = 0.5 + Math.sin(demo * 1.8) * 0.18;
          mx.set(x);
          my.set(y);
          stirRaw.set(Math.sin(demo * 0.45) * 3.2);
        }
        frame(time);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [still, palette, amt, speed, autoplay, cursorReactive, sx, sy, stir, stirRaw, mx, my]);

  const [c0, c1, c2, c3] = colors;
  return (
    <div
      onPointerMove={(e) => {
        if (!cursorReactive) return;
        touched.current = true;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const prev = lastMove.current;
        const dt = Math.max(0.008, (e.timeStamp - prev.t) / 1000);
        const v = Math.hypot(x - prev.x, y - prev.y) / dt;
        const side = (x - prev.x) * (0.5 - y) - (y - prev.y) * (0.5 - x) >= 0 ? 1 : -1;
        lastMove.current = { x, y, t: e.timeStamp };
        mx.set(x);
        my.set(y);
        if (dt < 0.2) stirRaw.set(Math.max(-5, Math.min(5, stirRaw.get() + side * Math.min(v, 4) * 0.35)));
      }}
      className={cn(
        "relative isolate flex min-h-[420px] items-center justify-center overflow-hidden rounded-[24px] bg-[#05060d] text-white",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{
          background: `radial-gradient(60% 70% at 25% 30%, ${c1}aa, transparent 70%), radial-gradient(50% 60% at 80% 70%, ${c2}88, transparent 70%), radial-gradient(40% 40% at 60% 20%, ${c3}55, transparent 70%), ${c0}`,
        }}
      />
      <canvas ref={canvas} aria-hidden className="absolute inset-0 -z-10 h-full w-full" />
      {children ?? (showContent ? <TitleCard /> : null)}
    </div>
  );
}

function TitleCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="relative px-6 text-center"
    >
      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12px] font-medium text-white/85 backdrop-blur">
        Shader Flow
      </span>
      <h2 className="mt-4 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] [text-wrap:balance] sm:text-[44px]">
        Colour that moves
        <br />
        like ink in water.
      </h2>
      <p className="mt-3 text-[13px] text-white/70">Move to stir it. It twists back when you stop.</p>
    </motion.div>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
