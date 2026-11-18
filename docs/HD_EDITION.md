# Astro Kitty — HD Discovery edition

## Presentation

The current edition keeps the established humanoid kitty and silver Dhrubo robot. Shared character drawing now includes shaded materials, gentle head movement and task poses. The Academy has a skylit atrium, a detailed campus exterior, warmer sand, laboratory cabinets, contact shadows, glass reflections and a sunlit greenhouse with curved, veined plant illustrations. Earth and Mars chamber backdrops remain distinct. Main adventure and outpost characters inherit the shared rendering improvements. Flight artwork uses a more detailed spacecraft, solar arrays, cockpit and the same campus exterior.

The artwork is drawn as scalable vector shapes. Canvas backing resolution follows the display up to 3× pixel density and a bounded pixel budget (about 4.2 million pixels per surface). This keeps lines sharp on high-density screens without allocating unlimited full-screen buffers. Actual frame rate depends on device and browser; this is not a guarantee of a particular resolution or frame rate on every device.

## Purposeful motion

- Rover: anticipation, eased starts/stops, shortest-angle turns, wheel movement and collected-flag feedback. Collision and route rules are unchanged.
- Greenhouse: supplies enter, water/nutrients visibly arrive, then leaves recover. Different species have distinct silhouettes, fruit and leaf veins. Resource sensors remain the basis for diagnosis.
- Air Makers: components visibly move into the rig; the fan and particles show operation. CO₂ particles stop at the filter while separate cabin-air dots pass through, avoiding the suggestion that CO₂ turns into oxygen.
- Float Lab: water caustics, glass highlights, bubbles, controlled floating and different equipment repairs.
- Gravity: glass highlights, readable bays and platform shadows. The physical fall calculation is not eased or altered for visual effect.
- Cinema: eased zooms and crossfades between Earth, Bangladesh, Khulna, the campus and the atrium. Geographic paths are cached instead of re-projecting thousands of points every frame.

Reduced-motion preferences suppress decorative motion. Physics demonstrations retain the movement needed to show the experiment. Phone layouts include readable plant controls and tap alternatives; desktop labs put supplies next to the scene.

## Earth movie narration

On portrait phones the movie fills the viewport with a centered composition; desktop keeps the wide composition. The arrival is 24 seconds long and has five short Dhrubo voice clips, matching captions and a visible speaker icon. Audio is bundled as PCM WAV, so narration does not require a cloud API or an installed browser voice. The clips are synthesized with the system Samantha voice; “Droobo” is used in the audio script to approximate the displayed name Dhrubo. This is not a human voice recording.

If a browser requires a user gesture for audio, the movie pauses behind **Play arrival**. This starts the story, rather than asking whether to enable Dhrubo. Skip, mute and pause remain accessible. Muting permits a silent movie. Pausing, navigation and backgrounding stop or pause narration; resuming restores it. Missing/corrupt audio falls back to browser speech when available.

## TypeScript and Vercel

This is an incremental migration. Three modules are authored in TypeScript under src:

- visual-core.ts: typed motion, chapter timing and high-density canvas helpers;
- movie-narrator.ts: typed audio playback lifecycle;
- flight-model.ts: typed flight events and answer validation.

Existing JavaScript remains in dist. The entire older codebase has not been converted to TypeScript.

Run:

    npm ci
    npm run typecheck
    npm run build
    npm test

The build compiles the TypeScript to dist, then normalizes versioned root-level module and stylesheet URLs. Bump the version in scripts/finish-build.mjs and the offline cache name in dist/sw.js for a future release that needs cache invalidation. Source and emitted JavaScript are both committed, so `dist` can be served immediately without a build.

On Vercel, set the build command to **npm run build** and the output directory to **dist** (see [Vercel deployment](VERCEL_DEPLOYMENT.md)). No Python runtime or backend service is required on Vercel.

See RESEARCH_AND_DESIGN.md for the science sources and model limits.

## Gravity control update

All six object buttons are always visible. Tap an object, then bay A or B. Prediction buttons follow the object choices, and Drop has its own row underneath. Reset is labeled explicitly.

## Training and Mars setup fixes

- Restart this chapter is a large, full-width button in the pause menu.
- Every astronaut training stage has Back. It returns to the preceding stage; the first stage returns to adventure selection. Existing earned patches are retained when stepping back.
- The solar-storm sign measures its text before drawing the background, and the text fades in with the sign.
- Battery instructions explicitly ask the player to connect one plug to Air system, then the other to Radio.
- Home shows Continue story for an unfinished saved story and a visible Play again button. Play again starts a fresh Earth Academy playthrough, clearing current story checkpoints, Academy patches/rounds and the current outpost mission. Avatar, profile, sound and accessibility preferences remain.
- The callsign label and input have explicit vertical spacing.
- Selecting landing sites does not replay the screen introduction. Entering that setup step still gives Dhrubo's introduction.
- Base design has a visible Dhrubo card with entry narration, module selection and placement feedback, error guidance and a replay-help button. Routine map redraws do not repeat the introduction.
