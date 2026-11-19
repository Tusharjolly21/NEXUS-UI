import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.1;

/** A breath of wind and three soft wooden creaks, high to low, as the eaves flex roof by roof, then a warm low temple gong as the doorway glows. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.55), 700, 1300, 0.02); // 0.00-0.55 the wind that lifts the eaves
  blip(c, o, 330, t(0.18), 0.05, 0.1, 290, "triangle"); // 0.20 the top eaves flex up
  blip(c, o, 262, t(0.3), 0.05, 0.1, 230, "triangle"); // 0.32 the middle eaves flex up
  blip(c, o, 208, t(0.42), 0.05, 0.12, 182, "triangle"); // 0.44 the lowest eaves flex up
  ding(c, o, 147, t(0.6), 0.12, 0.7); // 0.63 the lantern in the doorway glows brightest: a gong
  ding(c, o, 353, t(0.6), 0.03, 0.4); // 0.63 the gong's bright ring
}
