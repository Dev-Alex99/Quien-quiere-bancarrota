// Procedural Web Audio API Engine for High-Stakes Game Show
// Zero External Audio Assets: 100% Client-side Synthesis

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isDronePlaying: boolean = false;

  constructor() {
    this.isMuted = localStorage.getItem('bancarrota_muted') === 'true';
  }

  public initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('bancarrota_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopTensionDrone();
    }
    return this.isMuted;
  }

  // Heartbeat "lub-dub" pulse
  public playHeartbeat(isFast: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // First beat: Lub
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(isFast ? 65 : 50, t);
    osc1.frequency.exponentialRampToValueAtTime(30, t + 0.12);

    gain1.gain.setValueAtTime(isFast ? 0.35 : 0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Second beat: Dub (slightly delayed)
    const t2 = t + 0.16;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(isFast ? 75 : 60, t2);
    osc2.frequency.exponentialRampToValueAtTime(35, t2 + 0.14);

    gain2.gain.setValueAtTime(isFast ? 0.45 : 0.3, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.16);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.17);
  }

  // Suspense Tension Drone
  public startTensionDrone() {
    if (this.isMuted || this.isDronePlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isDronePlaying = true;
    const t = this.ctx.currentTime;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.001, t);
    this.droneGain.gain.exponentialRampToValueAtTime(0.18, t + 2);
    this.droneGain.connect(this.ctx.destination);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();

    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, t); // Low A1

    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(82.4, t); // E2 fifth

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, t);

    this.droneOsc1.connect(filter);
    this.droneOsc2.connect(filter);
    filter.connect(this.droneGain);

    this.droneOsc1.start(t);
    this.droneOsc2.start(t);
  }

  public stopTensionDrone() {
    if (!this.isDronePlaying) return;
    this.isDronePlaying = false;

    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, this.ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
        } catch (e) {}
      }, 850);
    }
  }

  // Option Click (Clean tactile response)
  public playOptionClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Spotlight Lock-in Clang
  public playSpotlight() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  // Correct Answer Fanfare
  public playCorrectFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio

    notes.forEach((freq, idx) => {
      const startTime = t + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  }

  // Wrong Answer Harsh Buzzer
  public playBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(115, t);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(118, t); // Dissonant beating

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.65);
    osc2.stop(t + 0.65);
  }

  // Lifeline Shimmer Tone
  public playLifeline() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];

    notes.forEach((freq, idx) => {
      const startTime = t + idx * 0.05;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }
}

export const sfx = new GameAudioEngine();
