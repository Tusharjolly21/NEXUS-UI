import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.39;

/** A disk spinning up with a rising whirr, seek clicks as the arm sweeps round, a flurry of ticks, and a finished ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 80, t(0.02), 0.06, 0.8, 260, "sawtooth");
  swish(c, o, t(0.02), t(0.7), 500, 2200, 0.025);
  [0.13, 0.4, 0.67].forEach((at) => {
    tick(c, o, t(at), 0.12, 2200);
    thud(c, o, t(at), 170, 0.05, 0.03);
  });
  [0.2, 0.24, 0.5, 0.53, 0.56].forEach((at) => tick(c, o, t(at), 0.05, 4500));
  ding(c, o, N.E6, t(0.82), 0.05, 0.4);
}
