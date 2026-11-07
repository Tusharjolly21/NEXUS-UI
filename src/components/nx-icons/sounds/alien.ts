import { plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A warbling squeal that slides up and down like a theremin, two small blink ticks, and two bubbly blips that bob in pitch. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.G5, t(0.03), 0.06, 0.4, N.E6, "triangle");
  blip(c, o, N.E6 * 1.02, t(0.4), 0.05, 0.4, N.A5, "triangle");
  tick(c, o, t(0.42), 0.06, 7000);
  plink(c, o, N.D6, t(0.62), 0.06, 0.12);
  plink(c, o, N.B5, t(0.78), 0.06, 0.14);
  swish(c, o, t(0.1), t(0.8), 900, 2400, 0.015);
}
