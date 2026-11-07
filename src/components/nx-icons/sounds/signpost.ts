import { ding, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two dry wooden creaks as the boards swing out in opposite directions, a rush of wind, and two small knocks as they settle with three faint bell taps. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.6), 600, 1800, 0.03);
  blip(c, o, 330, t(0.1), 0.05, 0.16, 270, "sawtooth");
  blip(c, o, 250, t(0.28), 0.045, 0.16, 310, "sawtooth");
  blip(c, o, 340, t(0.5), 0.035, 0.12, 290, "sawtooth");
  thud(c, o, t(0.72), 190, 0.18, 0.07);
  thud(c, o, t(0.84), 160, 0.12, 0.07);
  ding(c, o, N.G7, t(0.86), 0.025, 0.3);
  ding(c, o, N.A4, t(0.92), 0.025, 0.3);
  ding(c, o, N.D6, t(0.98), 0.02, 0.3);
}
