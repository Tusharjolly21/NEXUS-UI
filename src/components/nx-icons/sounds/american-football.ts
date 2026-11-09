import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.68;

/** A leathery throw puff, then a low spiral whirr that swells to the fastest point of the spin and fades as the ball floats down, with a soft pat as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.06, 1800, 0.05, "bandpass"); // 0.0 the ball leaves the hand
  swish(c, o, t(0.1), 0.7, 900, 2200, 0.055); // 0.41 whirr peaks as the spin is fastest
  swish(c, o, t(0.0), 0.9, 350, 700, 0.03); // 0.4 deeper air under the spin
  blip(c, o, 150, t(0.12), 0.025, 0.7, 260, "sawtooth"); // 0.12 to 0.8 spiral hum rises and falls with the spin
  thud(c, o, t(0.88), 170, 0.07, 0.07); // 0.9 the ball settles back with a soft pat
}
