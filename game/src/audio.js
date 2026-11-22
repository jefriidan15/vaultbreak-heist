// Vaultbreak — Midnight Heist: all sound is synthesised with WebAudio.
// No audio files, no network: short oscillator envelopes for pickups, alerts,
// the win jingle and the caught drone. M toggles sound on/off.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._alarmOsc = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  _tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (!this.enabled || !this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  step() {
    this._tone(520, 0.07, 'sine', 0.12);
  }

  pickup() {
    this._tone(880, 0.12, 'triangle', 0.22);
    this._tone(1318, 0.18, 'triangle', 0.2, 0.09);
  }

  vault() {
    [523, 659, 784, 1046].forEach((f, i) => this._tone(f, 0.22, 'triangle', 0.22, i * 0.09));
  }

  smoke() {
    this._tone(300, 0.35, 'sawtooth', 0.08, 0, 90);
  }

  decoy() {
    this._tone(1200, 0.08, 'square', 0.1);
    this._tone(900, 0.1, 'square', 0.1, 0.08);
  }

  spotted() {
    this._tone(196, 0.28, 'square', 0.16, 0, 392);
  }

  win() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => this._tone(f, 0.3, 'triangle', 0.22, i * 0.11));
  }

  caught() {
    this._tone(220, 0.9, 'sawtooth', 0.2, 0, 55);
    this._tone(110, 1.1, 'sawtooth', 0.16, 0.1, 40);
  }

  click() {
    this._tone(700, 0.05, 'sine', 0.1);
  }
}
