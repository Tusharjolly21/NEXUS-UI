"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface StretchNavProps {
  items?: string[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  /** Moves between items by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

/**
 * The active pill moves its leading edge first and lets the trailing edge
 * catch up, so it stretches toward the target and snaps back to size.
 */
export function StretchNav({ items = ["Home", "Work", "Writing", "About", "Contact"], defaultIndex = 0, onChange, autoplay = false, enableSound = true }: StretchNavProps) {
  const play = useSound(enableSound);
  const [active, setActive] = useState(defaultIndex);
  const [hover, setHover] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const width = useTransform(() => right.get() - left.get());
  const hLeft = useMotionValue(0);
  const hWidth = useMotionValue(0);
  const hOpacity = useMotionValue(0);
  const touched = useRef(false);
  const first = useRef(true);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const edges = (i: number) => {
    const el = refs.current[i];
    return el ? [el.offsetLeft, el.offsetLeft + el.offsetWidth] : [0, 0];
  };

  useLayoutEffect(() => {
    const [l, r] = edges(active);
    if (first.current) {
      left.set(l);
      right.set(r);
      first.current = false;
      return;
    }
    const goingRight = l > left.get();
    const fast = { type: "spring", stiffness: 520, damping: 34 } as const;
    const slow = { type: "spring", stiffness: 190, damping: 24 } as const;
    animate(left, l, goingRight ? slow : fast);
    animate(right, r, goingRight ? fast : slow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (hover === null) {
      animate(hOpacity, 0, { duration: 0.2 });
      return;
    }
    const [l, r] = edges(hover);
    const spring = { type: "spring", stiffness: 420, damping: 34 } as const;
    if (hOpacity.get() < 0.05) {
      hLeft.set(l);
      hWidth.set(r - l);
    } else {
      animate(hLeft, l, spring);
      animate(hWidth, r - l, spring);
    }
    animate(hOpacity, 1, { duration: 0.15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover]);

  useEffect(() => {
    if (!autoplay) return;
    const order = [3, 1, 4, 0, 2];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const next = order[k++ % order.length] % items.length;
      if (next !== activeRef.current) play.auto("tick", 0.6);
      setActive(next);
    }, 1500);
    return () => clearInterval(t);
  }, [autoplay, items.length, play]);

  return (
    <nav aria-label="Main" className="relative inline-flex items-center rounded-full bg-white p-1 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_10px_30px_-14px_rgba(0,0,0,.25)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_30px_-14px_rgba(0,0,0,.6)]" onPointerLeave={() => setHover(null)}>
      <motion.span aria-hidden="true" className="absolute bottom-1 top-1 rounded-full bg-[#f0f0f3] dark:bg-[#3a3a3c]" style={{ left: hLeft, width: hWidth, opacity: hOpacity }} />
      <motion.span aria-hidden="true" className="absolute bottom-1 top-1 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ left, width }} />
      {items.map((label, i) => (
        <motion.button
          key={label}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          aria-current={i === active ? "page" : undefined}
          onPointerEnter={() => setHover(i)}
          onClick={() => {
            touched.current = true;
            if (i !== active) play("tick", 0.6);
            setActive(i);
            onChange?.(i);
          }}
          whileTap={{ scale: 0.94 }}
          style={{ transitionDelay: i === active ? "80ms" : "0ms" }}
          className={`relative z-10 h-9 rounded-full px-4 text-[14px] font-medium transition-colors duration-200 ${i === active ? "text-white dark:text-[#1d1d1f]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]`}
        >
          {label}
        </motion.button>
      ))}
    </nav>
  );
}
