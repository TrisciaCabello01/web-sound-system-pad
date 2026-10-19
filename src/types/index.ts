export type TriggerMode = 'one-shot' | 'gate' | 'toggle-loop' | 'retrigger';

export type StandardPadGroup =
  | 'drops'
  | 'fx'
  | 'loops'
  | 'drums'
  | 'bass'
  | 'melodic'
  | 'tiktok'
  | 'tiktok-songs'
  | 'trending-songs'
  | 'comedic'
  | 'worship';

export type PadGroup = StandardPadGroup | string;

export type GroupFXType =
  | 'filter'
  | 'delay'
  | 'reverb'
  | 'distortion'
  | 'sidechain'
  | 'shimmer'
  | 'pitch'
  | 'eq-boost';

export interface GroupEffect {
  id: string;
  type: GroupFXType;
  name: string;
  enabled: boolean;
  param1: number; // Primary parameter (e.g. Cutoff / Delay Time / Room Size / Drive / Rate)
  param2: number; // Secondary parameter (e.g. Resonance / Feedback / Damping / Tone / Depth)
  mix: number; // 0.0 to 1.0 wet/dry mix
}

export type GroupFXMap = {
  [K in string]?: GroupEffect[];
};

export interface GroupContainerInfo {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface SoundPadData {
  id: string;
  name: string;
  group: PadGroup;
  color: string; // Hex color for pad border & glow
  keyShortcut: string; // e.g. "1", "Q", "A", "Z"
  midiNote?: number; // MIDI note number (e.g. 36 = C1)
  triggerMode: TriggerMode;
  volume: number; // 0.0 to 1.5 (default 1.0)
  pan: number; // -1.0 (left) to 1.0 (right)
  pitch: number; // -12 to +12 semitones
  reverse: boolean;
  chokeGroup?: number; // e.g. 1 for hi-hats
  trimStart: number; // 0.0 to 1.0
  trimEnd: number; // 0.0 to 1.0
  soundId: string; // Identifier for built-in sound generator or custom blob
  customAudioUrl?: string; // If user uploaded audio
  customAudioName?: string;
  aiPrompt?: string; // AI text-to-speech or generative prompt instruction
  category: 'effects' | 'tiktok' | 'loops' | 'lofi' | 'custom' | 'worship' | 'comedic' | 'songs';
}

export interface PresetKit {
  id: string;
  name: string;
  category:
    | 'EFFECTS DROPS'
    | 'TIKTOK & VIRAL'
    | 'BACKGROUND LOOPS'
    | 'STUDIO LO-FI PULSE'
    | 'COMMUNITY'
    | 'TIKTOK SONGS & TRENDS'
    | 'COMEDIC MEME SOUNDS'
    | 'WORSHIP & PRAISE'
    | 'CUSTOM';
  description: string;
  bpm: number;
  author: string;
  pads: SoundPadData[];
  customGroups?: GroupContainerInfo[];
  likesCount?: number;
  downloadsCount?: number;
  tags?: string[];
  isCustom?: boolean;
}

export interface FXSettings {
  filterEnabled: boolean;
  filterType: BiquadFilterType;
  filterCutoff: number; // 20 to 20000 Hz
  filterResonance: number; // 0.1 to 20
  
  delayEnabled: boolean;
  delayTime: number; // 0.05 to 1.0 s
  delayFeedback: number; // 0 to 0.9
  delayMix: number; // 0 to 1

  reverbEnabled: boolean;
  reverbDecay: number; // 0.5 to 10
  reverbMix: number; // 0 to 1

  distortionEnabled: boolean;
  distortionDrive: number; // 0 to 50
  distortionMix: number; // 0 to 1

  bitcrushEnabled: boolean;
  bitDepth: number; // 2 to 16
  bitcrushMix: number; // 0 to 1

  stutterEnabled: boolean;
  stutterRate: '1/4' | '1/8' | '1/16' | '1/32';

  masterCompressor: boolean;
  masterLimiter: boolean;
}

export interface MidiMapping {
  padId: string;
  channel: number;
  note: number;
  controlType: 'note' | 'cc';
}

export interface RecordingTake {
  id: string;
  name: string;
  timestamp: number;
  duration: number; // seconds
  blobUrl: string;
  blobSize: number;
  sampleRate: number;
  format: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  isLoggedIn: boolean;
  savedKitsCount: number;
  lastSyncTimestamp?: number;
}
