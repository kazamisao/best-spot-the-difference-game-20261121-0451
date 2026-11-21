// After Hours at the Museum: boot, game loop and screen flow.
// Owns the game state object the renderer draws and the input handlers
// drive. Level state itself lives in logic.js; this file only moves
// between screens and keeps the running totals.
import { CONFIG } from './config.js';
import { LEVELS, hitTest, hintTarget } from './differences.js';
import { createLevelState, registerFind, registerMiss, useHint, tick } from './logic.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { applyShot } from './shots.js';
import * as audio from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const game = {
  screen: 'title',
  levelIndex: 0,
  level: LEVELS[0],
  levelState: null,
  totalScore: 0,
  levelBonus: 0,
  findBorn: {},
  flashes: [],
  floaters: [],
  hint: null,
  nowMs: 0,
  muted: false,
};

// Debug hook for automated play-tests: the live game state, readable
// from the browser console or a CDP script. Harmless in normal play.
window.__museum = game;

function setStatus(msg) {
  statusEl.textContent = msg;
}

function startLevel(index) {
  game.levelIndex = index;
  game.level = LEVELS[index];
  const cfg = CONFIG.levels[index];
  game.levelState = createLevelState(game.level, cfg.seconds, cfg.hints);
  game.findBorn = {};
  game.flashes = [];
  game.floaters = [];
  game.hint = null;
  game.levelBonus = 0;
  game.screen = 'playing';
  setStatus(`${game.level.name}: find 7 differences. ${cfg.seconds} seconds on the clock.`);
}

// Screenshot staging (?shot=) drives the game through this same entry point.
game.startLevel = startLevel;

function finishLevel() {
  const st = game.levelState;
  game.levelBonus = Math.ceil(st.secondsLeft) * 10;
  game.totalScore += st.score + game.levelBonus;
  game.screen = 'levelDone';
  audio.playWin();
  setStatus(`${game.level.name} cleared. Room score ${st.score + game.levelBonus}.`);
}

game.onPanelClick = (panel, x, y) => {
  if (game.screen === 'playing') {
    const st = game.levelState;
    const diff = hitTest(game.level, st.found, x, y);
    if (diff) {
      const gained = registerFind(st, diff, game.nowMs);
      game.findBorn[diff.id] = game.nowMs;
      game.floaters.push({ panel, x: diff.x, y: diff.y, text: `+${gained}`, born: game.nowMs });
      audio.playFind(st.combo);
      setStatus(`Found: ${diff.name}. ${st.found.length} of 7.`);
      if (st.complete) finishLevel();
    } else {
      registerMiss(st);
      game.flashes.push({ panel, x, y, born: game.nowMs });
      audio.playMiss();
      setStatus(`Nothing there. Five seconds lost, ${Math.ceil(st.secondsLeft)} left.`);
      if (st.timeUp) game.screen = 'timeUp';
    }
    return;
  }
  game.onAdvance();
};

game.onAdvance = () => {
  if (game.screen === 'title') {
    audio.playClick();
    game.totalScore = 0;
    startLevel(0);
  } else if (game.screen === 'levelDone') {
    audio.playClick();
    if (game.levelIndex + 1 < LEVELS.length) startLevel(game.levelIndex + 1);
    else game.screen = 'gameDone';
  } else if (game.screen === 'gameDone') {
    audio.playClick();
    game.screen = 'title';
    game.levelState = null;
    setStatus('After Hours at the Museum. Press Enter to begin.');
  } else if (game.screen === 'timeUp') {
    audio.playClick();
    startLevel(game.levelIndex);
  } else if (game.screen === 'paused') {
    game.screen = 'playing';
  }
};

game.onHint = () => {
  if (game.screen !== 'playing') return;
  const st = game.levelState;
  if (!useHint(st)) {
    setStatus('No hints left in this room.');
    return;
  }
  const diff = hintTarget(game.level, st.found);
  if (!diff) return;
  st.secondsLeft = Math.max(0, st.secondsLeft - CONFIG.missPenaltySeconds);
  game.hint = { diff, until: game.nowMs + 2500 };
  audio.playHint();
  setStatus('Hint: look inside the golden ring. Five seconds for the trouble.');
  if (st.secondsLeft === 0) {
    st.timeUp = true;
    game.screen = 'timeUp';
  }
};

game.onPauseToggle = () => {
  if (game.screen === 'playing') {
    game.screen = 'paused';
    setStatus('Paused.');
  } else if (game.screen === 'paused') {
    game.screen = 'playing';
  }
};

game.onMuteToggle = () => {
  game.muted = audio.toggleMute();
  setStatus(game.muted ? 'Sound off.' : 'Sound on.');
};

function fitCanvas() {
  const scale = Math.min(window.innerWidth / CONFIG.canvas.w, window.innerHeight / CONFIG.canvas.h);
  canvas.style.width = `${Math.floor(CONFIG.canvas.w * scale)}px`;
  canvas.style.height = `${Math.floor(CONFIG.canvas.h * scale)}px`;
}

window.addEventListener('resize', fitCanvas);
fitCanvas();
attachInput(canvas, game);
applyShot(game, window.location.search);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.nowMs = now;
  if (game.screen === 'playing' && game.levelState) {
    if (tick(game.levelState, dt)) game.screen = 'timeUp';
  }
  game.flashes = game.flashes.filter((f) => now - f.born < 600);
  game.floaters = game.floaters.filter((f) => now - f.born < 900);
  render(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
