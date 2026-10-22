"use client";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls, type PanInfo } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

const NW = 300;
const NH = 150;

const face =
  "radial-gradient(circle at 20% 50%, rgba(255,255,255,.55) 0 18%, transparent 19%), repeating-radial-gradient(circle at 80% 50%, rgba(13,92,74,.10) 0 2px, transparent 2px 7px), linear-gradient(135deg, #d9f0e3, #b7e0c9 55%, #9fd3b8)";
const back = "repeating-linear-gradient(45deg, rgba(13,92,74,.08) 0 2px, transparent 2px 9px), linear-gradient(135deg, #c8e8d6, #a9d9bf)";

export interface FoldNoteProps {
  /** Small caps heading printed top left. */
  title?: string;
  /** Denomination printed top right and, smaller, bottom right. */
  amount?: string;
  /** Fine print along the bottom edge. */
  serial?: string;
  /** Word printed on the back of the folding half. */
  backLabel?: string;
  /** Called with `true` when the note snaps shut and `false` when it opens. */
  onFoldChange?: (folded: boolean) => void;
  /** Folds and unfolds every two seconds until the user grabs or taps it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

function Half({ side, children, bg }: { side: "left" | "right"; children?: ReactNode; bg: string }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: bg, borderRadius: side === "left" ? "12px 0 0 12px" : "0 12px 12px 0", backfaceVisibility: "hidden" }}
    >
      <div className="absolute inset-0" style={{ width: NW, left: side === "left" ? 0 : -NW / 2 }}>
        {children}
      </div>
    </div>
  );
}

function Print({ title, amount, serial }: { title: string; amount: string; serial: string }) {
  return (
    <>
      <div className="absolute inset-[8px] rounded-[8px] border border-[#0d5c4a]/30" />
      <span className="absolute left-4 top-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d5c4a]">{title}</span>
      <span className="absolute right-4 top-2 text-[34px] font-bold leading-none tracking-[-0.04em] text-[#0d5c4a]">{amount}</span>
      <span className="absolute bottom-3 left-4 text-[10px] tracking-[0.18em] text-[#0d5c4a]/80">{serial}</span>
      <span className="absolute left-[44px] top-[42px] flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-[#0d5c4a]/40 text-[26px] text-[#0d5c4a]">
        ✦
      </span>
      <span className="absolute bottom-3 right-4 text-[26px] font-bold leading-none text-[#0d5c4a]/70">{amount}</span>
    </>
  );
}

/**
 * A credit note you can fold. Grab the right half and drag it over: it turns
 * on the centre crease in 3D, shading as it goes, and shows its printed back.
 * Let go past halfway and it snaps shut with a bounce; tap it to open again.
 */
export function FoldNote({
  title = "Store Credit",
  amount = "50",
  serial = "NOT LEGAL TENDER · SC 000042",
  backLabel = "Thanks",
  onFoldChange,
  autoplay = false,
  enableSound = true,
}: FoldNoteProps) {
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const angle = useMotionValue(0);
  const shade = useTransform(angle, [0, -90, -180], [0, 0.35, 0.1]);
  const lift = useTransform(angle, [0, -90, -180], [0, -14, -4]);
  const shadow = useTransform(angle, [0, -90, -180], [
    "0 20px 30px -18px rgba(0,0,0,.35)",
    "0 40px 50px -24px rgba(0,0,0,.45)",
    "0 14px 20px -12px rgba(0,0,0,.35)",
  ]);
  const shadowW = useTransform(angle, [0, -180], [NW, NW / 2]);
  const start = useRef(0);
  const moved = useRef(false);
  const touched = useRef(false);
  const folded = useRef(false);
  const onFoldRef = useRef(onFoldChange);
  const ctl = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    onFoldRef.current = onFoldChange;
    playRef.current = play;
  }, [onFoldChange, play]);

  const settle = useCallback(
    (to: number, byUser = false) => {
      ctl.current?.stop();
      ctl.current = animate(angle, to, { type: "spring", stiffness: 220, damping: 15 });
      const next = to <= -90;
      if (next !== folded.current) {
        folded.current = next;
        // Same sound for the visitor and for the autoplay demo; the demo's goes through `auto`.
        if (byUser) playRef.current(next ? "off" : "whoosh");
        else playRef.current.auto(next ? "off" : "whoosh");
        onFoldRef.current?.(next);
      }
    },
    [angle],
  );

  useEffect(() => () => ctl.current?.stop(), []);

  useEffect(() => {
    if (!autoplay) return;
    let open = true;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      settle(open ? -180 : 0);
      open = !open;
    }, 2000);
    return () => clearInterval(t);
  }, [autoplay, settle]);

  const toggle = () => settle(angle.get() < -90 ? 0 : -180, true);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div className="relative" style={{ width: NW, height: NH, perspective: 900, y: lift }}>
        <motion.div className="absolute left-0 top-0 h-full rounded-[12px]" style={{ boxShadow: shadow, width: shadowW }} />
        <div className="absolute left-0 top-0 h-full" style={{ width: NW / 2 }}>
          <Half side="left" bg={face}>
            <Print title={title} amount={amount} serial={serial} />
          </Half>
        </div>
        <motion.div
          className="absolute top-0 h-full cursor-grab touch-none rounded-[0_12px_12px_0] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:focus-visible:ring-[#2997ff]"
          style={{ left: NW / 2, width: NW / 2, rotateY: angle, transformOrigin: "0% 50%", transformStyle: "preserve-3d" }}
          onPointerDown={() => {
            touched.current = true;
            moved.current = false;
            ctl.current?.stop();
          }}
          onPanStart={() => {
            touched.current = true;
            ctl.current?.stop();
            start.current = angle.get();
          }}
          onPan={(_, info: PanInfo) => {
            moved.current = true;
            angle.set(Math.max(-180, Math.min(0, start.current + (info.offset.x / (NW / 2)) * 180 * 0.9)));
          }}
          onPanEnd={(_, info: PanInfo) => settle(angle.get() < -90 || info.velocity.x < -400 ? -180 : 0, true)}
          // framer's tap gesture also fires on Enter for a focused element
          onTap={() => {
            touched.current = true;
            if (moved.current) return;
            toggle();
          }}
          role="button"
          aria-label="Fold or unfold the note"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              touched.current = true;
              toggle();
            }
          }}
        >
          <Half side="right" bg={face}>
            <Print title={title} amount={amount} serial={serial} />
          </Half>
          <div
            className="absolute inset-0 overflow-hidden rounded-[12px_0_0_12px]"
            style={{ background: back, transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold uppercase tracking-[0.3em] text-[#0d5c4a]/70">
              {backLabel}
            </span>
          </div>
          <motion.div className="pointer-events-none absolute inset-0 rounded-[0_12px_12px_0] bg-black" style={{ opacity: shade }} />
        </motion.div>
        <div className="pointer-events-none absolute inset-y-[6px] left-1/2 w-px bg-[#0d5c4a]/20" />
      </motion.div>
      <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">Drag the right half over, or tap it.</span>
    </div>
  );
}
