"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Mode = "Cost" | "Balanced" | "Quality";

interface Model { id: string; name: string; price: number; color: string }

const MODELS: Model[] = [
  { id: "nano", name: "Nano", price: 0.1, color: "#30d158" },
  { id: "mini", name: "Mini", price: 0.6, color: "#64d2ff" },
  { id: "pro", name: "Pro", price: 3, color: "#0071e3" },
  { id: "ultra", name: "Ultra", price: 15, color: "#5e5ce6" },
];

const SHARES: Record<Mode, number[]> = {
  Cost: [70, 30, 0, 0],
  Balanced: [25, 40, 30, 5],
  Quality: [0, 10, 55, 35],
};

const W = 760;
const H = 260;
const SRC = { x: 110, y: H / 2 };
const DST_X = 560;
const ys = [44, 104, 164, 224];

const pathFor = (i: number) => {
  const y = ys[i];
  return `M ${SRC.x} ${SRC.y} C ${SRC.x + 160} ${SRC.y}, ${DST_X - 200} ${y}, ${DST_X} ${y}`;
};

/**
 * Requests flow from a router to four models. Pick a strategy and the traffic
 * re-balances live: packets choose routes by weight, unused routes fade to a
 * dashed line, and the share and blended price roll to their new values.
 */
export default function PacketRouter({ autoplay = false }: { autoplay?: boolean }) {
  const [mode, setMode] = useState<Mode>("Balanced");
  const shares = SHARES[mode];
  const sharesRef = useRef(shares);
  sharesRef.current = shares;
  const canvas = useRef<HTMLCanvasElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const counts = useRef([0, 0, 0, 0]);
  const [served, setServed] = useState([0, 0, 0, 0]);
  const touched = useRef(false);
  const blended = shares.reduce((a, s, i) => a + (s / 100) * MODELS[i].price, 0);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    const packets: { route: number; t: number; speed: number }[] = [];
    let raf = 0, last = performance.now(), acc = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;
      while (acc > 0.07) {
        acc -= 0.07;
        const sh = sharesRef.current;
        let r = Math.random() * 100, route = 0;
        for (let i = 0; i < sh.length; i++) { if (r < sh[i]) { route = i; break; } r -= sh[i]; }
        packets.push({ route, t: 0, speed: 0.55 + Math.random() * 0.25 });
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k];
        p.t += dt * p.speed;
        const el = paths.current[p.route];
        if (p.t >= 1 || !el) {
          counts.current[p.route]++;
          packets.splice(k, 1);
          continue;
        }
        const L = el.getTotalLength();
        const pt = el.getPointAtLength(p.t * L);
        const pt2 = el.getPointAtLength(Math.max(0, p.t * L - 18));
        const g = ctx.createLinearGradient(pt2.x, pt2.y, pt.x, pt.y);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(1, MODELS[p.route].color);
        ctx.strokeStyle = g;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(pt2.x, pt2.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.fillStyle = MODELS[p.route].color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const tally = setInterval(() => setServed([...counts.current]), 500);
    return () => { cancelAnimationFrame(raf); clearInterval(tally); };
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const order: Mode[] = ["Cost", "Quality", "Balanced"];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setMode(order[k++ % order.length]);
    }, 2800);
    return () => clearInterval(t);
  }, [autoplay]);

  return (
    <div className="flex w-full flex-col items-center gap-4" onPointerDown={() => (touched.current = true)}>
      <div className="relative w-full max-w-[760px] overflow-x-auto">
        <div className="relative" style={{ width: W, height: H }}>
          <svg className="absolute inset-0" width={W} height={H} aria-hidden="true">
            {MODELS.map((m, i) => (
              <motion.path
                key={m.id}
                ref={(el) => { paths.current[i] = el; }}
                d={pathFor(i)}
                fill="none"
                strokeLinecap="round"
                initial={false}
                animate={{ stroke: shares[i] ? m.color : "#c7c7cc", strokeWidth: shares[i] ? 1.5 + shares[i] / 14 : 1.2, strokeOpacity: shares[i] ? 0.35 : 0.8, strokeDasharray: shares[i] ? "0 0" : "3 6" }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </svg>
          <canvas ref={canvas} className="pointer-events-none absolute inset-0" style={{ width: W, height: H }} aria-hidden="true" />
          {/* router node */}
          <div className="absolute flex h-14 w-[96px] flex-col items-center justify-center rounded-2xl bg-[#1d1d1f] text-white shadow-[0_14px_28px_-14px_rgba(0,0,0,.5)]" style={{ left: SRC.x - 96, top: SRC.y - 28 }}>
            <span className="text-[12px] font-semibold">Router</span>
            <span className="relative h-4 overflow-hidden text-[10px] tabular-nums text-white/60">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={mode} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>{mode}</motion.span>
              </AnimatePresence>
            </span>
          </div>
          {/* model nodes */}
          {MODELS.map((m, i) => (
            <motion.div
              key={m.id}
              className="absolute flex h-11 w-[180px] items-center gap-2.5 rounded-xl bg-white px-3 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_8px_20px_-14px_rgba(0,0,0,.35)]"
              style={{ left: DST_X + 6, top: ys[i] - 22 }}
              initial={false}
              animate={{ opacity: shares[i] ? 1 : 0.45, x: shares[i] ? 0 : 6 }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
              <span className="flex-1 text-[13px] font-semibold text-[#1d1d1f]">{m.name}</span>
              <span className="relative h-4 w-10 overflow-hidden text-right text-[12px] font-semibold tabular-nums text-[#1d1d1f]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={shares[i]} className="block" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>{shares[i]}%</motion.span>
                </AnimatePresence>
              </span>
              <span className="w-10 text-right text-[11px] tabular-nums text-[#86868b]">{served[i]}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5">
        <div role="group" aria-label="Routing strategy" className="relative grid grid-cols-3 rounded-xl bg-[#e8e8ed] p-[3px]">
          {(["Cost", "Balanced", "Quality"] as Mode[]).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => { touched.current = true; setMode(m); }} className="relative z-10 h-8 rounded-[9px] px-5 text-[13px] font-medium text-[#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]">
              {mode === m && <motion.span layoutId="router-seg" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
              {m}
            </button>
          ))}
        </div>
        <span className="flex items-baseline gap-1.5 text-[13px] text-[#6e6e73]">
          Blended price
          <span className="relative inline-block h-5 overflow-hidden text-[15px] font-semibold tabular-nums text-[#1d1d1f]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={blended.toFixed(2)} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>${blended.toFixed(2)}</motion.span>
            </AnimatePresence>
          </span>
          / 1M tokens
        </span>
      </div>
    </div>
  );
}
