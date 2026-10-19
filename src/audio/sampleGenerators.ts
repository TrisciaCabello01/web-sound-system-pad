/**
 * Algorithmic Audio Buffer Synthesizer
 * Generates punchy, studio-grade sound effects, TikTok viral drops,
 * ambient background loops, and lo-fi pulse drum/instrument samples
 * without requiring external internet access or heavy audio assets.
 */

export function generateSoundBuffer(ctx: AudioContext, soundId: string): AudioBuffer {
  const sampleRate = ctx.sampleRate;

  switch (soundId) {
    // ----------------------------------------------------
    // 1. EFFECTS & DROPS
    // ----------------------------------------------------
    case 'fx-airhorn': {
      // Classic reggae sound system airhorn (two-tone harmonic blast)
      const duration = 1.2;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const f1 = 466.16; // Bb4
      const f2 = 587.33; // D5
      const f3 = 698.46; // F5

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // 3 blasts pattern: 0-0.25, 0.28-0.53, 0.56-1.1
        let env = 0;
        if (t < 0.22) {
          env = Math.sin((t / 0.22) * Math.PI) ** 0.5;
        } else if (t >= 0.25 && t < 0.48) {
          env = Math.sin(((t - 0.25) / 0.23) * Math.PI) ** 0.5;
        } else if (t >= 0.52 && t < 1.15) {
          const tail = (1.15 - t) / 0.63;
          env = Math.min(1, tail * 1.5) * (Math.sin(((t - 0.52) / 0.63) * Math.PI) ** 0.5);
        }

        // Slight brass vibrato & saturation
        const vib = Math.sin(2 * Math.PI * 6.5 * t) * 8;
        const wave1 = Math.sign(Math.sin(2 * Math.PI * (f1 + vib) * t)) * 0.35 + Math.sin(2 * Math.PI * (f1 + vib) * t) * 0.4;
        const wave2 = Math.sin(2 * Math.PI * (f2 + vib * 1.2) * t) * 0.3;
        const wave3 = Math.sin(2 * Math.PI * (f3 + vib) * t) * 0.25;
        const raw = (wave1 + wave2 + wave3) * env * 0.8;
        // Soft clipping
        const sample = Math.tanh(raw * 1.4);
        left[i] = sample;
        right[i] = sample * 0.95 + (Math.random() - 0.5) * 0.02 * env;
      }
      return buffer;
    }

    case 'fx-laser': {
      // Rapid downward FM laser sweep
      const duration = 0.55;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 3200 * Math.exp(-t * 12) + 120;
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.exp(-t * 6);
        const sample = Math.sin(phase + Math.sin(phase * 2) * 0.6) * env * 0.85;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'fx-siren': {
      // Dub/dancehall oscillating siren
      const duration = 1.8;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Pitch sweeps up and down
        const lfo = Math.sin(2 * Math.PI * 3.8 * t);
        const freq = 600 + lfo * 280;
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.min(1, t * 12) * Math.min(1, (duration - t) * 4);
        const square = Math.sign(Math.sin(phase)) * 0.5;
        const sine = Math.sin(phase) * 0.5;
        const sample = (square + sine) * env * 0.7;
        left[i] = sample;
        right[i] = sample * 0.9;
      }
      return buffer;
    }

    case 'fx-subdrop': {
      // Heavy 808 sub bass drop from 140Hz down to 32Hz
      const duration = 1.6;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 34 + 110 * Math.exp(-t * 3.2);
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.min(1, t * 80) * Math.exp(-t * 1.8);
        const sat = Math.tanh(Math.sin(phase) * 2.2) * 0.75;
        const sample = sat * env;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'fx-scratch': {
      // Vinyl scratch chirp back and forth
      const duration = 0.45;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Forward then back speed profile
        const speed = Math.sin((t / duration) * Math.PI * 2);
        const freq = Math.abs(speed) * 850 + 120;
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.sin((t / duration) * Math.PI);
        const noise = (Math.random() - 0.5) * 0.15;
        const sample = (Math.sin(phase) * 0.7 + noise) * env * 0.9;
        left[i] = sample;
        right[i] = sample * 0.9;
      }
      return buffer;
    }

    case 'fx-impact': {
      // Mega cinematic impact with rumble & noise trail
      const duration = 2.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const subFreq = 42 + 80 * Math.exp(-t * 6);
        phase += (2 * Math.PI * subFreq) / sampleRate;
        const subEnv = Math.exp(-t * 2.2);
        const noiseEnv = Math.exp(-t * 5.5);
        const noise = (Math.random() - 0.5) * noiseEnv * 0.5;
        const sub = Math.sin(phase) * subEnv * 0.8;
        const sample = Math.tanh((sub + noise) * 1.5) * 0.9;
        left[i] = sample;
        right[i] = sample * 0.95;
      }
      return buffer;
    }

    case 'fx-riser': {
      // White noise riser sweep with resonance
      const duration = 2.4;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const progress = t / duration;
        const cutoff = 200 + progress * 7000;
        phase += (2 * Math.PI * cutoff) / sampleRate;
        const env = Math.pow(progress, 1.8);
        const noise = (Math.random() - 0.5) * 0.6;
        const tonality = Math.sin(phase) * 0.4;
        const sample = (noise + tonality) * env * 0.8;
        left[i] = sample * (1 - progress * 0.3);
        right[i] = sample * (0.7 + progress * 0.3);
      }
      return buffer;
    }

    case 'fx-gunshot': {
      // Crisp crack and delayed reverb boom
      const duration = 0.9;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const crack = (Math.random() - 0.5) * 2 * Math.exp(-t * 80);
        const body = Math.sin(2 * Math.PI * 65 * t) * Math.exp(-t * 6) * 0.7;
        const tail = (Math.random() - 0.5) * Math.exp(-t * 4) * 0.4;
        const sample = Math.tanh(crack + body + tail) * 0.9;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    // ----------------------------------------------------
    // 2. TIKTOK & TIKTOK2
    // ----------------------------------------------------
    case 'tt-boom': {
      // The classic Vine Boom low frequency rumble
      const duration = 1.4;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 45 + 50 * Math.exp(-t * 4);
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.min(1, t * 200) * Math.exp(-t * 2.2);
        const sub = Math.sin(phase) * 0.85;
        const dist = Math.tanh(sub * 2.5);
        const noise = (Math.random() - 0.5) * 0.08 * Math.exp(-t * 5);
        left[i] = (dist + noise) * env;
        right[i] = (dist - noise) * env;
      }
      return buffer;
    }

    case 'tt-bruh': {
      // Synthesized "Bruh" vocal bass drop (formants F1 ~ 500Hz, F2 ~ 900Hz)
      const duration = 0.75;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phasePitch = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const f0 = 100 * Math.exp(-t * 2.2) + 40; // Vocal fold fundamental
        phasePitch += (2 * Math.PI * f0) / sampleRate;
        const env = Math.min(1, t * 30) * Math.exp(-t * 3.5);
        // Formant filtering approximation
        const formant1 = Math.sin(phasePitch * 5.2) * 0.5;
        const formant2 = Math.sin(phasePitch * 8.8) * 0.35;
        const base = Math.sin(phasePitch) * 0.4;
        const sample = (base + formant1 + formant2) * env * 0.85;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'tt-scratch': {
      // Record stop spin down effect
      const duration = 0.65;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const speed = Math.max(0, 1 - t / duration);
        const freq = 440 * (speed ** 2);
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.min(1, t * 50) * speed;
        const sample = Math.sin(phase) * env * 0.8;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'tt-ohno': {
      // High chime ascending meme motif ("Oh no")
      const duration = 1.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const notes = [587.33, 659.25, 783.99, 880]; // D5, E5, G5, A5
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const step = Math.min(3, Math.floor(t / 0.22));
        const noteT = t - step * 0.22;
        const freq = notes[step];
        const env = Math.exp(-noteT * 7) * 0.7;
        const sample = (Math.sin(2 * Math.PI * freq * noteT) + Math.sin(2 * Math.PI * freq * 2 * noteT) * 0.3) * env;
        left[i] = sample;
        right[i] = sample * (0.8 + step * 0.1);
      }
      return buffer;
    }

    case 'tt-swoosh': {
      // Clean modern transition whoosh
      const duration = 0.4;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const norm = t / duration;
        const env = Math.sin(norm * Math.PI);
        const pan = norm; // pans left to right
        const noise = (Math.random() - 0.5) * 1.2;
        left[i] = noise * env * (1 - pan * 0.7);
        right[i] = noise * env * (0.3 + pan * 0.7);
      }
      return buffer;
    }

    case 'tt-gong': {
      // Dramatic cinematic gong bell
      const duration = 2.2;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 1.5);
        const f1 = Math.sin(2 * Math.PI * 180 * t) * 0.4;
        const f2 = Math.sin(2 * Math.PI * 277 * t) * 0.35;
        const f3 = Math.sin(2 * Math.PI * 415 * t) * 0.2;
        const f4 = Math.sin(2 * Math.PI * 554 * t) * 0.15;
        const sample = (f1 + f2 + f3 + f4) * env * 0.9;
        left[i] = sample;
        right[i] = sample * 0.95;
      }
      return buffer;
    }

    case 'tt-wow': {
      // Anime pitch glide "wow!"
      const duration = 0.7;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Pitch dips then rises
        const freq = 320 + Math.sin(t * 7) * 80 + (t / duration) * 260;
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.min(1, t * 40) * Math.sin((t / duration) * Math.PI);
        const sample = Math.sin(phase) * env * 0.75;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'tt-stomp': {
      // Huge trap 808 brass horn stomp
      const duration = 1.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const f = 73.42; // D2
        const brass = Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 2 * t) * 0.6 + Math.sin(2 * Math.PI * f * 3 * t) * 0.4;
        const env = Math.min(1, t * 120) * Math.exp(-t * 2.8);
        const sample = Math.tanh(brass * 2.0) * env * 0.85;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    // ----------------------------------------------------
    // 3. BACKGROUND MUSIC & LOOPS
    // ----------------------------------------------------
    case 'loop-lofi-chill': {
      // 4-second seamless Lo-Fi Beat Loop (BPM ~ 85)
      const duration = 4.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23], // G7
      ];

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const barIndex = Math.min(3, Math.floor(t / 1.0));
        const barTime = t % 1.0;

        // Rhodes Chord
        let chordSample = 0;
        chords[barIndex].forEach((freq) => {
          chordSample += Math.sin(2 * Math.PI * freq * t) * Math.exp(-barTime * 1.5) * 0.15;
        });

        // Lo-fi Kick on beat 0 and 0.5
        let kick = 0;
        if (barTime < 0.25) {
          const kt = barTime;
          kick = Math.sin(2 * Math.PI * (55 + 60 * Math.exp(-kt * 20)) * kt) * Math.exp(-kt * 8) * 0.6;
        }

        // Lo-fi Snare on beat 0.5
        let snare = 0;
        if (barTime >= 0.5 && barTime < 0.75) {
          const st = barTime - 0.5;
          const noise = (Math.random() - 0.5) * 0.35;
          const tone = Math.sin(2 * Math.PI * 180 * st) * 0.3;
          snare = (noise + tone) * Math.exp(-st * 12);
        }

        // Vinyl crackle
        const crackle = (Math.random() > 0.992 ? (Math.random() - 0.5) * 0.2 : 0);

        const mix = (chordSample + kick + snare + crackle) * 0.75;
        left[i] = mix;
        right[i] = mix * 0.95 + (Math.random() - 0.5) * 0.01;
      }
      return buffer;
    }

    case 'loop-deephouse': {
      // 4-second Deep House minor groove with pumping sidechain
      const duration = 4.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const beatTime = t % 0.5; // 120 BPM = 0.5s per quarter note
        // 4-on-the-floor kick
        const kick = Math.sin(2 * Math.PI * (50 + 90 * Math.exp(-beatTime * 30)) * beatTime) * Math.exp(-beatTime * 10) * 0.6;
        // Offbeat stab
        let stab = 0;
        if (beatTime >= 0.25 && beatTime < 0.45) {
          const st = beatTime - 0.25;
          const chord = Math.sin(2 * Math.PI * 293.66 * t) + Math.sin(2 * Math.PI * 349.23 * t) + Math.sin(2 * Math.PI * 440 * t);
          stab = chord * Math.exp(-st * 8) * 0.22;
        }
        // Sub bass
        const bass = Math.sin(2 * Math.PI * 55 * t) * (1 - Math.exp(-beatTime * 6)) * 0.3;
        const mix = kick + stab + bass;
        left[i] = mix * 0.7;
        right[i] = mix * 0.7;
      }
      return buffer;
    }

    case 'loop-trapdrill': {
      // 4-second Trap / Drill rolling hats and 808
      const duration = 4.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Fast rolling hats (triplets / 16ths)
        const hatTime = t % 0.125;
        const hat = (Math.random() - 0.5) * Math.exp(-hatTime * 45) * 0.25;

        // Sliding 808 bass
        const slide = Math.sin((t / 4) * Math.PI * 2) * 15;
        const bass = Math.sin(2 * Math.PI * (42 + slide) * t) * 0.45;

        // Clap on 1.0s and 3.0s
        let clap = 0;
        const clapTime = t % 2.0;
        if (clapTime >= 1.0 && clapTime < 1.3) {
          const ct = clapTime - 1.0;
          clap = (Math.random() - 0.5) * Math.exp(-ct * 14) * 0.4;
        }

        left[i] = (hat + bass + clap) * 0.8;
        right[i] = (hat * 0.85 + bass + clap) * 0.8;
      }
      return buffer;
    }

    case 'loop-ambient': {
      // 6-second Lush Atmospheric Drone Pad
      const duration = 6.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Swell envelope
        const env = Math.sin((t / duration) * Math.PI);
        const lfo = Math.sin(2 * Math.PI * 0.3 * t) * 2;
        const o1 = Math.sin(2 * Math.PI * (110 + lfo) * t) * 0.2;
        const o2 = Math.sin(2 * Math.PI * (164.81 + lfo * 0.7) * t) * 0.15;
        const o3 = Math.sin(2 * Math.PI * (220 - lfo * 0.5) * t) * 0.15;
        const o4 = Math.sin(2 * Math.PI * 277.18 * t) * 0.1;
        const shimmer = Math.sin(2 * Math.PI * 880 * t) * 0.04;
        const val = (o1 + o2 + o3 + o4 + shimmer) * env * 0.8;
        left[i] = val;
        right[i] = val * 0.9 + Math.sin(2 * Math.PI * 165 * t) * 0.05 * env;
      }
      return buffer;
    }

    case 'loop-jazzchords': {
      // 4-second Neo-Soul Rhodes Chord Progression
      const duration = 4.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const notes = [
        [196, 246.94, 293.66, 349.23, 440], // G9
        [174.61, 220, 261.63, 311.13, 392], // F9
        [164.81, 207.65, 246.94, 293.66, 370], // E9
        [146.83, 185, 220, 261.63, 329.63], // D9
      ];

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const chordIdx = Math.min(3, Math.floor(t / 1.0));
        const ct = t % 1.0;
        let s = 0;
        notes[chordIdx].forEach((freq, idx) => {
          const tremolo = 1 + Math.sin(2 * Math.PI * 4 * t) * 0.15;
          s += Math.sin(2 * Math.PI * freq * t) * Math.exp(-ct * 1.8) * (0.12 - idx * 0.015) * tremolo;
        });
        left[i] = s * 0.85;
        right[i] = s * 0.85;
      }
      return buffer;
    }

    // ----------------------------------------------------
    // 4. STUDIO SAMPLER & LO-FI PULSE KIT
    // ----------------------------------------------------
    case 'lofi-kick': {
      // Warm 55Hz acoustic-synthetic lo-fi kick drum
      const duration = 0.45;
      const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 50 + 95 * Math.exp(-t * 28);
        phase += (2 * Math.PI * freq) / sampleRate;
        const click = (Math.random() - 0.5) * Math.exp(-t * 120) * 0.2;
        const env = Math.exp(-t * 8.5);
        data[i] = Math.tanh((Math.sin(phase) + click) * 1.6) * env * 0.9;
      }
      return buffer;
    }

    case 'lofi-snare': {
      // Dusty vintage vinyl snare with body & crackle
      const duration = 0.4;
      const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const tone = Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 22) * 0.5;
        const noise = (Math.random() - 0.5) * Math.exp(-t * 11) * 0.65;
        data[i] = Math.tanh(tone + noise) * 0.85;
      }
      return buffer;
    }

    case 'lofi-clap': {
      // Analog vintage handclap with multi-transient
      const duration = 0.35;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        let env = 0;
        // 3 mini taps + tail
        if (t < 0.012) env = 0.4;
        else if (t < 0.024) env = 0.6;
        else if (t < 0.038) env = 0.8;
        else env = Math.exp(-(t - 0.038) * 16);

        const noise = (Math.random() - 0.5) * env * 0.9;
        left[i] = noise;
        right[i] = noise * 0.92;
      }
      return buffer;
    }

    case 'lofi-rim': {
      // Crisp organic wooden rimshot
      const duration = 0.2;
      const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const f1 = Math.sin(2 * Math.PI * 450 * t);
        const f2 = Math.sin(2 * Math.PI * 880 * t) * 0.4;
        const crack = (Math.random() - 0.5) * Math.exp(-t * 180) * 0.4;
        data[i] = (f1 + f2 + crack) * Math.exp(-t * 35) * 0.85;
      }
      return buffer;
    }

    case 'lofi-hihat-closed': {
      // Muted crispy 14-inch tape hi-hat
      const duration = 0.12;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() - 0.5) * Math.exp(-t * 60) * 0.7;
        left[i] = noise;
        right[i] = noise * 0.9;
      }
      return buffer;
    }

    case 'lofi-hihat-open': {
      // Sizzling sustained open hi-hat
      const duration = 0.65;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const metallic = Math.sin(2 * Math.PI * 6800 * t) * 0.2;
        const noise = (Math.random() - 0.5) * 0.8;
        const sample = (noise + metallic) * Math.exp(-t * 7.5) * 0.65;
        left[i] = sample;
        right[i] = sample * 0.95;
      }
      return buffer;
    }

    case 'lofi-rhodes': {
      // Vintage Rhodes electric piano chord stab (F#m9)
      const duration = 1.6;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const notes = [185.0, 220.0, 277.18, 329.63, 415.3]; // F#3, A3, C#4, E4, G#4
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        let sum = 0;
        notes.forEach((freq, idx) => {
          const bell = Math.sin(2 * Math.PI * freq * 3 * t) * Math.exp(-t * 12) * 0.1;
          const tone = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 2.0) * (0.16 - idx * 0.02);
          sum += tone + bell;
        });
        const warm = Math.tanh(sum * 1.5) * 0.85;
        left[i] = warm;
        right[i] = warm * 0.98;
      }
      return buffer;
    }

    case 'lofi-guitar': {
      // Muted electric jazz guitar pluck
      const duration = 1.2;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const f = 246.94; // B3
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const pluck = (Math.random() - 0.5) * Math.exp(-t * 200) * 0.3;
        const fund = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3.5) * 0.45;
        const harm = Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 6.0) * 0.25;
        const sample = (fund + harm + pluck) * 0.85;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'lofi-808sub': {
      // Deep 808 glide sub bass note (40Hz)
      const duration = 1.5;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 41.2; // E1
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.min(1, t * 50) * Math.exp(-t * 1.6);
        const sat = Math.tanh(Math.sin(phase) * 1.8) * 0.85;
        left[i] = sat * env;
        right[i] = sat * env;
      }
      return buffer;
    }

    // ----------------------------------------------------
    // 5. TIKTOK SONGS & TRENDING AUDIO
    // ----------------------------------------------------
    case 'tt-song-drill': {
      // 4-second viral UK/NY drill beat hook with vocal chop & sliding sub
      const duration = 4.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const beatT = t % 0.5;
        // Punchy drill kick with rapid slide
        const kick = Math.sin(2 * Math.PI * (60 + 80 * Math.exp(-beatT * 35)) * beatT) * Math.exp(-beatT * 12) * 0.7;
        // Drill rimshot on 3rd beat
        let rim = 0;
        if (t % 1.0 > 0.5 && t % 1.0 < 0.7) {
          const rt = (t % 1.0) - 0.5;
          rim = (Math.random() - 0.5) * Math.exp(-rt * 30) * 0.5;
        }
        // Sliding vocal vowel formant
        const vocalPitch = 220 + Math.sin(t * 3.5) * 40;
        const vocal = Math.sin(2 * Math.PI * vocalPitch * t) * Math.sin(2 * Math.PI * vocalPitch * 2.8 * t) * 0.2;
        // Rolling hi-hats
        const hat = (Math.random() - 0.5) * Math.exp(-(t % 0.08) * 60) * 0.2;
        const mix = kick + rim + vocal + hat;
        left[i] = mix * 0.8;
        right[i] = mix * 0.8;
      }
      return buffer;
    }

    case 'tt-song-phonk': {
      // Fast drifting Brazilian/drift phonk cowbell anthem with distorted 808
      const duration = 3.6;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const cowbellNotes = [587.33, 783.99, 880.0, 783.99, 659.25, 587.33];
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noteIdx = Math.floor(t / 0.3) % cowbellNotes.length;
        const nt = t % 0.3;
        const f = cowbellNotes[noteIdx];
        // TR-808 style cowbell (two square waves)
        const sq1 = Math.sign(Math.sin(2 * Math.PI * f * nt));
        const sq2 = Math.sign(Math.sin(2 * Math.PI * f * 1.48 * nt));
        const bell = (sq1 * 0.5 + sq2 * 0.5) * Math.exp(-nt * 9) * 0.35;
        // Distorted heavy sub
        const sub = Math.tanh(Math.sin(2 * Math.PI * 45 * t) * 2.2) * 0.45;
        const sample = (bell + sub) * 0.85;
        left[i] = sample;
        right[i] = sample * 0.95;
      }
      return buffer;
    }

    case 'tt-song-spedup': {
      // Viral nightcore sped-up upbeat pop hook
      const duration = 3.2;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const melody = [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 880.0];
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noteIdx = Math.floor(t / 0.22) % melody.length;
        const nt = t % 0.22;
        const f = melody[noteIdx];
        const saw = (2 * ((nt * f) % 1) - 1) * 0.2;
        const sine = Math.sin(2 * Math.PI * f * nt) * 0.25;
        const popKick = Math.sin(2 * Math.PI * 65 * (t % 0.44)) * Math.exp(-(t % 0.44) * 14) * 0.4;
        const sample = (saw + sine) * Math.exp(-nt * 3.5) + popKick;
        left[i] = sample * 0.75;
        right[i] = sample * 0.75;
      }
      return buffer;
    }

    case 'tt-song-jersey': {
      // Bouncy Jersey club kick & bed-squeak rhythm loop
      const duration = 2.4;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Jersey 5-kick bounce pattern (quarter, quarter, eighth, eighth, quarter)
        const kt = t % 0.3;
        const kick = Math.sin(2 * Math.PI * (50 + 70 * Math.exp(-kt * 30)) * kt) * Math.exp(-kt * 10) * 0.6;
        // Bed squeak chirp on offbeat
        let squeak = 0;
        const sqTime = (t + 0.15) % 0.3;
        if (sqTime < 0.1) {
          squeak = Math.sin(2 * Math.PI * (1200 + sqTime * 6000) * sqTime) * Math.exp(-sqTime * 25) * 0.25;
        }
        left[i] = (kick + squeak) * 0.8;
        right[i] = (kick - squeak * 0.8) * 0.8;
      }
      return buffer;
    }

    case 'tt-song-synthwave': {
      // 80s nostalgic retro synth lead chords loop
      const duration = 4.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const chords = [
        [220, 261.63, 329.63, 440], // Am
        [174.61, 220, 261.63, 349.23], // F
        [261.63, 329.63, 392, 523.25], // C
        [196, 246.94, 293.66, 392], // G
      ];

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const chordIdx = Math.floor(t / 1.0) % 4;
        const ct = t % 1.0;
        let sum = 0;
        chords[chordIdx].forEach((freq) => {
          // Detuned dual saw
          const saw1 = (2 * ((t * freq) % 1) - 1) * 0.1;
          const saw2 = (2 * ((t * (freq * 1.008)) % 1) - 1) * 0.1;
          sum += (saw1 + saw2) * Math.exp(-ct * 0.9);
        });
        const bass = Math.sin(2 * Math.PI * (chords[chordIdx][0] / 2) * t) * 0.3;
        left[i] = (sum + bass) * 0.8;
        right[i] = (sum * 0.95 + bass) * 0.8;
      }
      return buffer;
    }

    // ----------------------------------------------------
    // 6. TRENDING SONGS & GLOBAL ANTHEMS
    // ----------------------------------------------------
    case 'trend-afrobeats': {
      // Afrobeats log drum syncopated groove with warm marimba
      const duration = 3.8;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Log drum punch (Amapiano / Afrobeats fundamental 50Hz with pitch fall)
        const logT = t % 0.45;
        const logFreq = 48 + 55 * Math.exp(-logT * 18);
        const logDrum = Math.tanh(Math.sin(2 * Math.PI * logFreq * logT) * 2.0) * Math.exp(-logT * 7) * 0.65;
        // Marimba chord stab
        const marT = (t + 0.22) % 0.45;
        const marimba = (Math.sin(2 * Math.PI * 523.25 * marT) + Math.sin(2 * Math.PI * 659.25 * marT)) * Math.exp(-marT * 18) * 0.25;
        // Shaker 16th pattern
        const shaker = (Math.random() - 0.5) * Math.exp(-(t % 0.11) * 40) * 0.15;
        left[i] = (logDrum + marimba + shaker) * 0.85;
        right[i] = (logDrum + marimba * 0.9 + shaker) * 0.85;
      }
      return buffer;
    }

    case 'trend-clubanthem': {
      // Festival mainstage euphoric EDM supersaw lead drop
      const duration = 4.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const notes = [440, 523.25, 659.25, 880];
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noteIdx = Math.floor(t / 0.5) % notes.length;
        const f = notes[noteIdx];
        // 5-voice detuned supersaw
        let saw = 0;
        [-0.015, -0.007, 0, 0.007, 0.015].forEach((detune) => {
          saw += (2 * ((t * f * (1 + detune)) % 1) - 1) * 0.08;
        });
        // 4-on-the-floor kick with pumping sidechain
        const kickT = t % 0.5;
        const kick = Math.sin(2 * Math.PI * (50 + 90 * Math.exp(-kickT * 25)) * kickT) * Math.exp(-kickT * 9) * 0.65;
        const sidechainEnv = Math.min(1, kickT * 12);
        left[i] = (saw * sidechainEnv + kick) * 0.8;
        right[i] = (saw * sidechainEnv * 0.95 + kick) * 0.8;
      }
      return buffer;
    }

    case 'trend-reggaeton': {
      // Latin Dembow reggaeton groove loop
      const duration = 3.6;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const beatT = t % 0.9;
        // Kick on 0 and 0.45
        let kick = 0;
        if (beatT < 0.25 || (beatT >= 0.45 && beatT < 0.7)) {
          const kt = beatT >= 0.45 ? beatT - 0.45 : beatT;
          kick = Math.sin(2 * Math.PI * (55 + 75 * Math.exp(-kt * 25)) * kt) * Math.exp(-kt * 10) * 0.65;
        }
        // Dembow syncopated snare on 0.33 and 0.78
        let snare = 0;
        if ((beatT >= 0.33 && beatT < 0.45) || (beatT >= 0.78 && beatT < 0.9)) {
          const st = beatT >= 0.78 ? beatT - 0.78 : beatT - 0.33;
          snare = ((Math.random() - 0.5) * 0.7 + Math.sin(2 * Math.PI * 220 * st) * 0.3) * Math.exp(-st * 16);
        }
        left[i] = (kick + snare) * 0.85;
        right[i] = (kick + snare) * 0.85;
      }
      return buffer;
    }

    case 'trend-hyperpop': {
      // Glitchy bubbly hyperpop synth pluck melody
      const duration = 2.8;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51];
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noteIdx = Math.floor(t / 0.14) % notes.length;
        const nt = t % 0.14;
        const f = notes[noteIdx];
        const fm = Math.sin(2 * Math.PI * f * 2.01 * nt) * 0.4;
        const sample = Math.sin(2 * Math.PI * f * nt + fm) * Math.exp(-nt * 12) * 0.6;
        left[i] = sample;
        right[i] = sample * 0.9;
      }
      return buffer;
    }

    // ----------------------------------------------------
    // 7. COMEDIC SOUNDS & MEME SFX
    // ----------------------------------------------------
    case 'comedy-boing': {
      // Classic cartoon spring bounce ("boing!")
      const duration = 0.9;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Pitch oscillates rapidly up and down while overall pitch rises
        const vibrato = Math.sin(2 * Math.PI * 18 * t) * 160;
        const freq = 220 + (t / duration) * 350 + vibrato;
        phase += (2 * Math.PI * freq) / sampleRate;
        const env = Math.min(1, t * 100) * Math.exp(-t * 2.8);
        const sample = (Math.sin(phase) + Math.sin(phase * 2) * 0.3) * env * 0.85;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'comedy-sadhorn': {
      // Sad trombone ("wah-wah-wah-waaah")
      const duration = 2.2;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const notes = [293.66, 277.18, 261.63, 246.94]; // D, C#, C, B
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const step = Math.min(3, Math.floor(t / 0.5));
        const st = t - step * 0.5;
        const f = step === 3 ? notes[step] - st * 20 : notes[step]; // slide down on last note
        const brass = Math.sin(2 * Math.PI * f * st) + Math.sin(2 * Math.PI * f * 2 * st) * 0.5 + Math.sin(2 * Math.PI * f * 3 * st) * 0.25;
        // Mute wow filter
        const wah = (1 + Math.sin(2 * Math.PI * 4 * st)) * 0.5;
        const env = Math.min(1, st * 40) * Math.exp(-st * 1.8);
        const sample = Math.tanh(brass * 1.5) * wah * env * 0.75;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'comedy-slip': {
      // Comic slide whistle up and cartoon thud
      const duration = 0.85;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let phase = 0;
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        let sample = 0;
        if (t < 0.55) {
          // Whistle slide up
          const freq = 400 + (t / 0.55) * 1200;
          phase += (2 * Math.PI * freq) / sampleRate;
          sample = Math.sin(phase) * 0.7 * Math.min(1, t * 50);
        } else {
          // Cartoon thud impact
          const thudT = t - 0.55;
          const sub = Math.sin(2 * Math.PI * (80 * Math.exp(-thudT * 20)) * thudT);
          const noise = (Math.random() - 0.5) * 0.3;
          sample = (sub + noise) * Math.exp(-thudT * 12) * 0.85;
        }
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'comedy-crickets': {
      // Awkward silence cricket chirps
      const duration = 1.6;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const cycle = t % 0.45;
        let chirp = 0;
        if (cycle < 0.18) {
          const mod = Math.sin(2 * Math.PI * 45 * cycle);
          chirp = Math.sin(2 * Math.PI * 4800 * cycle) * Math.max(0, mod) * 0.4;
        }
        left[i] = chirp;
        right[i] = chirp * 0.9;
      }
      return buffer;
    }

    case 'comedy-laugh': {
      // Cartoon goofy chuckle / duck quack laugh
      const duration = 1.2;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const chuckIdx = Math.floor(t / 0.18);
        const ct = t % 0.18;
        const freq = 360 + (chuckIdx % 2) * 60;
        const formant = Math.sin(2 * Math.PI * freq * ct) * Math.sin(2 * Math.PI * freq * 2.5 * ct) * 0.6;
        const env = Math.sin((ct / 0.18) * Math.PI) * Math.exp(-t * 1.5);
        const sample = formant * env * 0.8;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    case 'comedy-punch': {
      // Classic comic slapstick punch & bell chime
      const duration = 0.8;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const punch = (Math.random() - 0.5) * Math.exp(-t * 60) * 1.2;
        const bell = Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-t * 6) * 0.35;
        const sub = Math.sin(2 * Math.PI * 70 * t) * Math.exp(-t * 18) * 0.6;
        const sample = Math.tanh(punch + bell + sub) * 0.85;
        left[i] = sample;
        right[i] = sample;
      }
      return buffer;
    }

    // ----------------------------------------------------
    // 8. WORSHIP SOUNDS & PRAISE SONGS
    // ----------------------------------------------------
    case 'worship-shimmer': {
      // Ethereal ambient worship shimmer pad with octave-up crystal sparkle
      const duration = 6.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const rootNotes = [146.83, 220.0, 293.66, 369.99, 440.0]; // D Major 9 chord
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const env = Math.sin((t / duration) * Math.PI);
        let warmPad = 0;
        let shimmer = 0;
        rootNotes.forEach((f, idx) => {
          const lfo = Math.sin(2 * Math.PI * (0.2 + idx * 0.05) * t) * 1.2;
          warmPad += Math.sin(2 * Math.PI * (f + lfo) * t) * 0.08;
          // Octave-up shimmer sparkle
          shimmer += Math.sin(2 * Math.PI * (f * 2 + lfo) * t) * 0.04;
        });
        const wave = (warmPad + shimmer) * env * 1.4;
        left[i] = wave;
        right[i] = wave * 0.95 + Math.sin(2 * Math.PI * 880 * t) * 0.02 * env;
      }
      return buffer;
    }

    case 'worship-piano': {
      // Intimate felt piano worship ballad chord progression in D Major
      const duration = 4.8;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const chords = [
        [146.83, 220.0, 293.66, 369.99], // D
        [110.0, 164.81, 220.0, 277.18],  // A
        [123.47, 185.0, 246.94, 293.66], // Bm
        [98.0, 146.83, 196.0, 246.94],   // G
      ];

      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const chordIdx = Math.floor(t / 1.2) % 4;
        const ct = t % 1.2;
        let sum = 0;
        chords[chordIdx].forEach((freq, idx) => {
          // Warm harmonic felt piano tone
          const fundamental = Math.sin(2 * Math.PI * freq * t) * Math.exp(-ct * 1.8) * 0.18;
          const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-ct * 3.5) * 0.06;
          sum += fundamental + harmonic;
        });
        left[i] = sum * 0.85;
        right[i] = sum * 0.85;
      }
      return buffer;
    }

    case 'worship-swell': {
      // Swell ambient electric guitar with cathedral dot-eighth delay
      const duration = 4.5;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const f = 293.66; // D4
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Volume swell: slow attack, long release
        const attack = Math.min(1, Math.pow(t / 1.5, 2));
        const decay = Math.exp(-(t - 1.5) * 0.5);
        const env = t < 1.5 ? attack : decay;
        // Guitar harmonics
        const g1 = Math.sin(2 * Math.PI * f * t);
        const g2 = Math.sin(2 * Math.PI * f * 2 * t) * 0.4;
        const g3 = Math.sin(2 * Math.PI * f * 3 * t) * 0.2;
        const dry = (g1 + g2 + g3) * env * 0.4;
        // Echo delay
        const echoT = Math.max(0, t - 0.35);
        const echo = Math.sin(2 * Math.PI * f * echoT) * Math.exp(-echoT * 0.8) * 0.25;
        left[i] = dry + echo;
        right[i] = dry + echo * 0.85;
      }
      return buffer;
    }

    case 'worship-acoustic': {
      // Warm acoustic worship guitar strumming loop
      const duration = 4.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const strumTimes = [0, 0.5, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 3.25, 3.5];
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        let strum = 0;
        strumTimes.forEach((st) => {
          if (t >= st && t < st + 0.4) {
            const dt = t - st;
            const body = Math.sin(2 * Math.PI * 146.83 * dt) * Math.exp(-dt * 12) * 0.3;
            const pick = (Math.random() - 0.5) * Math.exp(-dt * 70) * 0.4;
            const stringRing = Math.sin(2 * Math.PI * 440 * dt) * Math.exp(-dt * 6) * 0.2;
            strum += body + pick + stringRing;
          }
        });
        left[i] = strum * 0.6;
        right[i] = strum * 0.58;
      }
      return buffer;
    }

    case 'worship-choir': {
      // Cathedral angelic vocal choir harmony chord
      const duration = 5.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const choirFrequencies = [220.0, 277.18, 329.63, 440.0, 554.37]; // A Major choir
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const env = Math.sin((t / duration) * Math.PI);
        let vocalChord = 0;
        choirFrequencies.forEach((freq, idx) => {
          const vibrato = Math.sin(2 * Math.PI * 5 * t + idx) * 2;
          const fund = Math.sin(2 * Math.PI * (freq + vibrato) * t) * 0.12;
          // "Ah" formant resonance around 800Hz & 1200Hz
          const f1 = Math.sin(2 * Math.PI * (freq * 2.2 + vibrato) * t) * 0.08;
          const f2 = Math.sin(2 * Math.PI * (freq * 3.4 + vibrato) * t) * 0.05;
          vocalChord += fund + f1 + f2;
        });
        const sample = vocalChord * env * 0.9;
        left[i] = sample;
        right[i] = sample * 0.96;
      }
      return buffer;
    }

    case 'worship-organ': {
      // Warm gospel Hammond B3 rotary organ chord
      const duration = 4.2;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const drawbars = [146.83, 293.66, 440.0, 587.33, 734.16];
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const leslieLfo = 1 + Math.sin(2 * Math.PI * 6.2 * t) * 0.2; // Rotary horn
        let organ = 0;
        drawbars.forEach((freq, idx) => {
          const sine = Math.sin(2 * Math.PI * freq * t);
          organ += sine * (0.15 - idx * 0.02);
        });
        const env = Math.min(1, t * 20) * Math.min(1, (duration - t) * 2);
        left[i] = organ * leslieLfo * env * 0.85;
        right[i] = organ * (2 - leslieLfo) * env * 0.85;
      }
      return buffer;
    }

    case 'worship-strings': {
      // Majestic cinematic orchestral praise strings swell
      const duration = 5.0;
      const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      const stringNotes = [146.83, 220.0, 293.66, 440.0, 587.33];
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const env = Math.sin((t / duration) * Math.PI);
        let strings = 0;
        stringNotes.forEach((freq, idx) => {
          const saw = (2 * ((t * freq) % 1) - 1) * 0.08;
          const vib = Math.sin(2 * Math.PI * 5.5 * t) * 1.5;
          const sine = Math.sin(2 * Math.PI * (freq + vib) * t) * 0.08;
          strings += saw + sine;
        });
        left[i] = strings * env * 1.1;
        right[i] = strings * env * 1.05;
      }
      return buffer;
    }

    default: {
      // Clean fallback beep
      const duration = 0.3;
      const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        data[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 10) * 0.5;
      }
      return buffer;
    }
  }
}
