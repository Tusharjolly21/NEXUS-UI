import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.04;

/** A slosh of liquid, then bubbles blooping up and popping, rising in pitch. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 500, 1400, 0.025);
  [0.22, 0.42, 0.62].forEach((at, i) => { blip(c, o, 300 + i * 120, t(at), 0.08, 0.12, 700 + i * 220); tick(c, o, t(at + 0.1), 0.06, 4200); });
  puff(c, o, t(0.1), 0.7, 4800, 0.02, "highpass");
}
