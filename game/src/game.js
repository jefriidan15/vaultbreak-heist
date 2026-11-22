// Vaultbreak — Midnight Heist: game state and rules.
// States: title -> playing -> won | caught. The thief must grab the
// Midnight Diamond from the vault, then slip out the south door. Every
// second a guard or camera holds you in its cone, the alarm climbs;
// unseen, it slowly falls. At 100 the heist is over.
import {
  PLAYER_START,
  PLAYER,
  VAULT_LOOT,
  BAGS,
  TOOLS,
  VISION,
} from './config.js';
import {
  makeGuards,
  makeCameras,
  updateGuard,
  updateCamera,
  guardSeesPlayer,
  cameraSeesPlayer,
  moveCircle,
  atExit,
} from './level.js';

export const STATES = { TITLE: 'title', PLAYING: 'playing', WON: 'won', CAUGHT: 'caught' };

export class Game {
  constructor(sound) {
    this.sound = sound;
    this.reset();
  }

  reset() {
    this.state = STATES.TITLE;
    this.player = { x: PLAYER_START.x, y: PLAYER_START.y, radius: PLAYER.radius, angle: -Math.PI / 2 };
    this.moveTarget = null;
    this.guards = makeGuards();
    this.cameras = makeCameras();
    this.alarm = 0;
    this.time = 0;
    this.loot = 0;
    this.vaultTaken = false;
    this.bags = BAGS.map((b) => ({ ...b, taken: false }));
    this.smokeCharges = TOOLS.smokeCharges;
    this.decoyCharges = TOOLS.decoyCharges;
    this.smokes = []; // {x, y, t}
    this.decoys = []; // {x, y, t}
    this.seen = false; // anyone has eyes on the thief this frame
    this.seenBy = '';
    this.spottedFlash = 0;
    this.message = '';
    this.messageT = 0;
    this.steps = 0;
    this.score = 0;
    this.paused = false;
  }

  start() {
    this.reset();
    this.state = STATES.PLAYING;
    this.say('Grab the Midnight Diamond, then reach the exit.');
    this.sound.ensure();
    this.sound.click();
  }

  say(text, secs = 3.5) {
    this.message = text;
    this.messageT = secs;
  }

  blindAt(x, y) {
    return this.smokes.some((s) => (x - s.x) ** 2 + (y - s.y) ** 2 < TOOLS.smokeRadius ** 2);
  }

  dropSmoke() {
    if (this.state !== STATES.PLAYING) return;
    if (this.smokeCharges <= 0) {
      this.say('No smoke left!');
      return;
    }
    this.smokeCharges -= 1;
    this.smokes.push({ x: this.player.x, y: this.player.y, t: TOOLS.smokeSecs });
    this.sound.smoke();
    this.say('Smoke out — eyes off you for a few seconds.');
  }

  throwDecoy(x, y) {
    if (this.state !== STATES.PLAYING) return;
    if (this.decoyCharges <= 0) {
      this.say('No decoys left!');
      return;
    }
    this.decoyCharges -= 1;
    this.decoys.push({ x, y, t: 4 });
    // The nearest guard walks over to check the noise.
    let best = null;
    let bestD = Infinity;
    for (const g of this.guards) {
      const d = (g.x - x) ** 2 + (g.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = g;
      }
    }
    if (best) best.investigate = { x, y, t: 3 };
    this.sound.decoy();
    this.say('Decoy coin tossed — a guard goes to look.');
  }

  update(dt, input) {
    if (this.state === STATES.TITLE) {
      if (input.wasPressed('enter') || input.wasPressed(' ') || input.consumeClick()) this.start();
      return;
    }
    if (this.state === STATES.WON || this.state === STATES.CAUGHT) {
      if (input.wasPressed('r') || input.wasPressed('enter') || input.consumeClick()) this.start();
      return;
    }

    // --- global keys -----------------------------------------------------
    if (input.wasPressed('p')) {
      this.paused = !this.paused;
      this.say(this.paused ? 'Paused — press P to keep going.' : 'Back to the heist.');
      return;
    }
    if (this.paused) return;
    if (input.wasPressed('m')) {
      this.sound.enabled = !this.sound.enabled;
      this.say(this.sound.enabled ? 'Sound on.' : 'Sound off.');
    }
    if (input.wasPressed('r')) {
      this.start();
      return;
    }
    if (input.wasPressed('e')) this.dropSmoke();
    if (input.wasPressed('q')) this.throwDecoy(input.mouse.x, input.mouse.y);

    // --- movement --------------------------------------------------------
    this.time += dt;
    const mv = input.moveVector();
    if (mv.x !== 0 || mv.y !== 0) {
      this.moveTarget = null;
      this.player.angle = Math.atan2(mv.y, mv.x);
      moveCircle(this.player, mv.x * PLAYER.speed * dt, mv.y * PLAYER.speed * dt);
      this.steps += Math.hypot(mv.x, mv.y) * dt;
      if (this.steps > 0.35) {
        this.steps = 0;
        this.sound.step();
      }
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.player.x;
      const dy = this.moveTarget.y - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) {
        this.moveTarget = null;
      } else {
        this.player.angle = Math.atan2(dy, dx);
        moveCircle(this.player, (dx / d) * PLAYER.speed * dt, (dy / d) * PLAYER.speed * dt);
      }
    }
    const click = input.consumeClick();
    if (click && click.y > 84) this.moveTarget = click;

    // --- smoke / decoy timers --------------------------------------------
    for (const s of this.smokes) s.t -= dt;
    this.smokes = this.smokes.filter((s) => s.t > 0);
    for (const d of this.decoys) d.t -= dt;
    this.decoys = this.decoys.filter((d) => d.t > 0);

    // --- patrols and cameras ---------------------------------------------
    const alertBoost = this.alarm >= 60;
    for (const g of this.guards) updateGuard(g, dt, this.time, alertBoost);
    for (const c of this.cameras) updateCamera(c, dt);

    // --- detection ---------------------------------------------------------
    this.seen = false;
    this.seenBy = '';
    let rise = 0;
    for (const g of this.guards) {
      const rate = guardSeesPlayer(g, this.player.x, this.player.y, this.blindAt(g.x, g.y));
      if (rate > 0) {
        rise += rate;
        this.seen = true;
        this.seenBy = g.name;
        g.lastSeen = { x: this.player.x, y: this.player.y };
      }
    }
    for (const c of this.cameras) {
      const rate = cameraSeesPlayer(c, this.player.x, this.player.y, this.blindAt(c.x, c.y));
      if (rate > 0) {
        rise += rate;
        this.seen = true;
        this.seenBy = c.name;
      }
    }
    if (rise > 0) {
      if (!this._wasSeen) this.sound.spotted();
      this.alarm = Math.min(100, this.alarm + rise * dt);
      this.spottedFlash = Math.max(this.spottedFlash, 0.25);
    } else {
      this.alarm = Math.max(0, this.alarm - VISION.decayPerSec * dt);
    }
    this._wasSeen = this.seen;
    if (this.spottedFlash > 0) this.spottedFlash -= dt;
    if (this.messageT > 0) this.messageT -= dt;

    // --- loot ---------------------------------------------------------------
    if (!this.vaultTaken) {
      const d = Math.hypot(this.player.x - VAULT_LOOT.x, this.player.y - VAULT_LOOT.y);
      if (d < VAULT_LOOT.r + this.player.radius) {
        this.vaultTaken = true;
        this.loot += VAULT_LOOT.value;
        this.sound.vault();
        this.say('The Midnight Diamond is yours! Now get out — south door.');
      }
    }
    for (const b of this.bags) {
      if (b.taken) continue;
      const d = Math.hypot(this.player.x - b.x, this.player.y - b.y);
      if (d < b.r + this.player.radius) {
        b.taken = true;
        this.loot += b.value;
        this.sound.pickup();
        this.say(`+${b.value} loot stashed.`);
      }
    }

    // --- win / lose ----------------------------------------------------------
    if (this.alarm >= 100) {
      this.state = STATES.CAUGHT;
      this.score = this.loot;
      this.sound.caught();
      return;
    }
    if (this.vaultTaken && atExit(this.player.x, this.player.y)) {
      this.state = STATES.WON;
      const timeBonus = Math.max(0, 3000 - Math.floor(this.time) * 10);
      this.score = this.loot + timeBonus;
      this.sound.win();
    }
  }
}
