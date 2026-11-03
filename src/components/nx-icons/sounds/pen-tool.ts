import { ding, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.56;

/** A dry scratchy stroke as the curve is drawn, a bell for each anchor point as it pops, a short glide and tick as the nib presses down and the handles flash, and a soft sweep away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.6), 900, 2600, 0.03);
  puff(c, o, t(0.1), 0.55, 4000, 0.02, "bandpass");
  ding(c, o, N.G5, t(0.1), 0.06, 0.3);
  ding(c, o, N.D6, t(0.38), 0.06, 0.3);
  tick(c, o, t(0.44), 0.1, 3600);
  blip(c, o, 500, t(0.46), 0.05, 0.12, 900);
  ding(c, o, N.B5, t(0.66), 0.06, 0.4);
  swish(c, o, t(0.78), t(0.2), 2200, 700, 0.02);
}
