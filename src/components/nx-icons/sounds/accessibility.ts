import { ding, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.31;

/** An airy rising whoosh as the arms swing up, a bright star-jump ding at the top, a falling whoosh and a soft thud as the figure lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.38), 500, 2000, 0.03); // 0.00-0.38 the arms swing up
  ding(c, o, 2300, t(0.4), 0.05, 0.25); // 0.40 the arms are at the top of the jump
  swish(c, o, t(0.42), t(0.36), 1800, 500, 0.025); // 0.42-0.78 the arms come down
  thud(c, o, t(0.8), 140, 0.1, 0.09); // 0.80 the figure lands
}
