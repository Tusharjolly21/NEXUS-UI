Make a 10-second vertical (1080×1920, 30fps) "what's new this month" video for my component library, clean Apple style on light #f5f5f7 with soft colour light. Inter Display. Music 120 BPM; the month flip, the counter and each release land on the beat.

0–0.6s: Small grey kicker "What's new in Nexus UI". Under it a split-flap board shows "September": each letter tile is a rounded white card split by a hairline.
0.6–1.4s: The board flips to "October": every tile's top half folds down (rotateX, with a darker shade as it turns) letter by letter, left to right, 40ms apart, the new letters revealed underneath, like an airport departures board.
1.2–2.0s: "121 new components" counts up beneath it, then the header group slides up to the top.
2.0–7.0s: A vertical timeline on the left. A thin beam of light (blue→purple→pink) draws downward with a bright glowing head. Each time the head reaches a node (every beat-bar) the node pops and a white card slides in from the right: on the left of the card a tiny live demo of the release looping on its own, on the right the name, a grey one-liner and a Pro/Free tag.
Demos: Slide to Confirm (a knob slides along a pill, the track fills, label turns into a check), Cursor Buddy (a cursor wanders, a second cursor with a name tag follows on a soft spring), Toast Stack (toasts drop in and stack with depth, then fan out), Dynamic Island (a black pill grows into a timer, then back).
7.0–7.6s: A "+117 more" chip pops at the end of the beam.
7.75–10s: Everything lifts away; end card "121 new this month." with the number in the gradient, "nexus-ui.com" in grey and a white pill "Pro gets every release".

React component, pure function of time t; the months, count and four releases are props.
