// Shared constants for After Hours at the Museum.
// One place for canvas size, panel geometry, palette and per-level limits,
// so the renderer, the input handler and the tests all agree on them.
export const CONFIG = {
  canvas: { w: 1280, h: 720 },
  panels: {
    left: { x: 16, y: 76 },
    right: { x: 664, y: 76 },
  },
  // Per-level time limit (seconds) and hint budget.
  levels: [
    { seconds: 120, hints: 3 },
    { seconds: 100, hints: 3 },
    { seconds: 90, hints: 3 },
  ],
  // Seconds a wrong click costs, and the window that keeps a combo alive.
  missPenaltySeconds: 5,
  comboWindowMs: 8000,
  baseFindScore: 100,
  comboStepScore: 50,
  palette: {
    night: '#16233f',
    nightDeep: '#0e1830',
    wall: '#1d2f52',
    floor: '#101a33',
    bone: '#f2ead8',
    coral: '#ff6f61',
    lamp: '#ffd166',
    gold: '#f5b942',
    teal: '#2ec4b6',
    red: '#e4572e',
    green: '#5aa469',
    ink: '#0b1226',
    paper: '#f7f3e8',
    muted: '#8fa3c8',
  },
};
