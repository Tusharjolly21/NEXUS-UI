import { plink, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.35;

/** A quick spinning whirr that climbs and settles, a small overshoot wobble, and a firm low click as the plus becomes an X. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.42), 500, 3000, 0.05);
  blip(c, o, 360, t(0.04), 0.04, 0.4, 900, "triangle");
  plink(c, o, N.D6, t(0.4), 0.06, 0.1);
  plink(c, o, N.C6, t(0.5), 0.05, 0.12);
  thud(c, o, t(0.46), 130, 0.16, 0.1);
  tick(c, o, t(0.47), 0.1, 3400);
}
