"use client";

import * as React from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { videoAudioSrc, videoPosterSrc, type FormatId } from "@/lib/catalog/videos";
import { VideoStage } from "./video-stage";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Plays one of the videos live in the page. The video is a pure function of time, so this is just
 * a clock: it advances `t` about 30 times a second and redraws. With the sound on, the soundtrack
 * is the clock instead (so picture and music cannot drift), and it loops.
 *
 * Videos with no soundtrack (the website loop) have no sound button and just loop.
 *
 * Sound starts only after a press on the sound button, never by itself. Playback pauses while the
 * player is off screen, and with reduced motion it waits on its still frame until asked to play.
 */
export function VideoPlayer({
  slug,
  duration,
  posterAt,
  format = "9:16",
  silent = false,
  posterFormat = "9:16",
  values,
  autoPlay = false,
  className,
}: {
  slug: string;
  duration: number;
  posterAt: number;
  /** The shape to play in. */
  format?: FormatId;
  /** No soundtrack: hides the sound button. */
  silent?: boolean;
  /** The shape the pre-rendered still was made in; it is only shown while that shape is playing. */
  posterFormat?: FormatId;
  values?: Record<string, unknown>;
  autoPlay?: boolean;
  className?: string;
}) {
  const root = React.useRef<HTMLDivElement>(null);
  const [t, setT] = React.useState(autoPlay ? 0 : posterAt);
  const [playing, setPlaying] = React.useState(false);
  const [sound, setSound] = React.useState(false);
  const audio = React.useRef<HTMLAudioElement | null>(null);
  const soundRef = React.useRef(false);
  const resumeRef = React.useRef(false);
  const tRef = React.useRef(t);
  React.useEffect(() => {
    tRef.current = t;
    soundRef.current = sound;
  });

  // Start by itself when asked to, unless the visitor prefers reduced motion (then it waits on its still).
  React.useEffect(() => {
    if (!autoPlay) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion and autoplay are only known once mounted in the browser
    if (reduce) setT(posterAt);
    else setPlaying(true);
  }, [autoPlay, posterAt]);

  // The clock.
  React.useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let painted = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - painted < 30) return; // the videos are 30 fps
      const a = audio.current;
      let next = tRef.current + (now - last) / 1000;
      if (a && soundRef.current && !a.paused && a.readyState >= 2) next = a.currentTime;
      last = now;
      painted = now;
      if (next >= duration) {
        next = 0;
        if (a && soundRef.current) {
          a.currentTime = 0;
          void a.play().catch(() => {});
        }
      }
      setT(next);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);

  // Keep the soundtrack in step with play and pause.
  React.useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (playing && sound) {
      a.currentTime = Math.min(tRef.current, duration);
      void a.play().catch(() => setSound(false));
    } else a.pause();
  }, [playing, sound, duration]);

  // Pause when scrolled away, carry on when back.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) {
        setPlaying((p) => {
          resumeRef.current = p;
          return false;
        });
      } else if (resumeRef.current) {
        resumeRef.current = false;
        setPlaying(true);
      }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => () => {
    audio.current?.pause();
    audio.current = null;
  }, []);

  const ensureAudio = () => {
    if (!audio.current) {
      const a = new Audio(videoAudioSrc(slug));
      a.preload = "auto";
      audio.current = a;
    }
  };

  const toggle = () => setPlaying((p) => !p);

  const toggleSound = () => {
    if (!sound) {
      ensureAudio();
      setSound(true);
      setPlaying(true);
    } else setSound(false);
  };

  const seek = (v: number) => {
    setT(v);
    tRef.current = v;
    const a = audio.current;
    if (a) a.currentTime = v;
  };

  return (
    <div
      ref={root}
      className={cn("group/player relative isolate overflow-hidden bg-black", className)}
      onKeyDown={(e) => {
        if (e.key === " " && e.target === e.currentTarget) {
          e.preventDefault();
          toggle();
        }
      }}
      tabIndex={0}
      role="group"
      aria-label="Video player"
    >
      <button type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className="block w-full cursor-pointer outline-none">
        <VideoStage slug={slug} t={t} format={format} values={values} poster={format === posterFormat ? videoPosterSrc(slug) : undefined} />
      </button>

      {!playing ? (
        <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center bg-black/10">
          <span className="grid size-16 place-items-center rounded-full bg-white/90 text-black shadow-[0_10px_40px_-8px_rgba(0,0,0,0.5)] backdrop-blur">
            <Play className="size-6 translate-x-0.5 fill-current" />
          </span>
        </span>
      ) : null}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-white transition-opacity duration-200",
          playing ? "opacity-100 sm:opacity-0 sm:group-hover/player:opacity-100 sm:group-focus-within/player:opacity-100" : "opacity-100",
        )}
      >
        <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white">
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={Math.min(t, duration)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          aria-valuetext={`${fmt(t)} of ${fmt(duration)}`}
          className="h-1 min-w-0 flex-1 cursor-pointer accent-white"
        />
        <span className="w-[72px] shrink-0 text-right text-[12px] tabular-nums text-white/85">
          {fmt(t)} / {fmt(duration)}
        </span>
        {silent ? null : (
          <button
            type="button"
            onClick={toggleSound}
            aria-label={sound ? "Turn sound off" : "Turn sound on"}
            aria-pressed={sound}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
          >
            {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
