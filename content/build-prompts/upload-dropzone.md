Add the "Upload Dropzone" component from Nexus UI to my project.

A file drop target with a list of uploads. While a file hovers, a little stack of sheets fans out over a tray and the dashed edge marches; when files land the tray squashes as it swallows them, each row fills a progress ring that turns into a drawn check, and rejected files shake the zone. Also includes Avatar Upload, a profile photo picker where you drag and zoom inside a circle and a ring draws itself around the avatar as it saves. Also includes Upload Queue, a list where each row is its own progress bar with pause, cancel and a whole-card drop target that counts the files. Also includes Empty Table: Ghost columns show the shape of the data. Drop a CSV or take the sample and a scan line reads down the table as cells fill in order, columns label their types and the count rolls up.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { UploadDropzone } from "@/components/upload-dropzone/upload-dropzone";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/upload-dropzone/upload-dropzone.tsx ---

```tsx
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
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
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
    (item: DropzoneItem, audible: boolean | "auto" = false) => {
      const say = audible === "auto" ? play.auto : audible ? play : undefined;
      const setProgress = (p: number) => patch(item.id, { progress: Math.max(0, Math.min(1, p)) });
      const job = item.file && onUploadRef.current ? onUploadRef.current(item.file, setProgress) : simulate(setProgress, item.size);
      job.then(
        () => {
          patch(item.id, { progress: 1, status: "done" });
          if (alive.current) setAnnounce(`${item.name} uploaded`);
          if (alive.current) say?.("done");
        },
        () => {
          patch(item.id, { status: "error", error: "Upload failed" });
          if (alive.current) setAnnounce(`${item.name} failed to upload`);
          if (alive.current) say?.("error");
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
        play.auto("drop");
        start(item, "auto");
        swallow();
      }, 900);
    }, 2900);
    return () => {
      clearInterval(t);
      clearTimeout(land);
    };
  }, [autoplay, start, swallow, uid, play]);

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
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Avatar Upload

Add the "Avatar Upload" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { AvatarUpload } from "@/components/upload-dropzone/avatar-upload";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/upload-dropzone/avatar-upload.tsx ---

```tsx
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
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Upload Queue

Add the "Upload Queue" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { UploadQueue } from "@/components/upload-dropzone/upload-queue";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/upload-dropzone/upload-queue.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type DragEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface UploadQueueProps {
  /** Called with the real files the user dropped or chose. The files are only listed; their contents are never read or sent. */
  onFiles?: (files: File[]) => void;
  /** Called with the file name when a row finishes its simulated transfer. */
  onComplete?: (name: string) => void;
  /** Called with the file name when a row is cancelled. */
  onCancel?: (name: string) => void;
  /** Drops three sample files in, pauses one and resumes it, in a loop, until someone presses or drops on the card. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

type ItemState = "up" | "paused" | "ok";
type Item = { id: number; name: string; size: number; done: number; state: ItemState; speed: number; audible: boolean | "auto" };

const TYPES: Record<string, string> = { pdf: "#ff3b30", fig: "#bf5af2", mp4: "#ff9f0a", zip: "#8e8e93", png: "#0a84ff", jpg: "#0a84ff", csv: "#30d158" };
const FALLBACK_COLOR = "#8e8e93";
const SAMPLES = [
  { name: "Brand guidelines.pdf", size: 8.4e6 },
  { name: "Homepage v3.fig", size: 22.1e6 },
  { name: "Launch film.mp4", size: 48.6e6 },
];
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const ROW_BTN =
  "flex h-8 w-8 items-center justify-center rounded-full outline-none hover:bg-black/5 dark:hover:bg-white/10";

const ext = (n: string) => (n.split(".").pop() || "").toLowerCase();
const mb = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} kB`);

/** Small seeded generator (mulberry32). Speeds come from here, so the demo looks the same every time. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** A repeatable 0.6 to 1.4 wobble for one row on one tick, so progress is not perfectly even. */
function wobble(id: number, tick: number) {
  const h = Math.imul(id * 374761393 + tick * 668265263, 1274126177) >>> 0;
  return 0.6 + ((h ^ (h >>> 13)) % 1000) / 1250;
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

const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

/**
 * An upload list where each row is its own progress bar: the row fills from
 * left to right as the file "goes up", with the size and time left counting
 * along. Pause a row and the fill turns to moving stripes; cancel and it
 * folds away; finish and the fill fades into a check. Drag files anywhere over
 * the card and it tells you how many it is about to take. Progress is
 * simulated: nothing is read or sent.
 */
export function UploadQueue({ onFiles, onComplete, onCancel, autoplay = false, enableSound = true, className }: UploadQueueProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [over, setOver] = useState(0);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("");
  const nextId = useRef(1);
  const depth = useRef(0);
  const tick = useRef(0);
  const rng = useRef<() => number>(seeded(2024));
  const finished = useRef<Set<number>>(new Set());

  const gate = useAutoplayGate(cardRef, autoplay, reduce);
  const playing = gate && !touched;

  // `audible` marks rows the user added; "auto" marks the autoplay demo rows, which sound through `play.auto`.
  const add = useCallback((files: { name: string; size: number }[], audible: boolean | "auto" = false) => {
    const made: Item[] = files.map((f) => ({
      id: nextId.current++,
      name: f.name,
      size: f.size,
      done: 0,
      state: "up",
      speed: 2.2e6 + rng.current() * 3.5e6,
      audible,
    }));
    setItems((xs) => [...xs, ...made]);
  }, []);

  // Simulated transfer, one tick every 100ms, and only while a row is actually going up.
  const active = items.some((x) => x.state === "up");
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      tick.current += 1;
      const n = tick.current;
      setItems((xs) =>
        xs.map((x) => {
          if (x.state !== "up") return x;
          const done = Math.min(x.size, x.done + x.speed * 0.1 * wobble(x.id, n));
          return { ...x, done, state: done >= x.size ? "ok" : "up" };
        }),
      );
    }, 100);
    return () => clearInterval(id);
  }, [active]);

  // Report finished rows once each.
  useEffect(() => {
    for (const x of items) {
      if (x.state === "ok" && !finished.current.has(x.id)) {
        finished.current.add(x.id);
        if (x.audible === "auto") play.auto("done");
        else if (x.audible) play("done");
        onComplete?.(x.name);
      }
    }
  }, [items, onComplete, play]);

  // Demo loop: drag three files over, drop them, pause one, resume it, clear.
  useEffect(() => {
    if (!playing) return;
    const ids: number[] = [];
    const at = (fn: () => void, t: number) => ids.push(window.setTimeout(fn, t));
    const loop = () => {
      at(() => {
        setOver(0);
        setItems([]);
      }, 0);
      at(() => setOver(3), 500);
      at(() => {
        setOver(0);
        setItems([]);
        play.auto("drop");
        add(SAMPLES, "auto");
      }, 1500);
      at(() => setItems((xs) => xs.map((x, i) => (i === 2 && x.state === "up" ? { ...x, state: "paused" } : x))), 3800);
      at(() => setItems((xs) => xs.map((x, i) => (i === 2 && x.state === "paused" ? { ...x, state: "up", speed: 9e6 } : x))), 6200);
      at(() => setItems([]), 13500);
      at(loop, 14000);
    };
    loop();
    return () => {
      ids.forEach(clearTimeout);
      setOver(0);
    };
  }, [playing, add, play]);

  const take = (list: File[]) => {
    if (!list.length) return;
    play("drop");
    add(list.map((f) => ({ name: f.name, size: Math.max(f.size, 2e5) })), true);
    setStatus(`${list.length} ${list.length === 1 ? "file" : "files"} added to the queue.`);
    onFiles?.(list);
  };
  const drop = {
    onDragEnter: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setTouched(true);
      depth.current += 1;
      setOver(e.dataTransfer.items?.length || 1);
    },
    onDragOver: (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    },
    onDragLeave: () => {
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setOver(0);
    },
    onDrop: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setOver(0);
      take(Array.from(e.dataTransfer.files));
    },
  };
  const toggle = (id: number) => {
    setTouched(true);
    setItems((xs) => xs.map((x) => (x.id === id && x.state !== "ok" ? { ...x, state: x.state === "up" ? "paused" : "up" } : x)));
  };
  const cancel = (x: Item) => {
    setTouched(true);
    setItems((xs) => xs.filter((y) => y.id !== x.id));
    setStatus(`${x.name} cancelled.`);
    onCancel?.(x.name);
  };
  const total = items.reduce((a, x) => a + x.size, 0);
  const sent = items.reduce((a, x) => a + x.done, 0);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-[460px] max-w-full overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-5 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.8)]",
        className,
      )}
      {...drop}
      onPointerDown={() => setTouched(true)}
    >
      <style>{`
@keyframes nx-uq-stripes{to{background-position:20px 0}}
.nx-uq-fill{background:color-mix(in srgb,var(--nx-uq-c) 12%,transparent);background-size:20px 20px}
.dark .nx-uq-fill{background:color-mix(in srgb,var(--nx-uq-c) 22%,transparent)}
.nx-uq-fill[data-paused]{background-image:linear-gradient(-45deg,color-mix(in srgb,var(--nx-uq-c) 18%,transparent) 25%,color-mix(in srgb,var(--nx-uq-c) 7%,transparent) 25%,color-mix(in srgb,var(--nx-uq-c) 7%,transparent) 50%,color-mix(in srgb,var(--nx-uq-c) 18%,transparent) 50%,color-mix(in srgb,var(--nx-uq-c) 18%,transparent) 75%,color-mix(in srgb,var(--nx-uq-c) 7%,transparent) 75%);background-color:transparent}
.dark .nx-uq-fill[data-paused]{background-image:linear-gradient(-45deg,color-mix(in srgb,var(--nx-uq-c) 32%,transparent) 25%,color-mix(in srgb,var(--nx-uq-c) 12%,transparent) 25%,color-mix(in srgb,var(--nx-uq-c) 12%,transparent) 50%,color-mix(in srgb,var(--nx-uq-c) 32%,transparent) 50%,color-mix(in srgb,var(--nx-uq-c) 32%,transparent) 75%,color-mix(in srgb,var(--nx-uq-c) 12%,transparent) 75%);background-color:transparent}
.nx-uq-fill[data-paused][data-motion]{animation:nx-uq-stripes 1s linear infinite}
`}</style>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">Assets</h3>
          <p className="m-0 truncate text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
            {items.length ? `${mb(sent)} of ${mb(total)}` : "Drop files anywhere on this card"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTouched(true);
            inputRef.current?.click();
          }}
          className={cn("h-9 flex-none rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
        >
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            take(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      <ul aria-label="Uploads" className="m-0 mt-4 flex min-h-[200px] list-none flex-col gap-2 p-0">
        <AnimatePresence initial={false}>
          {items.map((x) => {
            const p = x.done / x.size;
            const color = TYPES[ext(x.name)] ?? FALLBACK_COLOR;
            const left = x.state === "up" ? Math.max(1, Math.round((x.size - x.done) / x.speed)) : 0;
            return (
              <motion.li
                key={x.id}
                layout={!reduce}
                className="relative overflow-hidden rounded-[16px] bg-[#f5f5f7] dark:bg-[#2c2c2e]"
                style={{ "--nx-uq-c": color } as CSSProperties}
                initial={{ opacity: 0, height: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, height: 60, y: 0 }}
                exit={{ opacity: 0, height: 0, scale: reduce ? 1 : 0.96, transition: { duration: 0.25 } }}
                transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 32 }}
              >
                {/* the row is the progress bar */}
                <motion.span
                  className="nx-uq-fill absolute inset-y-0 left-0"
                  role="progressbar"
                  aria-label={`${x.name} upload progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(p * 100)}
                  data-paused={x.state === "paused" ? "" : undefined}
                  data-motion={reduce ? undefined : ""}
                  initial={{ width: "0%" }}
                  animate={{ width: `${p * 100}%`, opacity: x.state === "ok" ? 0 : 1 }}
                  transition={{ width: reduce ? { duration: 0.1 } : { type: "spring", stiffness: 90, damping: 22 }, opacity: { duration: 0.6, delay: 0.3 } }}
                />
                <div className="relative flex h-[60px] items-center gap-3 px-3">
                  <span
                    className="relative flex h-9 w-8 flex-none items-end justify-center rounded-[7px] pb-1 text-[8.5px] font-bold uppercase text-white"
                    style={{ background: color, clipPath: "polygon(0 0, 70% 0, 100% 26%, 100% 100%, 0 100%)" }}
                    aria-hidden="true"
                  >
                    {ext(x.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{x.name}</span>
                    <span className="block truncate text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
                      {x.state === "ok" ? mb(x.size) : x.state === "paused" ? `Paused · ${Math.round(p * 100)}%` : `${mb(x.done)} of ${mb(x.size)} · ${left}s left`}
                    </span>
                  </span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {x.state === "ok" ? (
                      <motion.span
                        key="ok"
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#34c759] dark:bg-[#30d158]"
                        initial={{ scale: 0, rotate: reduce ? 0 : -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 500, damping: 18 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                          <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ delay: reduce ? 0 : 0.1 }} />
                        </svg>
                        <span className="sr-only">Uploaded</span>
                      </motion.span>
                    ) : (
                      <motion.span key="ctl" className="flex flex-none gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : 0.8 }}>
                        <button
                          type="button"
                          onClick={() => toggle(x.id)}
                          aria-label={x.state === "paused" ? `Resume ${x.name}` : `Pause ${x.name}`}
                          className={cn(ROW_BTN, "text-[#1d1d1f] dark:text-[#f5f5f7]", FOCUS)}
                        >
                          {x.state === "paused" ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                              <path d="M3 1.5l7 4.5-7 4.5z" fill="currentColor" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                              <rect x="2" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" />
                              <rect x="7.4" y="1.5" width="2.6" height="9" rx="1" fill="currentColor" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancel(x)}
                          aria-label={`Cancel ${x.name}`}
                          className={cn(ROW_BTN, "text-[#6e6e73] dark:text-[#a1a1a6]", FOCUS)}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </button>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {!items.length && (
          <li className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#d2d2d7] text-[13px] text-[#6e6e73] dark:border-[#3a3a3c] dark:text-[#a1a1a6]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
            </svg>
            Nothing uploading
          </li>
        )}
      </ul>

      {/* whole-card drop target */}
      <AnimatePresence>
        {over > 0 && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[3px] dark:bg-[#1c1c1e]/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-3 rounded-[20px] border-2 border-dashed border-[#0071e3] dark:border-[#0a84ff]"
              initial={{ scale: reduce ? 1 : 1.04, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 1.04, opacity: 0 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 24 }}
            />
            <motion.div className="flex flex-col items-center gap-2" initial={{ y: reduce ? 0 : 10, scale: reduce ? 1 : 0.95 }} animate={{ y: 0, scale: 1 }}>
              <motion.span
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0071e3] text-white dark:bg-[#0a84ff]"
                animate={{ y: reduce ? 0 : [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
              </motion.span>
              <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Drop to upload {over} {over === 1 ? "file" : "files"}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Empty Table

Add the "Empty Table" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { EMPTY_TABLE_SAMPLE, EmptyTable } from "@/components/upload-dropzone/empty-table";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/upload-dropzone/empty-table.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type DragEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface EmptyTableData {
  /** File name shown in the row count ("248 rows from customers.csv"). */
  file: string;
  /** Column headings (up to four are shown). */
  cols: string[];
  /** The detected type badge of each column. */
  kinds: string[];
  /** The first rows, one array of cells per row. */
  rows: string[][];
  /** Total number of rows the count rolls up to. */
  total: number;
}

export interface EmptyTableProps {
  /** Heading of the table card. */
  title?: string;
  /** The table "Use sample data" loads, and the columns the ghost header shows. Defaults to a small customers file. */
  sample?: EmptyTableData;
  /** Called with the parsed table after a CSV is dropped or chosen, or the sample is loaded by hand. */
  onImport?: (table: EmptyTableData) => void;
  /** Drops the sample file in, shows the import, clears it and repeats, until someone touches the component. Never runs under reduced motion and pauses when off screen. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const EMPTY_TABLE_SAMPLE: EmptyTableData = {
  file: "customers.csv",
  cols: ["Name", "Email", "Plan", "MRR"],
  kinds: ["Text", "Email", "Option", "Currency"],
  rows: [
    ["Maya Chen", "maya@orbitly.example", "Pro", "$480"],
    ["Leo Park", "leo@meridian.example", "Team", "$1,200"],
    ["Ana Lima", "ana@vela.example", "Pro", "$480"],
    ["Kai Ito", "kai@quadrant.example", "Starter", "$90"],
    ["Noor Haddad", "noor@meridian.example", "Team", "$1,200"],
  ],
  total: 248,
};

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const MAX_BYTES = 2_000_000;

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

function guessKind(v: string) {
  if (/^\S+@\S+\.\S+$/.test(v)) return "Email";
  if (/^[$€£]?\s?[\d,.]+$/.test(v)) return /[$€£]/.test(v) ? "Currency" : "Number";
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return "Date";
  return "Text";
}

/** Reads a CSV in the browser: the header and the first five rows, with a type guessed from the first row. Nothing is uploaded. */
function parseCsv(name: string, text: string): EmptyTableData | null {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return null;
  const split = (l: string) => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/^"|"$/g, "").trim());
  const cols = split(lines[0]).slice(0, 4);
  const rows = lines.slice(1, 6).map((l) => split(l).slice(0, 4));
  return { file: name, cols, kinds: cols.map((_, i) => guessKind(rows[0]?.[i] ?? "")), rows, total: lines.length - 1 };
}

const template = (n: number) => (n === 4 ? "minmax(0,1.1fr) minmax(0,1.5fr) minmax(0,.95fr) minmax(0,.85fr)" : `repeat(${Math.max(1, n)}, minmax(0,1fr))`);

/**
 * An empty table that shows you exactly what goes where. Ghost columns wait
 * for data; drop a CSV (or take the sample) and a scan line reads down the
 * table while each cell fills in reading order, the columns label their
 * detected types, and the row count rolls up to the total. The file is read
 * in the browser and never sent anywhere. Under reduced motion the cells
 * simply fade in and the count settles quickly.
 */
export function EmptyTable({ title = "Customers", sample = EMPTY_TABLE_SAMPLE, onImport, autoplay = false, enableSound = true, className }: EmptyTableProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const raf = useRef(0);
  const touched = useRef(false);
  const [data, setData] = useState<EmptyTableData | null>(null);
  const [over, setOver] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(false);
  const active = useDemoActive(root, autoplay && !reduce);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /** Shows a table and rolls the row count up to its total; the done sound plays when the count lands. */
  const load = (t: EmptyTableData, from: "user" | "auto") => {
    cancelAnimationFrame(raf.current);
    setError(false);
    setData(t);
    setCount(0);
    if (from === "user") onImport?.(t);
    const delay = reduce ? 0 : 700;
    const span = reduce ? 250 : 900;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const k = Math.min(1, (now - t0 - delay) / span);
      setCount(Math.max(0, Math.round(t.total * (1 - Math.pow(1 - Math.max(0, k), 3)))));
      if (k < 1) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      if (from === "user") play("done", 0.5);
      else play.auto("done", 0.5);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const clear = () => {
    cancelAnimationFrame(raf.current);
    setData(null);
  };
  const readFile = (f?: File) => {
    if (!f) return;
    touched.current = true;
    if (f.size > MAX_BYTES) {
      setError(true);
      return;
    }
    void f.text().then((txt) => {
      const t = parseCsv(f.name, txt);
      if (t) load(t, "user");
      else setError(true);
    });
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ load, clear });
  useEffect(() => {
    latest.current = { load, clear };
  });

  // Demo: drag the sample over, drop it, read the table, clear it, repeat.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    let alive = true;
    const go = (fn: () => void, t: number) =>
      ids.push(
        window.setTimeout(() => {
          if (alive && !touched.current) fn();
        }, t),
      );
    const loop = () => {
      if (!alive || touched.current) return;
      go(() => latest.current.clear(), 50);
      go(() => setOver(true), 1000);
      go(() => {
        setOver(false);
        latest.current.load(sample, "auto");
      }, 1900);
      go(() => latest.current.clear(), 7000);
      ids.push(window.setTimeout(loop, 7400));
    };
    loop();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
      setOver(false);
    };
  }, [autoplay, reduce, active, sample]);

  const cols = data?.cols ?? sample.cols;
  const grid = { gridTemplateColumns: template(cols.length) };
  const drag = {
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      touched.current = true;
      setOver(true);
    },
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(false);
      readFile(e.dataTransfer.files[0]);
    },
  };

  return (
    <div
      ref={root}
      className={cn(
        "w-[560px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      {...drag}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
          <div className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{data ? `${count} rows from ${data.file}` : "No data yet"}</div>
        </div>
        {data && (
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              clear();
            }}
            className={cn("h-8 rounded-full bg-[#f5f5f7] px-3.5 text-[12.5px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
          >
            Clear
          </button>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {data ? `Imported ${data.total} rows from ${data.file}` : error ? "That file could not be read as a CSV" : ""}
      </span>
      <div role={data ? "table" : undefined} aria-label={data ? `${title} preview` : undefined} className="relative mt-4 overflow-hidden rounded-[16px] border border-black/[.07] dark:border-white/[.08]">
        {/* header: becomes typed columns once data lands */}
        <div role={data ? "row" : undefined} aria-hidden={data ? undefined : true} className="grid border-b border-black/[.07] bg-[#fafafa] dark:border-white/[.08] dark:bg-white/[.04]" style={grid}>
          {cols.map((c, i) => (
            <div key={i} role={data ? "columnheader" : undefined} className="flex min-w-0 items-center gap-1.5 px-3 py-2.5">
              <span className={cn("min-w-0 truncate text-[12px] font-semibold", data ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#c7c7cc] dark:text-[#48484a]")}>{c}</span>
              <AnimatePresence>
                {data && (
                  <motion.span
                    className="hidden flex-none rounded-[5px] bg-[#eef5ff] px-1 py-[1px] text-[9.5px] font-semibold text-[#0071e3] sm:inline dark:bg-[#0a84ff]/20 dark:text-[#6cb4ff]"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: reduce ? 0 : 1.1 + i * 0.08 }}
                  >
                    {data.kinds[i]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <div className="relative h-[230px]">
          <AnimatePresence mode="wait" initial={false}>
            {data ? (
              <motion.div key={"rows" + data.file} role="rowgroup" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {data.rows.map((r, ri) => (
                  <div key={ri} role="row" className="grid border-b border-black/[.05] dark:border-white/[.06]" style={grid}>
                    {r.map((cell, ci) => (
                      <motion.span
                        key={ci}
                        role="cell"
                        className={cn("truncate px-3 py-2.5 text-[13px]", ci === 1 ? "text-[#6e6e73] dark:text-[#a1a1a6]" : "text-[#1d1d1f] dark:text-[#f5f5f7]", ci === 3 && "tabular-nums")}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(5px)", x: -4 }}
                        animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                        transition={reduce ? { duration: 0.15 } : { delay: 0.25 + ri * 0.13 + ci * 0.04, duration: 0.3 }}
                      >
                        {cell}
                      </motion.span>
                    ))}
                  </div>
                ))}
                {/* the scan line reading down the table */}
                {!reduce && (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-[#0071e3]/10 to-transparent dark:via-[#0a84ff]/20"
                    initial={{ top: -40 }}
                    animate={{ top: 240, opacity: [1, 1, 0] }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                  >
                    <span className="absolute inset-x-0 top-1/2 h-px bg-[#0071e3]/50 dark:bg-[#0a84ff]/60" />
                  </motion.span>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                {/* ghost rows show the shape of what goes here */}
                <div aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <div key={k} className="grid border-b border-dashed border-black/[.06] dark:border-white/[.08]" style={grid}>
                      {[60, 80, 40, 50].slice(0, cols.length).map((w, c) => (
                        <span key={c} className="px-3 py-[15px]">
                          <span className="block h-2 rounded-full bg-[#f2f2f5] dark:bg-white/[.07]" style={{ width: `${w - k * 4}%` }} />
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center px-3 text-center backdrop-blur-[1.5px] transition-colors duration-200",
                    over ? "bg-[#eef5ff]/85 dark:bg-[#0a2540]/85" : "bg-white/70 dark:bg-[#1c1c1e]/70",
                  )}
                >
                  <motion.span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08),0_8px_18px_-10px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_8px_18px_-10px_rgba(0,0,0,.8)]"
                    animate={reduce ? undefined : { y: over ? -6 : 0, scale: over ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
                      <path d="M14 3v5h5M9 13h6M9 17h6" />
                    </svg>
                  </motion.span>
                  <span className="mt-3 text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{over ? "Drop to import" : "Bring in your customers"}</span>
                  <span className={cn("mt-0.5 text-[13px]", error ? "text-[#d70015] dark:text-[#ff453a]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>
                    {error ? "That didn't look like a CSV with a header row. Try another." : "Drop a CSV here. We'll detect the columns."}
                  </span>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        touched.current = true;
                        play("tap");
                        file.current?.click();
                      }}
                      className={cn("h-8 rounded-full bg-[#1d1d1f] px-3.5 text-[12.5px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
                    >
                      Upload CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        touched.current = true;
                        play("tap");
                        load(sample, "user");
                      }}
                      className={cn(
                        "h-8 rounded-full bg-white px-3.5 text-[12.5px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12)]",
                        FOCUS,
                      )}
                    >
                      Use sample data
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <input
        ref={file}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          readFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
