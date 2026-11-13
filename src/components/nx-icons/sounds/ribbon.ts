import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 6.8;

/** Two silky fabric swishes as the tails flutter out and back, and a faint high shimmer as the loop settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.22), 1200, 3400, 0.025); // 0.04-0.26 the tails flutter out
  swish(c, o, t(0.3), t(0.22), 3000, 900, 0.022); // 0.30-0.52 the tails swing back
  ding(c, o, 3700, t(0.52), 0.02, 0.3); // 0.52 the loop settles with a shimmer
}
