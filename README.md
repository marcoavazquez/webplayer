# RetroAMP Music Player

A 90's/2000's inspired web music player that plays local audio files from your music directory.

## Features
- **Retro Aesthetic**: Winamp-inspired design with digital fonts, dark themes, and neon highlights.
- **Local Playback**: Scans and plays `.mp3`, `.wav`, `.ogg`, `.flac`, and `.m4a` files from the parent directory (`c:\Users\Marco Antonio\Music`).
- **Graphic Equalizer**: 10-band Web Audio API equalizer.
- **Visualizer**: HTML5 Canvas audio visualizer.
- **Queue System**: Displays all available songs and auto-plays the next track.

## Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [pnpm](https://pnpm.io/) package manager.

## Setup Instructions
1. Clone or locate the folder where the music is located.

2. Install the required dependencies using `pnpm`:
   ```bash
   pnpm install
   ```

3. Start the server:
   ```bash
   pnpm start
   ```
   *(Alternatively, run `node server.js`)*

4. Open your web browser and go to:
   ```
   http://localhost:3000
   ```

## Usage
- The server automatically scans the `Music` directory (`..` relative to this folder) for audio files and populates the playlist.
- Double-click a track in the playlist to start playing.
- Use the transport controls (Play, Pause, Stop, Previous, Next) to control playback.
- Adjust the volume slider or the equalizer bands to modify the audio.

## Disclaimer
This server serves files from your local file system to your network. Do not run this on a public network without adding proper security measures, as it allows network access to your music directory.
