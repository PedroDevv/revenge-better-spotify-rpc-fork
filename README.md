# Better Spotify RPC for Revenge

A Spotify-first Revenge Mobile plugin that replaces the plain profile presence with a richer animated music panel.

## Features

- Spotify-only live profile card.
- Album-art inspired profile tint while music is playing.
- Dynamic Apple Music-style color bands generated from the current track.
- Live seekbar based on Discord's Spotify timestamps.
- Queue preview when Discord exposes next-track data to the client.
- Synced lyric lines from LRCLIB when lyrics are available.
- Settings toggles for profile tint, queue preview, and lyrics.

## Build

```powershell
cd C:\Users\rbxsu\OneDrive\Documents\revenge-better-spotify-rpc\js
npm install
npm run build
```

The installable plugin files are written to:

```text
C:\Users\rbxsu\OneDrive\Documents\revenge-better-spotify-rpc\js\build\revenge
```

## Install In Revenge

1. Host the `js\build\revenge` folder somewhere Revenge can access over HTTPS.
2. Make sure these two URLs load in a browser:
   - `https://your-host.example/manifest.json`
   - `https://your-host.example/index.js`
3. Open Discord with Revenge.
4. Go to Revenge settings, then Plugins.
5. Add a plugin by URL and paste the URL to the hosted `manifest.json`.
6. Enable Better Spotify RPC and restart Discord if the card does not appear immediately.

For local testing, you can temporarily serve the folder from your PC:

```powershell
cd C:\Users\rbxsu\OneDrive\Documents\revenge-better-spotify-rpc\js\build\revenge
npx http-server -p 8787
```

Your phone must be on the same network, and Revenge must be able to reach `http://YOUR_PC_IP:8787/manifest.json`. Some Revenge installs require HTTPS for remote plugin URLs, so use a static host such as GitHub Pages, Cloudflare Pages, or Netlify for normal installation.

## Notes

Discord's mobile Spotify store reliably exposes the current song and timestamps. Queue data is shown only when the current Discord build exposes it, and lyrics depend on LRCLIB having synced lyrics for the track.
