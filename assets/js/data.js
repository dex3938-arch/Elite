/* Content for the zoom-in detail views and the gallery lightbox.
   Keys match the data-detail attribute in index.html. Edit freely.

   features: [title, text, x, y, to]
   x and y (0–1) mark where that feature sits on the photo, measured from the
   left and top edges. Features with x/y become points you can zoom to.
   `to` (optional) is the key of another place: zooming deep into that point
   opens that place's own photo.                                            */
(function () {
  'use strict';
  // photo path (the single-file preview build swaps in embedded copies)
  var img = function (name) {
    return (window.ELITE_IMG && window.ELITE_IMG[name]) || 'assets/img/' + name + '.jpg';
  };

  window.ELITE_DETAILS = {
    /* ── Amenities (explorable photos) ── */
    villas: {
      name: 'The Water Villas', kicker: '01 / VILLAS', title: 'The Water<br><em>Villas</em>',
      text: 'Suites and villas that open straight onto the sea. Tap a point on the photo to step closer.',
      image: img('villa'), alt: 'Ocean-view suites and infinity pool at sunset',
      features: [
        ['Ocean-view suites', 'Three levels of suites, each with a full-width balcony facing the bay. Keep zooming to step inside one.', 0.50, 0.47, 'suite'],
        ['The infinity pool', 'The pool edge disappears into the sea. Swim out and the headland is all you see.', 0.17, 0.74],
        ['The sun terrace', 'Cushioned loungers, shade on request, and hosts who remember your order.', 0.80, 0.71],
        ['Lava-stone deck', 'Hand-laid stone that stays cool underfoot through the afternoon.', 0.50, 0.86],
        ['The golden hour', 'Twenty minutes each evening when the whole sky turns. We keep the terrace clear for it.', 0.44, 0.17]
      ],
      specs: [['240', 'm² living'], ['12 m', 'private pool'], ['2–4', 'guests']]
    },
    table: {
      name: 'The restaurant', kicker: '02 / TABLE', title: 'At the<br><em>edge of taste.</em>',
      text: 'No fixed menus, no set hours. Our chefs cook from the morning catch and the island garden.',
      image: img('table'), alt: 'Candle-lit restaurant and bar',
      features: [
        ['The bar', 'Hand-blown glassware, island botanicals, and the door through to the cellar.', 0.49, 0.60, 'cellar'],
        ['Hand-woven shades', 'Lamps woven on the neighbouring atoll, hung low so every table has its own light.', 0.46, 0.37],
        ['Open to the garden', 'No walls on the forest side. Dinner comes with the sound of the trees.', 0.87, 0.40],
        ['Your table', 'Set once, for you, for the whole evening. Nobody is waiting for it.', 0.87, 0.66],
        ['Timber and palms', 'Reclaimed teak walls, lit from below, with palms growing through the floor.', 0.19, 0.53]
      ],
      specs: [['3', 'restaurants'], ['400', 'wine labels'], ['24 h', 'in-villa dining']]
    },
    bespoke: {
      name: 'The island', kicker: '03 / THE ISLAND', title: 'Your island.<br><em>Your rules.</em>',
      text: 'The whole resort from above. Zoom into the villas, the pavilion or the island and you step inside each one.',
      image: img('lagoon'), alt: 'Water villas and private island from above',
      features: [
        ['The castaway island', 'An uninhabited island of your own for the day. Picnic set, then everyone leaves.', 0.22, 0.26],
        ['The water villas', 'An arc of villas, each with steps straight down into the lagoon. Zoom in to step inside a suite.', 0.40, 0.37, 'suite'],
        ['The overwater pavilion', 'Sunset tables on the deck. Zoom in to step inside the restaurant.', 0.53, 0.55, 'table'],
        ['The main island', 'Beach villas, gardens and the seaplane jetty. Zoom in to walk into a villa garden.', 0.80, 0.28, 'garden'],
        ['The house reef', 'Guided dives and night snorkels over coral that starts beneath the pavilion.', 0.80, 0.84]
      ],
      specs: [['24 m', 'private yacht'], ['1:2', 'dive guide ratio'], ['∞', 'itineraries']]
    },
    restore: {
      name: 'The pavilion', kicker: '04 / RESTORE', title: 'Slow down<br><em>to feel more.</em>',
      text: 'An open-air pavilion built around a hundred-year-old tree. Long evenings, low light, nowhere to be.',
      image: img('pavilion'), alt: 'Open-air pavilion with woven lamps',
      features: [
        ['Woven lamps', 'Rattan shades made by hand, one for every table.', 0.43, 0.16],
        ['The old tree', 'The pavilion was built around it. Nothing was cut down to make room.', 0.28, 0.36],
        ['The table', 'Linen, lantern light, and a menu that changes with the tide.', 0.50, 0.77],
        ['Rattan chairs', 'Deep, hand-woven seats designed for staying another hour.', 0.84, 0.80],
        ['The night garden', 'Frangipani and palms on every side, lit softly after dark.', 0.91, 0.50]
      ],
      specs: [['Open', 'air pavilion'], ['100', 'year-old tree'], ['Late', 'every night']]
    },

    cellar: {
      name: 'The cellar', kicker: '05 / THE CELLAR', title: 'Four hundred<br><em>labels.</em>',
      text: 'A dining room wrapped around the wine wall, with a sommelier who would rather pour than explain.',
      image: img('cellar'), alt: 'Cellar restaurant',
      features: [
        ['The wine wall', 'Four hundred labels kept at 13°C, opened by the glass on request.', 0.10, 0.33],
        ['Murano lamps', 'Hand-blown rose glass, made for this room.', 0.15, 0.11],
        ['Tables for two', 'Linen runners, weighted glasses and nobody at your elbow.', 0.17, 0.56],
        ['The terrace doors', 'Open on to the pool. Zoom in to step outside.', 0.85, 0.44, 'nightpool'],
        ['Travertine floor', 'Honed stone that glows under the lamps.', 0.83, 0.84]
      ],
      specs: [['400', 'labels'], ['13°C', 'cellar'], ['36', 'seats']]
    },
    garden: {
      name: 'The villa garden', kicker: '06 / THE GARDEN', title: 'Your pool,<br><em>door to shore.</em>',
      text: 'A stone-lined pool runs from your bedroom doors to the lawn, with the beach just beyond the palms.',
      image: img('garden-pool'), alt: 'Villa garden and private pool',
      features: [
        ['The private pool', 'Twelve metres of green stone, yours alone.', 0.42, 0.80],
        ['Shaded daybeds', 'Two loungers under a canvas parasol, towels rolled and waiting.', 0.18, 0.66],
        ['The lawn', 'Kept short and soft enough to cross barefoot.', 0.57, 0.56],
        ['The beach', 'Thatch pavilions on the sand, two minutes’ walk.', 0.40, 0.52],
        ['The bedroom doors', 'Straight from bed to water. Zoom in to step inside.', 0.93, 0.52, 'suite']
      ],
      specs: [['12 m', 'private pool'], ['2 min', 'to the beach'], ['0', 'neighbours']]
    },

    /* ── Places you reach by zooming in (not in the circle) ── */
    suite: {
      name: 'The suite', kicker: 'INSIDE / THE SUITE', title: 'Sleep facing<br><em>the sunrise.</em>',
      text: 'Teak floors, a hand-built bed and doors that fold back to the garden.',
      image: img('bedroom'), alt: 'Villa bedroom in morning light',
      features: [
        ['The bed', 'Hand-built, king-size, dressed in 600-thread cotton.', 0.25, 0.42],
        ['The garden doors', 'Morning light through five glass doors. Zoom in to step out to the pool.', 0.76, 0.38, 'garden'],
        ['The daybed', 'Slatted teak at the foot of the bed, warm from the sun by eight.', 0.63, 0.78],
        ['The en-suite', 'Through to the stone bath. Zoom in to step inside.', 0.05, 0.47, 'bath']
      ],
      specs: [['78', 'm² suite'], ['King', 'bed'], ['East', 'facing']]
    },
    bath: {
      name: 'The bath', kicker: 'INSIDE / THE BATH', title: 'Stone, steam<br><em>and open sky.</em>',
      text: 'A single carved tub under an open roof, with rough-plastered walls and river pebbles underfoot.',
      image: img('bath'), alt: 'Stone bath',
      features: [
        ['The stone tub', 'Carved from one block and drawn for you while you are at dinner.', 0.35, 0.80],
        ['The palm', 'It grows towards the open roof. So does the steam.', 0.28, 0.40],
        ['Island botanicals', 'Oils and soaps blended on the island, refilled daily.', 0.565, 0.61],
        ['River pebbles', 'Smooth stones that drain the floor and warm in the sun.', 0.77, 0.93]
      ],
      specs: [['Open', 'to the sky'], ['1', 'carved tub'], ['Daily', 'botanicals']]
    },
    nightpool: {
      name: 'The pool at night', kicker: 'OUTSIDE / THE POOL', title: 'Lit water,<br><em>warm air.</em>',
      text: 'The pool stays lit until late, with the restaurant still serving beside it.',
      image: img('night-pool'), alt: 'Pool and restaurant at night',
      features: [
        ['The poolside restaurant', 'Open on three sides. Zoom in to go back inside.', 0.19, 0.40, 'cellar'],
        ['The loungers', 'Canvas parasols and cushioned beds along the water.', 0.75, 0.49],
        ['The pool', 'Mosaic tile, lit from below, 29°C all night.', 0.40, 0.82],
        ['The night sky', 'No other light for hundreds of kilometres.', 0.78, 0.14]
      ],
      specs: [['29°C', 'water'], ['Late', 'bar service'], ['50 m', 'pool']]
    },

    /* ── Activities ── */
    act1: {
      kicker: '06:00 / SUNRISE DECK', title: 'Sunrise<br><em>deck.</em>',
      text: 'The eastern deck is kept empty at dawn for one class of no more than six.',
      image: img('dawn'), alt: 'Dawn over the sea',
      features: [['Practice', 'Vinyasa, yin or guided breathwork with a resident teacher.'], ['After', 'Cold-pressed juice and fruit from the island garden.']],
      specs: [['60', 'minutes'], ['6', 'guests max'], ['Daily', 'at dawn']]
    },
    act2: {
      kicker: '09:30 / THE HOUSE REEF', title: 'The house<br><em>reef.</em>',
      text: 'A protected reef rings the island. Turtles, rays and reef sharks are neighbours, not excursions.',
      image: img('reef'), alt: 'Lagoon and water villas from above',
      features: [['Snorkel', 'Step off your own deck; guides and gear on request.'], ['Dive', 'Twelve sites within fifteen minutes by boat.']],
      specs: [['30 m', 'from your villa'], ['12', 'dive sites'], ['28°C', 'water']]
    },
    act3: {
      kicker: '13:00 / THE LONG LUNCH', title: 'The long<br><em>lunch.</em>',
      text: 'A slow table beside the cellar, with the sommelier choosing as you go.',
      image: img('cellar'), alt: 'Cellar restaurant',
      features: [['Menu', 'Grilled reef fish, island salads, something cold from the cellar.'], ['The cellar', 'Four hundred labels, opened by the glass on request.']],
      specs: [['400', 'labels'], ['3 h', 'unhurried'], ['Daily', 'from noon']]
    },
    act4: {
      kicker: '15:30 / POOL HOURS', title: 'Pool<br><em>hours.</em>',
      text: 'The lagoon pool sits between the palms and the pavilions. Hosts bring cold towels, sorbet and whatever you are reading.',
      image: img('pool'), alt: 'Lagoon pool and pavilions',
      features: [['Cabanas', 'Eight shaded cabanas, never double-booked.'], ['For children', 'A shallow pool and kids’ island club nearby.']],
      specs: [['50 m', 'lagoon pool'], ['8', 'cabanas'], ['All day', 'service']]
    },
    act5: {
      kicker: '18:00 / GOLDEN HOUR', title: 'Golden<br><em>hour.</em>',
      text: 'Sundowners on the terrace as the headland turns pink and the pool goes still.',
      image: img('golden-hour'), alt: 'Sunset over the headland',
      features: [['On the terrace', 'Champagne, canapés and the best seat on the island.'], ['On the water', 'Or take the sunset out to sea on a private sail.']],
      specs: [['20', 'minutes of colour'], ['West', 'facing terrace'], ['Daily', 'at dusk']]
    },
    act6: {
      kicker: '22:00 / NIGHT SWIM', title: 'Night<br><em>swim.</em>',
      text: 'The pools stay lit and warm until late, with the restaurant still serving beside the water.',
      image: img('night-pool'), alt: 'Pool and restaurant at night',
      features: [['Stargazing', 'A resident astronomer and telescope on the north beach.'], ['Late table', 'The pool bar serves until the last guest leaves.']],
      specs: [['29°C', 'pool'], ['Late', 'bar service'], ['0', 'light pollution']]
    },

    /* ── Gallery (lightbox mode) ── */
    g1: { gallery: true, kicker: '01 — BEYOND THE REEF', title: 'Beyond<br><em>the reef.</em>', text: 'The whole resort from the seaplane: an arc of villas, a pavilion on the water, and an island of your own.', image: img('lagoon'), alt: 'Water villas from above' },
    g2: { gallery: true, kicker: '02 — THE GARDEN POOL', title: 'The garden<br><em>pool.</em>', text: 'Step out of the bedroom and into the water. The lawn runs down to the beach.', image: img('garden-pool'), alt: 'Villa garden and private pool' },
    g3: { gallery: true, kicker: '03 — AFTER DARK', title: 'After<br><em>dark.</em>', text: 'Low light, warm timber, and a table that is yours for the evening.', image: img('table'), alt: 'Restaurant after dark' },
    g4: { gallery: true, kicker: '04 — THE MORNING ROOM', title: 'The morning<br><em>room.</em>', text: 'Curtains tied back, the floor already warm, coffee on its way.', image: img('bedroom'), alt: 'Villa bedroom in morning light' },
    g5: { gallery: true, kicker: '05 — THE CELLAR', title: 'The<br><em>cellar.</em>', text: 'Four hundred labels and a sommelier who would rather pour than explain.', image: img('cellar'), alt: 'Cellar restaurant' },
    g6: { gallery: true, kicker: '06 — STONE AND STEAM', title: 'Stone<br><em>and steam.</em>', text: 'A single carved tub, drawn for you while you are at dinner.', image: img('bath'), alt: 'Stone bath' }
  };
})();
