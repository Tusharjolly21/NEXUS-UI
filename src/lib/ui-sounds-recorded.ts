/**
 * Nine recorded interface sounds for the Nexus UI Pro plan: typing, camera, message, notification
 * and screenshot, plus four cut from the Word Rush and Glass Orbit video soundtracks (buildup,
 * landing, pitchtick and sting). Unlike the synthesised sounds in `@/lib/ui-sounds` and `@/lib/ui-sounds-pro`, these
 * are short audio recordings. They ship inside `ui-sounds-recorded-audio.ts`, so there is nothing
 * to host and no file to fetch. They play through `@/lib/ui-sounds`, so they follow the same on and
 * off switch, volume and autoplay rules as every other sound.
 *
 *   import { playRecordedSound } from "@/lib/ui-sounds-recorded";
 *   <button onClick={() => playRecordedSound("message")}>Send</button>
 *
 * In a component with an `enableSound` option:
 *
 *   const play = useRecordedSound(enableSound);
 *   play("camera");
 */

import * as React from "react";
import { audioAwake, playDef, useAutoplaySoundAllowed, type SoundDef } from "@/lib/ui-sounds";
import { RECORDED_AUDIO } from "@/lib/ui-sounds-recorded-audio";

export type RecordedSoundName =
  | "typing"
  | "camera"
  | "message"
  | "notification"
  | "screenshot"
  | "buildup"
  | "landing"
  | "pitchtick"
  | "sting";

/** Seconds each recording lasts, so the shared engine keeps it connected until it ends. */
const LENGTH: Record<RecordedSoundName, number> = {
  typing: 3.1,
  camera: 0.6,
  message: 0.55,
  notification: 1.05,
  screenshot: 0.55,
  buildup: 1.85,
  landing: 1.85,
  pitchtick: 0.15,
  sting: 3.7,
};
/** The recordings are levelled to peak near full scale; this brings them to the level of the synthesised sounds. */
const LEVEL = 0.5;

const decoded = new Map<RecordedSoundName, AudioBuffer>();
const pending = new Map<RecordedSoundName, Promise<AudioBuffer | null>>();

function toBytes(dataUri: string): ArrayBuffer {
  const bin = atob(dataUri.slice(dataUri.indexOf(",") + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

/** Decodes with an OfflineAudioContext, which needs no click, so it is safe to call early. */
function decode(name: RecordedSoundName): Promise<AudioBuffer | null> {
  let p = pending.get(name);
  if (!p) {
    p = new OfflineAudioContext(1, 1, 48000)
      .decodeAudioData(toBytes(RECORDED_AUDIO[name]))
      .then((b) => {
        decoded.set(name, b);
        return b;
      })
      .catch(() => null);
    pending.set(name, p);
  }
  return p;
}

/** Decode the recordings ahead of time (all of them, or the ones you name) so the first play is on time. */
export function preloadRecordedSounds(names: RecordedSoundName[] = Object.keys(RECORDED_AUDIO) as RecordedSoundName[]) {
  if (typeof window === "undefined") return;
  names.forEach((n) => void decode(n));
}

function start(c: AudioContext, out: AudioNode, buffer: AudioBuffer) {
  const source = c.createBufferSource();
  const level = c.createGain();
  level.gain.value = LEVEL;
  source.buffer = buffer;
  source.connect(level).connect(out);
  source.start();
}

function define(name: RecordedSoundName, label: string): SoundDef {
  return {
    category: "Recorded",
    label,
    length: LENGTH[name],
    play: (c, out) => {
      const ready = decoded.get(name);
      if (ready) return start(c, out, ready);
      // First play before the decode finished: start as soon as it is ready, unless it took too long.
      const asked = performance.now();
      void decode(name).then((b) => {
        if (b && performance.now() - asked < 1000) start(c, out, b);
      });
    },
  };
}

export const RECORDED_SOUNDS: Record<RecordedSoundName, SoundDef> = {
  typing: define("typing", "Typing"),
  camera: define("camera", "Camera"),
  message: define("message", "Message"),
  notification: define("notification", "Notification"),
  screenshot: define("screenshot", "Screenshot"),
  buildup: define("buildup", "Build-up"),
  landing: define("landing", "Landing"),
  pitchtick: define("pitchtick", "Pitch tick"),
  sting: define("sting", "Glass sting"),
};

/** Play a recorded sound by name. volume is 0..1 on top of the master level. Silent while sounds are off unless `force`. */
export function playRecordedSound(name: RecordedSoundName, volume = 1, force = false) {
  if (!(name in RECORDED_SOUNDS)) return;
  playDef(`recorded:${name}`, RECORDED_SOUNDS[name], volume, force);
}

/**
 * Like useSound in `@/lib/ui-sounds`, for the recorded sounds: silent when `enabled` is false.
 * `play.auto(...)` is for a component that plays itself (autoplay).
 */
export type RecordedSoundPlayer = {
  (name: RecordedSoundName, volume?: number): void;
  auto: (name: RecordedSoundName, volume?: number) => void;
};

export function useRecordedSound(enabled = true): RecordedSoundPlayer {
  const auto = useAutoplaySoundAllowed();
  return React.useMemo(
    () =>
      Object.assign(
        (name: RecordedSoundName, volume = 1) => {
          if (enabled) playRecordedSound(name, volume);
        },
        {
          auto: (name: RecordedSoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playRecordedSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}
