import { ding, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.56;

/** A silky sweep as the outer petals swing open, one glassy dewdrop glint at the widest point, a falling sweep as they close, and a soft kiss when they touch. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.34), 1100, 3000, 0.035); // 0.02-0.36 petals swing open
  ding(c, o, 3520, t(0.34), 0.03, 0.4); // 0.34 petals fully open
  swish(c, o, t(0.52), t(0.38), 2800, 900, 0.03); // 0.52-0.90 petals close again
  puff(c, o, t(0.88), 0.06, 900, 0.04, "lowpass"); // 0.90 petals meet around the centre
}
