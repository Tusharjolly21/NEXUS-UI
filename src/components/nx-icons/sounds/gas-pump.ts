import { ding, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A solid clunk as the nozzle opens, a run of fast counting ticks that climb in pitch while the hose rattles, then a cash register ping of three bells at the end, A, E and B. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.03), 140, 0.2, 0.09);
  tick(c, o, t(0.08), 0.1, 2200);
  [0.2, 0.28, 0.35, 0.42, 0.48, 0.54, 0.59, 0.64].forEach((at, i) => tick(c, o, t(at), 0.06 + i * 0.004, 2800 + i * 260));
  swish(c, o, t(0.15), t(0.55), 250, 700, 0.03);
  [0.22, 0.4, 0.58].forEach((at) => puff(c, o, t(at), 0.05, 1100, 0.05, "bandpass"));
  ding(c, o, N.A6, t(0.78), 0.08, 0.5);
  ding(c, o, N.E6, t(0.86), 0.07, 0.5);
  ding(c, o, N.B6, t(0.94), 0.07, 0.6);
}
