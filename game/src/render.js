// Vaultbreak — Midnight Heist: everything the player sees.
// Dark vault floor, gold loot glow, yellow guard cones, red camera sweeps,
// and a HUD with the ALARM meter — all in one 1280x720 frame. All art is
// drawn in code; there are no image assets.
import { VIEW, HUD_H, ROOM, WALLS, VAULT_LOOT, EXIT, VISION, TOOLS } from './config.js';
import { STATES } from './game.js';

const TILE = 40;

function conePath(ctx, x, y, angle, range, halfAngle) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
}

export function drawFloor(ctx) {
  // Checkerboard marble, dimmed by the night.
  for (let y = ROOM.y; y < ROOM.y + ROOM.h; y += TILE) {
    for (let x = ROOM.x; x < ROOM.x + ROOM.w; x += TILE) {
      const odd = ((x - ROOM.x) / TILE + (y - ROOM.y) / TILE) % 2 === 0;
      ctx.fillStyle = odd ? '#171a26' : '#141724';
      ctx.fillRect(x, y, TILE, TILE);
    }
  }
  // Faint gold carpet runner down the central hall.
  ctx.fillStyle = 'rgba(212, 175, 55, 0.07)';
  ctx.fillRect(600, ROOM.y, 80, 300);
  // Wall shadows.
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);
}

export function drawWalls(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = '#2c3247';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#3d4560';
    ctx.fillRect(w.x, w.y, w.w, Math.min(4, w.h));
    ctx.fillRect(w.x, w.y, Math.min(4, w.w), w.h);
  }
  // Vault box: gold-trimmed safe.
  ctx.fillStyle = '#8a6d1f';
  ctx.fillRect(595, 112, 90, 56);
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(599, 116, 82, 48);
  ctx.fillStyle = '#6b5316';
  ctx.beginPath();
  ctx.arc(640, 140, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f5d76e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(640, 140, 14, 0, Math.PI * 2);
  ctx.stroke();
  // Exit door: green-lit gap in the south wall.
  ctx.fillStyle = '#1d5c33';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = '#39d98a';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', EXIT.x + EXIT.w / 2, EXIT.y + 34);
}

export function drawLoot(ctx, game, time) {
  // Vault loot: pulsing gold diamond.
  if (!game.vaultTaken) {
    const pulse = 1 + Math.sin(time * 3) * 0.12;
    const glow = ctx.createRadialGradient(
      VAULT_LOOT.x, VAULT_LOOT.y, 4,
      VAULT_LOOT.x, VAULT_LOOT.y, 64 * pulse,
    );
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.55)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(VAULT_LOOT.x, VAULT_LOOT.y, 64 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(VAULT_LOOT.x, VAULT_LOOT.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffe27a';
    ctx.fillRect(-13, -13, 26, 26);
    ctx.strokeStyle = '#fff6c9';
    ctx.lineWidth = 2;
    ctx.strokeRect(-13, -13, 26, 26);
    ctx.restore();
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE MIDNIGHT DIAMOND', VAULT_LOOT.x, VAULT_LOOT.y + 42);
  }
  for (const b of game.bags) {
    if (b.taken) continue;
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5d76e';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', b.x, b.y + 5);
  }
}

export function drawCones(ctx, game) {
  for (const g of game.guards) {
    const blind = game.blindAt(g.x, g.y);
    ctx.fillStyle = blind ? 'rgba(120,120,120,0.10)' : 'rgba(255, 214, 64, 0.16)';
    conePath(ctx, g.x, g.y, g.angle, VISION.guardRange, VISION.guardHalfAngle);
    ctx.fill();
    ctx.strokeStyle = blind ? 'rgba(150,150,150,0.25)' : 'rgba(255, 214, 64, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (const c of game.cameras) {
    const blind = game.blindAt(c.x, c.y);
    ctx.fillStyle = blind ? 'rgba(120,120,120,0.08)' : 'rgba(255, 60, 60, 0.15)';
    conePath(ctx, c.x, c.y, c.angle, c.range, VISION.camHalfAngle);
    ctx.fill();
    ctx.strokeStyle = blind ? 'rgba(150,150,150,0.25)' : 'rgba(255, 60, 60, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function drawCameras(ctx, game) {
  for (const c of game.cameras) {
    ctx.fillStyle = '#20242f';
    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ff4d4d';
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + Math.cos(c.angle) * 18, c.y + Math.sin(c.angle) * 18);
    ctx.stroke();
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.name, c.x, c.y - 18);
  }
}

export function drawGuards(ctx, game) {
  for (const g of game.guards) {
    const blind = game.blindAt(g.x, g.y);
    // Body
    ctx.fillStyle = blind ? '#5a6274' : g.color;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0b0d12';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Facing tick
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * 16, g.y + Math.sin(g.angle) * 16);
    ctx.stroke();
    // Name tag
    ctx.fillStyle = '#e8ecf4';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name, g.x, g.y - 20);
    // "!" when the guard has eyes on the thief; "?" while investigating.
    if (g.investigate) {
      ctx.fillStyle = '#ffd64a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('?', g.x, g.y - 34);
    } else if (game.seen && game.seenBy === g.name) {
      ctx.fillStyle = '#ff4d4d';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('!', g.x, g.y - 34);
    }
    if (g.lastSeen && game.seen) {
      ctx.strokeStyle = 'rgba(255,77,77,0.6)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.lastSeen.x, g.lastSeen.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

export function drawPlayer(ctx, game, time) {
  const p = game.player;
  // Click-to-move target marker.
  if (game.moveTarget) {
    ctx.strokeStyle = 'rgba(57, 217, 138, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(game.moveTarget.x, game.moveTarget.y, 8 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Shadow + body: a hooded thief in midnight green.
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(p.x + 2, p.y + 4, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1f8a4c';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0b3d20';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Hood + mask
  ctx.fillStyle = '#0d2b18';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.angle) * 4 - 2, p.y + Math.sin(p.angle) * 4 - 2, 1.6, 0, Math.PI * 2);
  ctx.arc(p.x + Math.cos(p.angle) * 4 + 2, p.y + Math.sin(p.angle) * 4 + 2, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // Loot sack on the back once the diamond is taken.
  if (game.vaultTaken) {
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(p.x - Math.cos(p.angle) * 12, p.y - Math.sin(p.angle) * 12, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawSmoke(ctx, game) {
  for (const s of game.smokes) {
    const alpha = Math.min(0.5, (s.t / TOOLS.smokeSecs) * 0.5);
    ctx.fillStyle = `rgba(200, 200, 210, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, TOOLS.smokeRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const d of game.decoys) {
    ctx.fillStyle = '#ffd64a';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6d1f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

export function drawHud(ctx, game) {
  ctx.fillStyle = '#0d0f16';
  ctx.fillRect(0, 0, VIEW.w, HUD_H);
  ctx.fillStyle = '#232839';
  ctx.fillRect(0, HUD_H - 2, VIEW.w, 2);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5d76e';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('VAULTBREAK', 16, 30);
  ctx.fillStyle = '#8b93a7';
  ctx.font = '12px sans-serif';
  ctx.fillText('MIDNIGHT HEIST', 16, 48);

  // ALARM meter — the heart of the HUD.
  const ax = 300;
  const ay = 16;
  const aw = 340;
  const ah = 20;
  ctx.fillStyle = '#e8ecf4';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('ALARM', ax, ay + 15);
  ctx.fillStyle = '#1a1e2c';
  ctx.fillRect(ax + 70, ay, aw, ah);
  const frac = game.alarm / 100;
  const grad = ctx.createLinearGradient(ax + 70, 0, ax + 70 + aw, 0);
  grad.addColorStop(0, '#39d98a');
  grad.addColorStop(0.6, '#ffd64a');
  grad.addColorStop(1, '#ff4d4d');
  ctx.fillStyle = grad;
  ctx.fillRect(ax + 70, ay, aw * frac, ah);
  ctx.strokeStyle = '#3d4560';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ax + 70, ay, aw, ah);
  ctx.fillStyle = game.alarm >= 60 ? '#ff4d4d' : '#e8ecf4';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`${Math.floor(game.alarm)}%`, ax + 70 + aw + 10, ay + 15);
  if (game.seen) {
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`SPOTTED by ${game.seenBy}!`, ax + 70, ay + 34);
  } else if (game.alarm > 0) {
    ctx.fillStyle = '#8b93a7';
    ctx.font = '12px sans-serif';
    ctx.fillText('Cooling down — stay out of the cones.', ax + 70, ay + 34);
  }

  // Loot + timer + tools, right side.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f5d76e';
  ctx.font = 'bold 16px sans-serif';
  const diamond = game.vaultTaken ? '◆' : '◇';
  ctx.fillText(`LOOT $${game.loot.toLocaleString()}  ${diamond} DIAMOND`, 1264, 24);
  ctx.fillStyle = '#e8ecf4';
  ctx.font = '14px sans-serif';
  const mm = String(Math.floor(game.time / 60)).padStart(2, '0');
  const ss = String(Math.floor(game.time % 60)).padStart(2, '0');
  ctx.fillText(`TIME ${mm}:${ss}   ·   SMOKE [E] ×${game.smokeCharges}   ·   DECOY [Q] ×${game.decoyCharges}`, 1264, 46);

  // Toast message under the HUD.
  if (game.messageT > 0) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(13, 15, 22, 0.85)';
    const tw = ctx.measureText(game.message).width + 28;
    ctx.fillRect(VIEW.w / 2 - tw / 2, HUD_H + 8, tw, 28);
    ctx.fillStyle = '#ffe27a';
    ctx.font = '14px sans-serif';
    ctx.fillText(game.message, VIEW.w / 2, HUD_H + 27);
  }

  // Red flash while spotted.
  if (game.spottedFlash > 0) {
    ctx.fillStyle = `rgba(255, 40, 40, ${game.spottedFlash * 0.5})`;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  }
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8, 10, 16, 0.78)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText(title, VIEW.w / 2, 250);
  ctx.fillStyle = '#e8ecf4';
  ctx.font = '18px sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, VIEW.w / 2, 310 + i * 32));
}

export function drawTitle(ctx, game) {
  drawFloor(ctx);
  drawWalls(ctx);
  drawLoot(ctx, game, 0);
  drawCones(ctx, game);
  drawCameras(ctx, game);
  drawGuards(ctx, game);
  drawPlayer(ctx, game, 0);
  drawHud(ctx, game);
  overlay(ctx, 'VAULTBREAK', [
    'MIDNIGHT HEIST — one vault, three guards, two cameras, one diamond.',
    'Sneak past the cones, grab the Midnight Diamond, slip out the south door.',
    'WASD / arrows to move · click to walk · E smoke · Q decoy coin',
    'If the ALARM hits 100%, the heist is over.',
    '',
    'Press ENTER or click to start the heist',
  ], '#f5d76e');
}

export function drawEnd(ctx, game, won) {
  drawFloor(ctx);
  drawWalls(ctx);
  drawCones(ctx, game);
  drawCameras(ctx, game);
  drawGuards(ctx, game);
  drawPlayer(ctx, game, 0);
  drawHud(ctx, game);
  const mm = String(Math.floor(game.time / 60)).padStart(2, '0');
  const ss = String(Math.floor(game.time % 60)).padStart(2, '0');
  if (won) {
    overlay(ctx, 'CLEAN GETAWAY!', [
      `You slipped out with $${game.loot.toLocaleString()} in loot in ${mm}:${ss}.`,
      `Score: ${game.score.toLocaleString()}  (loot + time bonus)`,
      '',
      'Press R or ENTER to run it again',
    ], '#39d98a');
  } else {
    overlay(ctx, 'CAUGHT!', [
      'The alarm hit 100% — the vault crew is on you.',
      `Loot stashed: $${game.loot.toLocaleString()} · Time: ${mm}:${ss}`,
      '',
      'Press R or ENTER to try again — learn the patrols',
    ], '#ff4d4d');
  }
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(8, 10, 16, 0.6)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8ecf4';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('PAUSED', VIEW.w / 2, 340);
  ctx.font = '16px sans-serif';
  ctx.fillText('Press P to keep going · R to restart', VIEW.w / 2, 380);
}

export function render(ctx, game, time) {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = '#0b0d12';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  if (game.state === STATES.TITLE) {
    drawTitle(ctx, game);
    return;
  }
  if (game.state === STATES.WON) {
    drawEnd(ctx, game, true);
    return;
  }
  if (game.state === STATES.CAUGHT) {
    drawEnd(ctx, game, false);
    return;
  }
  drawFloor(ctx);
  drawWalls(ctx);
  drawLoot(ctx, game, time);
  drawCones(ctx, game);
  drawSmoke(ctx, game);
  drawCameras(ctx, game);
  drawGuards(ctx, game);
  drawPlayer(ctx, game, time);
  drawHud(ctx, game);
  if (game.paused) drawPaused(ctx);
}
