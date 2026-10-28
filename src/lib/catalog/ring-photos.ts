import type { RingItem } from "@/components/ring-gallery";

/**
 * The sample photos the Ring Gallery previews, the gallery tile and the Play with it stage show. They
 * live in public/ring-photos and are not part of the installed component: the component draws a soft
 * gradient plate for any card without a photo, so it works the moment you copy it.
 */
export const RING_PHOTOS: RingItem[] = [
  {
    "src": "/ring-photos/bays-at-dusk.webp",
    "title": "Bays at Dusk",
    "date": "Oct 24, 2026",
    "summary": "Warm light drains out of a ridge of bare hills as three pale bays turn glassy below.",
    "sections": [
      {
        "heading": "In the frame",
        "text": "Shot from the high point just before the light went. The dry grass takes the last of the orange while the water holds the cooler sky.",
        "bullets": [
          "Long lens to stack the ridges",
          "Golden hour, 10 minutes of usable light",
          "Graded toward warm shadows"
        ]
      }
    ],
    "tone": 0
  },
  {
    "src": "/ring-photos/glacier-in-cloud.webp",
    "title": "Glacier in Cloud",
    "date": "Oct 19, 2026",
    "summary": "A tongue of blue ice wedged between black rock walls, with cloud pouring in from above.",
    "tone": 1
  },
  {
    "src": "/ring-photos/shoreline-from-above.webp",
    "title": "Shoreline from Above",
    "date": "Oct 11, 2026",
    "summary": "Green water meets wet sand in a line of curling foam, straight down from the air.",
    "sections": [
      {
        "heading": "Notes",
        "text": "Shot at the turn of the tide so the sand still carried the pattern of the last wave. A faster shutter kept the foam crisp."
      }
    ],
    "tone": 2
  },
  {
    "src": "/ring-photos/green-wheat.webp",
    "title": "Green Wheat",
    "date": "Oct 03, 2026",
    "summary": "One awned ear in a field of young wheat, the rest of the crop softened into green.",
    "tone": 3
  },
  {
    "src": "/ring-photos/hut-by-the-lake.webp",
    "title": "Hut by the Lake",
    "date": "Sep 27, 2026",
    "summary": "Reeds in the foreground, a small timber hut across the water and a ridge dissolving into cloud.",
    "sections": [
      {
        "heading": "Behind the frame",
        "text": "Autumn haze did the compositing. The reeds are deliberately out of focus so the eye travels over them to the hut."
      }
    ],
    "tone": 4
  },
  {
    "src": "/ring-photos/camp-under-meteors.webp",
    "title": "Camp Under Meteors",
    "date": "Sep 18, 2026",
    "summary": "A single lit tent below a rock crest, with two meteor trails crossing the stars.",
    "tone": 5
  },
  {
    "src": "/ring-photos/night-peak.webp",
    "title": "Night Peak",
    "date": "Sep 09, 2026",
    "summary": "A snow ridge glowing blue against a sky of stars, with the valley in full darkness.",
    "tone": 6
  },
  {
    "src": "/ring-photos/gas-giant.webp",
    "title": "Gas Giant",
    "date": "Aug 30, 2026",
    "summary": "A banded planet half in shadow, with two small moons and a red nebula behind it. A digital render.",
    "sections": [
      {
        "heading": "About this one",
        "text": "The only image in the set that was never photographed. It is here for its colour, which sits between the dusk and the dark-sky frames."
      }
    ],
    "tone": 7
  },
  {
    "src": "/ring-photos/ember-sky.webp",
    "title": "Ember Sky",
    "date": "Aug 21, 2026",
    "summary": "A storm cloud lit orange from underneath, burning over a row of granite spires.",
    "tone": 8
  },
  {
    "src": "/ring-photos/ridge-in-fog.webp",
    "title": "Ridge in Fog",
    "date": "Aug 12, 2026",
    "summary": "A line of snowy larches rising out of a white-out, in black and white.",
    "tone": 9
  },
  {
    "src": "/ring-photos/milky-way-desert.webp",
    "title": "Milky Way over Rock",
    "date": "Aug 04, 2026",
    "summary": "The galactic core above a skyline of eroded pinnacles, with a green airglow band on the horizon.",
    "sections": [
      {
        "heading": "Settings",
        "bullets": [
          "20 second exposure",
          "Wide open at f/2",
          "Single frame, no stacking"
        ]
      }
    ],
    "tone": 10
  },
  {
    "src": "/ring-photos/storm-light.webp",
    "title": "Storm Light",
    "date": "Jul 26, 2026",
    "summary": "Lightning forking through an orange evening sky above a jagged range and a black treeline.",
    "tone": 11
  },
  {
    "src": "/ring-photos/horses-and-peaks.webp",
    "title": "Horses and Peaks",
    "date": "Jul 17, 2026",
    "summary": "Five horses on a golden plain, with a wall of snow peaks standing in cloud behind them.",
    "tone": 12
  },
  {
    "src": "/ring-photos/cupola.webp",
    "title": "Cupola",
    "date": "Jul 08, 2026",
    "summary": "Seven windows of Earth seen through the round observation module of a space station.",
    "tone": 13
  },
  {
    "src": "/ring-photos/orbit.webp",
    "title": "Orbit",
    "date": "Jun 29, 2026",
    "summary": "The curve of the planet under a thin blue edge of atmosphere, with a robotic arm in the corner.",
    "tone": 14
  },
  {
    "src": "/ring-photos/granite-in-cloud.webp",
    "title": "Granite in Cloud",
    "date": "Jun 11, 2026",
    "summary": "Two snow-dusted towers surfacing from a flat grey sky.",
    "tone": 15
  },
  {
    "src": "/ring-photos/larch-window.webp",
    "title": "Larch Window",
    "date": "Jun 02, 2026",
    "summary": "Autumn larches and a wind-blown ridge, framed by two dark trunks.",
    "tone": 16
  },
  {
    "src": "/ring-photos/violet-galaxy.webp",
    "title": "Violet Galaxy",
    "date": "May 24, 2026",
    "summary": "The Milky Way running diagonally through a purple, star-dense sky.",
    "tone": 17
  },
  {
    "src": "/ring-photos/cobalt-flow.webp",
    "title": "Cobalt Flow",
    "date": "May 15, 2026",
    "summary": "Poured pigment folding into itself in blues from black to electric, with a fine glitter in the folds.",
    "tone": 18
  }
];
