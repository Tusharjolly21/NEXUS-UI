import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.1;

/** A dry swish as the brush pulls back, a soft bristle touch where it meets the page, then a long scratchy bristle drag that swells and fades along the stroke. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.21), 1800, 700, 0.03); // 0.02-0.23 the brush swings back, the old stroke retracts
  puff(c, o, t(0.29), 0.05, 2600, 0.07, "bandpass"); // 0.29 bristles touch the page
  swish(c, o, t(0.3), t(0.74), 1500, 3800, 0.06); // 0.30-1.04 bristles drag along the stroke, fastest near 0.65
  swish(c, o, t(0.32), t(0.7), 5200, 2800, 0.025); // 0.32-1.02 the scratchy top of the bristles
  puff(c, o, t(0.45), 0.08, 4500, 0.03, "highpass"); // 0.45 a few bristles flick
  puff(c, o, t(0.7), 0.08, 5200, 0.03, "highpass"); // 0.70 more flicking bristles
  puff(c, o, t(1.0), 0.07, 1800, 0.04, "bandpass"); // 1.00 the brush settles at the end of the stroke
}
