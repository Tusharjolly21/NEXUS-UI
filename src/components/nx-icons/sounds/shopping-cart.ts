import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.77;

/** A whoosh as the item drops, a pop and a cash-register ding as it lands, and the cart rattling forward. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.38), 2000, 500, 0.035);
  blip(c, o, 330, t(0.4), 0.14, 0.12, 700);
  ding(c, o, N.G6, t(0.42), 0.1, 0.5);
  ding(c, o, N.D7, t(0.5), 0.08, 0.5);
  [0.45, 0.53, 0.62].forEach((at) => {
    tick(c, o, t(at), 0.05, 1800);
    blip(c, o, 220, t(at), 0.03, 0.04);
  });
}
