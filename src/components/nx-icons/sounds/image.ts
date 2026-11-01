import { ding, plink, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.95;

/** A camera-shutter click as the frame pops, mountains drawn in with rising blips, and a bright plink when the sun appears. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.16, 2400);
  thud(c, o, t(0.02), 240, 0.06, 0.04);
  tick(c, o, t(0.08), 0.1, 3600);
  [N.A5, N.D6, N.G6].forEach((f, i) => blip(c, o, f, t(0.12 + i * 0.09), 0.07, 0.12));
  plink(c, o, N.C7, t(0.32), 0.1, 0.18);
  ding(c, o, N.G7, t(0.36), 0.05, 0.4);
}
