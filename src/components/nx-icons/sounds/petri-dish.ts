import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.6;

/** A liquid plip as the drop hits the dish, a faint wet ripple, then four soft bubbly pops as the colonies bloom one by one. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1150, t(0.36), 0.06, 0.06, 2300); // 0.36 the drop hits the agar
  swish(c, o, t(0.37), t(0.42), 1800, 900, 0.015); // 0.37-0.79 the ripple spreads
  blip(c, o, 340, t(0.54), 0.04, 0.06, 520); // 0.54 the first colony blooms
  blip(c, o, 390, t(0.612), 0.035, 0.06, 600); // 0.61 the second colony blooms
  blip(c, o, 360, t(0.684), 0.035, 0.06, 560); // 0.68 the third colony blooms
  blip(c, o, 420, t(0.756), 0.03, 0.06, 640); // 0.76 the fourth colony blooms
}
