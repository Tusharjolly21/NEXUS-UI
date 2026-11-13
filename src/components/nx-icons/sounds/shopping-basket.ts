import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A short whistle of the fruit falling, a wooden thud as it lands in the basket, and a creak of wicker as the basket springs back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.06), t(0.32), 700, 2400, 0.02); // 0.06-0.38 the fruit drops through the handle
  thud(c, o, t(0.4), 170, 0.16, 0.1); // 0.40 the fruit lands and the basket squashes
  puff(c, o, t(0.4), 0.06, 1200, 0.05, "bandpass"); // 0.40 wicker knocks
  blip(c, o, 360, t(0.54), 0.04, 0.12, 520, "sawtooth"); // 0.54 the wicker creaks back
}
