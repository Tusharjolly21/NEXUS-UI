import { ding, blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.53;

/** A wooden creak each time the beam swings through the middle, and a small metal clink of the pans at each tip of the swing, all dying away as the scales settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 170, t(0.1), 0.05, 0.14, 250, "sawtooth"); // 0.14 beam starts to tip, fastest
  blip(c, o, 250, t(0.38), 0.06, 0.15, 150, "sawtooth"); // 0.42 beam swings back through level, fastest
  blip(c, o, 160, t(0.65), 0.045, 0.14, 230, "sawtooth"); // 0.69 swings back again
  blip(c, o, 220, t(0.95), 0.03, 0.12, 160, "sawtooth"); // 0.98 last small swing
  ding(c, o, 3300, t(0.28), 0.065, 0.2); // 0.28 beam at its highest tilt, pans clink
  ding(c, o, 3900, t(0.56), 0.05, 0.18); // 0.56 tips the other way, pans clink
  ding(c, o, 4400, t(0.84), 0.035, 0.16); // 0.84 smaller tip, pans clink
  ding(c, o, 4800, t(1.12), 0.02, 0.14); // 1.12 last tiny clink as the pans settle
}
