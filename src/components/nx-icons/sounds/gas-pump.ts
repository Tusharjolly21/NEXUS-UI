import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.85;

/** A metal nozzle clunk as the hose starts to move, a run of mechanical counter ticks that follows the display filling, rubbery hose slaps at each twitch, fuel rushing through, and a shut-off clunk when the display is full. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.03), 0.1, 1800); // 0.03 nozzle knocks as the hose starts to move
  thud(c, o, t(0.03), 170, 0.2, 0.08); // 0.03 nozzle clunk
  swish(c, o, t(0.06), t(0.7), 200, 520, 0.02); // 0.06-0.76 fuel runs through the hose
  for (let i = 0; i < 19; i++) tick(c, o, t(0.04 + i * 0.04), i % 5 === 4 ? 0.12 : 0.07, 2400 + i * 60); // 0.04-0.76 the display counts up as its bar fills (every 5th tick is a tens digit)
  puff(c, o, t(0.08), 0.06, 900, 0.07, "bandpass"); // 0.08 hose twitches, first swing
  puff(c, o, t(0.24), 0.06, 800, 0.06, "bandpass"); // 0.24 hose swings the other way
  puff(c, o, t(0.4), 0.06, 800, 0.05, "bandpass"); // 0.40 hose swing
  puff(c, o, t(0.56), 0.05, 750, 0.04, "bandpass"); // 0.56 hose swing, smaller
  puff(c, o, t(0.72), 0.05, 700, 0.03, "bandpass"); // 0.72 hose settles
  tick(c, o, t(0.8), 0.1, 1500); // 0.80 display full: the nozzle shuts off
  thud(c, o, t(0.8), 140, 0.16, 0.08); // 0.80 shut-off clunk
}
