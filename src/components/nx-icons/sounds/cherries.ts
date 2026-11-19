import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.66;

/** Two little woody pops, one for each cherry, at every end of their out of step swing, quieter each time. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[0.2, 0.24], [0.42, 0.46], [0.62, 0.66], [0.82, 0.84]].forEach(([a, b], i) => {
    blip(c, o, 932, t(a), 0.06 - i * 0.013, 0.05, 800, "triangle"); // 0.20 0.42 0.62 0.82 the left cherry reaches each end of its swing
    blip(c, o, 1046, t(b), 0.05 - i * 0.011, 0.05, 900, "triangle"); // 0.24 0.46 0.66 0.84 the right cherry a beat behind
  });
}
