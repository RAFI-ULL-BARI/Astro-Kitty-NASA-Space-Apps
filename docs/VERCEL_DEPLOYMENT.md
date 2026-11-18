# Deploy Astro Kitty on Vercel

The deployed game is static HTML/CSS/JavaScript, built from JavaScript and selected TypeScript modules. Vercel serves it directly; Python is only a convenience for playing locally. No Python runtime or server function is required for hosting this version.

## Import from Git

1. Import this GitHub repository into Vercel and keep the Root Directory at the repository root.
2. Use Framework Preset: **Other**.
3. Set the Install Command to `npm ci --include=dev`, the Build Command to `npm run build` and the Output Directory to `dist`.
4. Deploy, then open the resulting HTTPS address.

Do not add a catch-all rewrite to index.html. This game has multiple real HTML pages, including academy.html, outpost.html and teacher.html.

## Check the deployment

- The root address opens A new home on Mars.
- Earth Academy opens, its movie plays, and Skip arrival reaches the five labs.
- Fly to Mars shows the new preview and then the mission planner.
- Mars base opens its setup page.
- Sound can be muted and the preference follows navigation.

Progress is saved in the player's current browser. It is not shared across devices. The game includes bundled science data as a fallback if live NASA requests are unavailable. After deployment, test the game on the phones and tablets your audience will use.

The service worker response is configured to revalidate, helping the browser discover updates. The app's existing versioned assets and offline cache are retained.

Official guidance:
https://vercel.com/docs/builds/configure-a-build
https://vercel.com/docs/project-configuration/vercel-json
