# Snake

A small browser-based Snake game with a lightweight Node static server.

## Features

- 20x20 grid gameplay
- Wraparound movement at edges
- Optional obstacle mode
- Keyboard and mobile button controls
- Start overlay with path selection
- Crash countdown (`3`, `2`, `1`) and auto-reset

## Run Locally

### Prerequisites

- Node.js 18+ (or current LTS)

### Start

```bash
npm run dev
```

Then open `http://127.0.0.1:4173`.

### Tests

```bash
npm test
```

## Controls

### Before Start

- `Left` / `Right`: choose mode and start immediately
- `Up` / `Down`: start game

### During Game

- Arrows or `W/A/S/D`: move snake
- `Space`: pause/resume
- `Restart` button: reset to start overlay

## Project Structure

- `/Users/sgp/github/snake/index.html`: app markup and overlays
- `/Users/sgp/github/snake/styles.css`: game and overlay styles
- `/Users/sgp/github/snake/src/main.mjs`: UI loop and input handling
- `/Users/sgp/github/snake/src/snakeLogic.mjs`: core game logic
- `/Users/sgp/github/snake/server.mjs`: static file server
- `/Users/sgp/github/snake/test/snakeLogic.test.mjs`: logic tests
