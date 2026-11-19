import { thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.6;

/** A papery husk rustle as the cob hops, a soft knock on landing and two dry rustles as it twists from side to side. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.2, 3800, 0.03); // 0.00-0.22 the husk rustles as the corn rises
  thud(c, o, t(0.43), 160, 0.12, 0.1); // 0.43 the cob lands
  puff(c, o, t(0.43), 0.07, 3200, 0.05); // 0.43 the husk crackles on impact
  puff(c, o, t(0.58), 0.06, 4400, 0.03); // 0.58 the cob twists one way
  puff(c, o, t(0.72), 0.05, 3600, 0.02); // 0.72 and back
}
