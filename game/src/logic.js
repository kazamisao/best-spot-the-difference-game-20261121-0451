// Pure level state: finds, misses, combo, hints and the clock.
// No DOM here, so the tests can drive it in Node and the browser code
// just calls these functions from its event handlers.
import { CONFIG } from './config.js';

export function createLevelState(level, seconds, hints = CONFIG.levels[0].hints) {
  return {
    level,
    found: [],
    misses: 0,
    combo: 0,
    lastFindAt: null,
    score: 0,
    secondsLeft: seconds,
    hintsLeft: hints,
    timeUp: false,
    complete: false,
  };
}

// A correct find. Quick finds in a row build a combo; each combo step pays
// an extra 50 points. Returns the points gained for this find.
export function registerFind(state, diff, nowMs) {
  if (state.lastFindAt !== null && nowMs - state.lastFindAt <= CONFIG.comboWindowMs) {
    state.combo += 1;
  } else {
    state.combo = 1;
  }
  state.lastFindAt = nowMs;
  const gained = CONFIG.baseFindScore + (state.combo - 1) * CONFIG.comboStepScore;
  state.score += gained;
  state.found.push(diff.id);
  if (state.found.length >= state.level.diffs.length) state.complete = true;
  return gained;
}

// A wrong click: five seconds off the clock and the combo is gone.
export function registerMiss(state) {
  state.misses += 1;
  state.combo = 0;
  state.secondsLeft = Math.max(0, state.secondsLeft - CONFIG.missPenaltySeconds);
  if (state.secondsLeft === 0) state.timeUp = true;
}

// Spend one hint. Returns false when none are left.
export function useHint(state) {
  if (state.hintsLeft <= 0) return false;
  state.hintsLeft -= 1;
  return true;
}

// Advance the clock by dt seconds. Returns true the moment time runs out.
export function tick(state, dtSeconds) {
  if (state.timeUp || state.complete) return state.timeUp;
  state.secondsLeft = Math.max(0, state.secondsLeft - dtSeconds);
  if (state.secondsLeft === 0) state.timeUp = true;
  return state.timeUp;
}
