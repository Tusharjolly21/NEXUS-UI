"use client";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import Matter from "matter-js";
import { useSound, type SoundName } from "@/lib/ui-sounds";

const TAGS = ["Design", "Motion", "Typography", "3D", "Photography", "AI", "Music", "Startups", "Travel", "Coffee", "Gaming", "Writing", "Code", "Film", "Architecture", "Fitness"];
const STEP = 1000 / 60;
const PW = 340, PH = 260, TH = 36;
const SEP = "\u0000";
/** A random kick in [-s/2, s/2]; only ever called from event handlers and timers. */
const jitter = (s: number) => (Math.random() - 0.5) * s;

type PillBody = Matter.Body & { w: number };

export interface TagPitProps {
  /** The interests to pick from. Each one becomes a physical pill in the tray. */
  tags?: string[];
  /** How many picks unlock the Continue button. */
  min?: number;
  /** Colour of picked pills, the picked chips and the Continue button (6-digit hex). */
  accent?: string;
  /** Picks a few tags and shakes the tray by itself until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/**
 * An interests picker where the options are real objects. Tags drop into a
 * tray as physical pills: grab and throw them, shake the tray, tap one to
 * pick it and it hops up and lights. Every pill is still a real button, so
 * keyboard and screen readers get a plain toggle list.
 */
export function TagPit({ tags = TAGS, min = 3, accent = "#0071e3", autoplay = false, enableSound = true }: TagPitProps) {
  const play = useSound(enableSound);
  const pit = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLButtonElement | null)[]>([]);
  const bodies = useRef<Matter.Body[]>([]);
  const engine = useRef<Matter.Engine | null>(null);
  const grab = useRef<{ c: Matter.Constraint; i: number; x: number; y: number; moved: boolean } | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const pickedRef = useRef<number[]>([]);
  const tray = useAnimationControls();
  const touched = useRef(false);
  const reduce = useReducedMotion();
  const [k, setK] = useState(1);
  // A stable key so an inline `tags` array doesn't rebuild the world on every render.
  const tagKey = tags.join(SEP);

  useEffect(() => {
    const el = pit.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setK(el.offsetWidth / PW));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = pit.current;
    if (!el) return;
    const list = tagKey ? tagKey.split(SEP) : [];
    const e = Matter.Engine.create({ gravity: { x: 0, y: 1.1 } });
    engine.current = e;
    const wall = { isStatic: true, friction: 0.4, restitution: 0.2 };
    Matter.Composite.add(e.world, [
      Matter.Bodies.rectangle(PW / 2, PH + 30, PW * 2, 60, wall),
      Matter.Bodies.rectangle(-30, PH / 2 - 200, 60, PH + 400, wall),
      Matter.Bodies.rectangle(PW + 30, PH / 2 - 200, 60, PH + 400, wall),
      Matter.Bodies.rectangle(PW / 2, -350, PW * 2, 60, wall),
    ]);
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";
    bodies.current = list.map((t, i) => {
      const w = Math.ceil(ctx ? ctx.measureText(t).width : t.length * 8) + 34;
      const b = Matter.Bodies.rectangle(w / 2 + 4 + ((i * 97) % (PW - w - 8)), -40 - i * 16, w, TH, { chamfer: { radius: TH / 2 - 0.5 }, restitution: 0.35, friction: 0.3, frictionAir: 0.012, density: 0.002 }) as PillBody;
      Matter.Body.setAngle(b, ((i % 5) - 2) * 0.2);
      b.w = w;
      return b;
    });
    Matter.Composite.add(e.world, bodies.current);

    let raf = 0, acc = 0, last = performance.now();
    let running = false, onScreen = false;
    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      // Fixed 60 Hz steps so slow frames don't turn into slow motion.
      acc += Math.min(100, now - last);
      last = now;
      for (let n = 0; acc >= STEP && n < 4; n++) { Matter.Engine.update(e, STEP); acc -= STEP; }
      if (acc > STEP) acc = 0;
      bodies.current.forEach((b, i) => {
        const pill = els.current[i];
        if (!pill) return;
        const w = (b as PillBody).w;
        pill.style.width = `${w}px`;
        pill.style.transform = `translate(${b.position.x - w / 2}px, ${b.position.y - TH / 2}px) rotate(${b.angle}rad)`;
      });
    };
    // Only simulate while the tray is on screen and the tab is visible.
    const start = () => {
      if (running || !onScreen || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(el);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      grab.current = null;
      Matter.Engine.clear(e);
      Matter.Composite.clear(e.world, false);
      bodies.current = [];
      if (engine.current === e) engine.current = null;
    };
  }, [tagKey]);

  const local = (cx: number, cy: number) => {
    const r = pit.current!.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * PW, y: ((cy - r.top) / r.height) * PH };
  };

  const hop = (i: number, up = true) => {
    const b = bodies.current[i];
    if (!b) return;
    Matter.Body.setVelocity(b, { x: jitter(3), y: up ? -6.5 : -2.5 });
    Matter.Body.setAngularVelocity(b, jitter(0.3));
  };
  const toggle = (i: number, jump = true) => {
    const p = pickedRef.current;
    const on = p.includes(i);
    if (jump) hop(i, !on);
    pickedRef.current = on ? p.filter((x) => x !== i) : [...p, i];
    setPicked(pickedRef.current);
  };
  // Picking a pill pops; putting it back ticks. `say` is play for the visitor's own picks, play.auto for autoplay.
  const cue = (i: number, say: (name: SoundName, volume?: number) => void = play) => (pickedRef.current.includes(i) ? say("tick", 0.5) : say("pop", 0.6));
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  }, [play]);
  const shake = () => {
    if (!reduce) void tray.start({ x: [0, -10, 9, -7, 5, -2, 0], rotate: [0, -1.2, 1, -0.6, 0.4, 0], transition: { duration: 0.6 } });
    bodies.current.forEach((b) => {
      Matter.Body.setVelocity(b, { x: (Math.random() - 0.5) * 7, y: -3 - Math.random() * 4.5 });
      Matter.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.4);
    });
  };

  const down = (i: number, ev: RPointerEvent<HTMLButtonElement>) => {
    touched.current = true;
    const e = engine.current;
    const b = bodies.current[i];
    if (!e || !b) return;
    ev.preventDefault(); // no text selection while dragging
    ev.currentTarget.setPointerCapture(ev.pointerId);
    const p = local(ev.clientX, ev.clientY);
    const c = Matter.Constraint.create({ pointA: p, bodyB: b, pointB: { x: p.x - b.position.x, y: p.y - b.position.y }, stiffness: 0.12, damping: 0.08, length: 0 });
    Matter.Composite.add(e.world, c);
    grab.current = { c, i, x: ev.clientX, y: ev.clientY, moved: false };
  };
  const move = (ev: RPointerEvent) => {
    const g = grab.current;
    if (!g) return;
    if (Math.hypot(ev.clientX - g.x, ev.clientY - g.y) > 5) g.moved = true;
    g.c.pointA = local(ev.clientX, ev.clientY);
  };
  const up = () => {
    const g = grab.current;
    if (!g || !engine.current) return;
    Matter.Composite.remove(engine.current.world, g.c);
    grab.current = null;
    if (!g.moved) {
      cue(g.i);
      toggle(g.i);
    }
  };
  // Pointer taps are handled in up(); this catches keyboard and assistive-tech clicks.
  const click = (i: number, e: MouseEvent) => {
    if (e.detail === 0) {
      touched.current = true;
      cue(i);
      toggle(i);
    }
  };

  useEffect(() => {
    if (!autoplay) return;
    const seq = [1, 3, 0, "shake", 5, 1, "shake"] as const;
    let n = 0;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      const s = seq[n++ % seq.length];
      // Reduced motion: still demo the picking, but nothing gets thrown or shaken.
      if (s === "shake") {
        if (!reduce) shake();
      } else {
        cue(s, playRef.current.auto);
        toggle(s, !reduce);
      }
    }, 1500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const ready = picked.length >= min;
  return (
    <div
      className="w-[380px] max-w-full select-none rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] [--tp-pill-bg:#ffffff] [--tp-pill-fg:#1d1d1f] [--tp-pill-shadow:0_1px_2px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] dark:[--tp-pill-bg:#2c2c2e] dark:[--tp-pill-fg:#f5f5f7] dark:[--tp-pill-shadow:0_1px_2px_rgba(0,0,0,.5),0_0_0_1px_rgba(255,255,255,.08)]"
      style={{ "--tp-accent": accent } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">What are you into?</h3>
          <p className="m-0 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Pick {min} or more. Throw the rest around.</p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92, rotate: -8 }}
          onClick={() => { touched.current = true; shake(); }}
          className="flex h-8 flex-none items-center gap-1.5 rounded-full bg-[#f0f0f3] px-3 text-[12px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M3 6c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity=".4" /></svg>
          Shake
        </motion.button>
      </div>

      <motion.div
        ref={pit}
        animate={tray}
        className="relative mt-4 w-full touch-none select-none overflow-hidden rounded-[18px] bg-[#f5f5f7] shadow-[inset_0_2px_6px_rgba(0,0,0,.08),inset_0_-1px_0_rgba(255,255,255,.8)] dark:bg-[#000000] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,.6),inset_0_-1px_0_rgba(255,255,255,.06)]"
        style={{ aspectRatio: `${PW} / ${PH}` }}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="group"
        aria-label="Interests"
      >
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: PW, height: PH, transform: `scale(${k})` }}>
          {tags.map((t, i) => {
            const on = picked.includes(i);
            return (
              <button
                key={t}
                ref={(el) => {
                  els.current[i] = el;
                }}
                type="button"
                aria-pressed={on}
                onPointerDown={(ev) => down(i, ev)}
                onClick={(ev) => click(i, ev)}
                className="absolute left-0 top-0 flex cursor-grab items-center justify-center whitespace-nowrap rounded-full text-[14px] font-semibold outline-none transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 active:cursor-grabbing dark:focus-visible:ring-offset-black"
                style={{
                  height: TH,
                  background: on ? accent : "var(--tp-pill-bg)",
                  color: on ? "#ffffff" : "var(--tp-pill-fg)",
                  boxShadow: on ? `0 6px 16px -6px ${accent}aa, inset 0 1px 0 rgba(255,255,255,.25)` : "var(--tp-pill-shadow)",
                  transform: "translate(-200px,-200px)",
                }}
              >
                {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className="-ml-0.5 mr-1" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                {t}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex h-7 min-w-0 flex-1 items-center gap-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {picked.length === 0 ? (
              <motion.span key="none" className="text-[13px] text-[#86868b] dark:text-[#8e8e93]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Nothing picked yet</motion.span>
            ) : (
              picked.slice(-4).map((i) => (
                <motion.span
                  key={i}
                  layout
                  className="flex-none rounded-full bg-[color-mix(in_srgb,var(--tp-accent)_8%,transparent)] px-2.5 py-1 text-[12px] font-medium text-[var(--tp-accent)] dark:bg-[color-mix(in_srgb,var(--tp-accent)_24%,transparent)] dark:text-[color-mix(in_srgb,var(--tp-accent)_55%,white)]"
                  initial={{ opacity: 0, y: -14, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                >
                  {tags[i]}
                </motion.span>
              ))
            )}
          </AnimatePresence>
          {picked.length > 4 && <span className="flex-none text-[12px] text-[#86868b] dark:text-[#8e8e93]">+{picked.length - 4}</span>}
        </div>
        <motion.button
          type="button"
          disabled={!ready}
          whileTap={ready ? { scale: 0.95 } : undefined}
          className="h-9 flex-none rounded-full bg-[#e8e8ed] px-4 text-[13px] font-semibold text-[#86868b] outline-none transition-[background-color,color] duration-300 focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#2c2c2e] dark:text-[#8e8e93] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
          style={ready ? { backgroundColor: accent, color: "#ffffff" } : undefined}
        >
          {ready ? "Continue" : `${picked.length}/${min}`}
        </motion.button>
      </div>
    </div>
  );
}
