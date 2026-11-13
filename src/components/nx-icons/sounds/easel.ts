import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft brush dragged over canvas: a bristly scratch that swells and fades with the stroke, small bristle crackles along the way, and a tiny tap as the brush lifts. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), t(0.6), 2400, 3600, 0.022); // 0.10-0.70 the brush stroke is drawn
  puff(c, o, t(0.1), 0.03, 3800, 0.03); // 0.10 bristles touch the canvas
  puff(c, o, t(0.24), 0.02, 4200, 0.02); // 0.24 bristle texture
  puff(c, o, t(0.36), 0.02, 3900, 0.02); // 0.36 bristle texture
  puff(c, o, t(0.5), 0.02, 4400, 0.02); // 0.50 bristle texture
  tick(c, o, t(0.7), 0.04, 1800); // 0.70 brush lifts off
}
