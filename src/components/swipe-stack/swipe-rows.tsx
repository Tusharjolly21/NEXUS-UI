"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform, type PanInfo } from "framer-motion";
import { useSound, type SoundPlayer } from "@/lib/ui-sounds";

/** Width of the inbox; swipe thresholds are fractions of it. */
const W = 320;
/** Past this the row archives on release. */
const ARCHIVE_AT = W * 0.42;
/** Past this (to the left) Delete swallows Flag and the row deletes on release. */
const DELETE_AT = W * 0.55;
const SNAP = { type: "spring", stiffness: 400, damping: 34 } as const;

export interface SwipeRowItem {
  id: string | number;
  /** Sender name; its first letter fills the avatar. */
  from: string;
  subject: string;
  /** Short time label on the right, e.g. "9:41". */
  time: string;
  /** Avatar colour. */
  color: string;
}

export const DEFAULT_SWIPE_MAIL: SwipeRowItem[] = [
  { id: 1, from: "Maya Chen", subject: "Board deck, final version", time: "9:41", color: "#ff9f0a" },
  { id: 2, from: "Stripe", subject: "Your payout is on the way", time: "8:02", color: "#5e5ce6" },
  { id: 3, from: "Leo Park", subject: "Can we move standup to 10?", time: "Yesterday", color: "#30d158" },
  { id: 4, from: "Figma", subject: "Ana commented on Onboarding", time: "Mon", color: "#ff375f" },
];

export type SwipeAction = "archive" | "delete";

export interface SwipeRowsProps {
  /** The rows to show, top to bottom. */
  items?: SwipeRowItem[];
  /** Heading at the top of the list. */
  title?: string;
  /** Called when the user archives a row (swipe right, or the right arrow key). */
  onArchive?: (item: SwipeRowItem) => void;
  /** Called when the user deletes a row (long swipe left, the Delete button, or Delete/Backspace). */
  onDelete?: (item: SwipeRowItem) => void;
  /** Called when the user taps Flag on a half-open row. The row closes again. */
  onFlag?: (item: SwipeRowItem) => void;
  /** Called when the user undoes the last archive or delete. */
  onUndo?: (item: SwipeRowItem, action: SwipeAction) => void;
  /** Swipes rows away by itself (archive, then delete, refilling the list) until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

function Row({
  m,
  onDone,
  onFlag,
  demo,
  play,
}: {
  m: SwipeRowItem;
  onDone: (id: SwipeRowItem["id"], how: SwipeAction, byUser: boolean) => void;
  onFlag: (m: SwipeRowItem) => void;
  demo?: SwipeAction;
  play: SoundPlayer;
}) {
  const x = useMotionValue(0);
  const right = useTransform(x, (v) => Math.max(0, v));
  const leftW = useTransform(x, (v) => Math.max(0, -v));
  const iconScaleA = useTransform(x, [0, 60, ARCHIVE_AT], [0.4, 1, 1.15]);
  const [arc, setArc] = useState(false);
  const [del, setDel] = useState(false);
  const [open, setOpen] = useState(false);
  const anim = useRef<ReturnType<typeof animate> | undefined>(undefined);

  useMotionValueEvent(x, "change", (v) => {
    setArc(v > ARCHIVE_AT);
    setDel(v < -DELETE_AT);
    setOpen(v < -70);
  });

  useEffect(() => () => anim.current?.stop(), []);

  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  });

  const finish = (how: SwipeAction, byUser: boolean) => {
    if (byUser) {
      play("swipe");
      play(how === "archive" ? "success" : "off", 0.5);
    }
    anim.current = animate(x, how === "archive" ? W : -W, { duration: 0.22, ease: "easeIn", onComplete: () => onDone(m.id, how, byUser) });
  };

  // The autoplay demo drags the row most of the way, then lets it fly.
  useEffect(() => {
    if (!demo) return;
    anim.current = animate(x, demo === "archive" ? W * 0.6 : -W * 0.7, {
      duration: 0.6,
      ease: [0.3, 0, 0.3, 1],
      onComplete: () => {
        playRef.current.auto("swipe");
        playRef.current.auto(demo === "archive" ? "success" : "off", 0.5);
        anim.current = animate(x, demo === "archive" ? W : -W, { duration: 0.22, ease: "easeIn", onComplete: () => onDone(m.id, demo, false) });
      },
    });
  }, [demo, x, m.id, onDone]);

  const onKey = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      finish("archive", true);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      finish("delete", true);
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 68 }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.25 } }}
      className="relative overflow-hidden border-b border-black/[.06] dark:border-white/[.08]"
    >
      <motion.div className="absolute inset-y-0 left-0 flex items-center pl-5" style={{ width: right, background: arc ? "#30d158" : "#8fd9a1" }} aria-hidden="true">
        <motion.svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ scale: iconScaleA }}
          animate={{ x: arc ? 6 : 0 }}
        >
          <path d="M3 7h18v4H3zM5 11v9h14v-9M10 15h4" />
        </motion.svg>
      </motion.div>
      <motion.div className="absolute inset-y-0 right-0 flex items-stretch justify-end overflow-hidden" style={{ width: leftW }}>
        <motion.button
          type="button"
          tabIndex={open && !del ? 0 : -1}
          aria-hidden={!open || del}
          onClick={() => {
            play("tap");
            onFlag(m);
            anim.current = animate(x, 0, SNAP);
          }}
          className="flex items-center justify-center overflow-hidden bg-[#ff9f0a] text-[13px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          animate={{ width: del ? 0 : "50%" }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        >
          Flag
        </motion.button>
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-hidden={!open}
          onClick={() => finish("delete", true)}
          className="flex flex-1 items-center justify-center bg-[#ff3b30] text-[13px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
        >
          Delete
        </button>
      </motion.div>
      <motion.div
        drag="x"
        dragMomentum={false}
        style={{ x }}
        tabIndex={0}
        role="group"
        aria-label={`${m.from}: ${m.subject}. Right arrow archives, Delete removes.`}
        onKeyDown={onKey}
        onDragStart={() => anim.current?.stop()}
        onDragEnd={(_, info: PanInfo) => {
          const v = x.get();
          if (v > ARCHIVE_AT || info.velocity.x > 900) finish("archive", true);
          else if (v < -DELETE_AT || info.velocity.x < -1100) finish("delete", true);
          else if (v < -70) anim.current = animate(x, -150, SNAP);
          else anim.current = animate(x, 0, SNAP);
        }}
        className="relative flex h-full cursor-grab touch-pan-y items-center gap-3 bg-white px-4 outline-none focus-visible:bg-[#f5f5f7] active:cursor-grabbing dark:bg-[#1c1c1e] dark:focus-visible:bg-[#2c2c2e]"
      >
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[12px] font-semibold text-white" style={{ background: m.color }} aria-hidden="true">
          {m.from[0]}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{m.from}</span>
            <span className="flex-none text-[11px] text-[#86868b] dark:text-[#98989d]">{m.time}</span>
          </span>
          <span className="truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{m.subject}</span>
        </span>
      </motion.div>
    </motion.li>
  );
}

const short = (s: string) => (s.length > 18 ? `${s.slice(0, 18)}…` : s);

/**
 * Inbox rows with swipe actions. Swipe right to archive: the green grows
 * behind the row and the icon jumps once you've gone far enough. Swipe left
 * to reveal Flag and Delete; keep going and Delete swallows Flag and takes
 * the row. Rows close up and an undo slips in.
 */
export function SwipeRows({ items = DEFAULT_SWIPE_MAIL, title = "Inbox", onArchive, onDelete, onFlag, onUndo, autoplay = false, enableSound = true }: SwipeRowsProps) {
  const play = useSound(enableSound);
  const [list, setList] = useState(items);
  const [last, setLast] = useState<{ m: SwipeRowItem; how: SwipeAction; at: number } | null>(null);
  const [demo, setDemo] = useState<Record<string, SwipeAction>>({});
  const touched = useRef(false);
  const listRef = useRef(list);
  const itemsRef = useRef(items);
  const cbs = useRef({ onArchive, onDelete, onFlag, onUndo });

  useEffect(() => {
    listRef.current = list;
  }, [list]);
  useEffect(() => {
    itemsRef.current = items;
    cbs.current = { onArchive, onDelete, onFlag, onUndo };
  });

  const done = useCallback((id: SwipeRowItem["id"], how: SwipeAction, byUser: boolean) => {
    const l = listRef.current;
    const at = l.findIndex((m) => m.id === id);
    if (at < 0) return;
    const m = l[at];
    setLast({ m, how, at });
    setList((cur) => cur.filter((x) => x.id !== id));
    if (byUser) (how === "archive" ? cbs.current.onArchive : cbs.current.onDelete)?.(m);
  }, []);

  const flag = useCallback((m: SwipeRowItem) => {
    touched.current = true;
    cbs.current.onFlag?.(m);
  }, []);

  const undo = () => {
    if (!last) return;
    touched.current = true;
    play("pop");
    setList((l) => {
      const n = [...l];
      n.splice(Math.min(last.at, n.length), 0, last.m);
      return n;
    });
    cbs.current.onUndo?.(last.m, last.how);
    setLast(null);
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const l = listRef.current;
      if (l.length <= 2) {
        setLast(null);
        setDemo({});
        setList(itemsRef.current);
        return;
      }
      const target = l[k % 2];
      if (target) setDemo({ [String(target.id)]: k % 2 ? "delete" : "archive" });
      k++;
    }, 1800);
    return () => clearInterval(t);
  }, [autoplay]);

  return (
    <div
      className="flex max-w-full flex-col items-center gap-3"
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <div
        className="relative max-w-full overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
        style={{ width: W, height: 300 }}
      >
        <div className="flex items-center justify-between border-b border-black/[.06] px-4 py-3 dark:border-white/[.08]">
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</span>
          <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">{list.length} unread</span>
        </div>
        <ul className="m-0 list-none p-0" aria-label={title}>
          <AnimatePresence initial={false}>
            {list.map((m) => (
              <Row key={m.id} m={m} onDone={done} onFlag={flag} demo={demo[String(m.id)]} play={play} />
            ))}
          </AnimatePresence>
        </ul>
        <AnimatePresence>
          {last && (
            <motion.div
              key={String(last.m.id)}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-full bg-[#1d1d1f] py-2 pl-4 pr-2 text-[13px] text-white dark:bg-[#3a3a3c]"
            >
              <span className="min-w-0 truncate">
                {last.how === "archive" ? "Archived" : "Deleted"} “{short(last.m.subject)}”
              </span>
              <button
                type="button"
                onClick={undo}
                className="flex-none rounded-full bg-white/15 px-3 py-1 font-semibold outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white"
              >
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <span role="status" className="sr-only">
          {last ? `${last.how === "archive" ? "Archived" : "Deleted"} ${last.m.subject}` : ""}
        </span>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Swipe a row left or right.</span>
    </div>
  );
}
