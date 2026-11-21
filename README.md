# After Hours at the Museum

A spot-the-difference game. The museum is closed, the lights are low, and
someone has been rearranging the rooms. Find seven differences between the
two pictures of each room before the clock runs out.

## How to play

- **Click** a difference on either picture to ring it in gold. Found
  differences stay marked on both pictures.
- **Wrong clicks cost 5 seconds** and break your combo.
- **Quick finds in a row build a combo** — each step pays +50 points.
- **H** spends one of your three hints: a golden ring pulses around the
  area of a difference still hiding (never the exact spot), for 5 seconds
  of clock.
- **P** pauses, **M** toggles sound, **Enter** starts and moves on.

Three rooms, seven differences each, and the clock gets shorter every room:

1. **Fossil Gallery** — 120 seconds
2. **Mask Room** — 100 seconds
3. **Planetarium** — 90 seconds

Clearing a room pays a time bonus of 10 points per second left.

## Play it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No network needed:
every picture is drawn by the game's own code, every sound is synthesized
with WebAudio, and there are no external files at all.

## Screenshots

The three screenshots in `screenshots/` are real renders of the game in a
browser, staged with the game's own `?shot=` parameter:

- `1-play.jpg` — a room mid-hunt, three differences found, four still hiding
- `2-start.jpg` — the title screen
- `3-end.jpg` — a room cleared, every difference ringed in gold

## Layout

- `game/index.html` — the page: one canvas, one module script
- `game/src/config.js` — canvas size, panel geometry, palette, level limits
- `game/src/differences.js` — the three rooms and their seven differences
- `game/src/logic.js` — pure level state: finds, misses, combo, hints, clock
- `game/src/world.js` — the museum rooms, painted in code
- `game/src/render.js` — header, panels, markers, and the screens
- `game/src/input.js` — mouse and keyboard input
- `game/src/audio.js` — WebAudio sounds, synthesized, no files
- `game/src/shots.js` — `?shot=start|play|end&seed=N` screenshot staging
- `game/src/main.js` — boot, game loop, and screen flow
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` with the vendored make.fun library
- `serve.ts` — a tiny static server for local play

## Tests

```sh
node --test test/test_entry.mjs
```

The suite covers the difference tables (seven per room, inside the panel,
no two overlapping), hit-testing, the miss penalty, combo scoring, hints,
and the clock.
