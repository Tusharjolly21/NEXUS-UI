import { plink, blip, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.78;

/** A deep thud as the record is written, a quick chirp of data climbing, a second heavy thud and a bright plink when it is saved. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.08), 75, 0.22, 0.15);
  [0.2, 0.28, 0.36, 0.44].forEach((at, i) => blip(c, o, 400 + i * 220, t(at), 0.05, 0.06, undefined, "triangle"));
  thud(c, o, t(0.47), 70, 0.25, 0.18);
  plink(c, o, N.G6, t(0.6), 0.08, 0.16);
}
