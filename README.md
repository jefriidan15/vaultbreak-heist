# Vaultbreak — Midnight Heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/jefriidan15/vaultbreak-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/jefriidan15/vaultbreak-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A complete, original top-down heist game that plays offline in a desktop browser. One vault, three guards, two cameras, one diamond — and an alarm meter that decides whether you walk out rich or get caught.

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop Chrome:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

No network request, no libraries, no assets: all art is drawn in code and all sounds are synthesised with WebAudio.

## The heist

- **The room:** one vault floor with three routes in — the west gallery, the central hall, the east service duct. Walls block sight as well as movement, so cover is real.
- **The crew watching you:** three guards (Rook, Bishop, Knight) on fixed patrol loops with yellow vision cones, and two wall cameras sweeping red arcs. Being seen raises the **ALARM** meter; unseen, it slowly cools down. At 100% you are caught.
- **The loot:** the Midnight Diamond ($5,000) in the gold vault, plus three coin bags ($500 each) tucked off the main route.
- **The tools:** 3 smoke puffs (`E`) that blind every eye in a radius, and 2 decoy coins (`Q`, thrown at the mouse) that pull the nearest guard away to investigate. Both are limited — spend them where they count.
- **The getaway:** grab the diamond, then reach the green EXIT door in the south wall. Score is loot plus a time bonus.

## Controls

| Key | Action |
| --- | --- |
| WASD / arrows | Move |
| Mouse click | Walk to a point |
| E | Drop a smoke puff |
| Q | Throw a decoy coin at the mouse |
| P | Pause |
| R | Restart |
| M | Sound on/off |
| Enter | Start / play again |

## Layout

- `main.ts` — the hand-in program (Node 22, stdlib only): copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `vendor/makefun-game.ts` — make.fun's dossier library, copied from the kit unchanged.
- `game/index.html` — the page; `game/src/` holds one file per job: `config.js` (floor plan + tuning), `level.js` (geometry, patrols, cameras, sight), `game.js` (state + rules), `render.js` (all drawing), `input.js` (keyboard + mouse), `audio.js` (synthesised sounds), `main.js` (loop + playtest hooks).
- `screenshots/` — real renders of the game's own code, taken in headless Chrome at 1280×720.

## License

MIT — see [LICENSE](LICENSE).
