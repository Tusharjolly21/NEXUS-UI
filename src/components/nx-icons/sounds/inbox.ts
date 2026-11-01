import { ding, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.46;

/** Paper fluttering down, a soft landing thud in the tray, and a bright bell ding for new mail. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.04), 0.1, 3600, 0.03, "highpass");
  puff(c, o, t(0.16), 0.1, 4400, 0.025, "highpass");
  puff(c, o, t(0.26), 0.08, 3000, 0.02, "highpass");
  thud(c, o, t(0.38), 110, 0.12, 0.08);
  ding(c, o, N.E6, t(0.42), 0.08, 0.5);
}
