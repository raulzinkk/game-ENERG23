/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Custom synthesized audio engine using Web Audio API
// This avoids downloading heavy & unstable MP3/WAV files in the iframe environment.

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private noiseGain: GainNode | null = null;

  private init() {
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

  // Heavy ambient background drone
  startAmbient() {
    try {
      this.init();
      if (!this.ctx) return;

      // Ensure single ambient synth is running
      if (this.ambientOsc) return;

      const ctx = this.ctx;
      
      // Low rumble drone
      const osc = ctx.createOscillator();
      const wave = ctx.createPeriodicWave(
        new Float32Array([0, 1, 0.4, 0.1, 0.05]), 
        new Float32Array([0, 0, 0, 0, 0])
      );
      osc.setPeriodicWave(wave);
      osc.frequency.setValueAtTime(55, ctx.currentTime); // A1 note

      // Lowpass Filter for extra claustrophobic feel
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(120, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(lpf);
      lpf.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      this.ambientOsc = osc;
      this.ambientGain = gain;

      // Start static camera hum and low background noise generator
      this.startCameraHum();
    } catch (e) {
      console.warn("Audio Context failed to start:", e);
    }
  }

  private startCameraHum() {
    if (!this.ctx) return;
    try {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter on noise
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.005, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (err) {
      console.warn("Noise buffer failed", err);
    }
  }

  stopAmbient() {
    try {
      if (this.ambientOsc) {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
        this.ambientOsc = null;
      }
      if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Play iron door slam
  playDoorSlam(isOpen: boolean) {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isOpen ? 120 : 80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.35);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(60, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(8, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + 0.5);
    osc2.stop(ctx.currentTime + 0.5);
  }

  // Play static feed glitch (switching cams, or random glitch)
  playCameraSwitch() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Short burst of white noise + square wave pop
    const bufferSize = 0.08 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
       data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  // Crank Generator clicking sound (ratchet clank)
  playCrankSound() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.setValueAtTime(40, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  // Flashlight click
  playFlashlightClick() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Creepy heavy robotic footstep
  playFootstep() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(45, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  // Spatial running footsteps panning from left to right (-1.0 to 1.0)
  playRunningLeftToRight() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const duration = 2.5; // seconds
    const stepsCount = 12; // 12 rapid footsteps
    const stepInterval = duration / stepsCount;

    for (let i = 0; i < stepsCount; i++) {
      const time = ctx.currentTime + i * stepInterval;
      // Calculate pan: from -1.0 (left) to 1.0 (right)
      const panValue = -1.0 + (i / (stepsCount - 1)) * 2.0;

      // Create stereo panner node if supported
      let panner: StereoPannerNode | null = null;
      try {
        if (ctx.createStereoPanner) {
          panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(panValue, time);
        }
      } catch (err) {
        console.warn("StereoPanner not supported", err);
      }

      // Footstep thump synthesis
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65, time);
      osc.frequency.exponentialRampToValueAtTime(15, time + 0.15);

      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(0.35, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      // Connect nodes
      if (panner) {
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.18);

      // Add a metallic click layer per step to make it sound mechanical
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      clickOsc.type = 'sawtooth';
      clickOsc.frequency.setValueAtTime(220, time);
      clickOsc.frequency.exponentialRampToValueAtTime(40, time + 0.06);

      clickGain.gain.setValueAtTime(0, time);
      clickGain.gain.linearRampToValueAtTime(0.12, time + 0.01);
      clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

      if (panner) {
        clickOsc.connect(panner);
        panner.connect(clickGain);
      } else {
        clickOsc.connect(clickGain);
      }
      clickGain.connect(ctx.destination);

      clickOsc.start(time);
      clickOsc.stop(time + 0.08);
    }
  }

  // Horror jumpscare scream (combines a low square, screaming saw, and high white noise pitch)
  playJumpscare() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const duration = 1.8;

    // Screaming oscillator 1
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(160, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(120, ctx.currentTime + duration);

    // Distorted frequency modulation
    const mod = ctx.createOscillator();
    mod.type = 'sawtooth';
    mod.frequency.setValueAtTime(450, ctx.currentTime);
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(250, ctx.currentTime);

    // Deep heavy square oscillator 2
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(80, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(40, ctx.currentTime + duration);

    // Scream gain
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.4, ctx.currentTime);
    mainGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration - 0.1);

    // Distortion node
    const dist = ctx.createWaveShaper();
    function makeDistortionCurve(amount = 20) {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      return curve;
    }
    dist.curve = makeDistortionCurve(60);
    dist.oversample = '4x';

    // Pipe together
    mod.connect(modGain);
    modGain.connect(osc1.frequency);

    osc1.connect(dist);
    osc2.connect(dist);

    dist.connect(mainGain);
    mainGain.connect(ctx.destination);

    // Add white noise scream layer
    const bufferSize = duration * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
       data[i] = (Math.random() * 2 - 1) * (1.0 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(2500, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Run
    mod.start();
    osc1.start();
    osc2.start();
    noise.start();

    mod.stop(ctx.currentTime + duration);
    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
    noise.stop(ctx.currentTime + duration);
  }

  // 6:00 AM Victory Synth Chime Arpeggio
  playVictoryChime() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    // A beautiful 80s synth progression
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration - 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    const bpm = 120;
    const beat = 60 / bpm; // 0.5s

    // Chords: Cmaj, Fmaj, Gmaj, Cmaj
    const notes = [261.63, 329.63, 392.00, 523.25, 349.23, 440.00, 523.25, 698.46, 392.00, 493.88, 587.33, 783.99, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      playNote(freq, idx * 0.15, 0.4);
    });
  }

  // Hallway light flicker click
  playLightFlicker() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    osc.frequency.setValueAtTime(10, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // Traque bomb explosion sound
  playExplosion() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const duration = 0.8;

    // Low rumble oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(10, ctx.currentTime + duration);

    // Deep low triangle
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(50, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(5, ctx.currentTime + duration);

    // High frequency shockwave noise
    const bufferSize = duration * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
       data[i] = (Math.random() * 2 - 1) * (1.0 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(700, ctx.currentTime);

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.35, ctx.currentTime);
    mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(mainGain);
    osc2.connect(mainGain);
    noise.connect(noiseFilter);
    noiseFilter.connect(mainGain);

    mainGain.connect(ctx.destination);

    osc.start();
    osc2.start();
    noise.start();

    osc.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);
    noise.stop(ctx.currentTime + duration);
  }
}

export const gameAudio = new WebAudioEngine();
