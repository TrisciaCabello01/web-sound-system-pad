import { SoundPadData, FXSettings, PadGroup, GroupEffect, GroupFXMap } from '../types';
import { generateSoundBuffer } from './sampleGenerators';
import { getCustomSample } from '../services/storage';

export const DEFAULT_GROUP_FX: GroupFXMap = {
  drops: [
    { id: 'fx-drops-reverb', type: 'reverb', name: 'Epic Drops Reverb', enabled: true, param1: 4.0, param2: 0.7, mix: 0.35 },
    { id: 'fx-drops-dist', type: 'distortion', name: 'Sub Saturation', enabled: false, param1: 15, param2: 0.5, mix: 0.25 },
    { id: 'fx-drops-delay', type: 'delay', name: 'Riser Echo', enabled: false, param1: 0.35, param2: 0.5, mix: 0.3 },
  ],
  fx: [
    { id: 'fx-fx-delay', type: 'delay', name: 'Ping-Pong Echo', enabled: true, param1: 0.28, param2: 0.55, mix: 0.4 },
    { id: 'fx-fx-filter', type: 'filter', name: 'Resonant Filter Sweep', enabled: false, param1: 6000, param2: 3.5, mix: 0.6 },
    { id: 'fx-fx-reverb', type: 'reverb', name: 'Space Reverb', enabled: false, param1: 3.0, param2: 0.5, mix: 0.3 },
  ],
  loops: [
    { id: 'fx-loops-sidechain', type: 'sidechain', name: 'Sidechain Ducking Pump', enabled: true, param1: 2.0, param2: 0.7, mix: 0.65 },
    { id: 'fx-loops-filter', type: 'filter', name: 'Low-Pass Loop Filter', enabled: false, param1: 12000, param2: 1.2, mix: 0.4 },
    { id: 'fx-loops-dist', type: 'distortion', name: 'Tape Warmth', enabled: false, param1: 8, param2: 0.3, mix: 0.2 },
  ],
  drums: [
    { id: 'fx-drums-dist', type: 'distortion', name: 'Punchy Tape Drive', enabled: true, param1: 14, param2: 0.6, mix: 0.25 },
    { id: 'fx-drums-reverb', type: 'reverb', name: 'Studio Room Ambience', enabled: false, param1: 1.2, param2: 0.3, mix: 0.2 },
    { id: 'fx-drums-filter', type: 'filter', name: 'Snappy High-Pass', enabled: false, param1: 50, param2: 0.7, mix: 1.0 },
  ],
  bass: [
    { id: 'fx-bass-dist', type: 'distortion', name: '808 Harmonic Saturator', enabled: true, param1: 22, param2: 0.7, mix: 0.35 },
    { id: 'fx-bass-filter', type: 'filter', name: 'Sub Low-Cut (32Hz)', enabled: true, param1: 32, param2: 1.0, mix: 1.0 },
    { id: 'fx-bass-sidechain', type: 'sidechain', name: 'Kick-Bass Ducking', enabled: false, param1: 2.0, param2: 0.8, mix: 0.5 },
  ],
  melodic: [
    { id: 'fx-melodic-shimmer', type: 'shimmer', name: 'Ethereal Shimmer Space', enabled: true, param1: 0.8, param2: 0.5, mix: 0.4 },
    { id: 'fx-melodic-delay', type: 'delay', name: 'Dotted 8th Delay', enabled: true, param1: 0.375, param2: 0.45, mix: 0.3 },
    { id: 'fx-melodic-reverb', type: 'reverb', name: 'Cathedral Reverb', enabled: false, param1: 4.5, param2: 0.6, mix: 0.35 },
  ],
  worship: [
    { id: 'fx-worship-reverb', type: 'reverb', name: 'Cathedral Prayer Reverb', enabled: true, param1: 6.0, param2: 0.8, mix: 0.55 },
    { id: 'fx-worship-shimmer', type: 'shimmer', name: 'Holy Octave Shimmer', enabled: true, param1: 0.9, param2: 0.6, mix: 0.5 },
    { id: 'fx-worship-delay', type: 'delay', name: 'Swell Ambient Echo', enabled: true, param1: 0.5, param2: 0.6, mix: 0.4 },
  ],
  comedic: [
    { id: 'fx-comedic-filter', type: 'filter', name: 'Cartoon Wah Resonance', enabled: true, param1: 1800, param2: 6.5, mix: 0.6 },
    { id: 'fx-comedic-delay', type: 'delay', name: 'Slapback Spring Echo', enabled: true, param1: 0.12, param2: 0.5, mix: 0.4 },
  ],
  'tiktok-songs': [
    { id: 'fx-ttsongs-sidechain', type: 'sidechain', name: 'Viral Sidechain Pump', enabled: true, param1: 2.0, param2: 0.75, mix: 0.7 },
    { id: 'fx-ttsongs-dist', type: 'distortion', name: 'Club Exciter Drive', enabled: false, param1: 12, param2: 0.5, mix: 0.25 },
  ],
  'trending-songs': [
    { id: 'fx-trend-sidechain', type: 'sidechain', name: 'Festival Dance Pump', enabled: true, param1: 2.0, param2: 0.8, mix: 0.75 },
    { id: 'fx-trend-reverb', type: 'reverb', name: 'Stadium Drop Space', enabled: false, param1: 3.5, param2: 0.5, mix: 0.3 },
  ],
  tiktok: [
    { id: 'fx-tiktok-dist', type: 'distortion', name: 'Vine Boom Bass Boost', enabled: true, param1: 18, param2: 0.6, mix: 0.3 },
  ],
};

export interface ActiveVoice {
  padId: string;
  sourceNode: AudioBufferSourceNode;
  gainNode: GainNode;
  pannerNode?: StereoPannerNode;
  startTime: number;
  isLoop: boolean;
}

class AudioEngine {
  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;

  // Effects nodes
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackNode: GainNode | null = null;
  private delayDryNode: GainNode | null = null;
  private delayWetNode: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbDryNode: GainNode | null = null;
  private reverbWetNode: GainNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private distortionDryNode: GainNode | null = null;
  private distortionWetNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;

  // Audio buffer cache
  private bufferCache: Map<string, AudioBuffer> = new Map();
  // Active playing voices
  private activeVoices: Map<string, ActiveVoice[]> = new Map();

  // FX settings state
  private fxSettings: FXSettings = {
    filterEnabled: false,
    filterType: 'lowpass',
    filterCutoff: 20000,
    filterResonance: 1.0,

    delayEnabled: false,
    delayTime: 0.35,
    delayFeedback: 0.4,
    delayMix: 0.3,

    reverbEnabled: false,
    reverbDecay: 2.5,
    reverbMix: 0.25,

    distortionEnabled: false,
    distortionDrive: 12,
    distortionMix: 0.2,

    bitcrushEnabled: false,
    bitDepth: 8,
    bitcrushMix: 0.3,

    stutterEnabled: false,
    stutterRate: '1/16',

    masterCompressor: true,
    masterLimiter: true,
  };

  private masterVolume: number = 0.9;
  private onVoiceStateChange?: (activePadIds: string[]) => void;

  public init() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.75;

    this.recordingDestination = this.ctx.createMediaStreamDestination();

    // Master Limiter / Compressor
    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.limiterNode.threshold.setValueAtTime(-1.0, this.ctx.currentTime);
    this.limiterNode.knee.setValueAtTime(0.0, this.ctx.currentTime);
    this.limiterNode.ratio.setValueAtTime(20.0, this.ctx.currentTime);
    this.limiterNode.attack.setValueAtTime(0.002, this.ctx.currentTime);
    this.limiterNode.release.setValueAtTime(0.1, this.ctx.currentTime);

    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.setValueAtTime(-14.0, this.ctx.currentTime);
    this.compressorNode.knee.setValueAtTime(12.0, this.ctx.currentTime);
    this.compressorNode.ratio.setValueAtTime(4.0, this.ctx.currentTime);
    this.compressorNode.attack.setValueAtTime(0.008, this.ctx.currentTime);
    this.compressorNode.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Setup FX chain
    this.setupFXNodes();

    // Connect master out to speaker, analyser, and recorder
    this.masterGain.connect(this.analyser);
    this.masterGain.connect(this.recordingDestination);
    this.analyser.connect(this.ctx.destination);
  }

  private setupFXNodes() {
    if (!this.ctx || !this.masterGain || !this.limiterNode || !this.compressorNode) return;

    // 1. Filter
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = this.fxSettings.filterType;
    this.filterNode.frequency.setValueAtTime(this.fxSettings.filterCutoff, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(this.fxSettings.filterResonance, this.ctx.currentTime);

    // 2. Distortion
    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(this.fxSettings.distortionDrive) as unknown as Float32Array<ArrayBuffer>;
    this.distortionNode.oversample = '4x';
    this.distortionDryNode = this.ctx.createGain();
    this.distortionWetNode = this.ctx.createGain();
    this.distortionDryNode.gain.setValueAtTime(1 - this.fxSettings.distortionMix, this.ctx.currentTime);
    this.distortionWetNode.gain.setValueAtTime(this.fxSettings.distortionMix, this.ctx.currentTime);

    // 3. Delay
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(this.fxSettings.delayTime, this.ctx.currentTime);
    this.delayFeedbackNode = this.ctx.createGain();
    this.delayFeedbackNode.gain.setValueAtTime(this.fxSettings.delayFeedback, this.ctx.currentTime);
    this.delayDryNode = this.ctx.createGain();
    this.delayWetNode = this.ctx.createGain();
    this.delayDryNode.gain.setValueAtTime(1 - this.fxSettings.delayMix, this.ctx.currentTime);
    this.delayWetNode.gain.setValueAtTime(this.fxSettings.delayMix, this.ctx.currentTime);

    // Feedback loop
    this.delayNode.connect(this.delayFeedbackNode);
    this.delayFeedbackNode.connect(this.delayNode);

    // 4. Reverb
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.buildImpulseResponse(this.fxSettings.reverbDecay);
    this.reverbDryNode = this.ctx.createGain();
    this.reverbWetNode = this.ctx.createGain();
    this.reverbDryNode.gain.setValueAtTime(1 - this.fxSettings.reverbMix, this.ctx.currentTime);
    this.reverbWetNode.gain.setValueAtTime(this.fxSettings.reverbMix, this.ctx.currentTime);

    // Chain Routing:
    // Filter -> Distortion Branch -> Delay Branch -> Reverb Branch -> Compressor -> Limiter -> MasterGain
    const fxBus = this.ctx.createGain();

    // From FX Bus into Filter
    fxBus.connect(this.filterNode);

    // From Filter to Distortion
    this.filterNode.connect(this.distortionDryNode);
    this.filterNode.connect(this.distortionNode);
    this.distortionNode.connect(this.distortionWetNode);

    const postDist = this.ctx.createGain();
    this.distortionDryNode.connect(postDist);
    this.distortionWetNode.connect(postDist);

    // From postDist to Delay
    postDist.connect(this.delayDryNode);
    postDist.connect(this.delayNode);
    this.delayNode.connect(this.delayWetNode);

    const postDelay = this.ctx.createGain();
    this.delayDryNode.connect(postDelay);
    this.delayWetNode.connect(postDelay);

    // From postDelay to Reverb
    postDelay.connect(this.reverbDryNode);
    postDelay.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbWetNode);

    const postReverb = this.ctx.createGain();
    this.reverbDryNode.connect(postReverb);
    this.reverbWetNode.connect(postReverb);

    // Final dynamics
    postReverb.connect(this.compressorNode);
    this.compressorNode.connect(this.limiterNode);
    this.limiterNode.connect(this.masterGain);

    this.inputFXBus = fxBus;
  }

  private inputFXBus: GainNode | null = null;

  // Dedicated Group FX Busses (Drops, FX, Loops, Drums, Bass, Melodic, Worship, Comedic, etc.)
  private groupFXMap: GroupFXMap = { ...DEFAULT_GROUP_FX };
  private groupBuses: Map<string, {
    inNode: GainNode;
    outNode: GainNode;
    filterNode: BiquadFilterNode;
    delayNode: DelayNode;
    delayFeedback: GainNode;
    delayWet: GainNode;
    distNode: WaveShaperNode;
    distWet: GainNode;
    sidechainGain: GainNode;
    reverbNode: ConvolverNode;
    reverbWet: GainNode;
  }> = new Map();

  public getGroupBus(group: PadGroup): GainNode {
    if (!this.ctx || !this.inputFXBus) {
      return this.masterGain || (this.ctx?.createGain() as GainNode);
    }

    if (this.groupBuses.has(group)) {
      return this.groupBuses.get(group)!.inNode;
    }

    const t = this.ctx.currentTime;
    const inNode = this.ctx.createGain();
    const outNode = this.ctx.createGain();

    // 1. Group Filter
    const filterNode = this.ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(20000, t);

    // 2. Group Distortion / Saturation
    const distNode = this.ctx.createWaveShaper();
    distNode.curve = this.makeDistortionCurve(0) as unknown as Float32Array<ArrayBuffer>;
    const distWet = this.ctx.createGain();
    distWet.gain.setValueAtTime(0, t);

    // 3. Group Delay
    const delayNode = this.ctx.createDelay(1.5);
    delayNode.delayTime.setValueAtTime(0.3, t);
    const delayFeedback = this.ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.4, t);
    const delayWet = this.ctx.createGain();
    delayWet.gain.setValueAtTime(0, t);
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);

    // 4. Group Reverb
    const reverbNode = this.ctx.createConvolver();
    reverbNode.buffer = this.buildImpulseResponse(3.0);
    const reverbWet = this.ctx.createGain();
    reverbWet.gain.setValueAtTime(0, t);

    // 5. Group Sidechain Pumper
    const sidechainGain = this.ctx.createGain();
    sidechainGain.gain.setValueAtTime(1.0, t);

    // Chain Routing:
    // inNode -> filterNode -> distNode -> sidechainGain -> outNode
    //                      -> delayNode -> delayWet -> outNode
    //                      -> reverbNode -> reverbWet -> outNode
    inNode.connect(filterNode);
    filterNode.connect(distNode);
    distNode.connect(sidechainGain);
    sidechainGain.connect(outNode);

    // Parallel Delay
    distNode.connect(delayNode);
    delayNode.connect(delayWet);
    delayWet.connect(outNode);

    // Parallel Reverb
    distNode.connect(reverbNode);
    reverbNode.connect(reverbWet);
    reverbWet.connect(outNode);

    outNode.connect(this.inputFXBus);

    const bus = {
      inNode,
      outNode,
      filterNode,
      delayNode,
      delayFeedback,
      delayWet,
      distNode,
      distWet,
      sidechainGain,
      reverbNode,
      reverbWet,
    };

    this.groupBuses.set(group, bus);
    this.applyGroupFX(group);
    return inNode;
  }

  public getGroupFX(group: PadGroup): GroupEffect[] {
    return this.groupFXMap[group] || [];
  }

  public getAllGroupFX(): GroupFXMap {
    return { ...this.groupFXMap };
  }

  public addGroupEffect(group: PadGroup, effect: GroupEffect) {
    const list = this.groupFXMap[group] || [];
    this.groupFXMap[group] = [...list, effect];
    this.applyGroupFX(group);
  }

  public removeGroupEffect(group: PadGroup, effectId: string) {
    const list = this.groupFXMap[group] || [];
    this.groupFXMap[group] = list.filter((e) => e.id !== effectId);
    this.applyGroupFX(group);
  }

  public toggleGroupEffect(group: PadGroup, effectId: string, enabled?: boolean) {
    const list = this.groupFXMap[group] || [];
    this.groupFXMap[group] = list.map((e) => {
      if (e.id === effectId) {
        return { ...e, enabled: enabled !== undefined ? enabled : !e.enabled };
      }
      return e;
    });
    this.applyGroupFX(group);
  }

  public updateGroupEffect(group: PadGroup, effectId: string, updates: Partial<GroupEffect>) {
    const list = this.groupFXMap[group] || [];
    this.groupFXMap[group] = list.map((e) => {
      if (e.id === effectId) {
        return { ...e, ...updates };
      }
      return e;
    });
    this.applyGroupFX(group);
  }

  private applyGroupFX(group: PadGroup) {
    const bus = this.groupBuses.get(group);
    if (!bus || !this.ctx) return;

    const effects = this.groupFXMap[group] || [];
    const t = this.ctx.currentTime;

    // 1. Filter effect
    const filterEff = effects.find((e) => e.type === 'filter' && e.enabled);
    if (filterEff) {
      bus.filterNode.frequency.setTargetAtTime(Math.max(20, Math.min(20000, filterEff.param1)), t, 0.03);
      bus.filterNode.Q.setTargetAtTime(Math.max(0.1, filterEff.param2), t, 0.03);
    } else {
      bus.filterNode.frequency.setTargetAtTime(20000, t, 0.03);
      bus.filterNode.Q.setTargetAtTime(1.0, t, 0.03);
    }

    // 2. Distortion effect
    const distEff = effects.find((e) => e.type === 'distortion' && e.enabled);
    if (distEff) {
      bus.distNode.curve = this.makeDistortionCurve(distEff.param1) as unknown as Float32Array<ArrayBuffer>;
      bus.distWet.gain.setTargetAtTime(distEff.mix, t, 0.03);
    } else {
      bus.distNode.curve = this.makeDistortionCurve(0) as unknown as Float32Array<ArrayBuffer>;
      bus.distWet.gain.setTargetAtTime(0, t, 0.03);
    }

    // 3. Delay effect
    const delayEff = effects.find((e) => e.type === 'delay' && e.enabled);
    if (delayEff) {
      bus.delayNode.delayTime.setTargetAtTime(Math.max(0.02, delayEff.param1), t, 0.03);
      bus.delayFeedback.gain.setTargetAtTime(Math.min(0.88, delayEff.param2), t, 0.03);
      bus.delayWet.gain.setTargetAtTime(delayEff.mix, t, 0.03);
    } else {
      bus.delayWet.gain.setTargetAtTime(0, t, 0.03);
    }

    // 4. Reverb / Shimmer effect
    const revEff = effects.find((e) => (e.type === 'reverb' || e.type === 'shimmer') && e.enabled);
    if (revEff) {
      bus.reverbWet.gain.setTargetAtTime(revEff.mix, t, 0.03);
    } else {
      bus.reverbWet.gain.setTargetAtTime(0, t, 0.03);
    }

    // 5. Sidechain ducking effect
    const scEff = effects.find((e) => e.type === 'sidechain' && e.enabled);
    if (scEff) {
      // Modulate sidechain gain
      bus.sidechainGain.gain.setTargetAtTime(1.0 - scEff.param2 * 0.45 * scEff.mix, t, 0.03);
    } else {
      bus.sidechainGain.gain.setTargetAtTime(1.0, t, 0.03);
    }
  }

  public setVoiceStateListener(cb: (activePadIds: string[]) => void) {
    this.onVoiceStateChange = cb;
  }

  private notifyVoiceChange() {
    if (this.onVoiceStateChange) {
      const activeIds: string[] = [];
      this.activeVoices.forEach((voices, padId) => {
        if (voices.length > 0) activeIds.push(padId);
      });
      this.onVoiceStateChange(activeIds);
    }
  }

  public async ensureContextRunning(): Promise<void> {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public getMediaStream(): MediaStream | null {
    return this.recordingDestination ? this.recordingDestination.stream : null;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1.5, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  // Real-time FX update
  public updateFX(settings: Partial<FXSettings>) {
    this.fxSettings = { ...this.fxSettings, ...settings };
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (this.filterNode) {
      this.filterNode.type = this.fxSettings.filterType;
      this.filterNode.frequency.setTargetAtTime(
        this.fxSettings.filterEnabled ? this.fxSettings.filterCutoff : (this.fxSettings.filterType === 'lowpass' ? 20000 : 20),
        t,
        0.03
      );
      this.filterNode.Q.setTargetAtTime(this.fxSettings.filterResonance, t, 0.03);
    }

    if (this.delayNode && this.delayFeedbackNode && this.delayDryNode && this.delayWetNode) {
      const mix = this.fxSettings.delayEnabled ? this.fxSettings.delayMix : 0;
      this.delayNode.delayTime.setTargetAtTime(this.fxSettings.delayTime, t, 0.03);
      this.delayFeedbackNode.gain.setTargetAtTime(this.fxSettings.delayFeedback, t, 0.03);
      this.delayDryNode.gain.setTargetAtTime(1 - mix * 0.5, t, 0.03);
      this.delayWetNode.gain.setTargetAtTime(mix, t, 0.03);
    }

    if (this.reverbNode && this.reverbDryNode && this.reverbWetNode) {
      const mix = this.fxSettings.reverbEnabled ? this.fxSettings.reverbMix : 0;
      this.reverbDryNode.gain.setTargetAtTime(1 - mix * 0.5, t, 0.03);
      this.reverbWetNode.gain.setTargetAtTime(mix, t, 0.03);
    }

    if (this.distortionNode && this.distortionDryNode && this.distortionWetNode) {
      const mix = this.fxSettings.distortionEnabled ? this.fxSettings.distortionMix : 0;
      this.distortionNode.curve = this.makeDistortionCurve(this.fxSettings.distortionDrive) as unknown as Float32Array<ArrayBuffer>;
      this.distortionDryNode.gain.setTargetAtTime(1 - mix * 0.5, t, 0.03);
      this.distortionWetNode.gain.setTargetAtTime(mix, t, 0.03);
    }
  }

  public getFXSettings(): FXSettings {
    return { ...this.fxSettings };
  }

  // Pre-load or fetch buffer for pad
  public async getAudioBuffer(pad: SoundPadData): Promise<AudioBuffer | null> {
    await this.ensureContextRunning();
    if (!this.ctx) return null;

    const cacheKey = pad.customAudioUrl ? `custom-${pad.customAudioUrl}` : `synth-${pad.soundId}`;
    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey)!;
    }

    if (pad.customAudioUrl || pad.category === 'custom') {
      // 1. Try loading directly from IndexedDB asset cache
      try {
        const idbBlob = await getCustomSample(pad.id);
        if (idbBlob) {
          const arrayBuffer = await idbBlob.arrayBuffer();
          const decoded = await this.ctx.decodeAudioData(arrayBuffer);
          this.bufferCache.set(cacheKey, decoded);
          return decoded;
        }
      } catch (err) {
        console.warn('Could not read sample from IndexedDB for', pad.name, err);
      }

      // 2. Fallback to fetching blob URL
      if (pad.customAudioUrl) {
        try {
          const response = await fetch(pad.customAudioUrl);
          const arrayBuffer = await response.arrayBuffer();
          const decoded = await this.ctx.decodeAudioData(arrayBuffer);
          this.bufferCache.set(cacheKey, decoded);
          return decoded;
        } catch (err) {
          console.error('Error decoding custom audio', err);
          // Fallback to generated sound
        }
      }
    }

    const generated = generateSoundBuffer(this.ctx, pad.soundId);
    this.bufferCache.set(cacheKey, generated);
    return generated;
  }

  public registerCustomBuffer(url: string, buffer: AudioBuffer) {
    this.bufferCache.set(`custom-${url}`, buffer);
  }

  // Trigger Pad
  public async triggerPad(
    pad: SoundPadData,
    velocity: number = 1.0,
    allPads?: SoundPadData[]
  ): Promise<boolean> {
    await this.ensureContextRunning();
    if (!this.ctx || !this.inputFXBus) return false;

    // Handle Choke Group (e.g. Open Hat choked by Closed Hat)
    if (pad.chokeGroup && allPads) {
      allPads.forEach((p) => {
        if (p.id !== pad.id && p.chokeGroup === pad.chokeGroup) {
          this.stopPad(p.id, 0.02);
        }
      });
    }

    // Check if toggle-loop is already playing
    if (pad.triggerMode === 'toggle-loop') {
      const existing = this.activeVoices.get(pad.id);
      if (existing && existing.length > 0) {
        this.stopPad(pad.id, 0.05);
        return false; // stopped
      }
    }

    // Retrigger behavior: stop previous voice of this pad quickly
    if (pad.triggerMode === 'retrigger' || pad.triggerMode === 'one-shot') {
      this.stopPad(pad.id, 0.02);
    }

    // Trigger AI speech prompt if attached to this pad
    if (pad.aiPrompt && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(pad.aiPrompt);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = Math.min(1.0, (pad.volume ?? 1.0) * velocity);
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis prompt failed:', err);
      }
    }

    const origBuffer = await this.getAudioBuffer(pad);
    if (!origBuffer) return false;

    // Clone or reverse buffer if requested
    let bufferToPlay = origBuffer;
    if (pad.reverse) {
      bufferToPlay = this.createReversedBuffer(origBuffer);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = bufferToPlay;

    // Pitch Shift: 2^(semitones / 12)
    const pitchRate = Math.pow(2, (pad.pitch || 0) / 12);
    source.playbackRate.setValueAtTime(pitchRate, this.ctx.currentTime);

    // Looping
    if (pad.triggerMode === 'toggle-loop') {
      source.loop = true;
      source.loopStart = (pad.trimStart || 0) * bufferToPlay.duration;
      source.loopEnd = (pad.trimEnd || 1) * bufferToPlay.duration;
    }

    // Pad Gain Node (Volume & Velocity)
    const padGain = this.ctx.createGain();
    const effectiveVolume = (pad.volume ?? 1.0) * velocity;
    padGain.gain.setValueAtTime(effectiveVolume, this.ctx.currentTime);

    // Pad Panner Node
    let finalPadOut: AudioNode = padGain;
    let panner: StereoPannerNode | undefined;
    if (this.ctx.createStereoPanner && pad.pan !== 0) {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pad.pan, this.ctx.currentTime);
      padGain.connect(panner);
      finalPadOut = panner;
    }

    // Route: source -> padGain -> (panner) -> groupBus -> inputFXBus
    source.connect(padGain);
    const groupBus = this.getGroupBus(pad.group);
    finalPadOut.connect(groupBus);

    // Calculate Trims
    const duration = bufferToPlay.duration;
    const startOffset = Math.max(0, (pad.trimStart || 0) * duration);
    const endOffset = Math.min(duration, (pad.trimEnd || 1.0) * duration);
    const playDuration = Math.max(0.01, endOffset - startOffset);

    if (pad.triggerMode === 'toggle-loop') {
      source.start(0, startOffset);
    } else {
      source.start(0, startOffset, playDuration / pitchRate);
    }

    const voice: ActiveVoice = {
      padId: pad.id,
      sourceNode: source,
      gainNode: padGain,
      pannerNode: panner,
      startTime: this.ctx.currentTime,
      isLoop: pad.triggerMode === 'toggle-loop',
    };

    if (!this.activeVoices.has(pad.id)) {
      this.activeVoices.set(pad.id, []);
    }
    this.activeVoices.get(pad.id)!.push(voice);
    this.notifyVoiceChange();

    source.onended = () => {
      try {
        source.disconnect();
        padGain.disconnect();
        if (panner) panner.disconnect();
      } catch (e) {}
      this.removeVoice(pad.id, voice);
    };

    return true; // started playing
  }

  // Release/Stop a specific pad (crucial for Gate mode and Loop toggle)
  public stopPad(padId: string, fadeOutTime: number = 0.03) {
    if (!this.ctx) return;
    const voices = this.activeVoices.get(padId);
    if (!voices || voices.length === 0) return;

    const t = this.ctx.currentTime;
    voices.forEach((v) => {
      try {
        v.gainNode.gain.cancelScheduledValues(t);
        v.gainNode.gain.setValueAtTime(v.gainNode.gain.value, t);
        v.gainNode.gain.linearRampToValueAtTime(0.0001, t + fadeOutTime);
        v.sourceNode.stop(t + fadeOutTime);
        setTimeout(() => {
          try {
            v.sourceNode.disconnect();
            v.gainNode.disconnect();
            if (v.pannerNode) v.pannerNode.disconnect();
          } catch (e) {}
        }, (fadeOutTime + 0.05) * 1000);
      } catch {
        // already stopped
      }
    });

    this.activeVoices.delete(padId);
    this.notifyVoiceChange();
  }

  // STOP ALL: Master panic button to instantly silence all active sounds, loops, and kill all feedback tails
  public stopAll(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Force halt and immediately sever all active sample buffer voices
    this.activeVoices.forEach((voices) => {
      voices.forEach((v) => {
        try {
          v.gainNode.gain.cancelScheduledValues(t);
          v.gainNode.gain.setValueAtTime(0, t);
          v.sourceNode.stop(t);
        } catch (e) {}
        try {
          v.sourceNode.disconnect();
          v.gainNode.disconnect();
          if (v.pannerNode) v.pannerNode.disconnect();
        } catch (e) {}
      });
    });
    this.activeVoices.clear();
    this.notifyVoiceChange();

    // 2. Kill the tails on all Group Buses immediately to prevent infinite feedback
    this.groupBuses.forEach((bus) => {
      try {
        // Drop bus inNode & delay feedback to silence instantly
        bus.inNode.gain.cancelScheduledValues(t);
        bus.inNode.gain.setValueAtTime(0, t);
        bus.delayFeedback.gain.cancelScheduledValues(t);
        bus.delayFeedback.gain.setValueAtTime(0, t);
        bus.reverbWet.gain.cancelScheduledValues(t);
        bus.reverbWet.gain.setValueAtTime(0, t);

        // Restore back to original mix level after 50ms once tails are completely flushed
        bus.inNode.gain.setValueAtTime(1.0, t + 0.05);
      } catch (e) {}
    });

    // 3. Flush master FX feedback and reverb tails
    if (this.delayFeedbackNode) {
      try {
        this.delayFeedbackNode.gain.cancelScheduledValues(t);
        this.delayFeedbackNode.gain.setValueAtTime(0, t);
      } catch (e) {}
    }
    if (this.reverbWetNode) {
      try {
        this.reverbWetNode.gain.cancelScheduledValues(t);
        this.reverbWetNode.gain.setValueAtTime(0, t);
      } catch (e) {}
    }

    // Restore group FX parameter targets after flush
    setTimeout(() => {
      this.groupBuses.forEach((_, group) => {
        this.applyGroupFX(group as PadGroup);
      });
      if (this.ctx) {
        const curTime = this.ctx.currentTime;
        if (this.delayFeedbackNode) {
          const fb = this.fxSettings.delayEnabled ? this.fxSettings.delayFeedback : 0;
          this.delayFeedbackNode.gain.setTargetAtTime(fb, curTime, 0.03);
        }
        if (this.reverbWetNode) {
          const rMix = this.fxSettings.reverbEnabled ? this.fxSettings.reverbMix : 0;
          this.reverbWetNode.gain.setTargetAtTime(rMix, curTime, 0.03);
        }
      }
    }, 60);
  }

  private removeVoice(padId: string, voice: ActiveVoice) {
    const list = this.activeVoices.get(padId);
    if (!list) return;
    const filtered = list.filter((v) => v !== voice);
    if (filtered.length === 0) {
      this.activeVoices.delete(padId);
    } else {
      this.activeVoices.set(padId, filtered);
    }
    this.notifyVoiceChange();
  }

  public isPadPlaying(padId: string): boolean {
    const list = this.activeVoices.get(padId);
    return !!(list && list.length > 0);
  }

  // Automated Gain Staging:
  // Analyzes every pad's audio buffer and computes normalized volume levels
  // to avoid ear fatigue, clipping, and drastically disparate volume levels
  public async autoGainStage(pads: SoundPadData[]): Promise<SoundPadData[]> {
    await this.ensureContextRunning();
    if (!this.ctx) return pads;

    const targetPeak = 0.85; // safe studio headroom
    const updatedPads = await Promise.all(
      pads.map(async (pad) => {
        try {
          const buffer = await this.getAudioBuffer(pad);
          if (!buffer) return pad;

          // Find peak amplitude across all channels
          let peak = 0;
          for (let c = 0; c < buffer.numberOfChannels; c++) {
            const data = buffer.getChannelData(c);
            for (let i = 0; i < data.length; i += 8) {
              const abs = Math.abs(data[i]);
              if (abs > peak) peak = abs;
            }
          }

          if (peak > 0.05) {
            // Target gain calculation
            let stagedVol = targetPeak / peak;
            // Pad group specific compensation (e.g. loops & bass slightly lower)
            if (pad.group === 'loops') stagedVol *= 0.72;
            if (pad.group === 'bass') stagedVol *= 0.8;
            if (pad.group === 'fx') stagedVol *= 0.88;

            // Clamp between 0.2 and 1.3
            const clampedVol = Math.round(Math.min(1.3, Math.max(0.2, stagedVol)) * 100) / 100;
            return { ...pad, volume: clampedVol };
          }
        } catch (e) {
          console.warn('Gain stage error for pad', pad.name, e);
        }
        return pad;
      })
    );

    return updatedPads;
  }

  private createReversedBuffer(source: AudioBuffer): AudioBuffer {
    if (!this.ctx) return source;
    const rev = this.ctx.createBuffer(source.numberOfChannels, source.length, source.sampleRate);
    for (let c = 0; c < source.numberOfChannels; c++) {
      const srcData = source.getChannelData(c);
      const revData = rev.getChannelData(c);
      for (let i = 0; i < source.length; i++) {
        revData[i] = srcData[source.length - 1 - i];
      }
    }
    return rev;
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const k = Math.max(0, amount);
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }
    return curve;
  }

  private buildImpulseResponse(decayTime: number): AudioBuffer {
    const rate = this.ctx ? this.ctx.sampleRate : 44100;
    const length = Math.floor(rate * Math.max(0.2, decayTime));
    const impulse = (this.ctx || new AudioContext()).createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (rate * (decayTime * 0.35)));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    return impulse;
  }
}

export const audioEngine = new AudioEngine();
