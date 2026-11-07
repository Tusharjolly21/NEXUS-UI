import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A wailing sawtooth that swoops up, down, up and down again in four quarter-second pulses, with a faint chirp on each flash. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3].forEach((i) => {
    blip(c, o, i % 2 ? N.E6 : N.A5, t(0.02 + i * 0.25), 0.055, 0.22, i % 2 ? N.A5 : N.E6, "sawtooth");
    tick(c, o, t(0.04 + i * 0.25), 0.05, 4800);
  });
  swish(c, o, t(0.05), t(0.9), 600, 1500, 0.015);
}
