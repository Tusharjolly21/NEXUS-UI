import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.56;

/** Two soft rising air strokes as the letters roll up and away, then two clean electronic pips as each fresh letter settles in place. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.24), 1500, 3800, 0.025); // 0.00-0.24 the first C rolls up and fades
  swish(c, o, t(0.09), t(0.23), 1700, 4300, 0.022); // 0.09-0.32 the second C rolls up
  blip(c, o, 1568, t(0.6), 0.06, 0.07, 1661); // 0.60 the first C settles in its line
  blip(c, o, 1865, t(0.72), 0.06, 0.08, 1976); // 0.72 the second C settles
}
