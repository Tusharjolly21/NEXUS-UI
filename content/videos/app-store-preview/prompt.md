Make a 16-second App Store preview (886×1920, also 1080×1920) for my expense-splitting app ClearSplit. Full-screen iOS UI with no device frame: status bar (9:41, signal, Wi-Fi, battery), SF-style type, white and #f2f2f7 grouped backgrounds, one green accent (#12b886). Indian rupees with en-IN formatting. Music 110 BPM, light; soft taps on every touch.

Use native iOS motion everywhere: pushes (new screen slides in from the right while the old one slides 30% left and dims), sheets (spring up from the bottom while the screen behind shrinks to 93%, rounds its corners and darkens), and a subtle grey touch dot wherever a finger taps. A frosted caption pill near the bottom changes with each scene.

0–2s "Every trip, every flat, every dinner.": Groups screen with a large title, a summary card where "You're owed ₹2,340" rolls in like an odometer, and three group rows with avatar stacks. Tap "Goa trip".
2–3.9s: push into the group: member avatars, a list of expenses, an "Add expense" button. Tap it.
3.9–7.7s "Add an expense in seconds.": the add sheet springs up. The amount is typed on a custom keypad (each key flashes as it's pressed) and grows as ₹3,600; the description types in; four avatars toggle into the split one by one with springs and "₹900 each" rolls in. Tap Save; the sheet drops.
7.7–10.6s "Always know who owes what.": the new expense slides into the top of the list with a highlight, and a balances section animates bar lengths and amounts per friend.
10.6–13.4s "Settle up in one tap.": tap Settle up; a sheet shows "Riya pays you ₹900"; tap "Mark as paid", the row turns into a green check and "You're all square with Riya" appears.
13.4–16s: the app icon springs in with "ClearSplit" and "Split bills with friends."

Pure function of time t with frame width/height props; group, amount, description, friend, accent and captions are props.
