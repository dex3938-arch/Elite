# Elite — Resort & Residences (landing page)

A responsive, single-page landing site for a luxury resort brand.
Plain HTML, CSS and JavaScript on Bootstrap 5. No build step.

## Run it
- **Quickest:** double-click `index.html` (opens in your browser).
- **Local server (optional):** `npx serve .` then open the address it prints.

All photos are inside the project (`assets/img/`), so the page works without loading images from other sites. Only the fonts come from Google Fonts.

## Deploy to Vercel
- `npx vercel` in this folder, **or** push to GitHub and import the repo at vercel.com/new.
- Framework preset: **Other**. No build command, output directory: `.` (the project root).

## Sections
| # | Section | Notes |
|---|---------|-------|
| 01 | Hero / banner | Preloader, line-by-line headline, zoom on scroll |
| 02 | About | Curtain image reveal, animated counters |
| 03 | The Water Villa | Scroll to zoom through four rooms |
| 04 | The villa in 3D | Three.js model: drag to rotate, scroll to lift the levels apart, dusk lighting |
| 05 | Amenities | Six places on a slowly turning circle (drag to spin). Click one to open its photo, then zoom live: mouse wheel or two-finger pinch, drag to move, double-click/tap. Zooming deep into a ringed point steps inside that place (island → restaurant → cellar…); zooming back out returns |
| 06 | Activities | Sideways "day" timeline (pinned on desktop, swipe on touch) |
| –  | Call to action | Elite Residences (villa ownership) |
| 07 | Gallery | Six images with a zooming lightbox (arrows / keyboard) |
| 08 | Enquiry form | Bootstrap validation, date checks, confirmation state |
| –  | Closing call to action, footer | |

## Files
```
index.html               page markup and all text
assets/css/style.css     theme (colours and fonts are variables at the top)
assets/js/main.js        animations, menu, lightbox, form
assets/js/villa3d.js     the 3D villa (built in code, no model file)
assets/js/data.js        text + images for the detail views and lightbox
assets/img/              photos
assets/vendor/           Bootstrap 5.3, GSAP + ScrollTrigger, Lenis, Three.js
```

## Responsive
- Desktop ≥ 992px, tablet 768–991px, phone < 768px (Bootstrap breakpoints).
- Motion is reduced automatically for visitors who ask for reduced motion.

## Before going live
- Swap the photos in `assets/img/` for your own (keep the file names, or update `index.html` and `assets/js/data.js`). The current ones are stock photos from Unsplash.
- Zoom points: in `assets/js/data.js` each feature ends with `x, y` (0–1 from the left/top of the photo) and, optionally, the key of the place it leads into. Change them if you change a photo.
- Replace sample text, figures and the `reservations@elite-resort.example` address.
- Connect the form: see the `TODO` in `assets/js/main.js` (section 10). Until then it only shows a confirmation on the page.
