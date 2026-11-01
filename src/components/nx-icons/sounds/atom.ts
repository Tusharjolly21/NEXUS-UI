import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.44;

/** A sci-fi whirr as the orbits spin up, two pulses of the nucleus, and a shimmer. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.8), 500, 3400, 0.04);
  blip(c, o, 180, t(0.04), 0.05, 0.8, 520, "triangle");
  [0.22, 0.58].forEach((at) => { blip(c, o, N.E6, t(at), 0.07, 0.2); ding(c, o, N.E7, t(at), 0.04, 0.3); });
  ding(c, o, N.G7, t(0.86), 0.04, 0.4);
}
