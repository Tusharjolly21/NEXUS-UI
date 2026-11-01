/**
 * Molten Hold's sounds, made with the Web Audio API (no audio files), scored to the pour.
 *
 *   ignite   a low thump and a short whoosh as the metal starts to run
 *   grain    one grain of the sizzle. The component plays them while it pours, closer together and brighter as the
 *            channel fills, so the hiss and crackle follow the front
 *   drain    an airy slide downward with a few bubbly notes stepping down, for letting go early
 *   set      a heavy thunk, a hiss of steam as the metal quenches, a ring of chrome as it sets and a sheen that runs
 *            the length of the bar with the ripple
 *   undo     a soft reverse blip, for pressing a finished bar again
 *
 * `arg` is how full the channel is, 0 to 1, for the sounds that follow the pour.
 */
import { hiss, tone, type SoundDef } from "@/lib/ui-sounds";

type Out = AudioNode;

/** Chrome ringing: a note with the odd overtones of struck metal. */
function ring(c: AudioContext, o: Out, freq: number, at: number, gain: number, decay = 0.9) {
  tone(c, o, { freq, at, attack: 0.002, decay, gain });
  tone(c, o, { freq: freq * 2.76, at, attack: 0.001, decay: decay * 0.5, gain: gain * 0.5 });
  tone(c, o, { freq: freq * 5.4, at, attack: 0.001, decay: decay * 0.25, gain: gain * 0.25 });
}

export type MoltenHoldSound = "ignite" | "grain" | "drain" | "set" | "undo";

export function moltenHoldSound(name: MoltenHoldSound, arg = 0): SoundDef {
  switch (name) {
    case "ignite":
      return {
        category: "Molten Hold",
        label: "Ignite",
        play: (c, o) => {
          tone(c, o, { freq: 70, to: 48, glide: 0.12, attack: 0.004, decay: 0.2, gain: 0.22 });
          hiss(c, o, { filter: "lowpass", freq: 500, to: 1500, attack: 0.12, decay: 0.3, gain: 0.06 });
          hiss(c, o, { filter: "highpass", freq: 6000, decay: 0.02, gain: 0.05 });
        },
      };
    case "grain":
      return {
        category: "Molten Hold",
        label: "Sizzle",
        play: (c, o) => {
          const r = Math.random();
          hiss(c, o, { filter: "bandpass", freq: (2400 + arg * 3200) * (0.7 + Math.random() * 0.6), attack: 0.002, decay: 0.03, gain: 0.08 + 0.05 * Math.random(), q: 2.2 });
          // now and then a spit, and a low glug from deep in the crucible
          if (r < 0.28) tone(c, o, { freq: 700 + Math.random() * 1500, to: 450, glide: 0.02, attack: 0.001, decay: 0.03, gain: 0.035 });
          if (r > 0.78) tone(c, o, { freq: 110 + arg * 60, to: 90, glide: 0.05, attack: 0.004, decay: 0.08, gain: 0.05 });
        },
      };
    case "drain":
      return {
        category: "Molten Hold",
        label: "Drain",
        play: (c, o) => {
          hiss(c, o, { filter: "bandpass", freq: 2800, to: 500, attack: 0.05, decay: 0.35, gain: 0.05, q: 0.8 });
          [900, 700, 520].forEach((f, i) => tone(c, o, { freq: f, to: f * 0.6, glide: 0.06, at: 0.05 + i * 0.09, attack: 0.003, decay: 0.1, gain: 0.06 * (1 - i * 0.18) }));
        },
      };
    case "set":
      return {
        category: "Molten Hold",
        label: "Set",
        play: (c, o) => {
          tone(c, o, { freq: 120, to: 70, glide: 0.1, attack: 0.003, decay: 0.28, gain: 0.24 });
          hiss(c, o, { filter: "lowpass", freq: 700, decay: 0.08, gain: 0.12 });
          hiss(c, o, { filter: "highpass", freq: 7000, to: 3500, attack: 0.02, decay: 0.55, gain: 0.05 });
          ring(c, o, 1046.5, 0.03, 0.12, 0.9);
          ring(c, o, 1568, 0.11, 0.08, 0.7);
          tone(c, o, { freq: 2093, to: 3136, glide: 0.6, at: 0.45, attack: 0.2, decay: 0.5, gain: 0.02 });
        },
      };
    case "undo":
      return {
        category: "Molten Hold",
        label: "Undo",
        play: (c, o) => {
          tone(c, o, { freq: 400, to: 180, glide: 0.08, attack: 0.003, decay: 0.12, gain: 0.09 });
          hiss(c, o, { filter: "bandpass", freq: 2000, to: 800, decay: 0.2, gain: 0.03, q: 0.8 });
        },
      };
  }
}
