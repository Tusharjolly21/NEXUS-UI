# Black Hole Delete

Add the "Black Hole Delete" component from Nexus UI to my project.

An inbox where deleting is a cosmic event. Swipe a message away, or press its close button, and a black hole opens beside it: the list bends around it like a lens, the message is stretched thin and spirals in, and a shockwave ripples through the rest. Restore runs it backwards with a white hole.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { BlackHoleDelete } from "@/components/black-hole-delete";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/black-hole-delete/black-hole-delete.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type BlackHoleMessage = {
  /** Sender or subject. The avatar shows its initials. */
  title: string;
  /** One line of preview text. Long text is cut with an ellipsis. */
  body: string;
  /** Short time label shown on the right, such as "9:41" or "Tue". */
  time: string;
  /** Avatar colour, as a CSS colour string. */
  color: string;
};

const MESSAGES: BlackHoleMessage[] = [
  { title: "Ava Chen", body: "Design review moved to Thursday at 3?", time: "9:41", color: "#5e5ce6" },
  { title: "Build bot", body: "Deploy failed: step 4 of 7 timed out", time: "9:12", color: "#ff9f0a" },
  { title: "Marco", body: "Lunch? Ramen again or somewhere new", time: "8:55", color: "#30d158" },
  { title: "Motion Weekly", body: "Twelve interfaces that move like physics", time: "8:20", color: "#64d2ff" },
  { title: "Sam Rivera", body: "Sent the redlines, one open question on IP", time: "Tue", color: "#ff375f" },
  { title: "Flash sale", body: "48 hours left. Your cart is waiting", time: "Mon", color: "#bf5af2" },
];

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
/*
 * Gravitational lens over the rendered UI: each pixel looks up the UI a little closer to the hole,
 * so the cards smear into a ring around it. Inside the event horizon is black; a thin photon ring
 * and a tilted, swirling accretion disk sit around it, brighter on the side spinning toward you.
 * A white hole runs the lens backwards and glows. A shockwave ripple follows a collapse.
 */
const FRAG = `precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;      // canvas px
uniform float uDpr;
uniform vec3 uHole;     // x, y, radius (css px)
uniform float uWhite;
uniform float uTime;
uniform float uFlash;
uniform float uSwirl;  // how hard space twists into the hole
uniform vec4 uRipple;   // x, y, radius, amplitude
void main(){
  vec2 css = uRes / uDpr;
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 q = p;
  if (uRipple.w > 0.01) {
    vec2 dr = p - uRipple.xy;
    float rr = length(dr) + 1e-4;
    float k = exp(-pow((rr - uRipple.z) / 22.0, 2.0));
    q -= dr / rr * k * uRipple.w * sin((rr - uRipple.z) * 0.25);
  }
  float rs = uHole.z;
  vec2 d = p - uHole.xy;
  float r = length(d) + 1e-4;
  vec2 n = d / r;
  if (rs > 0.3) {
    float bend = rs * rs * 2.4 / r;
    q += (uWhite > 0.5 ? n : -n) * bend;
    // frame dragging: space near the hole is twisted round it, harder the closer you get
    float sw = uSwirl * rs * rs / (r * r + rs * rs * 0.6);
    vec2 dq = q - uHole.xy;
    float cs = cos(sw), sn = sin(sw);
    q = uHole.xy + vec2(dq.x * cs - dq.y * sn, dq.x * sn + dq.y * cs);
  }
  vec3 col = texture2D(uTex, clamp(q / css, vec2(0.001), vec2(0.999))).rgb;
  if (rs > 0.3) {
    if (uWhite < 0.5) {
      // accretion disk, tilted toward the viewer, behind the hole on top and in front below
      vec2 dd = vec2(d.x, d.y / 0.3);
      float rd = length(dd) / rs;
      float ang = atan(dd.y, dd.x);
      float band = smoothstep(1.25, 1.7, rd) * smoothstep(4.4, 2.3, rd);
      float swirl = 0.55 + 0.45 * sin(ang * 3.0 - uTime * 5.0 + rd * 4.0);
      float dop = 0.55 + 0.6 * (0.5 - 0.5 * cos(ang));
      vec3 disk = mix(vec3(1.0, 0.42, 0.12), vec3(1.0, 0.92, 0.75), swirl * dop) * band * (0.5 + 0.8 * swirl) * dop;
      float front = step(0.0, d.y);
      float shadow = smoothstep(rs * 1.02, rs * 0.92, r);
      col = mix(col, vec3(0.0), shadow);
      // the far side of the disk is lensed up and over the top of the hole
      float arc = exp(-pow((r - rs * 1.32) / (rs * 0.16), 2.0)) * smoothstep(0.3, -0.6, n.y);
      col += vec3(1.0, 0.7, 0.4) * arc * 0.9;
      col += disk * (front > 0.5 ? 1.0 : (1.0 - shadow));
      // photon ring
      col += vec3(1.0, 0.85, 0.65) * exp(-pow((r - rs * 1.05) / (rs * 0.05 + 0.6), 2.0)) * 1.1;
    } else {
      float core = exp(-r / (rs * 0.55));
      col = mix(col, vec3(1.0), clamp(core * 1.4, 0.0, 1.0));
      col += vec3(0.55, 0.8, 1.0) * exp(-pow((r - rs * 1.6) / (rs * 0.25), 2.0)) * 0.8;
      col += vec3(0.6, 0.85, 1.0) * exp(-r / (rs * 2.5)) * 0.35;
    }
  }
  if (uFlash > 0.0) col += vec3(1.0, 0.8, 0.6) * uFlash * exp(-length(p - uHole.xy) / 60.0);
  gl_FragColor = vec4(col, 1.0);
}`;

type Item = BlackHoleMessage & {
  id: number; order: number;
  state: "live" | "dying" | "dead" | "restoring";
  y: number; vy: number; dx: number; vdx: number;
  /** Tidal pull toward an open hole, on a spring, so the list is tugged and then settles. */
  ox: number; oy: number; vox: number; voy: number;
  u: number; delay: number; th0: number; d0: number; sx: number; sy: number;
};

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/**
 * Black Hole Delete: an inbox where deleting is a cosmic event. Swipe a message away (or hit its
 * close button) and a black hole tears open beside it. The whole interface bends around it, the
 * message is stretched into a thin streak and spirals in, and the hole collapses with a flash and
 * a shockwave that ripples through the list while the rest slide up to close the gap. Restore runs
 * it backwards: a white hole spits every message back out into its place.
 *
 * The list is drawn to a canvas and shown through a WebGL lens shader (accretion disk, photon ring,
 * shockwave). Every message also has a real delete button for keyboard and screen reader users.
 * With `autoplay` a ghost swipes a few away and restores them until the pointer arrives. Pauses off
 * screen; under reduced motion nothing moves by itself, but swiping and the buttons still work.
 */
export type BlackHoleDeleteProps = {
  /** Messages shown in the inbox. Each one also gets a real delete button for keyboard and screen reader users. */
  messages?: BlackHoleMessage[];
  /** Height of the stage, in px. About 76 + 69 per message + 40 fits the list and the hint line. */
  height?: number;
  /** A ghost pointer swipes a few messages away and restores them, until a real pointer arrives. */
  autoplay?: boolean;
  className?: string;
};

export function BlackHoleDelete({ messages = MESSAGES, height = 540, autoplay = false, className }: BlackHoleDeleteProps) {
  // The stage owns canvases, a GL context and list state built from the messages, so a change to the
  // messages or to autoplay remounts it instead of patching a running scene.
  const signature = JSON.stringify(messages);
  return <BlackHoleStage key={`${autoplay ? 1 : 0}:${signature}`} messages={messages} height={height} autoplay={autoplay} className={className} />;
}

function BlackHoleStage({ messages: initial, height, autoplay, className }: { messages: BlackHoleMessage[]; height: number; autoplay: boolean; className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const uiRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ remove: (id: number) => void; restore: () => void }>({ remove: () => {}, restore: () => {} });
  // Snapshot taken once per mount; the parent remounts this component when the messages change.
  const [messages] = useState(initial);
  const [live, setLive] = useState(() => messages.map((m, i) => ({ ...m, id: i })));

  useEffect(() => {
    const stage = stageRef.current!, glc = glRef.current!, ui = uiRef.current!;
    const g = ui.getContext("2d")!;
    const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const gl = glc.getContext("webgl", { antialias: false, alpha: false });
    let prog: WebGLProgram | null = null;
    let vs: WebGLShader | null = null, fs: WebGLShader | null = null;
    let buf: WebGLBuffer | null = null;
    const U: Record<string, WebGLUniformLocation | null> = {};
    let tex: WebGLTexture | null = null;
    if (gl) {
      const sh = (t: number, src: string) => { const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
      prog = gl.createProgram()!;
      vs = sh(gl.VERTEX_SHADER, VERT);
      fs = sh(gl.FRAGMENT_SHADER, FRAG);
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl.deleteProgram(prog); prog = null; }
    }
    const useGL = !!(gl && prog);
    ui.style.visibility = useGL ? "hidden" : "visible";
    glc.style.visibility = useGL ? "visible" : "hidden";
    if (gl && prog) {
      gl.useProgram(prog);
      for (const n of ["uTex", "uRes", "uDpr", "uHole", "uWhite", "uTime", "uFlash", "uRipple", "uSwirl"]) U[n] = gl.getUniformLocation(prog, n);
      const b = (buf = gl.createBuffer());
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    let w = 0, h = 0, dpr = 1;
    const fit = () => {
      // Layout size, not the on-screen rect, so a CSS-scaled preview shell does not shrink the scene.
      const r = stage.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = stage.offsetWidth || r.width; h = stage.offsetHeight || r.height;
      for (const c of [glc, ui]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      if (gl) gl.viewport(0, 0, glc.width, glc.height);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    fit();

    // stars, fixed in place so the lens has something to bend
    const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.2, a: 0.25 + Math.random() * 0.6 }));

    const items: Item[] = messages.map((m, i) => ({
      ...m, id: i, order: i, state: "live", y: 0, vy: 0, dx: 0, vdx: 0, ox: 0, oy: 0, vox: 0, voy: 0, u: 0, delay: 0, th0: 0, d0: 0, sx: 0, sy: 0,
    }));
    const CH = 60, GAP = 9, TOP = 76;
    let lw = 0, lx = 0;
    const layout = () => {
      lw = Math.min(460, w - 48);
      lx = (w - lw) / 2;
    };
    const slotY = (it: Item) => {
      const before = items.filter((o) => (o.state === "live" || o.state === "restoring") && o.order < it.order).length;
      return TOP + before * (CH + GAP);
    };
    let seeded = false;

    // the hole
    const hole = { x: 0, y: 0, rs: 0, target: 0, phase: "none" as "none" | "grow" | "eat" | "collapse", t: 0, white: false, victim: -1, front: false };
    const ripple = { x: 0, y: 0, r: 0, amp: 0 };
    let flash = 0;
    let dust: { a: number; d: number; s: number; life: number }[] = [];

    const sync = () => setLive(items.filter((i) => i.state === "live").map(({ id, title, body, time, color }) => ({ id, title, body, time, color })));

    const remove = (it: Item, dir: number, front = false) => {
      if (hole.phase !== "none" || it.state !== "live") return false;
      const cx = lx + lw / 2 + it.dx + it.ox, cy = it.y + CH / 2 + it.oy;
      // the close button opens the hole right in front of the message; a swipe opens it beside
      hole.front = front;
      hole.x = front ? cx : Math.max(40, Math.min(w - 40, cx + dir * lw * 0.18));
      hole.y = cy;
      hole.white = false;
      hole.target = front ? 38 : 30;
      hole.phase = "grow"; hole.t = 0; hole.victim = it.id;
      it.state = "dying"; it.u = 0;
      it.sx = cx; it.sy = cy;
      it.d0 = Math.hypot(cx - hole.x, cy - hole.y);
      it.th0 = Math.atan2(cy - hole.y, cx - hole.x);
      dust = [];
      sync();
      return true;
    };
    const restore = () => {
      if (hole.phase !== "none") return;
      const dead = items.filter((i) => i.state === "dead");
      if (!dead.length) return;
      hole.x = lx + lw / 2; hole.y = TOP + 2.5 * (CH + GAP);
      hole.white = true; hole.front = false; hole.target = 20; hole.phase = "grow"; hole.t = 0; hole.victim = -1;
      dead.forEach((it, k) => { it.state = "restoring"; it.u = 1; it.delay = 0.25 + k * 0.14; });
      // land them in order
      for (const it of dead) {
        const sy = slotY(it) + CH / 2, sx = lx + lw / 2;
        it.d0 = Math.hypot(sx - hole.x, sy - hole.y) + 1;
        it.th0 = Math.atan2(sy - hole.y, sx - hole.x);
        it.y = sy - CH / 2;
        it.dx = 0;
      }
    };
    api.current.remove = (id: number) => { const it = items.find((i) => i.id === id); if (it) remove(it, 1, true); };
    api.current.restore = restore;

    // ---- pointer ----
    const ptr = { x: -1, y: -1, inside: false, last: 0 };
    let drag: { it: Item; x0: number; lastX: number; vx: number } | null = null;
    let touched = false;
    const local = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      // Undo any CSS scale on a parent so pointer space matches layout space.
      const kx = stage.offsetWidth ? r.width / stage.offsetWidth : 1;
      const ky = stage.offsetHeight ? r.height / stage.offsetHeight : 1;
      return { x: (e.clientX - r.left) / kx, y: (e.clientY - r.top) / ky };
    };
    const hit = (x: number, y: number) => items.find((it) => it.state === "live" && x >= lx + it.dx && x <= lx + lw + it.dx && y >= it.y && y <= it.y + CH);
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      touched = true;
      const p = local(e);
      const it = hit(p.x, p.y);
      if (!it) return;
      // the close button
      const bx = lx + lw - 22 + it.dx, by = it.y + CH / 2;
      if (Math.hypot(p.x - bx, p.y - by) < 13) { remove(it, 1, true); return; }
      drag = { it, x0: p.x - it.dx, lastX: p.x, vx: 0 };
      stage.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      ptr.x = p.x; ptr.y = p.y;
      ptr.inside = p.x >= 0 && p.y >= 0 && p.x <= w && p.y <= h;
      if (ptr.inside) { touched = true; ptr.last = performance.now(); }
      if (drag) {
        drag.it.dx = p.x - drag.x0;
        drag.vx = (p.x - drag.lastX) * 60;
        drag.lastX = p.x;
      }
    };
    const onUp = () => {
      if (!drag) return;
      const it = drag.it;
      const fling = Math.abs(it.dx) > lw * 0.28 || Math.abs(drag.vx) > 900;
      if (!(fling && remove(it, Math.sign(it.dx || drag.vx) || 1))) it.vdx = drag.vx * 0.2;
      drag = null;
    };
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // ---- ghost ----
    let gt = 0, gstep = 0;
    const ghost = { x: 0, y: 0, on: false, down: false };
    let gdrag: Item | null = null;

    const drawCard = (it: Item, hover: boolean) => {
      // card body
      rr(g, 0, 0, lw, CH, 16);
      g.fillStyle = hover ? "#1f2029" : "#18191f";
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.07)";
      g.lineWidth = 1;
      g.stroke();
      // avatar
      g.fillStyle = it.color;
      g.beginPath(); g.arc(30, CH / 2, 17, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff";
      g.font = "600 13px -apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(it.title.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase(), 30, CH / 2 + 0.5);
      g.textAlign = "left";
      g.fillStyle = "#f2f2f7";
      g.font = "600 14px -apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif";
      g.fillText(it.title, 58, CH / 2 - 10);
      g.fillStyle = "#8e8e93";
      g.font = "400 13px -apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif";
      let body = it.body;
      const room = lw - 58 - 70;
      while (g.measureText(body).width > room && body.length > 4) body = body.slice(0, -2);
      if (body !== it.body) body = body.trimEnd() + "\u2026";
      g.fillText(body, 58, CH / 2 + 10);
      g.textAlign = "right";
      g.fillStyle = "#636366";
      g.font = "400 12px -apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif";
      if (hover) {
        g.fillStyle = "rgba(255,255,255,0.1)";
        g.beginPath(); g.arc(lw - 22, CH / 2, 12, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "#e5e5ea"; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(lw - 26, CH / 2 - 4); g.lineTo(lw - 18, CH / 2 + 4); g.moveTo(lw - 18, CH / 2 - 4); g.lineTo(lw - 26, CH / 2 + 4); g.stroke();
      } else g.fillText(it.time, lw - 16, CH / 2 - 10);
      g.textAlign = "left";
    };

    let raf = 0;
    let visible = true;
    let prev = performance.now();
    // How many messages the ghost swipes away before it restores them (keeps two in the list).
    const autoSteps = Math.max(0, Math.min(3, messages.length - 2));
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!visible) return;
      const dt = Math.max(1 / 240, Math.min(0.033, (now - prev) / 1000));
      prev = now;
      if (!w || !h) return;
      layout();
      const time = now / 1000;
      if (!seeded) { for (const it of items) it.y = slotY(it); seeded = true; }

      // ---- autoplay: swipe three away, then restore ----
      ghost.on = false;
      const auto = autoplay && !reduced && (!touched || (!ptr.inside && !drag && now - ptr.last > 4000));
      // a real pointer took over mid-swipe: let go of the card so its spring works again
      if (!auto && gdrag) gdrag = null;
      if (auto) {
        // the clock only runs between events, so each step starts fresh after the last hole closes
        if (hole.phase !== "none") gt = 0;
        gt += dt;
        const liveNow = items.filter((i) => i.state === "live");
        const deadNow = items.filter((i) => i.state === "dead");
        // too few left to swipe (the user cleared the list before the ghost resumed): go to restore
        if (gstep < autoSteps && liveNow.length <= 2) gstep = autoSteps;
        if (gstep < autoSteps && hole.phase === "none") {
          const target = liveNow[[1, 0, 2][gstep] % liveNow.length];
          const dir = gstep % 2 === 0 ? 1 : -1;
          // reach the card, press, swipe, let go
          const t = gt;
          const cy = target.y + CH / 2, cx = lx + lw * 0.45;
          ghost.on = true;
          if (gstep === 1) {
            // this time, hover and press the close button
            const bx = lx + lw - 22, by = cy;
            const e = Math.min(1, t / 0.8);
            ghost.x = bx - (1 - e) * 120; ghost.y = by + (1 - e) * 50;
            gdrag = target;
            if (t > 1.1) { gdrag = null; remove(target, 1, true); gstep++; gt = 0; }
          } else if (t < 0.6) { ghost.x = cx + (1 - t / 0.6) * 80; ghost.y = cy + (1 - t / 0.6) * 40; }
          else if (t < 1.2) {
            gdrag = target;
            const e = (t - 0.6) / 0.6;
            target.dx = dir * lw * 0.38 * e * e;
            ghost.x = cx + target.dx; ghost.y = cy;
          } else {
            if (gdrag) remove(gdrag, dir);
            gdrag = null;
            gstep++;
            gt = 0;
          }
        } else if (gstep >= autoSteps && hole.phase === "none" && gt > 1.6 && deadNow.length) {
          restore();
          gt = 0;
        } else if (gstep >= autoSteps && !deadNow.length && hole.phase === "none" && gt > 2.2) {
          gstep = 0; gt = 0;
        }
      }

      // ---- hole lifecycle ----
      hole.t += dt;
      if (hole.phase === "grow") {
        hole.rs += (hole.target - hole.rs) * Math.min(1, dt * 9);
        if (hole.t > 0.3) { hole.phase = "eat"; hole.t = 0; }
      } else if (hole.phase === "eat") {
        hole.rs = hole.target * (1 + 0.06 * Math.sin(time * 18));
        const busy = items.some((i) => i.state === "dying" || i.state === "restoring");
        if (!busy && hole.t > 0.2) { hole.phase = "collapse"; hole.t = 0; }
      } else if (hole.phase === "collapse") {
        hole.rs = hole.target * Math.max(0, 1 - hole.t / 0.22);
        if (hole.t > 0.22) {
          hole.phase = "none"; hole.rs = 0;
          flash = 1;
          ripple.x = hole.x; ripple.y = hole.y; ripple.r = 0; ripple.amp = hole.front ? 12 : 9;
          // the shockwave shoves the rest of the list, which then settles back into place
          for (const o of items) {
            if (o.state !== "live") continue;
            const dx = lx + lw / 2 - hole.x, dy = o.y + CH / 2 - hole.y, d = Math.hypot(dx, dy) || 1;
            const k = 420 / (1 + d / 90);
            o.vox += (dx / d) * k; o.voy += (dy / d) * k;
          }
          if (hole.white) sync();
        }
      }
      flash = Math.max(0, flash - dt * 3);
      if (ripple.amp > 0.01) { ripple.r += 520 * dt; ripple.amp *= Math.exp(-dt * 2.6); }

      // ---- items ----
      for (const it of items) {
        if (it.state === "live") {
          // tugged toward an open hole, harder the closer and bigger it is
          let tox = 0, toy = 0;
          if (hole.phase !== "none" && !hole.white && hole.rs > 1) {
            const dx = hole.x - (lx + lw / 2), dy = hole.y - (it.y + CH / 2), d = Math.hypot(dx, dy) || 1;
            const pull = Math.min(30, (hole.rs * hole.rs * (hole.front ? 1.5 : 0.9)) / Math.max(d, 40));
            tox = (dx / d) * pull; toy = (dy / d) * pull;
          }
          it.vox += ((tox - it.ox) * 150 - it.vox * 10) * dt;
          it.voy += ((toy - it.oy) * 150 - it.voy * 10) * dt;
          it.ox += it.vox * dt; it.oy += it.voy * dt;
          const ty = slotY(it);
          it.vy += ((ty - it.y) * 220 - it.vy * 22) * dt;
          it.y += it.vy * dt;
          if (!(drag && drag.it === it) && gdrag !== it) {
            it.vdx += (-it.dx * 260 - it.vdx * 24) * dt;
            it.dx += it.vdx * dt;
          }
        } else if (it.state === "dying" && hole.phase === "eat") {
          it.u = Math.min(1, it.u + dt / 1.0);
          if (it.u >= 1) it.state = "dead";
        } else if (it.state === "restoring" && hole.phase === "eat") {
          if (it.delay > 0) it.delay -= dt;
          else {
            it.u = Math.max(0, it.u - dt / 0.9);
            if (it.u <= 0) { it.state = "live"; it.y = slotY(it); it.vy = 0; }
          }
        }
      }

      // ---- draw the UI ----
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bgG = g.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, Math.max(w, h) * 0.8);
      bgG.addColorStop(0, "#13141c");
      bgG.addColorStop(1, "#06070a");
      g.fillStyle = bgG;
      g.fillRect(0, 0, w, h);
      for (const s of stars) {
        g.fillStyle = `rgba(255,255,255,${s.a})`;
        g.fillRect(s.x * w, s.y * h, s.r, s.r);
      }
      const hx = ghost.on ? ghost.x : ptr.x, hy = ghost.on ? ghost.y : ptr.y;
      for (const it of items) {
        if (it.state === "live") {
          const hover = !!(drag && drag.it === it) || gdrag === it || (hx >= lx + it.dx && hx <= lx + lw + it.dx && hy >= it.y && hy <= it.y + CH);
          g.save();
          g.translate(lx + it.dx + it.ox, it.y + it.oy);
          // a swiped card tilts and fades a little as it goes; a tugged one leans toward the hole
          g.translate(lw / 2, CH / 2);
          g.rotate(it.dx / lw * 0.12 + it.ox * 0.002 * Math.sign(hole.y - it.y - CH / 2 || 1));
          g.translate(-lw / 2, -CH / 2);
          g.globalAlpha = 1 - Math.min(0.4, Math.abs(it.dx) / lw);
          drawCard(it, hover);
          g.restore();
        } else if ((it.state === "dying" || it.state === "restoring") && hole.phase !== "none") {
          // spaghettified: stretched along the fall, squeezed across it, spiralling in
          const u = it.state === "dying" ? Math.pow(it.u, 1.5) : Math.pow(it.u, 1.2);
          if (it.state === "restoring" && it.delay > 0) continue;
          const inPlace = it.d0 < 2;
          const th = it.th0 + (it.state === "dying" ? 1 : -1) * u * Math.PI * (inPlace ? 2.8 : 2.2);
          const dist = it.d0 * Math.pow(1 - u, 1.3);
          const px = hole.x + Math.cos(th) * dist, py = hole.y + Math.sin(th) * dist;
          const sc = Math.max(0.02, Math.pow(1 - u, inPlace ? 1.25 : 0.9));
          g.save();
          g.translate(px, py);
          if (inPlace) {
            // swallowed where it sits: it twists up and is drawn down into the hole
            g.rotate(u * u * Math.PI * 2.8);
            g.scale(sc * (1 - 0.25 * u), sc * (1 - 0.1 * u));
          } else {
            g.rotate(th + Math.PI / 2);
            g.scale(sc * (1 - 0.6 * u), sc * (1 + 2.5 * u));
          }
          g.globalAlpha = Math.max(0, 1 - u * 0.6);
          g.translate(-lw / 2, -CH / 2);
          drawCard(it, false);
          g.restore();
          // glowing dust peeled off as it falls
          if (it.state === "dying") {
            const n = inPlace ? 3 : 1;
            for (let k = 0; k < n; k++) {
              if (Math.random() > 0.9) continue;
              const r0 = inPlace ? (lw * 0.5 * sc) * (0.4 + Math.random() * 0.6) : dist + (Math.random() - 0.5) * 30;
              dust.push({ a: inPlace ? Math.random() * Math.PI * 2 : th + (Math.random() - 0.5) * 0.6, d: r0, s: 0.6 + Math.random() * 1.6, life: 1 });
            }
          }
        }
      }
      // dust spirals in
      g.globalCompositeOperation = "lighter";
      for (const p of dust) {
        p.a += dt * (2 + 160 / Math.max(20, p.d));
        p.d -= dt * (60 + 2400 / Math.max(15, p.d));
        p.life -= dt * 0.9;
        if (p.d < 4) p.life = 0;
        if (p.life <= 0) continue;
        g.fillStyle = `rgba(255,${170 + Math.round(60 * p.life)},${110 + Math.round(80 * p.life)},${(p.life * 0.8).toFixed(2)})`;
        g.fillRect(hole.x + Math.cos(p.a) * p.d, hole.y + Math.sin(p.a) * p.d, p.s, p.s);
      }
      dust = dust.filter((p) => p.life > 0);
      g.globalCompositeOperation = "source-over";
      if (ghost.on) {
        g.fillStyle = "rgba(255,255,255,0.92)";
        g.beginPath(); g.arc(ghost.x, ghost.y, 5, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.5;
        g.beginPath(); g.arc(ghost.x, ghost.y, 11, 0, Math.PI * 2); g.stroke();
      }
      if (!useGL) {
        if (hole.rs > 0.5) {
          g.fillStyle = hole.white ? "#fff" : "#000";
          g.beginPath(); g.arc(hole.x, hole.y, hole.rs, 0, Math.PI * 2); g.fill();
        }
        return;
      }

      // ---- lens it ----
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, ui);
      gl!.uniform1i(U.uTex, 0);
      gl!.uniform2f(U.uRes, glc.width, glc.height);
      gl!.uniform1f(U.uDpr, dpr);
      gl!.uniform3f(U.uHole, hole.x, hole.y, hole.rs);
      gl!.uniform1f(U.uWhite, hole.white ? 1 : 0);
      gl!.uniform1f(U.uTime, time);
      gl!.uniform1f(U.uFlash, flash);
      const eating = items.find((i) => i.state === "dying");
      gl!.uniform1f(U.uSwirl, hole.white ? -0.8 : hole.front ? 0.8 + 2.4 * (eating ? Math.pow(eating.u, 0.8) : 1) : 0.6);
      gl!.uniform4f(U.uRipple, ripple.x, ripple.y, ripple.r, ripple.amp);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
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
      visible = false;
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      // Free the GL objects but keep the context itself: React StrictMode mounts twice on the same
      // canvas, and a lost context would be handed back to the second run.
      if (gl) {
        if (tex) gl.deleteTexture(tex);
        if (buf) gl.deleteBuffer(buf);
        if (prog) gl.deleteProgram(prog);
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
      }
    };
  }, [messages, autoplay]);

  return (
    <div
      ref={stageRef}
      className={cn("relative w-full touch-none select-none overflow-hidden rounded-[24px] bg-[#06070a]", className)}
      style={{ height, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, system-ui, sans-serif" }}
    >
      <canvas ref={uiRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <canvas ref={glRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 pt-6">
        <div className="pointer-events-auto flex w-full max-w-[460px] items-center justify-between">
          <p className="m-0 flex items-center gap-2 text-[20px] font-semibold tracking-[-0.02em] text-white">
            Inbox
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[12px] font-medium text-white/70">{live.length}</span>
          </p>
          <button
            type="button"
            onClick={() => api.current.restore()}
            disabled={live.length === messages.length}
            className="rounded-full border-0 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30"
          >
            Restore
          </button>
        </div>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-5 m-0 text-center text-[13px] text-white/45">Swipe a message away, or hover and press its close button.</p>
      <ul className="sr-only">
        {live.map((m) => (
          <li key={m.id}>
            {m.title}: {m.body}{" "}
            <button type="button" onClick={() => api.current.remove(m.id)}>
              Delete message from {m.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

--- components/black-hole-delete/index.ts ---

```ts
export { BlackHoleDelete } from "./black-hole-delete";
export type { BlackHoleDeleteProps, BlackHoleMessage } from "./black-hole-delete";
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
