import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.69;

/** A small whoosh up as the pumpkin hops, a hollow woody tonk as it lands and squashes, with a leafy rustle at the top of the hop and at the rebound. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.24), 300, 700, 0.025); // 0.00-0.24 the pumpkin hops up
  puff(c, o, t(0.24), 0.05, 2600, 0.02); // 0.24 the leaf flutters at the top
  thud(c, o, t(0.44), 120, 0.3, 0.2); // 0.44 the pumpkin lands
  blip(c, o, 230, t(0.44), 0.07, 0.12, 180, "triangle"); // 0.44 the hollow body tonks
  puff(c, o, t(0.62), 0.05, 2300, 0.015); // 0.62 the leaf rustles on the rebound
}
