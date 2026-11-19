import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.63;

/** A soft rising coo as the head tips, three tiny giggles where the cheeks glow and the head swings back, and a little sigh as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 610, t(0.0), 0.05, 0.17, 870); // 0.00-0.19 the head tips left: a rising coo
  blip(c, o, 1010, t(0.187), 0.04, 0.06, 1190, "triangle"); // 0.19 the cheeks glow: first giggle
  blip(c, o, 930, t(0.425), 0.035, 0.06, 1120, "triangle"); // 0.43 the head swings right: second giggle
  blip(c, o, 1060, t(0.646), 0.03, 0.06, 1260, "triangle"); // 0.65 the cheeks glow again: third giggle
  blip(c, o, 720, t(0.8), 0.025, 0.14, 560); // 0.80-0.85 the head settles with a sigh
}
