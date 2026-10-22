"use client";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface MorphingDialogProps {
  /** Name of the demo project. The delete dialog asks for it to be typed before the red button wakes up. */
  projectName?: string;
  /** Number of pages the delete dialog says will be removed. */
  pageCount?: number;
  /** Host and path the share link is built from, followed by the project name. */
  shareBase?: string;
  /** Called when the delete is confirmed. */
  onDelete?: () => void;
  /** Called when a deleted project is restored. */
  onRestore?: () => void;
  /** Opens Share, closes it, then opens Delete, types the name and confirms, restores, and repeats, until someone touches the component. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the frame. */
  className?: string;
}

type Kind = "share" | "delete";

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const FOCUS_RED = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d70015] dark:focus-visible:outline-[#ff453a]";
const DIALOG =
  "pointer-events-auto w-full max-w-[400px] bg-white p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,.45)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-20px_rgba(0,0,0,.9)]";
const GHOST_BTN = `h-9 rounded-full px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`;

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * Dialogs that grow out of the button that opened them and shrink back into
 * it when they close, so you always know where they came from. Share opens a
 * link panel; Delete opens a careful confirm that wants the project name
 * typed before the red button wakes up. Escape and the backdrop close it,
 * Tab stays inside the open dialog, and focus goes back to the button.
 */
export function MorphingDialog({
  projectName = "orbitly-site",
  pageCount = 14,
  shareBase = "nexus.app/p",
  onDelete,
  onRestore,
  autoplay = false,
  enableSound = true,
  className = "",
}: MorphingDialogProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const [open, setOpen] = useState<Kind | null>(null);
  const [typed, setTyped] = useState("");
  useTypedText(typed, enableSound);
  const [gone, setGone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viaAuto, setViaAuto] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const shareBtn = useRef<HTMLButtonElement>(null);
  const delBtn = useRef<HTMLButtonElement>(null);
  const focusTimer = useRef<number | undefined>(undefined);
  const copyTimer = useRef<number | undefined>(undefined);
  const touched = useRef(false);
  const active = useDemoActive(frame, autoplay && !reduce);
  const ok = typed === projectName;

  /** Every sound goes through here so the demo uses `play.auto` and the visitor uses `play`. */
  const sound = (auto: boolean, name: "lift" | "drop" | "tap", vol: number) => (auto ? play.auto(name, vol) : play(name, vol));

  const openDialog = (kind: Kind, auto = false) => {
    sound(auto, "lift", 0.5);
    setTyped("");
    setViaAuto(auto);
    setOpen(kind);
  };
  const closeDialog = (auto = false, silent = false) => {
    const was = open;
    if (!silent) sound(auto, "drop", 0.5);
    setOpen(null);
    setTyped("");
    if (!auto && was) {
      window.clearTimeout(focusTimer.current);
      focusTimer.current = window.setTimeout(() => (was === "share" ? shareBtn : delBtn).current?.focus(), 0);
    }
  };
  const confirmDelete = (auto = false) => {
    sound(auto, "tap", 0.5);
    setGone(true);
    setOpen(null);
    setTyped("");
    onDelete?.();
  };
  const restore = () => {
    setGone(false);
    onRestore?.();
  };

  // The latest handlers, read from the keyboard listener and the demo.
  const latest = useRef({ openDialog, closeDialog, confirmDelete, restore });
  useEffect(() => {
    latest.current = { openDialog, closeDialog, confirmDelete, restore };
  });

  useEffect(
    () => () => {
      window.clearTimeout(focusTimer.current);
      window.clearTimeout(copyTimer.current);
    },
    [],
  );

  // Escape closes; Tab stays inside the open dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        latest.current.closeDialog();
        return;
      }
      if (e.key !== "Tab") return;
      const items = layer.current?.querySelectorAll<HTMLElement>("button:not([disabled]), input, [href], [tabindex]:not([tabindex='-1'])");
      if (!items || !items.length) return;
      const first = items[0];
      const lastItem = items[items.length - 1];
      const at = document.activeElement;
      if (!layer.current?.contains(at)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && at === first) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && at === lastItem) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Demo: share, then delete (type the name, confirm), then restore.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    const at = (ms: number, fn: () => void) =>
      ids.push(
        window.setTimeout(() => {
          if (alive && !touched.current) fn();
        }, ms),
      );
    const run = () => {
      const a = latest.current;
      at(500, () => {
        a.closeDialog(true, true);
        setGone(false);
      });
      at(1400, () => a.openDialog("share", true));
      at(3400, () => a.closeDialog(true));
      at(4600, () => a.openDialog("delete", true));
      [...projectName].forEach((_, k) => at(5600 + k * 90, () => setTyped(projectName.slice(0, k + 1))));
      at(7200, () => a.confirmDelete(true));
      at(10000, () => a.restore());
      ids.push(window.setTimeout(run, 11800));
    };
    run();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, [autoplay, reduce, active, projectName]);

  const spring = reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 380, damping: 32 };
  const lid = (name: `${Kind}` | `${Kind}-t`) => (reduce ? undefined : `${uid}-${name}`);
  const fade = reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : {};
  const copyLink = () => {
    touched.current = true;
    void navigator.clipboard?.writeText(`https://${shareBase}/${projectName}`).catch(() => {});
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div
      ref={frame}
      className={`relative flex h-[420px] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-[#f5f5f7] dark:bg-black dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <LayoutGroup id={uid}>
        <div className="flex min-h-0 flex-1 flex-col" inert={open !== null}>
          <div className="flex items-center gap-3 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[0_1px_0_rgba(255,255,255,.08)]">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#0071e3] text-[15px] font-bold text-white">
              {(projectName[0] ?? "N").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{gone ? "Project deleted" : projectName}</div>
              <div className="text-[12.5px] text-[#6e6e73] dark:text-[#a1a1a6]">{gone ? "Restorable for 30 days" : "Edited 3 minutes ago"}</div>
            </div>
            {!gone && (
              <>
                {open === "share" ? (
                  <span className="h-9 px-4 text-[13px] opacity-0" aria-hidden="true">
                    Share
                  </span>
                ) : (
                  <motion.button
                    ref={shareBtn}
                    layoutId={lid("share")}
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => {
                      touched.current = true;
                      openDialog("share");
                    }}
                    className={`h-9 bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] ${FOCUS}`}
                    style={{ borderRadius: 18 }}
                  >
                    <motion.span layoutId={lid("share-t")} className="inline-block">
                      Share
                    </motion.span>
                  </motion.button>
                )}
                {open === "delete" ? (
                  <span className="h-9 px-4 text-[13px] opacity-0" aria-hidden="true">
                    Delete
                  </span>
                ) : (
                  <motion.button
                    ref={delBtn}
                    layoutId={lid("delete")}
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => {
                      touched.current = true;
                      openDialog("delete");
                    }}
                    className={`h-9 bg-[#fff1f0] px-4 text-[13px] font-medium text-[#c4271b] dark:bg-[#ff453a]/[.16] dark:text-[#ff6961] ${FOCUS_RED}`}
                    style={{ borderRadius: 18 }}
                  >
                    <motion.span layoutId={lid("delete-t")} className="inline-block">
                      Delete
                    </motion.span>
                  </motion.button>
                )}
              </>
            )}
            {gone && (
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  restore();
                }}
                className={`h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f] ${FOCUS}`}
              >
                Restore
              </button>
            )}
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2 p-4" aria-hidden="true">
            {Array.from({ length: 6 }, (_, k) => (
              <span key={k} className="rounded-[14px] bg-white dark:bg-[#1c1c1e]" />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              key="bg"
              aria-hidden="true"
              className="absolute inset-0 z-10 bg-black/25 backdrop-blur-[2px] dark:bg-black/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                touched.current = true;
                closeDialog();
              }}
            />
          )}
        </AnimatePresence>
        <div ref={layer} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4">
          <AnimatePresence>
            {open === "share" && (
              <motion.div key="share" layoutId={lid("share")} role="dialog" aria-modal="true" aria-labelledby={`${uid}-share-t`} className={DIALOG} style={{ borderRadius: 24 }} transition={spring} {...fade}>
                <motion.h3 layoutId={lid("share-t")} id={`${uid}-share-t`} className="m-0 inline-block text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Share
                </motion.h3>
                <motion.div initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.12 } }} exit={{ opacity: 0, transition: { duration: 0.08 } }}>
                  <p className="m-0 mt-1 text-[13.5px] text-[#6e6e73] dark:text-[#a1a1a6]">Anyone with the link can view.</p>
                  <div className="mt-4 flex h-11 items-center gap-2 rounded-[12px] bg-[#f5f5f7] pl-3.5 pr-1 dark:bg-[#1c1c1e]">
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {shareBase}/{projectName}
                    </span>
                    <button
                      type="button"
                      autoFocus={!viaAuto}
                      onClick={copyLink}
                      className={`h-9 rounded-[9px] bg-white px-3 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:shadow-none ${FOCUS}`}
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <span className="sr-only" role="status" aria-live="polite">
                    {copied ? "Link copied" : ""}
                  </span>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        touched.current = true;
                        closeDialog();
                      }}
                      className={GHOST_BTN}
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            {open === "delete" && (
              <motion.div key="delete" layoutId={lid("delete")} role="alertdialog" aria-modal="true" aria-labelledby={`${uid}-delete-t`} aria-describedby={`${uid}-delete-d`} className={DIALOG} style={{ borderRadius: 24 }} transition={spring} {...fade}>
                <motion.h3 layoutId={lid("delete-t")} id={`${uid}-delete-t`} className="m-0 inline-block text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Delete project?
                </motion.h3>
                <motion.div initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.12 } }} exit={{ opacity: 0, transition: { duration: 0.08 } }}>
                  <p id={`${uid}-delete-d`} className="m-0 mt-1 text-[13.5px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]">
                    This removes the site and its {pageCount} pages. Type <span className="font-mono font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{projectName}</span> to confirm.
                  </p>
                  <input
                    autoFocus={!viaAuto}
                    value={typed}
                    onChange={(e) => {
                      touched.current = true;
                      setTyped(e.target.value);
                    }}
                    aria-label="Project name"
                    spellCheck={false}
                    autoComplete="off"
                    className="mt-3 h-11 w-full rounded-[12px] bg-[#f5f5f7] px-3.5 font-mono text-[14px] text-[#1d1d1f] outline-none focus:outline-2 focus:outline-[#d70015] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:focus:outline-[#ff453a]"
                  />
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        touched.current = true;
                        closeDialog();
                      }}
                      className={GHOST_BTN}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="button"
                      disabled={!ok}
                      onClick={() => {
                        touched.current = true;
                        confirmDelete();
                      }}
                      className={`h-9 rounded-full bg-[#d70015] px-4 text-[13px] font-semibold text-white transition-colors disabled:bg-[#ffb3ae] dark:disabled:bg-[#5c2a28] dark:disabled:text-white/60 ${FOCUS_RED}`}
                      animate={{ scale: ok && !reduce ? [1, 1.06, 1] : 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      Delete forever
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
