/**
 * Mercury Upload's sounds, made with the Web Audio API (no audio files), scored to the pour.
 *
 *   catch   a soft thock as the file arrives
 *   drip    a tick as a bead lets go under the chip
 *   plop    the bead landing in the pool: a bubble, with a ripple running off after it. Its pitch rises with the pool
 *           (`arg`, 0 to 1), the way a bottle rings higher as it fills, so you can hear the progress
 *   pull    the pool gathering itself into one bead: a rising swell of air and a low note drawing in
 *   done    a thunk as the bead settles and a ring of chrome as the check is pressed into it
 */
import { hiss, tone, type SoundDef } from "@/lib/ui-sounds";

type Out = AudioNode;

/** Chrome ringing: a note with the odd overtones of struck metal. */
function ring(c: AudioContext, o: Out, freq: number, at: number, gain: number, decay = 0.9) {
  tone(c, o, { freq, at, attack: 0.002, decay, gain });
  tone(c, o, { freq: freq * 2.76, at, attack: 0.001, decay: decay * 0.5, gain: gain * 0.5 });
  tone(c, o, { freq: freq * 5.4, at, attack: 0.001, decay: decay * 0.25, gain: gain * 0.25 });
}

export type MercuryUploadSound = "catch" | "drip" | "plop" | "pull" | "done";

export function mercuryUploadSound(name: MercuryUploadSound, arg = 0): SoundDef {
  switch (name) {
    case "catch":
      return {
        category: "Mercury Upload",
        label: "Catch",
        play: (c, o) => {
          tone(c, o, { freq: 220, to: 150, glide: 0.05, attack: 0.003, decay: 0.09, gain: 0.12 });
          hiss(c, o, { filter: "highpass", freq: 5000, decay: 0.012, gain: 0.04 });
        },
      };
    case "drip":
      return {
        category: "Mercury Upload",
        label: "Drip",
        play: (c, o) => {
          hiss(c, o, { filter: "highpass", freq: 6000, decay: 0.01, gain: 0.03 });
          tone(c, o, { freq: 900, to: 1400, glide: 0.02, attack: 0.002, decay: 0.04, gain: 0.05 });
        },
      };
    case "plop": {
      const base = 300 + arg * 500;
      return {
        category: "Mercury Upload",
        label: "Plop",
        play: (c, o) => {
          tone(c, o, { freq: base, to: base * 2.1, glide: 0.05, attack: 0.003, decay: 0.12, gain: 0.13 });
          tone(c, o, { freq: base * 4.2, at: 0.01, attack: 0.002, decay: 0.05, gain: 0.03 });
          tone(c, o, { freq: base * 1.2, to: base * 2.4, glide: 0.05, at: 0.09, attack: 0.003, decay: 0.09, gain: 0.05 });
          ring(c, o, 1500 + arg * 900, 0.02, 0.03, 0.2);
        },
      };
    }
    case "pull":
      return {
        category: "Mercury Upload",
        label: "Pull together",
        play: (c, o) => {
          hiss(c, o, { filter: "bandpass", freq: 300, to: 2200, attack: 0.3, decay: 0.3, gain: 0.05, q: 0.8 });
          tone(c, o, { freq: 160, to: 420, glide: 0.4, attack: 0.1, decay: 0.3, gain: 0.12 });
          tone(c, o, { freq: 190, to: 130, glide: 0.06, at: 0.5, attack: 0.003, decay: 0.12, gain: 0.1 });
        },
      };
    case "done":
      return {
        category: "Mercury Upload",
        label: "Done",
        play: (c, o) => {
          tone(c, o, { freq: 140, to: 90, glide: 0.08, attack: 0.003, decay: 0.2, gain: 0.15 });
          ring(c, o, 1568, 0.02, 0.12, 0.9);
          ring(c, o, 2093, 0.12, 0.08, 0.7);
        },
      };
  }
}
