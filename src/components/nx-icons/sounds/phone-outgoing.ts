import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3;

/** Three quick keypad beeps climbing G, C and E, a bright whoosh as the arrow shoots away, then a soft high ping as the next one slides back in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.G5, N.C6, N.E6].forEach((f, i) => blip(c, o, f, t(0.02 + i * 0.07), 0.05, 0.06));
  swish(c, o, t(0.22), t(0.3), 900, 4200, 0.05);
  swish(c, o, t(0.5), t(0.3), 3000, 1000, 0.025);
  ding(c, o, N.A6, t(0.78), 0.04, 0.3);
}
