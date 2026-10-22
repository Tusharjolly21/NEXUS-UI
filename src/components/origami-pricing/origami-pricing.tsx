"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

export interface OrigamiPricingProps {
  /** Plan name on the cover. Its first letter becomes the logo tile. */
  planName?: string;
  /** Price on the cover, including the currency symbol. */
  price?: string;
  /** Small unit after the price. */
  period?: string;
  /** Lines in the features panel. */
  features?: string[];
  /** Customer quote on the lower-left panel. */
  quote?: string;
  /** Who said it. */
  author?: string;
  /** Label of the call-to-action button. */
  ctaLabel?: string;
  /** Small line under the button. */
  note?: string;
  /** Called when the button is pressed. The component never navigates or takes payment itself. */
  onCtaClick?: () => void;
  /** Line under the card. Pass an empty string to hide it. */
  caption?: string;
  /** Folds and unfolds by itself until someone taps the card. */
  autoplay?: boolean;
}

const P = 170;
const DEFAULT_FEATURES = ["All components", "All templates", "Source + Figma", "Requests first"];

const edge = "shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]";

function Face({ children, back = false, shade, className = "" }: { children?: ReactNode; back?: boolean; shade: MotionValue<number>; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : undefined }}>
      {children}
      <motion.div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/30 to-black/5" style={{ opacity: shade }} />
    </div>
  );
}
const paperBack = `${edge} bg-[#f1efe8] bg-[repeating-linear-gradient(135deg,rgba(0,0,0,.025)_0_2px,transparent_2px_6px)] dark:bg-[#2a2a2c] dark:bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.03)_0_2px,transparent_2px_6px)]`;

/**
 * A pricing card folded like a paper map. Tap it and it opens in two folds:
 * the right panel swings out from behind with the features, then the bottom
 * half drops down with a customer quote and the button. Creases darken while
 * a panel is mid-turn, and folding it away runs the same moves backwards.
 */
export function OrigamiPricing({
  planName = "Nexus Pro",
  price = "$9",
  period = "/mo",
  features = DEFAULT_FEATURES,
  quote = "Paid for itself in the first week.",
  author = "Maya, Loop",
  ctaLabel = "Start free trial",
  note = "14 days · cancel anytime",
  onCtaClick,
  caption = "Two folds: out, then down.",
  autoplay = false,
}: OrigamiPricingProps) {
  const a = useMotionValue(0), b = useMotionValue(0);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const touched = useRef(false);

  const rotTR = useTransform(a, (v) => `rotateY(${180 * (1 - v)}deg) translateZ(${(1 - v) * 1}px)`); // after a half turn, +z points away: tucks it behind
  const rotDown = useTransform(b, (v) => `rotateX(${-180 * (1 - v)}deg) translateZ(${(1 - v) * 2}px)`);
  // folded panels tuck behind the cover; hide them so their edges can't peek round its rounded corners
  const showA = useTransform(a, (v) => (v < 0.02 ? 0 : 1));
  const showB = useTransform(b, (v) => (v < 0.02 ? 0 : 1));
  const shadeA = useTransform(a, (v) => Math.sin(Math.PI * v) * 0.9 + (1 - v) * 0.3);
  const shadeB = useTransform(b, (v) => Math.sin(Math.PI * v) * 0.9 + (1 - v) * 0.3);
  const left = useTransform(a, (v) => (1 - v) * (P / 2));
  const top = useTransform(b, (v) => (1 - v) * (P / 2));
  const shadowW = useTransform(a, (v) => P * 0.9 + v * P);
  const shadowY = useTransform(b, (v) => P * 1.5 + v * (P / 2) + 8);

  const toggle = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const next = !open;
    setOpen(next);
    if (next) {
      await animate(a, 1, { type: "spring", stiffness: 120, damping: 15 });
      await animate(b, 1, { type: "spring", stiffness: 110, damping: 14 });
    } else {
      await animate(b, 0, { type: "spring", stiffness: 160, damping: 22 });
      await animate(a, 0, { type: "spring", stiffness: 160, damping: 22 });
    }
    busy.current = false;
  }, [open, a, b]);

  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inView = true;
    const io = typeof IntersectionObserver === "undefined" || !root.current ? null : new IntersectionObserver(([e]) => { inView = e.isIntersecting; });
    if (io && root.current) io.observe(root.current);
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!inView || document.hidden) return;
      void toggle();
    }, 2600);
    return () => { clearInterval(id); io?.disconnect(); };
  }, [autoplay, toggle]);

  return (
    <div ref={root} className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: P * 2, height: P * 2, perspective: 1100 }}>
        <motion.div className="absolute left-1/2 h-6 -translate-x-1/2 rounded-[50%] bg-black/20 blur-xl dark:bg-black/60" style={{ width: shadowW, top: shadowY }} />
        <motion.div className="absolute" style={{ left, top, width: P, height: P, transformStyle: "preserve-3d" }}>
          {/* top-left: the cover, always facing you */}
          <button
            type="button"
            onClick={() => { touched.current = true; void toggle(); }}
            aria-expanded={open}
            aria-label={open ? `Fold the ${planName} plan card` : `Unfold the ${planName} plan card`}
            className={`absolute inset-0 flex flex-col justify-between rounded-tl-[18px] bg-white p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:focus-visible:ring-[#2997ff] ${edge}`}
            style={{ transform: "translateZ(2px)", borderBottomLeftRadius: open ? 0 : 18, borderTopRightRadius: open ? 0 : 18, borderBottomRightRadius: open ? 0 : 18 }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#1d1d1f] text-[13px] font-bold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">{planName.charAt(0).toUpperCase()}</span>
            <span>
              <span className="block text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{planName}</span>
              <span className="block text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">{price}<span className="text-[15px] font-medium tracking-normal text-[#86868b] dark:text-[#8e8e93]">{period}</span></span>
              <span className="mt-2 block text-[12px] font-medium text-[#0071e3] dark:text-[#2997ff]">{open ? "Fold it back" : "Tap to unfold"}</span>
            </span>
          </button>

          {/* right panel, hinged on the cover's right edge */}
          <motion.div aria-hidden={!open} className="absolute top-0" style={{ left: P, width: P, height: P, transformOrigin: "0 50%", transformStyle: "preserve-3d", transform: rotTR, opacity: showA }}>
            <Face shade={shadeA} className={`rounded-tr-[18px] bg-white p-5 dark:bg-[#1c1c1e] ${edge}`}>
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#86868b] dark:text-[#8e8e93]">Includes</span>
              <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
                {features.map((f) => <li key={f} className="flex items-center gap-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{f}</li>)}
              </ul>
            </Face>
            <Face back shade={shadeA} className={paperBack} />
            {/* bottom-right, hinged under the right panel */}
            <motion.div className="absolute left-0" style={{ top: P, width: P, height: P, transformOrigin: "50% 0", transformStyle: "preserve-3d", transform: rotDown, opacity: showB }}>
              <Face shade={shadeB} className={`flex flex-col justify-end rounded-br-[18px] bg-[#1d1d1f] p-5 dark:bg-[#f5f5f7] ${edge}`}>
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => onCtaClick?.()}
                  className="h-10 w-full rounded-full bg-white text-[14px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1d1d1f] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
                >
                  {ctaLabel}
                </button>
                <span className="mt-2 text-center text-[11px] text-white/60 dark:text-black/55">{note}</span>
              </Face>
              <Face back shade={shadeB} className={paperBack} />
            </motion.div>
          </motion.div>

          {/* bottom-left, hinged on the cover's bottom edge */}
          <motion.div aria-hidden={!open} className="absolute left-0" style={{ top: P, width: P, height: P, transformOrigin: "50% 0", transformStyle: "preserve-3d", transform: rotDown, opacity: showB }}>
            <Face shade={shadeB} className={`flex flex-col justify-between rounded-bl-[18px] bg-[#f5f5f7] p-5 dark:bg-[#2c2c2e] ${edge}`}>
              <span className="text-[15px] leading-[1.35] tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">“{quote}”</span>
              <span className="flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-gradient-to-br from-[#ff9f0a] to-[#ff375f]" /><span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{author}</span></span>
            </Face>
            <Face back shade={shadeB} className={paperBack} />
          </motion.div>
        </motion.div>
      </div>
      {caption ? <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">{caption}</span> : null}
    </div>
  );
}
