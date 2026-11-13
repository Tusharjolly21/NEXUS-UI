import { blip, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.01;

/** Water bloops and a splash as the buoy bobs and rocks on the swell, each one a little quieter. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.2, 900, 0.05, "lowpass"); // 0.00 slap of water
  blip(c, o, 520, t(0.2), 0.1, 0.13, 240); // 0.225 tilted -14 deg, dips down
  blip(c, o, 460, t(0.43), 0.08, 0.13, 220); // 0.45 swings back the other way
  blip(c, o, 400, t(0.66), 0.05, 0.11, 200); // 0.675 smaller bob
  puff(c, o, t(0.82), 0.1, 1200, 0.025, "lowpass"); // 0.90 settles
}
