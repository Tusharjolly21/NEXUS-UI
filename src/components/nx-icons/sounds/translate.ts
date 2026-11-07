import { blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two papery flips, one after the other, with a quick two note swap at the midpoint of each, and a soft closing tick as the tiles settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 700, 2400, 0.04);
  swish(c, o, t(0.12), t(0.3), 600, 2000, 0.035);
  blip(c, o, N.D6, t(0.2), 0.06, 0.07);
  blip(c, o, N.G5, t(0.27), 0.06, 0.08);
  swish(c, o, t(0.62), t(0.3), 2400, 700, 0.04);
  swish(c, o, t(0.72), t(0.3), 2000, 600, 0.035);
  blip(c, o, N.G5, t(0.82), 0.06, 0.07);
  blip(c, o, N.D6, t(0.89), 0.06, 0.08);
  tick(c, o, t(0.98), 0.07, 3600);
}
