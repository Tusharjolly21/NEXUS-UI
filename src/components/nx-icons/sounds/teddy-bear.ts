import { blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.48;

/** A rubber squeaker that rises as the teddy is squeezed and falls as it springs back, with a soft plush rustle under it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1300, t(0.02), 0.06, 0.19, 1900, "triangle"); // 0.02-0.21 the teddy is squeezed: squeak up
  puff(c, o, t(0.21), 0.08, 1200, 0.03); // 0.21 the plush presses together, the heart pops
  blip(c, o, 1750, t(0.425), 0.04, 0.12, 1200, "triangle"); // 0.43 it springs back: squeak down
  puff(c, o, t(0.61), 0.06, 900, 0.02); // 0.61 the plush settles
}
