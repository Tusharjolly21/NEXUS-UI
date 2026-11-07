import { blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A watery sweep as the tail lashes three times, with three round bubble pops rising in pitch as they float up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.45), 400, 1300, 0.04);
  swish(c, o, t(0.4), t(0.4), 1200, 500, 0.03);
  blip(c, o, 520, t(0.14), 0.07, 0.07, 940);
  blip(c, o, N.A5, t(0.34), 0.07, 0.07, N.D6);
  blip(c, o, N.E6, t(0.54), 0.06, 0.07, N.A6);
}
