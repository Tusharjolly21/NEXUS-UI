import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A quick paper flick as the arrow lifts away, a falling rush as it drops diagonally into the tray, a cardboard thud on landing, a lower knock as the tray bumps, and a tick as it rebounds. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 900, 3000, 0.035); // 0.00-0.18 the arrow lifts away to the top right
  swish(c, o, t(0.24), t(0.27), 700, 3200, 0.05); // 0.24-0.51 the arrow drops towards the tray, faster and faster
  puff(c, o, t(0.51), 0.06, 2200, 0.05); // 0.51 the arrow lands on the paper tray
  thud(c, o, t(0.51), 170, 0.2, 0.12); // 0.51 the landing
  thud(c, o, t(0.595), 120, 0.12, 0.1); // 0.60 the tray is at its lowest in the bump
  tick(c, o, t(0.7225), 0.08, 2600); // 0.72 the tray rebounds up
  tick(c, o, t(0.84), 0.04, 2000); // 0.84 everything is at rest
}
