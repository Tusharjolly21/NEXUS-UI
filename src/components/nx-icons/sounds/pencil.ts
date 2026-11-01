import { tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.89;

/** Scratchy graphite strokes as the line is drawn, ending on a tiny tap. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.05, 0.2, 0.34, 0.5].forEach((at, i) => puff(c, o, t(at), 0.1, 5200 + (i % 2) * 900, 0.03, "highpass"));
  puff(c, o, t(0.05), 0.7, 3400, 0.018, "bandpass");
  tick(c, o, t(0.78), 0.1, 2400);
}
