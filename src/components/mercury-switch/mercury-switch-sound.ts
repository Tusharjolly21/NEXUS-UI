/**
 * Mercury Switch's sounds, made with the Web Audio API (no audio files): a drop of liquid metal that reaches, lands and rings.
 *
 *   on     a rising bloop as the leading edge reaches across, a second, higher one as the rest lets go and catches
 *          up, a soft low plop as it squashes into the end of the groove, and a small chrome ring as it settles
 *   off    the same, falling
 *   grab   a short, wet squeeze as you take hold of the bead
 *
 * `pitch` gives each row its own voice, so three switches flipped in turn make a little run of notes.
 */
import { hiss, tone, type SoundDef } from "@/lib/ui-sounds";

type Out = AudioNode;

/** A drop of liquid: a note that springs through pitch, like a bubble leaving water, with a faint octave above. */
function bloop(c: AudioContext, o: Out, from: number, to: number, at: number, gain: number, decay = 0.12) {
  tone(c, o, { freq: from, to, glide: 0.07, at, attack: 0.004, decay, gain });
  tone(c, o, { freq: to * 2, at: at + 0.01, attack: 0.003, decay: decay * 0.4, gain: gain * 0.22 });
}

/** Chrome settling: a small ring with the odd overtones of struck metal. */
function ring(c: AudioContext, o: Out, freq: number, at: number, gain: number, decay = 0.35) {
  tone(c, o, { freq, at, attack: 0.002, decay, gain });
  tone(c, o, { freq: freq * 2.76, at, attack: 0.001, decay: decay * 0.35, gain: gain * 0.5 });
  tone(c, o, { freq: freq * 5.4, at, attack: 0.001, decay: decay * 0.15, gain: gain * 0.25 });
}

export type MercurySwitchSound = "on" | "off" | "grab";

export function mercurySwitchSound(name: MercurySwitchSound, pitch = 1): SoundDef {
  switch (name) {
    case "on":
      return {
        category: "Mercury Switch",
        label: "On",
        play: (c, o) => {
          hiss(c, o, { at: 0, attack: 0.05, decay: 0.12, freq: 1400, to: 3200, gain: 0.035, q: 0.9 });
          bloop(c, o, 260 * pitch, 700 * pitch, 0.02, 0.15);
          bloop(c, o, 420 * pitch, 980 * pitch, 0.09, 0.09, 0.1);
          tone(c, o, { freq: 190 * pitch, to: 130 * pitch, glide: 0.06, at: 0.17, attack: 0.003, decay: 0.12, gain: 0.12 });
          ring(c, o, 2100 * pitch, 0.17, 0.04, 0.3);
        },
      };
    case "off":
      return {
        category: "Mercury Switch",
        label: "Off",
        play: (c, o) => {
          hiss(c, o, { at: 0, attack: 0.05, decay: 0.12, freq: 3000, to: 1200, gain: 0.03, q: 0.9 });
          bloop(c, o, 700 * pitch, 300 * pitch, 0.02, 0.13);
          bloop(c, o, 900 * pitch, 420 * pitch, 0.09, 0.08, 0.1);
          tone(c, o, { freq: 170 * pitch, to: 115 * pitch, glide: 0.06, at: 0.17, attack: 0.003, decay: 0.12, gain: 0.1 });
          ring(c, o, 1500 * pitch, 0.17, 0.03, 0.25);
        },
      };
    case "grab":
      return {
        category: "Mercury Switch",
        label: "Grab",
        play: (c, o) => {
          tone(c, o, { freq: 210 * pitch, to: 340 * pitch, glide: 0.06, attack: 0.004, decay: 0.09, gain: 0.07 });
          hiss(c, o, { filter: "lowpass", freq: 900, decay: 0.06, gain: 0.04 });
        },
      };
  }
}
