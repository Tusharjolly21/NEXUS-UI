Make an 8-second seamless looping background video for a landing page hero, in 16:9, 21:9 (ultrawide) and 9:16 (mobile) from one React component. Silent. Light #f5f5f7.

A 3D wall of real product screenshots: a big plane tilted back (rotateX ~52°) and turned (rotateZ ~-28°) under a 2000px perspective, made of 7 columns of rounded white cards with soft shadows. Alternate columns scroll in opposite directions at slightly different speeds. Every offset is (t / 8) × the column's loop length, so frame 0 and the final frame are identical and the loop has no seam. A soft diagonal light band sweeps across the wall once per loop, and the wall breathes a degree of rotation on a sine with the same 8s period.

Fade the wall into the page colour toward the text side (left in landscape, top in portrait) and at the edges, so a headline can sit on top. Show an optional headline in Inter Display ("Make your site move." with "move." in a blue→purple→pink→orange gradient) and a grey sub line; leave it empty to export a clean background.

Pure function of time t (loop period 8s) with frame width/height props; headline, gradient word, sub line and background colour are props.
