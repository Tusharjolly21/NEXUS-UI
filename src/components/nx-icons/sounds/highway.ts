import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low engine hum that rises as the car speeds up, with a tyre rush that swells and fades as the dashes stream past. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 90, t(0.0), 0.08, 0.7, 200, "sawtooth"); // 0.00-0.80 engine revs as the road streams by
  swish(c, o, t(0.0), t(0.85), 250, 1200, 0.08); // 0.00-0.85 tyre rush, loudest mid-way
}
