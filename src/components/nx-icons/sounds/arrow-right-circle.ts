import { ding, plink, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.2;

/** A double heartbeat of soft thuds with a bell on each beat as the ring pulses, a short backwards tug, a quick whoosh to the right, and a rising note as the arrow comes home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.02), 110, 0.18, 0.1);
  ding(c, o, N.C5, t(0.03), 0.06, 0.3);
  thud(c, o, t(0.2), 95, 0.14, 0.1);
  ding(c, o, N.G5, t(0.21), 0.05, 0.3);
  blip(c, o, 360, t(0.14), 0.04, 0.1, 220, "triangle");
  swish(c, o, t(0.3), t(0.24), 700, 3200, 0.05);
  swish(c, o, t(0.56), t(0.3), 2600, 900, 0.03);
  plink(c, o, N.B5, t(0.84), 0.07, 0.16);
}
