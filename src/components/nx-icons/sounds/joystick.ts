import { plink, blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A gritty click and low blip as the stick throws left, another as it throws right, and two bright button plinks, one high and one higher. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.08), 0.12, 2400);
  blip(c, o, 210, t(0.09), 0.08, 0.1, 160, "square");
  tick(c, o, t(0.42), 0.12, 2400);
  blip(c, o, 190, t(0.43), 0.08, 0.1, 240, "square");
  plink(c, o, N.G6, t(0.27), 0.08, 0.12);
  plink(c, o, N.B6, t(0.55), 0.08, 0.14);
  tick(c, o, t(0.8), 0.06, 3000);
}
