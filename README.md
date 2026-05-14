# 🐎 Racing Horse Web Game

A fun, interactive browser-based horse racing game with custom SVG cartoon horse characters, physics-based movement, and a vibrant colour scheme.

🌐 **Live site**: https://mingwei-personal.github.io/racing-horse-web-game

🏠 **Internal edition** (fixed team roster): https://mingwei-personal.github.io/racing-horse-web-game/racing-horse-game-internal.html

## Features

- **1–12 Horses**: Pick how many horses compete in each race
- **Custom Names**: Name every horse before the race starts
- **Internal Edition**: Fixed roster of 11 team members (alphabetical order) — toggle each member in or out of the race before it starts
- **Cartoon SVG Horse Heads**: Each horse has a unique hand-drawn SVG face with its own colour palette and facial expression (happy, determined, excited, nervous, cool, surprised, winking, or sleepy)
- **Physics-Based Racing**: Horses move using a velocity model with smooth randomness — no teleporting, no fixed step sizes. Each horse has a random _volatility_ that determines how erratically it runs
- **Dramatic Events**: Rare random bursts of speed or stumbles keep the race unpredictable
- **All Horses Finish**: The race doesn't end until every horse crosses the line, with live placement badges appearing as they finish
- **Live Standings Bar**: Shows finishers in order as the race progresses
- **Animated Gallop**: Horses bob and tilt while running; the winner pulses with a gold glow
- **Full Results Screen**: Final standings with 🥇🥈🥉 medals and each horse's SVG icon
- **Responsive Design**: Works on desktop and mobile

## How to Play

1. **Choose horse count** — enter a number from 1 to 8 and click _Confirm_
2. **Name your horses** — each card shows the horse's SVG face and colour; edit the name or keep the default
3. **Start the Race** — click _Start Race!_ and watch them go
4. **Wait for all finishers** — placement badges appear above each horse as it crosses the line
5. **Check the results** — final standings are shown with medals and horse portraits
6. **Play Again** — click _Play Again_ to reset and run another race

## Technical Details

- **Vanilla HTML / CSS / JavaScript** — zero dependencies, no build step
- **`requestAnimationFrame` loop** with real `dt`-based physics — smooth 60 fps movement, immune to tab-switch pauses
- **Velocity model**: each horse holds a sustained `paceTarget` multiplier for 0.2–0.5 seconds before re-rolling, so speed bursts and lulls are visible rather than averaging out. A small ±10% jitter is applied every frame on top for fluid movement. Base pace `BASE_V = 78` units/sec, floored at `MIN_V = 15`, over a `raceDistance` of 1200 units (~15–25 s races)
- **Event boosts** are applied directly to position (never to velocity) so they can't snowball
- **Inline SVG horse heads** generated entirely in JavaScript — 8 colour palettes × 8 facial expressions, parameterised by `colorIndex`
- **CSS animations**: gallop keyframes on running horses, winner pulse on finish, fade-in on phase transitions
- **Colour palette**: `#2364aa` (deep blue) · `#3da5d9` (sky blue) · `#73bfb8` (teal) · `#fec601` (yellow) · `#ea7317` (orange)

## Running the Game

### Quickest way

Just open `index.html` directly in any modern browser — no server needed.

### Local server (avoids any file:// quirks)

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```

Then open `http://localhost:8000`.

## Deployment

This is a static site — deploy anywhere that serves static files:

- **GitHub Pages**: Settings → Pages → Deploy from branch (`main`, `/root`)
- **Netlify**: Drag and drop the project folder onto the Netlify dashboard
- **Vercel**: Import the GitHub repo; no config required

## File Structure

```
racing-horse-web-game/
├── index.html                      # Public game — choose 1–12 horses, custom names
├── racing-horse-game-internal.html # Internal edition — fixed team roster, toggle members
├── styles.css                      # All styling, animations, responsive layout
├── script.js                       # Game logic — RacingHorseGame class, SVG generation, physics loop
└── README.md                       # This file
```

## Browser Compatibility

Chrome, Firefox, Safari, Edge, and modern mobile browsers.
