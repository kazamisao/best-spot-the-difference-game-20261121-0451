// The museum rooms, painted in code: no image files, no network.
// drawScene paints one panel of a level. The left panel is always the
// base room; the right panel passes the same room with every difference
// applied, so the two pictures are near-identical by construction.
import { CONFIG } from './config.js';

const P = CONFIG.palette;

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// A four-point sparkle star, the museum's mural motif.
function sparkle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function roomShell(ctx) {
  rect(ctx, 0, 0, 600, 470, P.wall);
  rect(ctx, 0, 470, 600, 90, P.floor);
  line(ctx, 0, 470, 600, 470, P.nightDeep, 4);
}

// ---- Level 1: Fossil Gallery ------------------------------------------

function drawFossil(ctx, changed) {
  roomShell(ctx);

  // Mural stars across the top of the wall.
  const stars = [[60, 60], [120, 90], [200, 55], [540, 60], [480, 45]];
  for (const [x, y] of stars) {
    if (changed.has('star') && x === 120 && y === 90) continue;
    sparkle(ctx, x, y, 10, P.lamp);
  }

  // Wall lamp on the left.
  drawLamp(ctx, 90, 120);
  // The added lamp only exists on the changed panel.
  if (changed.has('lamp')) drawLamp(ctx, 520, 120);

  // The great fossil: skull, spine, ribs, legs and tail.
  line(ctx, 268, 178, 440, 232, P.bone, 4);
  circle(ctx, 288, 168, 34, P.bone);
  circle(ctx, 316, 160, 12, P.bone);
  circle(ctx, 280, 162, 6, P.ink);
  circle(ctx, 298, 162, 6, P.ink);
  line(ctx, 272, 190, 300, 196, P.bone, 5);
  const spine = [[288, 186], [318, 194], [348, 203], [378, 212], [408, 221], [432, 230]];
  for (const [x, y] of spine) circle(ctx, x, y, 11, P.bone);
  for (let i = 0; i < 5; i++) {
    const x = 302 + i * 28;
    ctx.strokeStyle = P.bone;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, 208, 26, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
  line(ctx, 312, 238, 302, 302, P.bone, 7);
  line(ctx, 362, 244, 356, 302, P.bone, 7);
  line(ctx, 298, 302, 318, 302, P.bone, 7);
  line(ctx, 352, 302, 372, 302, P.bone, 7);
  // Tail: hanging down in the base room, flicked up in the changed one.
  if (changed.has('tail')) {
    line(ctx, 432, 230, 456, 208, P.bone, 8);
    line(ctx, 456, 208, 472, 190, P.bone, 8);
    line(ctx, 472, 190, 482, 176, P.bone, 6);
  } else {
    line(ctx, 432, 230, 454, 250, P.bone, 8);
    line(ctx, 454, 250, 470, 264, P.bone, 8);
    line(ctx, 470, 264, 482, 278, P.bone, 6);
  }

  // Plaque under the fossil: bone-white, or coral on the changed panel.
  rect(ctx, 240, 313, 120, 44, changed.has('plaque') ? P.coral : P.bone);
  rect(ctx, 258, 326, 84, 5, P.ink);
  rect(ctx, 258, 338, 60, 5, P.ink);

  // Framed exhibit poster on the left wall.
  rect(ctx, 48, 268, 92, 118, P.nightDeep);
  ctx.strokeStyle = P.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 268, 92, 118);
  circle(ctx, 94, 312, 18, P.bone);
  line(ctx, 76, 340, 112, 340, P.bone, 4);
  line(ctx, 70, 356, 118, 356, P.muted, 4);
  line(ctx, 78, 368, 110, 368, P.muted, 4);

  // Bench below the plaque, for visitors who stare too long.
  rect(ctx, 228, 420, 144, 12, '#3a2c22');
  rect(ctx, 240, 432, 10, 38, '#3a2c22');
  rect(ctx, 350, 432, 10, 38, '#3a2c22');

  // Floor rock: rolled to a new spot on the changed panel.
  const rockX = changed.has('rock') ? 165 : 95;
  ellipse(ctx, rockX, 500, 34, 20, '#5b6b8c');
  ellipse(ctx, rockX - 8, 494, 14, 9, '#7c8db1');

  // Small bone on the floor, missing on the changed panel.
  if (!changed.has('bone')) {
    line(ctx, 196, 515, 224, 515, P.bone, 7);
    circle(ctx, 194, 515, 6, P.bone);
    circle(ctx, 226, 515, 6, P.bone);
  }

  // Potted plant on the right, with a shadow only on the changed panel.
  if (changed.has('shadow')) ellipse(ctx, 520, 508, 46, 10, 'rgba(5,8,20,0.55)');
  line(ctx, 520, 440, 505, 400, P.green, 6);
  line(ctx, 520, 440, 520, 392, P.green, 6);
  line(ctx, 520, 440, 538, 402, P.green, 6);
  circle(ctx, 505, 398, 12, P.green);
  circle(ctx, 520, 390, 12, P.teal);
  circle(ctx, 538, 400, 12, P.green);
  ctx.fillStyle = P.coral;
  ctx.beginPath();
  ctx.moveTo(498, 440);
  ctx.lineTo(542, 440);
  ctx.lineTo(534, 478);
  ctx.lineTo(506, 478);
  ctx.closePath();
  ctx.fill();
}

function drawLamp(ctx, x, y) {
  line(ctx, x, y - 34, x, y - 12, P.ink, 5);
  ctx.fillStyle = 'rgba(255,209,102,0.13)';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 8);
  ctx.lineTo(x + 12, y - 8);
  ctx.lineTo(x + 34, y + 58);
  ctx.lineTo(x - 34, y + 58);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = P.lamp;
  ctx.beginPath();
  ctx.moveTo(x - 24, y - 12);
  ctx.lineTo(x + 24, y - 12);
  ctx.lineTo(x + 12, y + 16);
  ctx.lineTo(x - 12, y + 16);
  ctx.closePath();
  ctx.fill();
  circle(ctx, x, y + 20, 7, '#fff3c4');
}

// ---- Level 2: Mask Room -----------------------------------------------

function drawMasks(ctx, changed) {
  roomShell(ctx);

  // Chevron motif high on the wall: up in the base room, down changed.
  for (let i = 0; i < 3; i++) {
    const x = 490 + i * 30;
    ctx.strokeStyle = P.muted;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (changed.has('motif')) {
      ctx.moveTo(x - 11, 74);
      ctx.lineTo(x, 92);
      ctx.lineTo(x + 11, 74);
    } else {
      ctx.moveTo(x - 11, 106);
      ctx.lineTo(x, 88);
      ctx.lineTo(x + 11, 106);
    }
    ctx.stroke();
  }

  // Mask one: bone-white, round eyes, strings hanging below.
  drawMask(ctx, 150, 180, P.bone);
  if (changed.has('eye')) {
    rect(ctx, 126, 166, 18, 18, P.ink);
  } else {
    circle(ctx, 135, 175, 9, P.ink);
  }
  circle(ctx, 165, 175, 9, P.ink);
  if (!changed.has('string')) {
    line(ctx, 132, 225, 132, 252, P.muted, 3);
    line(ctx, 168, 225, 168, 252, P.muted, 3);
  }

  // Mask two: teal, with a coral button added on the changed panel.
  drawMask(ctx, 300, 175, P.teal);
  circle(ctx, 285, 170, 8, P.ink);
  circle(ctx, 315, 170, 8, P.ink);
  if (changed.has('button')) circle(ctx, 300, 210, 9, P.coral);

  // Mask three: green in the base room, red in the changed one.
  drawMask(ctx, 450, 180, changed.has('mask') ? P.red : P.green);
  circle(ctx, 435, 175, 8, P.ink);
  circle(ctx, 465, 175, 8, P.ink);

  // Shelf with a vase that slides along it on the changed panel.
  rect(ctx, 380, 398, 180, 10, '#3a2c22');
  const vaseX = changed.has('vase') ? 522 : 478;
  ellipse(ctx, vaseX, 384, 22, 30, P.coral);
  rect(ctx, vaseX - 8, 352, 16, 12, P.coral);
  line(ctx, vaseX - 14, 372, vaseX + 14, 372, P.lamp, 3);

  // Cabinet with a handle that vanishes on the changed panel.
  rect(ctx, 470, 420, 110, 90, '#2a3a5e');
  rect(ctx, 470, 420, 110, 8, P.nightDeep);
  line(ctx, 525, 420, 525, 510, P.nightDeep, 3);
  if (!changed.has('handle')) circle(ctx, 520, 460, 7, P.gold);

  // Round rug in the middle of the floor.
  ellipse(ctx, 300, 520, 120, 22, '#7a2e3a');
  ellipse(ctx, 300, 520, 84, 15, '#a34a52');
}

function drawMask(ctx, x, y, color) {
  ellipse(ctx, x, y, 42, 52, color);
  ellipse(ctx, x, y + 18, 16, 10, P.ink);
  line(ctx, x - 42, y - 6, x - 58, y + 6, color, 5);
  line(ctx, x + 42, y - 6, x + 58, y + 6, color, 5);
}

// ---- Level 3: Planetarium ---------------------------------------------

function drawPlanetarium(ctx, changed) {
  roomShell(ctx);

  // Dome ribs arcing over the room.
  ctx.strokeStyle = P.muted;
  ctx.lineWidth = 4;
  for (const r of [150, 230, 310]) {
    ctx.beginPath();
    ctx.arc(300, 470, r, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // The great planet: orange, or blue on the changed panel.
  circle(ctx, 300, 220, 62, changed.has('planet') ? '#4a90d9' : '#e8833a');
  circle(ctx, 278, 200, 12, 'rgba(0,0,0,0.18)');
  circle(ctx, 322, 238, 9, 'rgba(0,0,0,0.18)');
  // Its ring: a full tilted ellipse, or one with the right tip cut away.
  ctx.strokeStyle = P.gold;
  ctx.lineWidth = 8;
  ctx.beginPath();
  if (changed.has('ring')) {
    ctx.ellipse(300, 220, 108, 26, -0.35, Math.PI * 0.15, Math.PI * 1.05);
  } else {
    ctx.ellipse(300, 220, 108, 26, -0.35, 0, Math.PI * 2);
  }
  ctx.stroke();

  // Small moon, gone on the changed panel.
  if (!changed.has('moon')) {
    circle(ctx, 430, 140, 18, P.bone);
    circle(ctx, 424, 136, 4, P.muted);
    circle(ctx, 436, 146, 3, P.muted);
  }

  // A comet streaks in only on the changed panel.
  if (changed.has('comet')) {
    line(ctx, 105, 82, 165, 128, P.lamp, 4);
    line(ctx, 118, 72, 172, 118, 'rgba(255,209,102,0.5)', 3);
    circle(ctx, 172, 132, 9, P.paper);
  }

  // Framed sky map with a star that goes missing.
  rect(ctx, 60, 250, 120, 110, P.nightDeep);
  ctx.strokeStyle = P.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 250, 120, 110);
  const mapStars = [[85, 275], [120, 300], [155, 272], [100, 335], [150, 330]];
  for (const [x, y] of mapStars) {
    if (changed.has('mapstar') && x === 120 && y === 300) continue;
    sparkle(ctx, x, y, 7, P.paper);
  }
  line(ctx, 85, 275, 120, 300, 'rgba(247,243,232,0.5)', 2);
  line(ctx, 120, 300, 155, 272, 'rgba(247,243,232,0.5)', 2);

  // Telescope on a tripod, shifted right on the changed panel.
  const tx = changed.has('scope') ? 520 : 480;
  line(ctx, tx, 430, tx - 26, 500, P.muted, 5);
  line(ctx, tx, 430, tx + 26, 500, P.muted, 5);
  line(ctx, tx, 430, tx, 500, P.muted, 5);
  ctx.save();
  ctx.translate(tx, 415);
  ctx.rotate(-0.5);
  rect(ctx, -46, -12, 92, 24, P.teal);
  circle(ctx, 48, 0, 13, P.gold);
  ctx.restore();

  // The observer's chair, with a shadow only on the changed panel.
  if (changed.has('chairshadow')) ellipse(ctx, 180, 522, 52, 9, 'rgba(5,8,20,0.55)');
  rect(ctx, 148, 418, 10, 56, P.coral);
  rect(ctx, 148, 470, 64, 10, P.coral);
  line(ctx, 156, 480, 150, 506, P.ink, 5);
  line(ctx, 204, 480, 210, 506, P.ink, 5);
}

const PAINTERS = { fossil: drawFossil, masks: drawMasks, planetarium: drawPlanetarium };

export function drawScene(ctx, levelId, changed) {
  const paint = PAINTERS[levelId];
  if (!paint) throw new Error(`unknown level ${levelId}`);
  paint(ctx, changed);
}
