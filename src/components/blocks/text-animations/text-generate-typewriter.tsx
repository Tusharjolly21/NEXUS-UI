"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY_SPRITES: Array<[number, number]> = [
  [2.894, 0.226],
  [12.946, 0.191],
  [13.47, 0.19],
  [13.963, 0.199],
  [14.481, 0.204],
  [14.994, 0.187],
  [15.505, 0.217],
  [15.99, 0.193],
  [16.529, 0.184],
  [17.012, 0.205],
  [17.55, 0.174],
  [18.052, 0.186],
  [18.553, 0.177],
  [19.065, 0.22],
];

export type TextGenerateTypewriterProps = {
  text: string;
  typingSpeed?: number;
  startOnView?: boolean;
  startOnHover?: boolean;
  soundSrc?: string;
  volume?: number;
  muted?: boolean;
  showCursor?: boolean;
  showControls?: boolean;
  className?: string;
};

export function TextGenerateTypewriter({
  text,
  typingSpeed = 22,
  startOnView = true,
  startOnHover = false,
  soundSrc = "/sounds/sound.ogg",
  volume = 0.18,
  muted = false,
  showCursor = true,
  showControls = true,
  className,
}: TextGenerateTypewriterProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const tickRef = React.useRef(0);
  const soundStopTimerRef = React.useRef<number | null>(null);
  const rewoundAfterUnlockRef = React.useRef(false);
  const inView = useInView(rootRef, { once: true, margin: "-80px" });
  const [started, setStarted] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [localMuted, setLocalMuted] = React.useState(muted);
  const [audioUnlocked, setAudioUnlocked] = React.useState(false);
  const localMutedRef = React.useRef(localMuted);
  const reduceMotion = useReducedMotion();
  const isTyping = started && !reduceMotion && index < text.length;
  // with reduced motion the full answer is shown at once, without the typing or the sound
  const renderedText = reduceMotion ? text : text.slice(0, index);

  React.useEffect(() => {
    const audio = new Audio(soundSrc);
    audio.loop = false;
    audioRef.current = audio;

    return () => {
      if (soundStopTimerRef.current) window.clearTimeout(soundStopTimerRef.current);
      audio.pause();
      audioRef.current = null;
    };
  }, [soundSrc]);

  const unlockAudio = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || localMuted) return;

    try {
      audio.volume = Math.min(volume, 0.05);
      audio.currentTime = KEY_SPRITES[0][0];
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.volume = volume;
      setAudioUnlocked(true);
    } catch {
      audio.pause();
      audio.volume = volume;
    }
  }, [localMuted, volume]);

  React.useEffect(() => {
    if (audioUnlocked || localMuted) return;

    const handleUnlock = () => {
      void unlockAudio();
    };

    window.addEventListener("pointerdown", handleUnlock, { once: true, passive: true });
    window.addEventListener("keydown", handleUnlock, { once: true });
    window.addEventListener("touchstart", handleUnlock, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
      window.removeEventListener("touchstart", handleUnlock);
    };
  }, [audioUnlocked, localMuted, unlockAudio]);

  React.useEffect(() => {
    localMutedRef.current = localMuted;
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = localMuted;
  }, [localMuted, volume]);

  React.useEffect(() => {
    if (!startOnView || !inView || started) return;
    const timer = window.setTimeout(() => {
      tickRef.current = 0;
      setIndex(0);
      setStarted(true);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [inView, startOnView, started]);

  // Fallback: if the element is never in view, start after a short delay anyway.
  React.useEffect(() => {
    if (!startOnView || started) return;
    const timer = window.setTimeout(() => {
      tickRef.current = 0;
      setIndex(0);
      setStarted(true);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [startOnView, started, text]);

  React.useEffect(() => {
    if (!audioUnlocked || localMuted || !started) return;
    if (rewoundAfterUnlockRef.current) return;
    if (index > 0 && index < Math.min(text.length, 10)) {
      const timer = window.setTimeout(() => {
        setIndex(0);
        tickRef.current = 0;
        rewoundAfterUnlockRef.current = true;
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [audioUnlocked, index, localMuted, started, text.length]);

  React.useEffect(() => {
    if (!isTyping) return;

    const timer = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio && !localMutedRef.current) {
        if (soundStopTimerRef.current) window.clearTimeout(soundStopTimerRef.current);
        const [offset, duration] = KEY_SPRITES[tickRef.current % KEY_SPRITES.length];
        audio.pause();
        audio.currentTime = offset;
        tickRef.current += 1;
        void audio.play().catch(() => {});
        soundStopTimerRef.current = window.setTimeout(() => {
          audio.pause();
        }, Math.max(duration * 1000 - 18, 55));
      }
      setIndex((value) => Math.min(value + 1, text.length));
    }, typingSpeed);

    return () => window.clearInterval(timer);
  }, [isTyping, text.length, typingSpeed]);

  React.useEffect(() => {
    if (index >= text.length) {
      if (soundStopTimerRef.current) window.clearTimeout(soundStopTimerRef.current);
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  }, [index, text.length]);

  const replay = React.useCallback(() => {
    void unlockAudio();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    tickRef.current = 0;
    rewoundAfterUnlockRef.current = true;
    setIndex(0);
    setStarted(true);
  }, [unlockAudio]);

  const start = React.useCallback(() => {
    void unlockAudio();
    setStarted(true);
  }, [unlockAudio]);

  return (
    <div
      ref={rootRef}
      onPointerEnter={() => {
        if (startOnHover) start();
      }}
      onClick={start}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d10] p-5 text-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)] sm:p-6",
        className,
      )}
    >
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                isTyping ? "animate-pulse bg-emerald-400" : "bg-white/30",
              )}
            />
            <p className="truncate text-[13px] font-medium text-white/70">
              {isTyping ? "Writing a reply…" : started ? "Reply ready" : "Ready to write"}
            </p>
          </div>
          {showControls && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLocalMuted((value) => {
                    const next = !value;
                    if (!next) void unlockAudio();
                    return next;
                  });
                }}
                className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label={localMuted ? "Unmute typing sound" : "Mute typing sound"}
              >
                {localMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  replay();
                }}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-3.5 text-[13px] font-semibold text-zinc-950 transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d10]"
              >
                <RotateCcw className="size-3.5" />
                Replay
              </button>
            </div>
          )}
        </div>

        {!started ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              start();
            }}
            className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Start typing
          </button>
        ) : null}

        <p className="sr-only">{text}</p>
        <p
          aria-hidden
          className="min-h-[9.5rem] whitespace-pre-wrap text-pretty text-xl font-medium leading-8 tracking-[-0.01em] text-white/90 sm:text-2xl sm:leading-9"
        >
          {renderedText}
          {showCursor && !reduceMotion && (
            <motion.span
              aria-hidden
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="ml-0.5 inline-block text-emerald-300"
            >
              |
            </motion.span>
          )}
        </p>
      </div>
    </div>
  );
}

export default TextGenerateTypewriter;
