// Vaultbreak — Midnight Heist: bootstrap and the frame loop.
// Fixed-timestep updates, requestAnimationFrame rendering, and a small
// debug handle (window.__vaultbreak) used by the maker's own playtests to
// drive the thief, set the alarm and jump between screens.
import { VIEW } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { Game } from './game.js';
import { render } from './render.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.w;
canvas.height = VIEW.h;
const ctx = canvas.getContext('2d');

const sound = new SoundBank();
const input = new Input(canvas);
const game = new Game(sound);

let last = performance.now();
let elapsed = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  elapsed += dt;
  game.update(dt, input);
  render(ctx, game, elapsed);
  requestAnimationFrame(frame);
}

// Debug handle for scripted playtests (screenshots, win/lose paths).
// Not a cheat for players: it only exists so the maker can test states.
window.__vaultbreak = {
  game,
  input,
  start() {
    game.start();
  },
  teleport(x, y) {
    game.player.x = x;
    game.player.y = y;
    game.moveTarget = null;
  },
  setAlarm(v) {
    game.alarm = v;
  },
  state() {
    return {
      state: game.state,
      alarm: Math.round(game.alarm * 10) / 10,
      loot: game.loot,
      vaultTaken: game.vaultTaken,
      time: Math.round(game.time * 10) / 10,
      player: { x: Math.round(game.player.x), y: Math.round(game.player.y) },
      score: game.score,
    };
  },
};

// URL shot presets for the maker's screenshots: ?shot=title|play|alarm|win|caught
const shot = new URLSearchParams(location.search).get('shot');
if (shot === 'play' || shot === 'alarm' || shot === 'win' || shot === 'caught') {
  game.start();
  if (shot === 'play') {
    game.player.x = 640;
    game.player.y = 480;
    game.alarm = 34;
  } else if (shot === 'alarm') {
    game.player.x = 700;
    game.player.y = 300;
    game.alarm = 82;
  } else if (shot === 'win') {
    game.vaultTaken = true;
    game.loot = 6500;
    game.time = 96;
    game.state = 'won';
    game.score = 6500 + Math.max(0, 3000 - 96 * 10);
  } else if (shot === 'caught') {
    game.alarm = 100;
    game.state = 'caught';
    game.score = game.loot;
  }
}

requestAnimationFrame(frame);
