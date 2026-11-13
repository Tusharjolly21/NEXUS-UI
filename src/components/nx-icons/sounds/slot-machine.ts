import { blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.13;

/** A casino slot machine: ratchet clicks as the lever is pulled down, a clunk at the bottom, a rapid rattle of reels, then three heavier clacks as the reels stop one after another, each a little higher. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.04), 0.07, 2400); // 0.04 lever ratchets down
  tick(c, o, t(0.09), 0.07, 2600); // 0.09 lever ratchets down
  tick(c, o, t(0.14), 0.07, 2800); // 0.14 lever ratchets down
  thud(c, o, t(0.2), 90, 0.14, 0.09); // 0.20 lever hits the bottom
  tick(c, o, t(0.2), 0.1, 1800); // 0.20 metal clunk
  for (let i = 0; i < 9; i++) tick(c, o, t(0.17 + 0.05 * i), 0.035, 3000 + 150 * i); // 0.17-0.57 reels rattle past
  blip(c, o, 180, t(0.3), 0.035, 0.2, 320, "triangle"); // 0.30-0.50 lever springs back up
  thud(c, o, t(0.65), 170, 0.12, 0.06); // 0.65 first reel stops
  tick(c, o, t(0.65), 0.09, 2600); // 0.65 first reel clack
  thud(c, o, t(0.77), 200, 0.12, 0.06); // 0.77 second reel stops
  tick(c, o, t(0.77), 0.09, 3000); // 0.77 second reel clack
  thud(c, o, t(0.89), 235, 0.14, 0.08); // 0.89 third reel stops
  tick(c, o, t(0.89), 0.1, 3400); // 0.89 third reel clack
}
