"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type DropzoneItemStatus = "uploading" | "done" | "error";

export type DropzoneItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  /** 0-1 */
  progress: number;
  status: DropzoneItemStatus;
  error?: string;
  file?: File;
};

export type UploadDropzoneProps = {
  /** Same syntax as the `accept` attribute, e.g. `"image/*,.pdf"`. */
  accept?: string;
  /** Largest file accepted, in bytes. */
  maxSize?: number;
  multiple?: boolean;
  /** Called with every batch of accepted files. */
  onFiles?: (files: File[]) => void;
  /**
   * Upload one file and report progress (0-1). Resolve when done, reject to mark it failed.
   * Without it, uploads are simulated so the component works out of the box.
   */
  onUpload?: (file: File, setProgress: (progress: number) => void) => Promise<void>;
  /** Files shown on first render (e.g. already uploaded ones). Unfinished ones keep uploading. */
  initialFiles?: Array<{ name: string; size: number; type?: string; progress?: number }>;
  title?: string;
  /** Secondary line; defaults to the size limit. */
  hint?: string;
  /** Tint used while a file is dragged over, and for the browse link. Defaults to system blue. */
  accent?: string;
  /** Drops a few example files in by itself until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  disabled?: boolean;
  className?: string;
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0).replace(/\.0$/, "")} MB`;
}

function extensionOf(name: string, type: string) {
  const ext = name.includes(".") ? (name.split(".").pop() ?? "").toUpperCase() : "";
  if (ext) return ext.slice(0, 4);
  return (type.split("/")[1] ?? "FILE").toUpperCase().slice(0, 4);
}

const BADGE: Record<string, string> = {
  PNG: "#248a3d",
  JPG: "#248a3d",
  JPEG: "#248a3d",
  WEBP: "#248a3d",
  GIF: "#248a3d",
  HEIC: "#248a3d",
  SVG: "#0e7c86",
  MP4: "#0071e3",
  MOV: "#0071e3",
  WEBM: "#0071e3",
  MP3: "#8944ab",
  WAV: "#8944ab",
  PDF: "#d70015",
  ZIP: "#b25000",
  KEY: "#0071e3",
  FIG: "#8944ab",
  CSV: "#248a3d",
  DOC: "#0040dd",
  DOCX: "#0040dd",
};

const DEMO_FILES = [
  { name: "Keynote draft.pdf", size: 2_400_000, type: "application/pdf" },
  { name: "Cover shot.png", size: 1_240_000, type: "image/png" },
  { name: "Launch film.mp4", size: 4_600_000, type: "video/mp4" },
  { name: "Q3 numbers.csv", size: 84_000, type: "text/csv" },
];

function matchesAccept(file: { name: string; type: string }, accept?: string) {
  if (!accept) return true;
  const rules = accept
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => (rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule));
}

function simulate(setProgress: (p: number) => void, size: number) {
  return new Promise<void>((resolve) => {
    let p = 0;
    const speed = Math.max(0.07, Math.min(0.2, 380_000 / Math.max(size, 1)));
    const id = window.setInterval(() => {
      p = Math.min(1, p + speed * (0.5 + Math.random()));
      setProgress(p);
      if (p >= 1) {
        window.clearInterval(id);
        resolve();
      }
    }, 130);
  });
}

function FileGlyph({ label }: { label: string }) {
  const color = BADGE[label] ?? "#6e6e73";
  return (
    <span className="relative inline-block h-10 w-8 shrink-0">
      <svg viewBox="0 0 32 40" className="absolute inset-0 size-full" aria-hidden="true">
        <path d="M5 1.5h15.2L30.5 11.8V35A3.5 3.5 0 0 1 27 38.5H5A3.5 3.5 0 0 1 1.5 35V5A3.5 3.5 0 0 1 5 1.5Z" className="fill-[#f5f5f7] stroke-black/10 dark:fill-[#2c2c2e] dark:stroke-white/15" strokeWidth="1.2" />
        <path d="M20 1.8V9a3 3 0 0 0 3 3h7.2" className="fill-none stroke-black/10 dark:stroke-white/15" strokeWidth="1.2" />
      </svg>
      <span className="absolute -left-1.5 bottom-[7px] rounded-[5px] px-1 py-px text-[8px] font-bold leading-[11px] tracking-wide text-white" style={{ backgroundColor: color }}>
        {label}
      </span>
    </span>
  );
}

function Status({ value, status, still }: { value: number; status: DropzoneItemStatus; still: boolean }) {
  const r = 8.5;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid size-6 shrink-0 place-items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "done" ? (
          <motion.svg key="done" viewBox="0 0 24 24" className="size-6" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 15 }}>
            <circle cx="12" cy="12" r="10" fill="#30d158" />
            <motion.path
              d="M7.5 12.3 10.6 15.3 16.5 9"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={still ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.06 }}
            />
          </motion.svg>
        ) : status === "error" ? (
          <motion.svg key="err" viewBox="0 0 24 24" className="size-6" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 15 }}>
            <circle cx="12" cy="12" r="10" fill="#ff3b30" />
            <path d="M12 7.2v6M12 16.3v.4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          </motion.svg>
        ) : (
          <motion.svg key="ring" viewBox="0 0 24 24" className="size-6 -rotate-90" exit={{ scale: 0.6, opacity: 0 }}>
            <circle cx="12" cy="12" r={r} className="fill-none stroke-[#e5e5ea] dark:stroke-[#3a3a3c]" strokeWidth="2.6" />
            <motion.circle
              cx="12"
              cy="12"
              r={r}
              className="fill-none stroke-[#0071e3] dark:stroke-[#0a84ff]"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={false}
              animate={{ strokeDashoffset: c * (1 - value) }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Three sheets of paper over a tray. They fan out like a hand of cards while a file hovers. */
function Sheets({ open, gulp, still }: { open: boolean; gulp: MotionValue<number>; still: boolean }) {
  const squash = useSpring(gulp, { stiffness: 600, damping: 14 });
  const sx = useTransform(squash, (g) => 1 + g * 0.16);
  const sy = useTransform(squash, (g) => 1 - g * 0.2);
  const fan = open && !still;
  const sheet = "absolute bottom-[14px] left-1/2 h-[34px] w-[27px] rounded-[6px] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_4px_10px_-4px_rgba(0,0,0,.3)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_4px_10px_-4px_rgba(0,0,0,.8)]";
  const spring = { type: "spring" as const, stiffness: 420, damping: 18 };
  return (
    <div className="relative mb-2 h-[58px] w-[84px]" aria-hidden="true">
      <motion.span className={cn(sheet, "bg-[#e8f1fe] dark:bg-[#0a2b4d]")} style={{ x: "-50%", originY: 1 }} animate={{ rotate: fan ? -18 : -6, x: fan ? "-95%" : "-58%", y: fan ? -6 : 0 }} transition={spring} />
      <motion.span className={cn(sheet, "bg-[#fff3e0] dark:bg-[#3a2405]")} style={{ x: "-50%", originY: 1 }} animate={{ rotate: fan ? 18 : 6, x: fan ? "-5%" : "-42%", y: fan ? -6 : 0 }} transition={spring} />
      <motion.span className={cn(sheet, "bg-white dark:bg-[#3a3a3c]")} style={{ x: "-50%" }} animate={{ y: fan ? -14 : 0 }} transition={spring}>
        <span className="absolute inset-x-[5px] top-[8px] h-[2px] rounded-full bg-[#d2d2d7] dark:bg-[#636366]" />
        <span className="absolute inset-x-[5px] top-[13px] h-[2px] rounded-full bg-[#d2d2d7] dark:bg-[#636366]" />
        <span className="absolute left-[5px] right-[10px] top-[18px] h-[2px] rounded-full bg-[#d2d2d7] dark:bg-[#636366]" />
      </motion.span>
      <motion.span className="absolute bottom-0 left-1/2 h-[22px] w-[72px] rounded-b-[12px] rounded-t-[4px] bg-[var(--dz-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,.25)]" style={{ x: "-50%", scaleX: sx, scaleY: sy, originY: 1 }}>
        <span className="absolute inset-x-[22px] top-[7px] h-[3px] rounded-full bg-white/70" />
      </motion.span>
    </div>
  );
}

/**
 * A file drop target. While a file hovers, a little stack of sheets fans out
 * over a tray and the dashed edge starts marching; when files land the tray
 * squashes as it swallows them. Each file gets a row with a filling ring
 * that turns into a drawn check, and rejected files shake the zone.
 */
export function UploadDropzone({
  accept,
  maxSize = 5 * 1024 * 1024,
  multiple = true,
  onFiles,
  onUpload,
  initialFiles,
  title = "Drag a file here",
  hint,
  accent,
  autoplay = false,
  enableSound = true,
  disabled = false,
  className,
}: UploadDropzoneProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() === true;
  const uid = React.useId().replace(/:/g, "");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const shakeX = useMotionValue(0);
  const gulp = useMotionValue(0);
  const depth = React.useRef(0);
  const counter = React.useRef(0);
  const touched = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [flying, setFlying] = React.useState<{ id: number; label: string } | null>(null);
  const [announce, setAnnounce] = React.useState("");
  const [items, setItems] = React.useState<DropzoneItem[]>(() =>
    (initialFiles ?? []).map((f, i) => ({
      id: `${uid}-i${i}`,
      name: f.name,
      size: f.size,
      type: f.type ?? "",
      progress: f.progress ?? 0,
      status: (f.progress ?? 0) >= 1 ? "done" : "uploading",
    })),
  );
  const onUploadRef = React.useRef(onUpload);
  React.useEffect(() => {
    onUploadRef.current = onUpload;
  }, [onUpload]);
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const patch = React.useCallback((id: string, next: Partial<DropzoneItem>) => {
    if (!alive.current) return;
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const start = React.useCallback(
    (item: DropzoneItem, audible = false) => {
      const setProgress = (p: number) => patch(item.id, { progress: Math.max(0, Math.min(1, p)) });
      const job = item.file && onUploadRef.current ? onUploadRef.current(item.file, setProgress) : simulate(setProgress, item.size);
      job.then(
        () => {
          patch(item.id, { progress: 1, status: "done" });
          if (alive.current) setAnnounce(`${item.name} uploaded`);
          if (audible && alive.current) play("done");
        },
        () => {
          patch(item.id, { status: "error", error: "Upload failed" });
          if (alive.current) setAnnounce(`${item.name} failed to upload`);
          if (audible && alive.current) play("error");
        },
      );
    },
    [patch, play],
  );

  // Files handed in through `initialFiles` that still need to finish.
  const started = React.useRef(false);
  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    items.filter((i) => i.status === "uploading").forEach((i) => start(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the initial list
  }, []);

  const swallow = React.useCallback(() => {
    if (reduce) return;
    gulp.set(1);
    animate(gulp, 0, { type: "spring", stiffness: 300, damping: 12 });
  }, [gulp, reduce]);

  const addFiles = (list: FileList | File[]) => {
    if (disabled) return;
    const files = Array.from(list).slice(0, multiple ? undefined : 1);
    if (!files.length) return;
    const accepted: File[] = [];
    const next: DropzoneItem[] = [];
    let rejected = false;
    for (const file of files) {
      const tooBig = file.size > maxSize;
      const wrongType = !matchesAccept(file, accept);
      const item: DropzoneItem = {
        id: `${uid}-${counter.current++}`,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: tooBig || wrongType ? "error" : "uploading",
        error: tooBig ? `Over ${formatBytes(maxSize)}` : wrongType ? "Not supported" : undefined,
        file,
      };
      if (item.status === "error") rejected = true;
      else accepted.push(file);
      next.push(item);
    }
    setItems((prev) => (multiple ? [...prev, ...next] : next));
    next.filter((i) => i.status === "uploading").forEach((i) => start(i, true));
    // Rejected files get the error bump; otherwise the files landing in the tray get the drop.
    play(rejected ? "error" : "drop");
    if (accepted.length) {
      onFiles?.(accepted);
      swallow();
    }
    if (rejected) {
      if (!reduce) animate(shakeX, [0, -9, 8, -6, 5, -2, 0], { duration: 0.45 });
      setAnnounce(
        next
          .filter((i) => i.error)
          .map((i) => `${i.name}: ${i.error}`)
          .join(". "),
      );
    }
  };

  React.useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    let land: ReturnType<typeof setTimeout> | undefined;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const f = DEMO_FILES[k++ % DEMO_FILES.length];
      setDragging(true);
      setFlying({ id: k, label: extensionOf(f.name, f.type) });
      land = setTimeout(() => {
        setDragging(false);
        setFlying(null);
        if (touched.current) return;
        const item: DropzoneItem = { id: `${uid}-demo${k}`, name: f.name, size: f.size, type: f.type, progress: 0, status: "uploading" };
        setItems((prev) => [...prev, item].slice(-3));
        start(item);
        swallow();
      }, 900);
    }, 2900);
    return () => {
      clearInterval(t);
      clearTimeout(land);
    };
  }, [autoplay, start, swallow, uid]);

  const remove = (id: string) => setItems((list) => list.filter((i) => i.id !== id));
  const touch = () => {
    touched.current = true;
  };
  const sizeHint = hint ?? `Up to ${formatBytes(maxSize)}`;
  const lit = dragging || (hover && !disabled);

  return (
    <div
      className={cn("flex w-full max-w-[340px] flex-col gap-2.5", !accent && "[--dz-accent:#0071e3] dark:[--dz-accent:#0a84ff]", className)}
      style={accent ? ({ "--dz-accent": accent } as React.CSSProperties) : undefined}
      onPointerDown={touch}
      onKeyDown={touch}
      onDragEnter={touch}
    >
      <motion.div style={{ x: shakeX }} className="w-full">
        <motion.div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-label={`${title}. ${sizeHint}. Or press Enter to browse.`}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled) inputRef.current?.click();
            }
          }}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onDragEnter={(e) => {
            e.preventDefault();
            if (disabled) return;
            depth.current += 1;
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) e.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            depth.current = Math.max(0, depth.current - 1);
            if (depth.current === 0) setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            depth.current = 0;
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          animate={{ scale: dragging && !reduce ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className={cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] bg-white px-6 pb-6 pt-7 text-center outline-none",
            "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
            "focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <svg aria-hidden="true" className="pointer-events-none absolute inset-[7px] size-[calc(100%-14px)] overflow-visible [--dz-edge:#d2d2d7] dark:[--dz-edge:#48484a]">
            <motion.rect
              x="0.75"
              y="0.75"
              rx="17"
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              style={{ width: "calc(100% - 1.5px)", height: "calc(100% - 1.5px)", stroke: dragging ? "var(--dz-accent)" : "var(--dz-edge)" }}
              animate={dragging && !reduce ? { strokeDashoffset: [0, -24] } : { strokeDashoffset: 0 }}
              transition={dragging ? { duration: 0.6, ease: "linear", repeat: Infinity } : { duration: 0.2 }}
            />
          </svg>
          <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[var(--dz-accent)]" initial={false} animate={{ opacity: dragging ? 0.06 : 0 }} />

          <AnimatePresence>
            {flying ? (
              <motion.span
                key={flying.id}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 z-10"
                style={{ x: "-50%" }}
                initial={{ y: -46, rotate: -14, opacity: 0, scale: 1 }}
                animate={{ y: 44, rotate: 4, opacity: [0, 1, 1, 0], scale: [1, 1, 0.7] }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 13, opacity: { duration: 0.9, times: [0, 0.2, 0.75, 1] }, scale: { duration: 0.9 } }}
              >
                <FileGlyph label={flying.label} />
              </motion.span>
            ) : null}
          </AnimatePresence>

          <Sheets open={lit} gulp={gulp} still={reduce} />
          <span className="relative text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{dragging ? "Drop to upload" : title}</span>
          <span className="relative mt-0.5 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
            {sizeHint} <span aria-hidden="true">·</span> <span className="font-medium text-[#0066cc] dark:text-[#2997ff]">browse</span>
          </span>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            tabIndex={-1}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </motion.div>
      </motion.div>

      <ul className="flex w-full flex-col gap-1.5" aria-label="Files">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item) => {
            const label = extensionOf(item.name, item.type);
            return (
              <motion.li
                key={item.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, transition: { duration: 0.16 } }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className={cn(
                  "flex items-center gap-3 rounded-[18px] bg-white py-2 pl-3.5 pr-2 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_8px_20px_-16px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
                  item.status === "error" && "shadow-[0_0_0_1px_rgba(255,59,48,.45)] dark:shadow-[0_0_0_1px_rgba(255,69,58,.5)]",
                )}
              >
                <FileGlyph label={label} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{item.name}</span>
                  <span className={cn("block text-[11.5px] tabular-nums", item.status === "error" ? "text-[#d70015] dark:text-[#ff6961]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>
                    {item.status === "error" ? item.error : item.status === "done" ? formatBytes(item.size) : `${formatBytes(item.size * item.progress)} of ${formatBytes(item.size)}`}
                  </span>
                </span>
                <Status value={item.progress} status={item.status} still={reduce} />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-[#6e6e73] transition-colors hover:bg-[#f0f0f3] hover:text-[#1d1d1f] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-[#2c2c2e] dark:hover:text-[#f5f5f7] dark:focus-visible:outline-[#0a84ff]"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M2 2l6 6M8 2 2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
