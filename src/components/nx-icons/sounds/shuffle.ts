import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.37;

/** A riffle of card ticks as the two arrows cross, finished with two crisp clicks as the arrowheads land. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  for (let i = 0; i < 9; i++) tick(c, o, t(0.02 + i * 0.05), 0.04 + (i % 3) * 0.01, 2800 + (i % 4) * 700);
  swish(c, o, t(0.02), t(0.5), 900, 3000, 0.03);
  tick(c, o, t(0.46), 0.09, 3400);
  blip(c, o, N.E6, t(0.46), 0.06, 0.1);
  tick(c, o, t(0.58), 0.09, 3800);
  blip(c, o, N.A6, t(0.58), 0.06, 0.1);
}
