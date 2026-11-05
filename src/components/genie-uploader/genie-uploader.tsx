"use client";

/* eslint-disable @next/next/no-img-element -- previews of files the visitor picked (object URLs), which next/image cannot load */

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type DragEvent as RDragEvent, type KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, motionValue, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  cloud_upload_fill: "<path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M29.956 39.852v6.722a2 2 0 1 1-4 0v-6.722H10.872c-5.71 0-10.34-4.629-10.34-10.34c0-4.907 3.42-9.017 8.007-10.075l-.004-.264a8.744 8.744 0 0 1 11.225-8.387c2.747-4.223 7.508-7.015 12.921-7.015c8.507 0 15.403 6.896 15.403 15.402q0 .726-.066 1.435c4.303 1.014 7.506 4.88 7.506 9.492c0 5.386-4.366 9.752-9.752 9.752zm-2.012-19.794c-.468 0-.89.164-1.359.633l-7.922 7.64c-.351.352-.539.727-.539 1.243c0 .96.727 1.64 1.711 1.64a1.7 1.7 0 0 0 1.266-.562l3.539-3.773l1.594-1.664l-.141 3.492v9.98c0 .984.844 1.805 1.851 1.805s1.875-.82 1.875-1.805v-9.98l-.164-3.492l1.594 1.664l3.563 3.773c.328.375.82.563 1.289.563c.984 0 1.687-.68 1.687-1.641c0-.516-.21-.89-.562-1.242l-7.922-7.64c-.469-.47-.867-.634-1.36-.634\"/>",
  checkmark_circle_fill: "<path fill=\"currentColor\" d=\"M28 51.906c13.055 0 23.906-10.828 23.906-23.906c0-13.055-10.875-23.906-23.93-23.906C14.899 4.094 4.095 14.945 4.095 28c0 13.078 10.828 23.906 23.906 23.906m-3.235-11.883c-.796 0-1.406-.351-2.085-1.148l-6.75-8.344c-.352-.445-.563-1.008-.563-1.523c0-1.102.867-1.945 1.898-1.945c.68 0 1.243.257 1.805.984l5.602 7.242l10.898-17.46c.446-.727 1.055-1.079 1.664-1.079c1.032 0 2.04.68 2.04 1.805c0 .515-.305 1.078-.61 1.547L26.758 38.875c-.516.773-1.172 1.148-1.992 1.148\"/>",
  exclamationmark_circle_fill: "<path fill=\"currentColor\" d=\"M28 51.906c13.055 0 23.906-10.828 23.906-23.906c0-13.055-10.875-23.906-23.93-23.906C14.899 4.094 4.095 14.945 4.095 28c0 13.078 10.828 23.906 23.906 23.906m-.023-20.39c-1.243 0-1.922-.727-1.97-1.97L25.68 17.97c-.047-1.29.937-2.203 2.273-2.203c1.313 0 2.32.937 2.274 2.226l-.329 11.555c-.047 1.265-.75 1.969-1.921 1.969m0 8.625c-1.36 0-2.626-1.078-2.626-2.532s1.243-2.53 2.626-2.53c1.359 0 2.624 1.054 2.624 2.53c0 1.477-1.289 2.532-2.624 2.532\"/>",
  arrow_counterclockwise: "<path fill=\"currentColor\" d=\"M28.856 26.184c1.054 0 1.851-.797 1.851-1.875c0-.493-.187-.961-.539-1.336l-7.008-6.961c1.406-.305 3.047-.446 4.828-.446c9.399 0 16.946 7.524 16.946 16.922a16.9 16.9 0 0 1-16.946 16.969c-9.398 0-16.922-7.547-16.922-16.969c0-1.125-.726-1.945-1.828-1.945c-1.148 0-1.945.82-1.945 1.945c0 11.508 9.21 20.743 20.695 20.743a20.67 20.67 0 0 0 20.719-20.743c0-11.484-9.234-20.695-20.719-20.695c-1.36 0-2.718.14-4.054.375l6.257-6.14c.329-.376.516-.844.516-1.337c0-1.078-.797-1.921-1.852-1.921c-.562 0-1.03.187-1.359.562l-9.656 9.797c-.375.375-.586.89-.586 1.406c0 .54.164 1.008.586 1.406l9.656 9.704c.328.351.774.539 1.36.539\"/>",
  xmark: "<path fill=\"currentColor\" d=\"M10.023 43.023c-.796.797-.82 2.157 0 2.954c.82.796 2.157.796 2.977 0l15-15l15 15c.797.796 2.156.82 2.977 0c.796-.82.796-2.157 0-2.954L30.953 28l15.024-15c.796-.797.82-2.156 0-2.953c-.844-.82-2.18-.82-2.977 0l-15 15l-15-15c-.82-.82-2.18-.844-2.977 0c-.796.82-.796 2.156 0 2.953l15 15Z\"/>",
  doc_text_fill: "<path fill=\"currentColor\" d=\"M15.555 53.125h24.89c4.852 0 7.266-2.461 7.266-7.336V24.508H30.742c-3 0-4.406-1.43-4.406-4.43V2.875H15.555c-4.828 0-7.266 2.484-7.266 7.36v35.554c0 4.898 2.438 7.336 7.266 7.336m15.258-31.828h16.64c-.164-.961-.844-1.899-1.945-3.047L32.57 5.102c-1.078-1.125-2.062-1.805-3.047-1.97v16.9c0 .843.446 1.265 1.29 1.265m-11.836 13.36c-.961 0-1.641-.68-1.641-1.594c0-.915.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.593c0 .915-.727 1.594-1.664 1.594Zm0 8.929c-.961 0-1.641-.68-1.641-1.594s.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.594s-.727 1.594-1.664 1.594Z\"/>",
  photo_fill: "<path fill=\"currentColor\" d=\"M7.715 49.574h40.57c4.899 0 7.36-2.437 7.36-7.265V13.69c0-4.828-2.461-7.265-7.36-7.265H7.715C2.84 6.426.355 8.84.355 13.69v28.62c0 4.851 2.485 7.265 7.36 7.265m10.218-21c-3.187 0-5.789-2.601-5.789-5.789c0-3.164 2.602-5.789 5.79-5.789c3.164 0 5.765 2.625 5.765 5.79c0 3.187-2.601 5.788-5.766 5.788M7.762 45.801c-2.25 0-3.633-1.36-3.633-3.657v-1.43l7.195-6.28c1.031-.914 2.156-1.383 3.211-1.383c1.125 0 2.32.469 3.352 1.43l4.5 4.03l11.18-9.937c1.171-1.031 2.46-1.5 3.773-1.5c1.289 0 2.625.492 3.75 1.524l10.78 9.984v3.61c0 2.25-1.405 3.609-3.632 3.609Z\"/>",
  film_fill: "<path fill=\"currentColor\" d=\"M6.883 49.574h42.234c4.524 0 6.774-2.226 6.774-6.68V13.107c0-4.454-2.25-6.68-6.774-6.68H6.883c-4.477 0-6.774 2.226-6.774 6.68v29.789c0 4.453 2.274 6.68 6.774 6.68m.047-3.773c-1.969 0-3.047-1.032-3.047-3.094V13.293c0-2.062 1.101-3.094 3.047-3.094h42.14c1.97 0 3.047 1.031 3.047 3.094v29.414c0 2.063-1.078 3.094-3.047 3.094Zm.094-30.164c0 .515.398.937 1.03.937h2.18c.586 0 .985-.422.985-.937V13.67c0-.633-.399-1.031-.985-1.031h-2.18c-.656 0-1.03.398-1.03 1.031Zm37.78 0c0 .515.376.937 1.008.937h2.18c.586 0 .985-.422.985-.937V13.67c0-.633-.399-1.031-.985-1.031h-2.18c-.656 0-1.008.398-1.008 1.031Zm-30.187 9.492c0 .703.445 1.125 1.149 1.125h24.492c.703 0 1.125-.422 1.125-1.125v-11.25c0-.703-.422-1.125-1.125-1.125H15.766c-.703 0-1.149.422-1.149 1.125Zm-7.594-2.813c0 .54.399.961 1.032.961h2.18c.585 0 .984-.422.984-.96v-1.97c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.03.398-1.03 1.008Zm37.782 0c0 .54.375.961 1.008.961h2.18c.585 0 .984-.422.984-.96v-1.97c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.008.398-1.008 1.008ZM7.023 29.02c0 .515.398.937 1.03.937h2.18c.586 0 .985-.422.985-.937v-1.993c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.03.398-1.03 1.007Zm37.78 0c0 .515.376.937 1.008.937h2.18c.586 0 .985-.422.985-.937v-1.993c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.008.398-1.008 1.007ZM14.617 42.098c0 .726.445 1.125 1.149 1.125h24.492c.703 0 1.125-.399 1.125-1.125v-11.18c0-.703-.422-1.102-1.125-1.102H15.766c-.703 0-1.149.399-1.149 1.102Zm-7.594-6.399c0 .516.399.961 1.032.961h2.18a.956.956 0 0 0 .984-.96v-1.97c0-.632-.399-1.03-.985-1.03h-2.18c-.656 0-1.03.398-1.03 1.03Zm37.782 0c0 .516.375.961 1.008.961h2.18a.956.956 0 0 0 .984-.96v-1.97c0-.632-.399-1.03-.985-1.03h-2.18c-.656 0-1.008.398-1.008 1.03ZM7.023 42.38c0 .539.398.96 1.03.96h2.18c.586 0 .985-.421.985-.96v-1.992c0-.586-.399-.985-.985-.985h-2.18c-.656 0-1.03.399-1.03.985Zm37.78 0c0 .539.376.96 1.008.96h2.18c.586 0 .985-.421.985-.96v-1.992c0-.586-.399-.985-.985-.985h-2.18c-.656 0-1.008.399-1.008.985Z\"/>",
  archivebox_fill: "<path fill=\"currentColor\" d=\"M8.559 16.95H47.44c2.649 0 3.985-1.571 3.985-4.196V10.62c0-2.625-1.336-4.195-3.985-4.195H8.56c-2.508 0-3.985 1.57-3.985 4.195v2.133c0 2.625 1.336 4.195 3.985 4.195m6.585 32.624H40.88c4.593 0 7.054-2.39 7.054-6.984V20.16H8.066v22.43c0 4.617 2.485 6.984 7.078 6.984m5.133-20.953c-.984 0-1.664-.68-1.664-1.71v-.727c0-1.032.68-1.688 1.664-1.688H35.77c.961 0 1.665.656 1.665 1.688v.726c0 1.031-.704 1.711-1.665 1.711Z\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type UploadStatus = "uploading" | "done" | "error";

export type UploadItem = {
  id: string;
  name: string;
  /** bytes */
  size: number;
  type: string;
  status: UploadStatus;
  /** 0..1 */
  progress: number;
  error?: string;
};

export type GenieUploaderProps = {
  title?: string;
  subtitle?: string;
  /** passed to the file picker, for example "image/*,.pdf" */
  accept?: string;
  /** files larger than this many bytes are refused; 25 MB by default */
  maxSize?: number;
  /**
   * Your upload. Call progress with 0..1 as it goes and resolve when it's stored; throw to mark it failed.
   * Without it the uploader simulates one, so it works as a demo.
   */
  onUpload?: (file: File, progress: (fraction: number) => void, signal: AbortSignal) => Promise<void>;
  /** the list, every time it changes */
  onChange?: (items: UploadItem[]) => void;
  /** Demo the gestures on its own until someone touches it. Off by default. */
  autoplay?: boolean;
  className?: string;
};

type Kind = "image" | "pdf" | "video" | "archive" | "doc";
type Item = UploadItem & { file: File; kind: Kind; card: HTMLCanvasElement | null; thumb?: string; abort?: AbortController; refused?: boolean };

// ─── Files ─────────────────────────────────────────────────────────────────────

const MB = 1024 * 1024;
const fakeSize = new WeakMap<File, number>(); // only the demo uses this, to show realistic sizes on tiny files
const sizeOf = (f: File) => fakeSize.get(f) ?? f.size;
const formatSize = (b: number) => (b >= MB ? `${(b / MB).toFixed(b >= 10 * MB ? 0 : 1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const extOf = (name: string) => (name.includes(".") ? name.split(".").pop()!.toUpperCase().slice(0, 4) : "FILE");
function kindOf(f: File): Kind {
  const t = f.type;
  const e = extOf(f.name);
  if (t.startsWith("image/")) return "image";
  if (t.startsWith("video/") || ["MOV", "MP4", "M4V", "WEBM"].includes(e)) return "video";
  if (t === "application/pdf" || e === "PDF") return "pdf";
  if (["ZIP", "RAR", "7Z", "TAR", "GZ"].includes(e)) return "archive";
  return "doc";
}
const KIND: Record<Kind, { icon: IconName; color: string }> = {
  image: { icon: "photo_fill", color: "#0071e3" },
  pdf: { icon: "doc_text_fill", color: "#e0301e" },
  video: { icon: "film_fill", color: "#8944ab" },
  archive: { icon: "archivebox_fill", color: "#b25000" },
  doc: { icon: "doc_text_fill", color: "#0071e3" },
};

// ─── The cards that fly ────────────────────────────────────────────────────────
// Each file is drawn once into an offscreen canvas: a photo print for images, a little page for everything else.

const PADC = 18; // room around a card for its shadow, in CSS px
const cardBox = new WeakMap<HTMLCanvasElement, { w: number; h: number }>(); // a card's size in CSS px, without the shadow room
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function glyph(ctx: CanvasRenderingContext2D, name: IconName, x: number, y: number, size: number, color: string) {
  const svg = ICON[name];
  const d = /\sd="([^"]+)"/.exec(svg)?.[1];
  if (!d) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 56, size / 56);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(d), svg.includes("evenodd") ? "evenodd" : "nonzero");
  ctx.restore();
}
function ellipsize(ctx: CanvasRenderingContext2D, s: string, max: number) {
  if (ctx.measureText(s).width <= max) return s;
  let lo = 0;
  let hi = s.length;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (ctx.measureText(s.slice(0, m) + "…").width <= max) lo = m;
    else hi = m - 1;
  }
  return s.slice(0, lo) + "…";
}
const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });

async function drawCard(file: File, kind: Kind, thumb: string | undefined): Promise<HTMLCanvasElement> {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const img = kind === "image" && thumb ? await loadImage(thumb) : null;
  let w = 88;
  let h = 112;
  if (img) {
    const ar = img.naturalWidth / Math.max(1, img.naturalHeight);
    h = 100;
    w = clamp(h * ar, 78, 140);
    if (w === 140) h = clamp(140 / ar, 72, 100);
  }
  const c = document.createElement("canvas");
  cardBox.set(c, { w, h });
  c.width = Math.round((w + PADC * 2) * dpr);
  c.height = Math.round((h + PADC * 2) * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.2)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 7;
  roundRect(ctx, PADC, PADC, w, h, 12);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();
  if (img) {
    ctx.save();
    roundRect(ctx, PADC + 4, PADC + 4, w - 8, h - 8, 8.5);
    ctx.clip();
    const s = Math.max((w - 8) / img.naturalWidth, (h - 8) / img.naturalHeight);
    const iw = img.naturalWidth * s;
    const ih = img.naturalHeight * s;
    ctx.drawImage(img, PADC + 4 + (w - 8 - iw) / 2, PADC + 4 + (h - 8 - ih) / 2, iw, ih);
    ctx.restore();
  } else {
    const k = KIND[kind];
    glyph(ctx, k.icon, PADC + w / 2 - 17, PADC + 16, 34, k.color);
    const ext = extOf(file.name);
    ctx.font = `700 9px ${FONT}`;
    const ew = ctx.measureText(ext).width + 12;
    roundRect(ctx, PADC + w / 2 - ew / 2, PADC + 58, ew, 15, 7.5);
    ctx.fillStyle = k.color;
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ext, PADC + w / 2, PADC + 66);
    ctx.font = `600 9.5px ${FONT}`;
    ctx.fillStyle = "#1d1d1f";
    ctx.fillText(ellipsize(ctx, file.name, w - 14), PADC + w / 2, PADC + 86);
    ctx.font = `400 9px ${FONT}`;
    ctx.fillStyle = "#86868b";
    ctx.fillText(formatSize(sizeOf(file)), PADC + w / 2, PADC + 99);
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0,0,0,.08)";
  roundRect(ctx, PADC + 0.5, PADC + 0.5, w - 1, h - 1, 11.5);
  ctx.stroke();
  return c;
}

// ─── The genie ─────────────────────────────────────────────────────────────────
// macOS's minimise effect, drawn one row of pixels at a time. First the card's near edge stretches all the way
// to the cloud's slot, bending into an S-shaped funnel as it goes; then its far edge follows it down the funnel
// and the whole card is squeezed in. Running it backwards spits a card back out.

type Flight = {
  img: HTMLCanvasElement;
  /** the card's box in the component, without its shadow room */
  x: number;
  y: number;
  w: number;
  h: number;
  /** the slot: its centre and width */
  tx: number;
  ty: number;
  sw: number;
  t: MotionValue<number>;
  pop: MotionValue<number>;
  shake: MotionValue<number>;
  alpha: MotionValue<number>;
  drop: MotionValue<number>;
};

const ease = (u: number) => u * u * (3 - 2 * u);
const SPLIT = 0.45;

function drawFlight(ctx: CanvasRenderingContext2D, f: Flight) {
  const X0 = f.x - PADC + f.shake.get();
  const Y0 = f.y - PADC + f.drop.get();
  const W = f.w + PADC * 2;
  const H = f.h + PADC * 2;
  const t = f.t.get();
  const alpha = f.alpha.get();
  if (alpha <= 0.002) return;
  ctx.globalAlpha = alpha;
  if (t <= 0.001) {
    const s = f.pop.get();
    ctx.drawImage(f.img, X0 + (W * (1 - s)) / 2, Y0 + (H * (1 - s)) / 2, W * s, H * s);
    ctx.globalAlpha = 1;
    return;
  }
  // work along the axis towards the slot, so the same code handles a slot above or below the card
  const up = f.ty < Y0 + H / 2;
  const sgn = up ? -1 : 1;
  const a0 = up ? -(Y0 + H) : Y0; // the card's far edge
  const at = sgn * f.ty; // the slot
  const span = Math.max(H * 0.5, at - a0);
  const p1 = ease(clamp(t / SPLIT));
  const q = clamp((t - SPLIT) / (1 - SPLIT));
  const p2 = q * q * (1.5 - 0.5 * q); // gathers speed as it goes in
  const top = lerp(a0, at, p2);
  const bottom = lerp(a0 + H, at, p1);
  const len = bottom - top;
  if (len < 0.5) {
    ctx.globalAlpha = 1;
    return;
  }
  const sy = f.img.height / H;
  const sh = sy * Math.max(1, H / len);
  for (let a = top; a < bottom; a += 1) {
    const k = ((a - top) / len) * H; // which row of the card lands here
    const u = clamp((a - a0) / span);
    const c = ease(u) * p1;
    const left = lerp(X0, f.tx - f.sw / 2, c);
    const right = lerp(X0 + W, f.tx + f.sw / 2, c);
    const src = clamp(up ? H - 1 - k : k, 0, H - 1);
    const y = sgn * a;
    ctx.globalAlpha = alpha * clamp((at - a) / 12);
    ctx.drawImage(f.img, 0, src * sy, f.img.width, sh, left, up ? y - 1 : y, right - left, 1.4);
  }
  ctx.globalAlpha = 1;
}

// ─── The cloud ─────────────────────────────────────────────────────────────────

function Cloud({ level, phase, squash, shake, red, lift, done }: { level: MotionValue<number>; phase: MotionValue<number>; squash: MotionValue<number>; shake: MotionValue<number>; red: MotionValue<number>; lift: MotionValue<number>; done: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const d = useTransform([level, phase], ([l, ph]: number[]) => {
    const top = 9 + (1 - l) * 40; // the glyph spans roughly y 9..49
    const amp = l > 0.01 && l < 0.99 ? 1.5 : 0;
    let s = `M-2 ${top}`;
    for (let x = -2; x <= 58; x += 4) s += `L${x} ${(top + Math.sin(x * 0.22 + ph) * amp).toFixed(2)}`;
    return `${s}L58 60L-2 60Z`;
  });
  const scaleX = useTransform(squash, (q) => 1 + 0.08 * q);
  const scaleY = useTransform(squash, (q) => 1 - 0.09 * q);
  const y = useTransform([squash, lift], ([q, l]: number[]) => -2 * q - 6 * l);
  const base = useTransform([red, lift], ([r, l]: number[]) => (r > 0.01 ? `rgba(255,59,48,${0.35 + 0.65 * r})` : l > 0.01 ? `rgba(0,113,227,${0.3 + 0.25 * l})` : "#d2d2d7"));
  return (
    <motion.div className="relative h-[60px] w-[72px]" style={{ x: shake, y, scaleX, scaleY, originY: 1 }}>
      <svg viewBox="0 0 56 56" width={72} height={72} className="absolute -top-[6px] left-0 overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={`${uid}c`}>
            <motion.path d={d} />
          </clipPath>
        </defs>
        <motion.g style={{ color: base }} dangerouslySetInnerHTML={{ __html: ICON.cloud_upload_fill }} />
        <g clipPath={`url(#${uid}c)`} style={{ color: "#0071e3" }} dangerouslySetInnerHTML={{ __html: ICON.cloud_upload_fill }} />
      </svg>
      <AnimatePresence>
        {done && (
          <motion.span
            key="ok"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 15 }}
            className="absolute -bottom-[3px] -right-[3px] grid h-[24px] w-[24px] place-items-center rounded-full bg-white text-[#248a3d] shadow-[0_2px_6px_rgba(0,0,0,.15)]"
          >
            <Icon name="checkmark_circle_fill" size={22} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── A row in the list ─────────────────────────────────────────────────────────

function Row({ item, onRemove, onRetry, registerIcon }: { item: Item; onRemove: (id: string) => void; onRetry: (id: string) => void; registerIcon: (id: string, el: HTMLElement | null) => void }) {
  const k = KIND[item.kind];
  const pct = Math.round(item.progress * 100);
  const color = item.status === "error" ? "#ff3b30" : item.status === "done" ? "#30d158" : "#0071e3";
  const meta =
    item.status === "error" ? item.error ?? "Upload failed" : item.status === "done" ? `${formatSize(item.size)} · Uploaded` : `${formatSize(item.size)} · ${pct}%`;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={item.status === "error" ? { opacity: 1, y: 0, scale: 1, x: [0, -9, 8, -5, 3, 0] } : { opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, x: 28, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32, x: { duration: 0.45 } }}
      className="relative flex items-center gap-3 py-2.5"
      aria-label={`${item.name}, ${meta}`}
    >
      <span
        ref={(el) => registerIcon(item.id, el)}
        aria-hidden="true"
        className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-[#f5f5f7] shadow-[inset_0_0_0_1px_rgba(0,0,0,.05)]"
        style={{ color: k.color }}
      >
        {item.thumb ? <img src={item.thumb} alt="" className="h-full w-full object-cover" draggable={false} /> : <Icon name={k.icon} size={20} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium tracking-[-0.01em] text-[#1d1d1f]">{item.name}</span>
        <span className={`mt-[1px] block truncate text-[12px] tabular-nums ${item.status === "error" ? "text-[#d70015]" : "text-[#6e6e73]"}`}>{meta}</span>
        <span className="mt-1.5 block h-[3px] overflow-hidden rounded-full bg-[#e8e8ed]">
          <motion.span
            className="block h-full rounded-full"
            initial={false}
            animate={{ width: `${Math.max(item.status === "error" ? 100 : 3, pct)}%`, backgroundColor: color, opacity: item.status === "done" ? 0.9 : 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 26 }}
          />
        </span>
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        {item.status === "done" ? (
          <motion.span key="ok" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 520, damping: 14 }} className="grid h-8 w-8 place-items-center text-[#248a3d]">
            <Icon name="checkmark_circle_fill" size={22} />
          </motion.span>
        ) : item.status === "error" && !item.refused ? (
          <motion.button
            key="retry"
            type="button"
            onClick={() => onRetry(item.id)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            whileTap={{ scale: 0.88 }}
            data-retry={item.id}
            aria-label={`Retry ${item.name}`}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#0071e3]/[.08] text-[#0066cc] outline-none hover:bg-[#0071e3]/[.14] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
          >
            <Icon name="arrow_counterclockwise" size={15} />
          </motion.button>
        ) : (
          <motion.button
            key="x"
            type="button"
            onClick={() => onRemove(item.id)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            whileTap={{ scale: 0.88 }}
            aria-label={`Remove ${item.name}`}
            className="grid h-8 w-8 place-items-center rounded-full text-[#86868b] outline-none hover:bg-black/[.05] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
          >
            <Icon name="xmark" size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

// ─── Demo files for the self-demo ──────────────────────────────────────────────

async function demoFiles(): Promise<File[]> {
  const c = document.createElement("canvas");
  c.width = 480;
  c.height = 340;
  const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, "#3b2f6b");
  sky.addColorStop(0.45, "#e0607a");
  sky.addColorStop(0.75, "#ffb36b");
  g.fillStyle = sky;
  g.fillRect(0, 0, 480, 340);
  g.fillStyle = "rgba(255,236,190,.95)";
  g.beginPath();
  g.arc(300, 205, 34, 0, Math.PI * 2);
  g.fill();
  const hills = (base: number, amp: number, col: string, ph: number) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, 340);
    for (let x = 0; x <= 480; x += 8) g.lineTo(x, base - Math.sin(x / 70 + ph) * amp - Math.sin(x / 23 + ph * 2) * amp * 0.25);
    g.lineTo(480, 340);
    g.fill();
  };
  hills(228, 22, "#6b3f6e", 1);
  hills(252, 18, "#3d2a52", 2.4);
  hills(282, 12, "#211a33", 0.3);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.85));
  const photo = new File([blob ?? new Blob()], "sunset-in-goa.jpg", { type: "image/jpeg" });
  const pdf = new File(["%PDF-1.4"], "q4-report.pdf", { type: "application/pdf" });
  const reel = new File(["demo"], "launch-reel.mov", { type: "video/quicktime" });
  fakeSize.set(photo, 2.4 * MB);
  fakeSize.set(pdf, 1.8 * MB);
  fakeSize.set(reel, 48 * MB);
  return [photo, pdf, reel];
}

const STOP = Symbol("stop");

/**
 * Genie Uploader: a file drop that swallows files the way macOS minimises a window.
 * Drop files on the well, or click it to choose some. Each file appears as a card where it landed (a real
 * thumbnail for images), then bends into a funnel and pours into the cloud, which gulps it and fills with
 * blue as the uploads run. The files settle into a list with a progress line each; a file that's too big
 * goes halfway in, gets spat back out and shakes its head, and a failed upload can be retried, which sends
 * it into the cloud again. A check lands on the cloud when everything is up.
 * Keyboard: Tab to the well and press Enter or Space to choose files; each row's buttons remove or retry.
 */
export function GenieUploader({
  title = "Upload files",
  subtitle = "Photos, documents and videos up to 25 MB",
  accept,
  maxSize = 25 * MB,
  onUpload,
  onChange,
  autoplay = false,
  className = "",
}: GenieUploaderProps) {
  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [over, setOver] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const wellRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const icons = useRef(new Map<string, HTMLElement>());
  const flights = useRef(new Set<Flight>());
  const raf = useRef(0);
  const failOnce = useRef(new Set<string>()); // demo only: these names fail the first time
  const reduced = useReducedMotion();
  const statusId = useId();

  const patch = useCallback((id: string, p: Partial<Item>) => setItems((l) => l.map((it) => (it.id === id ? { ...it, ...p } : it))), []);

  useEffect(() => {
    onChange?.(items.map(({ id, name, size, type, status, progress, error }) => ({ id, name, size, type, status, progress, error })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  useEffect(() => () => itemsRef.current.forEach((it) => it.thumb && URL.revokeObjectURL(it.thumb)), []);

  // ─── the cloud's motion ───
  const levelRaw = useMotionValue(0);
  const level = useSpring(levelRaw, { stiffness: 90, damping: 20 });
  const phase = useMotionValue(0);
  const squash = useMotionValue(0);
  const cloudShake = useMotionValue(0);
  const red = useMotionValue(0);
  const lift = useSpring(useMotionValue(0), { stiffness: 300, damping: 20 });
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);
  const light = useTransform([lightX, lightY], ([x, y]: number[]) => `radial-gradient(220px circle at ${x}% ${y}%, rgba(0,113,227,.16), rgba(0,113,227,0) 70%)`);

  const live = items.filter((it) => it.status !== "error");
  const uploading = items.filter((it) => it.status === "uploading").length;
  const allDone = live.length > 0 && live.every((it) => it.status === "done");
  useEffect(() => {
    levelRaw.set(live.length ? live.reduce((a, it) => a + it.progress, 0) / live.length : 0);
  }, [items, levelRaw, live]);
  useEffect(() => {
    if (!uploading) return;
    const c = animate(phase, phase.get() + Math.PI * 2 * 40, { duration: 40, ease: "linear" });
    return () => c.stop();
  }, [uploading, phase]);
  useEffect(() => {
    lift.set(over ? 1 : 0);
  }, [over, lift]);

  const gulp = () => animate(squash, [squash.get(), -0.7, 0.45, -0.15, 0], { duration: 0.55, ease: "easeOut" });
  const inhale = () => animate(squash, 1, { duration: 0.22, ease: "easeOut" });

  // ─── drawing the flights ───
  const loop = useCallback(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = cv.width / Math.max(1, cv.clientWidth);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
    flights.current.forEach((f) => drawFlight(ctx, f));
    raf.current = flights.current.size ? requestAnimationFrame(loop) : 0;
  }, []);
  const kick = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(loop);
  }, [loop]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const cv = canvasRef.current;
    if (!root || !cv) return;
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(root.clientWidth * dpr);
      cv.height = Math.round(root.clientHeight * dpr);
      kick();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(root);
    return () => ro.disconnect();
  }, [kick]);

  const local = (r: DOMRect) => {
    const b = rootRef.current!.getBoundingClientRect();
    return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
  };
  const slot = () => {
    const c = local(cloudRef.current!.getBoundingClientRect());
    return { tx: c.x + c.w / 2, ty: c.y + c.h * 0.58, sw: 20 };
  };
  const fly = (f: Flight) => {
    flights.current.add(f);
    kick();
    return () => {
      flights.current.delete(f);
      kick();
    };
  };
  const makeFlight = (img: HTMLCanvasElement, cx: number, cy: number, scale = 1): Flight => {
    const box = cardBox.get(img) ?? { w: 90, h: 110 };
    const w = box.w * scale;
    const h = box.h * scale;
    return { img, x: cx - w / 2, y: cy - h / 2, w, h, ...slot(), t: motionValue(0), pop: motionValue(0.85), shake: motionValue(0), alpha: motionValue(1), drop: motionValue(0) };
  };

  // ─── uploading ───
  const simulate = (file: File, progress: (p: number) => void, signal: AbortSignal) =>
    new Promise<void>((res, rej) => {
      const total = clamp(1.3 + sizeOf(file) / (6 * MB), 1.3, 4.2) * 1000;
      const failAt = failOnce.current.has(file.name) ? 0.58 : 2;
      let p = 0;
      const tick = () => {
        if (signal.aborted) return rej(new Error("aborted"));
        p = Math.min(1, p + (80 / total) * (0.5 + Math.random()));
        if (p >= failAt) {
          failOnce.current.delete(file.name);
          return rej(new Error("Connection lost"));
        }
        progress(p);
        if (p >= 1) res();
        else setTimeout(tick, 80);
      };
      setTimeout(tick, 120);
    });

  const start = (it: Item) => {
    const id = it.id;
    const abort = new AbortController();
    patch(id, { status: "uploading", progress: 0, error: undefined, abort });
    let last = 0;
    (onUpload ?? simulate)(
      it.file,
      (p) => {
        const now = performance.now();
        if (now - last < 60 && p < 1) return;
        last = now;
        patch(id, { progress: clamp(p) });
      },
      abort.signal,
    )
      .then(() => !abort.signal.aborted && patch(id, { status: "done", progress: 1 }))
      .catch((e: unknown) => {
        if (abort.signal.aborted) return;
        patch(id, { status: "error", error: e instanceof Error && e.message !== "aborted" ? e.message : "Upload failed" });
      });
  };

  /** a card pours into the cloud, then its upload starts */
  const swallow = async (it: Item, from: { x: number; y: number }, scale = 1, landing = true) => {
    const id = it.id;
    if (!it.card) {
      setItems((l) => (l.some((x) => x.id === id) ? l : [...l, it]));
      return start(it);
    }
    const f = makeFlight(it.card, from.x, from.y, scale);
    if (!landing) f.pop.set(1);
    const done = fly(f);
    if (landing) {
      animate(f.pop, 1, { type: "spring", stiffness: 520, damping: 17 });
      await new Promise((r) => setTimeout(r, 260));
    }
    let breathed = false;
    const off = f.t.on("change", (v) => {
      if (!breathed && v > SPLIT) {
        breathed = true;
        inhale();
      }
    });
    await animate(f.t, 1, { duration: 0.85, ease: [0.5, 0, 0.5, 1] });
    off();
    done();
    gulp();
    setItems((l) => (l.some((x) => x.id === id) ? l : [...l, it]));
    start(it);
  };

  /** too big: it goes halfway in, the cloud refuses it, and out it comes */
  const refuse = async (it: Item, from: { x: number; y: number }) => {
    if (!it.card) return setItems((l) => [...l, it]);
    const f = makeFlight(it.card, from.x, from.y);
    const done = fly(f);
    animate(f.pop, 1, { type: "spring", stiffness: 520, damping: 17 });
    await new Promise((r) => setTimeout(r, 260));
    await animate(f.t, 0.62, { duration: 0.55, ease: [0.5, 0, 0.6, 1] });
    animate(cloudShake, [0, -7, 6, -4, 2, 0], { duration: 0.42 });
    animate(red, [0, 1, 0], { duration: 0.65, times: [0, 0.2, 1] });
    await animate(f.t, 0, { type: "spring", stiffness: 260, damping: 15 });
    setItems((l) => [...l, it]);
    await animate(f.shake, [0, -11, 10, -7, 4, 0], { duration: 0.45 });
    await Promise.all([animate(f.alpha, 0, { duration: 0.28 }), animate(f.drop, 26, { duration: 0.28, ease: "easeIn" })]);
    done();
  };

  const addFiles = async (files: File[], at?: { x: number; y: number }) => {
    const well = wellRef.current;
    if (!files.length || !well) return;
    const w = local(well.getBoundingClientRect());
    const s = slot();
    const fresh: Item[] = await Promise.all(
      files.map(async (file, i) => {
        const kind = kindOf(file);
        const thumb = kind === "image" ? URL.createObjectURL(file) : undefined;
        const big = sizeOf(file) > maxSize;
        return {
          id: `${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          size: sizeOf(file),
          type: file.type,
          status: big ? "error" : "uploading",
          progress: 0,
          error: big ? `Over ${formatSize(maxSize)}` : undefined,
          refused: big,
          file,
          kind,
          thumb,
          card: reduced ? null : await drawCard(file, kind, thumb),
        } as Item;
      }),
    );
    if (reduced) {
      setItems((l) => [...l, ...fresh]);
      fresh.forEach((it) => it.status !== "error" && start(it));
      return;
    }
    fresh.forEach((it, i) => {
      // land where the file was dropped, but low enough in the well to have room to bend
      const { w: cw, h: ch } = (it.card && cardBox.get(it.card)) || { w: 90, h: 110 };
      const spread = Math.min(96, (w.w - 120) / Math.max(1, fresh.length - 1));
      const px = (at?.x ?? w.x + w.w / 2) + (i - (fresh.length - 1) / 2) * spread;
      const py = (at?.y ?? w.y + w.h * 0.62) + (i % 2) * 8;
      const x = clamp(px, w.x + cw / 2 + 8, w.x + w.w - cw / 2 - 8);
      const y = Math.max(py, s.ty + 52 + ch / 2);
      setTimeout(() => {
        if (it.status === "error") void refuse(it, { x, y });
        else void swallow(it, { x, y });
      }, i * 240);
    });
  };

  const retry = (id: string) => {
    const it = itemsRef.current.find((x) => x.id === id);
    if (!it) return;
    const icon = icons.current.get(id);
    if (reduced || !it.card || !icon) return start(it);
    const r = local(icon.getBoundingClientRect());
    patch(id, { status: "uploading", progress: 0, error: undefined });
    void swallow(it, { x: r.x + r.w / 2, y: r.y + r.h / 2 }, 0.5, false);
  };
  const remove = (id: string) => {
    const it = itemsRef.current.find((x) => x.id === id);
    it?.abort?.abort();
    if (it?.thumb) setTimeout(() => URL.revokeObjectURL(it.thumb!), 400);
    setItems((l) => l.filter((x) => x.id !== id));
  };
  const clearDone = () => setItems((l) => l.filter((x) => x.status !== "done"));

  // ─── dragging files in ───
  const hasFiles = (e: RDragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
  const point = (clientX: number, clientY: number) => {
    const b = rootRef.current!.getBoundingClientRect();
    return { x: clientX - b.left, y: clientY - b.top };
  };
  const aim = (clientX: number, clientY: number) => {
    const r = wellRef.current?.getBoundingClientRect();
    if (!r) return;
    lightX.set(((clientX - r.left) / r.width) * 100);
    lightY.set(((clientY - r.top) / r.height) * 100);
  };
  const onDragOver = (e: RDragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!over) setOver(true);
    aim(e.clientX, e.clientY);
  };
  const onDragLeave = (e: RDragEvent<HTMLDivElement>) => {
    if (!wellRef.current?.contains(e.relatedTarget as Node)) setOver(false);
  };
  const onDrop = (e: RDragEvent<HTMLDivElement>) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    setOver(false);
    void addFiles(Array.from(e.dataTransfer.files), point(e.clientX, e.clientY));
  };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    void addFiles(files);
  };
  const onWellKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  // ─── Autoplay: a ghost finger drags three files in, retries the one that fails, then clears up ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  const [carry, setCarry] = useState<string | null>(null); // the photo thumbnail the finger is carrying
  const carryOn = useMotionValue(0);
  const inView = useInView(rootRef, { amount: 0.4 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      setOver(false);
      setCarry(null);
      animate(go, 0, { duration: 0.2 });
      animate(gs, 1, { duration: 0.2 });
      animate(carryOn, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let last = performance.now();
        const tick = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - last;
          last = t;
          if (left <= 0) res();
          else setTimeout(tick, Math.min(60, Math.max(16, left)));
        };
        tick();
      });
    const run = (mv: MotionValue<number>, target: number, duration: number, e: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - target) < 0.01) return res();
        const c = animate(mv, target, { duration, ease: e, onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    const box = (el: Element) => local(el.getBoundingClientRect());
    const until = async (ok: () => boolean, max = 9000) => {
      let t = 0;
      while (!ok() && t < max) {
        await wait(120);
        t += 120;
      }
    };

    (async () => {
      const files = await demoFiles();
      const photoUrl = URL.createObjectURL(files[0]);
      while (alive) {
        await wait(900);
        const r = box(root);
        const w = box(wellRef.current!);
        // pick the files up from outside the card
        gx.set(r.w + 30);
        gy.set(w.y + 20);
        setCarry(photoUrl);
        await Promise.all([run(go, 1, 0.3), run(carryOn, 1, 0.3)]);
        const dropX = w.x + w.w * 0.42;
        const dropY = w.y + w.h * 0.7;
        await Promise.all([run(gx, w.x + w.w * 0.8, 0.55), run(gy, w.y + w.h * 0.45, 0.55)]);
        setOver(true);
        const wr = wellRef.current!.getBoundingClientRect();
        const rr = root.getBoundingClientRect();
        const follow = () => {
          lightX.set(((gx.get() + rr.left - wr.left) / wr.width) * 100);
          lightY.set(((gy.get() + rr.top - wr.top) / wr.height) * 100);
        };
        const offX = gx.on("change", follow);
        const offY = gy.on("change", follow);
        await Promise.all([run(gx, dropX, 0.65), run(gy, dropY, 0.65)]);
        offX();
        offY();
        await run(gs, 0.8, 0.1);
        setOver(false);
        await run(carryOn, 0, 0.12);
        setCarry(null);
        failOnce.current.add("q4-report.pdf");
        void addFiles(files, { x: dropX, y: dropY });
        await run(gs, 1, 0.16);
        await run(go, 0.35, 0.3);
        // wait for the failure, then retry it
        await until(() => itemsRef.current.some((it) => it.name === "q4-report.pdf" && it.status === "error"));
        await wait(700);
        const retryBtn = root.querySelector("[data-retry]");
        if (retryBtn) {
          const b = box(retryBtn);
          await run(go, 1, 0.2);
          await Promise.all([run(gx, b.x + b.w / 2, 0.6), run(gy, b.y + b.h / 2, 0.6)]);
          await run(gs, 0.8, 0.1);
          (retryBtn as HTMLElement).click();
          await run(gs, 1, 0.16);
          await run(go, 0, 0.3);
        }
        await until(() => itemsRef.current.filter((it) => it.status !== "error").every((it) => it.status === "done"));
        await wait(2600);
        setItems([]);
        await wait(1200);
      }
    })().catch((e) => e !== STOP && console.error(e));

    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const status =
    over ? "Release to upload" : allDone ? "All uploaded" : uploading ? `Uploading ${live.filter((x) => x.status === "done").length + 1} of ${live.length}` : "Drop files here";
  const doneCount = items.filter((x) => x.status === "done").length;

  return (
    <div
      ref={rootRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative w-full max-w-[420px] rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3 px-1 pb-4">
        <div>
          <h3 className="m-0 text-[19px] font-semibold leading-tight tracking-[-0.02em]">{title}</h3>
          <p className="m-0 mt-1 text-[13px] text-[#6e6e73]">{subtitle}</p>
        </div>
        <AnimatePresence>
          {doneCount > 0 && !uploading && (
            <motion.button
              type="button"
              onClick={clearDone}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="shrink-0 rounded-full px-3 py-1 text-[13px] font-medium text-[#0066cc] outline-none hover:bg-[#0071e3]/[.06] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            >
              Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* the well: no transform or opacity on it, so the cloud inside can sit above the flying cards */}
      <motion.div
        ref={wellRef}
        role="button"
        tabIndex={0}
        aria-label="Choose files to upload, or drop them here"
        aria-describedby={statusId}
        onClick={() => inputRef.current?.click()}
        onKeyDown={onWellKey}
        onPointerMove={(e) => aim(e.clientX, e.clientY)}
        animate={{ backgroundColor: over ? "#eef5ff" : "#f5f5f7" }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="group relative flex h-[244px] cursor-pointer flex-col items-center overflow-hidden rounded-[22px] pt-9 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
      >
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-60" style={{ backgroundImage: light }} />
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" animate={{ opacity: over ? 1 : 0 }} style={{ backgroundImage: light }} />
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[22px]"
          animate={{ boxShadow: over ? "inset 0 0 0 1.5px rgba(0,113,227,.45)" : "inset 0 0 0 1px rgba(0,0,0,.04)" }}
        />
        <div ref={cloudRef} className="relative z-20">
          <Cloud level={level} phase={phase} squash={squash} shake={cloudShake} red={red} lift={lift} done={allDone} />
        </div>
        <div className="relative z-0 mt-3 text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={status}
              initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
              transition={{ duration: 0.22 }}
              className="m-0 text-[15px] font-semibold tracking-[-0.015em]"
            >
              {status}
            </motion.p>
          </AnimatePresence>
          <p className="m-0 mt-1 text-[13px] text-[#6e6e73]">
            or <span className="font-medium text-[#0066cc]">browse</span> · up to {formatSize(maxSize)}
          </p>
        </div>
        <p id={statusId} className="sr-only" aria-live="polite">
          {status}
        </p>
      </motion.div>
      <input ref={inputRef} type="file" multiple accept={accept} onChange={onPick} className="hidden" tabIndex={-1} aria-hidden="true" />

      <ul role="list" aria-label="Uploads" className="m-0 list-none px-1 pt-2">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <Row
              key={it.id}
              item={it}
              onRemove={remove}
              onRetry={retry}
              registerIcon={(id, el) => {
                if (el) icons.current.set(id, el);
                else icons.current.delete(id);
              }}
            />
          ))}
        </AnimatePresence>
      </ul>

      {/* the flying cards sit over the well and under the cloud */}
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full" />

      {/* ghost finger for the self-demo, carrying the files it will drop */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-30" style={{ x: gx, y: gy }}>
        <motion.div className="absolute left-3 top-3" style={{ opacity: carryOn, scale: carryOn, originX: 0, originY: 0 }}>
          <span className="absolute left-5 top-2 block h-[54px] w-[44px] rotate-[10deg] rounded-[8px] bg-white shadow-[0_6px_16px_rgba(0,0,0,.18)]">
            <span className="absolute inset-x-0 top-3 grid place-items-center text-[#8944ab]">
              <Icon name="film_fill" size={18} />
            </span>
          </span>
          <span className="absolute left-2.5 top-1 block h-[54px] w-[44px] rotate-[3deg] rounded-[8px] bg-white shadow-[0_6px_16px_rgba(0,0,0,.18)]">
            <span className="absolute inset-x-0 top-3 grid place-items-center text-[#e0301e]">
              <Icon name="doc_text_fill" size={18} />
            </span>
          </span>
          {carry && <img src={carry} alt="" className="relative block h-[44px] w-[60px] -rotate-[6deg] rounded-[8px] border-[3px] border-white object-cover shadow-[0_6px_16px_rgba(0,0,0,.2)]" />}
        </motion.div>
        <motion.span
          style={{ scale: gs, opacity: go }}
          className="absolute -ml-[15px] -mt-[15px] block h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
        />
      </motion.div>
    </div>
  );
}
