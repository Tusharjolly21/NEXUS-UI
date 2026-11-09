import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.83;

/** A slow diesel chug in three beats (0.10, 0.28, 0.46), each a low thump with a woolly puff of exhaust as the smoke leaves the pipe and the tractor bumps forward, then a low rumble that sinks away as it rolls back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.10 first chug: exhaust puff leaves the pipe, the body bumps up and forward
  thud(c, o, t(0.1), 64, 0.17, 0.16);
  puff(c, o, t(0.1), 0.16, 650, 0.06, "lowpass");
  // 0.28 second chug
  thud(c, o, t(0.28), 60, 0.17, 0.16);
  puff(c, o, t(0.28), 0.16, 600, 0.055, "lowpass");
  // 0.46 third chug, the biggest forward move
  thud(c, o, t(0.46), 56, 0.17, 0.18);
  puff(c, o, t(0.46), 0.18, 550, 0.05, "lowpass");
  // 0.50-0.95 the tractor rolls back to its place, a low rumble fading away
  blip(c, o, 74, t(0.52), 0.07, 0.45, 48, "sawtooth");
}
