import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.72;

/** A low electric hum that rises as the scan line sweeps down, a short beep at the bottom, the hum falling as it sweeps back, and a higher beep when it is done. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 180, t(0.0), 0.03, 0.45, 260, "sawtooth"); // 0.00-0.45 the scan line sweeps down
  blip(c, o, 1320, t(0.45), 0.04, 0.08); // 0.45 the scan line reaches the bottom
  blip(c, o, 260, t(0.45), 0.03, 0.45, 170, "sawtooth"); // 0.45-0.90 the scan line sweeps back up
  blip(c, o, 1760, t(0.9), 0.04, 0.1); // 0.90 the scan is done
}
