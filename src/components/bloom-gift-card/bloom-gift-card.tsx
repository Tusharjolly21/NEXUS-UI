"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type BloomGiftCardProps = {
  amount?: number;
  currency?: string;
  to?: string;
  from?: string;
  brand?: string;
  /** Last four of the card number. */
  last4?: string;
  /** How long to hold, in seconds. */
  holdFor?: number;
  onClaim?: () => void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor + Framework7 (via Iconify), inlined
const ICON: Record<"sparkle" | "done" | "gift", { vb: number; body: string }> = {
  sparkle: { vb: 256, body: "<path fill=\"currentColor\" d=\"M208 144a15.78 15.78 0 0 1-10.42 14.94L146 178l-19 51.62a15.92 15.92 0 0 1-29.88 0L78 178l-51.62-19a15.92 15.92 0 0 1 0-29.88L78 110l19-51.62a15.92 15.92 0 0 1 29.88 0L146 110l51.62 19A15.78 15.78 0 0 1 208 144m-56-96h16v16a8 8 0 0 0 16 0V48h16a8 8 0 0 0 0-16h-16V16a8 8 0 0 0-16 0v16h-16a8 8 0 0 0 0 16m88 32h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16\"/>" },
  done: { vb: 56, body: "<path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M28 52C14.745 52 4 41.255 4 28S14.745 4 28 4s24 10.745 24 24s-10.745 24-24 24m10.788-32.07a1.714 1.714 0 0 0-2.425 0L25.43 30.867a1.716 1.716 0 0 1-2.425 0l-3.22-3.221a1.714 1.714 0 0 0-2.425 2.424l5.645 5.645c.67.67 1.755.67 2.425 0l13.359-13.359c.67-.67.67-1.755 0-2.424\"/>" },
  gift: { vb: 256, body: "<path fill=\"currentColor\" d=\"M216 72h-35.08c.39-.33.79-.65 1.17-1A29.53 29.53 0 0 0 192 49.57A32.62 32.62 0 0 0 158.44 16A29.53 29.53 0 0 0 137 25.91a55 55 0 0 0-9 14.48a55 55 0 0 0-9-14.48A29.53 29.53 0 0 0 97.56 16A32.62 32.62 0 0 0 64 49.57A29.53 29.53 0 0 0 73.91 71c.38.33.78.65 1.17 1H40a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16v64a16 16 0 0 0 16 16h60a4 4 0 0 0 4-4v-92H40V88h80v32h16V88h80v32h-80v92a4 4 0 0 0 4 4h60a16 16 0 0 0 16-16v-64a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16M84.51 59a13.7 13.7 0 0 1-4.5-10a16.62 16.62 0 0 1 16.58-17h.49a13.7 13.7 0 0 1 10 4.5c8.39 9.48 11.35 25.2 12.39 34.92C109.71 70.39 94 67.43 84.51 59m87 0c-9.49 8.4-25.24 11.36-35 12.4C137.7 60.89 141 45.5 149 36.51a13.7 13.7 0 0 1 10-4.5h.49A16.62 16.62 0 0 1 176 49.08a13.7 13.7 0 0 1-4.51 9.92Z\"/>" },
};

const STOP = Symbol("stop");
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// three rings of petals plus sepals; tilt is degrees from lying flat (−90 = standing up, beyond leans over the middle)
type Ring = { n: number; len: number; w: number; r0: number; closed: number; open: number; start: number; off: number; tone: [string, string, string] };
const RINGS: Ring[] = [
  { n: 6, len: 34, w: 30, r0: 12, closed: -58, open: -4, start: -0.02, off: 30, tone: ["#3f9b55", "#2b7a3f", "#1f5f30"] }, // sepals
  { n: 8, len: 74, w: 62, r0: 12, closed: -104, open: -8, start: 0, off: 0, tone: ["#ffc3d5", "#ff86ad", "#d9417a"] },
  { n: 7, len: 60, w: 52, r0: 9, closed: -124, open: -26, start: 0.12, off: 22, tone: ["#ffd3e1", "#ff9cbf", "#e45689"] },
  { n: 5, len: 44, w: 40, r0: 6, closed: -152, open: -52, start: 0.26, off: 9, tone: ["#ffe1ea", "#ffb2cc", "#ee6e9c"] },
];

/**
 * A gift card with a flower bud on it. Tilt it with the pointer; press and hold to open it and the bud
 * swells and trembles, then blooms in 3D, petal ring by petal ring, to show the amount in the middle with
 * a puff of pollen. Let go early and it closes up again. Keyboard: hold Space or Enter on the button.
 */
export function BloomGiftCard({
  amount = 50,
  currency = "$",
  to = "Sam",
  from = "Maya",
  brand = "Petal & Co.",
  last4 = "2948",
  holdFor = 1.3,
  onClaim,
  autoplay = false,
  className = "",
}: BloomGiftCardProps) {
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const onClaimRef = useRef(onClaim);
  onClaimRef.current = onClaim;

  const [W, setW] = useState(340);
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const k = W / 340;

  // ─── tilt ───
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [11, -11]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-14, 14]), { stiffness: 180, damping: 18 });
  const shake = useMotionValue(0);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(60% 70% at ${glareX} ${glareY}, rgba(255,255,255,.28), rgba(255,255,255,0) 60%)`;
  const foilPos = useTransform(px, (v) => `${v * 100}% 50%`);
  const shadowX = useTransform(ry, (v) => v * -0.8);
  const tiltTo = useCallback(
    (cx: number, cy: number) => {
      const r = cardRef.current?.getBoundingClientRect();
      if (!r) return;
      px.set(clamp((cx - r.left) / r.width, 0, 1));
      py.set(clamp((cy - r.top) / r.height, 0, 1));
    },
    [px, py],
  );
  const onCardMove = (e: RPointerEvent<HTMLDivElement>) => !reduced && tiltTo(e.clientX, e.clientY);
  const onCardLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  // ─── holding and blooming ───
  const hold = useMotionValue(0);
  const open = useMotionValue(0);
  const [claimed, setClaimed] = useState(false);
  const claimedRef = useRef(false);
  const holdAnim = useRef<AnimationPlaybackControls | null>(null);
  const [holding, setHolding] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(
    () =>
      hold.on("change", (h) => {
        if (!claimedRef.current) open.set(h * 0.3);
      }),
    [hold, open],
  );

  // the bud trembles while you hold
  useAnimationFrame((t) => {
    const h = hold.get();
    shake.set(holding && !claimedRef.current && !reduced ? Math.sin(t / 26) * 1.6 * h : 0);
  });

  const claim = useCallback(() => {
    if (claimedRef.current) return;
    claimedRef.current = true;
    setClaimed(true);
    setHolding(false);
    setBurst((b) => b + 1);
    if (reduced) open.set(1);
    else animate(open, 1, { duration: 1.7, ease: [0.42, 0, 0.18, 1.16] });
    animate(hold, 0, { duration: 0.6, delay: 0.4 });
    onClaimRef.current?.();
  }, [open, hold, reduced]);

  const startHold = useCallback(() => {
    if (claimedRef.current) return;
    setHolding(true);
    holdAnim.current?.stop();
    holdAnim.current = animate(hold, 1, { duration: holdFor * (1 - hold.get()), ease: "linear", onComplete: claim });
  }, [hold, holdFor, claim]);
  const endHold = useCallback(() => {
    if (claimedRef.current) return;
    setHolding(false);
    holdAnim.current?.stop();
    holdAnim.current = animate(hold, 0, { type: "spring", stiffness: 260, damping: 22 });
  }, [hold]);

  const rewrap = useCallback(() => {
    claimedRef.current = false;
    setClaimed(false);
    animate(open, 0, reduced ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 16 });
  }, [open, reduced]);

  const amountScale = useTransform(open, [0.35, 0.85], [0.4, 1]);
  const amountOpacity = useTransform(open, [0.35, 0.7], [0, 1]);
  // the bud sits a little larger than life; it settles to full size as it opens
  const budScale = useTransform([hold, open], ([h, o]: number[]) => (1 + (claimedRef.current ? 0 : h * 0.12)) * (1.4 - 0.4 * clamp(o, 0, 1)));

  // ─── autoplay: tilt the card about, hold the button until it blooms, wrap it back up ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      if (!claimedRef.current) endHold();
      onCardLeave();
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, to: number, duration: number, ease: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - to) < 0.01) return res();
        const c = animate(mv, to, { duration, ease, onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    const rel = (el: Element, fx = 0.5, fy = 0.5) => {
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return { x: r.left - b.left + r.width * fx, y: r.top - b.top + r.height * fy };
    };
    const follow = () => {
      const b = root.getBoundingClientRect();
      tiltTo(b.left + gx.get(), b.top + gy.get());
    };
    (async () => {
      await wait(900);
      while (alive) {
        const card = cardRef.current!;
        // wave across the card so it catches the light
        const a = rel(card, 0.2, 0.3);
        gx.set(a.x);
        gy.set(a.y + 30);
        await run(go, 1, 0.25);
        const offs = [gx.on("change", follow), gy.on("change", follow)];
        await Promise.all([run(gx, a.x, 0.3), run(gy, a.y, 0.3)]);
        const c1 = rel(card, 0.85, 0.75);
        await Promise.all([run(gx, c1.x, 1.1, [0.45, 0, 0.55, 1]), run(gy, c1.y, 1.1, [0.45, 0, 0.55, 1])]);
        const c2 = rel(card, 0.7, 0.2);
        await Promise.all([run(gx, c2.x, 0.8, [0.45, 0, 0.55, 1]), run(gy, c2.y, 0.8, [0.45, 0, 0.55, 1])]);
        offs.forEach((f) => f());
        onCardLeave();
        // hold the button: once briefly (it closes again), then all the way
        const btn = root.querySelector<HTMLElement>("[data-hold]");
        if (btn) {
          const t = rel(btn);
          await Promise.all([run(gx, t.x, 0.6), run(gy, t.y, 0.6)]);
          await run(gs, 0.8, 0.1);
          startHold();
          await wait(450);
          endHold();
          await run(gs, 1, 0.12);
          await wait(650);
          await run(gs, 0.8, 0.1);
          startHold();
          await wait(holdFor * 1000 + 120);
          await run(gs, 1, 0.12);
          await run(go, 0, 0.3);
        }
        await wait(4200);
        // wrap it back up
        const again = root.querySelector<HTMLElement>("[data-rewrap]");
        if (again) {
          const t = rel(again);
          gx.set(t.x + 30);
          gy.set(t.y + 30);
          await run(go, 1, 0.25);
          await Promise.all([run(gx, t.x, 0.45), run(gy, t.y, 0.45)]);
          await run(gs, 0.8, 0.1);
          rewrap();
          await run(gs, 1, 0.12);
          await run(go, 0, 0.3);
        }
        await wait(1800);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  // keyboard holding on the button
  const keyDown = useRef(false);
  const onKeyDown = (e: RKeyboardEvent) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
      e.preventDefault();
      keyDown.current = true;
      startHold();
    }
  };
  const onKeyUp = (e: RKeyboardEvent) => {
    if ((e.key === " " || e.key === "Enter") && keyDown.current) {
      e.preventDefault();
      keyDown.current = false;
      endHold();
    }
  };

  const fill = useTransform(hold, (h) => `${h * 100}%`);
  const pretty = `${currency}${amount.toLocaleString("en-US")}`;

  return (
    <div ref={rootRef} className={`relative flex w-full max-w-[380px] select-none flex-col items-center ${className}`}>
      {/* the card */}
      <div className="relative w-full max-w-[340px] [perspective:900px]">
        <motion.div aria-hidden="true" className="absolute inset-x-6 bottom-[-18px] h-10 rounded-[50%] bg-black/30 blur-xl" style={{ x: shadowX }} />
        <motion.div
          ref={cardRef}
          onPointerMove={onCardMove}
          onPointerLeave={onCardLeave}
          role="img"
          aria-label={`${brand} gift card for ${to} from ${from}${claimed ? `, ${pretty} opened` : ", unopened"}`}
          className="relative aspect-[1.586] w-full rounded-[20px] [transform-style:preserve-3d]"
          style={{ rotateX: rx, rotateY: ry, rotateZ: shake }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,.18),inset_0_0_0_1px_rgba(255,255,255,.06)]"
            style={{ background: "radial-gradient(120% 90% at 20% 0%, #2f7a5c 0%, #165440 45%, #0b3a2c 100%)" }}
          >
            <motion.div className="absolute inset-0" style={{ backgroundImage: glare }} />
          </div>
          {/* foil type */}
          <div className="absolute left-5 top-4" style={{ transform: "translateZ(1px)" }}>
            <motion.p
              className="m-0 bg-clip-text text-[17px] font-semibold tracking-[-0.01em] text-transparent"
              style={{ backgroundImage: "linear-gradient(100deg, #b8893f 0%, #f7e29a 30%, #c99a4a 50%, #fbe9a8 70%, #b8893f 100%)", backgroundSize: "220% 100%", backgroundPosition: foilPos }}
            >
              {brand}
            </motion.p>
            <p className="m-0 text-[11.5px] font-medium text-white/60">Gift card</p>
          </div>
          <div className="absolute bottom-4 left-5" style={{ transform: "translateZ(1px)" }}>
            <p className="m-0 text-[15px] font-semibold text-white">For {to}</p>
            <p className="m-0 text-[12px] text-white/65">From {from}</p>
          </div>
          <p className="absolute bottom-4 right-5 m-0 text-[12px] tabular-nums tracking-[0.08em] text-white/55" style={{ transform: "translateZ(1px)" }}>
            •••• {last4}
          </p>

          {/* the flower, centred, built in 3D */}
          <div className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]" style={{ transform: `translateZ(2px) scale(${k})` }}>
            <motion.div className="absolute left-0 top-0 h-0 w-0 [transform-style:preserve-3d]" style={{ scale: budScale }}>
              {/* the amount, on a gold disc under the petals */}
              <motion.div
                className="absolute left-0 top-0 grid h-[58px] w-[58px] place-items-center rounded-full shadow-[inset_0_-3px_8px_rgba(150,90,10,.45),inset_0_2px_3px_rgba(255,255,255,.7),0_4px_14px_rgba(0,0,0,.25)]"
                style={{ background: "radial-gradient(circle at 38% 32%, #fff6c9, #f2cf6b 55%, #c98f2a)", scale: amountScale, opacity: amountOpacity, x: "-50%", y: "-50%", z: 26 }}
              >
                <span className="text-[19px] font-bold tabular-nums tracking-[-0.03em] text-[#4a3005]">{pretty}</span>
              </motion.div>
              {RINGS.map((ring, ri) =>
                Array.from({ length: ring.n }, (_, i) => (
                  <Petal key={`${ri}-${i}`} ring={ring} angle={(i * 360) / ring.n + ring.off} open={open} id={`${uid}-${ri}`} first={i === 0} />
                )),
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* pollen and sparkles, flat on top */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0" aria-hidden="true">
          {burst > 0 && !reduced && <Pollen key={burst} />}
        </div>
      </div>

      {/* the action */}
      <div className="mt-9 flex h-[52px] w-full max-w-[340px] items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {!claimed ? (
            <motion.button
              key="hold"
              data-hold
              type="button"
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                startHold();
              }}
              onPointerUp={endHold}
              onPointerCancel={endHold}
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Press and hold to open your gift"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: holding ? 0.96 : 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="relative h-[50px] w-full overflow-hidden rounded-full bg-[#1d1d1f] text-[15px] font-semibold text-white outline-none [touch-action:none] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
            >
              <motion.span className="absolute inset-y-0 left-0 bg-[#ff6fa3]" style={{ width: fill }} />
              <span className="relative flex items-center justify-center gap-2">
                <svg viewBox={`0 0 ${ICON.gift.vb} ${ICON.gift.vb}`} width={18} height={18} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.gift.body }} />
                Hold to open
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="done"
              className="flex w-full items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_12px_28px_-20px_rgba(0,0,0,.4)]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 300, damping: 26, delay: reduced ? 0 : 0.9 }}
            >
              <span className="flex items-center gap-2.5">
                <svg viewBox={`0 0 ${ICON.done.vb} ${ICON.done.vb}`} width={22} height={22} className="text-[#30d158]" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.done.body }} />
                <span className="text-[14px] font-semibold text-[#1d1d1f]" role="status">
                  Added to your balance
                </span>
              </span>
              <button
                type="button"
                data-rewrap
                onClick={rewrap}
                className="shrink-0 rounded-full px-2 py-1 text-[13px] font-medium text-[#0066cc] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              >
                Wrap it again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="m-0 mt-2 h-4 text-[12px] text-[#86868b]">{claimed ? "" : "Let go early and it closes back up."}</p>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}

/** One petal: hinged at its base, standing (or leaning over the middle) when closed, lying out when open. */
function Petal({ ring, angle, open, id, first }: { ring: Ring; angle: number; open: MotionValue<number>; id: string; first: boolean }) {
  const p = useTransform(open, (o) => (o - ring.start) / (1 - ring.start));
  const tilt = useTransform(p, (q) => ring.closed + (ring.open - ring.closed) * clamp(q, -0.1, 1.12));
  const twist = useTransform(p, (q) => angle + (1 - clamp(q, 0, 1)) * 34);
  const sc = useTransform(p, (q) => 0.62 + 0.38 * clamp(q, 0, 1.08));
  const transform = useMotionTemplate`rotateZ(${twist}deg) translateY(${-ring.r0}px) rotateX(${tilt}deg) scale(${sc})`;
  // petals standing up face away from the light; lying flat they catch it
  const shade = useTransform(tilt, (t) => clamp(Math.abs(Math.sin((t * Math.PI) / 180)) * 0.42 - 0.04, 0, 0.42));
  const sepal = ring.n === 6;
  const d = sepal
    ? "M50 120 C 30 104, 18 70, 30 34 C 38 14, 46 4, 50 0 C 54 4, 62 14, 70 34 C 82 70, 70 104, 50 120 Z"
    : "M50 120 C 18 110, 0 72, 7 40 C 12 16, 32 2, 47 11 Q 50 14, 53 11 C 68 2, 88 16, 93 40 C 100 72, 82 110, 50 120 Z";
  return (
    <motion.div
      className="absolute left-0 top-0 [transform-style:preserve-3d]"
      style={{ width: ring.w, height: ring.len, marginLeft: -ring.w / 2, marginTop: -ring.len, transformOrigin: "50% 100%", transform }}
    >
      <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        {first && (
          <defs>
            <radialGradient id={`${id}-g`} cx="0.5" cy="1" r="1.1">
              <stop offset="0" stopColor={ring.tone[2]} />
              <stop offset="0.45" stopColor={ring.tone[1]} />
              <stop offset="1" stopColor={ring.tone[0]} />
            </radialGradient>
          </defs>
        )}
        <path d={d} fill={`url(#${id}-g)`} />
        {!sepal && <path d="M50 116 Q 49 70, 50 22" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={1.4} />}
      </svg>
      <motion.svg viewBox="0 0 100 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" style={{ opacity: shade }}>
        <path d={d} fill="#5a0f2c" />
      </motion.svg>
    </motion.div>
  );
}

/** A puff of pollen and a few sparkles when it opens. */
function Pollen() {
  const bits = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2 + Math.sin(i * 7.1) * 0.3;
        const v = 70 + ((i * 53) % 70);
        return { x: Math.cos(a) * v, y: Math.sin(a) * v * 0.8 - 30, s: 2 + (i % 3), d: 1.1 + (i % 5) * 0.12, c: i % 4 === 0 ? "#ffffff" : i % 3 === 0 ? "#ffb3cf" : "#ffd43b" };
      }),
    [],
  );
  const stars = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        return { x: Math.cos(a) * (96 + (i % 3) * 16), y: Math.sin(a) * (70 + (i % 2) * 14), s: 10 + (i % 3) * 4, delay: 0.9 + i * 0.12 };
      }),
    [],
  );
  return (
    <>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute left-0 top-0 block rounded-full"
          style={{ width: b.s, height: b.s, marginLeft: -b.s / 2, marginTop: -b.s / 2, background: b.c, boxShadow: `0 0 6px ${b.c}` }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: [0, b.x * 0.75, b.x], y: [0, b.y * 0.7, b.y + 46], opacity: [0, 1, 0] }}
          transition={{ duration: b.d, delay: 0.55, times: [0, 0.45, 1], ease: "easeOut" }}
        />
      ))}
      {stars.map((s, i) => (
        <motion.svg
          key={`s${i}`}
          viewBox={`0 0 ${ICON.sparkle.vb} ${ICON.sparkle.vb}`}
          width={s.s}
          height={s.s}
          className="absolute left-0 top-0 text-[#ffe08a]"
          style={{ marginLeft: -s.s / 2, marginTop: -s.s / 2, x: s.x, y: s.y }}
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: [0, 1.15, 0], rotate: [-45, 0, 30], opacity: [0, 1, 0] }}
          transition={{ duration: 1.1, delay: s.delay, ease: "easeOut" }}
          dangerouslySetInnerHTML={{ __html: ICON.sparkle.body }}
        />
      ))}
    </>
  );
}
