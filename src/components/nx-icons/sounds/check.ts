import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.44;

/** A rising airy sweep as the check mark is drawn, a glassy two-tone ding where the stroke lands and the check mark pops, and a shimmer that circles with the ring. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.05-0.40 the check mark is drawn
  swish(c, o, t(0.05), t(0.35), 1500, 4200, 0.04);
  // 0.40 the stroke lands and the check mark pops
  ding(c, o, 2093, t(0.4), 0.1, 0.5);
  // 0.55 the check mark reaches the top of its pop
  blip(c, o, 3136, t(0.55), 0.03, 0.05);
  // 0.40-0.95 the ring sweeps once around and fades
  swish(c, o, t(0.42), t(0.5), 2800, 6000, 0.035);
}
