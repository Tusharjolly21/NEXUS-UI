import { ding, blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft thump as the mic is tapped, a breathy pop, a sung note that bends up, and three echoing bells fading away like sound pulsing from the capsule. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.02), 150, 0.22, 0.1);
  puff(c, o, t(0.04), 0.07, 220, 0.12, "lowpass");
  blip(c, o, 392, t(0.14), 0.07, 0.55, 466.16, "triangle");
  blip(c, o, 784, t(0.14), 0.02, 0.4, 932.33);
  [0.22, 0.42, 0.62].forEach((at, i) => ding(c, o, 622.25, t(at), 0.07 - i * 0.02, 0.4));
  swish(c, o, t(0.12), t(0.6), 1800, 700, 0.015);
}
