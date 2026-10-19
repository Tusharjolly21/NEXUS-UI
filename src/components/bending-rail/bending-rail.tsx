"use client";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";

export interface BendingRailProps {
  label?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  accent?: string;
  onChange?: (v: number) => void;
  /** Tugs the knob around by itself until the user grabs it. */
  autoplay?: boolean;
}

const W = 360;
const H = 160;
const Y0 = 90;
const PAD = 16;

/**
 * A slider whose rail follows the knob. Pull the knob off the groove and the
 * rail bends into a V toward it; a ghost knob on the groove keeps the real
 * value. Let go and the rail twangs straight on a spring.
 */
export function BendingRail({ label = "Volume", min = 0, max = 100, defaultValue = 40, unit = "%", accent = "#0071e3", onChange, autoplay = false }: BendingRailProps) {
  const toX = (v: number) => PAD + ((v - min) / (max - min)) * (W - PAD * 2);
  const kx = useMotionValue(toX(defaultValue));
  const ky = useMotionValue(Y0);
  const [value, setValue] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const lastValue = useRef(defaultValue);

  const clampX = (x: number) => Math.max(PAD, Math.min(W - PAD, x));
  const gx = useTransform(kx, clampX);
  const rail = useTransform(() => {
    const x = clampX(kx.get()),
      y = ky.get();
    // Two straight runs meeting at the knob, softened with quadratic corners.
    const c = 18;
    const lx = Math.max(PAD, x - c),
      rx = Math.min(W - PAD, x + c);
    const t1 = (lx - PAD) / Math.max(1, x - PAD),
      t2 = (W - PAD - rx) / Math.max(1, W - PAD - x);
    return `M ${PAD} ${Y0} L ${lx} ${Y0 + (y - Y0) * t1} Q ${x} ${y} ${rx} ${Y0 + (y - Y0) * t2} L ${W - PAD} ${Y0}`;
  });
  const filled = useTransform(() => {
    const x = clampX(kx.get()),
      y = ky.get();
    return `M ${PAD} ${Y0} L ${x} ${y}`;
  });
  const ghost = useTransform(() => (Math.abs(ky.get() - Y0) > 6 ? 1 : 0));
  const tether = useTransform(() => `M ${clampX(kx.get())} ${Y0} L ${clampX(kx.get())} ${ky.get()}`);

  useMotionValueEvent(kx, "change", (x) => {
    const v = Math.round(min + ((clampX(x) - PAD) / (W - PAD * 2)) * (max - min));
    if (v === lastValue.current) return;
    lastValue.current = v;
    setValue(v);
    onChange?.(v);
  });

  const twang = () => {
    animate(ky, Y0, { type: "spring", stiffness: 520, damping: 9 });
  };

  useEffect(() => {
    if (!autoplay) return;
    const tug = async () => {
      if (touched.current) return;
      const tx = toX(15 + Math.random() * 70);
      animate(kx, tx, { duration: 0.8, ease: "easeInOut" });
      await animate(ky, [Y0, Y0 - 45 - Math.random() * 25, Y0 - 50], { duration: 0.8, ease: "easeInOut" });
      if (!touched.current) twang();
    };
    const a = setTimeout(tug, 700);
    const b = setInterval(tug, 2600);
    return () => {
      clearTimeout(a);
      clearInterval(b);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const local = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const letGo = () => {
    if (!dragging) return;
    setDragging(false);
    twang();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-[328px] items-baseline justify-between">
        <span className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{label}</span>
        <span className="text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">
          {value}
          <span className="text-[14px] text-[#86868b] dark:text-[#98989d]">{unit}</span>
        </span>
      </div>
      <div
        ref={stage}
        className="relative touch-none select-none"
        style={{ width: W, height: H, maxWidth: "100%" }}
        onPointerMove={(e) => {
          if (!dragging) return;
          const p = local(e);
          kx.set(p.x);
          // Resist the further it is pulled.
          const dy = p.y - Y0;
          ky.set(Y0 + Math.sign(dy) * Math.min(70, Math.abs(dy) * 0.75));
        }}
        onPointerUp={letGo}
        onPointerCancel={letGo}
      >
        <svg className="absolute inset-0 overflow-visible" width={W} height={H} aria-hidden="true">
          <motion.path d={rail} fill="none" className="stroke-[#e8e8ed] dark:stroke-[#3a3a3c]" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <motion.path d={filled} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round" />
          <motion.path d={tether} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="3 5" style={{ opacity: ghost }} />
          <motion.circle cx={gx} cy={Y0} r={7} className="fill-white dark:fill-[#2c2c2e]" stroke={accent} strokeWidth={2} strokeDasharray="3 3" style={{ opacity: ghost }} />
        </svg>
        <motion.button
          type="button"
          role="slider"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          onPointerDown={(e) => {
            touched.current = true;
            setDragging(true);
            (e.currentTarget.parentElement as Element).setPointerCapture?.(e.pointerId);
          }}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 1;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              touched.current = true;
              animate(kx, toX(Math.min(max, value + step)), { type: "spring", stiffness: 500, damping: 34 });
            }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              touched.current = true;
              animate(kx, toX(Math.max(min, value - step)), { type: "spring", stiffness: 500, damping: 34 });
            }
          }}
          animate={{ scale: dragging ? 1.15 : 1 }}
          className="absolute left-0 top-0 h-7 w-7 cursor-grab rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,.2),0_0_0_.5px_rgba(0,0,0,.08)] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:cursor-grabbing dark:shadow-[0_4px_12px_rgba(0,0,0,.6),0_0_0_.5px_rgba(255,255,255,.12)] dark:ring-offset-black"
          style={{ x: gx, y: ky, marginLeft: -14, marginTop: -14, ["--tw-ring-color" as string]: accent }}
        />
      </div>
      <span className="-mt-6 text-[13px] text-[#86868b] dark:text-[#98989d]">Pull the knob up or down, then let go.</span>
    </div>
  );
}
