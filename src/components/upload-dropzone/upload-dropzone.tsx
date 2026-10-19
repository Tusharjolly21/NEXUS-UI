"use client";

import * as React from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Check, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropzoneItemStatus = "uploading" | "done" | "error";

export type DropzoneItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  /** 0–1 */
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
   * Upload one file and report progress (0–1). Resolve when done, reject to mark it failed.
   * Without it, uploads are simulated so the component works out of the box.
   */
  onUpload?: (file: File, setProgress: (progress: number) => void) => Promise<void>;
  /** Files shown on first render (e.g. already uploaded ones). Unfinished ones keep uploading. */
  initialFiles?: Array<{ name: string; size: number; type?: string; progress?: number }>;
  title?: string;
  /** Secondary line; defaults to the size limit. */
  hint?: string;
  /** Tint used while a file is dragged over. */
  accent?: string;
  disabled?: boolean;
  className?: string;
};

const SHAKE = [0, -9, 8, -6, 5, -2, 0];

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0).replace(/\.0$/, "")} MB`;
}

function extensionOf(name: string, type: string) {
  const ext = name.includes(".") ? name.split(".").pop()!.toUpperCase() : "";
  if (ext) return ext.slice(0, 4);
  return (type.split("/")[1] ?? "FILE").toUpperCase().slice(0, 4);
}

const BADGE_COLORS: Record<string, string> = {
  PNG: "#16a34a",
  JPG: "#16a34a",
  JPEG: "#16a34a",
  WEBP: "#16a34a",
  GIF: "#16a34a",
  SVG: "#0d9488",
  MP4: "#2563eb",
  MOV: "#2563eb",
  WEBM: "#2563eb",
  MP3: "#7c3aed",
  WAV: "#7c3aed",
  PDF: "#dc2626",
  ZIP: "#d97706",
  FIG: "#c026d3",
  CSV: "#059669",
  DOC: "#1d4ed8",
  DOCX: "#1d4ed8",
};

function matchesAccept(file: { name: string; type: string }, accept?: string) {
  if (!accept) return true;
  const rules = accept.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) =>
    rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule,
  );
}

let uid = 0;
const nextId = () => `f${Date.now().toString(36)}${(uid++).toString(36)}`;

function simulate(setProgress: (p: number) => void, size: number) {
  return new Promise<void>((resolve) => {
    let p = 0;
    const speed = Math.max(0.06, Math.min(0.22, 400_000 / Math.max(size, 1)));
    const id = window.setInterval(() => {
      p = Math.min(1, p + speed * (0.5 + Math.random()));
      setProgress(p);
      if (p >= 1) {
        window.clearInterval(id);
        resolve();
      }
    }, 120);
  });
}

function FileGlyph({ label }: { label: string }) {
  const color = BADGE_COLORS[label] ?? "#57534e";
  return (
    <span className="relative inline-block h-10 w-8 shrink-0">
      <svg viewBox="0 0 32 40" className="absolute inset-0 size-full" aria-hidden>
        <path
          d="M5 1.5h15.2L30.5 11.8V35A3.5 3.5 0 0 1 27 38.5H5A3.5 3.5 0 0 1 1.5 35V5A3.5 3.5 0 0 1 5 1.5Z"
          className="fill-white stroke-black/15 dark:fill-[#202028] dark:stroke-white/15"
          strokeWidth="1.2"
        />
        <path d="M20 1.8V9a3 3 0 0 0 3 3h7.2" className="fill-none stroke-black/15 dark:stroke-white/15" strokeWidth="1.2" />
      </svg>
      <span
        className="absolute -left-1.5 bottom-[7px] rounded-[5px] px-1 py-px text-[8px] font-bold leading-[11px] tracking-wide text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    </span>
  );
}

function ProgressRing({ value, status }: { value: number; status: DropzoneItemStatus }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid size-6 shrink-0 place-items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "done" ? (
          <motion.span
            key="done"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 18 }}
            className="grid size-5 place-items-center rounded-full bg-green-600 text-white"
          >
            <Check className="size-3" strokeWidth={3.2} aria-hidden />
          </motion.span>
        ) : status === "error" ? (
          <motion.span key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-5 place-items-center rounded-full bg-red-500 text-white">
            <X className="size-3" strokeWidth={3.2} aria-hidden />
          </motion.span>
        ) : (
          <motion.svg key="ring" viewBox="0 0 24 24" className="size-6 -rotate-90" exit={{ scale: 0.6, opacity: 0 }}>
            <circle cx="12" cy="12" r={r} className="fill-none stroke-black/10 dark:stroke-white/10" strokeWidth="2.5" />
            <motion.circle
              cx="12"
              cy="12"
              r={r}
              className="fill-none stroke-[#17181A] dark:stroke-white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={c}
              animate={{ strokeDashoffset: c * (1 - value) }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}

export function UploadDropzone({
  accept,
  maxSize = 5 * 1024 * 1024,
  multiple = true,
  onFiles,
  onUpload,
  initialFiles,
  title = "Drag a file here",
  hint,
  accent = "#0071e3",
  disabled = false,
  className,
}: UploadDropzoneProps) {
  const reduce = useReducedMotion();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const shake = useAnimationControls();
  const depth = React.useRef(0);
  const [dragging, setDragging] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const [items, setItems] = React.useState<DropzoneItem[]>(() =>
    (initialFiles ?? []).map((f) => ({
      id: nextId(),
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

  const patch = React.useCallback((id: string, next: Partial<DropzoneItem>) => {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  const start = React.useCallback(
    (item: DropzoneItem) => {
      const setProgress = (p: number) => patch(item.id, { progress: Math.max(0, Math.min(1, p)) });
      const job =
        item.file && onUploadRef.current ? onUploadRef.current(item.file, setProgress) : simulate(setProgress, item.size);
      job.then(
        () => {
          patch(item.id, { progress: 1, status: "done" });
          setAnnounce(`${item.name} uploaded`);
        },
        () => {
          patch(item.id, { status: "error", error: "Upload failed" });
          setAnnounce(`${item.name} failed to upload`);
        },
      );
    },
    [patch],
  );

  // files handed in through `initialFiles` that still need to finish
  const started = React.useRef(false);
  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    items.filter((i) => i.status === "uploading").forEach(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the initial list
  }, []);

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
        id: nextId(),
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
    next.filter((i) => i.status === "uploading").forEach(start);
    if (accepted.length) onFiles?.(accepted);
    if (rejected) {
      void shake.start({ x: reduce ? 0 : SHAKE, transition: { duration: 0.45 } });
      setAnnounce(next.filter((i) => i.error).map((i) => `${i.name}: ${i.error}`).join(". "));
    }
  };

  const remove = (id: string) => setItems((list) => list.filter((i) => i.id !== id));

  const sizeHint = hint ?? `Up to ${formatBytes(maxSize)}`;

  return (
    <div className={cn("flex w-full max-w-[320px] flex-col items-center gap-3", className)}>
      <motion.div
        animate={shake}
        className="w-full"
      >
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
          animate={{ y: dragging && !reduce ? -4 : 0, scale: dragging && !reduce ? 1.015 : 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className={cn(
            "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-[22px] bg-white px-6 py-8 text-center outline-none",
            "shadow-[0_1px_2px_rgba(16,17,20,0.05),0_12px_30px_-18px_rgba(16,17,20,0.25)] transition-shadow dark:bg-[#17171d] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]",
            "focus-visible:ring-2 focus-visible:ring-[#17181A] focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#0b0b10]",
            dragging && "shadow-[0_1px_2px_rgba(16,17,20,0.05),0_22px_40px_-20px_rgba(16,17,20,0.4)]",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {/* dashed edge that marches while a file hovers */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-[6px] size-[calc(100%-12px)] overflow-visible [--dz-edge:rgba(23,24,26,0.14)] dark:[--dz-edge:rgba(255,255,255,0.16)]"
          >
            <motion.rect
              x="0.75"
              y="0.75"
              rx="16"
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              className="transition-[stroke] duration-200"
              style={{ width: "calc(100% - 1.5px)", height: "calc(100% - 1.5px)", stroke: dragging ? accent : "var(--dz-edge)" }}
              animate={dragging && !reduce ? { strokeDashoffset: [0, -24] } : { strokeDashoffset: 0 }}
              transition={dragging ? { duration: 0.6, ease: "linear", repeat: Infinity } : { duration: 0.2 }}
            />
          </svg>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{ backgroundColor: accent }}
            initial={false}
            animate={{ opacity: dragging ? 0.07 : 0 }}
          />

          <motion.span
            animate={dragging && !reduce ? { y: -3, scale: 1.08 } : { y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="relative mb-2 grid size-10 place-items-center rounded-[12px] bg-black/[0.05] text-[#17181A] dark:bg-white/[0.07] dark:text-neutral-100"
          >
            <span className="grid place-items-center transition-colors" style={dragging ? { color: accent } : undefined}>
              <Upload className="size-[18px]" strokeWidth={2.2} aria-hidden />
            </span>
          </motion.span>
          <span className="relative text-[14px] font-semibold text-[#17181A] dark:text-neutral-50">
            {dragging ? "Drop to upload" : title}
          </span>
          <span className="relative text-[12px] text-[#73726d] dark:text-neutral-400">{sizeHint}</span>

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
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const label = extensionOf(item.name, item.type);
            return (
              <motion.li
                key={item.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={cn(
                  "flex items-center gap-3 rounded-[16px] bg-white py-2 pl-3.5 pr-2 shadow-[0_1px_2px_rgba(16,17,20,0.05),0_6px_16px_-12px_rgba(16,17,20,0.25)] dark:bg-[#17171d]",
                  item.status === "error" && "ring-1 ring-red-500/30",
                )}
              >
                <FileGlyph label={label} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[#17181A] dark:text-neutral-100">{item.name}</span>
                  <span
                    className={cn(
                      "block text-[11.5px] tabular-nums",
                      item.status === "error" ? "text-red-500" : "text-[#73726d] dark:text-neutral-400",
                    )}
                  >
                    {item.status === "error"
                      ? item.error
                      : item.status === "done"
                        ? formatBytes(item.size)
                        : `${formatBytes(item.size * item.progress)} of ${formatBytes(item.size)}`}
                  </span>
                </span>
                <ProgressRing value={item.progress} status={item.status} />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-[#73726d] transition-colors hover:bg-black/[0.05] hover:text-[#17181A] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#17181A] dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="size-3.5" aria-hidden />
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
