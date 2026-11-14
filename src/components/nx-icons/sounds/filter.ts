import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.96;

/** A soft sifting hiss as the bar slides down the funnel, a bright water-drop plip as the drop lands in the stem, and a faint refilling hiss as the new bar forms. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.0-0.40 the bar slides down the taper and narrows to a drop
  swish(c, o, t(0.02), t(0.38), 3400, 1500, 0.07);
  // 0.40-0.62 the drop falls through the stem
  swish(c, o, t(0.42), t(0.18), 900, 2000, 0.02);
  // 0.62 the drop lands on the end of the stem
  blip(c, o, 760, t(0.62), 0.11, 0.09, 1900);
  puff(c, o, t(0.63), 0.03, 4200, 0.04);
  // 0.70 the drop spreads flat
  blip(c, o, 1300, t(0.7), 0.04, 0.06, 900);
  // 0.84-1.0 a fresh bar forms at the top and widens
  swish(c, o, t(0.84), t(0.16), 1100, 2600, 0.04);
}
