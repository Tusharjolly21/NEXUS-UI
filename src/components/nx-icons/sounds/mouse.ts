import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.89;

/** A soft slide across the desk, three scroll-wheel ticks, and two sharp click-clacks of a double click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.45), 900, 1800, 0.02);
  [0.14, 0.2, 0.26].forEach((at) => tick(c, o, t(at), 0.06, 3400));
  [0.56, 0.765].forEach((at) => {
    tick(c, o, t(at), 0.16, 2800);
    thud(c, o, t(at), 210, 0.07, 0.04);
  });
  [0.675, 0.9].forEach((at) => tick(c, o, t(at), 0.07, 3800));
}
