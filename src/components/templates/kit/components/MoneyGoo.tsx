"use client";
import { useEffect, useId, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";

export interface MoneyGooProps {
  amount?: number;
  from?: { name: string; initials: string; balance: number };
  to?: { name: string; initials: string; balance: number };
  accent?: string;
  /** Sends money by itself on a loop until the user drags. */
  autoplay?: boolean;
}

const W = 420;
const H = 240;
const A = { x: 80, y: 110 };
const B = { x: W - 80, y: 110 };
const SNAP = 58;

/**
 * Drag the amount out of your avatar toward a friend. A gooey neck stretches
 * between the blob and your avatar, thins as you pull, and breaks free; drop it
 * on the friend and it pours in and both balances update.
 */
export default function MoneyGoo({ amount = 40, from = { name: "You", initials: "ME", balance: 248 }, to = { name: "Maya", initials: "MK", balance: 112 }, accent = "#0071e3", autoplay = false }: MoneyGooProps) {
  const fid = "g" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const x = useMotionValue(A.x);
  const y = useMotionValue(A.y);
  const [balances, setBalances] = useState([from.balance, to.balance]);
  const [sent, setSent] = useState(0);
  const [holding, setHolding] = useState(false);
  const touched = useRef(false);
  const dragging = useRef(false);
  const stage = useRef<HTMLDivElement>(null);

  const dist = useTransform(() => Math.hypot(x.get() - A.x, y.get() - A.y));
  // Neck beads between the avatar and the blob, thinning with distance until they snap.
  const useBead = (t: number) => ({
    bx: useTransform(() => A.x + (x.get() - A.x) * t),
    by: useTransform(() => A.y + (y.get() - A.y) * t),
    s: useTransform(dist, [0, 60, 150, 175], [1, 0.75, 0.32, 0]),
  });
  const b1 = useBead(0.25), b2 = useBead(0.5), b3 = useBead(0.75);
  const blobScale = useTransform(dist, [0, 30, 200], [0.6, 1, 0.92]);

  const send = () => {
    setBalances(([a, b]) => [a - amount, b + amount]);
    setSent((s) => s + 1);
  };

  const release = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setHolding(false);
    const near = Math.hypot(x.get() - B.x, y.get() - B.y) < SNAP + 30;
    if (near) {
      animate(x, B.x, { type: "spring", stiffness: 300, damping: 22 });
      animate(y, B.y, { type: "spring", stiffness: 300, damping: 22 }).then(() => {
        send();
        x.set(A.x);
        y.set(A.y);
      });
    } else {
      animate(x, A.x, { type: "spring", stiffness: 260, damping: 16 });
      animate(y, A.y, { type: "spring", stiffness: 260, damping: 16 });
    }
  };

  useEffect(() => {
    if (!autoplay) return;
    const run = async () => {
      if (touched.current) return;
      await animate(x, [A.x, A.x + 60, A.x + 150, B.x - 40, B.x], { duration: 1.6, ease: "easeInOut" });
      if (touched.current) return;
      send();
      x.set(A.x);
      y.set(A.y);
    };
    const yLoop = () => !touched.current && animate(y, [A.y, A.y - 40, A.y - 30, A.y], { duration: 1.6, ease: "easeInOut" });
    const go = () => { yLoop(); run(); };
    const a = setTimeout(go, 900);
    const t = setInterval(go, 4200);
    return () => { clearTimeout(a); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const local = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { px: ((e.clientX - r.left) / r.width) * W, py: ((e.clientY - r.top) / r.height) * H };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={stage} className="relative touch-none select-none" style={{ width: W, height: H, maxWidth: "100%" }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const { px, py } = local(e);
          x.set(px);
          y.set(py);
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id={fid}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
          </filter>
        </svg>
        {/* goo layer */}
        <div className="absolute inset-0" style={{ filter: `url(#${fid})` }} aria-hidden="true">
          <span className="absolute h-[72px] w-[72px] rounded-full" style={{ left: A.x - 36, top: A.y - 36, background: accent }} />
          {[b1, b2, b3].map((b, i) => (
            <motion.span key={i} className="absolute h-[34px] w-[34px] rounded-full" style={{ left: -17, top: -17, x: b.bx, y: b.by, scale: b.s, background: accent }} />
          ))}
          <motion.span className="absolute h-[54px] w-[54px] rounded-full" style={{ left: -27, top: -27, x, y, scale: blobScale, background: accent }} />
        </div>
        {/* avatars + labels */}
        {[{ p: A, who: from, bal: balances[0] }, { p: B, who: to, bal: balances[1] }].map(({ p, who, bal }, i) => (
          <div key={who.name} className="pointer-events-none absolute flex flex-col items-center" style={{ left: p.x - 50, top: p.y - 36, width: 100 }}>
            <motion.span
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-[20px] font-semibold"
              style={{ background: i === 0 ? "transparent" : "#1d1d1f", color: "#fff" }}
              animate={i === 1 && sent ? { scale: [1, 1.18, 1] } : {}}
              key={i === 1 ? sent : "a"}
              transition={{ duration: 0.45 }}
            >
              {i === 0 ? "" : who.initials}
            </motion.span>
            <span className="mt-3 text-[14px] font-semibold text-[#1d1d1f]">{who.name}</span>
            <span className="relative h-5 overflow-hidden text-[13px] tabular-nums text-[#6e6e73]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={bal} className="block" initial={{ y: i === 0 ? -16 : 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: i === 0 ? 16 : -16, opacity: 0 }}>
                  ${bal}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        ))}
        {/* draggable amount (on top of goo) */}
        <motion.button
          type="button"
          aria-label={`Send $${amount} to ${to.name}. Drag onto ${to.name}, or press Enter.`}
          onPointerDown={(e) => {
            touched.current = true;
            dragging.current = true;
            setHolding(true);
            (e.currentTarget.parentElement as Element).setPointerCapture?.(e.pointerId);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            touched.current = true;
            animate(x, B.x, { type: "spring", stiffness: 200, damping: 20 }).then(() => { send(); x.set(A.x); });
          }}
          className="absolute flex h-[54px] w-[54px] cursor-grab items-center justify-center rounded-full text-[15px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:cursor-grabbing"
          style={{ left: -27, top: -27, x, y, ["--tw-ring-color" as string]: accent }}
          animate={{ scale: holding ? 1.1 : 1 }}
        >
          ${amount}
        </motion.button>
        {/* drop target ring */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full border-2 border-dashed"
          style={{ left: B.x - 46, top: B.y - 46, width: 92, height: 92, borderColor: accent }}
          animate={{ opacity: holding ? 1 : 0, scale: holding ? [1, 1.06, 1] : 0.9, rotate: holding ? 360 : 0 }}
          transition={{ opacity: { duration: 0.2 }, scale: { duration: 1, repeat: holding ? Infinity : 0 }, rotate: { duration: 6, repeat: Infinity, ease: "linear" } }}
        />
      </div>
      <span className="text-[13px] text-[#86868b]">Drag the amount onto {to.name}.</span>
    </div>
  );
}
