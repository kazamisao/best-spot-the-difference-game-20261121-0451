// Mouse and keyboard input. Converts raw pointer positions into
// panel-local coordinates (the canvas is scaled by CSS, so the click
// is measured against the canvas's own box) and hands keys to the game.
import { CONFIG } from './config.js';

export function attachInput(canvas, game) {
  function toPanel(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CONFIG.canvas.w;
    const y = ((clientY - rect.top) / rect.height) * CONFIG.canvas.h;
    const { left, right } = CONFIG.panels;
    if (x >= left.x && x < left.x + 600 && y >= left.y && y < left.y + 560) {
      return { panel: 'left', x: x - left.x, y: y - left.y };
    }
    if (x >= right.x && x < right.x + 600 && y >= right.y && y < right.y + 560) {
      return { panel: 'right', x: x - right.x, y: y - right.y };
    }
    return null;
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const hit = toPanel(event.clientX, event.clientY);
    if (hit) game.onPanelClick(hit.panel, hit.x, hit.y);
    else game.onAdvance();
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'h') game.onHint();
    else if (key === 'p' || key === 'escape') game.onPauseToggle();
    else if (key === 'm') game.onMuteToggle();
    else if (key === 'enter' || key === ' ') game.onAdvance();
  });
}
