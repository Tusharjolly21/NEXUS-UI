import { ding, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.35;

/** Two thin air zips as the bars fly out of the box, then a bright metallic clink with a dull knock as they drop back and lock into the B. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.27), 1700, 4800, 0.04); // 0.00-0.27 the bars shoot out of the top and bottom edges
  swish(c, o, t(0.36), t(0.23), 4400, 2100, 0.035); // 0.36-0.59 the bars fall back in
  ding(c, o, 1985, t(0.594), 0.08, 0.3); // 0.59 the bars lock onto the B, coin metal ringing
  thud(c, o, t(0.6), 146, 0.1, 0.08); // 0.60 the B squashes under the impact
  ding(c, o, 2970, t(0.774), 0.025, 0.14); // 0.77 the B rebounds with a faint shimmer
}
