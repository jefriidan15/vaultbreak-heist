// Vaultbreak — Midnight Heist: the room, its patrols and its watchers.
// Geometry helpers (circle-vs-wall sliding, line-of-sight), guard patrol
// state machines and camera sweeps. Patrols are fixed waypoints, so every
// run plays the same — the heist is a puzzle you can learn, not a dice roll.
import { WALLS, GUARDS, CAMERAS, VISION, EXIT } from './config.js';

// ---- geometry -----------------------------------------------------------

export function circleHitsWall(x, y, r, walls = WALLS) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return w;
  }
  return null;
}

// Move a circle, sliding along walls instead of sticking to them.
export function moveCircle(body, dx, dy) {
  const r = body.radius;
  let nx = body.x + dx;
  if (!circleHitsWall(nx, body.y, r)) body.x = nx;
  let ny = body.y + dy;
  if (!circleHitsWall(body.x, ny, r)) body.y = ny;
}

function segHitsRect(x1, y1, x2, y2, r) {
  // Slab test: does segment (x1,y1)-(x2,y2) cross rect r?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  const axis = (p, d, lo, hi) => {
    if (Math.abs(d) < 1e-9) return p >= lo && p <= hi;
    let t1 = (lo - p) / d;
    let t2 = (hi - p) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    return tmin <= tmax;
  };
  return axis(x1, dx, r.x, r.x + r.w) && axis(y1, dy, r.y, r.y + r.h);
}

export function lineOfSight(x1, y1, x2, y2) {
  for (const w of WALLS) {
    if (segHitsRect(x1, y1, x2, y2, w)) return false;
  }
  return true;
}

function inCone(ox, oy, angle, range, halfAngle, px, py) {
  const dx = px - ox;
  const dy = py - oy;
  const d = Math.hypot(dx, dy);
  if (d > range || d < 1) return { seen: d < 1, dist: d };
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return { seen: Math.abs(diff) <= halfAngle, dist: d };
}

// ---- guards -------------------------------------------------------------

export function makeGuards() {
  return GUARDS.map((g) => ({
    ...g,
    x: g.waypoints[0].x,
    y: g.waypoints[0].y,
    wp: 1,
    wait: 0,
    angle: 0,
    alerted: false,
    // Decoy investigation: null or {x, y, t}
    investigate: null,
    // Last known player position while alerted (used for the "!" marker).
    lastSeen: null,
  }));
}

export function updateGuard(g, dt, time, alertBoost) {
  const speed = g.speed * (alertBoost ? VISION.alertSpeed : 1);
  if (g.investigate) {
    const dx = g.investigate.x - g.x;
    const dy = g.investigate.y - g.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      g.investigate.t -= dt;
      g.angle += dt * 1.5; // look around while investigating
      if (g.investigate.t <= 0) g.investigate = null;
    } else {
      g.angle = Math.atan2(dy, dx);
      moveCircleGuard(g, (dx / d) * speed * dt, (dy / d) * speed * dt);
    }
    return;
  }
  if (g.wait > 0) {
    g.wait -= dt;
    g.angle += dt * 0.9; // scan the room while paused at a waypoint
    return;
  }
  const target = g.waypoints[g.wp];
  const dx = target.x - g.x;
  const dy = target.y - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 4) {
    g.wp = (g.wp + 1) % g.waypoints.length;
    g.wait = 0.8;
    return;
  }
  g.angle = Math.atan2(dy, dx);
  moveCircleGuard(g, (dx / d) * speed * dt, (dy / d) * speed * dt);
}

// Guards never clip through walls on their patrol lanes.
function moveCircleGuard(g, dx, dy) {
  const r = 13;
  if (!circleHitsWall(g.x + dx, g.y, r)) g.x += dx;
  if (!circleHitsWall(g.x, g.y + dy, r)) g.y += dy;
}

export function guardSeesPlayer(g, px, py, blind) {
  if (blind) return 0;
  const c = inCone(g.x, g.y, g.angle, VISION.guardRange, VISION.guardHalfAngle, px, py);
  if (!c.seen) return 0;
  if (!lineOfSight(g.x, g.y, px, py)) return 0;
  // Closer = spotted faster. Returns alarm points per second.
  const t = 1 - c.dist / VISION.guardRange;
  return VISION.farRate + (VISION.nearRate - VISION.farRate) * t;
}

// ---- cameras ------------------------------------------------------------

export function makeCameras() {
  return CAMERAS.map((c) => ({ ...c, angle: c.baseAngle, phase: 0 }));
}

export function updateCamera(c, dt) {
  c.phase += dt * c.speed;
  c.angle = c.baseAngle + Math.sin(c.phase) * c.sweep;
}

export function cameraSeesPlayer(c, px, py, blind) {
  if (blind) return 0;
  const cone = inCone(c.x, c.y, c.angle, c.range, VISION.camHalfAngle, px, py);
  if (!cone.seen) return 0;
  if (!lineOfSight(c.x, c.y, px, py)) return 0;
  return VISION.camRate;
}

// ---- exit ---------------------------------------------------------------

export function atExit(px, py) {
  return px > EXIT.x - 6 && px < EXIT.x + EXIT.w + 6 && py > EXIT.y - 10 && py < EXIT.y + 16;
}
