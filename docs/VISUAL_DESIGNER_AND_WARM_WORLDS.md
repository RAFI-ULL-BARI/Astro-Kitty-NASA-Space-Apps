# Visual designer and warm worlds — 15 November 2026

The visual base designer from the supplied Matching Buildings ZIP is now part of this edition. It includes illustrated building cards, a 5 × 4 map, tap and drag placement (including moving placed buildings), useful-neighbour highlights, layout checks, Dhrubo guidance and a downloadable 1280 × 720 PNG based on the exact layout. The map, Mars surface and exported picture share the same building artwork. All six placed modules now appear on the surface; the water tank and garage are background scenery.

Each Academy room has its own lighting and interface palette: teal pool, terracotta rover yard, leafy greenhouse, blue Earth / orange Mars gravity chamber, and copper life-support lab. The campus uses warm dawn light. The departure cockpit and launch have warmer materials, heat/power crew challenges use amber panels, and the Mars ground is sand and ochre. Characters keep their established colours.

Flight progress on the home screen now depends on earning the Trip Planner patch, rather than merely entering astronaut training. Low-power practice launches use one continuous height curve for ascent and return, without applying the fall easing twice. The existing route around rocks to the airlock was checked and remains reachable.

## Verification

- `npm test`: 255 passed, zero failures. Includes all 180 flight plans, workshop highlights, exact layout in the picture brief, smooth bounded launch height, six visible base modules, and return-to-airlock traversal.
- Browser: departure → four-step launch plan → complete launch/cruise/landing animation at accelerated speed → Trip Planner → all three crew challenges (shield, dish, battery) → arrival → destination choice → Mars base setup → designer.
- Designer: selected and moved the water tank by tapping; dragged an already-placed tank to another tile; restored a useful placement; opened the generated picture and closed it back to the workshop.
- Phone designer: 390 × 844 CSS viewport, zero horizontal overflow; map tiles approximately 62 × 46 px; launch button visible. Desktop and phone screenshots included in docs/screenshots.
- Visually checked the warm rover lab and contrasting teal float lab. No browser console errors were recorded in the checked tabs.

This pass did not measure physical-device frame rates or audibly assess every voice on every browser. Build and local preview are verified; no production deployment was performed.

## Run / deploy

Run `python3 -m http.server 8000 --directory dist` from the repository root and open `http://localhost:8000`. The included dist is ready to preview. For source changes: `npm ci`, `npm run build`, then `npm test`. See [Vercel deployment](VERCEL_DEPLOYMENT.md) for hosting. Python is only a local preview server.

The base picture works locally with no API key. The optional reference CLI under scripts/generate-base-picture.mjs is separate and is never invoked by the browser or the Vercel build.
