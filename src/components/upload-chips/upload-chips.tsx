"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

interface Upload { id: number; name: string; size: number; progress: number }

export interface UploadChipsProps {
  accent?: string;
  /** Replace with your real upload; call onProgress(0..1) and resolve when done. */
  upload?: (file: File | { name: string; size: number }, onProgress: (p: number) => void) => Promise<void>;
  /** Drops sample files in by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const fakeUpload = (_f: unknown, onProgress: (p: number) => void) =>
  new Promise<void>((resolve) => {
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(1, p + 0.06 + Math.random() * 0.14);
      onProgress(p);
      if (p >= 1) { clearInterval(t); resolve(); }
    }, 180);
  });

const fmt = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const ext = (n: string) => (n.split(".").pop() || "").toUpperCase().slice(0, 4);
const SAMPLES = [
  { name: "brand-guide.pdf", size: 2_400_000 },
  { name: "hero-shot.png", size: 860_000 },
  { name: "q3-numbers.csv", size: 42_000 },
];

export function UploadChips({ accent = "#0071e3", upload = fakeUpload, autoplay = false, enableSound = true }: UploadChipsProps) {
  const play = useSound(enableSound);
  const id = useId();
  const [items, setItems] = useState<Upload[]>([]);
  const [over, setOver] = useState(false);
  const nextId = useRef(1);
  const touched = useRef(false);

  // `audible` is true for files the user dropped or chose, "auto" for the autoplay samples (they sound through `play.auto`).
  const start = (files: (File | { name: string; size: number })[], audible: boolean | "auto" = false) => {
    const say = audible === "auto" ? play.auto : audible ? play : undefined;
    if (files.length) say?.("tap");
    files.forEach((f) => {
      const uid = nextId.current++;
      setItems((list) => [...list, { id: uid, name: f.name, size: f.size, progress: 0 }]);
      upload(f, (p) => setItems((list) => list.map((u) => (u.id === uid ? { ...u, progress: p } : u)))).then(() => {
        say?.("done");
      });
    });
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      if (k % 4 === 3) setItems([]);
      else start([SAMPLES[k % 4]], "auto");
      k++;
    }, 1600);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-3 [--uc-edge:#d2d2d7] [--uc-fill:#ffffff] [--uc-track:#e8e8ed] dark:[--uc-edge:#48484a] dark:[--uc-fill:#2c2c2e] dark:[--uc-track:#3a3a3c]" onPointerDown={() => (touched.current = true)}>
      <motion.label
        htmlFor={id}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          touched.current = true;
          start(Array.from(e.dataTransfer.files), true);
        }}
        animate={{ scale: over ? 1.03 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-[22px] border-[1.5px] border-dashed px-6 py-7 text-center transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4"
        style={{ outlineColor: accent, borderColor: over ? accent : "var(--uc-edge)", backgroundColor: over ? `${accent}0f` : "var(--uc-fill)" }}
      >
        <motion.span animate={{ y: over ? -4 : 0 }} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f0f3] dark:bg-[#3a3a3c]" style={{ color: accent }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>
        </motion.span>
        <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Drop files or <span style={{ color: accent }}>browse</span></span>
        <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Anything up to 25 MB</span>
        <input id={id} type="file" multiple className="sr-only" onChange={(e) => { touched.current = true; start(Array.from(e.target.files ?? []), true); e.target.value = ""; }} />
      </motion.label>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        <AnimatePresence initial={false}>
          {items.map((u) => {
            const done = u.progress >= 1;
            return (
              <motion.li
                key={u.id}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="relative flex h-14 items-center gap-3 overflow-hidden rounded-2xl bg-white pl-2.5 pr-2 shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
              >
                <motion.span className="absolute inset-y-0 left-0 origin-left" style={{ background: `${accent}14`, width: "100%" }} initial={{ scaleX: 0 }} animate={{ scaleX: done ? 0 : u.progress, opacity: done ? 0 : 1 }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                <span className="relative flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#f0f0f3] text-[10px] font-bold tracking-wide text-[#6e6e73] dark:bg-[#3a3a3c] dark:text-[#a1a1a6]">{ext(u.name)}</span>
                <span className="relative flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{u.name}</span>
                  <span className="text-[12px] tabular-nums text-[#86868b] dark:text-[#98989d]">{done ? fmt(u.size) : `${Math.round(u.progress * 100)}% of ${fmt(u.size)}`}</span>
                </span>
                <span className="relative flex h-9 w-9 items-center justify-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {done ? (
                      <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 16 }} className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: accent }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.1 }} /></svg>
                      </motion.span>
                    ) : (
                      <motion.svg key="ring" exit={{ scale: 0 }} width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style={{ rotate: -90 }}>
                        <circle cx="11" cy="11" r="8.5" fill="none" stroke="var(--uc-track)" strokeWidth="2.5" />
                        <motion.circle cx="11" cy="11" r="8.5" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: u.progress }} />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </span>
                <button type="button" aria-label={`Remove ${u.name}`} onClick={() => setItems((l) => l.filter((x) => x.id !== u.id))} className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] hover:bg-black/5 hover:text-[#1d1d1f] dark:hover:bg-white/10 dark:hover:text-[#f5f5f7] focus-visible:outline focus-visible:outline-2" style={{ outlineColor: accent }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
