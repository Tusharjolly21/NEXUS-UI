Make a 10-second vertical (1080×1920, 30fps) travel route video for my app Routecast, in a calm Apple Maps style. Music 100 BPM, lo-fi and warm; each stop lands on a beat.

The map is drawn in code (one big SVG, about 3000×3000): pale blue sea (#cfe3f5), warm off-white land (#f4f1ea) as a long island band with a wobbly, organic coastline, a few soft green parks, thin white roads and small grey city blocks clustered around each stop. Italic blue sea labels. Before it starts, the full route shows as a faint grey dashed line.

0–1.2s: The map sits zoomed out and softly blurred behind a big title "Tokyo to Osaka." which rises in and then dissolves as the camera dives in to the first stop (zoom 0.55 → 1.1, blur clears).
1.2–7.2s: The route draws itself as a thick line with a blue→purple gradient and a soft glow underneath. A small white "train" capsule with a coloured stripe rides the head of the line and turns with the road. The camera follows the head with a slight lag and look-ahead, never cutting. The trip has three legs with eased acceleration and a short pause at each stop. At every stop a pin springs up with the place name, and a white card pops beside it with the day and a note ("Day 2 · Lake Ashi"). A frosted bar at the bottom shows a rolling distance counter (0 → 515 km) and a day chip that flips Day 1 → Day 4.
7.2–8.4s: The camera pulls back to show the whole route with every pin.
8.4–10s: A white veil fades over the map; end card "Your trip, as a video." with "Routecast" and a dark pill "Link in bio".

React component, pure function of time t. Stops, notes, distance and route colour are props; the route is a smooth curve sampled into points so the line length and the train's position and angle come from the same data.
