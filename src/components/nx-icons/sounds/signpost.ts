import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.98;

/** Wooden creaks that follow the two boards as they swing out in opposite ways and settle, the upper board in a rasping saw tone and the lower one a step later in a hollower tone, with a faint wind. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.75), 500, 1500, 0.02); // 0.05-0.80 wind moves the boards
  blip(c, o, 300, t(0.05), 0.05, 0.16, 380, "sawtooth"); // 0.05 upper board swings out (first 7 degrees)
  blip(c, o, 380, t(0.25), 0.06, 0.17, 250, "sawtooth"); // 0.25 upper board swings back, its fastest
  blip(c, o, 250, t(0.45), 0.04, 0.16, 330, "sawtooth"); // 0.45 upper board swings out again
  blip(c, o, 330, t(0.65), 0.025, 0.14, 290, "sawtooth"); // 0.65 upper board's last small swing
  blip(c, o, 260, t(0.1), 0.04, 0.16, 200, "square"); // 0.10 lower board swings the opposite way (0.05 behind)
  blip(c, o, 200, t(0.3), 0.05, 0.17, 300, "square"); // 0.30 lower board swings back, its fastest
  blip(c, o, 300, t(0.5), 0.035, 0.16, 230, "square"); // 0.50 lower board swings again
  blip(c, o, 230, t(0.7), 0.02, 0.13, 260, "square"); // 0.70 lower board's last small swing
}
