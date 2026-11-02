import { ding, plink, blip, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.18;

/** A soft muffled pop, a low hum that dies as the slash is drawn, and a single quiet bell that fades into silence. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.03), 150, 0.2, 0.1);
  puff(c, o, t(0.04), 0.07, 900, 0.05, "lowpass");
  blip(c, o, N.A4, t(0.1), 0.06, 0.34, 150, "sine");
  plink(c, o, N.D5, t(0.2), 0.04, 0.12);
  swish(c, o, t(0.12), t(0.34), 1800, 400, 0.03);
  ding(c, o, N.G5, t(0.38), 0.05, 0.35);
}
