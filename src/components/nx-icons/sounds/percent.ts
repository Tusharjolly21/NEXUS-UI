import { plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.23;

/** A fast zip as the slash is drawn, two pops that step upwards as the circles land, and a coin ting. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.28), 500, 3200, 0.05);
  blip(c, o, N.D6, t(0.38), 0.08, 0.1);
  blip(c, o, N.G6, t(0.53), 0.08, 0.1);
  plink(c, o, N.E7, t(0.66), 0.06, 0.2);
}
