import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.28;

/** A gentle swirl of liquid, a bright glass clink with a long ring, and two low glugs as the wine settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.38), 500, 1300, 0.025);
  tick(c, o, t(0.33), 0.12, 5600);
  ding(c, o, N.C8, t(0.33), 0.06, 0.8);
  ding(c, o, N.G7, t(0.33), 0.04, 0.7);
  swish(c, o, t(0.5), t(0.3), 900, 400, 0.02);
  blip(c, o, 210, t(0.7), 0.05, 0.1, 140);
  blip(c, o, 190, t(0.82), 0.04, 0.1, 130);
}
