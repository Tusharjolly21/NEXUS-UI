/**
 * Gives GPU contexts back when previews leave the page.
 *
 * About thirty previews draw with WebGL, and most of them never release their context when they unmount; the
 * browser only frees it whenever garbage collection gets round to the canvas. A phone allows a handful of live
 * contexts at once (iOS Safari is the strictest), so scrolling a long wall used to pile up contexts until a new
 * preview's `getContext` came back empty, that preview threw, and the page went down with it.
 *
 * This records every WebGL context a canvas creates (weakly, so nothing is kept alive) and, when asked, loses the
 * ones whose canvas has left the document. A context only counts once its canvas has been seen in the document,
 * so a canvas a component keeps off-screen on purpose is never touched.
 */

type GL = WebGLRenderingContext | WebGL2RenderingContext;
type Entry = { canvas: WeakRef<HTMLCanvasElement>; gl: WeakRef<GL>; seen: boolean };

const entries = new Set<Entry>();
let installed = false;

function isGL(ctx: unknown): ctx is GL {
  return (
    (typeof WebGLRenderingContext !== "undefined" && ctx instanceof WebGLRenderingContext) ||
    (typeof WebGL2RenderingContext !== "undefined" && ctx instanceof WebGL2RenderingContext)
  );
}

function install() {
  if (installed || typeof window === "undefined" || typeof WeakRef === "undefined" || typeof HTMLCanvasElement === "undefined") return;
  installed = true;
  const original = HTMLCanvasElement.prototype.getContext;
  const known = new WeakSet<object>();
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
    const ctx = original.apply(this, args);
    if (ctx && !known.has(ctx) && isGL(ctx)) {
      known.add(ctx);
      entries.add({ canvas: new WeakRef(this), gl: new WeakRef(ctx), seen: this.isConnected });
    }
    return ctx;
  } as typeof original;
}

/** Start recording contexts. Safe to call many times. */
export function watchWebGL() {
  install();
}

/** Lose every recorded context whose canvas was on the page and no longer is. */
export function releaseDetachedWebGL() {
  for (const e of entries) {
    const canvas = e.canvas.deref();
    const gl = e.gl.deref();
    if (!canvas || !gl) {
      entries.delete(e);
      continue;
    }
    if (canvas.isConnected) {
      e.seen = true;
      continue;
    }
    if (!e.seen) continue;
    entries.delete(e);
    try {
      if (!gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      /* already gone */
    }
  }
}

let pending = 0;

/** Sweep shortly after React has finished removing what left the screen. Calls close together share one sweep. */
export function scheduleWebGLSweep(delay = 400) {
  if (typeof window === "undefined" || pending) return;
  pending = window.setTimeout(() => {
    pending = 0;
    releaseDetachedWebGL();
  }, delay);
}
