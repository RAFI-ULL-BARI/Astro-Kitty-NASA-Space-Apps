# Kitty’s Mars Adventure 3D — world mission update

Home has two separate 3D entrances: **Explore Mars in 3D** for the planet, and **Kitty’s Mars Adventure 3D** for the game (`mars-explorer.html?play=1`).

The game now has 24 tasks across six chapters, a walkable crater and dune landscape, a six-wheel drivable rover with three world gates, six journal discoveries, and a habitat with visible life-support equipment. Tools operate directly in the Three.js scene. The expedition menu is used for chapter selection and the journal.

Walk/drive with WASD or arrows; drag the view or use J/L to look. Hold Space or the action button to use a tool; Enter toggles the tool for players who prefer not to hold. Q/E and touch turn buttons rotate equipment. Scanning requires facing the target. Rover gates require driving. Chapters and discoveries save on this device. A resumed rover task puts the vehicle at its previous checkpoint. Return to base and free exploration are always available through the toolbar/menu.

Terrain, shadows that follow the player, dust, footprints, equipment animations, filtered window views, indoor lighting, and mobile controls are bundled locally. The Real dropdown links to sources and distinguishes compressed game mechanics from real science. The landscape and habitat are fictional; the game is not an accurate map or an engineering simulator.

Build with `npm ci` then `npm run build`. Run `npm test` for unit checks. The `test/browser-*.mjs` scripts are optional Chrome playthroughs. Serve `dist` over HTTP/HTTPS. Vercel serves `dist` as the output directory. No deployment has been performed by this update.

---

# Unified Dhrubo + Mars Explorer update

Run `python3 -m http.server 8000 --directory dist` from the repository root and open `http://localhost:8000`. Open **Explore Mars in 3D** on the home screen, the adventure chooser, or the Mars Base menu. The planet explorer is at `http://localhost:8000/mars-explorer.html`. Serve over HTTP/HTTPS; opening an HTML file directly will not load modules correctly.

- Spin and zoom a real WebGL Mars globe textured with NASA/JPL's Viking map. Mouse/touch drag, pinch, arrow keys and zoom buttons work. Choose **Land here** on the globe and confirm your landing. Walk with WASD, the arrow keys, or the touch controls. Drag or press J / L to look. **Back to orbit** returns to the globe.
- Tap **Solar storm · 2024** or **Dust storm · 2018** to replay a short visual explanation with the real date and source. The effects are illustrations, not live images or geographic storm forecasts. A solar storm is not a dust storm.
- **Mars weather** reads Curiosity's REMS outreach feed. **Sun now** reads DONKI FLR, trying api.nasa.gov then CCMC. Each observation keeps its measurement date and live-fetch/cache/archive label. No global live Mars weather is invented. Curiosity measurements describe Gale Crater only.
- The Mars walk follows Kitty in third person through the fictional **National Kitty Space Center** outpost. Collect a rock, check the solar console, and open the airlock. Start a **Dust drill** to see visibility and solar output drop. The **Real** dropdown links to Mars science and explains the game model.
- The surface uses Three.js and needs WebGL 2. The terrain is generated deterministically from the selected location. The supplied habitat was optimized in Blender and exported as a local GLB. The scene and habitat are cached for offline play. Devices without WebGL 2 can still use orbit, storm stories, and weather cards where supported.
- The original lavender Dhrubo portrait and canvas character are shared. Each sol opens in a different habitat room. Air/radio instructions explain the devices plainly. Revised first-person scripts and captions share their text; films wait for their spoken line before changing shots.

## Voice status — read this before recording

This supplied project contains only six legacy game voice samples, not the user's complete 280-clip clone pack. Older movie audio demos used different voices. Those samples are no longer mixed into the new movies. A shared narrator picks one device voice and keeps it consistent. A verified complete pack uses one recorded voice; missing lines retain captions rather than switching speakers. Exact recorded sentences can be joined for praise plus a hint.

`voice/CURRENT_SCRIPT.md` is the current recording script, with the new explorer lines. `voice/README.md` explains how to generate the complete pack with your own approved ElevenLabs voice. **No cloned speech was generated, and no ElevenLabs credits were spent in this update.** Keep your original recordings backed up. Earlier release notes below describe previous versions and do not override this voice status.

## NASA and partner sources for the explorer

| Data | Source and meaning |
| --- | --- |
| Mars globe | [JPL Mars texture page](https://space.jpl.nasa.gov/tmaps/mars.html), [original JPEG](https://space.jpl.nasa.gov/tmaps/pix/mar0kuu2.jpg). Exact credit: **Caltech/JPL/USGS**. Viking images processed at USGS; the bundled unchanged 1440×720 texture has no logo. A smooth sphere, not an elevation mesh. |
| Surface weather | [Curiosity REMS outreach JSON](https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json). Credit **NASA/JPL-Caltech/CAB (CSIC-INTA)**. Retrieved 15 November 2026; latest row supplied by that feed was **25 August 2026, sol 4995**, air −71 to −5 °C, pressure 777 Pa. This is a dated observation, not today's weather. Missing values remain missing. Seven original rows are bundled in `dist/data/mars-weather.json`. For scientific analysis use [NASA PDS](https://pds.nasa.gov/), rather than this outreach feed. |
| Solar reports | NASA DONKI **FLR**, last 30 days: `https://api.nasa.gov/DONKI/FLR` then `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR`. No claim that an Earth-observed flare is currently hitting Mars. Existing `NASA_API_KEY` defaults to `DEMO_KEY`; no private key is bundled. |
| 20 May 2024 Mars storm | [NASA Watches Mars Light Up During Epic Solar Storm](https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/). Curiosity radiation measurements and MAVEN auroras. This source is independent of the 10 May DONKI event. The halo illustrates global effects; it is not a measured footprint or visible-light image. |
| 10 June 2018 dust | [Opportunity's Last Message](https://science.nasa.gov/resource/opportunitys-last-message/). Dust darkened the sky at Opportunity. No invented DONKI identifier is assigned to this Mars dust event. |

Weather makes one external request with a 6-second timeout and 3-hour cache. DONKI makes up to two endpoint attempts here, within its existing cap, and shares its 3-hour cache with the outpost. Failed checks use honest archive labels. No polling, tracking, location permission, agent or new runtime library is required. Requests go directly to the NASA endpoints and therefore depend on their availability and browser CORS policy.

## Verification

Run `npm test` and `node scripts/reading-level.mjs`. Browser regression runners are in `test/browser-mars-explorer.mjs`, `test/browser-unified-story.mjs` and `test/browser-movie-sync.mjs`; they use an available Playwright installation (`PLAYWRIGHT_MODULE` can point to its module). `CHROMIUM_MODULE` optionally selects an installed Sparticuz Chromium. They route the local build without a server and intentionally mock external requests offline. See `QA_REPORT.md` for the actual results and limitations, and `CHANGED_FILES.md` for every changed file.

AI disclosure: this project has used **ChatGPT/Codex and Claude**. This update's code and script work used ChatGPT/Codex. NASA observations and the globe texture are sourced data, not AI-generated observations.

---

# Mission film update

Use `python3 -m http.server 8000 --directory dist` to preview the finished build locally. Fly to Mars, Astronaut Training and Mars Base have skippable illustrated openings. The new film narration and simulator flight clips ship with the game. Earth Academy and the trip's crew challenges have a Skip round button. Mars Base can be reset after confirmation, while collected badges and settings are kept.

# HD Discovery edition

See [HD edition notes](docs/HD_EDITION.md) for the current visuals, narration, TypeScript workflow, and deployment settings. The sections below describe earlier editions.

# Mission Adventure edition

Start with `START_HERE.txt`. Current features and science notes: [Earth Academy](docs/EARTH_ACADEMY.md) and [Research and design](docs/RESEARCH_AND_DESIGN.md). These supersede the earlier release notes below.

> **National Kitty Space Center edition:** Five rebuilt Earth labs, a Khulna arrival movie, and Dhrubo guidance choices are included. Read `START_HERE.txt` to run the app and `docs/EARTH_ACADEMY.md` for the activities and science sources.

<div align="center">

# 🐱🚀 Astro Kitty
### Junior Astronaut Mission Trainer

**Fly to Mars. Train like an astronaut. Keep a Mars base alive.**<br>
A playful web game for kids aged 8–12, powered by real NASA space-weather data.

<a href="https://astro-kitty-mission-trainer.vercel.app"><img src="https://img.shields.io/badge/▶%20PLAY%20NOW-astro--kitty--mission--trainer.vercel.app-f7c873?style=for-the-badge&labelColor=14233c" alt="Play Astro Kitty now"></a>

<img src="https://img.shields.io/badge/NASA%20Space%20Apps-2026-1d3a55?style=flat-square" alt="NASA Space Apps 2026">
<img src="https://img.shields.io/badge/Ages-8–12-8fdcc4?style=flat-square" alt="Ages 8 to 12">
<img src="https://img.shields.io/badge/Made%20in-Bangladesh%20🇧🇩-006a4e?style=flat-square" alt="Made in Bangladesh">
<img src="https://img.shields.io/badge/Works-offline%20%7C%20phone%20%7C%20laptop-c3a8f5?style=flat-square" alt="Works offline, on phones and laptops">

<br><br>

<img src="docs/screenshots/01-title.jpg" alt="Astro Kitty title screen: pick your kitty and follow three steps" width="88%">

</div>

---

## 🌟 What is Astro Kitty?

Astro Kitty is our answer to the NASA Space Apps Challenge **“Build a Junior Astronaut Mission Trainer.”**

Kids pick a kitty astronaut and, with **Dhrubo** (ধ্রুব, “pole star”), a friendly robot buddy, take on a real Mars mission in **three steps**:

<table>
<tr>
<td align="center" width="33%"><b>1 · Fly to Mars 🚀</b><br><sub>Plan the trip, then watch it play out</sub></td>
<td align="center" width="33%"><b>2 · Astronaut training 🐾</b><br><sub>Hands-on skills: power, shelter, rover</sub></td>
<td align="center" width="33%"><b>3 · Mars base 🏠</b><br><sub>Five Mars days, real choices, real data</sub></td>
</tr>
</table>

Kids learn by **doing and watching**, not by reading. Every right move earns a cheer: **“Shabbash!”** (Good job!), **“Oshadharon!”** (Amazing!), a happy meow and a little bounce.

---

## 🚀 Step 1 · Mission Simulator: Earth to Mars

Kids plan the trip in four picture choices: **launch day**, **push**, **path** and **landing gear**. Then they press **Launch!** and watch their own plan fly.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/02-mission-path.jpg" alt="Choosing a curved path to where Mars will be"></td>
<td width="50%"><img src="docs/screenshots/03-liftoff.jpg" alt="Three, two, one, liftoff"></td>
</tr>
<tr>
<td><b>Aim for where Mars <i>will</i> be.</b> A straight path misses, because Mars keeps moving.</td>
<td><b>Liftoff!</b> Too little push and the rocket falls back. Too much and it zooms past Mars.</td>
</tr>
</table>

<p align="center"><img src="docs/screenshots/04-landed.jpg" alt="A soft landing on Mars with confetti" width="60%"><br><sub>Heat shield + parachute + landing rockets = a soft landing and the <b>Trip Planner</b> patch.</sub></p>

Every mistake plays its **own animation**, so kids *see* why it failed and try again. No paragraphs to read.

---

## 🐾 Step 2 · Astronaut Training

A walk-and-tap story inside the base, with puzzles kids solve with their hands.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/05-plug-puzzle.jpg" alt="Matching solar panel plugs by shape and colour"></td>
<td width="50%"><img src="docs/screenshots/08-power-puzzle.jpg" alt="Connecting the battery to the air system and radio"></td>
</tr>
<tr>
<td><b>Power our home.</b> Match each solar-panel plug to its socket by shape <i>and</i> colour (colour-blind friendly). Wrong plugs shake and say “try again.”</td>
<td><b>Look after the crew.</b> Only two battery cells! Which machine makes our air fresh? Which one talks to Mission Control?</td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/07-water-shield.jpg" alt="Crew safe behind the water shield gate"></td>
<td width="50%"><img src="docs/screenshots/09-rover.jpg" alt="Driving the rover to marked spots"></td>
</tr>
<tr>
<td><b>Hide from the storm.</b> Through the airlock, into the shelter, and the water gate slides shut. Water helps block fast particles.</td>
<td><b>Explore again.</b> Drive the rover and scan three marked spots.</td>
</tr>
</table>

### ☀️ The solar storm

<p align="center"><img src="docs/screenshots/solar-storm.gif" alt="Animated solar storm: a flash, then particle streaks race across the Mars sky" width="70%"><br>
<sub>First the flash of light… then the fast particles. Those are what real crews hide from.</sub></p>

---

## 🏠 Step 3 · Run the Mars Base

Choose a **real landing site**, design the base, then keep the crew safe for **five Mars days (sols)**. Kids share a few **Sunshine cells** between air, water, food and the water wall. Every day brings a surprise: a leak, a dust devil, a chilly night, ice to dig up, or a **real solar storm from NASA’s records**.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/10-landing-site.jpg" alt="Choosing Jezero, Gale or Arcadia on a real Viking map of Mars"></td>
<td width="50%"><img src="docs/screenshots/11-storm-decision.jpg" alt="A real solar storm alert with three choices"></td>
</tr>
<tr>
<td><b>Pick a real place.</b> Jezero Crater, Gale Crater or Arcadia Planitia, on a real Viking map of Mars.</td>
<td><b>A message from the Sun.</b> Is the water wall strong enough? Shelter now, finish the job, or radio Earth?</td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/12-chilly-night.jpg" alt="An animated chilly night event"></td>
<td width="50%"><img src="docs/screenshots/13-mission-patch.jpg" alt="Mission Patch earned with stars"></td>
</tr>
<tr>
<td><b>Every event is animated.</b> Snow falls, tanks drain or fill, so kids see what is happening.</td>
<td><b>Mission Patch!</b> Stars, praise and a “What you learned” box tied to the kid’s own choices.</td>
</tr>
</table>

---

## 🛰️ Real NASA data inside the game

| What | How Astro Kitty uses it |
| --- | --- |
| **[NASA Open APIs](https://api.nasa.gov/) + [DONKI space weather](https://ccmc.gsfc.nasa.gov/tools/DONKI/)** | Every solar storm is a **real flare record**. The game fetches the latest flares live and falls back to an archive of 9 verified flares when offline. The flare class (C, M or X) sets how strong the shelter must be. |
| **Viking map of Mars** (Caltech/JPL/USGS) | The real map used to pick a landing site. |
| **[USGS Gazetteer](https://planetarynames.wr.usgs.gov/Feature/348) and Mars 2020 site studies** | Real coordinates for Jezero, Gale and Arcadia. |
| **[Mars Trek](https://trek.nasa.gov/mars/)** | Each landing site links to explore it on real NASA Mars maps. |
| **NASA mission science** | Short “Real NASA fact” cards: Curiosity’s radiation readings, the May 2024 Mars solar storm, MOXIE making oxygen, the space station’s 98% water recycling, InSight’s dusty solar panels, Perseverance’s trip and more. |

Every fact carries a small **🛰️ Real** badge, and every made-up game rule carries a **🎲 Game** badge, so kids always know which is which. Sources sit in tap-to-open “Learn more” drop-downs, out of the way.

**Also explored from the official Space Apps resources:** [OSDR](https://osdr.nasa.gov/), [RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/), and the Canadian Space Agency’s [STEM resources](https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp) and [food production toolkit](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/).

---

## 🧒 Designed for kids

<table>
<tr>
<td width="62%">

- **Less text, more action.** Big picture cards, short lines and animations that show what is happening.
- **A friendly guide.** Dhrubo speaks every line aloud, with captions.
- **Praise in Bangla and English.** Shabbash! Oshadharon! Purr-fect!
- **Four kitties to choose from:** Mishti, Megh, Neel and Tara.
- **Safe to fail.** Wrong answers cost nothing, and the crew is always safe.
- **Accessible.** Keyboard controls, screen-reader labels, captions, big-text and reduced-motion modes, colour-blind-friendly puzzles.
- **Works anywhere.** Phones, tablets and laptops, and offline after the first visit.
- **Teacher page** with ideas for using the game in class.

</td>
<td width="38%" align="center"><img src="docs/screenshots/14-phone.jpg" alt="Astro Kitty on a phone" width="78%"></td>
</tr>
</table>

---

## 🎯 What kids learn

1. **Water does three jobs:** drinking, growing plants and shielding the crew from radiation.
2. **Space weather is real,** and walls (especially water walls) protect astronauts.
3. **Earth is far away.** Messages take 3–22 minutes, so the crew must plan ahead and decide for itself.
4. **Getting to Mars is about timing:** launch windows, enough push, aiming ahead, and landing gear for thin Martian air.

---

## 💻 Run it yourself

The included dist folder is ready to preview. TypeScript source modules compile with the included build script.

```bash
git clone https://github.com/RAFI-ULL-BARI/Astro-Kitty-NASA-Space-Apps.git
cd Astro-Kitty-NASA-Space-Apps
python3 -m http.server 8000 --directory dist
# open http://localhost:8000
```

For source changes, install dependencies with `npm ci`, then run `npm run build`. Run the checks with `npm test`.

Current release notes: [Visual designer and warm worlds](VISUAL_DESIGNER_AND_WARM_WORLDS.md). Deployment steps are in [Vercel deployment](VERCEL_DEPLOYMENT.md).

```
dist/        the game (deploy this folder)
test/        automated tests for the game rules and balance
docs/        screenshots and technical notes
```

Full technical notes: **[docs/TECHNICAL.md](docs/TECHNICAL.md)**

---

## 👩‍🚀 Team Astro Kitty 🇧🇩

**Rafiull Bari** and **Saad Uddin Ahmad Basit**, Bangladesh.<br>
Made with ❤ for the NASA Space Apps Challenge 2026.

---

<sub>NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. Astro Kitty is an independent student project and is not affiliated with or endorsed by NASA. The Mars map is © Caltech/JPL/USGS (Viking images, processed at USGS), used for education.</sub>

## Unified Dhrubo story pass

- The original lavender-shell, mint-face Dhrubo now supplies both canvas artwork and the shared caption portrait. Source controls use the existing **🛰️ Real** badge.
- The air prompt asks for the device with a fan and tank; the radio prompt asks for the device with an antenna. The two-cell puzzle and controls are unchanged.
- Daily planning visits five rooms: crew lounge, plant lab, air and water lab, rover workshop, and Mission Control. Outdoor events remain outside. These are presentation-only settings; seed, resources, stars, saves and mission outcomes are unchanged.
- The launch opening is explicitly a simulator preview. Narration and captions come from the same strings. Movie shots wait for their spoken line to finish and use the existing gentle dissolve.
- One narrator now serves all sections. Incomplete/mixed recordings no longer alternate with system voices. This source copy contains six gameplay clips, not the complete 280-clip clone pack. The current default uses one saved device voice. See `voice/README.md` for safely installing a complete single-voice pack, and `voice/CURRENT_SCRIPT.md` for the revised script. No new clone audio was generated in this pass.
- Offline cache: v33. All new runtime modules are precached. Device speech depends on the browser; captions and gameplay remain available offline.

## Kitty’s Mars adventure

Home has separate entries for the Mars globe and the playable 3D adventure.
Open `mars-explorer.html?play=1` for the adventure. Eight missions cover field sampling, solar alignment, rover routing, a dust drill and airlock, oxygen extraction, water recovery, greenhouse care, and radio communication.

Walk with WASD or arrows, drag to look, and use J / L to turn with the keyboard. Touch movement controls appear on phones. The Missions button lets players replay any mission and enter the habitat missions. Go outside returns to free exploration. Patches save on this browser. Closing a challenge keeps the mission available to retry.

Each mission’s Real dropdown explains its science, links its source, and identifies the simplified game model. The habitat and its operating procedures are fictional educational scenes.
