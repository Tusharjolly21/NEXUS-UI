import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.25;

/** A soft low swell as the brain grows, a glassy rising whistle that follows the light running down the middle fold, a bright ring where the light reaches the end of the fold, and a second softer swell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.205), 118, 0.09, 0.12); // 0.225 the brain swells to its first peak
  tick(c, o, t(0.26), 0.05, 6800); // 0.27 the pulse appears at the outline
  swish(c, o, t(0.27), t(0.47), 1100, 3400, 0.022); // 0.27-0.74 the pulse travels down the fold
  thud(c, o, t(0.655), 138, 0.06, 0.1); // 0.675 the brain swells a second time
  ding(c, o, 3135, t(0.74), 0.045, 0.2); // 0.74 the pulse reaches the end of the fold
}
