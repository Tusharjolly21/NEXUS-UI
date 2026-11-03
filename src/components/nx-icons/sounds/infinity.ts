import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.19;

/** A soft whoosh that rises and then falls once per half lap, with a glassy ping each time the glow crosses the middle of the eight. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.68), 700, 2400, 0.03);
  swish(c, o, t(0.77), t(0.68), 2400, 700, 0.03);
  ding(c, o, N.A5, t(0), 0.05, 0.55);
  blip(c, o, N.E6, t(0.37), 0.03, 0.1);
  ding(c, o, N.D6, t(0.75), 0.05, 0.55);
  blip(c, o, N.A6, t(1.12), 0.03, 0.1);
}
