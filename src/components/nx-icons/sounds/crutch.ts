import { ding, blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.96;

/** A hollow metal whoosh as the crutch swings forward, then a rubbery thock with a faint ring of the aluminium tube as the tip plants. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.3), 500, 1300, 0.03); // 0.00-0.30 the crutch lifts and swings
  thud(c, o, t(0.48), 140, 0.22, 0.12); // 0.48 the rubber tip plants
  blip(c, o, 260, t(0.48), 0.05, 0.06, 200, "triangle"); // 0.48 the rubber squashes
  ding(c, o, 1240, t(0.48), 0.015, 0.25); // 0.48 the tube rings faintly
  thud(c, o, t(0.64), 180, 0.04, 0.06); // 0.64 the crutch settles upright
}
