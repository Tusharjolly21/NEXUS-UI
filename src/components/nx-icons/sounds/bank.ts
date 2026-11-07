import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four stony taps stepping up as the columns rise, a thin whistle as a coin falls, and a bright coin clink with a low vault thud under it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3].forEach((i) => blip(c, o, 190 + i * 28, t(0.2 + i * 0.08), 0.1, 0.09, 150 + i * 28, "square"));
  swish(c, o, t(0.48), t(0.3), 2600, 1100, 0.02);
  ding(c, o, N.A6, t(0.82), 0.07, 0.55);
  ding(c, o, N.C8, t(0.85), 0.035, 0.4);
  ding(c, o, N.D6, t(0.9), 0.04, 0.45);
  thud(c, o, t(0.82), 70, 0.16, 0.12);
  tick(c, o, t(0.84), 0.09, 4800);
}
