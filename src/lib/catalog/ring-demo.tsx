"use client";

import * as React from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { RingGallery, type RingItem } from "@/components/ring-gallery";
import { RING_PHOTOS } from "@/lib/catalog/ring-photos";

/**
 * The Ring Gallery playground stage: the ring, plus a way to put your own photos in it. The
 * photos are read in the browser, shrunk to 1000px and shown through blob: URLs; nothing is
 * uploaded anywhere. Lives with the catalog (not in the component's folder) so it never ships in
 * an installed copy.
 */

const MAX_PHOTOS = 40;
const MAX_SIDE = 1000;

async function shrink(file: File): Promise<RingItem | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bmp.width * k));
    canvas.height = Math.max(1, Math.round(bmp.height * k));
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.82));
    if (!blob) return null;
    const title = file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim() || "Photo";
    return { title: title.slice(0, 40), src: URL.createObjectURL(blob) };
  } catch {
    return null;
  }
}

export type RingDemoValues = {
  count: number;
  radius: number;
  cardSize: number;
  speed: number;
  glide: number;
  tilt: number;
  autoplay: boolean;
  intro: boolean;
  detail: boolean;
  enableSound: boolean;
};

export function RingGalleryDemo({ v }: { v: RingDemoValues }) {
  const [own, setOwn] = React.useState<RingItem[] | null>(null);
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);
  const live = React.useRef<string[]>([]);

  // free the blob URLs when the photos are replaced or the page goes away
  const release = React.useCallback(() => {
    live.current.forEach((u) => URL.revokeObjectURL(u));
    live.current = [];
  }, []);
  React.useEffect(() => release, [release]);

  const pick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setNote("");
    const list = Array.from(files).slice(0, MAX_PHOTOS);
    const made = (await Promise.all(list.map(shrink))).filter((x): x is RingItem => !!x);
    setBusy(false);
    if (made.length === 0) {
      setNote("Those files could not be read as photos. Try JPG, PNG or WebP.");
      return;
    }
    release();
    live.current = made.map((m) => m.src as string);
    setOwn(made);
    const skipped = list.length - made.length;
    const over = files.length > MAX_PHOTOS ? ` Only the first ${MAX_PHOTOS} were used.` : "";
    setNote(`${made.length} photo${made.length === 1 ? "" : "s"} in the ring.${skipped ? ` ${skipped} could not be read.` : ""}${over}`);
  };

  const reset = () => {
    release();
    setOwn(null);
    setNote("");
    if (input.current) input.current.value = "";
  };

  const items = own ?? RING_PHOTOS;

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <RingGallery
        key={`${String(v.autoplay)}-${String(v.intro)}-${own ? own.length : "demo"}`}
        items={items}
        count={v.count}
        radius={v.radius}
        cardSize={v.cardSize}
        speed={v.speed}
        glide={v.glide}
        tilt={v.tilt}
        autoplay={v.autoplay}
        intro={v.intro}
        detail={v.detail}
        enableSound={v.enableSound}
        captureWheel={false}
      />
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px]">
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Choose photos for the ring"
          onChange={(e) => void pick(e.target.files)}
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 font-medium text-white transition hover:bg-black disabled:opacity-60"
        >
          <ImagePlus className="size-3.5" aria-hidden />
          {busy ? "Preparing photos" : "Use your own photos"}
        </button>
        {own ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-medium text-[#1d1d1f] ring-1 ring-black/15 transition hover:bg-black/[0.04]"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Back to the demo photos
          </button>
        ) : null}
        <span className="text-[#6e6e73]" role="status">
          {note || "Pick a few from your device. They stay in your browser and are never uploaded."}
        </span>
      </div>
    </div>
  );
}
