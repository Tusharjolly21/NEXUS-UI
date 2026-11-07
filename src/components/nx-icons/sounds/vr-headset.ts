import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low hum that swells as the lenses power on, a spinning whoosh while the visor turns and a high shimmer of two bells that fades out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 150, t(0.04), 0.06, 0.6, 260, "triangle");
  blip(c, o, 225, t(0.1), 0.04, 0.6, 390, "sine");
  swish(c, o, t(0.15), t(0.55), 400, 3000, 0.05);
  swish(c, o, t(0.5), t(0.4), 2600, 500, 0.03);
  ding(c, o, N.D7, t(0.62), 0.05, 0.6);
  ding(c, o, N.A6, t(0.74), 0.04, 0.7);
  ding(c, o, N.E5, t(0.86), 0.03, 0.5);
  tick(c, o, t(1.0), 0.05, 3000);
}
