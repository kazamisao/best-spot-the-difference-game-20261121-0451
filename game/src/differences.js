// The three rooms of the museum and the seven differences hidden in each.
// Coordinates are panel-local: x in 0..PANEL.w, y in 0..PANEL.h, and the same
// spot is checked on both panels. A difference is found by clicking within
// its radius on either panel; world.js draws the change at the same spot.
export const PANEL = { w: 600, h: 560 };

export const LEVELS = [
  {
    id: 'fossil',
    name: 'Fossil Gallery',
    tagline: 'The old bones keep their secrets after dark.',
    diffs: [
      { id: 'bone', name: 'A small bone on the floor', x: 210, y: 515, r: 24 },
      { id: 'lamp', name: 'A second wall lamp', x: 520, y: 120, r: 30 },
      { id: 'plaque', name: 'The plaque changes colour', x: 300, y: 335, r: 34 },
      { id: 'tail', name: 'The fossil tail bends the other way', x: 470, y: 230, r: 36 },
      { id: 'rock', name: 'The floor rock has moved', x: 130, y: 500, r: 40 },
      { id: 'star', name: 'A mural star is gone', x: 120, y: 90, r: 22 },
      { id: 'shadow', name: 'A shadow under the plant pot', x: 520, y: 505, r: 30 },
    ],
  },
  {
    id: 'masks',
    name: 'Mask Room',
    tagline: 'Every mask watches. One of them blinks.',
    diffs: [
      { id: 'string', name: 'A mask string is missing', x: 150, y: 250, r: 24 },
      { id: 'button', name: 'A button on the middle mask', x: 300, y: 210, r: 22 },
      { id: 'mask', name: 'The green mask turns red', x: 450, y: 180, r: 40 },
      { id: 'eye', name: 'A round eye turns square', x: 135, y: 175, r: 24 },
      { id: 'vase', name: 'The vase has slid along the shelf', x: 495, y: 375, r: 40 },
      { id: 'motif', name: 'The wall motif points the other way', x: 520, y: 90, r: 30 },
      { id: 'handle', name: 'The cabinet handle is gone', x: 520, y: 460, r: 22 },
    ],
  },
  {
    id: 'planetarium',
    name: 'Planetarium',
    tagline: 'The night sky, rearranged while nobody looked.',
    diffs: [
      { id: 'moon', name: 'The small moon is gone', x: 430, y: 140, r: 24 },
      { id: 'comet', name: 'A comet streaks in', x: 140, y: 110, r: 30 },
      { id: 'planet', name: 'The orange planet turns blue', x: 300, y: 220, r: 48 },
      { id: 'ring', name: 'The planet ring changes shape', x: 385, y: 255, r: 28 },
      { id: 'scope', name: 'The telescope has shifted', x: 495, y: 435, r: 42 },
      { id: 'mapstar', name: 'A star is missing from the sky map', x: 120, y: 300, r: 22 },
      { id: 'chairshadow', name: 'A shadow under the chair', x: 180, y: 520, r: 30 },
    ],
  },
];

// The nearest still-unfound difference within its radius, or null.
export function hitTest(level, foundIds, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const d of level.diffs) {
    if (foundIds.includes(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= d.r && dist < bestD) {
      best = d;
      bestD = dist;
    }
  }
  return best;
}

// A random still-unfound difference for the hint to point at, or null.
export function hintTarget(level, foundIds) {
  const rest = level.diffs.filter((d) => !foundIds.includes(d.id));
  if (rest.length === 0) return null;
  return rest[Math.floor(Math.random() * rest.length)];
}
