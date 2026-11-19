import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.5;

/** Three quick wooden clacks rising in pitch as each diagonal of squares flips over, like tiles turning on a board. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.48), 1700, 3200, 0.02); // 0.04-0.52 the flip wave runs across the board
  tick(c, o, t(0.288), 0.1, 1900); // 0.29 the first diagonal snaps face up
  blip(c, o, 784, t(0.288), 0.04, 0.05, 700, "triangle"); // 0.29 wooden body of the first clack
  tick(c, o, t(0.408), 0.1, 2300); // 0.41 the second diagonal flips
  blip(c, o, 932, t(0.408), 0.04, 0.05, 830, "triangle"); // 0.41 wooden body of the second clack
  tick(c, o, t(0.528), 0.1, 2700); // 0.53 the third diagonal flips
  blip(c, o, 1108, t(0.528), 0.04, 0.05, 990, "triangle"); // 0.53 wooden body of the third clack
}
