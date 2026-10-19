"use client";

import * as React from "react";
import { motion, useAnimationControls } from "framer-motion";
import { UploadDropzone } from "@/components/upload-dropzone";

type Mock = { name: string; size: number; type: string };

// Alternate a clean drop with one that includes a file over the limit.
const BATCHES: Mock[][] = [
  [
    { name: "mood.png", size: 1_240_000, type: "image/png" },
    { name: "demo.mp4", size: 3_480_000, type: "video/mp4" },
  ],
  [
    { name: "brief.pdf", size: 820_000, type: "application/pdf" },
    { name: "deck-final.pdf", size: 8_400_000, type: "application/pdf" },
  ],
];

function makeFiles(batch: Mock[]) {
  const dt = new DataTransfer();
  for (const m of batch) {
    // a tiny real file whose reported size is overridden to look like the mock
    const file = new File(["x"], m.name, { type: m.type });
    Object.defineProperty(file, "size", { value: m.size });
    dt.items.add(file);
  }
  return dt;
}

function dispatchDrag(target: Element, type: string, dt: DataTransfer, x: number, y: number) {
  target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y }));
}

export function PreviewUploadDropzone({ compact = false }: { compact?: boolean } = {}) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const ghost = useAnimationControls();
  const [round, setRound] = React.useState(0);
  const [demo, setDemo] = React.useState(true);
  const [ghostName, setGhostName] = React.useState(BATCHES[0][0].name);
  const [ghostCount, setGhostCount] = React.useState(BATCHES[0].length);

  React.useEffect(() => {
    if (!demo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    let visible = false;
    let looping = false;
    let n = 0;
    const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

    const loop = async () => {
      if (looping) return;
      looping = true;
      while (!cancelled && visible) {
        const batch = BATCHES[n % BATCHES.length];
        n += 1;
        setRound((r) => r + 1); // fresh, empty dropzone
        setGhostName(batch[0].name);
        setGhostCount(batch.length);
        await sleep(900);
        if (cancelled || !visible) break;
        const zone = root.querySelector<HTMLElement>("[data-dropzone] [role=button]");
        if (!zone) break;
        const rr = root.getBoundingClientRect();
        const zr = zone.getBoundingClientRect();
        const scale = rr.width / root.offsetWidth || 1;
        const to = { x: (zr.left + zr.width * 0.55 - rr.left) / scale, y: (zr.top + zr.height * 0.5 - rr.top) / scale };
        const from = { x: root.offsetWidth * 0.92, y: root.offsetHeight * 0.95 };
        const dt = makeFiles(batch);
        await ghost.start({ x: from.x, y: from.y, opacity: 0, scale: 0.9, transition: { duration: 0 } });
        await ghost.start({ opacity: 1, scale: 1, transition: { duration: 0.25 } });
        // halfway in, the file crosses the edge of the dropzone
        const halfway = ghost.start({ x: to.x, y: to.y, transition: { duration: 1.1, ease: [0.45, 0, 0.2, 1] } });
        await sleep(650);
        dispatchDrag(zone, "dragenter", dt, zr.left + zr.width / 2, zr.top + zr.height / 2);
        const over = window.setInterval(() => dispatchDrag(zone, "dragover", dt, zr.left + zr.width / 2, zr.top + zr.height / 2), 80);
        await halfway;
        await sleep(450);
        window.clearInterval(over);
        if (cancelled) break;
        await ghost.start({ scale: 0.8, opacity: 0, transition: { duration: 0.18 } });
        dispatchDrag(zone, "drop", dt, zr.left + zr.width / 2, zr.top + zr.height / 2);
        await sleep(4200);
      }
      looping = false;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) void loop();
    });
    io.observe(root);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [demo, ghost]);

  const takeOver = (e: React.SyntheticEvent) => {
    if (!e.nativeEvent.isTrusted || !demo) return;
    setDemo(false);
    setRound((r) => r + 1);
  };

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6"
      onPointerDownCapture={takeOver}
      onDragEnterCapture={takeOver}
      onKeyDownCapture={takeOver}
    >
      <div data-dropzone className="w-full max-w-[320px]">
        <UploadDropzone key={round} className={compact ? "max-w-[300px]" : undefined} />
      </div>

      {demo ? (
        <motion.div
          aria-hidden
          animate={ghost}
          initial={{ opacity: 0 }}
          className="pointer-events-none absolute left-0 top-0 z-20"
        >
          <div className="-translate-x-1/2 -translate-y-1/2 rotate-[-6deg]">
            <div className="relative flex items-center gap-2 rounded-[12px] bg-white/95 py-1.5 pl-2 pr-3 shadow-[0_14px_30px_-12px_rgba(16,17,20,0.45)] ring-1 ring-black/5 dark:bg-[#22222a]/95 dark:ring-white/10">
              <span className="grid h-6 w-5 place-items-center rounded-[4px] bg-[#16a34a] text-[7px] font-bold text-white">
                {ghostName.split(".").pop()?.toUpperCase()}
              </span>
              <span className="text-[12px] font-medium text-[#17181A] dark:text-neutral-100">{ghostName}</span>
              {ghostCount > 1 ? (
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-[#0071e3] text-[10px] font-bold text-white">
                  {ghostCount}
                </span>
              ) : null}
            </div>
          </div>
          <svg width="22" height="24" viewBox="0 0 22 24" className="absolute left-1 top-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
            <path
              d="M3 2.2v17.6c0 .7.8 1 1.3.5l4.2-4.3 2.9 6.3c.2.5.8.7 1.3.5l2-.9c.5-.2.7-.8.5-1.3l-2.9-6.2h6c.7 0 1-.8.5-1.3L4.3 1.7C3.8 1.2 3 1.5 3 2.2Z"
              fill="#0071e3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      ) : null}
    </div>
  );
}
