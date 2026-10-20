"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  danger?: boolean;
  done?: string;
}

const I = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ITEMS: MenuItem[] = [
  { id: "link", label: "Copy link", icon: I("M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"), done: "Link copied" },
  { id: "email", label: "Send by email", icon: I("M4 6h16v12H4zM4 7l8 6 8-6"), done: "Draft opened" },
  { id: "embed", label: "Embed", icon: I("M8 8l-4 4 4 4M16 8l4 4-4 4"), done: "Embed copied" },
  { id: "download", label: "Download", icon: I("M12 4v11M7 10l5 5 5-5M5 20h14"), done: "Downloading" },
  { id: "delete", label: "Delete", icon: I("M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"), danger: true, done: "Deleted" },
];

export interface StaggerMenuProps {
  label?: string;
  items?: MenuItem[];
  onSelect?: (id: string) => void;
  /** Opens and browses the menu by itself until the user interacts. */
  autoplay?: boolean;
}

export default function StaggerMenu({ label = "Share", items = ITEMS, onSelect, autoplay = false }: StaggerMenuProps) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const touched = useRef(false);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrap = useRef<HTMLDivElement>(null);

  const pick = (it: MenuItem) => {
    setOpen(false);
    setFlash(it.done ?? it.label);
    onSelect?.(it.id);
    setTimeout(() => setFlash(null), 1500);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (!autoplay) return;
    const ts: number[] = [];
    const cycle = () => {
      if (touched.current) return;
      setOpen(true);
      [0, 1, 2, 3].forEach((k) => ts.push(window.setTimeout(() => !touched.current && setHover(items[k].id), 700 + k * 380)));
      ts.push(window.setTimeout(() => !touched.current && pick(items[0]), 2500));
    };
    ts.push(window.setTimeout(cycle, 800));
    const loop = setInterval(cycle, 5200);
    return () => { clearInterval(loop); ts.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const onMenuKey = (e: KeyboardEvent) => {
    const i = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); itemRefs.current[(i + 1) % items.length]?.focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); itemRefs.current[(i - 1 + items.length) % items.length]?.focus(); }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrap} className="relative h-[290px] w-[240px]" onPointerDown={() => (touched.current = true)}>
      <motion.button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${uid}-menu`}
        onClick={() => { touched.current = true; setOpen((o) => !o); }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-10 items-center gap-2 overflow-hidden rounded-full bg-[#1d1d1f] pl-4 pr-3 text-[14px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={flash ?? "label"} layout initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} className="flex items-center gap-1.5">
            {flash ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} /></svg>
                {flash}
              </>
            ) : (
              label
            )}
          </motion.span>
        </AnimatePresence>
        <motion.svg layout animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`${uid}-menu`}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKey}
            onPointerLeave={() => setHover(null)}
            initial={{ opacity: 0, scale: 0.6, y: -8, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.85, y: -6, filter: "blur(6px)", transition: { duration: 0.16 } }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ transformOrigin: "24px 0px" }}
            className="absolute left-0 top-12 z-20 w-[220px] rounded-[18px] bg-white/95 p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_50px_-18px_rgba(0,0,0,.35)] backdrop-blur-xl"
          >
            {items.map((it, i) => (
              <div key={it.id}>
                {it.danger && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.05 + i * 0.04 }} className="mx-2 my-1 h-px bg-[#e8e8ed]" />}
                <motion.button
                  ref={(el) => { itemRefs.current[i] = el; }}
                  role="menuitem"
                  type="button"
                  onPointerEnter={() => setHover(it.id)}
                  onFocus={() => setHover(it.id)}
                  onClick={() => pick(it)}
                  initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 32, delay: 0.04 + i * 0.04 }}
                  className={`relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-medium outline-none ${it.danger ? "text-[#ff3b30]" : "text-[#1d1d1f]"}`}
                >
                  {hover === it.id && (
                    <motion.span layoutId={`${uid}-hl`} transition={{ type: "spring", stiffness: 520, damping: 38 }} className={`absolute inset-0 -z-0 rounded-xl ${it.danger ? "bg-[#ff3b30]/10" : "bg-[#f0f0f3]"}`} />
                  )}
                  <span className="relative">{it.icon}</span>
                  <span className="relative">{it.label}</span>
                </motion.button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
