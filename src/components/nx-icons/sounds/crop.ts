import { blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.66;

/** A thin rising sweep as the crop handles slide out, a quick falling sweep as they pinch in, a hard snap thump, and a double camera shutter click with a short high note. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 1000, 2200, 0.035);
  swish(c, o, t(0.28), t(0.22), 3000, 1200, 0.045);
  thud(c, o, t(0.52), 170, 0.18, 0.09);
  tick(c, o, t(0.52), 0.18, 2500);
  tick(c, o, t(0.58), 0.12, 4200);
  blip(c, o, N.G5, t(0.6), 0.05, 0.12, N.C7);
}
