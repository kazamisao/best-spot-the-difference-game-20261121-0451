// Screenshot staging: ?shot=start|play|end&seed=N renders a fixed,
// deterministic moment of the game so the maker's screenshots are real
// renders of the game's own code. Seeded so the same URL always shows
// the same finds.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function applyShot(game, search) {
  const params = new URLSearchParams(search);
  const shot = params.get('shot');
  if (!shot) return;
  const seed = Number(params.get('seed') ?? 1) || 1;
  const rand = mulberry32(seed);
  const levelIndex = Math.min(2, Math.max(0, Number(params.get('level') ?? 0) || 0));
  if (shot === 'start') {
    game.screen = 'title';
    return;
  }
  if (shot === 'play') {
    // A level in progress: three differences already found (with markers),
    // four still hiding, the counter showing what is left.
    game.startLevel(levelIndex);
    const pool = [...game.level.diffs];
    const found = [];
    while (found.length < 3 && pool.length > 0) {
      found.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    }
    for (const d of found) {
      game.levelState.found.push(d.id);
      game.findBorn[d.id] = 0;
    }
    game.levelState.score = found.reduce((sum, _d, i) => sum + 100 + i * 50, 0);
    game.levelState.secondsLeft = 87;
    game.screen = 'playing';
    return;
  }
  if (shot === 'end') {
    // A level cleared: every difference ringed in gold, room score shown.
    game.startLevel(levelIndex);
    for (const d of game.level.diffs) {
      game.levelState.found.push(d.id);
      game.findBorn[d.id] = 0;
    }
    game.levelState.complete = true;
    game.levelState.score = 850;
    game.levelState.secondsLeft = 41;
    game.levelBonus = 410;
    game.totalScore = 1260;
    game.screen = 'levelDone';
  }
}
