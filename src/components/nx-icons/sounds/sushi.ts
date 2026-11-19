import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.38;

/** A soft squishy plop as the nigiri lands, then two small jelly wobbles as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.25), 500, 900, 0.015); // 0.00-0.25 the nigiri hops up
  blip(c, o, 330, t(0.45), 0.11, 0.1, 190); // 0.45 it lands with a soft plop
  thud(c, o, t(0.45), 140, 0.08, 0.08); // 0.45 the weight of the rice
  blip(c, o, 470, t(0.59), 0.04, 0.06, 410); // 0.59 the first jelly wobble
  blip(c, o, 440, t(0.74), 0.025, 0.05, 395); // 0.74 a smaller wobble
}
