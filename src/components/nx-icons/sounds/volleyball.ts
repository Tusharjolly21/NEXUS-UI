import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.93;

/** A soft palm thump as the ball is set, a whirr that builds and fades with the spin, then a deeper thump and a short rubber squeak as it lands, and a light settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.09), 170, 0.22, 0.1); // 0.09 the hand sets the ball and it squashes
  puff(c, o, t(0.09), 0.05, 1500, 0.06, "lowpass"); // 0.09 soft palm slap
  swish(c, o, t(0.05), t(0.38), 400, 1500, 0.035); // 0.05 to 0.43 the spin builds up
  swish(c, o, t(0.43), t(0.42), 1500, 420, 0.03); // 0.43 to 0.85 the spin slows down
  thud(c, o, t(0.65), 130, 0.24, 0.1); // 0.65 the ball lands and squashes
  blip(c, o, 520, t(0.65), 0.05, 0.07, 300, "triangle"); // 0.65 short rubber squeak
  tick(c, o, t(0.83), 0.05, 2400); // 0.83 it settles back into shape
}
