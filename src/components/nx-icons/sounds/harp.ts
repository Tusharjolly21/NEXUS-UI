import { plink, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four harp strings plucked one after another, each a soft round pluck with a long singing tail, rising from low to high like a quick strum. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  plink(c, o, 294, t(0.2), 0.09, 0.6); // 0.20 first string released at its widest swing
  plink(c, o, 370, t(0.37), 0.085, 0.6); // 0.37 second string
  plink(c, o, 440, t(0.54), 0.08, 0.6); // 0.54 third string
  plink(c, o, 587, t(0.71), 0.075, 0.65); // 0.71 shortest string, highest
}
