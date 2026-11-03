import { blip, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3;

/** A faint hush of fine rain with five tiny, quiet droplet notes landing one after another. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.1), 0.9, 4500, 0.012, "bandpass");
  [N.G6, N.D7, N.C7, N.E7, N.A6].forEach((f, i) => blip(c, o, f, t(0.36 + i * 0.1), 0.03, 0.07));
}
