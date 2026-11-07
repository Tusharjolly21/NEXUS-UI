import { blip, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.19;

/** A rubbery squeak as the wedge rocks, three hollow pops as its holes swell (the big one lowest), a squeak back the other way and a soft bump as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1700, t(0.1), 0.05, 0.08, 2500, "triangle"); // 0.1 the wedge starts to tip left, a squeak
  blip(c, o, 240, t(0.3), 0.08, 0.1, 480); // 0.3 the big hole swells, a hollow pop
  blip(c, o, 2600, t(0.37), 0.04, 0.07, 1800, "triangle"); // 0.38 the wedge swings right, a squeak back
  blip(c, o, 560, t(0.4), 0.06, 0.07, 900); // 0.4 the small hole swells
  blip(c, o, 400, t(0.5), 0.06, 0.08, 700); // 0.5 the third hole swells
  thud(c, o, t(0.6), 200, 0.07, 0.07); // 0.6 the wedge settles flat
}
