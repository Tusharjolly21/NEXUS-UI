"use client";
import { useCallback, useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface AvatarUploadResult {
  /** The chosen file. Null for the built-in demo photo. */
  file: File | null;
  /** An object URL for the photo. It is revoked when the component unmounts or the photo is replaced, so use it while mounted. */
  src: string;
  zoom: number;
  x: number;
  y: number;
}

export interface AvatarUploadProps {
  /** Called when the simulated upload finishes with the framing the user chose. Nothing is ever sent anywhere. */
  onUpload?: (result: AvatarUploadResult) => void;
  /** Called after the avatar is removed. */
  onRemove?: () => void;
  /** Plays a self-running demo (a demo photo, a drag to frame, zoom, save) until someone presses or drops on the card. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

const D = 148; // avatar diameter
const PAD = 12;
const BOX = D + PAD * 2;
const R = D / 2 + 8;
const ARROW_STEP = 8;
type Phase = "empty" | "crop" | "uploading" | "done";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const BTN_SECONDARY =
  "h-9 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]";
const BTN_PRIMARY = "h-9 rounded-full bg-[#1d1d1f] px-5 text-[13px] font-medium text-white outline-none dark:bg-[#f5f5f7] dark:text-[#1d1d1f]";

/** A stand-in photo for the demo: a soft landscape drawn on a canvas. Only called from the autoplay demo. */
function demoPhoto() {
  const c = document.createElement("canvas");
  c.width = c.height = 600;
  const g = c.getContext("2d");
  if (!g) return "";
  const sky = g.createLinearGradient(0, 0, 0, 600);
  sky.addColorStop(0, "#ffb38a");
  sky.addColorStop(0.55, "#ffd9b8");
  sky.addColorStop(1, "#f6efe6");
  g.fillStyle = sky;
  g.fillRect(0, 0, 600, 600);
  g.fillStyle = "#fff6e8";
  g.beginPath();
  g.arc(380, 230, 70, 0, Math.PI * 2);
  g.fill();
  const hill = (y: number, col: string, a: number) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 600; x += 20) g.lineTo(x, y + Math.sin(x / 90 + a) * 26);
    g.lineTo(600, 600);
    g.lineTo(0, 600);
    g.fill();
  };
  hill(380, "#d9826b", 0.5);
  hill(440, "#a8525a", 2);
  hill(510, "#5e2f45", 4);
  return c.toDataURL("image/jpeg", 0.9);
}

/** True while an autoplay demo may run: enabled, on screen, tab visible, motion allowed. */
function useAutoplayGate(ref: RefObject<HTMLElement | null>, enabled: boolean, reduce: boolean) {
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, enabled]);
  return enabled && !reduce && inView && tabVisible;
}

const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));

/**
 * A profile photo picker that handles the whole job: drop or choose an image,
 * drag it around inside the circle and zoom to frame it, then save. A ring
 * draws itself around the avatar as it "uploads" and a check pops in when it's
 * done. Dragging a file over the avatar makes it reach out for it. The upload
 * is simulated: the photo never leaves the browser.
 */
export function AvatarUpload({ onUpload, onRemove, autoplay = false, enableSound = true, className }: AvatarUploadProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("empty");
  const [src, setSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const [over, setOver] = useState(false);
  const [moving, setMoving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ring = useMotionValue(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const blobUrl = useRef<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const ringAnim = useRef<AnimationPlaybackControls | null>(null);
  const moveAnims = useRef<AnimationPlaybackControls[]>([]);
  const demoSrc = useRef<string | null>(null);
  const depth = useRef(0);
  const zoomRef = useRef(zoom);
  const srcRef = useRef<string | null>(null);

  const S = D * zoom;
  const lim = (S - D) / 2;
  useEffect(() => {
    zoomRef.current = zoom;
    x.set(clamp(x.get(), lim));
    y.set(clamp(y.get(), lim));
  }, [lim, zoom, x, y]);

  const revoke = useCallback(() => {
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    blobUrl.current = null;
  }, []);
  const stopAnims = useCallback(() => {
    ringAnim.current?.stop();
    ringAnim.current = null;
    moveAnims.current.forEach((a) => a.stop());
    moveAnims.current = [];
  }, []);
  useEffect(
    () => () => {
      stopAnims();
      revoke();
    },
    [revoke, stopAnims],
  );

  const gate = useAutoplayGate(cardRef, autoplay, reduce);
  const playing = gate && !touched;

  const show = useCallback(
    (url: string) => {
      srcRef.current = url;
      setSrc(url);
      setZoom(1.2);
      x.set(0);
      y.set(0);
      setPhase("crop");
    },
    [x, y],
  );

  const load = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setNote("That file is not an image. Try a PNG or JPG.");
      play("error");
      return;
    }
    setNote("");
    play("drop");
    stopAnims();
    revoke();
    const url = URL.createObjectURL(f);
    blobUrl.current = url;
    fileRef.current = f;
    show(url);
    setStatus("Photo added. Drag or use the arrow keys to reposition, then save.");
  };

  /** Draws the ring over 1.8s, then marks the avatar done. `real` runs the optional callback; the demo does not. */
  const save = useCallback(
    (real: boolean) => {
      setPhase("uploading");
      ringAnim.current?.stop();
      ring.set(0);
      ringAnim.current = animate(ring, 1, {
        duration: reduce ? 0.4 : 1.8,
        ease: [0.4, 0, 0.2, 1],
        onComplete: () => {
          ringAnim.current = null;
          setPhase("done");
          if (real) {
            setStatus("Photo saved.");
            play("done");
            const current = srcRef.current;
            if (current) onUpload?.({ file: fileRef.current, src: current, zoom: zoomRef.current, x: x.get(), y: y.get() });
          } else play.auto("done");
        },
      });
    },
    [onUpload, play, reduce, ring, x, y],
  );

  const reset = useCallback(
    (real: boolean) => {
      stopAnims();
      revoke();
      fileRef.current = null;
      srcRef.current = null;
      setPhase("empty");
      setSrc(null);
      ring.set(0);
      if (real) {
        setStatus("Photo removed.");
        setNote("");
        onRemove?.();
      }
    },
    [onRemove, revoke, ring, stopAnims],
  );

  // Demo loop: reach, drop, frame, zoom, save, clear. Stops for good on the first touch.
  useEffect(() => {
    if (!playing) return;
    const ids: number[] = [];
    const at = (fn: () => void, t: number) => ids.push(window.setTimeout(fn, t));
    const loop = () => {
      at(() => reset(false), 0);
      at(() => setOver(true), 700);
      at(() => {
        setOver(false);
        demoSrc.current ??= demoPhoto();
        if (demoSrc.current) {
          play.auto("drop");
          show(demoSrc.current);
        }
      }, 1600);
      at(() => {
        const spring = { type: "spring", stiffness: 120, damping: 16 } as const;
        moveAnims.current = [animate(x, -18, spring), animate(y, 14, spring)];
      }, 2300);
      at(() => setZoom(1.6), 3000);
      at(() => save(false), 3900);
      at(() => reset(false), 8200);
      at(loop, 8600);
    };
    loop();
    return () => {
      ids.forEach(clearTimeout);
      setOver(false);
    };
  }, [playing, play, reset, save, show, x, y]);

  const touch = () => setTouched(true);
  const drag = {
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      touch();
      depth.current += 1;
      setOver(true);
    },
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDragLeave: () => {
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setOver(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      depth.current = 0;
      setOver(false);
      load(e.dataTransfer.files[0]);
    },
  };

  const choose = () => {
    touch();
    if (phase === "empty" || phase === "done") fileInput.current?.click();
  };
  const onFrameKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (phase !== "crop") return;
    const d: Record<string, [number, number]> = { ArrowLeft: [-ARROW_STEP, 0], ArrowRight: [ARROW_STEP, 0], ArrowUp: [0, -ARROW_STEP], ArrowDown: [0, ARROW_STEP] };
    const step = d[e.key];
    if (!step) return;
    e.preventDefault();
    x.set(clamp(x.get() + step[0], lim));
    y.set(clamp(y.get() + step[1], lim));
  };

  const busy = phase === "uploading" || phase === "done";
  const ringStroke = phase === "done" ? "stroke-[#34c759] dark:stroke-[#30d158]" : "stroke-[#0071e3] dark:stroke-[#0a84ff]";
  const hint =
    note ||
    (phase === "crop" ? "Drag to reposition, slide to zoom" : "PNG or JPG, drop it on the circle");
  return (
    <div
      ref={cardRef}
      onPointerDown={touch}
      className={cn(
        "flex w-[380px] max-w-full flex-col items-center rounded-[28px] bg-white px-5 pb-6 pt-7 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:px-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.8)]",
        className,
      )}
      {...drag}
    >
      <h3 className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Profile photo</h3>
      <p className={cn("m-0 mt-1 text-center text-[13px]", note ? "text-[#d70015] dark:text-[#ff453a]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>{hint}</p>

      <motion.div
        className="relative mt-6 max-w-full"
        style={{ width: BOX, height: BOX }}
        animate={{ scale: over && !reduce ? 1.06 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* progress ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${BOX} ${BOX}`} aria-hidden="true">
          <circle cx={BOX / 2} cy={BOX / 2} r={R} fill="none" strokeWidth="4" className={busy ? "stroke-[#ececf0] dark:stroke-[#3a3a3c]" : "stroke-transparent"} />
          <motion.circle
            cx={BOX / 2}
            cy={BOX / 2}
            r={R}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            className={cn("transition-[stroke] duration-300", ringStroke)}
            style={{ pathLength: ring }}
            animate={{ opacity: busy ? 1 : 0 }}
          />
          {over && (
            <motion.circle
              cx={BOX / 2}
              cy={BOX / 2}
              r={R}
              fill="none"
              strokeWidth="2.5"
              strokeDasharray="6 8"
              className="stroke-[#0071e3] dark:stroke-[#0a84ff]"
              initial={{ rotate: 0 }}
              animate={{ rotate: reduce ? 0 : 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ originX: "50%", originY: "50%" }}
            />
          )}
        </svg>
        <button
          type="button"
          onClick={choose}
          onKeyDown={onFrameKey}
          aria-label={phase === "empty" ? "Choose a profile photo" : phase === "crop" ? "Photo frame. Drag, or use the arrow keys, to reposition." : "Profile photo"}
          className={cn("absolute overflow-hidden rounded-full bg-[#f5f5f7] outline-none dark:bg-[#2c2c2e]", FOCUS)}
          style={{ left: PAD, top: PAD, width: D, height: D, cursor: phase === "crop" ? "grab" : "pointer" }}
        >
          <AnimatePresence initial={false}>
            {src ? (
              <motion.img
                key={src}
                src={src}
                alt=""
                draggable={false}
                drag={phase === "crop"}
                dragConstraints={{ left: -lim, right: lim, top: -lim, bottom: lim }}
                dragElastic={0.15}
                onDragStart={() => {
                  touch();
                  setMoving(true);
                }}
                onDragEnd={() => setMoving(false)}
                className="absolute max-w-none select-none object-cover"
                style={{ x, y, width: S, height: S, left: (D - S) / 2, top: (D - S) / 2 }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.15, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.2, 0, 0, 1] }}
              />
            ) : (
              <motion.span key="empty" className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#6e6e73] dark:text-[#a1a1a6]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="text-[34px] font-semibold tracking-[-0.02em] text-[#c7c7cc] dark:text-[#48484a]" aria-hidden="true">MC</span>
                <span className="flex items-center gap-1 text-[12px] font-medium">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                  Add photo
                </span>
              </motion.span>
            )}
          </AnimatePresence>
          {/* thirds grid while you reposition */}
          <AnimatePresence>
            {moving && (
              <motion.span
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, transparent 33%, rgba(255,255,255,.6) 33%, rgba(255,255,255,.6) calc(33% + 1px), transparent calc(33% + 1px), transparent 66%, rgba(255,255,255,.6) 66%, rgba(255,255,255,.6) calc(66% + 1px), transparent calc(66% + 1px)), linear-gradient(transparent 33%, rgba(255,255,255,.6) 33%, rgba(255,255,255,.6) calc(33% + 1px), transparent calc(33% + 1px), transparent 66%, rgba(255,255,255,.6) 66%, rgba(255,255,255,.6) calc(66% + 1px), transparent calc(66% + 1px))",
                }}
              />
            )}
          </AnimatePresence>
          {over && (
            <span className="absolute inset-0 flex items-center justify-center bg-[#0071e3]/15 text-[13px] font-semibold text-[#0071e3] backdrop-blur-[2px] dark:bg-[#0a84ff]/20 dark:text-[#0a84ff]">
              Drop to use
            </span>
          )}
        </button>
        <AnimatePresence>
          {phase === "done" && (
            <motion.span
              className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#34c759] ring-4 ring-white dark:bg-[#30d158] dark:ring-[#1c1c1e]"
              initial={{ scale: 0, rotate: reduce ? 0 : -60 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 16 }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ delay: reduce ? 0 : 0.15 }} />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          load(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div className="mt-5 flex h-[84px] w-full flex-col items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "crop" ? (
            <motion.div key="crop" className="flex w-full flex-col items-center gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <label className="flex w-full max-w-[260px] items-center gap-3">
                <span className="sr-only">Zoom</span>
                <svg width="12" height="12" viewBox="0 0 24 24" className="fill-[#a1a1a6] dark:fill-[#8e8e93]" aria-hidden="true">
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                </svg>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => {
                    touch();
                    setZoom(+e.target.value);
                  }}
                  className={cn("h-1 min-w-0 flex-1 cursor-pointer accent-[#1d1d1f] dark:accent-[#f5f5f7]", FOCUS)}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" className="fill-[#a1a1a6] dark:fill-[#8e8e93]" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="4" />
                </svg>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    touch();
                    reset(true);
                  }}
                  className={cn(BTN_SECONDARY, FOCUS)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    touch();
                    save(true);
                  }}
                  className={cn(BTN_PRIMARY, FOCUS)}
                >
                  Save
                </button>
              </div>
            </motion.div>
          ) : phase === "uploading" ? (
            <motion.span key="up" className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Uploading…
            </motion.span>
          ) : phase === "done" ? (
            <motion.div key="done" className="flex gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button
                type="button"
                onClick={() => {
                  touch();
                  fileInput.current?.click();
                }}
                className={cn(BTN_SECONDARY, FOCUS)}
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => {
                  touch();
                  reset(true);
                }}
                className="h-9 rounded-full px-4 text-[13px] font-medium text-[#d70015] outline-none hover:bg-[#fff1f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff3b30] dark:text-[#ff453a] dark:hover:bg-[#ff453a]/15 dark:focus-visible:outline-[#ff453a]"
              >
                Remove
              </button>
            </motion.div>
          ) : (
            <motion.button key="pick" type="button" onClick={choose} className={cn(BTN_PRIMARY, FOCUS)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Choose photo
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {phase === "uploading" ? "Uploading photo" : status}
      </span>
    </div>
  );
}
