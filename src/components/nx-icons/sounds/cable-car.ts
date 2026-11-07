import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A whoosh and a steady whirr of the pulley as the cabin glides off and back, then four bright bell dings, G, D, A and E, and a gentle creak as it swings to a stop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.4), 400, 1800, 0.045);
  swish(c, o, t(0.44), t(0.35), 1700, 500, 0.04);
  [0.08, 0.16, 0.24, 0.32, 0.5, 0.58, 0.66].forEach((at) => tick(c, o, t(at), 0.05, 2400));
  ding(c, o, N.G6, t(0.72), 0.08, 0.5);
  ding(c, o, N.D6, t(0.82), 0.09, 0.5);
  ding(c, o, N.A6, t(0.96), 0.05, 0.45);
  ding(c, o, N.E6, t(1.08), 0.04, 0.4);
  blip(c, o, 240, t(0.78), 0.03, 0.3, 200, "triangle");
}
