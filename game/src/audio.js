// All sound is synthesized with WebAudio oscillators: no audio files,
// no network, and nothing to load. The context starts on the first
// user gesture, as browsers require, and M toggles mute.
let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq, startAt, duration, type, volume) {
  const ac = ensureContext();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + duration + 0.05);
}

// A bright two-note chime for a found difference.
export function playFind(combo) {
  const lift = Math.min(combo - 1, 4) * 40;
  tone(660 + lift, 0, 0.18, 'sine', 0.22);
  tone(990 + lift, 0.09, 0.3, 'sine', 0.2);
}

// A low thud for a wrong click.
export function playMiss() {
  tone(140, 0, 0.22, 'sawtooth', 0.12);
  tone(90, 0.05, 0.25, 'triangle', 0.14);
}

// A soft shimmer when a hint lights up.
export function playHint() {
  tone(1180, 0, 0.25, 'sine', 0.1);
  tone(1560, 0.08, 0.3, 'sine', 0.08);
}

// A short fanfare for finishing a level.
export function playWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => tone(n, i * 0.11, 0.35, 'triangle', 0.18));
}

// A quiet tick for buttons and the title screen.
export function playClick() {
  tone(880, 0, 0.07, 'sine', 0.1);
}
