import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.09;

/** A soft fabric whoosh as the hat lifts off, a twiggy creak of the arm, then a muffled snowy pat as the hat lands back on his head. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.3), 900, 2000, 0.035); // 0.00-0.30 the hat lifts
  blip(c, o, 300, t(0.02), 0.03, 0.1, 380, "triangle"); // 0.02 the stick arm creaks up
  swish(c, o, t(0.62), t(0.24), 1800, 800, 0.03); // 0.62-0.86 the hat comes back down
  thud(c, o, t(0.86), 160, 0.1, 0.08); // 0.86 the hat lands on the snow
  puff(c, o, t(0.86), 0.08, 2000, 0.03, "lowpass"); // 0.86 a little powder of snow
}
