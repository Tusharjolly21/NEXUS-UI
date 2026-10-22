"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export type FolderProject = {
  id: string;
  title: string;
  /** Optional cover photo (any URL you host). Without it the drawn art in `bg` is used. */
  image?: string;
  /** CSS background for the drawn cover. */
  bg?: string;
  /** Small line under the title in the preview, e.g. "Brand, 2026". */
  meta?: string;
  /** Adds an Open link to the preview. */
  href?: string;
};

export type ThreeDFolderProps = {
  /** Label under the folder. */
  title?: string;
  /** Up to three show as papers in the folder; the preview pages through all of them. */
  projects?: FolderProject[];
  /** Back panel and tab colour. */
  folderBackColor?: string;
  /** Front flap colour. */
  folderFrontColor?: string;
  /** Tab colour. Defaults to the back colour. */
  folderTabColor?: string;
  /** "sm" draws the folder at about 60% for dense grids. */
  size?: "sm" | "md";
  /** Called with the project id when a preview opens, and null when it closes. */
  onOpenProject?: (id: string | null) => void;
  /** Caption under the count. Empty string hides it. */
  hint?: string;
  /** Opens and closes the folder by itself until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const DEFAULT_PROJECTS: FolderProject[] = [
  { id: "atlas", title: "Atlas", meta: "Brand system, 2026", bg: "linear-gradient(160deg,#64d2ff 0%,#0a84ff 55%,#0040dd 100%)" },
  { id: "prism", title: "Prism", meta: "Product launch, 2026", bg: "linear-gradient(160deg,#ffb3e6 0%,#bf5af2 55%,#5e2bd6 100%)" },
  { id: "signal", title: "Signal", meta: "Campaign, 2025", bg: "linear-gradient(160deg,#ffd60a 0%,#ff9f0a 50%,#ff453a 100%)" },
];

const noop = () => () => {};
/** False on the server and during hydration, true after: keeps the portal out of SSR. */
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

const SPREAD = [
  { x: -84, y: -62, r: -14, rx: -7, rr: -4 },
  { x: 0, y: -92, r: 0, rx: 0, rr: 0 },
  { x: 84, y: -62, r: 14, rx: 7, rr: 4 },
];

function Cover({ p, className = "", style }: { p: FolderProject; className?: string; style?: CSSProperties }) {
  return (
    <span className={`relative block overflow-hidden ${className}`} style={{ background: p.bg ?? "linear-gradient(160deg,#d2d2d7,#86868b)", ...style }}>
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : (
        <span className="absolute inset-0" aria-hidden="true">
          <span className="absolute left-[12%] top-[12%] h-[9%] w-[46%] rounded-full bg-white/80" />
          <span className="absolute left-[12%] top-[26%] h-[5%] w-[30%] rounded-full bg-white/45" />
          <span className="absolute -bottom-[18%] -right-[22%] h-[78%] w-[92%] rounded-full bg-white/20" />
          <span className="absolute -bottom-[30%] right-[8%] h-[60%] w-[60%] rounded-full bg-white/15" />
        </span>
      )}
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.18),transparent_30%,rgba(0,0,0,.18))]" aria-hidden="true" />
    </span>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/**
 * A folder that swings open when you hover, focus or tap it. Its front flap
 * falls forward on a spring and the papers inside fan up out of it, each one
 * settling with a wobble. Pick a paper and it grows into a preview you can
 * page through with the arrow keys.
 */
export function ThreeDFolder({
  title = "Design Archive",
  projects = DEFAULT_PROJECTS,
  folderBackColor = "#3d9cf0",
  folderFrontColor = "#6cb8f6",
  folderTabColor,
  size = "md",
  onOpenProject,
  hint = "Hover or tap the folder.",
  autoplay = false,
  enableSound = true,
  className = "",
}: ThreeDFolderProps) {
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const openRef = useRef(false);
  const u = size === "sm" ? 0.62 : 1;
  const still = useReducedMotion() === true;
  const uid = useId().replace(/:/g, "");
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const touched = useRef(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const papers = projects.slice(0, 3);
  const shown = active === null ? null : projects[active];
  const tab = folderTabColor ?? folderBackColor;
  const W = 200 * u;
  const H = 150 * u;
  const PW = 92 * u;
  const PH = 118 * u;

  useEffect(() => {
    playRef.current = play;
    openRef.current = open;
  }, [play, open]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      playRef.current.auto(openRef.current ? "hush" : "whoosh", openRef.current ? 0.6 : 1);
      setOpen((o) => !o);
    }, 2200);
    return () => clearInterval(t);
  }, [autoplay]);

  const show = (i: number | null, from?: HTMLElement | null) => {
    if (i !== null && from) returnTo.current = from;
    if (i === null) play("hush", 0.5);
    else play("whoosh", 0.7);
    setActive(i);
    onOpenProject?.(i === null ? null : (projects[i]?.id ?? null));
  };
  const page = (d: number) => {
    if (active === null || projects.length === 0) return;
    const n = (active + d + projects.length) % projects.length;
    play("tick", 0.5);
    setActive(n);
    onOpenProject?.(projects[n]?.id ?? null);
  };

  useEffect(() => {
    if (active === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        play("hush", 0.5);
        setActive(null);
        onOpenProject?.(null);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, onOpenProject, play]);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (active === null && wasOpen.current) returnTo.current?.focus();
    wasOpen.current = active !== null;
  }, [active]);

  const flap = { type: "spring" as const, stiffness: still ? 500 : 240, damping: still ? 50 : 13 };
  const isOpen = open || active !== null;

  return (
    <LayoutGroup id={`folder-${uid}`}>
      <div
        className={`relative flex max-w-full flex-col items-center rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${size === "sm" ? "w-[168px] px-3 pb-4 pt-16" : "w-[300px] px-6 pb-6 pt-[92px]"} ${className}`}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          touched.current = true;
          setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          setOpen(false);
        }}
        onPointerDown={() => {
          touched.current = true;
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
        }}
      >
        <div className="relative" style={{ width: W, height: H, perspective: 700 * u }}>
          {/* Shadow */}
          <motion.span
            className="absolute left-1/2 rounded-[50%] bg-black/25 blur-[10px] dark:bg-black/60"
            style={{ width: W * 0.9, height: 16 * u, bottom: -10 * u, marginLeft: -W * 0.45 }}
            animate={{ scaleX: isOpen ? 1.08 : 0.94, opacity: isOpen ? 0.9 : 0.6 }}
            transition={flap}
            aria-hidden="true"
          />
          {/* Back panel + tab */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            style={{ height: H - 14 * u, transformOrigin: "50% 100%" }}
            animate={{ rotateX: isOpen ? 8 : 0 }}
            transition={flap}
            aria-hidden="true"
          >
            <span className="absolute" style={{ width: 74 * u, height: 22 * u, top: -14 * u, left: 14 * u, background: tab, borderRadius: `${10 * u}px ${10 * u}px 0 0` }} />
            <span className="absolute inset-0 rounded-[14px]" style={{ background: folderBackColor, borderRadius: 14 * u }} />
          </motion.div>

          {/* Papers */}
          {papers.map((p, i) => {
            const at = SPREAD[papers.length === 1 ? 1 : papers.length === 2 ? [0, 2][i] : i] ?? SPREAD[1];
            const taken = active !== null && projects[active]?.id === p.id;
            return (
              <div key={p.id} className="absolute bottom-0 left-1/2" style={{ width: PW, height: PH, marginLeft: -PW / 2, bottom: 8 * u, zIndex: i === 1 ? 4 : 3 }}>
                <motion.div
                  className="h-full w-full"
                  initial={false}
                  animate={
                    isOpen
                      ? { x: at.x * u, y: at.y * u, rotate: at.r, scale: 1 }
                      : { x: at.rx * u, y: 0, rotate: at.rr, scale: 0.94 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: still ? 500 : 210,
                    damping: still ? 50 : 11,
                    mass: 0.9,
                    delay: still ? 0 : isOpen ? 0.05 + i * 0.05 : (papers.length - 1 - i) * 0.03,
                  }}
                >
                  <motion.button
                    type="button"
                    tabIndex={isOpen ? 0 : -1}
                    aria-hidden={!isOpen}
                    aria-label={`Preview ${p.title}`}
                    onClick={(e) => {
                      touched.current = true;
                      show(projects.findIndex((q) => q.id === p.id), e.currentTarget);
                    }}
                    onFocus={() => {
                      touched.current = true;
                      setOpen(true);
                    }}
                    whileHover={{ y: -10 * u, scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="block h-full w-full rounded-[12px] bg-white p-[5px] text-left shadow-[0_8px_18px_-8px_rgba(0,0,0,.4)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
                    style={{ borderRadius: 12 * u, padding: 5 * u }}
                  >
                    {taken ? (
                      <span className="block h-[72%] w-full rounded-[8px] bg-[#f0f0f3] dark:bg-[#3a3a3c]" />
                    ) : (
                      <motion.span layoutId={`cover-${p.id}`} className="block h-[72%] w-full overflow-hidden" style={{ borderRadius: 8 * u }}>
                        <Cover p={p} className="h-full w-full" />
                      </motion.span>
                    )}
                    <span className="mt-[6px] block truncate px-[2px] font-semibold tracking-[-0.01em]" style={{ fontSize: Math.max(9, 12 * u) }}>
                      {p.title}
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            );
          })}

          {/* Front flap */}
          <motion.button
            type="button"
            aria-label={`${title}, ${projects.length} projects`}
            aria-expanded={isOpen}
            onClick={() => {
              touched.current = true;
              play(open ? "hush" : "whoosh", open ? 0.6 : 1);
              setOpen((o) => !o);
            }}
            className="absolute inset-x-0 bottom-0 z-10 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
            style={{ height: H - 34 * u, transformOrigin: "50% 100%", background: folderFrontColor, borderRadius: 14 * u }}
            initial={false}
            animate={{ rotateX: isOpen ? -34 : 0 }}
            transition={flap}
          >
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.45)_0%,rgba(255,255,255,0)_14%),linear-gradient(135deg,rgba(255,255,255,.18),transparent_55%)]" aria-hidden="true" />
            <span className="absolute inset-x-0 top-0 h-px bg-white/70" aria-hidden="true" />
            <span
              className="absolute bottom-[14%] left-1/2 -translate-x-1/2 whitespace-nowrap font-semibold uppercase text-white/85"
              style={{ fontSize: Math.max(8, 10 * u), letterSpacing: "0.24em" }}
              aria-hidden="true"
            >
              {title}
            </span>
          </motion.button>
        </div>

        <h3 className={`mt-5 font-semibold tracking-[-0.02em] ${size === "sm" ? "text-[14px]" : "text-[17px]"}`}>{title}</h3>
        <p className="mt-0.5 text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
        {hint && size !== "sm" ? <p className="mt-2 text-[12px] text-[#86868b] dark:text-[#98989d]">{hint}</p> : null}
      </div>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {shown ? (
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-md sm:p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => show(null)}
                >
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={shown.title}
                    className="relative w-full max-w-[560px] overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]"
                    initial={{ y: 24, scale: 0.96 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 24, scale: 0.96, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") page(1);
                      if (e.key === "ArrowLeft") page(-1);
                    }}
                  >
                    <motion.span layoutId={`cover-${shown.id}`} className="block aspect-[16/10] w-full overflow-hidden" style={{ borderRadius: 0 }}>
                      <Cover p={shown} className="h-full w-full" />
                    </motion.span>
                    <div className="flex items-center justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <h3 className="truncate text-[20px] font-semibold tracking-[-0.03em]">{shown.title}</h3>
                        <p className="mt-0.5 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                          {shown.meta ?? `${(active ?? 0) + 1} of ${projects.length}`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {projects.length > 1 ? (
                          <>
                            <button type="button" aria-label="Previous project" onClick={() => page(-1)} className="grid size-9 place-items-center rounded-full bg-[#f0f0f3] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]">
                              <Chevron dir="left" />
                            </button>
                            <button type="button" aria-label="Next project" onClick={() => page(1)} className="grid size-9 place-items-center rounded-full bg-[#f0f0f3] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]">
                              <Chevron dir="right" />
                            </button>
                          </>
                        ) : null}
                        {shown.href ? (
                          <a href={shown.href} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-full bg-[#0071e3] px-4 text-[13px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff]">
                            Open
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <button
                      ref={closeBtn}
                      type="button"
                      aria-label="Close preview"
                      onClick={() => show(null)}
                      className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/35 text-white backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </LayoutGroup>
  );
}

export default ThreeDFolder;
