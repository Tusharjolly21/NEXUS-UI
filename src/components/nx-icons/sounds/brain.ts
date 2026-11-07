import { ding, blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.81;

/** A chain of seven tiny electric blips that follow the light running along the brain folds, soft low pulses as the brain swells, then a crackling zap as the spark rays appear and a bright glassy ring as they peak. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // the light runs along the folds in a chain: starts 0.13, hops 0.36 and 0.54, ends 0.615
  [[0.13, 1245], [0.263, 1480], [0.364, 1175], [0.427, 1760], [0.484, 1397], [0.545, 2093], [0.615, 1661]].forEach(([at, f]) => {
    blip(c, o, f, t(at), 0.05, 0.05, f * 1.25);
    tick(c, o, t(at), 0.04, 6000);
  });
  thud(c, o, t(0.215), 130, 0.08, 0.1); // 0.225 the brain swells
  thud(c, o, t(0.665), 150, 0.06, 0.08); // 0.675 it swells again
  tick(c, o, t(0.52), 0.14, 7200); // 0.52 the spark rays appear
  blip(c, o, 3000, t(0.52), 0.05, 0.08, 1500, "sawtooth");
  ding(c, o, 3520, t(0.68), 0.04, 0.4); // 0.69 the rays are at full size
}
