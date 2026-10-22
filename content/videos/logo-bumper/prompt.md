Make a 5-second logo sting (intro/outro bumper) for my brand Nexus UI that renders in 16:9 (YouTube), 1:1 (X) and 9:16 (Shorts) from the same component, laying itself out for each. Clean Apple style: light #f5f5f7 background, Inter Display, 120 BPM sound with a hit on each beat of the build.

The logo is a dark rounded tile with three cream spokes running from a blue centre node to three end nodes (top, bottom-left, bottom-right). Build it from scratch in SVG and animate its construction:
0–0.4s: the blue centre node lands with a spring (slight overshoot).
0.35–1.1s: the three spokes draw outward from the centre (stroke length 0 → 1, staggered 80ms), each end node popping in with a spring the moment its spoke arrives. While the tile isn't there yet, the spokes are dark on the light background.
1.1–1.6s: the tile grows from a circle behind the spokes into a rounded square (scale and corner radius morph together); as it fills in, the spokes crossfade to cream.
1.6–2.4s: lock-up. In landscape and square the mark slides left and the name slides out from behind it to the right through a mask; in portrait the mark rises and the name rises in underneath. A soft white light sweeps across the name once.
2.6–3.3s: a grey tagline fades up under the name. A ring ripples out of the centre node on the beat.
4.5–5s: the whole lock-up shrinks a little and blurs away so it can cut straight into the video.

React component, pure function of time t, taking the frame width and height as props; colours, name and tagline are props.
