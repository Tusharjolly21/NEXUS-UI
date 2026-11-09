import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Dull wooden knocks as the cookie rocks on its edge, each softer than the last, with dry snaps as two crumbs break off the bite. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 300, 600, 0.02); // 0.00 to 0.20 the rock begins
  thud(c, o, t(0.2), 170, 0.13, 0.06); // 0.20 first rock reaches its far side
  tick(c, o, t(0.2), 0.11, 2600); // 0.20 a crumb breaks off
  tick(c, o, t(0.34), 0.09, 3300); // 0.34 a second crumb breaks off
  thud(c, o, t(0.4), 190, 0.09, 0.05); // 0.40 rock back the other way
  thud(c, o, t(0.6), 210, 0.05, 0.04); // 0.60 last small rock
  puff(c, o, t(0.55), 0.03, 4200, 0.02, "highpass"); // 0.55 crumbs pattering down
  puff(c, o, t(0.7), 0.03, 4600, 0.015, "highpass"); // 0.70 more crumbs patter
}
