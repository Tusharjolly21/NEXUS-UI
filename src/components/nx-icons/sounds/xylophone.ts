import { ding, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.2;

/** Four bright, woody mallet taps that climb in pitch, each a short click with a clear ringing bar tone, left mallet then right, twice. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.2), 0.09, 3000); // 0.20 left mallet hits its bar
  ding(c, o, 1245, t(0.2), 0.07, 0.3); // 0.20 bar rings
  tick(c, o, t(0.35), 0.09, 3300); // 0.35 right mallet hits
  ding(c, o, 1397, t(0.35), 0.07, 0.3); // 0.35 bar rings
  tick(c, o, t(0.5), 0.09, 3600); // 0.50 left mallet hits again
  ding(c, o, 1661, t(0.5), 0.07, 0.32); // 0.50 bar rings higher
  tick(c, o, t(0.65), 0.1, 3900); // 0.65 right mallet hits last
  ding(c, o, 1976, t(0.65), 0.075, 0.4); // 0.65 top bar rings longest
}
