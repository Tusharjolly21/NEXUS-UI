import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.69;

/** A warm exhale as the tongue lolls out, a soft woof as the head tilts and the ears fly out, an inhale, an ear flop and a last pant. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.12), 0.1, 1900, 0.05, "bandpass"); // 0.12-0.22 tongue lolls out: exhale
  blip(c, o, 230, t(0.23), 0.09, 0.13, 150, "sawtooth"); // 0.23 head tilt reaches the side: soft woof
  thud(c, o, t(0.24), 140, 0.07, 0.1); // 0.27 ears fly out with the woof
  puff(c, o, t(0.37), 0.09, 2600, 0.04, "bandpass"); // 0.37-0.45 tongue pulled back in: inhale
  thud(c, o, t(0.54), 170, 0.08, 0.09); // 0.54 ears flop back down
  puff(c, o, t(0.6), 0.1, 1900, 0.05, "bandpass"); // 0.60-0.68 tongue out again: exhale
  puff(c, o, t(0.78), 0.1, 2400, 0.025, "bandpass"); // 0.78-0.9 tongue settles: soft breath
}
