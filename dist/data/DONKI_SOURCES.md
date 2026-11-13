# Primary-source verification for the Astro Kitty polish pass

Checked 7 November 2026. Provenance notes for the bundled archive and this science copy update.

## DONKI archive

All nine source links use the current API’s latest-version format: `https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/{number}/-1`. IDs, times and classes are unchanged. Checked against the requested CCMC migration format on 8 November 2026.

`verified-donki-events.json` contains nine genuine records: four C, two M and three X. It retains all three existing May 2024 rows. Dates, IDs, classes and peak times below are observed primary-source data, not invented examples.

| Activity ID | Class | Peak UTC | Current source |
| --- | --- | --- | --- |
| 2024-05-08T21:08:00-FLR-001 | X1.0 | 2024-05-08T21:40:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30601/-1) |
| 2024-05-09T08:45:00-FLR-001 | X2.2 | 2024-05-09T09:13:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30605/-1) |
| 2024-05-10T06:27:00-FLR-001 | X3.9 | 2024-05-10T06:54:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30666/-1) |
| 2024-01-06T05:28:00-FLR-001 | C3.3 | 2024-01-06T05:37:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/28511/-1) |
| 2024-01-06T05:41:00-FLR-001 | C3.8 | 2024-01-06T05:47:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/28512/-1) |
| 2024-01-06T05:53:00-FLR-001 | C4.1 | 2024-01-06T05:59:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/28513/-1) |
| 2024-01-06T06:06:00-FLR-001 | C4.0 | 2024-01-06T06:15:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/28514/-1) |
| 2023-01-11T00:39:00-FLR-001 | M2.4 | 2023-01-11T00:59:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/23243/-1) |
| 2026-07-04T01:52:00-FLR-001 | M1.2 | 2026-07-04T02:01:00Z | [NASA flare record](https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/47310/-1) |

The C3.3, C4.1 and C4.0 direct flare URLs were observed in the DONKI CME page's actual linked-activity links (numeric IDs 28511, 28513 and 28514); they were not guessed. Their pages timed out or were inaccessible during the check. IDs/classes are readable in that official DONKI CME event page; the official CCMC scoreboard notification additionally supplies all four peak times. The JSON `source` fields preserve those actual observed NASA event links. If a reliably loading source link is preferable, the working CCMC scoreboard `/CMESB-Earth/prediction/detail/2849` explicitly lists all four IDs, classes and peak times.

### Migration and live API limitations

[NASA CCMC's migration announcement](https://ccmc.gsfc.nasa.gov/news/major-updates/) says that, effective 30 September 2026, its public API base changed to `https://ccmc.gsfc.nasa.gov/DONKI-API/get/...`; schemas and input parameters remain the same. The old base was `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/...`. The announcement also says replacing the old `kauai` host with `ccmc` preserves web endpoint paths. Some legacy pages retrieved through the web search cache; other old links redirected to this announcement or timed out. The primary-source records above remain verifiable from NASA pages.

The earlier provenance check could not obtain live JSON from either public FLR endpoint. The v6 loader now tries the NASA gateway first, then keyless CCMC, before using these rows. No successful live JSON response is claimed by that earlier check. The required verification used NASA CCMC event pages and its own reproduced DONKI notification instead.

Do not add a 20 May 2024 playable flare: this research did not establish an exact DONKI FLR ID for the Mars-directed event. Its existence in NASA reporting is not permission to invent an ID.

## Arcadia coordinates

The official [USGS/IAU Gazetteer Feature 348](https://planetarynames.wr.usgs.gov/Feature/348) gives 46.66°N, 192.00°E in its main planetocentric, east-positive coordinate set. The game uses an approximate regional pin at about 47°N, 192°E. It is not a precise landing pad.

## Separate Mars-storm fact

The [NASA 20 May 2024 article](https://www.nasa.gov/solar-system/planets/mars/nasa-watches-mars-light-up-during-epic-solar-storm/) supports the separately dated fact in strings.js. It is not evidence for a 10 May Mars storm. No exact 20 May DONKI ID was established, so no such playable record was invented.
