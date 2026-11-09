import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two soft rubber button clicks, a deeper click as the round pad is pressed, and two short rising chirps as the infrared rays fire. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.175), 0.1, 1100); // 0.18 the first button bottoms out
  thud(c, o, t(0.175), 330, 0.07, 0.04); // 0.18 rubber knock
  tick(c, o, t(0.345), 0.1, 1350); // 0.35 the second button bottoms out
  thud(c, o, t(0.345), 360, 0.07, 0.04); // 0.35 rubber knock
  thud(c, o, t(0.552), 250, 0.1, 0.06); // 0.55 the round pad is pressed
  tick(c, o, t(0.552), 0.08, 900); // 0.55 pad click
  blip(c, o, 3900, t(0.6), 0.035, 0.06, 5200, "square"); // 0.60 the first infrared burst
  blip(c, o, 3300, t(0.852), 0.03, 0.09, 4700, "square"); // 0.85 the second burst
  swish(c, o, t(0.6), t(0.24), 3000, 6000, 0.015); // 0.60-0.84 the first rays grow out
  swish(c, o, t(0.852), t(0.34), 3000, 6200, 0.015); // 0.85-1.20 the second rays grow out
}
