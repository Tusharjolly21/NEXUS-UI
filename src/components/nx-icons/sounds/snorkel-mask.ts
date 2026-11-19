import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.62;

/** A muffled underwater whoosh as the mask dips, then three bubbles that pop up out of the snorkel. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.32), 200, 600, 0.05); // 0.00-0.32 the mask dips below the surface
  blip(c, o, 380, t(0.33), 0.07, 0.09, 760); // 0.33 the first bubble rises out of the tube
  blip(c, o, 470, t(0.41), 0.06, 0.08, 900); // 0.41 the second bubble
  blip(c, o, 560, t(0.52), 0.045, 0.07, 1080); // 0.52 a third, smaller bubble
  swish(c, o, t(0.33), t(0.3), 500, 250, 0.02); // 0.33-0.63 the mask bobs back up
}
