import { swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.0;

/** A soft breath of air for each lap, with a tiny tick as the arc sets off. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(1.0), 500, 1800, 0.05);
  tick(c, o, t(0.02), 0.08, 3500);
}
