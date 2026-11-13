# Astro Kitty: Junior Astronaut Trainer

## Mission Simulator: Earth to Mars

Choose **Begin our adventure** to plan a trip before the arrival film. Turn the launch-day dial to see Earth and Mars move. Pick a day, a push, a path and three pieces of landing gear. Use the picture cards by touch, mouse or keyboard. The four plan buttons at the bottom let you revisit a choice. The ⓘ button gives the NASA term and a source.

**Launch!** plays liftoff, cruise and landing in about 45 seconds on a successful trip. **⏩** runs at four times normal speed. **Skip** jumps to the result or skips the ten-second intro. A simulation ending replays the moment that went wrong. **Try again** keeps the rest of your plan, and two tries on the same step reveal a hint. A soft landing earns the **Trip Planner** patch. **Continue to Mars** starts the arrival film, followed by the original choice of Astronaut Training or the Mars base game. Returning players can use **Skip to Mars**. The existing story save keeps the unlock and older checkpoints.

The simulator has captions, a spoken guide, labelled keyboard controls and reduced-motion stills. Pause and hidden tabs suspend its clock. It uses the existing audio and settings. The **v15** offline cache includes both simulator modules.

| NASA or JPL source | How the simulator uses it |
| --- | --- |
| [Mars 2020 mission plan](https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/mission/) and [JPL Mars launch-window activity](https://www.jpl.nasa.gov/edu/resources/lesson-plan/lets-go-to-mars-calculating-launch-windows/) | Launch opportunities recur about every 26 months. The three-day puzzle uses a seeded position and rounds the ideal transfer angle of about 44° to 45°. |
| [NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) | Surface escape speed is about 11 km/s or 40,000 km/h. The push cards are a game model. Actual rockets build up speed over time and plan their arrival speed. |
| [NASA Perseverance overview](https://science.nasa.gov/mission/mars-2020-perseverance/) | Perseverance left on 30 July 2020 and landed on 18 February 2021. The game clock compresses that roughly seven-month example. |
| [NASA Perseverance landing](https://science.nasa.gov/mission/mars-2020-perseverance/landing/) and [Spirit](https://science.nasa.gov/mission/mer-spirit/) | The heat shield, parachute and powered descent are based on rover landings. The ship lands on its own during the “seven minutes of terror.” Earlier small rovers used airbags. |

The pictures show why to aim where Mars will be. Planet sizes, orbit scales, paths, timing, push levels, retries and the crew ship's three-piece landing kit are simplified game rules. The ideal transfer exercise and the historical Perseverance trip are different examples. The game always gives the same result for the same plan and launch-day setup.

## Hands-on Astronaut Training story

After landing, choose **Astronaut Training**. Walk with the arrows or WASD, or tap a spot. Press **E** or use the action button to act. Match plugs by dragging, by tapping a plug and then its socket, or by using **Tab** and **Enter**. Dhrubo's captions stay on screen during each task. The **🛰️ Real** button opens a linked science fact and pauses the scene.

- **Power our home.** Match four shaped, coloured plugs across two solar panels. A wrong match costs nothing. The habitat lights come on after all four plugs fit.
- **Head inside.** Watch the flash, then the particle streaks. Close the outer airlock door and fill the lock. The gauge turns green before the inner door can open. Walk into the shelter with the crew and seal the clear water gate.
- **Look after the crew.** Connect one backup cell to the air system, then one to the radio. Read the pictures for clues. Wrong choices leave both cells available. Names appear on connected devices. The radio, rover charger, heater, lights and air system have accessible names throughout.
- **Wait and explore.** Read the particle monitor until the line settles. Follow the rover's bright outline, arrow and ground ring to find the driving controls and scan three marked spots.

Correct steps get a brief pop, a sparkle and a rotating Dhrubo compliment. Danger shakes are capped at 6 px and 0.4 s. The rover cue blinks at one cycle per second until the first driving input, then fades over 0.4 s. Reduced motion keeps it steady and clears it immediately on input. Every walk and drive scene offers four on-screen arrow buttons. Pause and tab visibility suspend the story clock. Mute stops Dhrubo and all sound effects.

Add any of `yay.mp3`, `applause.mp3`, `meow.mp3` and `purr.mp3` to `dist/audio/sfx/` and list the supplied names in `manifest.json`. Add the source and licence to [CREDITS.md](CREDITS.md). The current release uses the built-in chime, with generated hiss, click, thunk and wrong-match sounds. See [Part 4 of the recording script](voice/SCRIPT.md) for the new Dhrubo lines.

The existing story save key and earned patches carry over. Loading a saved wire or battery step starts that task again. Cache **v15** includes the story modules and audio manifest. The outpost rules and all six classic drills retain their existing behavior.

| Source | What is shown in the story |
| --- | --- |
| [NASA's sunrise and sunset on Mars](https://science.nasa.gov/solar-system/planets/mars/what-does-a-sunrise-sunset-look-like-on-mars/) | From Mars, the Sun looks about two-thirds as wide as it does from Earth. The drawing uses a small Sun and a soft glow. |
| [NASA hardware and equipment](https://www.nasa.gov/reference/9-0-hardware-and-equipment-vol-2/) | Keyed connectors can help prevent wrong hookups. The four colours and shapes are a training puzzle. |
| [JPL's Mars at a glance](https://www.jpl.nasa.gov/news/press_kits/insight/landing/facts/mars-at-a-glance/) | Mars surface pressure is less than one hundredth of Earth's. The dial's 0–100 scale shows fill progress, and the game shortens the wait. |
| [NASA's Veggie garden](https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/) | The rack and its pink-purple light are inspired by NASA's space station plant chamber. |
| [Curiosity's instruments, including RAD](https://science.nasa.gov/mission/msl-curiosity/science-instruments/) | RAD measures radiation on Mars. The story uses a simulated particle trace. |
| [NASA's account of the May 2024 Mars storm](https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/) | A flash is light. The game draws streaks to show fast particles that can follow. Water shielding helps reduce exposure. The gate, battery rules and storm timing are simplified for practice. |

[QA_REPORT.md](QA_REPORT.md) records the latest automated tests, three-viewport simulator checks and earlier story playthroughs. [CHANGED_FILES.md](CHANGED_FILES.md) lists every file in this update.

## New field trainings — 8 November 2026

`/classic/` now has six matching cards and six passport badges. The original four drills and narrated training story remain available. The story ending also links to the two new activities. Each new activity is designed for about two minutes, with no time limit while planning or reading. This duration is an estimate, not a child playtest result.

- **Rover Commander** (`commands`): plan three 6×6 drives with Forward, Turn left and Turn right. Each plan holds at most 12 cards. Select a card to remove it or move it earlier/later. One simulator test per drive draws a ghost path and does not count as a Send. Send locks the plan during a four-second game delay and the step-by-step drive. Rocks, sand, map edges and missed flags stop the attempt; Edit plan keeps the queue and highlights the failed card. Across all three drives, earn one star for all flags, one for meeting every card goal (6/8/10), and one for every first Send. Testing in the simulator does not lose the first-Send star.
- **Field Geologist** (`geology`): inspect six locally drawn rocks through a hand lens. Keep three different samples. Leave can remove a kept sample before checking. The three goals are three water clues; one water/lava/space clue each; and two water clues plus one lava clue. Dhrubo explains every pick. Across all rounds, 3/6/9 useful picks earn 1/2/3 stars. Finish all rounds with at least three useful picks for a badge; zero useful picks invite a new try. More than one sample set can fit a goal.

Use the large buttons or keyboard: Commander **F/L/R**, arrows to select a card, **Delete/Backspace** to remove, **[ / ]** to reorder, and **Enter on the map** to Send. Geology **1–6** to inspect, **K** to Keep, **L** to Leave, and **Enter on the map** to check a full bag. Rock buttons and the canvas both open the lens. Help pauses the activity. Escape pauses/resumes; Close returns to training. Dhrubo voice, captions, big text, reduced motion and 44px controls are retained. A spoken map description gives flag, rock and sand coordinates.

Both activities save best stars and scores (500/700/900 for 1/2/3 stars) in the existing `astro-kitty-training-v1.best` object. Old four-badge saves load without losing their results. Failed attempts do not replace a best result. New perks are copied into the next outpost mission; a mission already underway keeps its prior perks. Old outpost saves default missing `forecast` and `fieldwork` to false.

The `commands → forecast` badge shows tomorrow’s **seeded** clear/hazy/dusty weather during the morning and plan. There is no forecast on sol 5. It is game weather, not a NASA prediction. The `geology → fieldwork` badge multiplies each site's rock reveal distance by **1.25** and adds a named clue/note to each find and the collection. Collection reach, rock positions, supplies and mission RNG do not change. The five drawn kinds are pebbles, layers, lava holes, pale crust and metal rock; the classifications are marked Game, with a linked Real science fact.

### Sources and science limits for the new trainings

Primary NASA/JPL pages checked on 8 November 2026:

| Source | What the activity teaches |
| --- | --- |
| [NASA: How to Drive a Mars Rover](https://www.nasa.gov/podcasts/on-a-mission/how-to-drive-a-mars-rover-s4e8/) and [JPL drive planning/simulation](https://www-robotics.jpl.nasa.gov/what-we-do/applications/driving/) | Teams plan and simulate moves before sending; this is not live joystick driving. |
| [How Perseverance Drives on Mars](https://science.nasa.gov/resource/how-perseverance-drives-on-mars/) | AutoNav maps nearby ground and can find paths around hazards; people choose the mission's stops. |
| [Pebbly Rocks Testify to Old Streambed on Mars](https://www.jpl.nasa.gov/news/pebbly-rocks-testify-to-old-streambed-on-mars/) | Curiosity found stream rocks in Gale. Pebbles ranged up to golf-ball size; scientists inferred sustained flowing water, ankle- to hip-deep, at about walking pace. These are estimates of an ancient stream, not present conditions. |
| [Jezero Crater’s Watery Past](https://www.jpl.nasa.gov/news/nasas-perseverance-sheds-more-light-on-jezero-craters-watery-past/) | Layers helped establish an ancient lake and river delta. Layers can also form in other ways. |
| [Gusev Lava Rocks](https://science.nasa.gov/resource/gusev-lava-rocks/) | Gas bubbles can leave holes as lava cools. |
| [Puzzling Point Lake Outcrop](https://science.nasa.gov/photojournal/puzzling-point-lake-outcrop-revisited/) | Holes alone do not prove lava; scientists also check context and composition. Plain dark colour is insufficient. |
| [Looking for Salts on Mars](https://www.jpl.nasa.gov/images/pia17875-looking-for-salts-on-mars/) | Salts can remain when water dries up. A white crust alone cannot identify salt; the game's crust is a simplified clue. |
| [Curiosity Examines a Meteorite](https://science.nasa.gov/resource/curiosity-rover-finds-and-examines-a-meteorite-on-mars-2/) | ChemCam confirmed an iron-nickel meteorite. The game's shiny metal clue is simplified; shine alone is not proof. |

The grid, fixed obstacles, three flags, card limits, instant simulator, four-second transmission, sample categories, stars and perks are **game rules**. Real messages take about 3 to 22 minutes one way, depending on Earth/Mars positions; a reply needs both journeys. Real teams use more clues and instrument tests than one drawing. No sample-return mission or physical identification test is simulated.

The offline cache includes all four field training runtime files. Offline navigation ignores query strings when looking up a cached page, so the teacher's `?mission=commands` and `?mission=geology` links work from the precached classic page. No new library, image, account, save key or network request was added for training.

## Earlier polish — November 2026

Normal mission codes now select among **nine verified C/M/X flares**; goals remain C 30, M 40, X 50. `dust 42`, `DUST42` and `dust_42` all become `DUST-42`, while older long codes remain valid. An existing save keeps its pinned event, goal, random state and choices. Archive order is intentionally fixed; the JavaScript mirror and JSON have a parity test.

The base designer keeps **Continue** in a fixed footer. Storm and planning screens show one wall status; **How does it work?** holds the longer rules. The far-shelter cost applies to radio as well as shelter, so radio always costs 5 extra Spirit. Finishing pays the same shelter tier, plus Air −10 and 5 extra Spirit. Main screens use **Sunshine cells** and **Battery**, ten-dot odds, dust/sunlight gauges, and small **🛰️ Real / 🎲 Game** badges with tooltips and accessible labels. The air-filter shortcut still has its original 65-in-100 chance: its picture has six full dots and one half dot, and its label says “about 6 or 7 out of 10.” No odds or other Part B–D resource mechanics were changed.

Dhrubo explains flares, fast particles, Earth-viewed observations and the imagined Mars direction. A separate [20 May 2024 Mars storm fact](https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/) covers NASA’s 30-chest-X-ray comparison, planet-wide auroras and possible shelter. The historical RAD maximum is qualified as reported in June 2024. It is **not** the 10 May flare; no unverified 20 May DONKI ID was added.

After the storm, a three-answer reflection explains why the water wall helped. It has no score, supply or random-seed effect. Only `water`, `food` or `signal` is saved under `astro-kitty-storm-answer-v1`; the answer record has no name, mission ID or timestamp. The Crew Report’s **What you learned** box links water, space weather and crew autonomy to that player’s actual logged choices. The text export includes the same ideas.

**Coordinate note:** Arcadia uses the official [USGS Gazetteer Feature 348](https://planetarynames.wr.usgs.gov/Feature/348): 46.66°N, 192.00°E, planetocentric and east-positive. The game rounds its regional pin to about 47°N, 192°E.

The offline cache also includes the archive mirror, presentation helper and verification notes. Run `node scripts/reading-level.mjs` to reproduce the documented reading estimates.


A narrated Mars game for ages 8–12, developed for the NASA Space Apps challenge brief **Build a Junior Astronaut Mission Trainer**. Practise skills, run a small outpost for five sols (Mars days), and read a Crew Report about the consequences. Independent educational prototype; no NASA endorsement or NASA logo.

## Game structure

**Film opening → choose an adventure → play its story.** The first button begins the narrated flight and landing. After touchdown, Dhrubo pauses for the player's choice. Returning players can resume; older saves see the new opening once while retaining their training checkpoint.

- **Astronaut Training**: the full-screen story is the main training path. Follow Dhrubo on foot, brush panels, connect habitat power, bring the crew through the airlock, share backup power, wait for the all-clear, and drive the rover through three scans. Narration, captions, film scenes and playable chapters stay together throughout.
- **Mars-base story** (`/outpost.html`): real space weather appears first, then callsign/code → real Mars landing site → base design → a narrated crew welcome. Each sol has a narrated morning, a power plan, an establishing story scene before its surprise, a consequential decision, narrated feedback and an evening recap. The five-sol systems, seeded missions, stars and NASA facts remain in the existing outpost engine.
- **Crew Report**: every power plan and decision, exact meter changes, linked NASA context and earned/missed stars. Read it during a run or download it as text.
- **Extra training challenges** (`/classic/`): six challenges are available from the training pause menu and training ending. The original four keep their controls, saves and scoring; Rover Commander and Field Geologist add planning and evidence practice.
- **Teachers/parents** (`/teacher.html`): learning goals, a ten-minute paired activity and three discussion questions. The training link now leads to the story path.

Choose another adventure from the training pause menu, training ending or base menu. Base-story scenes can be continued, heard again or skipped to the decision with the close button/Escape. No supplies change during an establishing scene. These are animated canvas scenes with browser narration, not streamed video files; they remain available offline after caching.

The learning goal is to explain a trade-off: why using a limited supply for one purpose can make another task harder. Players practise prediction, revision, teamwork and separating evidence from game rules.

## How the challenge is met

| Requirement | Working behaviour |
| --- | --- |
| Life support | Air and Water reserves are always visible. Air processing and water recycling need power; crew use lowers reserves. |
| Sunshine cells and Battery | Sunshine cells are today’s solar share. Battery is stored electricity for repairs and surprises. Sunlight and panel dust have visual meters with exact screen-reader values. |
| Food | Greenhouse lights use power and water to add food points. The crew consumes food each sol. |
| Shielding | Sunshine cells assigned to the wall move supplies and water bags. Wall water adds shielding but is removed from the drinkable/plant reserve. Returning a bag recovers water and reduces shielding. Stored water does not vanish or need electricity to keep shielding. |
| Success/failure | Positive Air, Water and Food through five sols earn a Mission Patch. If one reaches zero, Mission Control brings the crew home safely; the report explains what ran out. |
| Open data | Real NASA DONKI solar-flare identity/date inspire the storm. A verified JSON archive and locally saved online record cover outages and rate limits. |
| Usability | Dhrubo’s voice/subtitles, big text, reduced motion, keyboard/touch/tap controls, 44px buttons, 360px layout, classroom activity and report/postcard exports. |

## Quick setup and your base

The existing outpost has one setup flow: **callsign/code → landing site → design base → launch**. Every step offers **Use Dhrubo’s choice**. The standard shortcut does not wait for NASA; a cold “today’s storm” lookup has a bounded timeout. Custom placement works by selecting a module and tapping a tile, by pointer drag, or by Tab → arrow keys → Enter. Reset clears the six movable modules; home stays fixed. Launch is disabled until all six are placed. Dhrubo’s layout restores a valid design with one tap.

The 5×4 map has a fixed habitat at row 3, column 3. Place the shelter, greenhouse, two panels, water tank and rover garage on distinct non-home tiles. Distance counts horizontal/vertical grid steps; touching means sharing an edge, not a corner. The rightmost column is the marked windy edge. **Every effect below is a game rule, not a NASA engineering limit.**

| Placement | Small game effect |
| --- | --- |
| Shelter touching home | No extra Team Spirit loss on “shelter now.” At distance 2 or more, that choice costs 5 extra Spirit. Protection still depends on shielding. |
| Each panel touching home | Cleaning costs 1 less Battery per nearby panel, up to 2 saved. Base cleaning cost is 12, or 4 with Navigation, before this reduction. |
| Each panel on the windy edge | On a dusty-weather sol, routine panel cleanliness loses 1 additional point per edge panel. Routine loss remains 12 per sol, or 5 with Maintenance. |
| Greenhouse touching water tank | A powered greenhouse adds 2 extra Food that sol. It adds nothing when allocated zero light cells. |
| Garage touching home | Stuck-in-sand surprise cards are excluded. Otherwise those cards remain possible. |

Dhrubo’s plan aims at the chosen storm goal. Once protection is ready it shifts the spare shelter cell to plants. If projected Food would fall below 18, it may move one air cell to plants while Air is above 40. This is a visible allocation strategy, not a hidden supply bonus. The layout’s actual food bonus is in the preview. The **Base map** HUD button shows the design and rules; the outdoor panels, greenhouse and shelter follow its left-to-right ordering. The report includes the site, map and effects.

A layout cannot guarantee success, and an awkward layout need not cause failure. The maximum-penalty layout and Dhrubo’s layout both finish the 5,000-run checks at every site/tier with sensible plans. Under the same random planning/choice policy, the good layout earns more storm stars; see the measured table in QA_REPORT.md.

## Training advantages

The outpost reads `localStorage["astro-kitty-training-v1"].best[missionId].success`. Both story training and the extra classic challenges write this same record. Perks are snapshotted at the start of each new base mission.

| ID / badge | Advantage |
| --- | --- |
| `solar` / Maintenance | Slower routine panel dust and a smaller dust-card penalty. |
| `rover` / Navigation | Rover cleaning uses 4 battery points rather than 12, before the layout’s 0–2 point nearby-panel reduction. |
| `power` / Resource Planning | One extra Sunshine cell each sol. |
| `shelter` / Safety & Timing | A storm warning appears one sol early, before planning the water wall. |
| `commands` / Rover Commander | `forecast`: see tomorrow’s seeded weather while planning. |
| `geology` / Field Geologist | `fieldwork`: rock reveal distance ×1.25 and a clue note for every find. |

Story training awards Maintenance after the habitat cable is connected, Resource Planning after the air/radio power puzzle, Safety & Timing after waiting for the all-clear, and Navigation after all rover scans. Each completed story task grants one completion star and a 100-point completion record. Higher existing classic scores/stars and other saved fields are preserved; replay never stacks the same completion award. Real NASA facts for the four tasks appear at the training ending.

Training stars and best outpost stars per mission code unlock suit colours and helmet stickers. An outpost Mission Patch unlocks the moon sticker. These effects are disclosed game rules, not measured training outcomes.

## Real NASA data

The first outpost screen shows **Real space weather · from NASA**: the most recent valid flare, date, class, a five-level A/B/C/M/X meter and its NASA link. A successful last-30-day response whose newest flare is older than seven days displays the quiet-week sentence. An archive cannot establish what the Sun is doing today, so it never gets that claim.

Only **DONKI FLR** data is used. The NASA gateway is tried first; failed, timed-out, empty or invalid responses try the keyless CCMC endpoint. Both hosts count toward the same three-request visit cap. No SEP/CME request is made:

```text
https://api.nasa.gov/DONKI/FLR?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&api_key=NASA_API_KEY
https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

Normal lookup covers the previous **30 days**. A shared historical event absent from that response/archive is looked up on its own UTC date through the same endpoint. There are at most **3 NASA requests per page visit**, normally one, or two when the gateway needs its backup. A historical share can use the third request; the cap always wins over another fallback. Successful responses, shared lookups and failed attempts are cached for **3 hours** under the existing `astro-kitty-donki-v1` key. Cached data is explicitly “not live.” An expired response is not presented as fresh.

`NASA_API_KEY` is the single exported constant in `dist/nasa-data.js`, defaulting to `"DEMO_KEY"`. The hosted game uses the default, the keyless CCMC endpoint and its local archive. If you add a personal key to another deployment, keep it in a server-side secret and have the browser call that server. NASA documents the DEMO_KEY limit as **30 requests per IP per hour and 50 per day** ([official limits](https://api.nasa.gov/assets/html/authentication.html)). A browser key is visible in requests; do not place a private secret in this file.

The loader normalizes NASA `beginTime`/`link` fields, treats timezone-less DONKI timestamps as UTC, checks record identities, and only allows the exact HTTPS NASA hosts `ccmc.gsfc.nasa.gov`, `kauai.ccmc.gsfc.nasa.gov` and `webtools.ccmc.gsfc.nasa.gov`. If both endpoints fail (each has a **6-second timeout**), or the visit cap is reached, a 429, network error, empty/malformed response or offline miss uses `data/donki-events.json` and the label **NASA archive, not live**. A built-in May 2024 reference record keeps the card usable even if the local JSON cannot be read. No fake event is generated.

**Play this week’s real storm (date)** appears only for live data no more than seven days old. Archive, cached and older data instead say **Play this real storm (date)**. Either button pins the displayed event. Standard missions pick one of nine verified archive flares using a separate code-seeded stream. All C/M/X tiers occur across the 600 short codes. Shared `event` links override that pick. This leaves weather and card randomness unchanged. A late refresh never changes an existing mission’s event, target or random state. A missing shared event is explicitly replaced by a named/date-stamped archive event before launch and in the briefing.

Historical records in `dist/data/donki-events.json`, verified against primary NASA CCMC pages on 6 November 2026:

| Activity ID | Start (UTC) | Class | Source |
| --- | --- | --- | --- |
| `2024-05-08T21:08:00-FLR-001` | `2024-05-08T21:08:00Z` | X1.0 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30601/-1) |
| `2024-05-09T08:45:00-FLR-001` | `2024-05-09T08:45:00Z` | X2.2 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30605/-1) |
| `2024-05-10T06:27:00-FLR-001` | `2024-05-10T06:27:00Z` | X3.9 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30666/-1) |
| `2024-01-06T05:28:00-FLR-001` | `2024-01-06T05:28:00Z` | C3.3 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/28511/-1) |
| `2024-01-06T05:41:00-FLR-001` | `2024-01-06T05:41:00Z` | C3.8 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/28512/-1) |
| `2024-01-06T05:53:00-FLR-001` | `2024-01-06T05:53:00Z` | C4.1 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/28513/-1) |
| `2024-01-06T06:06:00-FLR-001` | `2024-01-06T06:06:00Z` | C4.0 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/28514/-1) |
| `2023-01-11T00:39:00-FLR-001` | `2023-01-11T00:39:00Z` | M2.4 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/23243/-1) |
| `2026-07-04T01:52:00-FLR-001` | `2026-07-04T01:52:00Z` | M1.2 | [NASA record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/47310/-1) |

**A real flare inspires a fictional alert.** It does not demonstrate that a particular Mars location or crew received a solar energetic-particle event. Arrival, duration and meter effects are simulated. The game does not calculate radiation dose or issue forecasts. Live/archive/saved data are labelled distinctly.

## NASA resources and verified numbers

| Resource | Fact / interpretation |
| --- | --- |
| [Curiosity instruments](https://science.nasa.gov/mission/msl-curiosity/science-instruments/) | RAD measures radiation on Mars. Shielding points are not a RAD measurement. |
| [InSight power](https://science.nasa.gov/resource/insights-power-generation-after-landing-and-spring-2022/) | About 5,000 watt-hours per sol after landing; about 500 by spring 2022 after dust accumulated. |
| [ISS water milestone](https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/) | A system demonstrated 98% recovery; not every system always achieves it. |
| [Veggie](https://science.nasa.gov/mission/veggie/) | Plants are researched and grown on the ISS; fresh produce supplements other food. |
| [MOXIE](https://www.nasa.gov/solar-system/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/) | Made oxygen from Mars’ atmosphere; not a complete crew life-support system. |
| [CHAPEA](https://www.nasa.gov/humans-in-space/chapea/) | Year-long Mars-like habitat simulations on Earth. |
| [HERA](https://www.nasa.gov/mission/hera/) | Isolated Earth missions up to 45 days. |
| [Post-landing tests](https://www.nasa.gov/humans-in-space/new-tests-evaluate-mission-readiness-of-astronauts-upon-landing/) | Returned astronauts and ARGOS/harnesses simulate planetary tasks and Mars gravity. Humans have not landed on Mars. |
| [Mars Relay Network](https://science.nasa.gov/mars/mars-relay-network/) | Roughly 3–22.4 minutes one-way light time. Game copy says “about 3 to 22 minutes one way, depending on where Earth and Mars are”; a reply needs both journeys. |
| [Water-wall concept](https://technology.nasa.gov/patent/TOP2-197) | NASA-studied concept for water reuse and shielding, not an inhabited Mars installation. The game reserves drinking water; NASA concepts can use several kinds of stored water/residuals. |
| [Neutral Buoyancy Laboratory](https://www.nasa.gov/johnson/neutral-buoyancy-laboratory/) | Underwater spacewalk rehearsal. |
| [Iceland geology training](https://science.nasa.gov/missions/artemis/nasas-artemis-ii-crew-uses-iceland-terrain-for-lunar-training/) | Earth fieldwork for geology, navigation and sampling. |
| [Mars facts](https://science.nasa.gov/mars/facts/) | Rust colour, old rivers, volcanoes, canyons and the word “sol”. Hidden rocks are illustrations, not catalogued NASA samples. |
| [Mars moons](https://science.nasa.gov/mars/moons/) | Phobos circles Mars three times a day; Deimos takes about 30 hours. |

## Mars map, sites and credits

The bundled map `dist/assets/mars-viking.jpg` is the actual **1440×720 JPEG (149,687 bytes)** from JPL’s [Mars texture page](https://space.jpl.nasa.gov/tmaps/mars.html), [direct original](https://space.jpl.nasa.gov/tmaps/pix/mar0kuu2.jpg). The exact on-screen credit is **Caltech/JPL/USGS**, followed by “Viking images, processed at USGS.” The image was inspected: no logo, insignia, labels or watermark. It is bundled unchanged, below 300 KB. [JPL image-use policy](https://www.jpl.nasa.gov/jpl-image-use-policy/) allows credited educational use without implied endorsement.

This is a north-up global display texture, with 0° longitude at the centre and the seam at 180°E. The interface projects approximate regional markers onto that texture; JPL display textures are not navigation/scientific-analysis products. Real buttons over the map and a labelled list below provide equivalent keyboard/screen-reader choices. Each region has a NASA fact and source link.

| Site | Approximate regional coordinates and verification | Real story | Game rule |
| --- | --- | --- | --- |
| Jezero Crater | 18.4°N, 77.6°E — [NASA Mars 2020 SDT appendices](https://mars.nasa.gov/files/m2020/SDT_Appendices_Final_v6.pdf), PDF p33 / printed p187 | [Perseverance](https://science.nasa.gov/mission/mars-2020-perseverance/) studies an ancient lake bed and delta. | Dust/dust-devil card weights ×1.6. Rocks glow within 220 world units instead of 155 and collect within 44 instead of 32; still five unique rocks. |
| Gale Crater | 5.4°S, 137.8°E — [NASA Johnson crater metadata](https://ares.jsc.nasa.gov/engagement/activities/resources/crater-comparisons/craters-metadata.pdf), PDF p2 | Curiosity explores [Mount Sharp](https://science.nasa.gov/resource/mount-sharp-inside-gale-crater-mars/); [RAD](https://science.nasa.gov/mission/msl-curiosity/science-instruments/) measures radiation. The storm card mentions RAD here. | Balanced starting reserves/card weights. |
| Arcadia Planitia | About 47°N, 192°E — [USGS Gazetteer Feature 348](https://planetarynames.wr.usgs.gov/Feature/348), centre 46.66°N, 192.00°E, planetocentric and east-positive | NASA orbiters mapped [shallow buried ice across parts of Arcadia](https://www.jpl.nasa.gov/news/nasas-treasure-map-for-water-ice-on-mars/). | Start with 8 extra Water points (80 instead of 72). Ice/freezing-night card weights ×1.7. |

These are broad region markers, not exact rover touchdown sites, approved human landing sites or promises of ice at the marker. Site card weights, colder-night frequency, starter water and discovery radii are invented; the map supplies context, not simulated climate or resource measurements. The code chooses a default site; players can change it.

## Mission codes, stars and consequential choices

New codes use a word plus **two digits**, such as `DUST-42` (600 possible generated codes). Older long codes are still accepted. A share includes **`?code=...&site=...&base=...&event=...`**. `base` is a validated six-character base-20 encoding of the six module tiles. Overlapping, missing, extra, off-grid or home-overlapping modules are repaired to Dhrubo’s layout; invalid site IDs use the code’s default. No URL can inject arbitrary modules or event requests.

The full mission settings—code, site, layout, pinned event, rules version and training perks—plus the same choices reproduce the mission. Codes seed weather, storm sol, rocks, bonus goal, weighted draws and risks. Standard missions have a stable code-selected archive event; the real-storm button pins the displayed event instead. Share links preserve it. Callsigns and profile settings are not sent to NASA or added to shares. Sharing does not change hosting access.

Clear weather starts with 7 cells, hazy 6, dusty 5. Panels below 60% clean cost one cell. Planning adds one. **Team Spirit 80+ adds one cell next sol; 30 or below costs one.** Morning mood is snapshotted. Budget and confirm stay pinned while planning content scrolls.

Flare classes come from NASA; their game interpretation is deliberately simple. [NASA explains](https://science.nasa.gov/sun/solar-storms-and-flares/) the approximate tenfold class scale. **C = small / goal 30, M = strong / goal 40, X = huge / goal 50.** A/B also use small/30; unknown letters show an unknown-class message and use the strong/40 game default. Class is not a Mars radiation dose, forecast or proof that particles reached the crew.

| Storm response | Game consequences |
| --- | --- |
| Shelter now, Shielding at/above the selected goal | Spirit +10 before any 5-point far-shelter cost; earns the storm star. |
| Shelter now, Shielding 20 up to one below the goal | Spirit −10, Food −6, plus the far-shelter Spirit cost if applicable. |
| Shelter now, Shielding below 20 | Spirit −20, Food −10, Battery −10, plus the far-shelter Spirit cost. |
| Finish the outside job | Same shelter tier and far-walk costs as shelter now, plus Air −10 and Spirit −5. The crew still shelters afterwards. |
| Radio Mission Control | Six-second reply countdown, then the protection tier’s outcome with Spirit −5 extra. No storm star. The same 5-Spirit far-walk cost applies to both shelter and radio, before radio’s extra 5-Spirit delay cost. |

All thresholds/losses are **game rules, not radiation safety limits**. Water transferred into the wall cannot be drunk/used by plants until returned. Weak shielding can still survive but costs supplies and the storm star.

The report awards at most three stars and explains missed ones:

1. Complete five sols: one star and Mission Patch.
2. Choose shelter now with the event’s shielding goal met at the moment of the storm.
3. **Complete the mission** and meet its seeded goal: two rocks, Food 70+, Spirit 80+, Water 60+, Shielding 80+ or Battery 50+. A failed mission never earns the bonus, even when its numerical target is met.

An earned storm star can be retained after a later safe-home ending. Best total stars remain saved per code, so replaying site/base variants never stacks unlimited copies. A patch is awarded once per completed run.

## New surprises and their NASA context

Cards are selected by weight and current needs. The seven original cards remain. These nine additions and a support card each link a fact:

| Card | NASA source and real context |
| --- | --- |
| Dust devil | [Spirit/Opportunity panel cleanings](https://science.nasa.gov/photojournal/solar-panel-dust-accumulation-and-cleanings/): wind sometimes removed dust. The 60%/40% gamble and point changes are invented. |
| Clogged filter | [NASA vent/filter research](https://ntrs.nasa.gov/citations/20240007333): dust and debris affect airflow. The 65%/35% shake-clean gamble is a fictional shortcut, not a NASA procedure. |
| Freezing night | [Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html): mean −59 °C, rounded to about −60 °C in the game. |
| Cargo lander | [ISS facts](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/): cargo craft bring supplies. The Mars lander was sent months earlier; it is not instant resupply. |
| Buried ice | [NASA SWIM map](https://science.nasa.gov/resource/swim-map-shows-subsurface-water-ice-on-mars/): underground ice mapping. Instant processing is a game shortcut. |
| Rover in sand | [Spirit mission](https://science.nasa.gov/mission/mer-spirit/): Spirit became stuck in soft soil in 2009. |
| Space pebbles/panel repair | [Opportunity's iron meteorite](https://science.nasa.gov/resource/iron-meteorite-on-mars/): real meteorite discovery; the panel damage scenario is fictional. |
| Birthday | [ISS birthday celebrations](https://www.nasa.gov/history/space-station-20th-celebrating-birthdays-on-iss/): celebrations aboard the station. |
| Drawings from Earth | [NASA Space Art](https://www.nasa.gov/stem-content/stemonstrations-space-art/): astronaut art and an invitation to learners; the received drawings are fictional digital messages. |
| Mission Control checklist help | The cargo source above. A low Air/Water/Food reserve can trigger a once-only reminder about a **prepacked onboard backup crate**, never a delivery from Earth on demand. |

## Bangladesh suit patch and team

**Astro Kitty — Rafiull Bari and Saad Uddin Ahmad Basit — is a team from Bangladesh.** Home, the outpost menu, teacher page and Crew Report credit the team with a small inline SVG flag. The project retains its independent, not-endorsed-by-NASA wording. It uses no NASA logo, insignia, worm logotype or seal.

Choose **Bangladesh** (default) or **No patch** under Your astronaut → Flag patch. `astro-kitty-profile-v1.flag` accepts only `bd` or `none`; missing, malformed or unknown values fall back to `bd`. Training and the arrival story read the same profile. Existing save keys are unchanged; old outpost states migrate in place and are labelled as earlier-rule missions.

`dist/flags.js` owns the reusable canvas helper and matching SVG: width:height 10:6, green `#006a4e`, red `#f42a41`, disc radius width/5, centre 0.45 × width from the left (hoist) and 0.3 × width vertically. A 1px light outline keeps the sleeve patch readable. Geometry follows the [Bangladesh Flag Rules government specification](https://file-chittagong.portal.gov.bd/uploads/257b8189-daa0-4ef3-865a-d7baf545284d/661/ccc/c33/661cccc339a3c970448232.pdf); the hexadecimal colours are the digital rendering specified for this project. The flag is drawn once with this helper wherever Kitty's suit appears, never mirrored when facing changes. Postcards include the drawn patch. No flag bitmap or emoji flag is used. Friends have no patch. Flags are never floor surfaces, damaged props or joke material. The `FLAGS` registry can accommodate future country choices; only Bangladesh and no patch ship now.

## What is simplified

Resource points, Sunshine cells, growth/recycling rates, badge bonuses, short repairs, card consequences and the six-second message countdown are invented. Food grows unrealistically fast to fit five sols. Real missions carry stored food and backup life support. The Shielding meter mixes shelter preparation and mass; 100 never means complete protection. Sunlight values are illustrative, not fitted to instrument readings. Starting reserves (Battery 70, Air 55, Water 72, Food 28, Shielding 12, Spirit 70), 14 recovered water per recycler cell, weather probabilities, panel dust, team bonuses, seeded odds and star targets are tuned learning rules. A leak repair uses 8 Battery points; Sunshine cells are a separate daily budget.

Radiation is invisible in the art. The crew goes indoors before equipment work; sensors become optional once the training alert starts. The sick-crewmate card uses a trained onboard care plan without diagnoses, drugs or dosages. Meteor Dodge is an arcade simulator, not a measured meteor forecast.

## Run, edit and deploy

No build step, dependency installation, new library or remote asset is required to play. ES modules need an HTTP server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open [http://localhost:8000](http://localhost:8000). Edit, save and refresh. Control+C stops the server. For static deployment, use **`dist` as the site root**, not the repository root.

| File | Purpose |
| --- | --- |
| `dist/strings.js` | UI, cards, jokes, facts, sources, teacher copy and legacy story/training text in one translation home. |
| `dist/outpost-engine.js` | Pure planning, choices, perks, save validation, rocks and bonus-game rules. |
| `dist/outpost.js`, `outpost.css` | Outpost screens, narration, controls, reports, appearance and postcards. |
| `dist/nasa-data.js`, `data/donki-events.json` | Dated real events, bounded requests, caching and fallbacks. |
| `dist/base-design.js`, `landing-sites.js`, `mission-link.js`, `outpost-setup.js` | Grid/site rules, validated share settings and accessible setup views. |
| `dist/assets/mars-viking.jpg` | Credited, offline NASA/JPL/USGS Mars map. |
| `dist/art.js` | Existing canvas style plus water-wall state, suits, stickers, rocks and Dhrubo’s spin. |
| `dist/app.js`, `story.js`, `story-engine.js` | Original arrival story. |
| `dist/classic/` | Original training with bug fixes, linked facts and perks. |
| `dist/journey.js` | Story-to-training save bridge, intro/resume routing and read-only outpost scene direction. |
| `dist/flags.js` | Shared flag geometry, SVG credits, validated flag choices and profile reading. |
| `dist/compat.js`, `sw.js` | Safari fallback, voice readiness, shared accessibility preferences and offline caching. |

`LANGUAGES` in `strings.js` currently contains English. Add a locale for `ui`, `cards`, `facts`, `sites`, `jokes`, `rocks` and `legacy`; missing keys fall back to English. Older UI templates are collected as `LEGACY` entries: preserve HTML tags, interpolation order, identifiers and URLs. Static HTML retains readable English fallback text and `localizeStatic()` applies registered translations. No second language is claimed complete.

## Saves, narration and offline play

Training and original story save keys are preserved. The existing `astro-kitty-story-v2` record also remembers whether the opening was seen and the latest training chapter, so switching adventures does not lose that checkpoint. Voice, caption and reduced-motion changes made in the story are shared through the existing profile. Other retained keys are `astro-kitty-outpost-v1` (exact state/choices/countdown), `astro-kitty-profile-v1` (appearance/accessibility), and `astro-kitty-donki-v1` (weather cache). Outpost save shape v3 adds site, layout and storm goal. Versions 1/2 migrate without changing saved resources, logs, random state or pending replies; they get Dhrubo’s map/Gale and keep their earlier resource/layout rules and 40-point storm goal. Invalid new fields are repaired. A new replay uses the current rules version. Progress is browser/origin local and does not sync between localhost and different hosts. Storage denial leaves the current visit playable.

Dhrubo waits for available English voices, with a bounded fallback if `voiceschanged` never arrives. Captions work without voice. Audio quality and offline voice availability depend on the device; no microphone or camera is requested.

On HTTPS or localhost, a service worker caches game, training, teacher and archive files after the first online visit. Wait for **Offline ready** in the menu. A first visit without a previously cached copy cannot work offline. Some private-host sign-in steps still need a connection. No Google Fonts or other external asset is required. Postcards download locally; there are no analytics, personal-data uploads or callsign transmission to NASA.

## More fun and accessibility

Five nearby-only hidden rocks have facts and an accessible guided-find button. Dhrubo has ten jokes, idle reactions and a celebration spin. Tap Kitty three times to purr. Training and outpost stars unlock suits/stickers; Mission Patches unlock a moon sticker. Export a postcard with a callsign. Meteor Dodge supports arrows/A/D and touch/tap steering, three lives and a gentle speed.

Outpost decisions have no failure clock. Controls have 44px button targets, labelled meters, native focus-trapping dialogs, subtitles, big text and reduced motion. Shared preferences also apply to training and the prologue. The teacher page supports paired play.

## Tests and limitations

Run `npm test` with Node.js. [QA_REPORT.md](QA_REPORT.md) records the current test total, 135,000 balance simulations (including every site/tier at both layout extremes and 5,000 paired new-perk/baseline runs), six full browser playthroughs at 1366×860 and 375×760, 360px/big-text checks, and limits. NASA was unavailable in browser QA, so archived data was labelled honestly; success/quiet/unknown-class/cache/timeout paths use mocked-fetch tests. Physical older Safari/iPads/Windows, screen-reader speech, device voice quality and a fully disconnected HTTPS reload remain untested. Optional Moon mode is not implemented.


See [docs/PRESENTATION.md](docs/PRESENTATION.md) for the editable demo script/slide outline and [CHANGED_FILES.md](CHANGED_FILES.md) for every changed file in this update.
