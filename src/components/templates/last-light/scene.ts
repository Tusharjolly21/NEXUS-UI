/**
 * The Last Light scene engine: draws a picture as a field of characters, live, with WebGL 2.
 *
 * How it works, in short:
 *  1. The picture is read once. A glyph atlas is built from the page's own font (every mark in CHARS, measured for
 *     how much ink it carries) and a lookup table says, for every amount of light, which mark carries it.
 *  2. A fragment shader (shader.ts) turns every cell of the screen into one of those marks, colouring it from the
 *     picture and adding the scene's life: drifting cloud light, birds, fireflies, a lantern under the pointer.
 *  3. Bright cells turn over into lit tiles with a dark mark cut in, the way the pictures show skies and suns.
 *
 * Without WebGL 2 the same picture is drawn once with the 2D canvas, still in characters. With reduced motion the
 * scene is drawn once and never animates. Scenes outside the viewport stop drawing; the first scene draws itself in
 * on load, the others the first time they scroll into view.
 *
 * The page owns the DOM. This file only needs a host element (for size and pointer events) and its canvas.
 */
import { CHARS, GLYPH, type SceneConfig } from "./data";
import { VERTEX_SHADER, fragmentShader } from "./shader";

export type SceneMapping = {
  /** Where the picture sits inside the host, in CSS pixels. */
  x0: number;
  y0: number;
  dw: number;
  dh: number;
  /** The host's size in CSS pixels. */
  w: number;
  h: number;
};

export type SceneApi = {
  /** Hold the lantern over a point of the picture (u, v from 0 to 1), or let it go with null. */
  light: (u: number | null, v?: number) => void;
  /** Null until the picture and the font are ready. */
  mapping: () => SceneMapping | null;
  destroy: () => void;
};

export type SceneOptions = {
  cfg: SceneConfig;
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Called with a line such as "Drawn live in 31,416 characters" whenever the grid changes. */
  onCount?: (text: string) => void;
  /** Called when the host is resized or the picture first lands, so overlays can be re-placed. */
  onResize?: () => void;
};

type Atlas = { canvas: HTMLCanvasElement; n: number; cov: Float32Array; lut: Uint8Array };
type GlyphStyle = { sx: number; offX: Float32Array; offY: Float32Array; font: string };
type Pointer = { x: number; y: number; tx: number; ty: number; on: number; target: number; fade: number };

const FONT = (size: number) => `700 ${size}px "IBM Plex Mono", ui-monospace, Menlo, monospace`;

/** Resolves when the mono face is ready, or after 1.6 seconds, whichever is first: the page never waits on a font. */
function fontsReady(): Promise<void> {
  const load = document.fonts && document.fonts.load ? document.fonts.load('700 16px "IBM Plex Mono"') : Promise.resolve([]);
  return Promise.race([load.then(() => undefined), new Promise<void>((r) => setTimeout(r, 1600))]).catch(() => undefined);
}

export function createScene({ cfg, host, canvas: cv, onCount, onResize }: SceneOptions): SceneApi {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dead = false;
  const cleanups: Array<() => void> = [];
  let mappingFn: () => SceneMapping | null = () => null;
  let lightFn: SceneApi["light"] = () => {};

  const api: SceneApi = {
    light: (u, v) => lightFn(u, v),
    mapping: () => mappingFn(),
    destroy: () => {
      dead = true;
      for (const c of cleanups.splice(0)) c();
    },
  };

  const img = new Image();
  img.decoding = "async";
  img.src = cfg.src;
  const loaded: Promise<unknown> = img.decode ? img.decode().catch(() => new Promise((r) => (img.onload = r))) : new Promise((r) => (img.onload = r));
  Promise.all([loaded, fontsReady()]).then(() => {
    if (!dead) start();
  });
  return api;

  function start() {
    const IMG_W = cfg.w;
    const IMG_H = cfg.h;
    const A = IMG_W / IMG_H;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let cw = 8;
    let ch = 8;
    let cols = 0;
    let rows = 0;
    let atlas: Atlas | null = null;
    let style: GlyphStyle | null = null;
    const ptr: Pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, on: 0, target: 0, fade: 0.25 };
    // the first scene draws itself in on load; the others when they are first scrolled into view
    let last = performance.now();
    let time = 0;
    let intro = 99;
    let raf = 0;
    let running = false;
    let visible = cfg.id === 0;
    let seen = false;

    const sc = document.createElement("canvas");
    sc.width = IMG_W;
    sc.height = IMG_H;
    const sctx = sc.getContext("2d", { willReadFrequently: true });
    sctx?.drawImage(img, 0, 0, IMG_W, IMG_H);

    function buildAtlas() {
      const n = CHARS.length;
      const c = document.createElement("canvas");
      c.width = n * cw;
      c.height = ch;
      const x = c.getContext("2d", { willReadFrequently: true });
      if (!x) return;
      x.font = FONT(100);
      const M = x.measureText("M");
      const capH = (M.actualBoundingBoxAscent || 70) / 100;
      const mW = (M.actualBoundingBoxRight + M.actualBoundingBoxLeft || 54) / 100;
      // as tall as the row allows, no wider than the cell; in wide cells the letters are drawn a little wide
      const fs = Math.min((ch * cfg.cap) / capH, (cw * 0.86) / mW);
      const sx = Math.min(1.5, Math.max(1, (cw * 0.86) / (mW * fs)));
      x.font = FONT(fs);
      x.fillStyle = "#fff";
      x.textAlign = "left";
      x.textBaseline = "alphabetic";
      const offX = new Float32Array(n);
      const offY = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const m = x.measureText(CHARS[i]);
        const l = m.actualBoundingBoxLeft || 0;
        const r = m.actualBoundingBoxRight || 0;
        const asc = m.actualBoundingBoxAscent || 0;
        const dsc = m.actualBoundingBoxDescent || 0;
        offX[i] = cw / 2 - ((r - l) / 2) * sx;
        offY[i] = ch / 2 + (asc - dsc) / 2;
        x.setTransform(sx, 0, 0, 1, i * cw + offX[i], 0);
        x.fillText(CHARS[i], 0, offY[i]);
      }
      x.setTransform(1, 0, 0, 1, 0, 0);
      style = { sx, offX, offY, font: FONT(fs) };
      const data = x.getImageData(0, 0, c.width, c.height).data;
      const cov = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        let s = 0;
        for (let yy = 0; yy < ch; yy++) for (let xx = 0; xx < cw; xx++) s += data[(yy * c.width + i * cw + xx) * 4 + 3];
        cov[i] = s / (cw * ch * 255);
      }
      const order = [...Array(n).keys()].sort((a, b) => cov[a] - cov[b]);
      // for every coverage from 0 to 1, the nearest mark and the next nearest, for a little variety
      const lut = new Uint8Array(256 * 4);
      for (let t = 0; t < 256; t++) {
        const target = t / 255;
        let j = 0;
        let best = 9;
        for (let k = 0; k < n; k++) {
          const d = Math.abs(cov[order[k]] - target);
          if (d < best) {
            best = d;
            j = k;
          }
        }
        const a2 = j === 0 ? 1 : j === n - 1 ? n - 2 : Math.abs(cov[order[j - 1]] - target) < Math.abs(cov[order[j + 1]] - target) ? j - 1 : j + 1;
        lut[t * 4] = order[j];
        lut[t * 4 + 1] = order[a2];
        lut[t * 4 + 2] = Math.round(cov[order[j]] * 255);
        lut[t * 4 + 3] = Math.round(cov[order[a2]] * 255);
      }
      atlas = { canvas: c, n, cov, lut };
    }

    // the lit tile at a scale s in 0..1: its size, corner and the share of the cell it covers
    function tileAt(s: number) {
      const w = s * cfg.tile[0] * cw;
      const h = s * cfg.tile[1] * ch;
      const r = Math.min(w, h) * 0.5 * cfg.tile[2];
      return { w, h, r, cov: (w * h - (4 - Math.PI) * r * r) / (cw * ch) };
    }

    /**
     * Where the picture sits, in device pixels. Bands show the whole picture (or crop its sides on narrow screens).
     * The hero covers the screen on wide screens, held a little above centre so the peak stays in frame; on tall
     * screens it fills the top, wide enough to keep both the sun and the rider, and the grass dissolves below.
     */
    function mapping() {
      if (cfg.fit === "hero" && W / H < 1.05) {
        const dh = Math.min(H, Math.max(W / A, H * 0.62, (W * 1.9) / A));
        const dw = dh * A;
        const x0 = Math.min(0, Math.max(W - dw, W / 2 - 0.4 * dw));
        return { x0, y0: 0, dw, dh };
      }
      const dw = Math.max(W, H * A);
      const dh = dw / A;
      const fx = cfg.fx ?? 0.5;
      const fy = cfg.fit === "hero" ? (W / H > A ? 0.3 : 0.5) : (cfg.fy ?? 0.5);
      return { x0: (W - dw) * fx, y0: (H - dh) * fy, dw, dh };
    }

    // ───────────── WebGL 2 ─────────────
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vbuf: WebGLBuffer | null = null;
    const U: Record<string, WebGLUniformLocation | null> = {};
    const tex: { src?: WebGLTexture; atlas?: WebGLTexture; lut?: WebGLTexture; cov?: WebGLTexture } = {};

    function makeTexture(
      g: WebGL2RenderingContext,
      unit: number,
      w: number,
      h: number,
      fmt: number,
      ifmt: number,
      data: Uint8Array,
      filter: number,
    ) {
      const x = g.createTexture();
      g.activeTexture(g.TEXTURE0 + unit);
      g.bindTexture(g.TEXTURE_2D, x);
      g.pixelStorei(g.UNPACK_ALIGNMENT, 1);
      g.texImage2D(g.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, g.UNSIGNED_BYTE, data);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, filter);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, filter);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      return x;
    }

    function initGL() {
      try {
        gl = cv.getContext("webgl2", { antialias: false, alpha: false, premultipliedAlpha: false });
        if (!gl) return false;
        const g = gl;
        const compile = (type: number, src: string) => {
          const s = g.createShader(type);
          if (!s) throw new Error("no shader");
          g.shaderSource(s, src);
          g.compileShader(s);
          if (!g.getShaderParameter(s, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(s) ?? "shader error");
          return s;
        };
        program = g.createProgram();
        g.attachShader(program, compile(g.VERTEX_SHADER, VERTEX_SHADER));
        g.attachShader(program, compile(g.FRAGMENT_SHADER, fragmentShader(cfg, GLYPH)));
        g.bindAttribLocation(program, 0, "p");
        g.linkProgram(program);
        if (!g.getProgramParameter(program, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(program) ?? "link error");
        g.useProgram(program);
        vbuf = g.createBuffer();
        g.bindBuffer(g.ARRAY_BUFFER, vbuf);
        g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
        g.enableVertexAttribArray(0);
        g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
        for (const n of ["uSrc", "uAtlas", "uLut", "uCov", "uRes", "uCell", "uMap", "uT", "uIntro", "uMotion", "uN", "uAspect", "uLensR", "uDiag", "uPtr", "uOrigin", "uSun", "uSunR", "uTileMax", "uDpr", "uInvT"]) {
          U[n] = g.getUniformLocation(program, n);
        }
        const srcTex = g.createTexture();
        if (!srcTex) throw new Error("no texture");
        tex.src = srcTex;
        g.activeTexture(g.TEXTURE0);
        g.bindTexture(g.TEXTURE_2D, srcTex);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);
        return true;
      } catch {
        gl = null;
        return false;
      }
    }

    function uploadAtlas() {
      const g = gl;
      const a = atlas;
      if (!g || !a) return;
      const x = a.canvas.getContext("2d")?.getImageData(0, 0, a.canvas.width, a.canvas.height).data;
      if (!x) return;
      const r = new Uint8Array(a.canvas.width * a.canvas.height);
      for (let i = 0; i < r.length; i++) r[i] = x[i * 4 + 3];
      for (const k of ["atlas", "lut", "cov"] as const) {
        const t = tex[k];
        if (t) g.deleteTexture(t);
      }
      tex.atlas = makeTexture(g, 1, a.canvas.width, a.canvas.height, g.RED, g.R8, r, g.NEAREST) ?? undefined;
      tex.lut = makeTexture(g, 2, 256, 1, g.RGBA, g.RGBA8, a.lut, g.NEAREST) ?? undefined;
      const cb = new Uint8Array(a.n);
      for (let i = 0; i < a.n; i++) cb[i] = Math.round(a.cov[i] * 255);
      tex.cov = makeTexture(g, 3, a.n, 1, g.RED, g.R8, cb, g.NEAREST) ?? undefined;
    }

    function drawGL() {
      const g = gl;
      if (!g || !atlas) return;
      const M = mapping();
      g.viewport(0, 0, cv.width, cv.height);
      g.uniform1i(U.uSrc, 0);
      g.uniform1i(U.uAtlas, 1);
      g.uniform1i(U.uLut, 2);
      g.uniform1i(U.uCov, 3);
      g.uniform2f(U.uRes, cv.width, cv.height);
      g.uniform2f(U.uCell, cw, ch);
      g.uniform4f(U.uMap, -M.x0 / M.dw, -M.y0 / M.dh, 1 / M.dw, 1 / M.dh);
      g.uniform1f(U.uT, reduce ? 9 : time); // a still frame keeps the birds mid-sky
      g.uniform1f(U.uIntro, intro);
      g.uniform1f(U.uMotion, reduce ? 0 : 1);
      g.uniform1f(U.uN, atlas.n);
      g.uniform1f(U.uAspect, A);
      g.uniform1f(U.uLensR, cfg.lamp * dpr);
      g.uniform1f(U.uDiag, Math.hypot(W, H));
      g.uniform3f(U.uPtr, ptr.x, ptr.y, reduce ? 0 : ptr.on);
      g.uniform2f(U.uOrigin, M.x0 + cfg.sun[0] * M.dw, M.y0 + cfg.sun[1] * M.dh);
      g.uniform2f(U.uSun, cfg.sun[0], cfg.sun[1]);
      g.uniform1f(U.uSunR, cfg.sunR);
      g.uniform1f(U.uTileMax, tileAt(1).cov);
      g.uniform1f(U.uDpr, dpr);
      g.uniform1f(U.uInvT, cfg.invT);
      g.drawArrays(g.TRIANGLES, 0, 3);
    }

    // ───────────── plain fallback: the same picture in characters, drawn once with the 2D canvas ─────────────
    function drawPlain() {
      const x = cv.getContext("2d");
      if (!x || !sctx || !atlas || !style) return;
      const at = atlas;
      const st = style;
      const M = mapping();
      const px = sctx.getImageData(0, 0, IMG_W, IMG_H).data;
      const L = (v: number) => Math.pow(v / 255, 2.2);
      const toS = (a: number[]) => `rgb(${a.map((q) => Math.round(Math.pow(Math.min(1, q), 1 / 2.2) * 255)).join(",")})`;
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.fillStyle = "#0c030b";
      x.fillRect(0, 0, W, H);
      x.font = st.font;
      x.textAlign = "left";
      x.textBaseline = "alphabetic";
      const tmax = tileAt(1).cov;
      const hash = (a: number, b: number) => {
        const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
        return s - Math.floor(s);
      };
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const u = ((c + 0.5) * cw - M.x0) / M.dw;
          const v = ((r + 0.5) * ch - M.y0) / M.dh;
          const ix = Math.min(IMG_W - 1, Math.max(0, Math.floor(u * IMG_W)));
          const iy = Math.min(IMG_H - 1, Math.max(0, Math.floor(v * IMG_H)));
          const i = (iy * IMG_W + ix) * 4;
          const fade = cfg.fit === "hero" ? 1 - Math.min(1, Math.max(0, (v - 0.95) / 0.14)) : 1;
          const S = [L(px[i]) * fade, L(px[i + 1]) * fade, L(px[i + 2]) * fade];
          const m = Math.max(...S, 1e-5);
          const pb = Math.pow(m, 1 / 2.2);
          const P = Math.pow(1 - Math.pow(1 - Math.min(1, pb), 3.4), 2.2);
          const need = m / Math.max(P, 1e-5);
          const inv = need > cfg.invT + (hash(c, r) - 0.5) * (cfg.letters ? 0.04 : 0.12);
          let t = need;
          if (inv) t = cfg.letters ? Math.min(0.3, Math.max(0.14, 0.14 + (1 - need) * 0.22)) : Math.min(0.14, Math.max(0.04, (1 - need) * 0.2));
          t = Math.min(1, Math.max(0, t));
          const e = inv && !cfg.letters ? (t < 0.078 ? 1 : t < 0.12 ? 2 : 3) : at.lut[Math.round(t * 255) * 4];
          const cov = at.cov[e];
          let cc = Math.min(0.95, Math.max(0.01, cov));
          let tl: ReturnType<typeof tileAt> | null = null;
          if (inv) {
            tl = tileAt(cfg.letters ? 1 : Math.max(Math.sqrt(Math.min(1, (need + cov) / tmax)), 0.45));
            cc = Math.min(0.95, Math.max(0.02, tl.cov - cov));
          }
          const k = Math.min(P, m / cc) / m;
          const lit = S.map((q) => q * k);
          const rest = S.map((q, j) => Math.max(Math.max(q - lit[j] * cc, 0) / (1 - cc), q * (inv ? 0.06 : 0.04)));
          x.fillStyle = toS(rest);
          x.fillRect(c * cw, r * ch, cw, ch);
          if (tl) {
            x.fillStyle = toS(lit);
            x.beginPath();
            const bx = c * cw + (cw - tl.w) / 2;
            const by = r * ch + (ch - tl.h) / 2;
            if (x.roundRect) x.roundRect(bx, by, tl.w, tl.h, tl.r);
            else x.rect(bx, by, tl.w, tl.h);
            x.fill();
          }
          if (CHARS[e] !== " ") {
            x.fillStyle = toS(inv ? rest : lit);
            x.setTransform(st.sx, 0, 0, 1, c * cw + st.offX[e], r * ch);
            x.fillText(CHARS[e], 0, st.offY[e]);
            x.setTransform(1, 0, 0, 1, 0, 0);
          }
        }
      }
    }

    function resize() {
      const r = host.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      cv.width = w;
      cv.height = h;
      W = w;
      H = h;
      // the picture's own grid: as many characters across the picture as it has
      const M0 = mapping();
      const cssCell = Math.min(9.5, Math.max(5.2, M0.dw / dpr / cfg.cols));
      const nc = Math.max(4, Math.round(cssCell * dpr));
      const nh = Math.max(4, Math.round(nc * cfg.cell));
      const changed = nc !== cw || nh !== ch || !atlas;
      cw = nc;
      ch = nh;
      cols = Math.ceil(W / cw);
      rows = Math.ceil(H / ch);
      if (changed) {
        buildAtlas();
        if (gl) uploadAtlas();
      }
      onCount?.(`Drawn live in ${(cols * rows).toLocaleString("en-US")} characters`);
      mappingFn = () => {
        const M = mapping();
        return { x0: M.x0 / dpr, y0: M.y0 / dpr, dw: M.dw / dpr, dh: M.dh / dpr, w: W / dpr, h: H / dpr };
      };
      if (!gl) drawPlain();
      else if (!running) drawGL();
      onResize?.();
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      if (intro < 99) intro += dt;
      ptr.on += (ptr.target - ptr.on) * (1 - Math.exp(-dt / ptr.fade));
      const k = ptr.on < 0.02 ? 1 : 1 - Math.exp(-dt / 0.08);
      ptr.x += (ptr.tx - ptr.x) * k;
      ptr.y += (ptr.ty - ptr.y) * k;
      drawGL();
      raf = requestAnimationFrame(frame);
    }
    function play() {
      if (running || reduce || !gl || !visible || document.hidden || dead) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const useGL = initGL();
    if (cfg.id === 0 && !reduce) intro = 0;
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(host);
    cleanups.push(() => ro.disconnect());

    if (useGL) {
      if (reduce) drawGL();
      else play();
      const onVis = () => (document.hidden ? pause() : play());
      document.addEventListener("visibilitychange", onVis);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVis));
      // only scenes on screen are drawn; a band draws itself in the first time it is scrolled into view
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (es) => {
            for (const e of es) {
              visible = e.isIntersecting;
              if (visible && !seen && cfg.id !== 0 && !reduce && e.intersectionRatio > 0.2) {
                seen = true;
                intro = 0;
              }
              if (visible) play();
              else pause();
            }
          },
          { threshold: [0, 0.25] },
        );
        io.observe(host);
        cleanups.push(() => io.disconnect());
      } else {
        visible = true;
        play();
      }
    }

    // the pointer carries a light; a tap leaves one where you touched, which slowly goes out
    const setPtr = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      ptr.tx = (e.clientX - r.left) * dpr;
      ptr.ty = (e.clientY - r.top) * dpr;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setPtr(e);
      ptr.fade = 0.25;
      ptr.target = 1;
    };
    const onLeave = () => (ptr.target = 0);
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      setPtr(e);
      ptr.x = ptr.tx;
      ptr.y = ptr.ty;
      ptr.on = 1;
      ptr.fade = 1.1;
      ptr.target = 0;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    cleanups.push(() => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    });

    // other parts of the page can hold the light over a point of the picture (u, v), or let it go
    lightFn = (u, v = 0) => {
      if (u == null) {
        ptr.target = 0;
        return;
      }
      const M = mapping();
      ptr.tx = M.x0 + u * M.dw;
      ptr.ty = M.y0 + v * M.dh;
      if (ptr.on < 0.02) {
        ptr.x = ptr.tx;
        ptr.y = ptr.ty;
      }
      ptr.fade = 0.3;
      ptr.target = 1;
    };

    cleanups.push(() => {
      pause();
      const g = gl;
      if (g) {
        for (const t of [tex.src, tex.atlas, tex.lut, tex.cov]) if (t) g.deleteTexture(t);
        if (vbuf) g.deleteBuffer(vbuf);
        if (program) g.deleteProgram(program);
      }
    });
    onResize?.();
  }
}
