import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A rising engine whine as the needle climbs, four ticks as it passes the marks, a bell at the red, then a falling sweep and a soft thump as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.42), 260, 3200, 0.05);
  blip(c, o, 120, t(0.04), 0.06, 0.4, 420, "sawtooth");
  [0.1, 0.19, 0.28, 0.37].forEach((at) => tick(c, o, t(at), 0.1, 3800));
  ding(c, o, N.A6, t(0.44), 0.07, 0.5);
  ding(c, o, N.E5, t(0.5), 0.04, 0.4);
  swish(c, o, t(0.52), t(0.5), 2600, 300, 0.035);
  blip(c, o, 330, t(0.62), 0.03, 0.3, 90, "triangle");
  thud(c, o, t(1.04), 140, 0.14, 0.1);
}
