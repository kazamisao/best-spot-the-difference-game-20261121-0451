// Tests for After Hours at the Museum (spot the difference).
// Pure-logic tests: they import only modules that run in Node with no DOM.
// Run: node --test test/test_entry.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, PANEL, hitTest, hitFound, hintTarget } from '../game/src/differences.js';
import { createLevelState, registerFind, registerMiss, useHint, tick } from '../game/src/logic.js';
import { CONFIG } from '../game/src/config.js';

test('every level lists exactly seven differences', () => {
  assert.equal(LEVELS.length, 3);
  for (const level of LEVELS) assert.equal(level.diffs.length, 7, level.name);
});

test('every difference sits inside its panel with a sane radius', () => {
  for (const level of LEVELS) {
    const ids = new Set();
    for (const d of level.diffs) {
      assert.ok(!ids.has(d.id), `duplicate id ${d.id}`);
      ids.add(d.id);
      assert.ok(d.x - d.r >= 0 && d.x + d.r <= PANEL.w, `${d.id} x out of panel`);
      assert.ok(d.y - d.r >= 0 && d.y + d.r <= PANEL.h, `${d.id} y out of panel`);
      assert.ok(d.r >= 18 && d.r <= 60, `${d.id} radius ${d.r}`);
      assert.ok(d.name.length >= 3, `${d.id} needs a name`);
    }
  }
});

test('a click on a difference finds it, a click elsewhere misses', () => {
  const level = LEVELS[0];
  const first = level.diffs[0];
  assert.equal(hitTest(level, [], first.x, first.y).id, first.id);
  assert.equal(hitTest(level, [], first.x + first.r + 30, first.y), null);
  assert.equal(hitTest(level, [first.id], first.x, first.y), null);
});

test('a wrong click costs five seconds and breaks the combo', () => {
  const state = createLevelState(LEVELS[0], CONFIG.levels[0].seconds);
  state.combo = 2;
  registerMiss(state);
  assert.equal(state.secondsLeft, CONFIG.levels[0].seconds - 5);
  assert.equal(state.combo, 0);
  assert.equal(state.misses, 1);
});

test('a find raises the counter and pays 100 plus the combo bonus', () => {
  const state = createLevelState(LEVELS[0], CONFIG.levels[0].seconds);
  const first = LEVELS[0].diffs[0];
  const gained = registerFind(state, first, 1000);
  assert.equal(state.found.length, 1);
  assert.equal(gained, 100);
  const second = LEVELS[0].diffs[1];
  const gained2 = registerFind(state, second, 4000); // 3s later: still in the combo window
  assert.equal(gained2, 150);
  assert.equal(state.found.length, 2);
});

test('a slow find after the combo window pays the base amount only', () => {
  const state = createLevelState(LEVELS[0], CONFIG.levels[0].seconds);
  registerFind(state, LEVELS[0].diffs[0], 1000);
  const gained = registerFind(state, LEVELS[0].diffs[1], 12000); // 11s later
  assert.equal(gained, 100);
  assert.equal(state.combo, 1);
});

test('a hint picks an unfound difference and costs one hint', () => {
  const state = createLevelState(LEVELS[1], CONFIG.levels[1].seconds);
  state.found.push(LEVELS[1].diffs[0].id);
  const target = hintTarget(LEVELS[1], state.found);
  assert.ok(target && !state.found.includes(target.id));
  const ok = useHint(state);
  assert.equal(ok, true);
  assert.equal(state.hintsLeft, CONFIG.levels[1].hints - 1);
  const drained = createLevelState(LEVELS[1], CONFIG.levels[1].seconds);
  drained.hintsLeft = 0;
  assert.equal(useHint(drained), false);
});

test('the clock runs down and reports when time is up', () => {
  const state = createLevelState(LEVELS[2], 30);
  tick(state, 29.5);
  assert.equal(state.timeUp, false);
  tick(state, 1);
  assert.equal(state.timeUp, true);
  assert.equal(state.secondsLeft, 0);
});

test('finding all seven completes the level', () => {
  const state = createLevelState(LEVELS[0], CONFIG.levels[0].seconds);
  for (const d of LEVELS[0].diffs) registerFind(state, d, 1000);
  assert.equal(state.complete, true);
  assert.equal(state.found.length, 7);
});

// Click resolution, exactly as the browser handler decides it: a hit on an
// unfound difference finds it, a hit on an already-found difference is
// ignored, anything else is a miss. Coordinates are panel-local, so the
// same (x, y) on either panel resolves the same way.
function resolveClick(state, level, panel, x, y, nowMs) {
  const diff = hitTest(level, state.found, x, y);
  if (diff) {
    registerFind(state, diff, nowMs);
    return 'find';
  }
  if (hitFound(level, state.found, x, y)) return 'already-found';
  registerMiss(state);
  return 'miss';
}

test('clicking an already-found difference is ignored, never a miss', () => {
  const state = createLevelState(LEVELS[0], CONFIG.levels[0].seconds);
  const first = LEVELS[0].diffs[0];
  assert.equal(resolveClick(state, LEVELS[0], 'left', first.x, first.y, 1000), 'find');
  assert.equal(state.found.length, 1);
  assert.equal(state.misses, 0);
  assert.equal(state.combo, 1);
  const secondsAfterFind = state.secondsLeft;

  // The exact same spot again: ignored, no penalty at all.
  assert.equal(resolveClick(state, LEVELS[0], 'left', first.x, first.y, 2000), 'already-found');
  assert.equal(state.found.length, 1);
  assert.equal(state.misses, 0);
  assert.equal(state.secondsLeft, secondsAfterFind);
  assert.equal(state.combo, 1);
});

test('clicking an already-found difference on the other panel is ignored too', () => {
  const state = createLevelState(LEVELS[0], CONFIG.levels[0].seconds);
  const first = LEVELS[0].diffs[0];
  assert.equal(resolveClick(state, LEVELS[0], 'left', first.x, first.y, 1000), 'find');
  const secondsAfterFind = state.secondsLeft;

  // Same spot, other panel: the same difference, already found.
  assert.equal(resolveClick(state, LEVELS[0], 'right', first.x, first.y, 2000), 'already-found');
  assert.equal(state.found.length, 1);
  assert.equal(state.misses, 0);
  assert.equal(state.secondsLeft, secondsAfterFind);
  assert.equal(state.combo, 1);
});
