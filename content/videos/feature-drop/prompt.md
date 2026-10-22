Make a 10-second vertical (1080×1920, 30fps) feature announcement video for my app MockFrame (a screenshot mockup studio), clean Apple style on a light #f5f5f7 background with soft drifting colour light. Inter Display for UI type, a serif (Lora / Instrument Serif) for the "brand" captions. Music at 120 BPM; the click, the repaint wave and every carousel spin land on beats.

0–1.6s: A white pill "New in MockFrame" springs in. Below it "Brand kits." in huge bold type rises out of a blur, then a grey line "Your brand on every screenshot."
1.6–2.2s: The headline group shrinks to 60% and glides to the top of the frame.
1.9–2.7s: Three app-store style screenshot cards (520×760, rounded 40px: a caption at the top, an app screenshot below with its own shadow) rise into a 3D carousel: a ring of 8 cards around the vertical axis, 45° apart, perspective 1800px, only the front three visible. They start neutral grey with black sans captions.
2.5–3.3s: A "Brand kit" panel slides up from the bottom: logo dot, brand name, three colour swatches, an "Aa Lora" font chip and a blue "Apply to all" button. A cursor glides in and clicks the button (button squashes, a ring ripples out).
3.45–4.6s: The three visible cards repaint one after another, left to right: the brand style is revealed by a circle that grows from the bottom of each card (clip-path), turning the background into the brand gradient and the caption into a cream italic serif. Odd cards use the light colour with a brand-coloured caption so the set feels designed, not repeated. The panel slides away.
4.6–7.4s: The headline swaps to "Every screenshot. One click." The ring turns 45° three times on the beat (eased in-out with a small settle), showing the rest of the screenshots already in the brand style. Cards fade with their angle so the back of the ring disappears.
7.4–8.2s: All cards fly to the centre into a tidy stack and shrink away.
8.0–10s: End card: "MockFrame" (bold, 120px), "mockframe.app" in grey, and a pill "New · Brand kits" whose dot uses the brand colour, each rising in.

Build it as a React component that is a pure function of time t with props for the app name, feature, sample brand name and the three brand colours, so changing a colour repaints the whole video.
