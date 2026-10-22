Make a 10-second launch-day video for Product Hunt, X and LinkedIn that renders in 16:9, 1:1 and 9:16 from one React component. Apple-clean light #f5f5f7, Inter Display, one warm accent (#ff6154). Music 120 BPM, bright; a pop on the upvote and a sparkle as the burst falls.

0–1.6s: "We're live on Product Hunt today." rises in word by word, then moves up to become the caption. (No third-party logos; the words do the work.)
1.6–3.4s: A listing card springs up: our app icon, name, tagline, three topic chips and a big outlined upvote button (triangle and an optional count) on the right; in portrait the button sits under the text.
3.4–4.4s: A cursor glides to the upvote and presses it: the button squashes, fills with the accent colour, the triangle shoots up and comes back, and the count (if given) rolls up by one like an odometer.
4.4–7s: The press releases a burst of ~40 tiny triangles that fly out and fall under real gravity with spin and air drag (deterministic, seeded), fading as they leave the frame.
5–8s: Under the card, a gallery strip of real product screenshots scrolls sideways like a filmstrip.
8–10s: Card and strip lift away; end card with the icon, "Search “Nexus UI” on Product Hunt" and a small "Link in bio".

Pure function of time t with frame size props; name, tagline, topics, optional upvote count and accent are props.
