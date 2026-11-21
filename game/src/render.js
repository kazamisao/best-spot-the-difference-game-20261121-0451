// Everything the player sees: header, the two panels, markers, flashes
// and the title / pause / end screens. render(ctx, game) draws one frame
// from the game state main.js owns; it never mutates that state.
import { CONFIG } from './config.js';
import { drawScene } from './world.js';

const P = CONFIG.palette;
const { left, right } = CONFIG.panels;

function text(ctx, str, x, y, font, color, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawHeader(ctx, game) {
  const st = game.levelState;
  text(ctx, 'AFTER HOURS AT THE MUSEUM', 20, 24, '700 22px Georgia, serif', P.paper);
  const level = game.level;
  text(ctx, `Room ${game.levelIndex + 1} of 3 — ${level.name}`, 20, 50, '15px Georgia, serif', P.muted);
  if (st) {
    const found = st.found.length;
    const total = level.diffs.length;
    text(ctx, `FOUND ${found}/${total}`, 660, 26, '700 24px Georgia, serif', found === total ? P.gold : P.paper);
    const low = st.secondsLeft <= 20 && game.screen === 'playing';
    text(ctx, fmtTime(st.secondsLeft), 900, 26, '700 24px Georgia, serif', low ? P.coral : P.paper);
    const shown = game.screen === 'levelDone' || game.screen === 'gameDone'
      ? game.totalScore
      : game.totalScore + st.score;
    text(ctx, `SCORE ${shown}`, 1060, 26, '700 18px Georgia, serif', P.paper);
    text(ctx, `HINTS ${st.hintsLeft}  (H)`, 1060, 50, '15px Georgia, serif', P.muted);
    // Time bar under the header.
    const limit = CONFIG.levels[game.levelIndex].seconds;
    const frac = Math.max(0, st.secondsLeft / limit);
    ctx.fillStyle = P.nightDeep;
    ctx.fillRect(660, 44, 360, 8);
    ctx.fillStyle = low ? P.coral : P.teal;
    ctx.fillRect(660, 44, 360 * frac, 8);
  } else {
    text(ctx, 'SCORE 0', 1060, 26, '700 18px Georgia, serif', P.paper);
  }
}

function drawPanelFrame(ctx, origin, label) {
  ctx.strokeStyle = P.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(origin.x - 3, origin.y - 3, 606, 566);
  ctx.fillStyle = P.gold;
  ctx.beginPath();
  ctx.arc(origin.x + 18, origin.y + 18, 15, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, label, origin.x + 18, origin.y + 18, '700 16px Georgia, serif', P.ink, 'center');
}

function drawMarker(ctx, origin, diff, nowMs, bornMs) {
  const age = (nowMs - bornMs) / 1000;
  const pulse = age < 0.6 ? 1 + 0.25 * Math.sin((age / 0.6) * Math.PI) : 1;
  const r = diff.r * pulse;
  ctx.strokeStyle = P.gold;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(origin.x + diff.x, origin.y + diff.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(245,185,66,0.45)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(origin.x + diff.x, origin.y + diff.y, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  // A small tick at the ring's top so a find reads as done, not circled.
  ctx.strokeStyle = P.gold;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const cx = origin.x + diff.x;
  const cy = origin.y + diff.y - r - 12;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy);
  ctx.lineTo(cx - 1, cy + 6);
  ctx.lineTo(cx + 8, cy - 6);
  ctx.stroke();
}

function drawPanels(ctx, game) {
  const changed = new Set(game.level.diffs.map((d) => d.id));
  ctx.save();
  ctx.translate(left.x, left.y);
  drawScene(ctx, game.level.id, new Set());
  ctx.restore();
  ctx.save();
  ctx.translate(right.x, right.y);
  drawScene(ctx, game.level.id, changed);
  ctx.restore();
  drawPanelFrame(ctx, left, 'A');
  drawPanelFrame(ctx, right, 'B');

  // Found markers on both panels.
  const st = game.levelState;
  if (st) {
    for (const id of st.found) {
      const diff = game.level.diffs.find((d) => d.id === id);
      const born = game.findBorn[id] ?? 0;
      drawMarker(ctx, left, diff, game.nowMs, born);
      drawMarker(ctx, right, diff, game.nowMs, born);
    }
    // Hint: a soft pulsing ring around the area, never the exact spot.
    if (game.hint && game.nowMs < game.hint.until) {
      const d = game.hint.diff;
      const pulse = 1 + 0.08 * Math.sin(game.nowMs / 180);
      for (const origin of [left, right]) {
        ctx.strokeStyle = 'rgba(245,185,66,0.9)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(origin.x + d.x, origin.y + d.y, (d.r + 20) * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    // Wrong-click flashes: a red cross that fades fast.
    for (const f of game.flashes) {
      const age = (game.nowMs - f.born) / 600;
      if (age >= 1) continue;
      ctx.strokeStyle = `rgba(228,87,46,${1 - age})`;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const ox = f.panel === 'right' ? right.x : left.x;
      const oy = f.panel === 'right' ? right.y : left.y;
      const x = ox + f.x;
      const y = oy + f.y;
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 12);
      ctx.lineTo(x + 12, y + 12);
      ctx.moveTo(x + 12, y - 12);
      ctx.lineTo(x - 12, y + 12);
      ctx.stroke();
    }
    // Score popups that rise and fade above each fresh find.
    for (const f of game.floaters) {
      const age = (game.nowMs - f.born) / 900;
      if (age >= 1) continue;
      const ox = f.panel === 'right' ? right.x : left.x;
      const oy = f.panel === 'right' ? right.y : left.y;
      text(ctx, f.text, ox + f.x, oy + f.y - 34 - age * 26, '700 20px Georgia, serif', `rgba(245,185,66,${1 - age})`, 'center');
    }
  }
}

function drawFooter(ctx) {
  text(
    ctx,
    'Click a difference on either picture  •  H hint  •  P pause  •  M sound  •  Wrong click costs 5 seconds',
    640, 684, '15px Georgia, serif', P.muted, 'center',
  );
}

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(10,16,34,${alpha})`;
  ctx.fillRect(0, 0, CONFIG.canvas.w, CONFIG.canvas.h);
}

function drawTitle(ctx, game) {
  overlay(ctx, 0.82);
  text(ctx, 'AFTER HOURS', 640, 190, '700 64px Georgia, serif', P.paper, 'center');
  text(ctx, 'AT THE MUSEUM', 640, 258, '700 64px Georgia, serif', P.gold, 'center');
  text(ctx, 'Three rooms. Seven differences in each. Find them before the clock runs out.', 640, 330, '19px Georgia, serif', P.paper, 'center');
  text(ctx, '1  Fossil Gallery      2  Mask Room      3  Planetarium', 640, 380, '17px Georgia, serif', P.muted, 'center');
  text(ctx, 'Click or press Enter to begin the night shift', 640, 450, '700 20px Georgia, serif', P.lamp, 'center');
  text(ctx, 'Mouse to hunt  •  H hint  •  P pause  •  M sound', 640, 500, '16px Georgia, serif', P.muted, 'center');
}

function drawPaused(ctx) {
  overlay(ctx, 0.7);
  text(ctx, 'PAUSED', 640, 330, '700 52px Georgia, serif', P.paper, 'center');
  text(ctx, 'Press P or click to carry on', 640, 395, '19px Georgia, serif', P.muted, 'center');
}

function drawLevelDone(ctx, game) {
  overlay(ctx, 0.72);
  text(ctx, 'ROOM CLEARED', 640, 250, '700 52px Georgia, serif', P.gold, 'center');
  text(ctx, `${game.level.name} — all 7 differences found`, 640, 310, '20px Georgia, serif', P.paper, 'center');
  text(ctx, `Time bonus +${game.levelBonus}   •   Room score ${game.levelState.score + game.levelBonus}`, 640, 360, '19px Georgia, serif', P.paper, 'center');
  text(ctx, game.levelIndex + 1 < 3 ? 'Click or press Enter for the next room' : 'Click or press Enter for the final tally', 640, 430, '700 20px Georgia, serif', P.lamp, 'center');
}

function drawGameDone(ctx, game) {
  overlay(ctx, 0.82);
  text(ctx, 'THE MUSEUM IS YOURS', 640, 260, '700 48px Georgia, serif', P.gold, 'center');
  text(ctx, 'Every difference in every room, found.', 640, 320, '20px Georgia, serif', P.paper, 'center');
  text(ctx, `FINAL SCORE  ${game.totalScore}`, 640, 380, '700 26px Georgia, serif', P.paper, 'center');
  text(ctx, 'Press Enter to walk the halls again', 640, 450, '19px Georgia, serif', P.lamp, 'center');
}

function drawTimeUp(ctx, game) {
  overlay(ctx, 0.72);
  text(ctx, "TIME'S UP", 640, 280, '700 52px Georgia, serif', P.coral, 'center');
  text(ctx, 'The night guard caught you still staring.', 640, 340, '20px Georgia, serif', P.paper, 'center');
  text(ctx, `You found ${game.levelState.found.length} of 7 in ${game.level.name}.`, 640, 380, '19px Georgia, serif', P.paper, 'center');
  text(ctx, 'Click or press Enter to try this room again', 640, 450, '700 20px Georgia, serif', P.lamp, 'center');
}

export function render(ctx, game) {
  ctx.fillStyle = P.night;
  ctx.fillRect(0, 0, CONFIG.canvas.w, CONFIG.canvas.h);
  drawHeader(ctx, game);
  if (game.screen !== 'title') drawPanels(ctx, game);
  drawFooter(ctx);
  if (game.screen === 'title') drawTitle(ctx, game);
  if (game.screen === 'paused') drawPaused(ctx);
  if (game.screen === 'levelDone') drawLevelDone(ctx, game);
  if (game.screen === 'gameDone') drawGameDone(ctx, game);
  if (game.screen === 'timeUp') drawTimeUp(ctx, game);
}
