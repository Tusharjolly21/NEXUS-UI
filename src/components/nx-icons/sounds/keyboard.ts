import { tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.86;

/** Five clacks typed in an uneven rhythm, each a different pitch, then a firm thump on the space bar. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.15, 3200], [0.22, 2600], [0.3, 3600], [0.36, 2800], [0.46, 3400]].forEach(([at, f]) => {
    tick(c, o, t(at), 0.1, f);
    thud(c, o, t(at), 300, 0.04, 0.025);
  });
  thud(c, o, t(0.6), 150, 0.12, 0.07);
  tick(c, o, t(0.6), 0.14, 2200);
}
