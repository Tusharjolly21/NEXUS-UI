import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A tiny lift of the clapper, a sharp wooden clack as it snaps shut, a lighter second tap as it springs back, then a clean one kilohertz sync beep. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 500, 1600, 0.025);
  tick(c, o, t(0.3), 0.05, 3000);
  puff(c, o, t(0.4), 0.05, 1900, 0.3, "bandpass");
  thud(c, o, t(0.4), 230, 0.34, 0.07);
  tick(c, o, t(0.4), 0.25, 4200);
  thud(c, o, t(0.5), 320, 0.12, 0.05);
  tick(c, o, t(0.5), 0.1, 3600);
  blip(c, o, 1000, t(0.64), 0.07, 0.16);
}
